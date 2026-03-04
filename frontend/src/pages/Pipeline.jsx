import { useEffect, useState } from "react";

const STAGES = [
  { id: "New Lead",    color: "#3b82f6", bg: "#dbeafe" },
  { id: "Meeting Done",color: "#f59e0b", bg: "#fef3c7" },
  { id: "Proposal",    color: "#8b5cf6", bg: "#ede9fe" },
  { id: "Negotiation", color: "#f97316", bg: "#ffedd5" },
  { id: "Closed Won",  color: "#10b981", bg: "#d1fae5" },
  { id: "Closed Lost", color: "#ef4444", bg: "#fee2e2" },
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
  const active  = clients.filter(c => !c.deal_stage?.startsWith("Closed")).length;

  return (
    <div style={{ padding: "32px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Pipeline</h1>
        <p style={{ color: "#64748b", fontSize: "14px", margin: "4px 0 0" }}>{active} active deal{active !== 1 ? "s" : ""} across {clients.length} client{clients.length !== 1 ? "s" : ""}</p>
      </div>

      {loading ? (
        <div style={{ color: "#94a3b8" }}>Loading…</div>
      ) : clients.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
          No clients yet. Log a meeting to add your first deal.
        </div>
      ) : (
        <div style={{ display: "flex", gap: "14px", overflowX: "auto", paddingBottom: "16px" }}>
          {STAGES.map(s => {
            const group = byStage[s.id] || [];
            return (
              <div key={s.id} style={{ minWidth: "220px", flex: "0 0 220px" }}>
                {/* Column header */}
                <div style={{
                  background: s.bg, borderRadius: "10px",
                  padding: "10px 14px", marginBottom: "10px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: s.color }}>{s.id}</span>
                  <span style={{ fontSize: "18px", fontWeight: 700, color: s.color }}>{group.length}</span>
                </div>

                {/* Cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {group.map(c => (
                    <div key={c.id}
                      onClick={() => navigate("client-detail", { clientId: c.id })}
                      style={{
                        background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px",
                        padding: "12px 14px", cursor: "pointer",
                        borderLeft: `3px solid ${s.color}`,
                      }}>
                      <div style={{ fontWeight: 600, fontSize: "13.5px", color: "#0f172a", marginBottom: "2px" }}>
                        {c.name} {TEMP_ICON[c.deal_temp]}
                      </div>
                      {c.company && <div style={{ fontSize: "12px", color: "#64748b" }}>{c.company}</div>}
                      {c.city    && <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>📍 {c.city}</div>}
                    </div>
                  ))}
                  {group.length === 0 && (
                    <div style={{ padding: "20px 0", textAlign: "center", color: "#cbd5e1", fontSize: "12px" }}>Empty</div>
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
