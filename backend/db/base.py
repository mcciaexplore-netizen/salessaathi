"""
Abstract data store interface.
All DB adapters (SQLite, PocketBase) implement this contract.
"""

from abc import ABC, abstractmethod
from typing import Optional


class DataStore(ABC):

    # ── Setup / Health ────────────────────────────────────────────────

    @abstractmethod
    def is_ready(self) -> bool:
        """Returns True if DB is reachable and schema is initialised."""
        ...

    @abstractmethod
    def init_schema(self) -> None:
        """Create tables / collections if they don't exist."""
        ...

    # ── Business Profile ──────────────────────────────────────────────

    @abstractmethod
    def get_business(self) -> Optional[dict]:
        ...

    @abstractmethod
    def save_business(self, data: dict) -> dict:
        ...

    # ── Config (key-value app settings) ───────────────────────────────

    @abstractmethod
    def get_config(self, key: str) -> Optional[str]:
        ...

    @abstractmethod
    def set_config(self, key: str, value: str) -> None:
        ...

    # ── API Keys ──────────────────────────────────────────────────────

    @abstractmethod
    def list_api_keys(self) -> list[dict]:
        ...

    @abstractmethod
    def add_api_key(self, provider: str, key: str, label: str = "") -> dict:
        ...

    @abstractmethod
    def delete_api_key(self, key_id: str) -> None:
        ...

    # ── Clients ───────────────────────────────────────────────────────

    @abstractmethod
    def list_clients(self) -> list[dict]:
        ...

    @abstractmethod
    def get_client(self, client_id: str) -> Optional[dict]:
        ...

    @abstractmethod
    def create_client(self, data: dict) -> dict:
        ...

    @abstractmethod
    def update_client(self, client_id: str, data: dict) -> dict:
        ...

    @abstractmethod
    def find_client_by_name_or_phone(self, name: str = "", phone: str = "") -> Optional[dict]:
        """Duplicate detection — fuzzy match on name or exact match on phone."""
        ...

    # ── Meetings ──────────────────────────────────────────────────────

    @abstractmethod
    def list_meetings(self, client_id: str = None) -> list[dict]:
        ...

    @abstractmethod
    def get_meeting(self, meeting_id: str) -> Optional[dict]:
        ...

    @abstractmethod
    def create_meeting(self, data: dict) -> dict:
        ...

    @abstractmethod
    def update_meeting(self, meeting_id: str, data: dict) -> dict:
        ...

    # ── Action Items ──────────────────────────────────────────────────

    @abstractmethod
    def list_action_items(self, meeting_id: str) -> list[dict]:
        ...

    @abstractmethod
    def create_action_item(self, meeting_id: str, data: dict) -> dict:
        ...

    @abstractmethod
    def update_action_item(self, item_id: str, data: dict) -> dict:
        ...

    # ── Auth ──────────────────────────────────────────────────────────

    @abstractmethod
    def get_user(self, username: str) -> Optional[dict]:
        ...

    @abstractmethod
    def create_user(self, data: dict) -> dict:
        ...

    # ── Dashboard helpers ─────────────────────────────────────────────

    @abstractmethod
    def get_dashboard_summary(self) -> dict:
        """Returns overdue count, today's follow-ups, hot deals, pipeline value."""
        ...
