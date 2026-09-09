"""Runtime configuration, read from the environment (or a .env file)."""

import os

from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))


def _int(name, default):
    try:
        return int(os.getenv(name, default))
    except (TypeError, ValueError):
        return default


# --- Hard product rules -------------------------------------------------
MIN_IMAGES = 1
MAX_IMAGES = 4
OUTPUT_WIDTH = _int('OUTPUT_WIDTH', 1080)
OUTPUT_HEIGHT = _int('OUTPUT_HEIGHT', 1920)   # 1080x1920 == 9:16
ASPECT_RATIO = '9:16'

# --- Upload handling ----------------------------------------------------
MAX_UPLOAD_MB = _int('MAX_UPLOAD_MB', 20)
MAX_SOURCE_EDGE = _int('MAX_SOURCE_EDGE', 2048)   # downscale before upload
ALLOWED_MIME = ('image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif')

# --- Providers ----------------------------------------------------------
# 'auto' picks the first configured provider in PROVIDER_ORDER.
PROVIDER = os.getenv('IMAGE_PROVIDER', 'auto').strip().lower()
PROVIDER_ORDER = ('gemini', 'openai')

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '').strip()
# Any image-capable Gemini model works; this one renders 9:16 natively.
GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-2.5-flash-image').strip()
GEMINI_API_BASE = os.getenv('GEMINI_API_BASE', 'https://generativelanguage.googleapis.com/v1beta').strip()

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '').strip()
OPENAI_MODEL = os.getenv('OPENAI_IMAGE_MODEL', 'gpt-image-1').strip()
OPENAI_API_BASE = os.getenv('OPENAI_API_BASE', 'https://api.openai.com/v1').strip()

# --- Job execution ------------------------------------------------------
MAX_ATTEMPTS = _int('MAX_ATTEMPTS', 3)        # per image, per job
RETRY_BACKOFF_SECONDS = float(os.getenv('RETRY_BACKOFF_SECONDS', '2'))
REQUEST_TIMEOUT = _int('REQUEST_TIMEOUT', 180)
MAX_WORKERS = _int('MAX_WORKERS', 4)          # images transformed in parallel
JOB_TTL_SECONDS = _int('JOB_TTL_SECONDS', 3600)

# When True, an image the provider could not transform still gets a locally
# enhanced render so the "never skip an image" rule always holds.
ENABLE_LOCAL_FALLBACK = os.getenv('ENABLE_LOCAL_FALLBACK', 'true').lower() != 'false'

HOST = os.getenv('HOST', '127.0.0.1')
PORT = _int('PORT', 5001)
DEBUG = os.getenv('FLASK_DEBUG', 'false').lower() == 'true'
