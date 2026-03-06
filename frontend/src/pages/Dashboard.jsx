import { useEffect, useState } from "react";

const TEMP_COLOR = { hot: "#dc2626", warm: "#d97706", cold: "#2563eb" };
const TEMP_BG = { hot: "#fef2f2", warm: "#fffbeb", cold: "#eff6ff" };

function StatCard({ icon, label, value, color, onClick }) {
  return (
    <div onClick={onClick} className="card-panel" style={{
      padding: "24px", cursor: onClick ? "pointer" : "default",
      flex: 1, minWidth: "200px",
      display: "flex", flexDirection: "column", gap: "16px",
      background: "var(--bg-card)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>{label}</div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline" }}>
        <div style={{ fontSize: "32px", fontWeight: 600, color: "var(--text-primary)" }}>{value}</div>
      </div>
    </div>
  );
}

function MeetingRow({ m, navigate }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "16px 0", borderBottom: "1px solid var(--border-light)",
    }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: "15px", color: "var(--text-primary)" }}>
          {m.client_name || "Unknown Client"}
          {m.client_company && <span style={{ fontWeight: 400, color: "var(--text-secondary)" }}> · {m.client_company}</span>}
        </div>
        <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
          {m.meeting_date} {m.follow_up_date && `· Follow-up: ${m.follow_up_date}`}
        </div>
      </div>
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <span style={{
          fontSize: "10px", fontWeight: 600, padding: "4px 10px", borderRadius: "6px",
          background: TEMP_BG[m.deal_temp] || "var(--highlight-pastel)",
          color: TEMP_COLOR[m.deal_temp] || "var(--text-secondary)",
          textTransform: "uppercase", letterSpacing: "0.02em"
        }}>{m.deal_temp || "warm"}</span>
        {m.client_id && (
          <button onClick={() => navigate("client-detail", { clientId: m.client_id })}
            className="btn-secondary"
            style={{ padding: "6px 12px", fontSize: "12px" }}>
            Details
          </button>
        )}
      </div>
    </div>
  );
}

export default function Dashboard({ navigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch("/api/dashboard")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const todayStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div style={{ padding: "60px 48px", maxWidth: "var(--container-max)", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "48px" }}>
        <div style={{
          fontSize: "14px",
          color: "var(--primary-accent)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "12px",
          display: "inline-block",
          padding: "4px 12px",
          background: "var(--secondary-pastel)",
          borderRadius: "6px"
        }}>
          {todayStr}
        </div>
        <h1 style={{ fontSize: "32px", margin: "8px 0 0", color: "var(--text-primary)" }}>
          Good {getGreeting()}
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "16px", marginTop: "8px", fontWeight: 400 }}>
          Manage your deals and follow-ups with ease.
        </p>
      </div>

      {loading ? (
        <div style={{ color: "var(--text-secondary)", fontSize: "16px", textAlign: "center", padding: "40px" }}>Loading your dashboard...</div>
      ) : !data ? (
        <div className="card-panel" style={{ padding: "24px", color: "#dc2626", borderLeft: "4px solid #dc2626" }}>
          Could not load dashboard. Please ensure the backend is running.
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "48px" }}>
            <StatCard icon="" label="Overdue" value={data.overdue_follow_ups} color="#dc2626" />
            <StatCard icon="" label="Due Today" value={data.due_today} color="#d97706" />
            <StatCard icon="" label="Hot Deals" value={data.hot_deals} color="#059669" onClick={() => navigate("pipeline")} />
            <StatCard icon="" label="Clients" value={data.total_clients} color="var(--primary-accent)" onClick={() => navigate("clients")} />
          </div>

          {/* Empty state / Onboarding */}
          {data.total_clients === 0 && (
            <div className="card-panel" style={{
              padding: "80px 40px", textAlign: "center", marginBottom: "48px",
              border: "none",
              boxShadow: "0 10px 40px rgba(79, 125, 243, 0.05)"
            }}>
              <h2 style={{ fontSize: "24px", color: "var(--text-primary)", marginBottom: "16px", fontWeight: 600 }}>
                Start your Sales Journey
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "16px", marginBottom: "32px", maxWidth: "480px", margin: "0 auto 32px", lineHeight: 1.7 }}>
                Log your first meeting notes or upload a photo of your handwritten notes to get AI-powered insights.
              </p>
              <button onClick={() => navigate("log-meeting")} className="btn-primary" style={{ padding: "14px 36px", fontSize: "15px" }}>
                Log Meeting
              </button>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "32px" }}>
            {/* Recent meetings */}
            <div className="card-panel" style={{ padding: "32px", background: "white" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h3 style={{ fontSize: "18px", margin: 0 }}>Recent Meetings</h3>
                <button onClick={() => navigate("clients")} style={{ color: "var(--primary-accent)", fontSize: "13px", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>View All</button>
              </div>
              {(data.recent_meetings || []).length === 0 ? (
                <div style={{ color: "var(--text-secondary)", fontSize: "14px", padding: "32px 0", textAlign: "center", background: "var(--highlight-pastel)", borderRadius: "12px" }}>
                  No meetings logged yet.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {(data.recent_meetings || []).map((m, i) => <MeetingRow key={i} m={m} navigate={navigate} />)}
                </div>
              )}
            </div>

            {/* Upcoming follow-ups */}
            <div className="card-panel" style={{ padding: "32px", background: "white" }}>
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "18px", margin: 0 }}>Upcoming Follow-ups</h3>
              </div>
              {(data.upcoming_follow_ups || []).length === 0 ? (
                <div style={{ color: "var(--text-secondary)", fontSize: "14px", padding: "32px 0", textAlign: "center", background: "var(--highlight-pastel)", borderRadius: "12px" }}>
                  Nothing scheduled for now.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {(data.upcoming_follow_ups || []).map((m, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid var(--border-light)" }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "15px", color: "var(--text-primary)" }}>{m.client_name}</div>
                        <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>{m.follow_up_date}</div>
                      </div>
                      <span style={{
                        fontSize: "11px", fontWeight: 600, padding: "4px 12px", borderRadius: "20px",
                        background: isToday(m.follow_up_date) ? "var(--secondary-pastel)" : "var(--highlight-pastel)",
                        color: isToday(m.follow_up_date) ? "var(--primary-accent)" : "var(--text-secondary)",
                      }}>
                        {isToday(m.follow_up_date) ? "Today" : daysUntil(m.follow_up_date)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}

function isToday(dateStr) {
  return dateStr === new Date().toISOString().split("T")[0];
}

function daysUntil(dateStr) {
  const diff = Math.round((new Date(dateStr) - new Date()) / 86400000);
  if (diff === 1) return "Tomorrow";
  if (diff <= 0) return "Overdue";
  return `In ${diff} days`;
}
