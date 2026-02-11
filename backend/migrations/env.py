"""
Alembic Environment Configuration for MineOpt Pro

This module configures Alembic to work with the MineOpt Pro database.
It supports both SQLite (development) and PostgreSQL (production) via
the DATABASE_URL environment variable.

All domain models are imported via the app.domain package so that
Base.metadata contains the full schema for autogenerate support.
"""

import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

# ---------------------------------------------------------------------------
# Ensure the backend package is importable regardless of working directory.
# This allows running `alembic` commands from the backend/ directory.
# ---------------------------------------------------------------------------
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the Base metadata and all domain models so their tables are registered.
from app.database import Base

# Force-import all domain model modules to register tables with Base.metadata.
# The app.domain package __init__.py already imports them all.
import app.domain  # noqa: F401

# Import additional domain models that may not be in the __init__
from app.domain import models_core  # noqa: F401
from app.domain import models_calendar  # noqa: F401
from app.domain import models_resource  # noqa: F401
from app.domain import models_flow  # noqa: F401
from app.domain import models_parcel  # noqa: F401
from app.domain import models_wash_table  # noqa: F401
from app.domain import models_staged_stockpile  # noqa: F401
from app.domain import models_scheduling  # noqa: F401
from app.domain import models_schedule_results  # noqa: F401
from app.domain import models_surface  # noqa: F401

# Extended domain models
try:
    from app.domain import models_borehole  # noqa: F401
    from app.domain import models_block_model  # noqa: F401
    from app.domain import models_fleet  # noqa: F401
    from app.domain import models_drill_blast  # noqa: F401
    from app.domain import models_material_shift  # noqa: F401
    from app.domain import models_geotech_safety  # noqa: F401
    from app.domain import models_surface_history  # noqa: F401
except ImportError:
    # Some extended models may not exist yet during development
    pass

# ---------------------------------------------------------------------------
# Alembic Config
# ---------------------------------------------------------------------------

# This is the Alembic Config object, providing access to .ini values.
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set the target metadata for autogenerate support.
target_metadata = Base.metadata

# Override sqlalchemy.url from environment variable if present.
# This allows production deployments to use DATABASE_URL without
# modifying alembic.ini.
database_url = os.environ.get("DATABASE_URL")
if database_url:
    config.set_main_option("sqlalchemy.url", database_url)


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    Generates SQL scripts without connecting to the database.
    Useful for reviewing migration SQL before applying.

    Usage:
        alembic upgrade head --sql > migration.sql
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        render_as_batch=True,  # Required for SQLite ALTER TABLE support
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    Connects to the database and applies migrations directly.
    This is the default mode when running `alembic upgrade head`.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            render_as_batch=True,  # Required for SQLite ALTER TABLE support
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
