import os
import json
import gspread
from google.oauth2.service_account import Credentials
from threading import Thread

# This scope is required to read/write to Google Sheets and Drive
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
]

def get_sheets_client():
    creds_json = os.environ.get("GOOGLE_CREDENTIALS_JSON")
    if creds_json:
        try:
            creds_info = json.loads(creds_json)
            credentials = Credentials.from_service_account_info(creds_info, scopes=SCOPES)
            return gspread.authorize(credentials)
        except Exception as e:
            print(f"⚠️ Error parsing GOOGLE_CREDENTIALS_JSON: {e}")

    creds_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "credentials.json")
    if not os.path.exists(creds_path):
        print("⚠️ Google Sheets integration skipped: GOOGLE_CREDENTIALS_JSON env var not set and 'credentials.json' not found in the backend folder.")
        return None
    
    try:
        credentials = Credentials.from_service_account_file(creds_path, scopes=SCOPES)
        client = gspread.authorize(credentials)
        return client
    except Exception as e:
        print(f"⚠️ Error authenticating with Google Sheets: {e}")
        return None

def sync_to_sheets_task(client_data, meeting_data, actions, sheet_id):
    client = get_sheets_client()
    if not client:
        return
        
    try:
        sheet = client.open_by_key(sheet_id)
        
        # ── Sync Client ──────────────────────────────────────────────
        try:
            clients_ws = sheet.worksheet("Clients")
        except gspread.exceptions.WorksheetNotFound:
            clients_ws = sheet.add_worksheet(title="Clients", rows="100", cols="20")
            clients_ws.append_row(["ID", "Name", "Company", "Phone", "Email", "Deal Stage", "Deal Temp"])
            
        clients_ws.append_row([
            client_data.get("id", ""),
            client_data.get("name", ""),
            client_data.get("company", ""),
            client_data.get("phone", ""),
            client_data.get("email", ""),
            client_data.get("deal_stage", ""),
            client_data.get("deal_temp", "")
        ])

        # ── Sync Meeting ──────────────────────────────────────────────
        try:
            meetings_ws = sheet.worksheet("Meetings")
        except gspread.exceptions.WorksheetNotFound:
            meetings_ws = sheet.add_worksheet(title="Meetings", rows="100", cols="20")
            meetings_ws.append_row(["Meeting ID", "Client ID", "Meeting Date", "Follow-up Date", "Status", "Synopsis / Notes"])

        meetings_ws.append_row([
            meeting_data.get("id", ""),
            meeting_data.get("client_id", ""),
            meeting_data.get("meeting_date", ""),
            meeting_data.get("follow_up_date", ""),
            meeting_data.get("status", ""),
            meeting_data.get("synopsis", "") or meeting_data.get("raw_text", "")
        ])
        
        # ── Sync Action Items ─────────────────────────────────────────
        if actions:
            try:
                actions_ws = sheet.worksheet("Action Items")
            except gspread.exceptions.WorksheetNotFound:
                actions_ws = sheet.add_worksheet(title="Action Items", rows="100", cols="20")
                actions_ws.append_row(["Action ID", "Meeting ID", "Description", "Status", "Due Date"])
                
            for action in actions:
                # Assuming the action items were just created and returned back
                actions_ws.append_row([
                    action.get("id", ""),
                    action.get("meeting_id", ""),
                    action.get("description", ""),
                    action.get("status", ""),
                    action.get("due_date", "")
                ])
                
        print("✅ Successfully synced local data directly to Google Sheets!")
        
    except Exception as e:
        print(f"⚠️ Error syncing to Google Sheets (Did you share the sheet with the service account?): {e}")

def async_sync_data(client_data, meeting_data, actions):
    """
    Fires off a background thread so the user doesn't have to wait 
    for the slow Google Sheets API call.
    """
    sheet_id = os.environ.get("GOOGLE_SHEET_ID", "1PEVRVpDRWj7V7H8UL667NgfG552gSKa93oG69Tg7XAo")
    thread = Thread(target=sync_to_sheets_task, args=(client_data, meeting_data, actions, sheet_id))
    thread.start()
