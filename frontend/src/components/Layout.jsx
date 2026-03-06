const NAV = [
  { id: "dashboard", icon: "🏠", label: "Dashboard" },
  { id: "clients", icon: "👥", label: "Clients" },
  { id: "pipeline", icon: "📊", label: "Pipeline" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

export default function Layout({ page, navigate, children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg-main)" }}>

      {/* Sidebar */}
      <div style={{
        width: 240, flexShrink: 0,
        background: "#0a0a0a",
        borderRight: "1px solid var(--border-glass)",
        display: "flex", flexDirection: "column",
        position: "fixed", top: 0, bottom: 0, left: 0,
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ padding: "32px 24px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="glass-card" style={{
              width: 40, height: 40, borderRadius: "10px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "20px",
            }}>📋</div>
            <div>
              <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: "17px", color: "var(--text-primary)", lineHeight: 1 }}>SalesSaathi</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>MCCIA AI Studio</div>
            </div>
          </div>
        </div>

        {/* Log Meeting CTA */}
        <div style={{ padding: "0 16px 20px" }}>
          <button
            onClick={() => navigate("log-meeting")}
            className="btn-primary"
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
            }}>
            <span style={{ fontSize: "18px" }}>📸</span>
            Log New Meeting
          </button>
        </div>

        <div style={{ height: "1px", background: "var(--border-glass)", margin: "0 20px" }} />

        {/* Nav */}
        <nav style={{ flex: 1, padding: "20px 12px" }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => navigate(n.id)} style={{
              width: "100%", padding: "12px 16px",
              background: page === n.id ? "rgba(59, 130, 246, 0.1)" : "transparent",
              border: "none", borderRadius: "12px",
              display: "flex", alignItems: "center", gap: "12px",
              color: page === n.id ? "var(--accent-blue)" : "var(--text-secondary)",
              fontSize: "14px", fontWeight: page === n.id ? 600 : 500,
              cursor: "pointer", marginBottom: "4px",
              transition: "all 0.2s ease",
            }}>
              <span style={{ fontSize: "18px", opacity: page === n.id ? 1 : 0.7 }}>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: "20px", borderTop: "1px solid var(--border-glass)" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center" }}>Open Source · MIT License</div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ marginLeft: 240, flex: 1, minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}
