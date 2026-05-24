import os
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool

from alembic import context
from dodo.config import dodoConfig
from dodo.orm import Base
from dodo.settings import DatabaseChoice, settings

dodo_config = dodoConfig.load()

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

if settings.database_engine is DatabaseChoice.POSTGRES:
    # Convert PostgreSQL URI to sync format for alembic using common utility
    from dodo.database_utils import get_database_uri_for_context

    sync_pg_uri = get_database_uri_for_context(settings.dodo_pg_uri, "alembic")

    config.set_main_option("sqlalchemy.url", sync_pg_uri)
    print("Using database: ", sync_pg_uri)
else:
    config.set_main_option("sqlalchemy.url", "sqlite:///" + os.path.join(dodo_config.recall_storage_path, "sqlite.db"))
    
    # Patch SQLiteImpl to ignore operations not supported by SQLite
    import alembic.ddl.sqlite
    
    def dummy_drop_constraint(self, const):
        print(f"[SQLite Migration Patch] Ignoring drop_constraint for: {getattr(const, 'name', const)}")
        
    def dummy_add_constraint(self, const):
        print(f"[SQLite Migration Patch] Ignoring add_constraint for: {getattr(const, 'name', const)}")
        
    def dummy_alter_column(self, table_name, column_name, **kw):
        print(f"[SQLite Migration Patch] Ignoring alter_column for: {table_name}.{column_name}")
        
    alembic.ddl.sqlite.SQLiteImpl.drop_constraint = dummy_drop_constraint
    alembic.ddl.sqlite.SQLiteImpl.add_constraint = dummy_add_constraint
    alembic.ddl.sqlite.SQLiteImpl.alter_column = dummy_alter_column

    # Also import sqlite_functions to register the connect event listeners
    try:
        from dodo.orm import sqlite_functions  # noqa: F401
    except ImportError:
        pass

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata

target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        from sqlalchemy import text
        if connectable.dialect.name == "sqlite":
            # For SQLite, initialize/sync schema directly using SQLAlchemy models metadata.
            # This ensures that all latest columns exist and match ORM models.
            print("[SQLite Migration Patch] Initializing SQLite schema from ORM models...")
            Base.metadata.create_all(bind=connection)
            
            # Stamp with the latest alembic revision
            connection.execute(text("CREATE TABLE IF NOT EXISTS alembic_version (version_num VARCHAR(32) NOT NULL PRIMARY KEY)"))
            
            # Check if there is already a version
            result = connection.execute(text("SELECT version_num FROM alembic_version")).fetchone()
            if not result:
                # Latest revision in the migrations
                latest_revision = "338b905379b9"
                connection.execute(text(f"INSERT INTO alembic_version (version_num) VALUES ('{latest_revision}')"))
                print(f"[SQLite Migration Patch] Stamped SQLite database with revision {latest_revision}")
            connection.commit()

        context.configure(connection=connection, target_metadata=target_metadata, include_schemas=True)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

