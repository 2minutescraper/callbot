"""Shared test setup: put the backend on the path and build sample photos."""

import io
import os
import sys

BACKEND = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'backend')
if BACKEND not in sys.path:
    sys.path.insert(0, BACKEND)

from PIL import Image  # noqa: E402


def sample_photo(size=(1600, 1200), color=(180, 96, 48)):
    """A JPEG standing in for an uploaded food photo."""
    img = Image.new('RGB', size, color)
    for x in range(0, size[0], 40):       # some detail so it is not a flat field
        for y in range(0, size[1], 40):
            img.putpixel((x, y), (240, 220, 180))
    buf = io.BytesIO()
    img.save(buf, format='JPEG', quality=90)
    return buf.getvalue()


def dimensions(data):
    return Image.open(io.BytesIO(data)).size
