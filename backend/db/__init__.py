"""
DataStore factory.

Reads DB_TYPE from environment and returns the correct adapter.
The rest of the app only ever imports `get_store()` — never touches adapters directly.
"""

import os
from functools import lru_cache

from .base import DataStore


@lru_cache(maxsize=1)
def get_store() -> DataStore:
    db_type = os.getenv("DB_TYPE", "sqlite").lower()

    if db_type == "sqlite":
        from config import Config
        from .sql_store import SQLDataStore
        # Resolve path using Config which already handles Vercel /tmp logic
        db_path = Config.SQLITE_PATH
        try:
            os.makedirs(os.path.dirname(db_path), exist_ok=True)
        except OSError:
            pass
        db_url = f"sqlite:///{db_path}"
        store = SQLDataStore(db_url)

    elif db_type in ("supabase", "postgres"):
        from .sql_store import SQLDataStore
        db_url = os.getenv("SUPABASE_DB_URL") or os.getenv("DATABASE_URL")
        if not db_url:
            raise ValueError("For Supabase/Postgres, SUPABASE_DB_URL or DATABASE_URL must be set in .env")
        store = SQLDataStore(db_url)

    elif db_type == "pocketbase":
        from .pocketbase_store import PocketBaseDataStore
        store = PocketBaseDataStore(
            base_url=os.getenv("POCKETBASE_URL", "http://127.0.0.1:8090"),
            admin_email=os.getenv("POCKETBASE_EMAIL", ""),
            admin_password=os.getenv("POCKETBASE_PASSWORD", ""),
        )

    else:
        raise ValueError(
            f"Unknown DB_TYPE '{db_type}'. "
            "Set DB_TYPE to 'sqlite' or 'pocketbase' in your .env file."
        )

    store.init_schema()
    return store
