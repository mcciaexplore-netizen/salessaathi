const NAV = [
  { id: "dashboard", icon: "", label: "Dashboard" },
  { id: "clients", icon: "", label: "Clients" },
  { id: "pipeline", icon: "", label: "Pipeline" },
  { id: "settings", icon: "", label: "Settings" },
];

export default function Layout({ page, navigate, children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--highlight-pastel)" }}>

      {/* Sidebar */}
      <div style={{
        width: 260, flexShrink: 0,
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border-light)",
        display: "flex", flexDirection: "column",
        position: "fixed", top: 0, bottom: 0, left: 0,
        zIndex: 100,
        boxShadow: "4px 0 10px rgba(0,0,0,0.01)"
      }}>
        {/* Logo */}
        <div style={{ padding: "40px 24px 32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: 36, height: 36, borderRadius: "10px",
              background: "var(--secondary-pastel)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px", color: "var(--primary-accent)"
            }}>S</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "18px", color: "var(--text-primary)", lineHeight: 1 }}>SalesSaathi</div>
              <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: 500 }}>MSME CRM Platform</div>
            </div>
          </div>
        </div>

        {/* Log Meeting CTA */}
        <div style={{ padding: "0 20px 24px" }}>
          <button
            onClick={() => navigate("log-meeting")}
            className="btn-primary"
            style={{
              width: "100%", padding: "12px",
            }}>
            Log New Meeting
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "0 12px" }}>
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => navigate(n.id)}
              className={`nav-item ${page === n.id ? 'active' : ''}`}
            >
              <span style={{ fontSize: "18px" }}>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: "24px", borderTop: "1px solid var(--border-light)" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center", fontWeight: 500 }}>Open Source · MIT License</div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ marginLeft: 260, flex: 1, minWidth: 0, transition: "padding 0.3s ease" }}>
        {children}
      </div>
    </div>
  );
}
