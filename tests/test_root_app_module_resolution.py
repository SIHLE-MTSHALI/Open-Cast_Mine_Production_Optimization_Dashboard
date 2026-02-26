"""Regression test for root-level backend module resolution."""

from importlib.util import find_spec
from pathlib import Path

import app


def test_root_app_package_maps_to_backend_app_dir() -> None:
    expected = str((Path(__file__).resolve().parents[1] / "backend" / "app").resolve())
    assert expected in list(app.__path__)


def test_root_can_resolve_app_main_module() -> None:
    spec = find_spec("app.main")
    assert spec is not None
    assert spec.origin is not None
    assert spec.origin.endswith("backend/app/main.py") or spec.origin.endswith("backend\\app\\main.py")

