import { useEffect, useState } from "react";

const STAGES = ["New Lead", "Meeting Done", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];
const TEMP_COLOR  = { hot: "#ef4444", warm: "#f59e0b", cold: "#3b82f6" };
const TEMP_BG     = { hot: "#fee2e2", warm: "#fef3c7", cold: "#dbeafe" };
const TEMP_ICON   = { hot: "🔥", warm: "🌤", cold: "❄️" };

export default function ClientDetail({ clientId, navigate }) {
  const [client,   setClient]   = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState(false);
  const [form,     setForm]     = useState({});
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    if (!clientId) return;
    Promise.all([
      fetch(`/api/clients/${clientId}`).then(r => r.json()),
      fetch(`/api/meetings?client_id=${clientId}`).then(r => r.json()),
    ]).then(([c, m]) => {
      setClient(c);
      setForm(c);
      setMeetings(m);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [clientId]);

  const saveClient = async () => {
    setSaving(true);
    const updated = await fetch(`/api/clients/${clientId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).then(r => r.json());
    setClient(updated);
    setEditing(false);
    setSaving(false);
  };

  if (loading) return <div style={{ padding: "32px", color: "#94a3b8" }}>Loading…</div>;
  if (!client) return <div style={{ padding: "32px", color: "#ef4444" }}>Client not found.</div>;

  return (
    <div style={{ padding: "32px", maxWidth: "820px" }}>
      <button onClick={() => navigate("clients")} style={backBtn}>← Clients</button>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{
            width: 56, height: 56, borderRadius: "14px",
            background: "linear-gradient(135deg, #1e3a8a, #1d4ed8)",
            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: "22px",
          }}>{(client.name || "?")[0].toUpperCase()}</div>
          <div>
            <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
              {client.name} {TEMP_ICON[client.deal_temp]}
            </h1>
            <div style={{ color: "#64748b", fontSize: "14px", marginTop: "2px" }}>
              {client.company}{client.phone ? ` · ${client.phone}` : ""}{client.email ? ` · ${client.email}` : ""}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => navigate("log-meeting")} style={{
            background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe",
            borderRadius: "8px", padding: "8px 14px", fontSize: "13px", fontWeight: 600, cursor: "pointer",
          }}>📸 New Meeting</button>
          <button onClick={() => setEditing(!editing)} style={{
            background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0",
            borderRadius: "8px", padding: "8px 14px", fontSize: "13px", cursor: "pointer",
          }}>✏️ Edit</button>
        </div>
      </div>

      {/* Deal stage bar */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px 20px", marginBottom: "20px" }}>
        <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Deal Stage</div>
        <div style={{ display: "flex", gap: "6px" }}>
          {STAGES.filter(s => !s.startsWith("Closed")).map(s => (
            <div key={s} style={{
              flex: 1, padding: "6px 8px", borderRadius: "6px", textAlign: "center",
              fontSize: "11px", fontWeight: 600,
              background: client.deal_stage === s ? "#1d4ed8" : "#f1f5f9",
              color: client.deal_stage === s ? "#fff" : "#64748b",
              cursor: "pointer",
            }} onClick={() => {
              fetch(`/api/clients/${clientId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ deal_stage: s }) })
                .then(r => r.json()).then(c => setClient(c));
            }}>{s}</div>
          ))}
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
          <strong style={{ fontFamily: "'Sora', sans-serif", fontSize: "15px", color: "#1e293b" }}>Edit Client</strong>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "14px" }}>
            {[["name","Name"],["company","Company"],["phone","Phone"],["email","Email"],["city","City"]].map(([k,l]) => (
              <div key={k}>
                <label style={labelSt}>{l}</label>
                <input value={form[k] || ""} onChange={e => setForm(f => ({...f,[k]:e.target.value}))} style={inpSt} />
              </div>
            ))}
            <div>
              <label style={labelSt}>Deal temperature</label>
              <select value={form.deal_temp || "warm"} onChange={e => setForm(f => ({...f, deal_temp: e.target.value}))} style={inpSt}>
                <option value="hot">🔥 Hot</option>
                <option value="warm">🌤 Warm</option>
                <option value="cold">❄️ Cold</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
            <button onClick={saveClient} disabled={saving} style={{ padding: "10px 20px", background: "#1d4ed8", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13.5px", fontWeight: 600, cursor: "pointer" }}>
              {saving ? "Saving…" : "Save changes"}
            </button>
            <button onClick={() => { setEditing(false); setForm(client); }} style={{ padding: "10px 16px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", cursor: "pointer", color: "#475569" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Meeting timeline */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <strong style={{ fontFamily: "'Sora', sans-serif", fontSize: "15px", color: "#1e293b" }}>
            Meeting History ({meetings.length})
          </strong>
        </div>
        {meetings.length === 0 ? (
          <div style={{ color: "#94a3b8", fontSize: "13.5px", padding: "16px 0" }}>No meetings logged yet.</div>
        ) : (
          meetings.map((m, i) => (
            <MeetingCard key={m.id} m={m} isLast={i === meetings.length - 1} />
          ))
        )}
      </div>
    </div>
  );
}

function MeetingCard({ m, isLast }) {
  const [actions, setActions] = useState([]);
  const [open,    setOpen]    = useState(false);

  const loadActions = () => {
    if (open) { setOpen(false); return; }
    fetch(`/api/meetings/${m.id}/actions`).then(r => r.json()).then(a => { setActions(a); setOpen(true); });
  };

  return (
    <div style={{ borderBottom: isLast ? "none" : "1px solid #f1f5f9", paddingBottom: "16px", marginBottom: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ width: "3px", background: "#bfdbfe", borderRadius: "2px", flexShrink: 0, minHeight: "60px" }} />
          <div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontWeight: 600, fontSize: "14px", color: "#1e293b" }}>{m.meeting_date}</span>
              <span style={{
                fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "999px",
                background: TEMP_BG[m.deal_temp] || "#f1f5f9",
                color: TEMP_COLOR[m.deal_temp] || "#475569",
                textTransform: "capitalize",
              }}>{TEMP_ICON[m.deal_temp]} {m.deal_temp}</span>
            </div>
            {m.summary && <p style={{ margin: "0 0 6px", color: "#475569", fontSize: "13.5px", lineHeight: 1.6 }}>{m.summary}</p>}
            {m.problems && <div style={{ fontSize: "13px", color: "#64748b" }}>📌 {m.problems}</div>}
            {m.follow_up_date && <div style={{ fontSize: "12px", color: "#3b82f6", marginTop: "4px" }}>📅 Follow-up: {m.follow_up_date}</div>}
          </div>
        </div>
        <button onClick={loadActions} style={{ background: "none", border: "none", color: "#3b82f6", fontSize: "12px", cursor: "pointer", whiteSpace: "nowrap" }}>
          {open ? "▲ Hide actions" : "▼ Action items"}
        </button>
      </div>
      {open && actions.length > 0 && (
        <div style={{ marginLeft: "15px", marginTop: "10px" }}>
          {actions.map(a => (
            <div key={a.id} style={{ display: "flex", gap: "8px", alignItems: "center", padding: "6px 0" }}>
              <input type="checkbox" defaultChecked={a.done} onChange={e =>
                fetch(`/api/actions/${a.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ done: e.target.checked }) })
              } />
              <span style={{ fontSize: "13.5px", color: a.done ? "#94a3b8" : "#475569", textDecoration: a.done ? "line-through" : "none" }}>
                {a.description}
              </span>
              {a.due_date && <span style={{ fontSize: "11px", color: "#94a3b8" }}> · {a.due_date}</span>}
              <span style={{ fontSize: "11px", background: "#f1f5f9", borderRadius: "4px", padding: "2px 6px", color: "#64748b" }}>
                {a.assigned_to === "client" ? "Client" : "Me"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const backBtn   = { background: "none", border: "none", color: "#64748b", fontSize: "13px", cursor: "pointer", padding: "0 0 20px", display: "flex", alignItems: "center", gap: "4px" };
const labelSt   = { display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "5px" };
const inpSt     = { width: "100%", padding: "9px 11px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13.5px", color: "#1e293b", outline: "none", boxSizing: "border-box" };
