"""Provider registry and selection."""

import config
from providers.base import ImageProvider, ProviderError   # noqa: F401 - re-exported
from providers.gemini import GeminiProvider
from providers.local_fallback import LocalFallbackProvider
from providers.openai_images import OpenAIProvider

_REGISTRY = {
    GeminiProvider.name: GeminiProvider,
    OpenAIProvider.name: OpenAIProvider,
    LocalFallbackProvider.name: LocalFallbackProvider,
}


def get_provider(name=None):
    """Return the provider to use, or None when nothing is configured.

    'auto' walks PROVIDER_ORDER and takes the first one holding credentials.
    """
    name = (name or config.PROVIDER or 'auto').lower()
    if name == 'auto':
        for candidate in config.PROVIDER_ORDER:
            provider = _REGISTRY[candidate]()
            if provider.is_configured():
                return provider
        return None
    cls = _REGISTRY.get(name)
    if cls is None:
        raise ValueError('Unknown image provider: {}'.format(name))
    provider = cls()
    return provider if provider.is_configured() else None


def fallback_provider():
    return LocalFallbackProvider()


def describe_all():
    return [_REGISTRY[n]().describe() for n in config.PROVIDER_ORDER]
