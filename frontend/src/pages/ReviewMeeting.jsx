import { useState } from "react";

const STAGES = ["New Lead", "Meeting Done", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];

export default function ReviewMeeting({ data = {}, navigate }) {
  const ex = data.extracted || {};

  const [client, setClient]   = useState({
    name:    ex.client_name || "",
    company: ex.company || "",
    phone:   ex.phone || "",
    email:   ex.email || "",
    city:    ex.city || "",
  });
  const [meeting, setMeeting] = useState({
    meeting_date:   new Date().toISOString().split("T")[0],
    follow_up_date: ex.follow_up_date || "",
    summary:        ex.summary || "",
    problems:       ex.problems || "",
    products:       ex.products || "",
    budget_signal:  ex.budget_signal || "",
    objections:     ex.objections || "",
    deal_temp:      ex.deal_temp || "warm",
    deal_stage:     "Meeting Done",
  });
  const [actions, setActions] = useState(
    (ex.action_items || []).map(a => ({ ...a, done: false }))
  );
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

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
    <div style={{ padding: "32px", maxWidth: "760px" }}>
      <button onClick={() => navigate("log-meeting")} style={backBtn}>← Back</button>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
          Review & Confirm
        </h1>
        <span style={{ background: "#fef3c7", color: "#92400e", fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px" }}>
          AI extracted
        </span>
      </div>
      <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "24px" }}>
        Check what the AI found. Edit anything that's wrong, then confirm.
      </p>

      {data.imagePreview && (
        <img src={data.imagePreview} alt="Original notes" style={{
          maxWidth: "100%", maxHeight: "200px", objectFit: "contain", borderRadius: "10px",
          border: "1px solid #e2e8f0", marginBottom: "24px",
        }} />
      )}

      {/* Client info */}
      <SectionCard title="Client Information" icon="👤">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <Field label="Name *"><Input value={client.name}    onChange={v => setC("name", v)}    placeholder="Client's full name" /></Field>
          <Field label="Company"><Input value={client.company} onChange={v => setC("company", v)} placeholder="Business name" /></Field>
          <Field label="Phone"><Input value={client.phone}   onChange={v => setC("phone", v)}   placeholder="Phone number" /></Field>
          <Field label="Email"><Input value={client.email}   onChange={v => setC("email", v)}   placeholder="Email address" /></Field>
          <Field label="City"><Input value={client.city}    onChange={v => setC("city", v)}    placeholder="City" /></Field>
        </div>
      </SectionCard>

      {/* Meeting details */}
      <SectionCard title="Meeting Details" icon="📋">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
          <Field label="Meeting date">
            <input type="date" value={meeting.meeting_date} onChange={e => setM("meeting_date", e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Follow-up date">
            <input type="date" value={meeting.follow_up_date} onChange={e => setM("follow_up_date", e.target.value)} style={inputStyle} />
          </Field>
        </div>
        <Field label="Deal temperature" style={{ marginBottom: "12px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            {["hot", "warm", "cold"].map(t => (
              <button key={t} onClick={() => setM("deal_temp", t)} style={{
                padding: "8px 16px", borderRadius: "8px", cursor: "pointer",
                border: `2px solid ${meeting.deal_temp === t ? TEMP_BORDER[t] : "#e2e8f0"}`,
                background: meeting.deal_temp === t ? TEMP_BG[t] : "#fafafa",
                color: meeting.deal_temp === t ? TEMP_COLOR[t] : "#475569",
                fontSize: "13px", fontWeight: 600, textTransform: "capitalize",
              }}>{TEMP_ICON[t]} {t}</button>
            ))}
          </div>
        </Field>
        <Field label="Summary"><Textarea value={meeting.summary}  onChange={v => setM("summary", v)} placeholder="Meeting summary…" rows={2} /></Field>
        <Field label="Problems / Needs discussed"><Textarea value={meeting.problems} onChange={v => setM("problems", v)} placeholder="What problems did the client mention?" rows={2} /></Field>
        <Field label="Products / Services of interest"><Textarea value={meeting.products} onChange={v => setM("products", v)} placeholder="What was discussed?" rows={2} /></Field>
        <Field label="Budget signals"><Input value={meeting.budget_signal} onChange={v => setM("budget_signal", v)} placeholder="e.g. Budget around ₹5L, price sensitive" /></Field>
        <Field label="Objections raised"><Textarea value={meeting.objections} onChange={v => setM("objections", v)} placeholder="Any concerns or hesitations?" rows={2} /></Field>
      </SectionCard>

      {/* Action items */}
      <SectionCard title="Action Items" icon="✅">
        {actions.map((a, i) => (
          <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "10px", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <Input value={a.description} onChange={v => updateAction(i, "description", v)} placeholder="What needs to be done?" />
            </div>
            <select value={a.assigned_to} onChange={e => updateAction(i, "assigned_to", e.target.value)} style={{ ...inputStyle, width: "130px" }}>
              <option value="salesperson">Me (salesperson)</option>
              <option value="client">Client</option>
            </select>
            <input type="date" value={a.due_date || ""} onChange={e => updateAction(i, "due_date", e.target.value)}
              style={{ ...inputStyle, width: "140px" }} />
            <button onClick={() => removeAction(i)} style={{ background: "#fee2e2", border: "none", borderRadius: "6px", width: "34px", height: "38px", cursor: "pointer", color: "#991b1b", flexShrink: 0 }}>✕</button>
          </div>
        ))}
        <button onClick={addAction} style={{ background: "#f8fafc", border: "1px dashed #e2e8f0", borderRadius: "8px", padding: "8px 16px", color: "#64748b", cursor: "pointer", fontSize: "13px" }}>
          + Add action item
        </button>
      </SectionCard>

      {error && <div style={{ background: "#fee2e2", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", color: "#991b1b", fontSize: "13.5px" }}>{error}</div>}

      <div style={{ display: "flex", gap: "12px" }}>
        <button onClick={() => navigate("log-meeting")} style={{ flex: 1, padding: "13px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", color: "#475569", fontSize: "14px", cursor: "pointer" }}>
          Discard
        </button>
        <button onClick={handleConfirm} disabled={saving} style={{ flex: 2, padding: "13px", background: "linear-gradient(135deg, #1d4ed8, #3b82f6)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}>
          {saving ? "Saving…" : "✅ Confirm & Save →"}
        </button>
      </div>
    </div>
  );
}

const TEMP_BG     = { hot: "#fee2e2", warm: "#fef3c7", cold: "#dbeafe" };
const TEMP_COLOR  = { hot: "#991b1b", warm: "#92400e", cold: "#1e40af" };
const TEMP_BORDER = { hot: "#fca5a5", warm: "#fcd34d", cold: "#93c5fd" };
const TEMP_ICON   = { hot: "🔥", warm: "🌤", cold: "❄️" };

const SectionCard = ({ title, icon, children }) => (
  <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
      <span style={{ fontSize: "18px" }}>{icon}</span>
      <strong style={{ fontFamily: "'Sora', sans-serif", fontSize: "15px", color: "#1e293b" }}>{title}</strong>
    </div>
    {children}
  </div>
);
const Field = ({ label, children }) => (
  <div style={{ marginBottom: "10px" }}>
    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>{label}</label>
    {children}
  </div>
);
const Input = ({ value, onChange, placeholder }) => (
  <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    style={inputStyle} />
);
const Textarea = ({ value, onChange, placeholder, rows = 2 }) => (
  <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
    style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
);
const inputStyle = { width: "100%", padding: "9px 11px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13.5px", color: "#1e293b", fontFamily: "'Inter', sans-serif", outline: "none", boxSizing: "border-box", background: "#fff" };
const backBtn    = { background: "none", border: "none", color: "#64748b", fontSize: "13px", cursor: "pointer", padding: "0 0 20px", display: "flex", alignItems: "center", gap: "4px" };
