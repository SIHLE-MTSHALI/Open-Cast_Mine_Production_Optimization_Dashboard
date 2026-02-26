"""Compatibility package for root-level imports.

This allows commands like ``uvicorn app.main:app`` to work from the repository
root by resolving ``app`` modules from ``backend/app``.
"""

from pathlib import Path

_backend_app_dir = Path(__file__).resolve().parent.parent / "backend" / "app"

if not _backend_app_dir.is_dir():
    raise ImportError(f"Expected backend app directory at {_backend_app_dir}")

# Expose backend/app as this package's module search path.
__path__ = [str(_backend_app_dir)]

