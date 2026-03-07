import { useEffect, useState } from "react";
import { api } from "../services/api";

const STAGES = ["New Lead", "Contacted", "Interested", "Follow-Up Required", "Converted", "Not Interested"];

export default function ClientDetail({ clientId, navigate }) {
  const [client, setClient] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!clientId) return;
    setLoading(true);
    Promise.all([
      api.leads.get(clientId),
      api.meetings.listForClient(clientId)
    ]).then(([c, m]) => {
      setClient(c);
      setForm(c);
      setMeetings(m);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [clientId]);

  const handleUpdate = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await api.leads.update(clientId, form);
      setClient(res);
      setEditing(false);
    } catch (err) {
      alert("Failed to update lead data");
    } finally {
      setSaving(false);
    }
  };

  const handleStageChange = async (newStage) => {
    try {
      const res = await api.leads.update(clientId, { deal_stage: newStage });
      setClient(res);
      setForm(res);
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (loading) return (
    <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-secondary)" }}>
      Loading lead details...
    </div>
  );

  if (!client) return (
    <div className="card" style={{ textAlign: "center", padding: "4rem" }}>
      <p style={{ color: "var(--text-secondary)" }}>Lead not found.</p>
      <button className="btn-outline" onClick={() => navigate("clients")} style={{ marginTop: "1rem" }}>Back to Leads</button>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: "2.5rem" }}>
        <button
          onClick={() => navigate("clients")}
          style={{ background: 'none', color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          ← Back to Lead Management
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            <div style={{
              width: "72px",
              height: "72px",
              borderRadius: "20px",
              backgroundColor: "var(--accent-pastel)",
              color: "var(--accent-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.75rem",
              fontWeight: "700"
            }}>
              {(client.company || "?")[0].toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontSize: "2rem", margin: 0 }}>{client.company}</h1>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', alignItems: 'center' }}>
                <span className={`badge badge-${client.deal_stage?.toLowerCase().replace(/\s+/g, "-") || "new"}`}>{client.deal_stage}</span>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Contact: <strong>{client.name}</strong></span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button className="btn-outline" onClick={() => setEditing(!editing)}>
              {editing ? "Cancel" : "✏️ Edit Profile"}
            </button>
            <button className="btn-primary" onClick={() => navigate("log-meeting")}>
              ➕ Log Interaction
            </button>
          </div>
        </div>
      </header>

      {editing ? (
        <div className="card" style={{ marginBottom: '3rem', border: '1px solid var(--accent-primary)' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Update Lead Information</h2>
          <form onSubmit={handleUpdate}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
              <Field label="Company Name">
                <input className="btn-outline" style={inputStyle} value={form.company || ""} onChange={e => setForm({ ...form, company: e.target.value })} />
              </Field>
              <Field label="Contact Person">
                <input className="btn-outline" style={inputStyle} value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="Phone Number">
                <input className="btn-outline" style={inputStyle} value={form.phone || ""} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </Field>
              <Field label="Email Address">
                <input className="btn-outline" style={inputStyle} value={form.email || ""} onChange={e => setForm({ ...form, email: e.target.value })} />
              </Field>
              <Field label="Service Interest">
                <input className="btn-outline" style={inputStyle} value={form.service_interest || ""} onChange={e => setForm({ ...form, service_interest: e.target.value })} />
              </Field>
              <Field label="Lead Source">
                <input className="btn-outline" style={inputStyle} value={form.lead_source || ""} onChange={e => setForm({ ...form, lead_source: e.target.value })} />
              </Field>
            </div>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving Changes..." : "Save Profile Updates"}
            </button>
          </form>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr", gap: "2rem", marginBottom: "3rem" }}>
          {/* Main Info */}
          <div className="card">
            <h2 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Lead Status</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
              {STAGES.map(s => (
                <button
                  key={s}
                  onClick={() => handleStageChange(s)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    border: '1px solid var(--border-color)',
                    backgroundColor: client.deal_stage === s ? 'var(--accent-primary)' : 'transparent',
                    color: client.deal_stage === s ? 'white' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>

            <h2 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '2rem' }}>Interaction Timeline</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {meetings.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', padding: '1rem' }}>No interactions recorded yet.</p>
              ) : (
                meetings.map((m, idx) => (
                  <div key={m.id} style={{ display: 'flex', gap: '1.5rem', position: 'relative' }}>
                    {idx !== meetings.length - 1 && <div style={{ position: 'absolute', left: '7px', top: '24px', bottom: '-1.5rem', width: '2px', backgroundColor: 'var(--border-color)' }}></div>}
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', marginTop: '4px', zIndex: 1, border: '4px solid var(--bg-card)' }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{new Date(m.meeting_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>via {m.source || 'Direct'}</span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.6', backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
                        {m.summary}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar Area */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card">
              <h3 style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem' }}>Follow-up</h3>
              {client.next_follow_up_date ? (
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>
                    {new Date(client.next_follow_up_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    {client.follow_up_notes || "Scheduled follow-up."}
                  </p>
                </div>
              ) : (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No follow-up scheduled.</p>
              )}
            </div>

            <div className="card">
              <h3 style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem' }}>Metadata</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SERVICE INTEREST</p>
                  <p style={{ fontSize: '0.8rem', fontWeight: '600' }}>{client.service_interest || "N/A"}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>LEAD SOURCE</p>
                  <p style={{ fontSize: '0.8rem', fontWeight: '600' }}>{client.lead_source || "Manual Entry"}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PHONE</p>
                  <p style={{ fontSize: '0.8rem', fontWeight: '600' }}>{client.phone || "N/A"}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

const Field = ({ label, children }) => (
  <div>
    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>{label}</label>
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
