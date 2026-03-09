const OPTIONS = [
  {
    id: "supabase",
    icon: "☁️",
    title: "Supabase (Cloud)",
    subtitle: "Best for cloud deployment and scalability",
    desc: "Data is stored securely in your Supabase project. Required for Vercel deployment.",
    badge: "Recommended",
    badgeBg: "#dcfce7",
    badgeColor: "#166534",
  },
  {
    id: "pocketbase",
    icon: "🌐",
    title: "Share with my team",
    subtitle: "Best for 3–20 salespeople",
    desc: "Uses PocketBase — a single free app that runs on any PC or server. Everyone on the team connects to it. Includes an admin panel.",
    badge: "Team option",
    badgeBg: "#dbeafe",
    badgeColor: "#1e40af",
  },
];

export default function DBPicker({ value, onChange, onNext }) {
  return (
    <div style={{ padding: "36px" }}>
      <StepLabel>Step 1 of 4</StepLabel>
      <h2 style={h2}>Where should your data be stored?</h2>
      <p style={subtext}>Don't worry — you can change this later.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", margin: "24px 0" }}>
        {OPTIONS.map(opt => (
          <label key={opt.id} style={{
            display: "block",
            border: `2px solid ${value === opt.id ? "#1d4ed8" : "#e2e8f0"}`,
            borderRadius: "12px",
            padding: "16px 18px",
            cursor: "pointer",
            background: value === opt.id ? "#eff6ff" : "#fff",
            transition: "all 0.15s",
          }}>
            <input
              type="radio" name="db_type" value={opt.id}
              checked={value === opt.id}
              onChange={() => onChange(opt.id)}
              style={{ display: "none" }}
            />
            <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
              <div style={{
                width: 44, height: 44, borderRadius: "10px",
                background: value === opt.id ? "#dbeafe" : "#f8fafc",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "22px", flexShrink: 0,
              }}>
                {opt.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                  <strong style={{ fontSize: "15px", color: "#0f172a" }}>{opt.title}</strong>
                  <span style={{
                    fontSize: "11px", fontWeight: 600,
                    background: opt.badgeBg, color: opt.badgeColor,
                    padding: "2px 8px", borderRadius: "999px",
                  }}>{opt.badge}</span>
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "6px" }}>{opt.subtitle}</div>
                <div style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6 }}>{opt.desc}</div>
              </div>
              <div style={{
                width: 20, height: 20, borderRadius: "50%",
                border: `2px solid ${value === opt.id ? "#1d4ed8" : "#cbd5e1"}`,
                background: value === opt.id ? "#1d4ed8" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, marginTop: "2px",
              }}>
                {value === opt.id && (
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />
                )}
              </div>
            </div>
          </label>
        ))}
      </div>

      <button onClick={onNext} style={btnPrimary}>
        Continue →
      </button>
    </div>
  );
}

const StepLabel = ({ children }) => (
  <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#3b82f6", fontWeight: 600, marginBottom: "6px" }}>
    {children}
  </div>
);

const h2 = {
  fontFamily: "'Sora', sans-serif", fontSize: "20px",
  fontWeight: 700, color: "#0f172a", marginBottom: "4px",
};
const subtext = { fontSize: "13.5px", color: "#64748b" };
const btnPrimary = {
  width: "100%", padding: "14px",
  background: "#1d4ed8", color: "#fff",
  border: "none", borderRadius: "10px",
  fontSize: "15px", fontWeight: 600,
  cursor: "pointer",
};
