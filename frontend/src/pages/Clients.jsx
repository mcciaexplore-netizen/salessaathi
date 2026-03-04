import { useEffect, useState } from "react";

const STAGE_COLOR = {
  "New Lead":    { bg: "#dbeafe", fg: "#1e40af" },
  "Meeting Done":{ bg: "#fef3c7", fg: "#92400e" },
  "Proposal":    { bg: "#ede9fe", fg: "#5b21b6" },
  "Negotiation": { bg: "#ffedd5", fg: "#9a3412" },
  "Closed Won":  { bg: "#d1fae5", fg: "#065f46" },
  "Closed Lost": { bg: "#fee2e2", fg: "#991b1b" },
};
const TEMP_ICON = { hot: "🔥", warm: "🌤", cold: "❄️" };

export default function Clients({ navigate }) {
  const [clients, setClients]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [query,   setQuery]     = useState("");

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
    <div style={{ padding: "32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Clients</h1>
          <p style={{ color: "#64748b", fontSize: "14px", margin: "4px 0 0" }}>{clients.length} client{clients.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => navigate("log-meeting")} style={{
          background: "linear-gradient(135deg, #1d4ed8, #3b82f6)", color: "#fff",
          border: "none", borderRadius: "10px", padding: "10px 18px",
          fontSize: "13.5px", fontWeight: 600, cursor: "pointer",
        }}>📸 Log Meeting</button>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "20px" }}>
        <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>🔍</span>
        <input
          value={query}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search by name, company or phone…"
          style={{ width: "100%", padding: "10px 12px 10px 36px", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
        />
      </div>

      {loading ? (
        <div style={{ color: "#94a3b8", fontSize: "14px" }}>Loading…</div>
      ) : clients.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
          {query ? "No clients match your search." : "No clients yet. Log your first meeting to add one."}
        </div>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {clients.map(c => {
            const sc = STAGE_COLOR[c.deal_stage] || STAGE_COLOR["New Lead"];
            return (
              <div key={c.id}
                onClick={() => navigate("client-detail", { clientId: c.id })}
                style={{
                  background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px",
                  padding: "16px 20px", cursor: "pointer", display: "flex",
                  justifyContent: "space-between", alignItems: "center",
                  transition: "box-shadow 0.15s",
                }}>
                <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "12px",
                    background: "linear-gradient(135deg, #1e3a8a, #1d4ed8)",
                    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: "16px",
                  }}>
                    {(c.name || "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "15px", color: "#0f172a" }}>
                      {c.name} {TEMP_ICON[c.deal_temp]}
                    </div>
                    <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
                      {c.company || "—"}{c.phone ? ` · ${c.phone}` : ""}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{
                    fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "999px",
                    background: sc.bg, color: sc.fg,
                  }}>{c.deal_stage}</span>
                  <span style={{ color: "#94a3b8", fontSize: "16px" }}>›</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
