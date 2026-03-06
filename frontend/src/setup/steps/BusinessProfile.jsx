import { useState } from "react";

const INDUSTRIES = [
  "Manufacturing", "Trading / Distribution", "Retail",
  "Services", "Construction", "Food & Beverage", "Textile",
  "Engineering", "Auto & Vehicles", "Healthcare", "IT / Software", "Other",
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi (हिंदी)" },
  { value: "mr", label: "Marathi (मराठी)" },
];

export default function BusinessProfile({ value, onChange, onNext, onBack }) {
  const [form, setForm] = useState({
    name: value.name || "",
    owner_name: value.owner_name || "",
    industry: value.industry || "",
    phone: value.phone || "",
    email: value.email || "",
    city: value.city || "",
    language: value.language || "en",
  });
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleNext = () => {
    if (!form.name.trim()) {
      setError("Please enter your business name.");
      return;
    }
    if (!form.owner_name.trim()) {
      setError("Please enter your name.");
      return;
    }
    setError("");
    onChange(form);
    onNext();
  };

  return (
    <div style={{ padding: "36px" }}>
      <BackBtn onClick={onBack} />
      <StepLabel>Step 3 of 4 · Business Details</StepLabel>
      <h2 style={h2}>Tell us about your business</h2>
      <p style={{ ...subtext, marginBottom: "24px" }}>
        This appears on emails and meeting summaries sent to your clients.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" }}>
        <Field label="Business / Company name *" required>
          <input value={form.name} onChange={e => set("name", e.target.value)} style={inputStyle} placeholder="e.g. Patil Engineering Works" />
        </Field>

        <Field label="Your name *" required>
          <input value={form.owner_name} onChange={e => set("owner_name", e.target.value)} style={inputStyle} placeholder="e.g. Ramesh Patil" />
        </Field>

        <Field label="Industry">
          <select value={form.industry} onChange={e => set("industry", e.target.value)} style={inputStyle}>
            <option value="">Select your industry</option>
            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <Field label="Phone">
            <input value={form.phone} onChange={e => set("phone", e.target.value)} style={inputStyle} placeholder="98XXXXXXXX" />
          </Field>
          <Field label="City">
            <input value={form.city} onChange={e => set("city", e.target.value)} style={inputStyle} placeholder="e.g. Pune" />
          </Field>
        </div>

        <Field label="Business email (optional)">
          <input type="email" value={form.email} onChange={e => set("email", e.target.value)} style={inputStyle} placeholder="sales@yourcompany.com" />
        </Field>

        <Field label="Language for client communications">
          <div style={{ display: "flex", gap: "8px" }}>
            {LANGUAGES.map(l => (
              <label key={l.value} style={{
                flex: 1, padding: "10px 8px", borderRadius: "8px", cursor: "pointer",
                border: `2px solid ${form.language === l.value ? "#1d4ed8" : "#e2e8f0"}`,
                background: form.language === l.value ? "#eff6ff" : "#fafafa",
                textAlign: "center", fontSize: "13px", fontWeight: 500,
                color: form.language === l.value ? "#1d4ed8" : "#475569",
              }}>
                <input type="radio" name="lang" value={l.value} checked={form.language === l.value} onChange={() => set("language", l.value)} style={{ display: "none" }} />
                {l.label}
              </label>
            ))}
          </div>
        </Field>
      </div>

      {error && <ErrorBox msg={error} />}

      <button onClick={handleNext} style={btnPrimary}>Continue</button>
    </div>
  );
}

const Field = ({ label, children }) => (
  <div>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
);
const BackBtn = ({ onClick }) => <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: "13px", padding: "0 0 16px", display: "flex", alignItems: "center", gap: "4px" }}>Back</button>;
const StepLabel = ({ children }) => <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#3b82f6", fontWeight: 600, marginBottom: "6px" }}>{children}</div>;
const ErrorBox = ({ msg }) => <div style={{ background: "#fee2e2", borderRadius: "8px", padding: "12px 14px", marginBottom: "16px", color: "#991b1b", fontSize: "13px" }}>{msg}</div>;

const h2 = { fontFamily: "'Sora', sans-serif", fontSize: "20px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" };
const subtext = { fontSize: "13.5px", color: "#64748b", lineHeight: 1.6 };
const labelStyle = { display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" };
const inputStyle = { width: "100%", padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13.5px", color: "#1e293b", outline: "none", background: "#fff" };
const btnPrimary = { width: "100%", padding: "14px", background: "#1d4ed8", color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 600, cursor: "pointer" };
