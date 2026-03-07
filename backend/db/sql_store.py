"""
SQL adapter using SQLAlchemy.
Supports SQLite and PostgreSQL.
"""

import uuid
from datetime import date, datetime
from typing import Optional

from sqlalchemy import (
    Boolean, Column, Date, DateTime, ForeignKey,
    String, Text, Integer, Float, create_engine, func, or_,
)
from sqlalchemy.orm import DeclarativeBase, Session, relationship, sessionmaker

from .base import DataStore


# ── ORM Models ────────────────────────────────────────────────────────────────

class Base(DeclarativeBase):
    pass


def _uid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"
    id            = Column(String, primary_key=True, default=_uid)
    username      = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name     = Column(String)
    email         = Column(String)
    created_at    = Column(DateTime, default=datetime.utcnow)


class BusinessProfile(Base):
    __tablename__ = "business"
    id            = Column(String, primary_key=True, default=_uid)
    name          = Column(String, nullable=False)
    owner_name    = Column(String)
    industry      = Column(String)
    phone         = Column(String)
    email         = Column(String)
    city          = Column(String)
    language      = Column(String, default="en")
    created_at    = Column(DateTime, default=datetime.utcnow)


class Config(Base):
    __tablename__ = "config"
    key   = Column(String, primary_key=True)
    value = Column(Text)


class APIKey(Base):
    __tablename__ = "api_keys"
    id         = Column(String, primary_key=True, default=_uid)
    provider   = Column(String, nullable=False)   # gemini | groq | openai | mistral
    key_value  = Column(String, nullable=False)
    label      = Column(String, default="")
    is_active  = Column(Boolean, default=True)
    calls_today     = Column(Integer, default=0)
    calls_this_month = Column(Integer, default=0)
    last_used   = Column(DateTime)
    created_at  = Column(DateTime, default=datetime.utcnow)


class Client(Base):
    __tablename__ = "clients"
    id           = Column(String, primary_key=True, default=_uid)
    name         = Column(String, nullable=False)
    company      = Column(String)
    phone        = Column(String)
    email        = Column(String)
    city         = Column(String)
    industry     = Column(String)
    deal_stage   = Column(String, default="New Lead")   # New Lead | Contacted | Interested | Follow-Up Required | Converted | Not Interested
    deal_temp    = Column(String, default="warm")       # hot | warm | cold
    service_interest = Column(String)
    lead_source      = Column(String)
    health_score = Column(Integer, default=50)
    notes        = Column(Text)
    
    # Follow-up info
    next_follow_up_date = Column(Date)
    follow_up_notes     = Column(Text)
    follow_up_status    = Column(String, default="pending") # pending | completed | cancelled

    created_at   = Column(DateTime, default=datetime.utcnow)
    updated_at   = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    meetings     = relationship("Meeting", back_populates="client", cascade="all, delete-orphan")


class Meeting(Base):
    __tablename__ = "meetings"
    id              = Column(String, primary_key=True, default=_uid)
    client_id       = Column(String, ForeignKey("clients.id"), nullable=False)
    meeting_date    = Column(Date, default=date.today)
    follow_up_date  = Column(Date)
    summary         = Column(Text)
    raw_notes       = Column(Text)           # original OCR text
    problems        = Column(Text)
    products        = Column(Text)
    budget_signal   = Column(String)
    objections      = Column(Text)
    deal_temp       = Column(String, default="warm")
    status          = Column(String, default="pending_review")  # pending_review | confirmed | summary_sent
    summary_sent_at = Column(DateTime)
    created_at      = Column(DateTime, default=datetime.utcnow)
    client          = relationship("Client", back_populates="meetings")
    action_items    = relationship("ActionItem", back_populates="meeting", cascade="all, delete-orphan")


class ActionItem(Base):
    __tablename__ = "action_items"
    id          = Column(String, primary_key=True, default=_uid)
    meeting_id  = Column(String, ForeignKey("meetings.id"), nullable=False)
    description = Column(Text, nullable=False)
    assigned_to = Column(String, default="salesperson")  # salesperson | client
    due_date    = Column(Date)
    done        = Column(Boolean, default=False)
    created_at  = Column(DateTime, default=datetime.utcnow)
    meeting     = relationship("Meeting", back_populates="action_items")


# ── Adapter ───────────────────────────────────────────────────────────────────

def _row(obj) -> dict:
    """Convert SQLAlchemy model instance to plain dict."""
    d = {}
    for col in obj.__table__.columns:
        val = getattr(obj, col.name)
        if isinstance(val, (datetime, date)):
            val = val.isoformat()
        d[col.name] = val
    return d


class SQLDataStore(DataStore):

    def __init__(self, db_url: str):
        """
        db_url: SQLAlchemy connection string, e.g. sqlite:////home/.../data.db or postgresql://user:pass@host/db
        """
        # Ensure we use the proper postgresql:// dialect if users use postgres://
        if db_url.startswith("postgres://"):
            db_url = db_url.replace("postgres://", "postgresql://", 1)
            
        connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}
        self._engine = create_engine(
            db_url,
            connect_args=connect_args,
        )
        self._Session = sessionmaker(bind=self._engine)

    # ── Setup / Health ────────────────────────────────────────────────

    def is_ready(self) -> bool:
        try:
            with self._Session() as s:
                s.execute(func.now())
            return True
        except Exception:
            return False

    def init_schema(self) -> None:
        Base.metadata.create_all(self._engine)

    # ── Business ──────────────────────────────────────────────────────

    def get_business(self) -> Optional[dict]:
        with self._Session() as s:
            row = s.query(BusinessProfile).first()
            return _row(row) if row else None

    def save_business(self, data: dict) -> dict:
        with self._Session() as s:
            row = s.query(BusinessProfile).first()
            if row:
                for k, v in data.items():
                    if hasattr(row, k):
                        setattr(row, k, v)
            else:
                row = BusinessProfile(id=_uid(), **{k: v for k, v in data.items() if k != "id"})
                s.add(row)
            s.commit()
            s.refresh(row)
            return _row(row)

    # ── Config ────────────────────────────────────────────────────────

    def get_config(self, key: str) -> Optional[str]:
        with self._Session() as s:
            row = s.get(Config, key)
            return row.value if row else None

    def set_config(self, key: str, value: str) -> None:
        with self._Session() as s:
            row = s.get(Config, key)
            if row:
                row.value = value
            else:
                s.add(Config(key=key, value=value))
            s.commit()

    # ── API Keys ──────────────────────────────────────────────────────

    def list_api_keys(self) -> list[dict]:
        with self._Session() as s:
            rows = s.query(APIKey).all()
            # Never return the actual key value — mask it
            result = []
            for r in rows:
                d = _row(r)
                d["key_value"] = d["key_value"][:6] + "••••••••"
                result.append(d)
            return result

    def add_api_key(self, provider: str, key: str, label: str = "") -> dict:
        with self._Session() as s:
            row = APIKey(id=_uid(), provider=provider, key_value=key, label=label)
            s.add(row)
            s.commit()
            s.refresh(row)
            d = _row(row)
            d["key_value"] = d["key_value"][:6] + "••••••••"
            return d

    def delete_api_key(self, key_id: str) -> None:
        with self._Session() as s:
            row = s.get(APIKey, key_id)
            if row:
                s.delete(row)
                s.commit()

    def get_active_key_for_provider(self, provider: str) -> Optional[str]:
        """Internal use — returns actual key string for AI calls."""
        with self._Session() as s:
            row = (
                s.query(APIKey)
                .filter_by(provider=provider, is_active=True)
                .order_by(APIKey.calls_today)
                .first()
            )
            return row.key_value if row else None

    # ── Clients ───────────────────────────────────────────────────────

    def list_clients(self) -> list[dict]:
        with self._Session() as s:
            rows = s.query(Client).order_by(Client.updated_at.desc()).all()
            return [_row(r) for r in rows]

    def get_client(self, client_id: str) -> Optional[dict]:
        with self._Session() as s:
            row = s.get(Client, client_id)
            return _row(row) if row else None

    def create_client(self, data: dict) -> dict:
        with self._Session() as s:
            row = Client(id=_uid(), **{k: v for k, v in data.items() if k != "id"})
            s.add(row)
            s.commit()
            s.refresh(row)
            return _row(row)

    def update_client(self, client_id: str, data: dict) -> dict:
        with self._Session() as s:
            row = s.get(Client, client_id)
            if not row:
                raise ValueError(f"Client {client_id} not found")
            for k, v in data.items():
                if hasattr(row, k) and k not in ("id", "created_at"):
                    setattr(row, k, v)
            s.commit()
            s.refresh(row)
            return _row(row)

    def find_client_by_name_or_phone(self, name: str = "", phone: str = "") -> Optional[dict]:
        with self._Session() as s:
            conditions = []
            if phone:
                conditions.append(Client.phone == phone)
            if name:
                conditions.append(func.lower(Client.name).contains(name.lower()))
            if not conditions:
                return None
            row = s.query(Client).filter(or_(*conditions)).first()
            return _row(row) if row else None

    # ── Meetings ──────────────────────────────────────────────────────

    def list_meetings(self, client_id: str = None) -> list[dict]:
        with self._Session() as s:
            q = s.query(Meeting)
            if client_id:
                q = q.filter_by(client_id=client_id)
            rows = q.order_by(Meeting.meeting_date.desc()).all()
            return [_row(r) for r in rows]

    def get_meeting(self, meeting_id: str) -> Optional[dict]:
        with self._Session() as s:
            row = s.get(Meeting, meeting_id)
            return _row(row) if row else None

    def create_meeting(self, data: dict) -> dict:
        with self._Session() as s:
            row = Meeting(id=_uid(), **{k: v for k, v in data.items() if k != "id"})
            s.add(row)
            s.commit()
            s.refresh(row)
            return _row(row)

    def update_meeting(self, meeting_id: str, data: dict) -> dict:
        with self._Session() as s:
            row = s.get(Meeting, meeting_id)
            if not row:
                raise ValueError(f"Meeting {meeting_id} not found")
            for k, v in data.items():
                if hasattr(row, k) and k not in ("id", "created_at"):
                    setattr(row, k, v)
            s.commit()
            s.refresh(row)
            return _row(row)

    # ── Action Items ──────────────────────────────────────────────────

    def list_action_items(self, meeting_id: str) -> list[dict]:
        with self._Session() as s:
            rows = s.query(ActionItem).filter_by(meeting_id=meeting_id).all()
            return [_row(r) for r in rows]

    def create_action_item(self, meeting_id: str, data: dict) -> dict:
        with self._Session() as s:
            row = ActionItem(id=_uid(), meeting_id=meeting_id,
                             **{k: v for k, v in data.items() if k not in ("id", "meeting_id")})
            s.add(row)
            s.commit()
            s.refresh(row)
            return _row(row)

    def update_action_item(self, item_id: str, data: dict) -> dict:
        with self._Session() as s:
            row = s.get(ActionItem, item_id)
            if not row:
                raise ValueError(f"ActionItem {item_id} not found")
            for k, v in data.items():
                if hasattr(row, k) and k not in ("id", "meeting_id", "created_at"):
                    setattr(row, k, v)
            s.commit()
            s.refresh(row)
            return _row(row)

    # ── Auth ──────────────────────────────────────────────────────────
    
    def get_user(self, username: str) -> Optional[dict]:
        with self._Session() as s:
            row = s.query(User).filter_by(username=username).first()
            return _row(row) if row else None

    def create_user(self, data: dict) -> dict:
        with self._Session() as s:
            row = User(id=_uid(), **data)
            s.add(row)
            s.commit()
            s.refresh(row)
            return _row(row)

    # ── Dashboard ─────────────────────────────────────────────────────

    def get_dashboard_summary(self) -> dict:
        today = date.today()
        with self._Session() as s:
            # Overdue follow ups based on Meeting table (historical)
            overdue = (
                s.query(Meeting)
                .filter(Meeting.follow_up_date < today, Meeting.status != "closed")
                .count()
            )
            # Today's follow ups based on Client table (current primary tracking)
            due_today = (
                s.query(Client)
                .filter(Client.next_follow_up_date == today)
                .count()
            )
            # Total leads
            total_leads = s.query(Client).count()
            # New leads today
            new_leads = (
                s.query(Client)
                .filter(func.date(Client.created_at) == today)
                .count()
            )
            # Converted leads
            converted = (
                s.query(Client)
                .filter_by(deal_stage="Converted")
                .count()
            )
            
            # Hot deals
            hot_deals = (
                s.query(Client)
                .filter_by(deal_temp="hot")
                .count()
            )
            
            # List of today's follow-ups for the dashboard
            today_follow_ups = (
                s.query(Client)
                .filter(Client.next_follow_up_date == today)
                .all()
            )

            return {
                "total_leads": total_leads,
                "new_leads": new_leads,
                "follow_ups_today": due_today,
                "converted_leads": converted,
                "hot_deals": hot_deals,
                "overdue_follow_ups": overdue,
                "today_follow_ups_list": [_row(c) for c in today_follow_ups]
            }
