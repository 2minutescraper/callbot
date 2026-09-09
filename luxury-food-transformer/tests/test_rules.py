"""End-to-end checks of the spec's critical rules, against a stubbed provider.

The rule under test throughout: every uploaded photo comes back as an image.
"""

import io
import time
import unittest

from helpers import dimensions, sample_photo

import app as flask_app
import config
import imaging
import jobs
import providers
from providers.base import ImageProvider, ProviderError


class StubProvider(ImageProvider):
    """Renders a 9:16 placeholder, optionally failing the first N attempts."""

    name = 'stub'
    native_portrait = True

    def __init__(self, fail_times=0, always_fail=False):
        self.remaining_failures = fail_times
        self.always_fail = always_fail
        self.calls = 0

    def is_configured(self):
        return True

    def transform(self, image_bytes, prompt):
        self.calls += 1
        if self.always_fail:
            raise ProviderError('stub outage')
        if self.remaining_failures > 0:
            self.remaining_failures -= 1
            raise ProviderError('transient stub failure')
        return imaging.to_portrait_9x16(image_bytes)


class RuleTestCase(unittest.TestCase):
    def setUp(self):
        flask_app.app.config['TESTING'] = True
        self.client = flask_app.app.test_client()
        self._real_get_provider = providers.get_provider
        self._real_backoff = config.RETRY_BACKOFF_SECONDS
        config.RETRY_BACKOFF_SECONDS = 0     # keep the suite fast
        self.stub = StubProvider()
        providers.get_provider = lambda name=None: self.stub

    def tearDown(self):
        providers.get_provider = self._real_get_provider
        config.RETRY_BACKOFF_SECONDS = self._real_backoff

    # -- helpers ---------------------------------------------------------
    def submit(self, count):
        data = {'images': [(io.BytesIO(sample_photo()), 'plate{}.jpg'.format(i))
                           for i in range(count)]}
        return self.client.post('/api/transform', data=data,
                                content_type='multipart/form-data')

    def wait_for(self, job_id, timeout=20):
        deadline = time.time() + timeout
        while time.time() < deadline:
            body = self.client.get('/api/jobs/{}'.format(job_id)).get_json()
            if body['status'] in ('done', 'failed'):
                return body
            time.sleep(0.05)
        self.fail('job {} did not finish within {}s'.format(job_id, timeout))


class EveryPhotoIsTransformed(RuleTestCase):
    def test_one_to_four_photos_each_return_an_image(self):
        for count in (1, 2, 3, 4):
            with self.subTest(uploaded=count):
                job = self.wait_for(self.submit(count).get_json()['job_id'])
                self.assertEqual(job['total'], count)
                self.assertEqual(job['completed'], count, 'an uploaded photo was skipped')
                self.assertEqual(job['failed'], 0)
                for image in job['images']:
                    self.assertIsNotNone(image['result_url'])
                    self.assertEqual(image['status'], 'done')

    def test_each_result_is_exactly_9x16(self):
        job = self.wait_for(self.submit(3).get_json()['job_id'])
        for image in job['images']:
            rendered = self.client.get(image['result_url']).data
            self.assertEqual(dimensions(rendered), (config.OUTPUT_WIDTH, config.OUTPUT_HEIGHT))

    def test_every_finished_job_carries_the_engagement_tip(self):
        job = self.wait_for(self.submit(2).get_json()['job_id'])
        self.assertIn('tip', job)
        self.assertIn('cinematic AI', job['tip'])

    def test_results_download_with_a_filename(self):
        job = self.wait_for(self.submit(1).get_json()['job_id'])
        resp = self.client.get(job['images'][0]['result_url'] + '?download=1')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('michelin-9x16.jpg', resp.headers['Content-Disposition'])


class FailureNeverSkipsAPhoto(RuleTestCase):
    def test_transient_failures_are_retried(self):
        self.stub = StubProvider(fail_times=2)
        providers.get_provider = lambda name=None: self.stub
        job = self.wait_for(self.submit(1).get_json()['job_id'])
        self.assertEqual(job['completed'], 1)
        self.assertEqual(job['images'][0]['attempts'], 3)
        self.assertFalse(job['images'][0]['fallback'])

    def test_a_total_outage_still_returns_an_image_per_photo(self):
        self.stub = StubProvider(always_fail=True)
        providers.get_provider = lambda name=None: self.stub
        job = self.wait_for(self.submit(4).get_json()['job_id'])
        self.assertEqual(job['completed'], 4, 'the fallback must cover every photo')
        for image in job['images']:
            self.assertTrue(image['fallback'])
            self.assertIsNotNone(image['result_url'])
            rendered = self.client.get(image['result_url']).data
            self.assertEqual(dimensions(rendered), (config.OUTPUT_WIDTH, config.OUTPUT_HEIGHT))

    def test_one_bad_photo_does_not_cost_the_others(self):
        # A provider that only chokes on the second photo it is handed.
        outer = self

        class PickyProvider(StubProvider):
            def transform(self, image_bytes, prompt):
                self.calls += 1
                if self.calls == 2:
                    raise ProviderError('picky failure')
                return imaging.to_portrait_9x16(image_bytes)

        self.stub = PickyProvider()
        providers.get_provider = lambda name=None: outer.stub
        job = self.wait_for(self.submit(4).get_json()['job_id'])
        self.assertEqual(job['completed'], 4)


class UploadValidation(RuleTestCase):
    def test_more_than_four_photos_is_rejected(self):
        resp = self.submit(5)
        self.assertEqual(resp.status_code, 400)
        self.assertIn('at most 4', resp.get_json()['error'])

    def test_zero_photos_is_rejected(self):
        resp = self.client.post('/api/transform', data={},
                                content_type='multipart/form-data')
        self.assertEqual(resp.status_code, 400)

    def test_non_image_uploads_are_rejected(self):
        data = {'images': (io.BytesIO(b'not a photo'), 'notes.txt')}
        resp = self.client.post('/api/transform', data=data,
                                content_type='multipart/form-data')
        self.assertEqual(resp.status_code, 400)
        self.assertIn('not a readable image', resp.get_json()['error'])

    def test_unknown_job_is_a_404(self):
        self.assertEqual(self.client.get('/api/jobs/nope').status_code, 404)


class HealthAndBrief(RuleTestCase):
    def test_health_reports_the_output_contract(self):
        body = self.client.get('/api/health').get_json()
        self.assertEqual(body['max_images'], 4)
        self.assertEqual(body['output']['aspect_ratio'], '9:16')

    def test_brief_endpoint_returns_the_prompt_and_tip(self):
        body = self.client.get('/api/prompt').get_json()
        self.assertIn('Michelin', body['prompt'])
        self.assertIn('cinematic AI', body['tip'])


if __name__ == '__main__':
    unittest.main()
