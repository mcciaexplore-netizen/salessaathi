import { useState } from "react";
import { api } from "../services/api";

const STAGES = ["New Lead", "Contacted", "Interested", "Follow-Up Required", "Converted", "Not Interested"];

export default function ReviewMeeting({ data = {}, navigate }) {
  const ex = data.extracted || {};

  const [client, setClient] = useState({
    name: ex.client_name || "",
    company: ex.company || "",
    phone: ex.phone || "",
    email: ex.email || "",
    city: ex.city || "",
    service_interest: ex.service_interest || "",
    lead_source: ex.lead_source || "Meeting",
    next_follow_up_date: ex.follow_up_date || "",
    follow_up_notes: ex.follow_up_notes || "",
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
    deal_stage: "Contacted",
  });

  const [actions, setActions] = useState(
    (ex.action_items || []).map(a => ({ ...a, done: false }))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateClient = (k, v) => setClient(c => ({ ...c, [k]: v }));
  const updateMeeting = (k, v) => setMeeting(m => ({ ...m, [k]: v }));

  const handleConfirm = async () => {
    if (!client.name.trim()) { setError("Contact person name is required."); return; }
    if (!client.company.trim()) { setError("Company name is required."); return; }

    setSaving(true);
    setError("");
    try {
      // Sync client data with meeting data for consistency
      const clientPayload = {
        ...client,
        deal_temp: meeting.deal_temp,
        deal_stage: meeting.deal_stage,
        next_follow_up_date: client.next_follow_up_date || meeting.follow_up_date
      };

      const res = await api.meetings.confirm({
        client: clientPayload,
        meeting,
        action_items: actions.filter(a => a.description)
      });

      if (res.ok) {
        navigate("client-detail", { clientId: res.client.id });
      } else {
        setError(res.error || "Failed to save. Please try again.");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: "2.5rem" }}>
        <button
          onClick={() => navigate("log-meeting")}
          style={{ background: 'none', color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}
        >
          ← Back to Extraction
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ fontSize: "1.85rem", margin: 0 }}>Review Extractions</h1>
          <span className="badge badge-interested">AI PROCESSED</span>
        </div>
        <p style={{ color: "var(--text-secondary)", marginTop: '0.5rem' }}>
          Verify and refine the information extracted by AI before saving it to the system.
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "3rem" }}>
        {/* Left Column: Client Data */}
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>Company & Contact</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Field label="Company Name *">
              <input className="btn-outline" style={inputStyle} value={client.company} onChange={e => updateClient("company", e.target.value)} />
            </Field>
            <Field label="Contact Person *">
              <input className="btn-outline" style={inputStyle} value={client.name} onChange={e => updateClient("name", e.target.value)} />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Field label="Phone Number">
                <input className="btn-outline" style={inputStyle} value={client.phone} onChange={e => updateClient("phone", e.target.value)} />
              </Field>
              <Field label="Email Address">
                <input className="btn-outline" style={inputStyle} value={client.email} onChange={e => updateClient("email", e.target.value)} />
              </Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Field label="Service Interest">
                <input className="btn-outline" style={inputStyle} value={client.service_interest} onChange={e => updateClient("service_interest", e.target.value)} placeholder="e.g. HR Services" />
              </Field>
              <Field label="Lead Source">
                <input className="btn-outline" style={inputStyle} value={client.lead_source} onChange={e => updateClient("lead_source", e.target.value)} placeholder="e.g. Exhibition" />
              </Field>
            </div>
          </div>
        </div>

        {/* Right Column: Meeting & Status */}
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>Deal Progress</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Field label="Lead Status">
              <select className="btn-outline" style={inputStyle} value={meeting.deal_stage} onChange={e => updateMeeting("deal_stage", e.target.value)}>
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Interest Level">
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['cold', 'warm', 'hot'].map(t => (
                  <button
                    key={t}
                    onClick={() => updateMeeting("deal_temp", t)}
                    style={{
                      flex: 1,
                      padding: '0.6rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: meeting.deal_temp === t ? 'var(--accent-primary)' : 'transparent',
                      color: meeting.deal_temp === t ? 'white' : 'var(--text-secondary)',
                      fontWeight: '600',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase'
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Field label="Meeting Date">
                <input type="date" className="btn-outline" style={inputStyle} value={meeting.meeting_date} onChange={e => updateMeeting("meeting_date", e.target.value)} />
              </Field>
              <Field label="Next Follow-up">
                <input type="date" className="btn-outline" style={inputStyle} value={client.next_follow_up_date} onChange={e => updateClient("next_follow_up_date", e.target.value)} />
              </Field>
            </div>
            <Field label="Follow-up Notes">
              <textarea className="btn-outline" style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={client.follow_up_notes} onChange={e => updateClient("follow_up_notes", e.target.value)} placeholder="What needs to be done next?" />
            </Field>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="card" style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>Meeting Summary & Insights</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Field label="Key Discussion Points">
            <textarea className="btn-outline" style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} value={meeting.summary} onChange={e => updateMeeting("summary", e.target.value)} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <Field label="Pain Points / Problems">
              <textarea className="btn-outline" style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={meeting.problems} onChange={e => updateMeeting("problems", e.target.value)} />
            </Field>
            <Field label="Budget / Timeline Signals">
              <textarea className="btn-outline" style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={meeting.budget_signal} onChange={e => updateMeeting("budget_signal", e.target.value)} />
            </Field>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '4rem' }}>
        <button className="btn-outline" style={{ flex: 1, padding: '1.2rem' }} onClick={() => navigate("log-meeting")}>Discard</button>
        <button className="btn-primary" style={{ flex: 2, padding: '1.2rem', fontSize: '1.1rem' }} onClick={handleConfirm} disabled={saving}>
          {saving ? "Saving to System..." : "✅ Confirm and Save Lead"}
        </button>
      </div>
    </div>
  );
}

const Field = ({ label, children }) => (
  <div>
    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
    {children}
  </div>
);

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  fontSize: '0.9rem',
  fontFamily: 'inherit',
  textAlign: 'left'
};
