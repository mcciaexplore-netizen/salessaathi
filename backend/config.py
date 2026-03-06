"""
Centralised config loader.
All env vars are read here — never scattered across files.
"""

import os
from dotenv import load_dotenv

load_dotenv()   # loads .env from project root (or wherever Flask is started from)


class Config:
    # ── App ──────────────────────────────────────────────────────────
    SECRET_KEY  = os.getenv("SECRET_KEY", "change-me-in-production")
    DEBUG       = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    PORT        = int(os.getenv("PORT", 5000))

    # ── Database ──────────────────────────────────────────────────────
    DB_TYPE     = os.getenv("DB_TYPE", "sqlite")          # sqlite | pocketbase | supabase
    SQLITE_PATH = os.getenv("SQLITE_PATH", "/tmp/salessaathi.db" if os.getenv("VERCEL") else "./data/salessaathi.db")
    SUPABASE_DB = os.getenv("SUPABASE_DB_URL") or os.getenv("DATABASE_URL", "")
    PB_URL      = os.getenv("POCKETBASE_URL", "http://127.0.0.1:8090")
    PB_EMAIL    = os.getenv("POCKETBASE_EMAIL", "")
    PB_PASSWORD = os.getenv("POCKETBASE_PASSWORD", "")

    # ── Setup ─────────────────────────────────────────────────────────
    # Set to "true" after first-run wizard completes
    SETUP_DONE  = os.getenv("SETUP_DONE", "false").lower() == "true"

    # ── AI Providers (stored in DB, not here — these are fallbacks) ───
    GEMINI_KEY  = os.getenv("GEMINI_API_KEY", "")
    GROQ_KEY    = os.getenv("GROQ_API_KEY", "")
    OPENAI_KEY  = os.getenv("OPENAI_API_KEY", "")

    # ── Email ─────────────────────────────────────────────────────────
    SMTP_HOST   = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT   = int(os.getenv("SMTP_PORT", 587))
    SMTP_USER   = os.getenv("SMTP_USER", "")
    SMTP_PASS   = os.getenv("SMTP_PASS", "")
    FROM_EMAIL  = os.getenv("FROM_EMAIL", "")

    # ── Google Calendar ───────────────────────────────────────────────
    GOOGLE_CLIENT_ID     = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
