import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function Dashboard({ navigate }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboard.getSummary()
      .then(d => {
        setSummary(d);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <p style={{ color: "var(--text-secondary)" }}>Loading Dashboard...</p>
    </div>
  );

  if (!summary) return (
    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
      <p style={{ color: "var(--text-secondary)" }}>Error loading dashboard data.</p>
    </div>
  );

  const stats = [
    { label: "Total Leads", value: summary.total_leads, icon: "👥", color: "var(--accent-pastel)" },
    { label: "New Leads", value: summary.new_leads, icon: "✨", color: "#dcfce7" },
    { label: "Follow-Ups Today", value: summary.follow_ups_today, icon: "⏰", color: "#fef9c3" },
    { label: "Converted Leads", value: summary.converted_leads, icon: "🏆", color: "#ccfbf1" },
  ];

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "1.85rem", marginBottom: "0.5rem" }}>Welcome back, MCCIA Staff</h1>
        <p style={{ color: "var(--text-secondary)" }}>Here's what's happening with your leads today.</p>
      </header>

      {/* Stats Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "1.5rem",
        marginBottom: "3rem"
      }}>
        {stats.map((s, idx) => (
          <div key={idx} className="card" style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: s.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.25rem"
            }}>
              {s.icon}
            </div>
            <div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500" }}>{s.label}</p>
              <p style={{ fontSize: "1.5rem", fontWeight: "700" }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        {/* Today's Follow ups */}
        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: "600" }}>Today's Follow-Ups</h2>
            <button className="btn-outline" style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem" }} onClick={() => navigate("followups")}>View All</button>
          </div>

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {summary.today_follow_ups_list?.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ textAlign: "left", backgroundColor: "var(--bg-secondary)" }}>
                      <th style={{ padding: "0.75rem 1.5rem", fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "600", textTransform: 'uppercase' }}>Company</th>
                      <th style={{ padding: "0.75rem 1.5rem", fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "600", textTransform: 'uppercase' }}>Contact</th>
                      <th style={{ padding: "0.75rem 1.5rem", fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "600", textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: "0.75rem 1.5rem", fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "600", textTransform: 'uppercase' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.today_follow_ups_list.map(lead => (
                      <tr key={lead.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                        <td style={{ padding: "1rem 1.5rem", fontWeight: "500", fontSize: '0.9rem' }}>{lead.company}</td>
                        <td style={{ padding: "1rem 1.5rem", color: "var(--text-secondary)", fontSize: "0.85rem" }}>{lead.name}</td>
                        <td style={{ padding: "1rem 1.5rem" }}>
                          <span className={`badge badge-${lead.deal_stage?.toLowerCase().replace(/\s+/g, "-") || "new"}`}>
                            {lead.deal_stage}
                          </span>
                        </td>
                        <td style={{ padding: "1rem 1.5rem" }}>
                          <button
                            onClick={() => navigate("client-detail", { clientId: lead.id })}
                            style={{ color: "var(--accent-primary)", fontWeight: "600", fontSize: "0.8rem", background: "none" }}
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: "4rem 2rem", textAlign: "center", color: "var(--text-secondary)" }}>
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem' }}>🎉</span>
                <p style={{ fontSize: '0.9rem' }}>No follow-ups scheduled for today.</p>
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "1.5rem" }}>Quick Actions</h2>
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <button className="btn-primary" onClick={() => navigate("log-meeting")} style={{ width: "100%", textAlign: 'left', display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '10px' }}>➕</span> Log New Meeting
            </button>
            <button className="btn-outline" onClick={() => navigate("clients")} style={{ width: "100%", textAlign: 'left', display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '10px' }}>👥</span> Manage All Leads
            </button>
            <button className="btn-outline" onClick={() => navigate("pipeline")} style={{ width: "100%", textAlign: 'left', display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '10px' }}>📈</span> Pipeline Overview
            </button>
          </div>

          <div className="card" style={{ marginTop: '1.5rem', backgroundColor: 'var(--accent-pastel)', border: 'none' }}>
            <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>Sales Tip</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
              Remember to update lead status after every interaction to keep the pipeline accurate!
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
