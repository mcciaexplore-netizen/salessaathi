import { useEffect, useState } from "react";

const PROVIDERS = [
  { id: "gemini", name: "Google Gemini", icon: "", getKeyUrl: "https://aistudio.google.com/app/apikey", desc: "Free · Vision support · Recommended" },
  { id: "groq", name: "Groq", icon: "", getKeyUrl: "https://console.groq.com/keys", desc: "Free · Very fast · Text only" },
  { id: "openai", name: "OpenAI", icon: "", getKeyUrl: "https://platform.openai.com/api-keys", desc: "Paid · GPT-4" },
];

export default function Settings() {
  const [keys, setKeys] = useState([]);
  const [business, setBusiness] = useState({});
  const [newKey, setNewKey] = useState({ provider: "gemini", key: "", label: "" });
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bizForm, setBizForm] = useState(null);   // null = not editing
  const [tab, setTab] = useState("keys"); // keys | business

  useEffect(() => {
    fetch("/api/keys").then(r => r.json()).then(setKeys);
    fetch("/api/business").then(r => r.json()).then(b => { setBusiness(b); });
  }, []);

  const addKey = async () => {
    if (!newKey.key.trim()) return;
    setAdding(true);
    const k = await fetch("/api/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newKey),
    }).then(r => r.json());
    setKeys(ks => [...ks, k]);
    setNewKey({ provider: "gemini", key: "", label: "" });
    setAdding(false);
  };

  const deleteKey = async (id) => {
    await fetch(`/api/keys/${id}`, { method: "DELETE" });
    setKeys(ks => ks.filter(k => k.id !== id));
  };

  const saveBusiness = async () => {
    setSaving(true);
    const updated = await fetch("/api/business", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bizForm),
    }).then(r => r.json());
    setBusiness(updated);
    setBizForm(null);
    setSaving(false);
  };

  return (
    <div style={{ padding: "48px 40px", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>Settings</h1>
      <p style={{ color: "var(--text-muted)", fontSize: "16px", marginBottom: "40px" }}>Manage your API keys and business profile.</p>

      {/* Tab switcher */}
      <div className="glass-card" style={{ display: "flex", gap: "4px", padding: "4px", marginBottom: "40px", borderRadius: "14px" }}>
        {[["keys", "API Keys"], ["business", "Business Profile"]].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "12px", borderRadius: "10px", border: "none", cursor: "pointer",
            background: tab === t ? "var(--accent-blue)" : "transparent",
            color: tab === t ? "#fff" : "var(--text-secondary)",
            fontWeight: 600, fontSize: "14px",
            transition: "all 0.2s ease",
          }}>{l}</button>
        ))}
      </div>

      {tab === "keys" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="glass-card" style={{ padding: "32px" }}>
            <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>Your API Keys</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px" }}>
              Keys are only sent to the AI providers. We never share them.
            </p>

            {keys.length === 0 ? (
              <div style={{ color: "var(--text-muted)", fontSize: "14px", padding: "12px 0", fontStyle: "italic" }}>No keys added yet.</div>
            ) : (
              keys.map(k => {
                const p = PROVIDERS.find(p => p.id === k.provider) || {};
                return (
                  <div key={k.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid var(--border-glass)" }}>
                    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                      <div style={{ width: "24px", height: "24px", background: "var(--secondary-pastel)", borderRadius: "6px" }}></div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "15px", color: "var(--text-primary)" }}>{p.name || k.provider}{k.label ? ` · ${k.label}` : ""}</div>
                        <div style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>{k.key_value}</div>
                      </div>
                    </div>
                    <button onClick={() => deleteKey(k.id)} style={{ color: "#ef4444", fontSize: "13px", fontWeight: 600 }}>Remove</button>
                  </div>
                );
              })
            )}
          </div>

          {/* Add key */}
          <div className="glass-card" style={{ padding: "32px" }}>
            <h3 style={{ fontSize: "18px", marginBottom: "24px" }}>Add a New Key</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelSt}>Provider</label>
                  <select value={newKey.provider} onChange={e => setNewKey(k => ({ ...k, provider: e.target.value }))} className="glass-card" style={{ ...inpSt, padding: "12px" }}>
                    {PROVIDERS.map(p => <option key={p.id} value={p.id} style={{ background: "#1a1a1a" }}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelSt}>Label (Optional)</label>
                  <input value={newKey.label} onChange={e => setNewKey(k => ({ ...k, label: e.target.value }))} placeholder='e.g. "Main Key"' className="glass-card" style={inpSt} />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={labelSt}>API Key</label>
                <div style={{ display: "flex", gap: "12px" }}>
                  <input type="password" value={newKey.key} onChange={e => setNewKey(k => ({ ...k, key: e.target.value }))} placeholder="Paste your secret key here" className="glass-card" style={{ ...inpSt, flex: 1, fontFamily: "monospace" }} />
                  <a href={PROVIDERS.find(p => p.id === newKey.provider)?.getKeyUrl} target="_blank" rel="noreferrer"
                    className="btn-secondary" style={{ display: "flex", alignItems: "center", textDecoration: "none", fontSize: "13px" }}>
                    Get Key
                  </a>
                </div>
              </div>
              <button onClick={addKey} disabled={adding || !newKey.key.trim()} className="btn-primary" style={{ padding: "14px", marginTop: "8px" }}>
                {adding ? "Saving..." : "Save API Key"}
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "business" && (
        <div className="glass-card" style={{ padding: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
            <h3 style={{ fontSize: "18px", margin: 0 }}>Business Profile</h3>
            {!bizForm && <button onClick={() => setBizForm({ ...business })} className="btn-secondary" style={{ padding: "8px 16px", fontSize: "13px" }}>Edit Profile</button>}
          </div>

          {bizForm ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                {[["name", "Business Name"], ["owner_name", "Your Name"], ["phone", "Phone Number"], ["email", "Email Address"], ["city", "City"], ["industry", "Industry Type"]].map(([k, l]) => (
                  <div key={k}>
                    <label style={labelSt}>{l}</label>
                    <input value={bizForm[k] || ""} onChange={e => setBizForm(f => ({ ...f, [k]: e.target.value }))} className="glass-card" style={inpSt} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button onClick={saveBusiness} disabled={saving} className="btn-primary" style={{ flex: 1 }}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button onClick={() => setBizForm(null)} className="btn-secondary" style={{ flex: 0.5 }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px" }}>
              {[["", "Business", business.name], ["", "Owner", business.owner_name], ["", "Industry", business.industry], ["", "City", business.city], ["", "Phone", business.phone], ["", "Email", business.email]].map(([icon, label, val]) => val ? (
                <div key={label} style={{ paddingBottom: "16px", borderBottom: "1px solid var(--border-glass)" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                    {label}
                  </div>
                  <div style={{ fontSize: "16px", color: "var(--text-primary)", fontWeight: 500 }}>{val}</div>
                </div>
              ) : null)}
            </div>
          )}
        </div>
      )}

      {/* Version info info */}
      <div style={{ marginTop: "48px", textAlign: "center" }}>
        <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.8 }}>
          SalesSaathi v1.0.0 · MIT Licensed · Open Source<br />
          Built by MCCIA AI Studio · <a href="https://github.com/mccia-ai-studio/salessaathi" target="_blank" rel="noreferrer" style={{ color: "var(--accent-blue)" }}>Source Code on GitHub</a>
        </div>
      </div>
    </div>
  );
}

const inpSt = { width: "100%", padding: "14px", fontSize: "15px", color: "var(--text-primary)", outline: "none", boxSizing: "border-box" };
const labelSt = { display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" };
