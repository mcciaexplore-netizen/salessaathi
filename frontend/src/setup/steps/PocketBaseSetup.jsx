import { useState } from "react";

const PB_DOWNLOAD_URL = "https://pocketbase.io/docs/";

export default function PocketBaseSetup({ value, onChange, onNext, onBack }) {
  const [pbUrl, setPbUrl] = useState(value.pb_url || "http://127.0.0.1:8090");
  const [pbEmail, setPbEmail] = useState(value.pb_email || "");
  const [pbPass, setPbPass] = useState(value.pb_password || "");
  const [phase, setPhase] = useState("guide");   // guide | connect
  const [testing, setTesting] = useState(false);
  const [tested, setTested] = useState(false);
  const [error, setError] = useState("");

  const testConnection = async () => {
    setTesting(true);
    setError("");
    try {
      const r = await fetch("/api/setup/test-db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ db_type: "pocketbase", pb_url: pbUrl, pb_email: pbEmail, pb_password: pbPass }),
      });
      const d = await r.json();
      if (d.ok) {
        setTested(true);
        onChange({ pb_url: pbUrl, pb_email: pbEmail, pb_password: pbPass });
      } else {
        setError(d.error || "Could not connect to PocketBase. Check that it's running and credentials are correct.");
      }
    } catch {
      setError("Could not reach the SalesSaathi backend server.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{ padding: "36px" }}>
      <BackBtn onClick={onBack} />
      <StepLabel>Step 2 of 4 · Team Database Setup</StepLabel>
      <h2 style={h2}>Set up PocketBase for your team</h2>

      {phase === "guide" ? (
        <>
          <p style={{ ...subtext, marginBottom: "20px" }}>
            PocketBase is a free, single-file app that acts as the team's shared database.
            It takes about 2 minutes to set up.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
            {[
              {
                n: "1",
                title: "Download PocketBase",
                desc: "Visit pocketbase.io and download the version for your operating system (Windows, Mac, or Linux). It's a single file, no installer.",
                action: <a href={PB_DOWNLOAD_URL} target="_blank" rel="noreferrer" style={linkBtn}>Download PocketBase</a>,
              },
              {
                n: "2",
                title: "Run it",
                desc: "Double-click it (Mac/Windows) or run this command in terminal:",
                code: "./pocketbase serve",
              },
              {
                n: "3",
                title: "Create your admin account",
                desc: "Open the admin panel in your browser, create an email + password. Use those below.",
                code: "http://127.0.0.1:8090/_/",
              },
            ].map((s, i) => (
              <div key={i} style={{
                border: "1px solid #e2e8f0", borderRadius: "10px",
                padding: "14px 16px", background: "#fafafa",
              }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div style={{
                    minWidth: 26, height: 26, borderRadius: "50%",
                    background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "12px", fontWeight: 700, flexShrink: 0,
                  }}>{s.n}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "14px", color: "#0f172a", marginBottom: "4px" }}>{s.title}</div>
                    <div style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6, marginBottom: s.code || s.action ? "8px" : 0 }}>{s.desc}</div>
                    {s.code && (
                      <div style={{
                        background: "#1e1e2e", borderRadius: "6px",
                        padding: "8px 12px", fontFamily: "monospace",
                        fontSize: "12px", color: "#4ade80",
                      }}>{s.code}</div>
                    )}
                    {s.action}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => setPhase("connect")} style={btnPrimary}>
            I've done this — Connect now
          </button>
        </>
      ) : (
        <>
          <p style={{ ...subtext, marginBottom: "20px" }}>
            Enter the details from the PocketBase admin panel you just set up.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
            <div>
              <label style={labelStyle}>PocketBase URL</label>
              <input value={pbUrl} onChange={e => { setPbUrl(e.target.value); setTested(false); }} style={inputStyle} placeholder="http://127.0.0.1:8090" />
              <div style={hint}>Leave as-is if PocketBase is running on this same computer.</div>
            </div>
            <div>
              <label style={labelStyle}>Admin Email</label>
              <input type="email" value={pbEmail} onChange={e => { setPbEmail(e.target.value); setTested(false); }} style={inputStyle} placeholder="admin@yourcompany.com" />
            </div>
            <div>
              <label style={labelStyle}>Admin Password</label>
              <input type="password" value={pbPass} onChange={e => { setPbPass(e.target.value); setTested(false); }} style={inputStyle} placeholder="••••••••" />
            </div>
          </div>

          {error && <ErrorBox msg={error} />}

          {tested ? (
            <>
              <SuccessBox msg="Connected successfully" />
              <button onClick={onNext} style={btnPrimary}>Continue</button>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button onClick={testConnection} disabled={testing} style={btnPrimary}>
                {testing ? "Connecting…" : "Test connection & Continue"}
              </button>
              <button onClick={() => setPhase("guide")} style={btnSecondary}>Back to guide</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const BackBtn = ({ onClick }) => (
  <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: "13px", padding: "0 0 16px", display: "flex", alignItems: "center", gap: "4px" }}>Back</button>
);
const StepLabel = ({ children }) => (
  <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#3b82f6", fontWeight: 600, marginBottom: "6px" }}>{children}</div>
);
const SuccessBox = ({ msg }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", color: "#166534", fontSize: "13.5px", fontWeight: 600 }}>{msg}</div>
);
const ErrorBox = ({ msg }) => (
  <div style={{ background: "#fee2e2", borderRadius: "8px", padding: "12px 14px", marginBottom: "16px", color: "#991b1b", fontSize: "13px" }}>{msg}</div>
);

const h2 = { fontFamily: "'Sora', sans-serif", fontSize: "20px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" };
const subtext = { fontSize: "13.5px", color: "#64748b", lineHeight: 1.6 };
const labelStyle = { display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" };
const inputStyle = { width: "100%", padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13.5px", color: "#1e293b", outline: "none" };
const hint = { fontSize: "12px", color: "#94a3b8", marginTop: "5px" };
const btnPrimary = { width: "100%", padding: "14px", background: "#1d4ed8", color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 600, cursor: "pointer" };
const btnSecondary = { width: "100%", padding: "12px", background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "14px", fontWeight: 500, cursor: "pointer" };
const linkBtn = { display: "inline-block", background: "#eff6ff", color: "#1d4ed8", padding: "6px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: 600, textDecoration: "none" };
