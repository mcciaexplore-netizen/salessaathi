import { useEffect, useState } from "react";
import { api } from "../services/api";

const STAGES = [
  { id: "New Lead", color: "#3b82f6", bg: "#eff6ff" },
  { id: "Contacted", color: "#6366f1", bg: "#eef2ff" },
  { id: "Interested", color: "#8b5cf6", bg: "#f5f3ff" },
  { id: "Follow-Up Required", color: "#f59e0b", bg: "#fffbeb" },
  { id: "Converted", color: "#10b981", bg: "#ecfdf5" },
  { id: "Not Interested", color: "#ef4444", bg: "#fef2f2" },
];

export default function Pipeline({ navigate }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.leads.list()
      .then(d => { setLeads(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const byStage = Object.fromEntries(STAGES.map(s => [s.id, leads.filter(l => l.deal_stage === s.id)]));
  const activeCount = leads.filter(l => l.deal_stage !== "Converted" && l.deal_stage !== "Not Interested").length;

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "1.85rem", marginBottom: "0.5rem" }}>Sales Pipeline</h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Visualizing {activeCount} active leads through the conversion funnel.
        </p>
      </header>

      {loading ? (
        <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem", padding: "4rem", textAlign: "center" }}>Loading pipeline...</div>
      ) : leads.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "5rem 2rem" }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Your pipeline is empty</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>Add your first lead to see them here.</p>
          <button onClick={() => navigate("log-meeting")} className="btn-primary">Add New Lead</button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "1.5rem", overflowX: "auto", paddingBottom: "2rem", alignItems: "flex-start" }}>
          {STAGES.map(s => {
            const group = byStage[s.id] || [];
            return (
              <div key={s.id} style={{ minWidth: "280px", flex: "0 0 280px" }}>
                {/* Column header */}
                <div style={{
                  backgroundColor: s.bg,
                  borderRadius: "12px",
                  padding: "1rem 1.25rem",
                  marginBottom: "1.5rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: `1px solid ${s.color}20`,
                }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: "700", color: s.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.id}</span>
                  <span style={{
                    fontSize: "0.75rem", fontWeight: "700", color: "white",
                    backgroundColor: s.color, width: "22px", height: "22px",
                    borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center"
                  }}>{group.length}</span>
                </div>

                {/* Cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {group.map(l => (
                    <div key={l.id}
                      onClick={() => navigate("client-detail", { clientId: l.id })}
                      className="card"
                      style={{
                        padding: "1.25rem",
                        cursor: "pointer",
                        borderLeft: `4px solid ${s.color}`,
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                      }}>
                      <div style={{ fontWeight: "600", fontSize: "0.9rem", color: "var(--text-primary)", marginBottom: "0.4rem" }}>
                        {l.company}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>{l.name}</div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{l.service_interest || 'General'}</span>
                        {l.deal_temp === 'hot' && <span style={{ fontSize: '1rem' }}>🔥</span>}
                      </div>
                    </div>
                  ))}
                  {group.length === 0 && (
                    <div style={{
                      padding: "3rem 0", textAlign: "center",
                      color: "var(--text-muted)", fontSize: "0.8rem",
                      border: "2px dashed var(--border-color)",
                      borderRadius: "12px",
                      opacity: 0.5
                    }}>
                      Empty
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
