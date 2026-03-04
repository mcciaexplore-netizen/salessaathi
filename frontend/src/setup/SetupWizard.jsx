import { useState } from "react";
import Welcome       from "./steps/Welcome.jsx";
import DBPicker      from "./steps/DBPicker.jsx";
import SQLiteSetup   from "./steps/SQLiteSetup.jsx";
import PocketBaseSetup from "./steps/PocketBaseSetup.jsx";
import BusinessProfile from "./steps/BusinessProfile.jsx";
import APIKeys       from "./steps/APIKeys.jsx";
import Done          from "./steps/Done.jsx";

const STEPS = ["welcome", "db-pick", "db-config", "business", "api-keys", "done"];

function ProgressBar({ current }) {
  // don't count welcome & done in the visual bar
  const bars = ["db-pick", "db-config", "business", "api-keys"];
  const idx  = bars.indexOf(current);
  if (idx === -1) return null;
  return (
    <div style={{ display: "flex", gap: "6px", padding: "0 32px", marginBottom: "8px" }}>
      {bars.map((_, i) => (
        <div key={i} style={{
          flex: 1, height: "4px", borderRadius: "4px",
          background: i <= idx ? "#1d4ed8" : "#e2e8f0",
          transition: "background 0.3s",
        }} />
      ))}
    </div>
  );
}

export default function SetupWizard({ onComplete }) {
  const [step, setStep] = useState("welcome");
  const [state, setState] = useState({
    db_type:   "sqlite",
    db_config: {},
    business:  {},
    api_keys:  [],
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const update = (patch) => setState(s => ({ ...s, ...patch }));

  const next = (nextStep) => {
    setError("");
    setStep(nextStep);
  };

  const handleFinish = async () => {
    setSaving(true);
    setError("");
    try {
      const resp = await fetch("/api/setup/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
      const data = await resp.json();
      if (data.ok) {
        setStep("done");
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (e) {
      setError("Could not reach the backend. Make sure the SalesSaathi server is running.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #f0f7ff 0%, #f8fafc 60%, #fff 100%)",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "24px 16px",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>

      {/* Logo strip */}
      <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        marginBottom: "32px",
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: "10px",
          background: "linear-gradient(135deg, #1e3a8a, #1d4ed8)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "20px",
        }}>📋</div>
        <div>
          <div style={{
            fontFamily: "'Sora', sans-serif", fontWeight: 700,
            fontSize: "18px", color: "#0f172a", lineHeight: 1,
          }}>SalesSaathi</div>
          <div style={{ fontSize: "11px", color: "#64748b" }}>First-time setup</div>
        </div>
      </div>

      {/* Progress */}
      <div style={{ width: "100%", maxWidth: "520px", marginBottom: "4px" }}>
        <ProgressBar current={step} />
      </div>

      {/* Step card */}
      <div style={{
        width: "100%", maxWidth: "520px",
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}>
        {step === "welcome"   && <Welcome   onNext={() => next("db-pick")} />}
        {step === "db-pick"   && <DBPicker  value={state.db_type} onChange={t => update({ db_type: t })} onNext={() => next("db-config")} />}
        {step === "db-config" && state.db_type === "sqlite"     && (
          <SQLiteSetup value={state.db_config} onChange={c => update({ db_config: c })} onNext={() => next("business")} onBack={() => next("db-pick")} />
        )}
        {step === "db-config" && state.db_type === "pocketbase" && (
          <PocketBaseSetup value={state.db_config} onChange={c => update({ db_config: c })} onNext={() => next("business")} onBack={() => next("db-pick")} />
        )}
        {step === "business"  && <BusinessProfile value={state.business} onChange={b => update({ business: b })} onNext={() => next("api-keys")} onBack={() => next("db-config")} />}
        {step === "api-keys"  && <APIKeys value={state.api_keys} onChange={k => update({ api_keys: k })} onNext={handleFinish} onBack={() => next("business")} saving={saving} />}
        {step === "done"      && <Done onComplete={onComplete} />}
      </div>

      {error && (
        <div style={{
          marginTop: "16px", maxWidth: "520px", width: "100%",
          background: "#fee2e2", border: "1px solid #fca5a5",
          borderRadius: "10px", padding: "12px 16px",
          color: "#991b1b", fontSize: "13.5px",
        }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: "20px", fontSize: "12px", color: "#94a3b8" }}>
        SalesSaathi · Open Source · MIT License · MCCIA AI Studio
      </div>
    </div>
  );
}
