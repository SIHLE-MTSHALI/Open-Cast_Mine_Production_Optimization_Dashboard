"""
health_router.py — Issue #108

Health check endpoints for Docker/K8s:
 - /health — basic liveness check
 - /health/ready — readiness (DB connection check)
 - /health/detailed — full system status
"""

from fastapi import APIRouter, Depends
from datetime import datetime
import os

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("")
@router.get("/")
async def health_check():
    """Basic liveness probe — always returns 200 if the app is running."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": os.getenv("APP_VERSION", "1.0.0"),
    }


@router.get("/ready")
async def readiness_check():
    """Readiness probe — checks DB and essential services."""
    checks = {}

    # DB check
    try:
        from ..database import SessionLocal
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        checks["database"] = "ok"
    except Exception as e:
        checks["database"] = f"error: {str(e)}"

    all_ok = all(v == "ok" for v in checks.values())
    return {
        "status": "ready" if all_ok else "not_ready",
        "checks": checks,
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/detailed")
async def detailed_health():
    """Detailed health with system metrics."""
    import platform
    import sys

    try:
        import psutil
        cpu_pct = psutil.cpu_percent(interval=0.1)
        mem = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        system_info = {
            "cpu_percent": cpu_pct,
            "memory_total_gb": round(mem.total / (1024**3), 2),
            "memory_used_pct": mem.percent,
            "disk_total_gb": round(disk.total / (1024**3), 2),
            "disk_used_pct": round(disk.percent, 1),
        }
    except ImportError:
        system_info = {"note": "psutil not installed"}

    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": os.getenv("APP_VERSION", "1.0.0"),
        "python_version": sys.version,
        "platform": platform.platform(),
        "environment": os.getenv("ENVIRONMENT", "development"),
        "system": system_info,
    }
