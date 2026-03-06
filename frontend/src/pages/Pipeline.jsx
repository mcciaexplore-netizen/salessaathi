import { useEffect, useState } from "react";

const STAGES = [
  { id: "New Lead", color: "#3b82f6", bg: "#eff6ff" },
  { id: "Meeting Done", color: "#f59e0b", bg: "#fffbeb" },
  { id: "Proposal", color: "#8b5cf6", bg: "#f5f3ff" },
  { id: "Negotiation", color: "#f97316", bg: "#fff7ed" },
  { id: "Closed Won", color: "#10b981", bg: "#ecfdf5" },
  { id: "Closed Lost", color: "#ef4444", bg: "#fef2f2" },
];
const TEMP_ICON = { hot: "", warm: "", cold: "" };

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
    <div style={{ padding: "60px 48px", maxWidth: "1600px", margin: "0 auto" }}>
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "32px", margin: 0, color: "var(--text-primary)" }}>Sales Pipeline</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "16px", marginTop: "8px" }}>
          Track {active} active deals across {clients.length} potential clients.
        </p>
      </div>

      {loading ? (
        <div style={{ color: "var(--text-secondary)", fontSize: "16px", padding: "40px", textAlign: "center" }}>Loading pipeline...</div>
      ) : clients.length === 0 ? (
        <div className="card-panel" style={{ textAlign: "center", padding: "80px 40px", background: "white" }}>
          <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>Your pipeline is empty</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>Log a meeting to see your sales pipeline in action.</p>
          <button onClick={() => navigate("log-meeting")} className="btn-primary">Log First Meeting</button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "24px", overflowX: "auto", paddingBottom: "32px", alignItems: "flex-start" }}>
          {STAGES.map(s => {
            const group = byStage[s.id] || [];
            return (
              <div key={s.id} style={{ minWidth: "280px", flex: "0 0 280px" }}>
                {/* Column header */}
                <div style={{
                  background: s.bg, borderRadius: "12px",
                  padding: "16px 20px", marginBottom: "20px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  border: `1px solid ${s.color}22`,
                }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.id}</span>
                  <span style={{
                    fontSize: "12px", fontWeight: 700, color: "white",
                    background: s.color, width: "24px", height: "24px",
                    borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center"
                  }}>{group.length}</span>
                </div>

                {/* Cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {group.map(c => (
                    <div key={c.id}
                      onClick={() => navigate("client-detail", { clientId: c.id })}
                      className="card-panel"
                      style={{
                        padding: "20px", cursor: "pointer",
                        background: "white",
                        borderLeft: `4px solid ${s.color}`,
                        border: "1px solid var(--border-light)",
                        borderLeftWidth: "4px"
                      }}>
                      <div style={{ fontWeight: 600, fontSize: "15px", color: "var(--text-primary)", marginBottom: "6px" }}>
                        {c.name} {TEMP_ICON[c.deal_temp]}
                      </div>
                      {c.company && <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px" }}>{c.company}</div>}
                      {c.city && <div style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                        {c.city}
                      </div>}
                    </div>
                  ))}
                  {group.length === 0 && (
                    <div style={{
                      padding: "40px 0", textAlign: "center",
                      color: "var(--text-muted)", fontSize: "13px",
                      border: "2px dashed var(--border-light)", borderRadius: "12px",
                      background: "rgba(255,255,255,0.5)"
                    }}>
                      Drop items here
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
