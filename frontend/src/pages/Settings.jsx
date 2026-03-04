import { useEffect, useState } from "react";

const PROVIDERS = [
  { id: "gemini", name: "Google Gemini", icon: "🔷", getKeyUrl: "https://aistudio.google.com/app/apikey", desc: "Free · Vision support · Recommended" },
  { id: "groq",   name: "Groq",          icon: "⚡",  getKeyUrl: "https://console.groq.com/keys",         desc: "Free · Very fast · Text only" },
  { id: "openai", name: "OpenAI",        icon: "🟢",  getKeyUrl: "https://platform.openai.com/api-keys",  desc: "Paid · GPT-4" },
];

export default function Settings() {
  const [keys,     setKeys]     = useState([]);
  const [business, setBusiness] = useState({});
  const [newKey,   setNewKey]   = useState({ provider: "gemini", key: "", label: "" });
  const [adding,   setAdding]   = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [bizForm,  setBizForm]  = useState(null);   // null = not editing
  const [tab,      setTab]      = useState("keys"); // keys | business

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
    <div style={{ padding: "32px", maxWidth: "680px" }}>
      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "22px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>Settings</h1>
      <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "24px" }}>Manage your API keys, business profile and preferences.</p>

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", background: "#f1f5f9", borderRadius: "10px", padding: "4px" }}>
        {[["keys","🔑 API Keys"],["business","🏢 Business Profile"]].map(([t,l]) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "9px", borderRadius: "7px", border: "none", cursor: "pointer",
            background: tab === t ? "#fff" : "transparent",
            color: tab === t ? "#1e293b" : "#64748b",
            fontWeight: tab === t ? 600 : 400, fontSize: "13.5px",
            boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
          }}>{l}</button>
        ))}
      </div>

      {tab === "keys" && (
        <>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
            <strong style={{ fontFamily: "'Sora', sans-serif", fontSize: "15px", color: "#1e293b" }}>Your API Keys</strong>
            <p style={{ color: "#64748b", fontSize: "13px", margin: "6px 0 16px" }}>
              Keys are stored locally in your database. They are never sent anywhere except the respective AI provider.
            </p>

            {keys.length === 0 ? (
              <div style={{ color: "#94a3b8", fontSize: "13.5px", padding: "12px 0" }}>No keys added yet.</div>
            ) : (
              keys.map(k => {
                const p = PROVIDERS.find(p => p.id === k.provider) || {};
                return (
                  <div key={k.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <span style={{ fontSize: "20px" }}>{p.icon || "🔑"}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "13.5px", color: "#1e293b" }}>{p.name || k.provider}{k.label ? ` · ${k.label}` : ""}</div>
                        <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#94a3b8" }}>{k.key_value}</div>
                      </div>
                    </div>
                    <button onClick={() => deleteKey(k.id)} style={{ background: "#fee2e2", border: "none", borderRadius: "6px", padding: "5px 10px", color: "#991b1b", fontSize: "12px", cursor: "pointer" }}>Remove</button>
                  </div>
                );
              })
            )}
          </div>

          {/* Add key */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
            <strong style={{ fontFamily: "'Sora', sans-serif", fontSize: "15px", color: "#1e293b" }}>Add a New Key</strong>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
              <div style={{ display: "flex", gap: "10px" }}>
                <select value={newKey.provider} onChange={e => setNewKey(k => ({...k, provider: e.target.value}))} style={inpSt}>
                  {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.icon} {p.name}</option>)}
                </select>
                <input value={newKey.label} onChange={e => setNewKey(k => ({...k, label: e.target.value}))} placeholder='Label (e.g. "Key 1")' style={inpSt} />
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <input type="password" value={newKey.key} onChange={e => setNewKey(k => ({...k, key: e.target.value}))} placeholder="Paste API key here" style={{ ...inpSt, flex: 1, fontFamily: "monospace" }} />
                <a href={PROVIDERS.find(p => p.id === newKey.provider)?.getKeyUrl} target="_blank" rel="noreferrer"
                  style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "9px 12px", fontSize: "12px", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
                  Get free key →
                </a>
              </div>
              <button onClick={addKey} disabled={adding || !newKey.key.trim()} style={{ padding: "11px", background: "#1d4ed8", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                {adding ? "Adding…" : "Add Key"}
              </button>
            </div>
          </div>
        </>
      )}

      {tab === "business" && (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <strong style={{ fontFamily: "'Sora', sans-serif", fontSize: "15px", color: "#1e293b" }}>Business Profile</strong>
            {!bizForm && <button onClick={() => setBizForm({...business})} style={{ background: "#eff6ff", color: "#1d4ed8", border: "none", borderRadius: "6px", padding: "6px 12px", fontSize: "13px", cursor: "pointer" }}>✏️ Edit</button>}
          </div>

          {bizForm ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                {[["name","Business Name"],["owner_name","Your Name"],["phone","Phone"],["email","Email"],["city","City"],["industry","Industry"]].map(([k,l]) => (
                  <div key={k}>
                    <label style={labelSt}>{l}</label>
                    <input value={bizForm[k] || ""} onChange={e => setBizForm(f => ({...f,[k]:e.target.value}))} style={inpSt} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={saveBusiness} disabled={saving} style={{ padding: "10px 20px", background: "#1d4ed8", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13.5px", fontWeight: 600, cursor: "pointer" }}>
                  {saving ? "Saving…" : "Save"}
                </button>
                <button onClick={() => setBizForm(null)} style={{ padding: "10px 16px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", color: "#475569", fontSize: "13px" }}>Cancel</button>
              </div>
            </>
          ) : (
            <div style={{ display: "grid", gap: "8px" }}>
              {[["🏢", "Business", business.name], ["👤", "Owner", business.owner_name], ["🏭", "Industry", business.industry], ["📍", "City", business.city], ["📞", "Phone", business.phone], ["📧", "Email", business.email]].map(([icon, label, val]) => val ? (
                <div key={label} style={{ display: "flex", gap: "10px", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <span>{icon}</span>
                  <div>
                    <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                    <div style={{ fontSize: "14px", color: "#1e293b" }}>{val}</div>
                  </div>
                </div>
              ) : null)}
            </div>
          )}
        </div>
      )}

      {/* Version info */}
      <div style={{ marginTop: "24px", padding: "16px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
        <div style={{ fontSize: "12px", color: "#94a3b8" }}>
          SalesSaathi · Phase 1 · Open Source (MIT) · MCCIA AI Studio<br />
          DB: {localStorage.getItem("db_type") || "SQLite"} · <a href="https://github.com/mccia-ai-studio/salessaathi" target="_blank" rel="noreferrer" style={{ color: "#3b82f6" }}>GitHub</a>
        </div>
      </div>
    </div>
  );
}

const inpSt   = { width: "100%", padding: "9px 11px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13.5px", color: "#1e293b", outline: "none", boxSizing: "border-box", background: "#fff" };
const labelSt = { display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "5px" };
