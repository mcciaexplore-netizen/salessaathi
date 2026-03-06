import { useEffect, useState } from "react";

const TEMP_COLOR = { hot: "#ef4444", warm: "#f59e0b", cold: "#3b82f6" };
const TEMP_BG = { hot: "rgba(239, 68, 68, 0.15)", warm: "rgba(245, 158, 11, 0.15)", cold: "rgba(59, 130, 246, 0.15)" };

function StatCard({ icon, label, value, color, onClick }) {
  return (
    <div onClick={onClick} className="glass-card" style={{
      padding: "24px", cursor: onClick ? "pointer" : "default",
      flex: 1, minWidth: "200px",
      display: "flex", flexDirection: "column", gap: "12px",
    }}>
      <div style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: 500 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
        <div style={{ fontSize: "32px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "'Sora', sans-serif" }}>{value}</div>
        <div style={{ fontSize: "14px", color }}>{icon}</div>
      </div>
    </div>
  );
}

function MeetingRow({ m, navigate }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "16px 0", borderBottom: "1px solid var(--border-glass)",
    }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: "15px", color: "var(--text-primary)" }}>
          {m.client_name || "Unknown Client"}
          {m.client_company && <span style={{ fontWeight: 400, color: "var(--text-muted)" }}> · {m.client_company}</span>}
        </div>
        <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
          {m.meeting_date} {m.follow_up_date && `· Follow-up: ${m.follow_up_date}`}
        </div>
      </div>
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <span style={{
          fontSize: "11px", fontWeight: 700, padding: "4px 12px", borderRadius: "99px",
          background: TEMP_BG[m.deal_temp] || "var(--bg-glass)",
          color: TEMP_COLOR[m.deal_temp] || "var(--text-muted)",
          textTransform: "uppercase", letterSpacing: "0.05em"
        }}>{m.deal_temp || "warm"}</span>
        {m.client_id && (
          <button onClick={() => navigate("client-detail", { clientId: m.client_id })}
            className="btn-secondary"
            style={{ padding: "6px 12px", fontSize: "12px" }}>
            View →
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

  const todayStr = new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div style={{ padding: "48px 40px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <div style={{ fontSize: "13px", color: "var(--accent-blue)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>{todayStr}</div>
        <h1 style={{ fontSize: "36px", margin: 0 }}>
          Good {getGreeting()} 👋
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "16px", marginTop: "8px" }}>Here's what's happening in your sales pipeline today.</p>
      </div>

      {loading ? (
        <div style={{ color: "var(--text-muted)", fontSize: "16px" }}>Loading your data...</div>
      ) : !data ? (
        <div className="glass-card" style={{ padding: "24px", color: "#ef4444", borderColor: "#ef4444" }}>Could not load dashboard. Is the backend running?</div>
      ) : (
        <>
          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "40px" }}>
            <StatCard icon="⌛" label="Overdue follow-ups" value={data.overdue_follow_ups} color="#ef4444" />
            <StatCard icon="🎯" label="Due today" value={data.due_today} color="#f59e0b" />
            <StatCard icon="🔥" label="Hot deals" value={data.hot_deals} color="#10b981" onClick={() => navigate("pipeline")} />
            <StatCard icon="📈" label="Total clients" value={data.total_clients} color="#3b82f6" onClick={() => navigate("clients")} />
          </div>

          {/* Empty state */}
          {data.total_clients === 0 && (
            <div className="glass-card" style={{
              padding: "64px 40px", textAlign: "center", marginBottom: "40px",
              background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1), transparent)",
            }}>
              <div style={{ fontSize: "64px", marginBottom: "24px" }}>🎙️</div>
              <h2 style={{ fontSize: "28px", color: "var(--text-primary)", marginBottom: "12px" }}>
                Log your first meeting
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "17px", marginBottom: "32px", maxWidth: "500px", margin: "0 auto 32px" }}>
                Upload a photo of your handwritten notes or record audio. SalesSaathi's AI handles the extraction automatically.
              </p>
              <button onClick={() => navigate("log-meeting")} className="btn-primary" style={{ padding: "14px 32px", fontSize: "16px" }}>
                📸 Get Started →
              </button>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px" }}>
            {/* Recent meetings */}
            <div className="glass-card" style={{ padding: "32px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h3 style={{ fontSize: "18px", margin: 0 }}>Recent Meetings</h3>
                <button onClick={() => navigate("clients")} style={{ color: "var(--accent-blue)", fontSize: "13px", fontWeight: 600 }}>View All</button>
              </div>
              {(data.recent_meetings || []).length === 0 ? (
                <div style={{ color: "var(--text-muted)", fontSize: "14px", padding: "20px 0" }}>No meetings logged yet.</div>
              ) : (
                (data.recent_meetings || []).map((m, i) => <MeetingRow key={i} m={m} navigate={navigate} />)
              )}
            </div>

            {/* Upcoming follow-ups */}
            <div className="glass-card" style={{ padding: "32px" }}>
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "18px", margin: 0 }}>Upcoming Follow-ups</h3>
              </div>
              {(data.upcoming_follow_ups || []).length === 0 ? (
                <div style={{ color: "var(--text-muted)", fontSize: "14px", padding: "20px 0" }}>No upcoming follow-ups found.</div>
              ) : (
                (data.upcoming_follow_ups || []).map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid var(--border-glass)" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "15px", color: "var(--text-primary)" }}>{m.client_name}</div>
                      <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>{m.follow_up_date}</div>
                    </div>
                    <span style={{
                      fontSize: "11px", fontWeight: 700, padding: "4px 12px", borderRadius: "99px",
                      background: isToday(m.follow_up_date) ? "rgba(245, 158, 11, 0.2)" : "var(--bg-glass)",
                      color: isToday(m.follow_up_date) ? "#f59e0b" : "var(--text-muted)",
                      textTransform: "uppercase"
                    }}>
                      {isToday(m.follow_up_date) ? "Today" : daysUntil(m.follow_up_date)}
                    </span>
                  </div>
                ))
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
