import { useEffect, useState } from "react";

const STAGES = ["New Lead", "Meeting Done", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];
const TEMP_COLOR = { hot: "#ef4444", warm: "#f59e0b", cold: "#3b82f6" };
const TEMP_BG = { hot: "rgba(239, 68, 68, 0.1)", warm: "rgba(245, 158, 11, 0.1)", cold: "rgba(59, 130, 246, 0.1)" };
const TEMP_ICON = { hot: "🔥", warm: "🌤", cold: "❄️" };

export default function ClientDetail({ clientId, navigate }) {
  const [client, setClient] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

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

  if (loading) return <div style={{ padding: "48px 40px", color: "var(--text-muted)" }}>Loading client details...</div>;
  if (!client) return <div style={{ padding: "48px 40px", color: "#ef4444" }}>Client not found.</div>;

  return (
    <div style={{ padding: "48px 40px", maxWidth: "1000px", margin: "0 auto" }}>
      <button onClick={() => navigate("clients")} style={backBtn}>
        <span style={{ fontSize: "16px" }}>←</span> Back to Clients
      </button>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <div style={{
            width: 72, height: 72, borderRadius: "20px",
            background: "rgba(59, 130, 246, 0.1)",
            color: "var(--accent-blue)", display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: "28px", border: "1px solid rgba(59, 130, 246, 0.2)"
          }}>{(client.name || "?")[0].toUpperCase()}</div>
          <div>
            <h1 style={{ fontSize: "36px", margin: 0, display: "flex", alignItems: "center", gap: "12px" }}>
              {client.name} <span style={{ fontSize: "24px" }}>{TEMP_ICON[client.deal_temp]}</span>
            </h1>
            <div style={{ color: "var(--text-muted)", fontSize: "16px", marginTop: "6px" }}>
              <span style={{ color: "var(--text-secondary)" }}>{client.company || "No Company"}</span>
              {client.phone ? ` · ${client.phone}` : ""}
              {client.email ? ` · ${client.email}` : ""}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => navigate("log-meeting")} className="btn-primary">
            📸 Log Meeting
          </button>
          <button onClick={() => setEditing(!editing)} className="btn-secondary">
            {editing ? "Close" : "✏️ Edit Profile"}
          </button>
        </div>
      </div>

      {/* Deal stage bar */}
      <div className="glass-card" style={{ padding: "32px", marginBottom: "32px" }}>
        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>Pipeline Stage</div>
        <div style={{ display: "flex", gap: "8px" }}>
          {STAGES.filter(s => !s.startsWith("Closed")).map(s => (
            <div key={s} style={{
              flex: 1, padding: "10px", borderRadius: "10px", textAlign: "center",
              fontSize: "13px", fontWeight: 700,
              background: client.deal_stage === s ? "var(--accent-blue)" : "rgba(255,255,255,0.03)",
              color: client.deal_stage === s ? "#fff" : "var(--text-muted)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }} onClick={() => {
              fetch(`/api/clients/${clientId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ deal_stage: s }) })
                .then(r => r.json()).then(c => setClient(c));
            }}>{s}</div>
          ))}
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="glass-card" style={{ padding: "32px", marginBottom: "32px", background: "rgba(59, 130, 246, 0.05)" }}>
          <h3 style={{ fontSize: "18px", marginBottom: "24px" }}>Update Client Details</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {[["name", "Full Name"], ["company", "Company Name"], ["phone", "Phone Number"], ["email", "Email Address"], ["city", "Location"]].map(([k, l]) => (
              <div key={k}>
                <label style={labelSt}>{l}</label>
                <input value={form[k] || ""} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} className="glass-card" style={inpSt} />
              </div>
            ))}
            <div>
              <label style={labelSt}>Deal Temperature</label>
              <select value={form.deal_temp || "warm"} onChange={e => setForm(f => ({ ...f, deal_temp: e.target.value }))} className="glass-card" style={{ ...inpSt, padding: "12px" }}>
                <option value="hot">🔥 Hot Lead</option>
                <option value="warm">🌤 Warm Lead</option>
                <option value="cold">❄️ Cold Lead</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
            <button onClick={saveClient} disabled={saving} className="btn-primary" style={{ flex: 1 }}>
              {saving ? "Saving Changes..." : "Save Profile Updates"}
            </button>
            <button onClick={() => { setEditing(false); setForm(client); }} className="btn-secondary" style={{ flex: 0.3 }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Meeting timeline */}
      <div className="glass-card" style={{ padding: "32px" }}>
        <h3 style={{ fontSize: "18px", marginBottom: "32px" }}>
          Meeting History <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: "14px", marginLeft: "8px" }}>({meetings.length} entries)</span>
        </h3>
        {meetings.length === 0 ? (
          <div style={{ color: "var(--text-muted)", fontSize: "15px", padding: "16px 0", fontStyle: "italic" }}>No meetings logged yet for this client.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            {meetings.map((m, i) => (
              <MeetingCard key={m.id} m={m} isLast={i === meetings.length - 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MeetingCard({ m, isLast }) {
  const [actions, setActions] = useState([]);
  const [open, setOpen] = useState(false);

  const loadActions = () => {
    if (open) { setOpen(false); return; }
    fetch(`/api/meetings/${m.id}/actions`).then(r => r.json()).then(a => { setActions(a); setOpen(true); });
  };

  return (
    <div style={{ paddingBottom: isLast ? 0 : "32px", borderBottom: isLast ? "none" : "1px solid var(--border-glass)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: "20px" }}>
          <div style={{
            width: "4px", background: TEMP_COLOR[m.deal_temp] || "var(--accent-blue)",
            borderRadius: "4px", flexShrink: 0, marginTop: "8px"
          }} />
          <div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontWeight: 800, fontSize: "16px", color: "var(--text-primary)" }}>{m.meeting_date}</span>
              <span style={{
                fontSize: "11px", fontWeight: 700, padding: "4px 12px", borderRadius: "999px",
                background: TEMP_BG[m.deal_temp] || "rgba(255,255,255,0.05)",
                color: TEMP_COLOR[m.deal_temp] || "var(--text-muted)",
                textTransform: "uppercase", letterSpacing: "0.05em"
              }}>{TEMP_ICON[m.deal_temp]} {m.deal_temp}</span>
            </div>
            {m.summary && <p style={{ margin: "0 0 16px", color: "var(--text-secondary)", fontSize: "15px", lineHeight: 1.7 }}>{m.summary}</p>}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
              {m.problems && <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                <strong style={{ color: "#ef4444", fontSize: "12px" }}>PAIN POINTS:</strong> {m.problems}
              </div>}
              {m.follow_up_date && <div style={{ fontSize: "14px", color: "var(--accent-blue)", fontWeight: 600 }}>
                📅 Follow-up scheduled for {m.follow_up_date}
              </div>}
            </div>
          </div>
        </div>
        <button onClick={loadActions} className="btn-secondary" style={{ padding: "8px 16px", fontSize: "12px", whiteSpace: "nowrap" }}>
          {open ? "▲ Hide Actions" : "▼ View Actions"}
        </button>
      </div>

      {open && (
        <div className="glass-card" style={{ marginLeft: "24px", marginTop: "20px", padding: "16px 20px", background: "rgba(255,255,255,0.02)" }}>
          {actions.length === 0 ? (
            <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>No tasks identified for this meeting.</div>
          ) : (
            actions.map(a => (
              <div key={a.id} style={{ display: "flex", gap: "12px", alignItems: "center", padding: "8px 0" }}>
                <input type="checkbox" defaultChecked={a.done} style={{ width: "16px", height: "16px", accentColor: "var(--accent-blue)" }} onChange={e =>
                  fetch(`/api/actions/${a.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ done: e.target.checked }) })
                } />
                <span style={{ fontSize: "14px", color: a.done ? "var(--text-muted)" : "var(--text-primary)", textDecoration: a.done ? "line-through" : "none" }}>
                  {a.description}
                </span>
                {a.due_date && <span style={{ fontSize: "12px", color: "var(--text-muted)" }}> · due {a.due_date}</span>}
                <span style={{ fontSize: "10px", background: "rgba(255,255,255,0.05)", borderRadius: "6px", padding: "4px 8px", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase" }}>
                  {a.assigned_to === "client" ? "Client Task" : "Our Task"}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const backBtn = {
  background: "none", border: "none", color: "var(--text-muted)",
  fontSize: "14px", cursor: "pointer", padding: "0 0 32px",
  display: "inline-flex", alignItems: "center", gap: "8px", fontWeight: 500
};
const labelSt = { display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.1em" };
const inpSt = { width: "100%", padding: "14px", fontSize: "15px", color: "var(--text-primary)", outline: "none", boxSizing: "border-box" };
