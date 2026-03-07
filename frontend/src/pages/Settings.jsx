import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";

const PROVIDERS = [
  { id: "gemini", name: "Google Gemini", getKeyUrl: "https://aistudio.google.com/app/apikey" },
  { id: "groq", name: "Groq", getKeyUrl: "https://console.groq.com/keys" },
  { id: "openai", name: "OpenAI", getKeyUrl: "https://platform.openai.com/api-keys" },
];

export default function Settings() {
  const { user } = useAuth();
  const [keys, setKeys] = useState([]);
  const [business, setBusiness] = useState({});
  const [tab, setTab] = useState("profile"); // profile | keys | business
  const [loading, setLoading] = useState(false);
  const [newKey, setNewKey] = useState({ provider: "gemini", key: "", label: "" });

  useEffect(() => {
    api.settings.getKeys().then(setKeys);
    api.settings.getBusiness().then(setBusiness);
  }, []);

  const handleAddKey = async (e) => {
    e.preventDefault();
    if (!newKey.key) return;
    setLoading(true);
    try {
      const res = await api.settings.addKey(newKey);
      setKeys([...keys, res]);
      setNewKey({ provider: "gemini", key: "", label: "" });
    } catch (err) {
      alert("Failed to add key");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKey = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.settings.deleteKey(id);
      setKeys(keys.filter(k => k.id !== id));
    } catch (err) {
      alert("Failed to delete key");
    }
  };

  const handleSaveBusiness = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.settings.saveBusiness(business);
      setBusiness(res);
      alert("Business profile updated!");
    } catch (err) {
      alert("Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "1.85rem", marginBottom: "0.5rem" }}>Settings</h1>
        <p style={{ color: "var(--text-secondary)" }}>Manage your account, business profile, and system preferences.</p>
      </header>

      <div style={{ display: "flex", gap: "2rem" }}>
        {/* Settings Navigation */}
        <aside style={{ width: "240px" }}>
          <div className="card" style={{ padding: "0.5rem" }}>
            {[
              { id: "profile", label: "User Profile", icon: "👤" },
              { id: "business", label: "Business Profile", icon: "🏢" },
              { id: "keys", label: "API Keys", icon: "🔑" },
              { id: "preferences", label: "Preferences", icon: "⚙️" },
            ].map(item => (
              <div
                key={item.id}
                onClick={() => setTab(item.id)}
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                  backgroundColor: tab === item.id ? "var(--accent-pastel)" : "transparent",
                  color: tab === item.id ? "var(--accent-primary)" : "var(--text-secondary)",
                  fontWeight: tab === item.id ? "600" : "400",
                  marginBottom: "4px",
                  fontSize: "0.9rem"
                }}
              >
                <span style={{ marginRight: "10px" }}>{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        </aside>

        {/* Settings Content */}
        <div style={{ flex: 1 }}>
          <div className="card">
            {tab === "profile" && (
              <div>
                <h2 style={{ fontSize: "1.25rem", marginBottom: "1.5rem" }}>User Profile</h2>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "2rem", padding: "1.5rem", backgroundColor: "var(--bg-secondary)", borderRadius: "12px" }}>
                  <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "var(--accent-primary)", color: "white", display: "flex", alignItems: "center", justifyCenter: "center", fontSize: "1.5rem", fontWeight: "700", marginRight: "1.5rem", justifyContent: 'center' }}>
                    {user?.full_name?.charAt(0) || user?.username?.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.1rem" }}>{user?.full_name || user?.username}</h3>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{user?.email || "No email set"}</p>
                    <span className="badge badge-converted" style={{ marginTop: "8px", display: "inline-block" }}>MCCIA Staff</span>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                  <div>
                    <label style={labelStyle}>Full Name</label>
                    <input type="text" className="btn-outline" style={inputStyle} value={user?.full_name || ""} readOnly />
                  </div>
                  <div>
                    <label style={labelStyle}>Username</label>
                    <input type="text" className="btn-outline" style={inputStyle} value={user?.username || ""} readOnly />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Email Address</label>
                    <input type="email" className="btn-outline" style={inputStyle} value={user?.email || ""} readOnly />
                  </div>
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "1rem" }}>
                  Profile information is managed by the system administrator.
                </p>
              </div>
            )}

            {tab === "business" && (
              <form onSubmit={handleSaveBusiness}>
                <h2 style={{ fontSize: "1.25rem", marginBottom: "1.5rem" }}>Business Profile</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
                  <div>
                    <label style={labelStyle}>Organization Name</label>
                    <input type="text" className="btn-outline" style={inputStyle} value={business.name || ""} onChange={e => setBusiness({ ...business, name: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>Industry</label>
                    <input type="text" className="btn-outline" style={inputStyle} value={business.industry || ""} onChange={e => setBusiness({ ...business, industry: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input type="text" className="btn-outline" style={inputStyle} value={business.phone || ""} onChange={e => setBusiness({ ...business, phone: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>Official Email</label>
                    <input type="email" className="btn-outline" style={inputStyle} value={business.email || ""} onChange={e => setBusiness({ ...business, email: e.target.value })} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Address / City</label>
                    <input type="text" className="btn-outline" style={inputStyle} value={business.city || ""} onChange={e => setBusiness({ ...business, city: e.target.value })} />
                  </div>
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? "Saving..." : "Save Business Profile"}
                </button>
              </form>
            )}

            {tab === "keys" && (
              <div>
                <h2 style={{ fontSize: "1.25rem", marginBottom: "1.5rem" }}>External API Keys</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "2rem" }}>
                  These keys are used for AI text extraction and lead enrichment features.
                </p>

                <div style={{ marginBottom: "3rem" }}>
                  <h3 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Active Keys</h3>
                  {keys.length === 0 ? (
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No API keys added yet.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      {keys.map(k => (
                        <div key={k.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
                          <div>
                            <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>{k.provider.toUpperCase()} <span style={{ fontWeight: "400", color: "var(--text-secondary)" }}>{k.label ? `· ${k.label}` : ""}</span></div>
                            <div style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "var(--text-muted)", marginTop: "4px" }}>{k.key_value}</div>
                          </div>
                          <button onClick={() => handleDeleteKey(k.id)} style={{ color: "#ef4444", background: "none", fontSize: "0.8rem", fontWeight: "600" }}>Remove</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <form onSubmit={handleAddKey}>
                  <h3 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Add New Key</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                      <label style={labelStyle}>Provider</label>
                      <select className="btn-outline" style={inputStyle} value={newKey.provider} onChange={e => setNewKey({ ...newKey, provider: e.target.value })}>
                        {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Label (Internal)</label>
                      <input type="text" className="btn-outline" style={inputStyle} value={newKey.label} placeholder="e.g. My Gemini Key" onChange={e => setNewKey({ ...newKey, label: e.target.value })} />
                    </div>
                  </div>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={labelStyle}>Private Key</label>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <input type="password" className="btn-outline" style={{ ...inputStyle, flex: 1 }} value={newKey.key} placeholder="Enter your secret key" onChange={e => setNewKey({ ...newKey, key: e.target.value })} />
                      <a href={PROVIDERS.find(p => p.id === newKey.provider)?.getKeyUrl} target="_blank" rel="noreferrer" className="btn-outline" style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem' }}>Get Key</a>
                    </div>
                  </div>
                  <button type="submit" className="btn-primary" disabled={loading || !newKey.key}>Add API Key</button>
                </form>
              </div>
            )}

            {tab === "preferences" && (
              <div>
                <h2 style={{ fontSize: "1.25rem", marginBottom: "1.5rem" }}>System Preferences</h2>

                <div style={{ marginBottom: "2rem" }}>
                  <h3 style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>Theme Appearance</h3>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <div style={{ border: "2px solid var(--accent-primary)", padding: "1rem", borderRadius: "12px", textAlign: "center", cursor: "pointer", flex: 1, backgroundColor: "var(--bg-primary)" }}>
                      <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>☀️</div>
                      <div style={{ fontSize: "0.85rem", fontWeight: "600" }}>Minimal Light</div>
                    </div>
                    <div style={{ border: "1px solid var(--border-color)", padding: "1rem", borderRadius: "12px", textAlign: "center", cursor: "pointer", flex: 1, color: "var(--text-muted)" }}>
                      <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🌙</div>
                      <div style={{ fontSize: "0.85rem" }}>Modern Dark</div>
                      <div style={{ fontSize: "0.6rem" }}>(Coming Soon)</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '10px' }}>
                    <div>
                      <p style={{ fontWeight: '500', fontSize: '0.9rem' }}>Email Notifications</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Receive daily follow-up reminders via email</p>
                    </div>
                    <div style={{ width: '40px', height: '20px', borderRadius: '10px', backgroundColor: 'var(--accent-primary)', position: 'relative' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'white', position: 'absolute', right: '2px', top: '2px' }}></div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '10px' }}>
                    <div>
                      <p style={{ fontWeight: '500', fontSize: '0.9rem' }}>Lead Auto-Correction</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Automatically clean lead data using AI</p>
                    </div>
                    <div style={{ width: '40px', height: '20px', borderRadius: '10px', backgroundColor: 'var(--border-color)', position: 'relative' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'white', position: 'absolute', left: '2px', top: '2px' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: "600",
  color: "var(--text-secondary)",
  marginBottom: "0.5rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const inputStyle = {
  width: "100%",
  padding: "0.75rem",
  fontSize: "0.9rem",
  fontFamily: "inherit",
  textAlign: 'left'
};
