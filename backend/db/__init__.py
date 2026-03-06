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
        from .sqlite_store import SQLiteDataStore
        # Resolve path relative to the project root (one level up from backend/)
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        raw_path = os.getenv("SQLITE_PATH", "./data/salessaathi.db")
        db_path = os.path.join(project_root, raw_path) if not os.path.isabs(raw_path) else raw_path
        try:
            os.makedirs(os.path.dirname(db_path), exist_ok=True)
        except OSError:
            pass
        store = SQLiteDataStore(db_path)

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
