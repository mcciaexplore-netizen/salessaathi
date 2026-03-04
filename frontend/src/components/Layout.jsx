const NAV = [
  { id: "dashboard", icon: "🏠", label: "Dashboard" },
  { id: "clients",   icon: "👥", label: "Clients" },
  { id: "pipeline",  icon: "📊", label: "Pipeline" },
  { id: "settings",  icon: "⚙️",  label: "Settings" },
];

export default function Layout({ page, navigate, children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', 'Segoe UI', sans-serif", background: "#f8fafc" }}>

      {/* Sidebar */}
      <div style={{
        width: 220, flexShrink: 0,
        background: "linear-gradient(180deg, #0f172a 0%, #1e3a8a 100%)",
        display: "flex", flexDirection: "column",
        position: "fixed", top: 0, bottom: 0, left: 0,
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: 36, height: 36, borderRadius: "9px",
              background: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px",
            }}>📋</div>
            <div>
              <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: "16px", color: "#fff", lineHeight: 1 }}>SalesSaathi</div>
              <div style={{ fontSize: "10px", color: "#93c5fd", marginTop: "2px" }}>MCCIA AI Studio</div>
            </div>
          </div>
        </div>

        {/* Log Meeting CTA */}
        <div style={{ padding: "0 14px 16px" }}>
          <button
            onClick={() => navigate("log-meeting")}
            style={{
              width: "100%", padding: "11px 12px",
              background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
              border: "none", borderRadius: "10px",
              color: "#fff", fontSize: "13px", fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
              boxShadow: "0 2px 8px rgba(59,130,246,0.4)",
            }}>
            <span style={{ fontSize: "16px" }}>📸</span>
            Log New Meeting
          </button>
        </div>

        <div style={{ height: "1px", background: "rgba(255,255,255,0.08)", margin: "0 14px" }} />

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px" }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => navigate(n.id)} style={{
              width: "100%", padding: "10px 12px",
              background: page === n.id ? "rgba(255,255,255,0.12)" : "transparent",
              border: "none", borderRadius: "8px",
              display: "flex", alignItems: "center", gap: "10px",
              color: page === n.id ? "#fff" : "#94a3b8",
              fontSize: "13.5px", fontWeight: page === n.id ? 600 : 400,
              cursor: "pointer", marginBottom: "2px",
              textAlign: "left",
              borderLeft: page === n.id ? "3px solid #3b82f6" : "3px solid transparent",
            }}>
              <span style={{ fontSize: "16px", width: "20px", textAlign: "center" }}>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: "11px", color: "#475569" }}>Open Source · MIT License</div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ marginLeft: 220, flex: 1, minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}
