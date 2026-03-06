import { useState } from "react";

const PROVIDERS = [
  {
    id: "gemini",
    name: "Google Gemini",
    icon: "",
    free: "15 requests/min free — no credit card",
    getKeyUrl: "https://aistudio.google.com/app/apikey",
    recommended: true,
  },
  {
    id: "groq",
    name: "Groq",
    icon: "",
    free: "Free tier — extremely fast responses",
    getKeyUrl: "https://console.groq.com/keys",
  },
  {
    id: "openai",
    name: "OpenAI (GPT-4)",
    icon: "",
    free: "Paid — $5 free credits for new accounts",
    getKeyUrl: "https://platform.openai.com/api-keys",
  },
];

export default function APIKeys({ value, onChange, onNext, onBack, saving }) {
  const [keys, setKeys] = useState(
    value.length > 0 ? value : [{ provider: "gemini", key: "", label: "" }]
  );
  const [error, setError] = useState("");

  const updateKey = (idx, field, val) => {
    const next = keys.map((k, i) => i === idx ? { ...k, [field]: val } : k);
    setKeys(next);
    onChange(next);
  };

  const addKey = () => {
    const next = [...keys, { provider: "gemini", key: "", label: "" }];
    setKeys(next);
    onChange(next);
  };

  const removeKey = (idx) => {
    const next = keys.filter((_, i) => i !== idx);
    setKeys(next);
    onChange(next);
  };

  const handleNext = () => {
    // At least one key with an actual value
    const filled = keys.filter(k => k.key.trim());
    if (filled.length === 0) {
      setError("Please add at least one API key to continue.");
      return;
    }
    setError("");
    onChange(filled);
    onNext();
  };

  const handleSkip = () => {
    onChange([]);
    onNext();
  };

  return (
    <div style={{ padding: "36px" }}>
      <BackBtn onClick={onBack} />
      <StepLabel>Step 4 of 4 · AI Setup</StepLabel>
      <h2 style={h2}>Add a free AI key</h2>
      <p style={{ ...subtext, marginBottom: "8px" }}>
        SalesSaathi uses AI to read your handwritten notes. You need one free API key.
        <strong style={{ color: "#1e293b" }}> Gemini is recommended</strong> — free, no credit card required.
      </p>

      {/* Quick provider cards */}
      <div style={{ display: "flex", gap: "8px", margin: "16px 0 20px" }}>
        {PROVIDERS.map(p => (
          <div key={p.id} style={{
            flex: 1, borderRadius: "8px", border: "1px solid #e2e8f0",
            padding: "10px", background: "#fafafa", textAlign: "center",
          }}>
            <div style={{ fontSize: "18px" }}>{p.icon}</div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#1e293b", marginTop: "4px" }}>{p.name}</div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{p.free}</div>
            {p.recommended && (
              <div style={{ fontSize: "10px", background: "#d1fae5", color: "#065f46", borderRadius: "4px", padding: "2px 6px", marginTop: "6px", display: "inline-block", fontWeight: 600 }}>
                Recommended
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Key rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
        {keys.map((k, idx) => {
          const prov = PROVIDERS.find(p => p.id === k.provider) || PROVIDERS[0];
          return (
            <div key={idx} style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px" }}>
              <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <select
                  value={k.provider}
                  onChange={e => updateKey(idx, "provider", e.target.value)}
                  style={{ ...inputStyle, flex: "0 0 140px" }}
                >
                  {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input
                  value={k.label}
                  onChange={e => updateKey(idx, "label", e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder={`Label (e.g. "My key 1")`}
                />
                {keys.length > 1 && (
                  <button onClick={() => removeKey(idx)} style={{
                    background: "#fee2e2", border: "none", borderRadius: "8px",
                    width: "36px", cursor: "pointer", color: "#991b1b", fontSize: "14px",
                  }}>Remove</button>
                )}
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  type="password"
                  value={k.key}
                  onChange={e => updateKey(idx, "key", e.target.value)}
                  style={{ ...inputStyle, flex: 1, fontFamily: "monospace" }}
                  placeholder="Paste your API key here"
                />
                <a href={prov.getKeyUrl} target="_blank" rel="noreferrer" style={{
                  background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe",
                  borderRadius: "8px", padding: "9px 12px", fontSize: "12px",
                  fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap",
                }}>
                  Get key
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={addKey} style={btnSecondary}>
        + Add another key
      </button>

      <div style={{ height: "16px" }} />

      {error && <ErrorBox msg={error} />}

      <button onClick={handleNext} disabled={saving} style={{ ...btnPrimary, marginBottom: "8px" }}>
        {saving ? "Saving setup…" : "Finish setup"}
      </button>
      <button onClick={handleSkip} style={btnLink}>
        Skip for now — I'll add a key later
      </button>
    </div >
  );
}

const BackBtn = ({ onClick }) => <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: "13px", padding: "0 0 16px", display: "flex", alignItems: "center", gap: "4px" }}>Back</button>;
const StepLabel = ({ children }) => <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#3b82f6", fontWeight: 600, marginBottom: "6px" }}>{children}</div>;
const ErrorBox = ({ msg }) => <div style={{ background: "#fee2e2", borderRadius: "8px", padding: "12px 14px", marginBottom: "16px", color: "#991b1b", fontSize: "13px" }}>{msg}</div>;

const h2 = { fontFamily: "'Sora', sans-serif", fontSize: "20px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" };
const subtext = { fontSize: "13.5px", color: "#64748b", lineHeight: 1.6 };
const inputStyle = { width: "100%", padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13.5px", color: "#1e293b", outline: "none", background: "#fff" };
const btnPrimary = { width: "100%", padding: "14px", background: "#1d4ed8", color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 600, cursor: "pointer" };
const btnSecondary = { width: "100%", padding: "11px", background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "14px", fontWeight: 500, cursor: "pointer" };
const btnLink = { width: "100%", padding: "10px", background: "none", color: "#64748b", border: "none", cursor: "pointer", fontSize: "13px" };
