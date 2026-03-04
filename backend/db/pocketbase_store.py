"""
PocketBase adapter.

PocketBase is a single binary (~30MB) that runs a local server with:
  - SQLite storage (managed by PocketBase)
  - REST API out of the box
  - Admin UI at http://localhost:8090/_/

This adapter talks to PocketBase over HTTP — no SQL needed.
Team setup: run PocketBase on any machine, point everyone at the same URL.

Download: https://pocketbase.io/docs/
"""

import uuid
from datetime import date, datetime
from typing import Optional

import requests

from .base import DataStore


COLLECTIONS = {
    "business":    "business",
    "config":      "ss_config",
    "api_keys":    "api_keys",
    "clients":     "clients",
    "meetings":    "meetings",
    "action_items": "action_items",
}

SCHEMA = {
    "business": [
        {"name": "name",       "type": "text",   "required": True},
        {"name": "owner_name", "type": "text"},
        {"name": "industry",   "type": "text"},
        {"name": "phone",      "type": "text"},
        {"name": "email",      "type": "email"},
        {"name": "city",       "type": "text"},
        {"name": "language",   "type": "text"},
    ],
    "ss_config": [
        {"name": "key",   "type": "text", "required": True},
        {"name": "value", "type": "text"},
    ],
    "api_keys": [
        {"name": "provider",        "type": "text", "required": True},
        {"name": "key_value",       "type": "text", "required": True},
        {"name": "label",           "type": "text"},
        {"name": "is_active",       "type": "bool"},
        {"name": "calls_today",     "type": "number"},
        {"name": "calls_this_month","type": "number"},
    ],
    "clients": [
        {"name": "name",         "type": "text", "required": True},
        {"name": "company",      "type": "text"},
        {"name": "phone",        "type": "text"},
        {"name": "email",        "type": "email"},
        {"name": "city",         "type": "text"},
        {"name": "industry",     "type": "text"},
        {"name": "deal_stage",   "type": "text"},
        {"name": "deal_temp",    "type": "text"},
        {"name": "health_score", "type": "number"},
        {"name": "notes",        "type": "text"},
    ],
    "meetings": [
        {"name": "client_id",      "type": "text", "required": True},
        {"name": "meeting_date",   "type": "text"},
        {"name": "follow_up_date", "type": "text"},
        {"name": "summary",        "type": "text"},
        {"name": "raw_notes",      "type": "text"},
        {"name": "problems",       "type": "text"},
        {"name": "products",       "type": "text"},
        {"name": "budget_signal",  "type": "text"},
        {"name": "objections",     "type": "text"},
        {"name": "deal_temp",      "type": "text"},
        {"name": "status",         "type": "text"},
        {"name": "summary_sent_at","type": "text"},
    ],
    "action_items": [
        {"name": "meeting_id",   "type": "text", "required": True},
        {"name": "description",  "type": "text", "required": True},
        {"name": "assigned_to",  "type": "text"},
        {"name": "due_date",     "type": "text"},
        {"name": "done",         "type": "bool"},
    ],
}


class PocketBaseDataStore(DataStore):
    """
    Talks to a running PocketBase instance.

    Args:
        base_url:  URL where PocketBase is running, e.g. http://127.0.0.1:8090
        admin_email:    PocketBase superadmin email
        admin_password: PocketBase superadmin password
    """

    def __init__(self, base_url: str, admin_email: str, admin_password: str):
        self._url   = base_url.rstrip("/")
        self._email = admin_email
        self._pwd   = admin_password
        self._token: str = ""

    # ── Auth ──────────────────────────────────────────────────────────

    def _authenticate(self) -> None:
        resp = requests.post(
            f"{self._url}/api/admins/auth-with-password",
            json={"identity": self._email, "password": self._pwd},
            timeout=10,
        )
        resp.raise_for_status()
        self._token = resp.json()["token"]

    def _headers(self) -> dict:
        if not self._token:
            self._authenticate()
        return {"Authorization": self._token}

    def _get(self, path: str, **params) -> dict:
        r = requests.get(f"{self._url}{path}", headers=self._headers(),
                         params=params, timeout=10)
        if r.status_code == 401:
            self._authenticate()
            r = requests.get(f"{self._url}{path}", headers=self._headers(),
                             params=params, timeout=10)
        r.raise_for_status()
        return r.json()

    def _post(self, path: str, data: dict) -> dict:
        r = requests.post(f"{self._url}{path}", headers=self._headers(),
                          json=data, timeout=10)
        if r.status_code == 401:
            self._authenticate()
            r = requests.post(f"{self._url}{path}", headers=self._headers(),
                              json=data, timeout=10)
        r.raise_for_status()
        return r.json()

    def _patch(self, path: str, data: dict) -> dict:
        r = requests.patch(f"{self._url}{path}", headers=self._headers(),
                           json=data, timeout=10)
        r.raise_for_status()
        return r.json()

    def _delete(self, path: str) -> None:
        r = requests.delete(f"{self._url}{path}", headers=self._headers(), timeout=10)
        r.raise_for_status()

    # ── Helpers ───────────────────────────────────────────────────────

    def _list(self, collection: str, filter_str: str = "", sort: str = "-created") -> list[dict]:
        params = {"perPage": 500, "sort": sort}
        if filter_str:
            params["filter"] = filter_str
        data = self._get(f"/api/collections/{collection}/records", **params)
        return data.get("items", [])

    def _get_one(self, collection: str, record_id: str) -> Optional[dict]:
        try:
            return self._get(f"/api/collections/{collection}/records/{record_id}")
        except requests.HTTPError as e:
            if e.response.status_code == 404:
                return None
            raise

    def _create(self, collection: str, data: dict) -> dict:
        return self._post(f"/api/collections/{collection}/records", data)

    def _update(self, collection: str, record_id: str, data: dict) -> dict:
        return self._patch(f"/api/collections/{collection}/records/{record_id}", data)

    # ── Setup / Health ────────────────────────────────────────────────

    def is_ready(self) -> bool:
        try:
            self._authenticate()
            return True
        except Exception:
            return False

    def init_schema(self) -> None:
        """Create all collections that don't already exist."""
        existing = {c["name"] for c in self._get("/api/collections")["items"]}
        for coll_name, fields in SCHEMA.items():
            if coll_name not in existing:
                self._post("/api/collections", {
                    "name": coll_name,
                    "type": "base",
                    "schema": fields,
                })

    # ── Business ──────────────────────────────────────────────────────

    def get_business(self) -> Optional[dict]:
        items = self._list(COLLECTIONS["business"])
        return items[0] if items else None

    def save_business(self, data: dict) -> dict:
        existing = self.get_business()
        if existing:
            return self._update(COLLECTIONS["business"], existing["id"], data)
        return self._create(COLLECTIONS["business"], data)

    # ── Config ────────────────────────────────────────────────────────

    def get_config(self, key: str) -> Optional[str]:
        items = self._list(COLLECTIONS["config"], filter_str=f'key="{key}"')
        return items[0]["value"] if items else None

    def set_config(self, key: str, value: str) -> None:
        items = self._list(COLLECTIONS["config"], filter_str=f'key="{key}"')
        if items:
            self._update(COLLECTIONS["config"], items[0]["id"], {"value": value})
        else:
            self._create(COLLECTIONS["config"], {"key": key, "value": value})

    # ── API Keys ──────────────────────────────────────────────────────

    def list_api_keys(self) -> list[dict]:
        rows = self._list(COLLECTIONS["api_keys"])
        for r in rows:
            kv = r.get("key_value", "")
            r["key_value"] = kv[:6] + "••••••••" if kv else ""
        return rows

    def add_api_key(self, provider: str, key: str, label: str = "") -> dict:
        row = self._create(COLLECTIONS["api_keys"], {
            "provider": provider, "key_value": key,
            "label": label, "is_active": True,
            "calls_today": 0, "calls_this_month": 0,
        })
        row["key_value"] = key[:6] + "••••••••"
        return row

    def delete_api_key(self, key_id: str) -> None:
        self._delete(f"/api/collections/{COLLECTIONS['api_keys']}/records/{key_id}")

    def get_active_key_for_provider(self, provider: str) -> Optional[str]:
        items = self._list(
            COLLECTIONS["api_keys"],
            filter_str=f'provider="{provider}" && is_active=true',
            sort="calls_today",
        )
        return items[0]["key_value"] if items else None

    # ── Clients ───────────────────────────────────────────────────────

    def list_clients(self) -> list[dict]:
        return self._list(COLLECTIONS["clients"], sort="-updated")

    def get_client(self, client_id: str) -> Optional[dict]:
        return self._get_one(COLLECTIONS["clients"], client_id)

    def create_client(self, data: dict) -> dict:
        data.setdefault("deal_stage", "New Lead")
        data.setdefault("deal_temp", "warm")
        data.setdefault("health_score", 50)
        return self._create(COLLECTIONS["clients"], data)

    def update_client(self, client_id: str, data: dict) -> dict:
        return self._update(COLLECTIONS["clients"], client_id, data)

    def find_client_by_name_or_phone(self, name: str = "", phone: str = "") -> Optional[dict]:
        parts = []
        if phone:
            parts.append(f'phone="{phone}"')
        if name:
            parts.append(f'name~"{name}"')
        if not parts:
            return None
        items = self._list(COLLECTIONS["clients"], filter_str=" || ".join(parts))
        return items[0] if items else None

    # ── Meetings ──────────────────────────────────────────────────────

    def list_meetings(self, client_id: str = None) -> list[dict]:
        f = f'client_id="{client_id}"' if client_id else ""
        return self._list(COLLECTIONS["meetings"], filter_str=f, sort="-meeting_date")

    def get_meeting(self, meeting_id: str) -> Optional[dict]:
        return self._get_one(COLLECTIONS["meetings"], meeting_id)

    def create_meeting(self, data: dict) -> dict:
        data.setdefault("status", "pending_review")
        data.setdefault("deal_temp", "warm")
        return self._create(COLLECTIONS["meetings"], data)

    def update_meeting(self, meeting_id: str, data: dict) -> dict:
        return self._update(COLLECTIONS["meetings"], meeting_id, data)

    # ── Action Items ──────────────────────────────────────────────────

    def list_action_items(self, meeting_id: str) -> list[dict]:
        return self._list(COLLECTIONS["action_items"],
                          filter_str=f'meeting_id="{meeting_id}"')

    def create_action_item(self, meeting_id: str, data: dict) -> dict:
        data["meeting_id"] = meeting_id
        data.setdefault("done", False)
        data.setdefault("assigned_to", "salesperson")
        return self._create(COLLECTIONS["action_items"], data)

    def update_action_item(self, item_id: str, data: dict) -> dict:
        return self._update(COLLECTIONS["action_items"], item_id, data)

    # ── Dashboard ─────────────────────────────────────────────────────

    def get_dashboard_summary(self) -> dict:
        today = date.today().isoformat()
        overdue  = len(self._list(COLLECTIONS["meetings"],
                                   filter_str=f'follow_up_date<"{today}" && status!="closed"'))
        due_today = len(self._list(COLLECTIONS["meetings"],
                                    filter_str=f'follow_up_date="{today}"'))
        hot      = len(self._list(COLLECTIONS["clients"], filter_str='deal_temp="hot"'))
        total    = len(self._list(COLLECTIONS["clients"]))
        return {
            "overdue_follow_ups": overdue,
            "due_today": due_today,
            "hot_deals": hot,
            "total_clients": total,
        }
