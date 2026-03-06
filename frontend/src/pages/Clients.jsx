import { useEffect, useState } from "react";

const STAGE_COLOR = {
  "New Lead": { bg: "rgba(59, 130, 246, 0.15)", fg: "#3b82f6" },
  "Meeting Done": { bg: "rgba(245, 158, 11, 0.15)", fg: "#f59e0b" },
  "Proposal": { bg: "rgba(139, 92, 246, 0.15)", fg: "#a78bfa" },
  "Negotiation": { bg: "rgba(249, 115, 22, 0.15)", fg: "#fb923c" },
  "Closed Won": { bg: "rgba(16, 185, 129, 0.15)", fg: "#34d399" },
  "Closed Lost": { bg: "rgba(239, 68, 68, 0.15)", fg: "#fca5a5" },
};
const TEMP_ICON = { hot: "", warm: "", cold: "" };

export default function Clients({ navigate }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => { load(); }, []);

  const load = (q = "") => {
    setLoading(true);
    const url = q ? `/api/clients?q=${encodeURIComponent(q)}` : "/api/clients";
    fetch(url)
      .then(r => r.json())
      .then(d => { setClients(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const handleSearch = (v) => {
    setQuery(v);
    clearTimeout(window._st);
    window._st = setTimeout(() => load(v), 300);
  };

  return (
    <div style={{ padding: "48px 40px", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "32px", margin: 0 }}>Clients</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "15px", marginTop: "4px" }}>
            {clients.length} registered client{clients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={() => navigate("log-meeting")} className="btn-primary">
          Log New Meeting
        </button>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "32px" }}>
        <input
          value={query}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search by name, company or phone..."
          className="glass-card"
          style={{ width: "100%", padding: "14px 16px 14px 24px", fontSize: "15px", outline: "none", boxSizing: "border-box", borderRadius: "14px" }}
        />
      </div>

      {loading ? (
        <div style={{ color: "var(--text-muted)", fontSize: "15px" }}>Searching...</div>
      ) : clients.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "80px 20px" }}>
          <div style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "18px" }}>
            {query ? "No matches found" : "No clients in your database"}
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: "15px", marginTop: "8px" }}>
            {query ? "Try searching for something else." : "Log your first meeting to populate your client list automatically."}
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {clients.map(c => {
            const sc = STAGE_COLOR[c.deal_stage] || STAGE_COLOR["New Lead"];
            return (
              <div key={c.id}
                onClick={() => navigate("client-detail", { clientId: c.id })}
                className="glass-card"
                style={{
                  padding: "20px 24px", cursor: "pointer", display: "flex",
                  justifyContent: "space-between", alignItems: "center",
                }}>
                <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: "14px",
                    background: "rgba(59, 130, 246, 0.1)",
                    color: "var(--accent-blue)", display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: "18px", border: "1px solid rgba(59, 130, 246, 0.2)"
                  }}>
                    {(c.name || "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "17px", color: "var(--text-primary)" }}>
                      {c.name} {TEMP_ICON[c.deal_temp]}
                    </div>
                    <div style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
                      <span style={{ color: "var(--text-secondary)" }}>{c.company || "No Company"}</span>
                      {c.phone ? ` · ${c.phone}` : ""}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{
                    fontSize: "11px", fontWeight: 700, padding: "5px 12px", borderRadius: "999px",
                    background: sc.bg, color: sc.fg, textTransform: "uppercase", letterSpacing: "0.05em"
                  }}>{c.deal_stage}</span>
                  <span style={{ color: "var(--border-glass)", fontSize: "20px" }}>›</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
