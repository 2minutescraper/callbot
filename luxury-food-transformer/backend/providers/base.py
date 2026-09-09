"""Provider interface for image-to-image transformation."""

import abc


class ProviderError(RuntimeError):
    """A transformation attempt failed; the caller may retry."""


class ImageProvider(abc.ABC):
    #: short id used in the API and the UI
    name = 'provider'
    #: True when this provider renders 9:16 itself rather than being cropped to it
    native_portrait = False
    #: True for renders that are not an AI re-plate (see LocalFallbackProvider)
    is_fallback = False

    @abc.abstractmethod
    def is_configured(self):
        """Whether credentials for this provider are present."""

    @abc.abstractmethod
    def transform(self, image_bytes, prompt):
        """Return the transformed image as bytes, or raise ProviderError."""

    def describe(self):
        return {
            'name': self.name,
            'configured': self.is_configured(),
            'native_portrait': self.native_portrait,
            'fallback': self.is_fallback,
        }
