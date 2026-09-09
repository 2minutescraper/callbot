"""OpenAI image editing. Renders 2:3, which imaging.py crops to 9:16."""

import base64

import requests

import config
from providers.base import ImageProvider, ProviderError


class OpenAIProvider(ImageProvider):
    name = 'openai'
    native_portrait = False

    def is_configured(self):
        return bool(config.OPENAI_API_KEY)

    def transform(self, image_bytes, prompt):
        if not self.is_configured():
            raise ProviderError('OPENAI_API_KEY is not set.')

        try:
            resp = requests.post(
                '{}/images/edits'.format(config.OPENAI_API_BASE),
                headers={'Authorization': 'Bearer {}'.format(config.OPENAI_API_KEY)},
                data={
                    'model': config.OPENAI_MODEL,
                    'prompt': prompt,
                    'size': '1024x1536',   # tallest portrait the API offers
                    'n': '1',
                },
                files={'image': ('source.jpg', image_bytes, 'image/jpeg')},
                timeout=config.REQUEST_TIMEOUT,
            )
        except requests.RequestException as exc:
            raise ProviderError('OpenAI request failed: {}'.format(exc)) from exc

        if resp.status_code >= 400:
            raise ProviderError('OpenAI returned {}: {}'.format(resp.status_code, resp.text[:300]))

        items = resp.json().get('data') or []
        for item in items:
            if item.get('b64_json'):
                try:
                    return base64.b64decode(item['b64_json'])
                except (ValueError, TypeError) as exc:
                    raise ProviderError('OpenAI returned an unreadable image.') from exc
            if item.get('url'):
                return self._download(item['url'])
        raise ProviderError('OpenAI returned no image data.')

    @staticmethod
    def _download(url):
        try:
            resp = requests.get(url, timeout=config.REQUEST_TIMEOUT)
            resp.raise_for_status()
        except requests.RequestException as exc:
            raise ProviderError('Could not download the rendered image: {}'.format(exc)) from exc
        return resp.content
