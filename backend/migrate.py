import sqlite3
import os

def migrate():
    db_path = os.path.join("backend", "data", "salessaathi.db")
    if not os.path.exists(os.path.join("backend", "data")):
        os.makedirs(os.path.join("backend", "data"))
        
    print(f"Checking database at {db_path}...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Ensure users table exists
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT,
        email TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Ensure business table exists
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS business (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        owner_name TEXT,
        industry TEXT,
        phone TEXT,
        email TEXT,
        city TEXT,
        language TEXT DEFAULT 'en',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Get existing columns in clients
    cursor.execute("PRAGMA table_info(clients)")
    columns = [row[1] for row in cursor.fetchall()]
    
    # Add missing columns to clients
    missing_columns = {
        "service_interest": "TEXT",
        "lead_source": "TEXT",
        "next_follow_up_date": "DATE",
        "follow_up_notes": "TEXT",
        "follow_up_status": "TEXT DEFAULT 'pending'",
        "updated_at": "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
    
    for col, col_type in missing_columns.items():
        if col not in columns:
            print(f"Adding column {col} to clients table...")
            cursor.execute(f"ALTER TABLE clients ADD COLUMN {col} {col_type}")
            
    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
