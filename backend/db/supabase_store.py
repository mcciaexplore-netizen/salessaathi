"""
Supabase REST API adapter.
"""
import uuid
from datetime import date, datetime
from typing import Optional

from supabase import create_client, Client
from .base import DataStore

def _uid():
    return str(uuid.uuid4())

class SupabaseDataStore(DataStore):

    def __init__(self, url: str, key: str):
        self.supabase: Client = create_client(url, key)

    def is_ready(self) -> bool:
        try:
            self.supabase.table('business').select('id').limit(1).execute()
            return True
        except Exception:
            return False

    def init_schema(self) -> None:
        pass  # Schema managed via Supabase Dashboard

    def get_business(self) -> Optional[dict]:
        res = self.supabase.table('business').select('*').limit(1).execute()
        return res.data[0] if res.data else None

    def save_business(self, data: dict) -> dict:
        existing = self.get_business()
        if existing:
            res = self.supabase.table('business').update(data).eq('id', existing['id']).execute()
            return res.data[0] if res.data else {}
        else:
            data['id'] = data.get('id', _uid())
            res = self.supabase.table('business').insert(data).execute()
            return res.data[0] if res.data else {}

    def get_config(self, key: str) -> Optional[str]:
        res = self.supabase.table('config').select('value').eq('key', key).execute()
        return res.data[0]['value'] if res.data else None

    def set_config(self, key: str, value: str) -> None:
        res = self.supabase.table('config').select('key').eq('key', key).execute()
        if res.data:
            self.supabase.table('config').update({'value': value}).eq('key', key).execute()
        else:
            self.supabase.table('config').insert({'key': key, 'value': value}).execute()

    def list_api_keys(self) -> list[dict]:
        res = self.supabase.table('api_keys').select('*').execute()
        result = []
        for d in res.data:
            val = d.get('key_value', '')
            d['key_value'] = val[:6] + "••••••••" if len(val) >= 6 else "••••••••"
            result.append(d)
        return result

    def add_api_key(self, provider: str, key: str, label: str = "") -> dict:
        d = {'id': _uid(), 'provider': provider, 'key_value': key, 'label': label}
        res = self.supabase.table('api_keys').insert(d).execute()
        row = res.data[0] if res.data else d
        val = row.get('key_value', '')
        row['key_value'] = val[:6] + "••••••••" if len(val) >= 6 else "••••••••"
        return row

    def delete_api_key(self, key_id: str) -> None:
        self.supabase.table('api_keys').delete().eq('id', key_id).execute()

    def get_active_key_for_provider(self, provider: str) -> Optional[str]:
        res = self.supabase.table('api_keys').select('key_value').eq('provider', provider).eq('is_active', True).order('calls_today').limit(1).execute()
        return res.data[0]['key_value'] if res.data else None

    def list_clients(self) -> list[dict]:
        res = self.supabase.table('clients').select('*').order('updated_at', desc=True).execute()
        return res.data

    def get_client(self, client_id: str) -> Optional[dict]:
        res = self.supabase.table('clients').select('*').eq('id', client_id).limit(1).execute()
        return res.data[0] if res.data else None

    def create_client(self, data: dict) -> dict:
        data['id'] = data.get('id', _uid())
        res = self.supabase.table('clients').insert(data).execute()
        return res.data[0] if res.data else {}

    def update_client(self, client_id: str, data: dict) -> dict:
        if 'id' in data:
            del data['id']
        data['updated_at'] = datetime.utcnow().isoformat()
        res = self.supabase.table('clients').update(data).eq('id', client_id).execute()
        return res.data[0] if res.data else {}

    def find_client_by_name_or_phone(self, name: str = "", phone: str = "") -> Optional[dict]:
        if phone:
            res = self.supabase.table('clients').select('*').eq('phone', phone).limit(1).execute()
            if res.data: return res.data[0]
        if name:
            res = self.supabase.table('clients').select('*').ilike('name', f"%{name}%").limit(1).execute()
            if res.data: return res.data[0]
        return None

    def list_meetings(self, client_id: str = None) -> list[dict]:
        q = self.supabase.table('meetings').select('*').order('meeting_date', desc=True)
        if client_id:
            q = q.eq('client_id', client_id)
        res = q.execute()
        return res.data

    def get_meeting(self, meeting_id: str) -> Optional[dict]:
        res = self.supabase.table('meetings').select('*').eq('id', meeting_id).limit(1).execute()
        return res.data[0] if res.data else None

    def create_meeting(self, data: dict) -> dict:
        data['id'] = data.get('id', _uid())
        res = self.supabase.table('meetings').insert(data).execute()
        return res.data[0] if res.data else {}

    def update_meeting(self, meeting_id: str, data: dict) -> dict:
        if 'id' in data:
            del data['id']
        res = self.supabase.table('meetings').update(data).eq('id', meeting_id).execute()
        return res.data[0] if res.data else {}

    def list_action_items(self, meeting_id: str) -> list[dict]:
        res = self.supabase.table('action_items').select('*').eq('meeting_id', meeting_id).execute()
        return res.data

    def create_action_item(self, meeting_id: str, data: dict) -> dict:
        data['id'] = data.get('id', _uid())
        data['meeting_id'] = meeting_id
        res = self.supabase.table('action_items').insert(data).execute()
        return res.data[0] if res.data else {}

    def update_action_item(self, item_id: str, data: dict) -> dict:
        if 'id' in data:
            del data['id']
        if 'meeting_id' in data:
            del data['meeting_id']
        res = self.supabase.table('action_items').update(data).eq('id', item_id).execute()
        return res.data[0] if res.data else {}

    def get_user(self, username: str) -> Optional[dict]:
        res = self.supabase.table('users').select('*').eq('username', username).limit(1).execute()
        return res.data[0] if res.data else None

    def create_user(self, data: dict) -> dict:
        data['id'] = data.get('id', _uid())
        res = self.supabase.table('users').insert(data).execute()
        return res.data[0] if res.data else {}

    def get_dashboard_summary(self) -> dict:
        today = date.today().isoformat()
        res_meetings = self.supabase.table('meetings').select('id', count='exact').lt('follow_up_date', today).neq('status', 'closed').execute()
        overdue = getattr(res_meetings, 'count', len(res_meetings.data) if res_meetings.data else 0)

        res_due_today = self.supabase.table('clients').select('id', count='exact').eq('next_follow_up_date', today).execute()
        due_today = getattr(res_due_today, 'count', len(res_due_today.data) if res_due_today.data else 0)

        res_total = self.supabase.table('clients').select('id', count='exact').execute()
        total_leads = getattr(res_total, 'count', len(res_total.data) if res_total.data else 0)
        
        res_recent = self.supabase.table('clients').select('id,created_at').execute()
        new_leads = sum(1 for c in res_recent.data if c.get('created_at', '').startswith(today))

        res_conv = self.supabase.table('clients').select('id', count='exact').eq('deal_stage', 'Converted').execute()
        converted = getattr(res_conv, 'count', len(res_conv.data) if res_conv.data else 0)

        res_hot = self.supabase.table('clients').select('id', count='exact').eq('deal_temp', 'hot').execute()
        hot_deals = getattr(res_hot, 'count', len(res_hot.data) if res_hot.data else 0)

        res_today_list = self.supabase.table('clients').select('*').eq('next_follow_up_date', today).execute()
        today_list = res_today_list.data if res_today_list.data else []

        return {
            "total_leads": total_leads,
            "new_leads": new_leads,
            "follow_ups_today": due_today,
            "converted_leads": converted,
            "hot_deals": hot_deals,
            "overdue_follow_ups": overdue,
            "today_follow_ups_list": today_list
        }
