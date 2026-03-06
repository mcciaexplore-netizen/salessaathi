export default function Welcome({ onNext }) {
  return (
    <div style={{ padding: "40px 36px" }}>
      <div style={{ fontSize: "36px", marginBottom: "16px" }}></div>
      <h2 style={{
        fontFamily: "'Sora', sans-serif", fontSize: "24px",
        fontWeight: 700, color: "#0f172a", marginBottom: "12px",
      }}>
        Welcome to SalesSaathi
      </h2>
      <p style={{ color: "#475569", fontSize: "15px", lineHeight: 1.8, marginBottom: "8px" }}>
        This quick setup takes <strong>2 minutes</strong>. We'll help you:
      </p>
      <div style={{ marginBottom: "28px" }}>
        {[
          ["", "Choose where your data is stored"],
          ["", "Enter your business details"],
          ["", "Add a free AI key to power the note-reading"],
        ].map(([icon, text], i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: "12px",
            padding: "10px 0",
            borderBottom: i < 2 ? "1px solid #f1f5f9" : "none",
          }}>
            <span style={{ fontSize: "20px" }}>{icon}</span>
            <span style={{ fontSize: "14px", color: "#334155" }}>{text}</span>
          </div>
        ))}
      </div>

      <div style={{
        background: "#f0fdf4", borderRadius: "10px",
        padding: "12px 16px", marginBottom: "28px",
        border: "1px solid #bbf7d0",
      }}>
        <div style={{ fontSize: "13px", color: "#166534" }}>
          <strong>Free & open source.</strong> No subscriptions. No hidden costs.
          Your data stays on your machine (or your own server).
        </div>
      </div>

      <button onClick={onNext} style={btnStyle("#1d4ed8")}>
        Let's get started
      </button>
    </div>
  );
}

const btnStyle = (bg) => ({
  width: "100%", padding: "14px",
  background: bg, color: "#fff",
  border: "none", borderRadius: "10px",
  fontSize: "15px", fontWeight: 600,
  cursor: "pointer", fontFamily: "'Inter', sans-serif",
});
