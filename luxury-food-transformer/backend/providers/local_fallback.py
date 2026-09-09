"""Last-resort provider so every upload still returns an image.

The spec's hardest rule is that no uploaded photo is ever skipped. When the AI
provider fails every attempt, this renders a locally graded 9:16 version of the
original instead of returning nothing. It is not a Michelin re-plate and never
claims to be: results carry fallback=True through the API and the UI labels
them.
"""

import imaging
from providers.base import ImageProvider


class LocalFallbackProvider(ImageProvider):
    name = 'local'
    native_portrait = False
    is_fallback = True

    def is_configured(self):
        return True

    def transform(self, image_bytes, prompt):   # noqa: ARG002 - prompt unused
        return imaging.editorial_grade(image_bytes)
