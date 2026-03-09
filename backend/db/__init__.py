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
    db_type = os.getenv("DB_TYPE", "supabase").lower()

    if db_type == "supabase" or db_type == "postgres":
        from .supabase_store import SupabaseDataStore
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_ANON_KEY")
        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env")
        store = SupabaseDataStore(url, key)

    elif db_type == "pocketbase":
        from .pocketbase_store import PocketBaseDataStore
        store = PocketBaseDataStore(
            base_url=os.getenv("POCKETBASE_URL", "http://127.0.0.1:8090"),
            admin_email=os.getenv("POCKETBASE_EMAIL", ""),
            admin_password=os.getenv("POCKETBASE_PASSWORD", ""),
        )

    else:
        # Default to supabase if unknown
        from .supabase_store import SupabaseDataStore
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_ANON_KEY")
        store = SupabaseDataStore(url, key)

    store.init_schema()
    return store
