const STAGES = ["New Lead", "Meeting Done", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];

export default function ReviewMeeting({ data = {}, navigate }) {
  const ex = data.extracted || {};

  const [client, setClient] = useState({
    name: ex.client_name || "",
    company: ex.company || "",
    phone: ex.phone || "",
    email: ex.email || "",
    city: ex.city || "",
  });
  const [meeting, setMeeting] = useState({
    meeting_date: new Date().toISOString().split("T")[0],
    follow_up_date: ex.follow_up_date || "",
    summary: ex.summary || "",
    problems: ex.problems || "",
    products: ex.products || "",
    budget_signal: ex.budget_signal || "",
    objections: ex.objections || "",
    deal_temp: ex.deal_temp || "warm",
    deal_stage: "Meeting Done",
  });
  const [actions, setActions] = useState(
    (ex.action_items || []).map(a => ({ ...a, done: false }))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const setC = (k, v) => setClient(c => ({ ...c, [k]: v }));
  const setM = (k, v) => setMeeting(m => ({ ...m, [k]: v }));

  const addAction = () => setActions(a => [...a, { description: "", assigned_to: "salesperson", due_date: "" }]);
  const updateAction = (i, k, v) => setActions(a => a.map((x, j) => j === i ? { ...x, [k]: v } : x));
  const removeAction = (i) => setActions(a => a.filter((_, j) => j !== i));

  const handleConfirm = async () => {
    if (!client.name.trim()) { setError("Client name is required."); return; }
    setSaving(true);
    setError("");
    try {
      const resp = await fetch("/api/meetings/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client, meeting, action_items: actions.filter(a => a.description) }),
      });
      const d = await resp.json();
      if (d.ok) {
        navigate("client-detail", { clientId: d.client.id });
      } else {
        setError(d.error || "Failed to save. Please try again.");
      }
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: "48px 40px", maxWidth: "1000px", margin: "0 auto" }}>
      <button onClick={() => navigate("log-meeting")} style={backBtn}>
        <span style={{ fontSize: "16px" }}>←</span> Back
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "8px" }}>
        <h1 style={{ fontSize: "32px", margin: 0 }}>Review Extractions</h1>
        <span className="glass-card" style={{
          background: "rgba(59, 130, 246, 0.1)", color: "var(--accent-blue)",
          fontSize: "11px", fontWeight: 800, padding: "4px 12px",
          borderRadius: "999px", border: "1px solid rgba(59, 130, 246, 0.2)",
          textTransform: "uppercase", letterSpacing: "0.05em"
        }}>
          AI Powered
        </span>
      </div>
      <p style={{ color: "var(--text-muted)", fontSize: "16px", marginBottom: "32px" }}>
        Verify the information extracted from your notes. Edit as needed before saving.
      </p>

      {data.imagePreview && (
        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px", fontWeight: 700, textTransform: "uppercase" }}>Original Reference</div>
          <div className="glass-card" style={{ padding: "12px", background: "rgba(255,255,255,0.02)" }}>
            <img src={data.imagePreview} alt="Original notes" style={{
              maxWidth: "100%", maxHeight: "240px", objectFit: "contain", borderRadius: "8px",
            }} />
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "40px" }}>
        {/* Client info */}
        <SectionCard title="Client Information" icon="👤">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <Field label="Full Name *"><Input value={client.name} onChange={v => setC("name", v)} placeholder="e.g. Rahul Sharma" /></Field>
            <Field label="Company Name"><Input value={client.company} onChange={v => setC("company", v)} placeholder="e.g. Sharma Logistics" /></Field>
            <Field label="Phone Number"><Input value={client.phone} onChange={v => setC("phone", v)} placeholder="+91..." /></Field>
            <Field label="Email Address"><Input value={client.email} onChange={v => setC("email", v)} placeholder="email@example.com" /></Field>
            <Field label="City / Location"><Input value={client.city} onChange={v => setC("city", v)} placeholder="e.g. Pune" /></Field>
          </div>
        </SectionCard>

        {/* Meeting details */}
        <SectionCard title="Meeting Insights" icon="📋">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <Field label="Meeting date">
              <input type="date" value={meeting.meeting_date} onChange={e => setM("meeting_date", e.target.value)} className="glass-card" style={inputStyle} />
            </Field>
            <Field label="Follow-up date">
              <input type="date" value={meeting.follow_up_date} onChange={e => setM("follow_up_date", e.target.value)} className="glass-card" style={inputStyle} />
            </Field>
          </div>
          <Field label="Deal Sentiment" style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", gap: "10px" }}>
              {["hot", "warm", "cold"].map(t => (
                <button key={t} onClick={() => setM("deal_temp", t)} style={{
                  flex: 1, padding: "12px", borderRadius: "10px", cursor: "pointer",
                  border: `1px solid ${meeting.deal_temp === t ? TEMP_COLOR[t] : "var(--border-glass)"}`,
                  background: meeting.deal_temp === t ? TEMP_BG[t] : "transparent",
                  color: meeting.deal_temp === t ? TEMP_COLOR[t] : "var(--text-muted)",
                  fontSize: "14px", fontWeight: 700, transition: "all 0.2s ease"
                }}>{TEMP_ICON[t]} {t.toUpperCase()}</button>
              ))}
            </div>
          </Field>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <Field label="Key Summary"><Textarea value={meeting.summary} onChange={v => setM("summary", v)} placeholder="What was the main outcome?" rows={3} /></Field>
            <Field label="Problems / Needs"><Textarea value={meeting.problems} onChange={v => setM("problems", v)} placeholder="What pain points were identified?" rows={2} /></Field>
            <Field label="Budget Signals"><Input value={meeting.budget_signal} onChange={v => setM("budget_signal", v)} placeholder="e.g. 10 Lakhs, Negotiable" /></Field>
            <Field label="Client Objections"><Textarea value={meeting.objections} onChange={v => setM("objections", v)} placeholder="Any hesitations or concerns?" rows={2} /></Field>
          </div>
        </SectionCard>

        {/* Action items */}
        <SectionCard title="Identified Action Items" icon="✅">
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {actions.map((a, i) => (
              <div key={i} className="glass-card" style={{ display: "flex", gap: "12px", padding: "12px", alignItems: "center", background: "rgba(255,255,255,0.02)" }}>
                <div style={{ flex: 1 }}>
                  <Input value={a.description} onChange={v => updateAction(i, "description", v)} placeholder="Action description..." />
                </div>
                <select value={a.assigned_to} onChange={e => updateAction(i, "assigned_to", e.target.value)} className="glass-card" style={{ ...inputStyle, width: "130px", padding: "8px" }}>
                  <option value="salesperson" style={{ background: "#1a1a1a" }}>Our Team</option>
                  <option value="client" style={{ background: "#1a1a1a" }}>Client</option>
                </select>
                <input type="date" value={a.due_date || ""} onChange={e => updateAction(i, "due_date", e.target.value)}
                  className="glass-card" style={{ ...inputStyle, width: "150px", padding: "8px" }} />
                <button onClick={() => removeAction(i)} style={{ color: "#ef4444", padding: "8px", fontSize: "18px" }}>✕</button>
              </div>
            ))}
          </div>
          <button onClick={addAction} className="btn-secondary" style={{ marginTop: "16px", padding: "10px 20px", width: "100%", borderStyle: "dashed" }}>
            + Add Another Action
          </button>
        </SectionCard>
      </div>

      {error && (
        <div style={{
          background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)",
          borderRadius: "12px", padding: "16px 20px", marginBottom: "32px", color: "#fca5a5"
        }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: "16px" }}>
        <button onClick={() => navigate("log-meeting")} className="btn-secondary" style={{ flex: 1, padding: "18px" }}>
          Discard and Retry
        </button>
        <button onClick={handleConfirm} disabled={saving} className="btn-primary" style={{ flex: 2, padding: "18px" }}>
          {saving ? "Saving Extractions..." : "Confirm & Save to CRM →"}
        </button>
      </div>
    </div>
  );
}

const TEMP_BG = { hot: "rgba(239, 68, 68, 0.1)", warm: "rgba(245, 158, 11, 0.1)", cold: "rgba(59, 130, 246, 0.1)" };
const TEMP_COLOR = { hot: "#ef4444", warm: "#f59e0b", cold: "#3b82f6" };
const TEMP_ICON = { hot: "🔥", warm: "🌤", cold: "❄️" };

const SectionCard = ({ title, icon, children }) => (
  <div className="glass-card" style={{ padding: "32px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
      <span style={{ fontSize: "20px" }}>{icon}</span>
      <h3 style={{ fontSize: "18px", margin: 0 }}>{title}</h3>
    </div>
    {children}
  </div>
);

const Field = ({ label, children, style = {} }) => (
  <div style={{ ...style }}>
    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</label>
    {children}
  </div>
);

const Input = ({ value, onChange, placeholder }) => (
  <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    className="glass-card" style={inputStyle} />
);

const Textarea = ({ value, onChange, placeholder, rows = 2 }) => (
  <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
    className="glass-card" style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
);

const inputStyle = { width: "100%", padding: "14px", fontSize: "15px", color: "var(--text-primary)", outline: "none", boxSizing: "border-box" };
const backBtn = { background: "none", border: "none", color: "var(--text-muted)", fontSize: "14px", cursor: "pointer", padding: "0 0 32px", display: "inline-flex", alignItems: "center", gap: "8px", fontWeight: 500 };
