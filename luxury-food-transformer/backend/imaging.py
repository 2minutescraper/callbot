"""Image normalisation and the 9:16 output guarantee.

The model is asked for 9:16, but the output rule is not left to the model:
every render leaves this module at exactly OUTPUT_WIDTH x OUTPUT_HEIGHT.
"""

import io

from PIL import Image, ImageEnhance, ImageOps

import config


class ImageError(ValueError):
    """Raised when an upload is not a usable image."""


def decode(data):
    """Decode bytes into an upright RGB image."""
    try:
        img = Image.open(io.BytesIO(data))
        img.load()
    except Exception as exc:  # noqa: BLE001 - Pillow raises many decode errors
        raise ImageError('That file could not be read as an image.') from exc
    img = ImageOps.exif_transpose(img)
    if img.mode != 'RGB':
        img = img.convert('RGB')
    return img


def prepare_source(data, max_edge=None):
    """Normalise an upload for sending to the provider.

    Returns (jpeg_bytes, (width, height)). Large phone photos are downscaled so
    uploads stay fast; nothing is cropped at this stage.
    """
    max_edge = max_edge or config.MAX_SOURCE_EDGE
    img = decode(data)
    if max(img.size) > max_edge:
        img.thumbnail((max_edge, max_edge), Image.LANCZOS)
    return encode_jpeg(img, quality=92), img.size


def encode_jpeg(img, quality=92):
    buf = io.BytesIO()
    img.save(buf, format='JPEG', quality=quality, optimize=True, subsampling=1)
    return buf.getvalue()


def to_portrait_9x16(data, width=None, height=None):
    """Force any render into a full-bleed 9:16 portrait frame.

    The frame is filled by a centre cover-crop - never letterboxed - so the
    result fills a phone screen edge to edge. Providers that render 9:16
    natively lose nothing here; a 2:3 render loses ~8% from each side.
    """
    width = width or config.OUTPUT_WIDTH
    height = height or config.OUTPUT_HEIGHT
    img = decode(data)
    target = width / height
    w, h = img.size
    current = w / h

    if abs(current - target) > 0.001:
        if current > target:                      # too wide -> trim the sides
            new_w = max(1, round(h * target))
            left = (w - new_w) // 2
            img = img.crop((left, 0, left + new_w, h))
        else:                                     # too tall -> trim top/bottom
            new_h = max(1, round(w / target))
            top = (h - new_h) // 2
            img = img.crop((0, top, w, top + new_h))

    if img.size != (width, height):
        img = img.resize((width, height), Image.LANCZOS)
    return encode_jpeg(img, quality=94)


def editorial_grade(data):
    """A deterministic, local 'editorial grade' used by the fallback provider.

    This is colour grading, not re-plating: it exists only so that a provider
    outage still returns an image for every upload, and results produced this
    way are always flagged as a fallback.
    """
    img = decode(data)
    img = ImageEnhance.Color(img).enhance(1.14)
    img = ImageEnhance.Contrast(img).enhance(1.10)
    img = ImageEnhance.Brightness(img).enhance(1.03)
    img = ImageEnhance.Sharpness(img).enhance(1.25)
    return encode_jpeg(img, quality=94)
