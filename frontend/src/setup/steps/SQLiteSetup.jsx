import { useState } from "react";

export default function SQLiteSetup({ value, onChange, onNext, onBack }) {
  const defaultPath = "./data/salessaathi.db";
  const [path, setPath] = useState(value.sqlite_path || defaultPath);
  const [testing, setTesting] = useState(false);
  const [tested,  setTested]  = useState(false);
  const [error,   setError]   = useState("");

  const testConnection = async () => {
    setTesting(true);
    setError("");
    try {
      const r = await fetch("/api/setup/test-db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ db_type: "sqlite", sqlite_path: path }),
      });
      const d = await r.json();
      if (d.ok) {
        setTested(true);
        onChange({ sqlite_path: path });
      } else {
        setError(d.error || "Could not create the database file.");
      }
    } catch {
      setError("Could not reach the backend server.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{ padding: "36px" }}>
      <BackBtn onClick={onBack} />
      <StepLabel>Step 2 of 4 · Local Storage Setup</StepLabel>
      <h2 style={h2}>Where should the database file go?</h2>
      <p style={subtext}>
        The database is a single file on your computer — like a spreadsheet, but faster.
        The default location works for most people. Just leave it as-is.
      </p>

      <div style={{ margin: "24px 0" }}>
        <label style={labelStyle}>Database file path</label>
        <input
          value={path}
          onChange={e => { setPath(e.target.value); setTested(false); }}
          style={inputStyle}
          placeholder={defaultPath}
        />
        <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px" }}>
          Relative to the SalesSaathi folder. The folder will be created automatically.
        </div>
      </div>

      <div style={{
        background: "#f0f9ff", borderRadius: "10px",
        padding: "14px 16px", marginBottom: "24px",
        border: "1px solid #bae6fd",
      }}>
        <div style={{ fontSize: "13px", color: "#0369a1", lineHeight: 1.7 }}>
          <strong>💾 What is SQLite?</strong><br />
          SQLite stores all your data in a single file (like a super-powered Excel file).
          It's used by WhatsApp, Firefox, and millions of apps. Completely free, no separate software needed.
        </div>
      </div>

      {error && <ErrorBox msg={error} />}

      {tested ? (
        <>
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "#f0fdf4", border: "1px solid #86efac",
            borderRadius: "10px", padding: "12px 16px", marginBottom: "16px",
            color: "#166534", fontSize: "13.5px", fontWeight: 600,
          }}>
            ✅ Database is ready
          </div>
          <button onClick={onNext} style={btnPrimary}>Continue →</button>
        </>
      ) : (
        <button onClick={testConnection} disabled={testing} style={btnPrimary}>
          {testing ? "Testing…" : "Test & Continue →"}
        </button>
      )}
    </div>
  );
}

const BackBtn = ({ onClick }) => (
  <button onClick={onClick} style={{
    background: "none", border: "none", cursor: "pointer",
    color: "#64748b", fontSize: "13px", padding: "0 0 16px", display: "flex", alignItems: "center", gap: "4px",
  }}>← Back</button>
);

const StepLabel = ({ children }) => (
  <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#3b82f6", fontWeight: 600, marginBottom: "6px" }}>
    {children}
  </div>
);
const ErrorBox = ({ msg }) => (
  <div style={{ background: "#fee2e2", borderRadius: "8px", padding: "12px 14px", marginBottom: "16px", color: "#991b1b", fontSize: "13px" }}>
    {msg}
  </div>
);

const h2        = { fontFamily: "'Sora', sans-serif", fontSize: "20px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" };
const subtext   = { fontSize: "13.5px", color: "#64748b", lineHeight: 1.6 };
const labelStyle = { display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" };
const inputStyle = {
  width: "100%", padding: "10px 12px",
  border: "1.5px solid #e2e8f0", borderRadius: "8px",
  fontSize: "13.5px", fontFamily: "monospace", color: "#1e293b", outline: "none",
};
const btnPrimary = {
  width: "100%", padding: "14px",
  background: "#1d4ed8", color: "#fff",
  border: "none", borderRadius: "10px",
  fontSize: "15px", fontWeight: 600, cursor: "pointer",
};
