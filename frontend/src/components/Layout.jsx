import { useAuth } from "../hooks/useAuth";

export default function Layout({ children, page, navigate }) {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "clients", label: "Leads", icon: "👥" },
    { id: "followups", label: "Follow Ups", icon: "⏰" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  // Logic to hide settings if not logged in
  const visibleMenuItems = menuItems.filter(item => {
    if (item.id === "settings" && !user) return false;
    return true;
  });

  const handleLogout = async () => {
    await logout();
    navigate("dashboard");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg-secondary)" }}>
      {/* Sidebar */}
      <aside style={{
        width: "260px",
        backgroundColor: "var(--bg-primary)",
        borderRight: "1px solid var(--border-color)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        height: "100vh",
        zIndex: 10
      }}>
        <div style={{ padding: "2rem 1.5rem", borderBottom: "1px solid var(--border-color)" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--accent-primary)", letterSpacing: "-0.5px" }}>
            SalesSathi<span style={{ color: "var(--text-secondary)", fontWeight: "400" }}>.</span>
          </h1>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>MCCIA Lead Management</p>
        </div>

        <nav style={{ flex: 1, padding: "1.5rem 1rem" }}>
          {visibleMenuItems.map(item => (
            <div
              key={item.id}
              onClick={() => navigate(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "0.75rem 1rem",
                marginBottom: "0.5rem",
                borderRadius: "10px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                backgroundColor: page === item.id ? "var(--accent-pastel)" : "transparent",
                color: page === item.id ? "var(--accent-primary)" : "var(--text-secondary)",
                fontWeight: page === item.id ? "600" : "400"
              }}
              className="nav-item"
            >
              <span style={{ marginRight: "12px", fontSize: "1.2rem" }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div style={{ padding: "1.5rem", borderTop: "1px solid var(--border-color)" }}>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "var(--accent-pastel)",
                  color: "var(--accent-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700",
                  marginRight: "10px",
                  fontSize: "0.8rem"
                }}>
                  {user.full_name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-primary)" }}>{user.full_name || user.username}</p>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>MCCIA Staff</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                style={{ background: "none", fontSize: "1.1rem", padding: "4px" }}
                title="Logout"
              >
                🚪
              </button>
            </div>
          ) : (
            <button
              className="btn-outline"
              style={{ width: "100%", fontSize: "0.85rem" }}
              onClick={() => navigate("login")}
            >
              Staff Login
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft: "260px", flex: 1, padding: "2rem", minHeight: "100vh", position: "relative" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }} className="animate-fade-in">
          {children}
        </div>
      </main>

      <style>{`
        .nav-item:hover {
          background-color: var(--bg-tertiary) !important;
          color: var(--text-primary) !important;
        }
      `}</style>
    </div>
  );
}
