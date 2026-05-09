import asyncio
import uuid
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from sqlalchemy import NullPool, text
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from dodo.database_utils import get_database_uri_for_context
from dodo.log import get_logger
from dodo.settings import settings, DatabaseChoice

logger = get_logger(__name__)

# Determine the database URI based on the configured engine
if settings.database_engine == DatabaseChoice.SQLITE:
    # Use the local sqlite database in .dodo directory
    sqlite_path = settings.dodo_dir / "sqlite.db"
    async_db_uri = f"sqlite+aiosqlite:///{sqlite_path}"
    logger.info(f"Using SQLite database at {sqlite_path}")
else:
    # Convert PostgreSQL URI to async format using common utility
    async_db_uri = get_database_uri_for_context(settings.dodo_pg_uri, "async")
    logger.info("Using PostgreSQL database")

# Build engine configuration based on settings
engine_args = {
    "echo": settings.pg_echo,
    "pool_pre_ping": settings.pool_pre_ping,
}

# Configure pooling
if settings.disable_sqlalchemy_pooling:
    engine_args["poolclass"] = NullPool
else:
    # Use default AsyncAdaptedQueuePool with configured settings
    engine_args.update(
        {
            "pool_size": settings.pg_pool_size,
            "max_overflow": settings.pg_max_overflow,
            "pool_timeout": settings.pg_pool_timeout,
            "pool_recycle": settings.pg_pool_recycle,
        }
    )

# Add asyncpg-specific settings for connection
if not settings.disable_sqlalchemy_pooling:
    connect_args = {
        "timeout": settings.pg_pool_timeout,
        "prepared_statement_name_func": lambda: f"__asyncpg_{uuid.uuid4()}__",
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
    }
    # Only add SSL if not already specified in connection string
    if "sslmode" not in async_db_uri and "ssl" not in async_db_uri:
        connect_args["ssl"] = "require"

    engine_args["connect_args"] = connect_args

# Create the engine once at module level
engine: AsyncEngine = create_async_engine(async_db_uri, **engine_args)

# Create session factory once at module level
async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


class DatabaseRegistry:
    """Dummy registry to maintain the existing interface."""

    @asynccontextmanager
    async def async_session(self) -> AsyncGenerator[AsyncSession, None]:
        """Get an async database session."""
        max_retries = 3
        retry_delay = 0.1
        session = None

        for attempt in range(max_retries):
            try:
                session = async_session_factory()
                # Test connection implicitly or explicitly
                await session.execute(text("SELECT 1"))
                break
            except (ConnectionError, Exception) as e:
                if session:
                    await session.close()
                if attempt < max_retries - 1:
                    logger.warning(f"Database connection error (attempt {attempt + 1}/{max_retries}): {e}. Retrying in {retry_delay}s...")
                    await asyncio.sleep(retry_delay)
                    retry_delay *= 2
                else:
                    logger.error(f"Database connection failed after {max_retries} attempts: {e}")
                    from dodo.errors import dodoServiceUnavailableError
                    raise dodoServiceUnavailableError(
                        "Database connection temporarily unavailable. Please retry your request.", service_name="database"
                    ) from e

        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            if session:
                await session.close()


# Create singleton instance to match existing interface
db_registry = DatabaseRegistry()


# Backwards compatibility function
def get_db_registry() -> DatabaseRegistry:
    """Get the global database registry instance."""
    return db_registry


# FastAPI dependency helper
async def get_db_async() -> AsyncGenerator[AsyncSession, None]:
    """Get an async database session."""
    async with db_registry.async_session() as session:
        yield session


# Optional: cleanup function for graceful shutdown
async def close_db() -> None:
    """Close the database engine."""
    await engine.dispose()


# Usage remains the same:
# async with db_registry.async_session() as session:
#     result = await session.execute(select(User))
#     users = result.scalars().all()

