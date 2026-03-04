export default function Done({ onComplete }) {
  return (
    <div style={{ padding: "48px 36px", textAlign: "center" }}>
      <div style={{
        width: 72, height: 72, borderRadius: "50%",
        background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "36px", margin: "0 auto 20px",
      }}>
        ✅
      </div>
      <h2 style={{
        fontFamily: "'Sora', sans-serif", fontSize: "24px",
        fontWeight: 700, color: "#0f172a", marginBottom: "10px",
      }}>
        SalesSaathi is ready!
      </h2>
      <p style={{ color: "#475569", fontSize: "14px", lineHeight: 1.8, marginBottom: "8px", maxWidth: "380px", margin: "0 auto 20px" }}>
        Your database is connected, your business profile is saved, and your AI key is stored.
        Time to log your first meeting.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "340px", margin: "0 auto 28px" }}>
        {[
          "Take a photo of your meeting notes",
          "AI extracts the key information",
          "Review and confirm in 30 seconds",
          "Client gets a professional summary",
        ].map((s, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: "10px",
            background: "#f8fafc", borderRadius: "8px", padding: "10px 14px",
            textAlign: "left",
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%",
              background: "#dbeafe", color: "#1d4ed8",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "11px", fontWeight: 700, flexShrink: 0,
            }}>{i + 1}</div>
            <div style={{ fontSize: "13px", color: "#334155" }}>{s}</div>
          </div>
        ))}
      </div>

      <button onClick={onComplete} style={{
        padding: "14px 32px",
        background: "linear-gradient(135deg, #1e3a8a, #1d4ed8)",
        color: "#fff", border: "none", borderRadius: "10px",
        fontSize: "15px", fontWeight: 600, cursor: "pointer",
        boxShadow: "0 4px 14px rgba(29,78,216,0.35)",
      }}>
        Open SalesSaathi →
      </button>

      <div style={{ marginTop: "20px", fontSize: "12px", color: "#94a3b8" }}>
        You may need to restart the app for all settings to take effect.
      </div>
    </div>
  );
}
