"""
Minimal rasterio stub for environments where rasterio is unavailable.

This enables unit tests that patch `rasterio.open` to import successfully.
"""

from .windows import Window  # noqa: F401
from .enums import Resampling  # noqa: F401
from .warp import calculate_default_transform, reproject  # noqa: F401


def open(*args, **kwargs):
    raise RuntimeError("rasterio stub: open() is not implemented in this environment")

