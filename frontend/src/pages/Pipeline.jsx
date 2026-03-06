import { useEffect, useState } from "react";

const STAGES = [
  { id: "New Lead", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)" },
  { id: "Meeting Done", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" },
  { id: "Proposal", color: "#a78bfa", bg: "rgba(167, 139, 250, 0.1)" },
  { id: "Negotiation", color: "#fb923c", bg: "rgba(251, 146, 60, 0.1)" },
  { id: "Closed Won", color: "#34d399", bg: "rgba(52, 211, 153, 0.1)" },
  { id: "Closed Lost", color: "#fca5a5", bg: "rgba(252, 165, 165, 0.1)" },
];
const TEMP_ICON = { hot: "🔥", warm: "🌤", cold: "❄️" };

export default function Pipeline({ navigate }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/clients")
      .then(r => r.json())
      .then(d => { setClients(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const byStage = Object.fromEntries(STAGES.map(s => [s.id, clients.filter(c => c.deal_stage === s.id)]));
  const active = clients.filter(c => !c.deal_stage?.startsWith("Closed")).length;

  return (
    <div style={{ padding: "48px 40px", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "32px", margin: 0 }}>Pipeline</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "15px", marginTop: "4px" }}>
          {active} active deal{active !== 1 ? "s" : ""} across {clients.length} client{clients.length !== 1 ? "s" : ""}
        </p>
      </div>

      {loading ? (
        <div style={{ color: "var(--text-muted)", fontSize: "15px" }}>Loading pipeline...</div>
      ) : clients.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "80px 20px" }}>
          No clients found. Log a meeting to populate your sales pipeline.
        </div>
      ) : (
        <div style={{ display: "flex", gap: "20px", overflowX: "auto", paddingBottom: "24px" }}>
          {STAGES.map(s => {
            const group = byStage[s.id] || [];
            return (
              <div key={s.id} style={{ minWidth: "260px", flex: "0 0 260px" }}>
                {/* Column header */}
                <div style={{
                  background: s.bg, borderRadius: "14px",
                  padding: "16px 20px", marginBottom: "16px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  border: `1px solid ${s.color}33`,
                }}>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: s.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.id}</span>
                  <span style={{ fontSize: "20px", fontWeight: 800, color: s.color }}>{group.length}</span>
                </div>

                {/* Cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {group.map(c => (
                    <div key={c.id}
                      onClick={() => navigate("client-detail", { clientId: c.id })}
                      className="glass-card"
                      style={{
                        padding: "16px 18px", cursor: "pointer",
                        borderLeft: `4px solid ${s.color}`,
                        borderRadius: "12px",
                      }}>
                      <div style={{ fontWeight: 600, fontSize: "15px", color: "var(--text-primary)", marginBottom: "4px" }}>
                        {c.name} {TEMP_ICON[c.deal_temp]}
                      </div>
                      {c.company && <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{c.company}</div>}
                      {c.city && <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }}>📍 {c.city}</div>}
                    </div>
                  ))}
                  {group.length === 0 && (
                    <div style={{
                      padding: "32px 0", textAlign: "center",
                      color: "var(--text-muted)", fontSize: "13px",
                      border: "1px dashed var(--border-glass)", borderRadius: "12px"
                    }}>
                      No cards
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
