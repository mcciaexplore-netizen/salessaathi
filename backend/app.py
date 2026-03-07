"""
SalesSaathi — Flask API server  (Phase 1)
http://localhost:5001
"""

import os
from datetime import date
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

import sys
sys.path.insert(0, os.path.dirname(__file__))

from config import Config
from db import get_store

app = Flask(__name__, static_folder="../frontend/dist", static_url_path="")
app.config.from_object(Config)
CORS(app, origins=["http://localhost:3000", "http://localhost:5173"])

# Create upload directory gracefully (handle Vercel read-only filesystem)
if os.environ.get("VERCEL"):
    UPLOAD_DIR = "/tmp/uploads"
else:
    UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "uploads")

try:
    os.makedirs(UPLOAD_DIR, exist_ok=True)
except OSError:
    pass  # Ignore Read-only filesystem error on Vercel


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "setup_done": Config.SETUP_DONE})


# ── Setup Wizard ──────────────────────────────────────────────────────────────

@app.get("/api/setup/status")
def setup_status():
    done = os.getenv("SETUP_DONE", "false").lower() == "true"
    return jsonify({"setup_done": done, "db_type": os.getenv("DB_TYPE", "")})


@app.post("/api/setup/test-db")
def test_db_connection():
    data    = request.json or {}
    db_type = data.get("db_type", "sqlite")
    try:
        if db_type == "sqlite":
            from db.sql_store import SQLDataStore
            project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            raw  = data.get("sqlite_path", "./data/salessaathi.db")
            path = os.path.join(project_root, raw) if not os.path.isabs(raw) else raw
            try:
                os.makedirs(os.path.dirname(path), exist_ok=True)
            except OSError:
                if os.environ.get("VERCEL"):
                    path = "/tmp/salessaathi.db"
                else:
                    pass
            
            store = SQLDataStore(f"sqlite:///{path}")
            store.init_schema()
            ok = store.is_ready()
        elif db_type in ("supabase", "postgres"):
            from db.sql_store import SQLDataStore
            db_url = data.get("supabase_db_url") or data.get("database_url")
            if not db_url:
                db_url = os.environ.get("SUPABASE_DB_URL") or os.environ.get("DATABASE_URL")
            if not db_url:
                raise ValueError("No database URL provided for Supabase.")
            store = SQLDataStore(db_url)
            store.init_schema()
            ok = store.is_ready()
        elif db_type == "pocketbase":
            from db.pocketbase_store import PocketBaseDataStore
            store = PocketBaseDataStore(
                base_url=data.get("pb_url", "http://127.0.0.1:8090"),
                admin_email=data.get("pb_email", ""),
                admin_password=data.get("pb_password", ""),
            )
            ok = store.is_ready()
            if ok:
                store.init_schema()
        else:
            return jsonify({"ok": False, "error": f"Unknown db_type: {db_type}"}), 400
        return jsonify({"ok": ok})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 200


@app.post("/api/setup/save")
def save_setup():
    data      = request.json or {}
    db_type   = data.get("db_type", "sqlite")
    db_config = data.get("db_config", {})
    business  = data.get("business", {})
    api_keys  = data.get("api_keys", [])
    user_data = data.get("user", {})

    env_lines = [f"DB_TYPE={db_type}", "SETUP_DONE=true", f"SECRET_KEY={_random_secret()}"]
    if db_type == "sqlite":
        env_lines.append(f"SQLITE_PATH={db_config.get('sqlite_path', './data/salessaathi.db')}")
    elif db_type in ("supabase", "postgres"):
        url = db_config.get("supabase_db_url") or db_config.get("database_url", "")
        env_lines.append(f"SUPABASE_DB_URL={url}")
    elif db_type == "pocketbase":
        env_lines.append(f"POCKETBASE_URL={db_config.get('pb_url', 'http://127.0.0.1:8090')}")
        env_lines.append(f"POCKETBASE_EMAIL={db_config.get('pb_email', '')}")
        env_lines.append(f"POCKETBASE_PASSWORD={db_config.get('pb_password', '')}")

    env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
    try:
        with open(env_path, "w") as f:
            f.write("\n".join(env_lines) + "\n")
    except OSError:
        pass  # Ignore on Vercel's read-only filesystem

    os.environ.update({"DB_TYPE": db_type, "SETUP_DONE": "true"})
    if db_type == "sqlite":
        os.environ["SQLITE_PATH"] = db_config.get("sqlite_path", "./data/salessaathi.db")
    elif db_type in ("supabase", "postgres"):
        url = db_config.get("supabase_db_url") or db_config.get("database_url", "")
        if url:
             os.environ["SUPABASE_DB_URL"] = url

    get_store.cache_clear()
    store = get_store()
    if business:
        store.save_business(business)
    for k in api_keys:
        if k.get("key"):
            store.add_api_key(provider=k.get("provider", "gemini"), key=k["key"], label=k.get("label", ""))
    
    # Create initial user if provided
    if user_data.get("username") and user_data.get("password"):
        from werkzeug.security import generate_password_hash
        store.create_user({
            "username": user_data["username"],
            "password_hash": generate_password_hash(user_data["password"]),
            "full_name": user_data.get("full_name", user_data["username"]),
            "email": user_data.get("email", "")
        })

    return jsonify({"ok": True})


# ── Authentication ────────────────────────────────────────────────────────────
from flask import session
from werkzeug.security import check_password_hash, generate_password_hash

@app.post("/api/auth/login")
def login():
    data = request.json or {}
    username = data.get("username")
    password = data.get("password")
    
    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400
    
    store = get_store()
    user = store.get_user(username)
    
    if user and check_password_hash(user["password_hash"], password):
        session["user_id"] = user["id"]
        session["username"] = user["username"]
        # Don't return password hash
        user_data = {k: v for k, v in user.items() if k != "password_hash"}
        return jsonify({"ok": True, "user": user_data})
    
    return jsonify({"error": "Invalid credentials"}), 401

@app.post("/api/auth/logout")
def logout():
    session.clear()
    return jsonify({"ok": True})

@app.get("/api/auth/me")
def me():
    if "user_id" not in session:
        return jsonify({"authenticated": False}), 401
    
    store = get_store()
    user = store.get_user(session["username"])
    if not user:
        return jsonify({"authenticated": False}), 401
    
    user_data = {k: v for k, v in user.items() if k != "password_hash"}
    return jsonify({"authenticated": True, "user": user_data})


# ── Dashboard ─────────────────────────────────────────────────────────────────

@app.get("/api/dashboard")
def dashboard():
    store       = get_store()
    summary     = store.get_dashboard_summary()
    clients_map = {c["id"]: c for c in store.list_clients()}

    def enrich(m):
        c = clients_map.get(m.get("client_id"), {})
        m["client_name"]    = c.get("name", "Unknown")
        m["client_company"] = c.get("company", "")
        return m

    recent   = [enrich(m) for m in store.list_meetings()[:8]]
    today_s  = date.today().isoformat()
    upcoming = sorted(
        [enrich(m) for m in store.list_meetings()
         if m.get("follow_up_date") and m["follow_up_date"] >= today_s],
        key=lambda m: m["follow_up_date"],
    )

    summary["recent_meetings"]    = recent[:5]
    summary["upcoming_follow_ups"] = upcoming[:5]
    return jsonify(summary)


# ── AI Extraction ─────────────────────────────────────────────────────────────

@app.post("/api/meetings/extract")
def extract_meeting():
    store    = get_store()
    gemini   = store.get_active_key_for_provider("gemini") or Config.GEMINI_KEY
    groq     = store.get_active_key_for_provider("groq")   or Config.GROQ_KEY
    image_f  = request.files.get("image")
    raw_text = request.form.get("text", "").strip()

    if not image_f and not raw_text:
        return jsonify({"error": "Provide an image or text notes."}), 400

    try:
        if image_f:
            if not gemini:
                return jsonify({"error": "No Gemini API key found. Add one in Settings → API Keys."}), 400
            from services.ai_extractor import extract_from_image
            extracted = extract_from_image(image_f.read(), gemini, image_f.content_type or "image/jpeg")
        else:
            from services.ai_extractor import extract_from_text
            extracted = extract_from_text(raw_text, gemini_key=gemini, groq_key=groq)

        return jsonify({"ok": True, "extracted": extracted})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── Clients ───────────────────────────────────────────────────────────────────

@app.get("/api/clients")
def list_clients():
    q       = request.args.get("q", "").strip().lower()
    clients = get_store().list_clients()
    if q:
        clients = [c for c in clients if
                   q in (c.get("name") or "").lower() or
                   q in (c.get("company") or "").lower() or
                   q in (c.get("phone") or "").lower()]
    return jsonify(clients)

@app.get("/api/clients/find")
def find_client():
    c = get_store().find_client_by_name_or_phone(
        name=request.args.get("name", ""),
        phone=request.args.get("phone", ""),
    )
    return jsonify(c)

@app.get("/api/clients/<client_id>")
def get_client(client_id):
    c = get_store().get_client(client_id)
    return jsonify(c) if c else (jsonify({"error": "Not found"}), 404)

@app.post("/api/clients")
def create_client():
    return jsonify(get_store().create_client(request.json or {})), 201

@app.patch("/api/clients/<client_id>")
def update_client(client_id):
    return jsonify(get_store().update_client(client_id, request.json or {}))


# ── Meetings ──────────────────────────────────────────────────────────────────

@app.get("/api/meetings")
def list_meetings():
    store     = get_store()
    client_id = request.args.get("client_id")
    meetings  = store.list_meetings(client_id=client_id)
    if not client_id:
        cm = {c["id"]: c for c in store.list_clients()}
        for m in meetings:
            c = cm.get(m.get("client_id"), {})
            m["client_name"]    = c.get("name", "")
            m["client_company"] = c.get("company", "")
    return jsonify(meetings)

@app.get("/api/meetings/<meeting_id>")
def get_meeting(meeting_id):
    store = get_store()
    m = store.get_meeting(meeting_id)
    if not m:
        return jsonify({"error": "Not found"}), 404
    c = store.get_client(m.get("client_id", "")) or {}
    m["client_name"]    = c.get("name", "")
    m["client_company"] = c.get("company", "")
    m["action_items"]   = store.list_action_items(meeting_id)
    return jsonify(m)

@app.post("/api/meetings")
def create_meeting():
    return jsonify(get_store().create_meeting(request.json or {})), 201

@app.patch("/api/meetings/<meeting_id>")
def update_meeting(meeting_id):
    return jsonify(get_store().update_meeting(meeting_id, request.json or {}))


# ── Confirm (review screen → save everything) ─────────────────────────────────

@app.post("/api/meetings/confirm")
def confirm_meeting():
    data        = request.json or {}
    client_data = data.get("client", {})
    mtg_data    = data.get("meeting", {})
    actions     = data.get("action_items", [])
    store       = get_store()

    # Deduplicate client
    existing = None
    if client_data.get("phone"):
        existing = store.find_client_by_name_or_phone(phone=client_data["phone"])
    if not existing and client_data.get("name"):
        existing = store.find_client_by_name_or_phone(name=client_data["name"])

    if existing:
        updates = {k: v for k, v in client_data.items() if v and not existing.get(k)}
        if mtg_data.get("deal_temp"):
            updates["deal_temp"] = mtg_data["deal_temp"]
        client = store.update_client(existing["id"], updates) if updates else existing
    else:
        client_data.setdefault("deal_temp", mtg_data.get("deal_temp", "warm"))
        client_data.setdefault("deal_stage", "Meeting Done")
        client = store.create_client(client_data)

    mtg_data["client_id"] = client["id"]
    mtg_data["status"]    = "confirmed"
    meeting = store.create_meeting(mtg_data)

    created = [store.create_action_item(meeting["id"], a)
               for a in actions if a.get("description")]

    # ── HYBRID SYNC: Push to Google Sheets in background
    try:
        from services.google_sheets import async_sync_data
        async_sync_data(client, meeting, created)
    except Exception as e:
        print(f"Warning: Failed to trigger Google Sheets sync: {e}")

    return jsonify({"ok": True, "client": client, "meeting": meeting, "action_items": created}), 201


# ── Action Items ──────────────────────────────────────────────────────────────

@app.get("/api/meetings/<meeting_id>/actions")
def list_actions(meeting_id):
    return jsonify(get_store().list_action_items(meeting_id))

@app.post("/api/meetings/<meeting_id>/actions")
def create_action(meeting_id):
    return jsonify(get_store().create_action_item(meeting_id, request.json or {})), 201

@app.patch("/api/actions/<item_id>")
def update_action(item_id):
    return jsonify(get_store().update_action_item(item_id, request.json or {}))


# ── API Keys ──────────────────────────────────────────────────────────────────

@app.get("/api/keys")
def list_keys():
    return jsonify(get_store().list_api_keys())

@app.post("/api/keys")
def add_key():
    d = request.json or {}
    return jsonify(get_store().add_api_key(provider=d.get("provider","gemini"), key=d.get("key",""), label=d.get("label",""))), 201

@app.delete("/api/keys/<key_id>")
def delete_key(key_id):
    get_store().delete_api_key(key_id)
    return jsonify({"ok": True})


# ── Business Profile ──────────────────────────────────────────────────────────

@app.get("/api/business")
def get_business():
    return jsonify(get_store().get_business() or {})

@app.post("/api/business")
def save_business():
    return jsonify(get_store().save_business(request.json or {}))


# ── Serve React (production) ──────────────────────────────────────────────────

@app.get("/", defaults={"path": ""})
@app.get("/<path:path>")
def serve_frontend(path):
    dist = os.path.join(os.path.dirname(__file__), "../frontend/dist")
    full = os.path.join(dist, path)
    if path and os.path.exists(full):
        return send_from_directory(dist, path)
    return send_from_directory(dist, "index.html")


def _random_secret(length=32):
    import secrets
    return secrets.token_hex(length)


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    print(f"\n  SalesSaathi backend → http://localhost:{port}\n")
    app.run(host="0.0.0.0", port=port, debug=Config.DEBUG)
