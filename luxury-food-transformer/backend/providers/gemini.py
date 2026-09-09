"""Google Gemini image editing (renders 9:16 natively)."""

import base64

import requests

import config
from providers.base import ImageProvider, ProviderError


class GeminiProvider(ImageProvider):
    name = 'gemini'
    native_portrait = True

    def is_configured(self):
        return bool(config.GEMINI_API_KEY)

    def transform(self, image_bytes, prompt):
        if not self.is_configured():
            raise ProviderError('GEMINI_API_KEY is not set.')

        url = '{}/models/{}:generateContent'.format(config.GEMINI_API_BASE, config.GEMINI_MODEL)
        payload = {
            'contents': [{
                'role': 'user',
                'parts': [
                    {'text': prompt},
                    {'inline_data': {
                        'mime_type': 'image/jpeg',
                        'data': base64.b64encode(image_bytes).decode('ascii'),
                    }},
                ],
            }],
            'generationConfig': {
                'responseModalities': ['IMAGE'],
                'imageConfig': {'aspectRatio': config.ASPECT_RATIO},
            },
        }

        try:
            resp = requests.post(
                url,
                json=payload,
                headers={'x-goog-api-key': config.GEMINI_API_KEY},
                timeout=config.REQUEST_TIMEOUT,
            )
        except requests.RequestException as exc:
            raise ProviderError('Gemini request failed: {}'.format(exc)) from exc

        if resp.status_code >= 400:
            raise ProviderError('Gemini returned {}: {}'.format(resp.status_code, resp.text[:300]))

        return self._extract_image(resp.json())

    @staticmethod
    def _extract_image(body):
        for candidate in body.get('candidates') or []:
            for part in (candidate.get('content') or {}).get('parts') or []:
                blob = part.get('inlineData') or part.get('inline_data')
                if blob and blob.get('data'):
                    try:
                        return base64.b64decode(blob['data'])
                    except (ValueError, TypeError) as exc:
                        raise ProviderError('Gemini returned an unreadable image.') from exc
        # A text-only answer is a rule violation on our side, so treat it as a
        # failure worth retrying rather than something to show the user.
        raise ProviderError('Gemini returned no image data.')
