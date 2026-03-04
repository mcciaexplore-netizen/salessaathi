import { useEffect, useState } from "react";

const TEMP_COLOR = { hot: "#ef4444", warm: "#f59e0b", cold: "#3b82f6" };
const TEMP_BG    = { hot: "#fee2e2", warm: "#fef3c7", cold: "#dbeafe" };

function StatCard({ icon, label, value, color, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px",
      padding: "20px", cursor: onClick ? "pointer" : "default",
      borderTop: `4px solid ${color}`,
      flex: 1,
    }}>
      <div style={{ fontSize: "24px", marginBottom: "8px" }}>{icon}</div>
      <div style={{ fontSize: "28px", fontWeight: 700, color: "#0f172a", fontFamily: "'Sora', sans-serif" }}>{value}</div>
      <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>{label}</div>
    </div>
  );
}

function MeetingRow({ m, navigate }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "12px 0", borderBottom: "1px solid #f1f5f9",
    }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: "14px", color: "#1e293b" }}>
          {m.client_name || "Unknown Client"}
          {m.client_company && <span style={{ fontWeight: 400, color: "#64748b" }}> · {m.client_company}</span>}
        </div>
        <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
          {m.meeting_date} {m.follow_up_date && `· Follow-up: ${m.follow_up_date}`}
        </div>
      </div>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <span style={{
          fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px",
          background: TEMP_BG[m.deal_temp] || "#f1f5f9",
          color: TEMP_COLOR[m.deal_temp] || "#475569",
          textTransform: "capitalize",
        }}>{m.deal_temp || "warm"}</span>
        {m.client_id && (
          <button onClick={() => navigate("client-detail", { clientId: m.client_id })}
            style={{ background: "#eff6ff", border: "none", borderRadius: "6px", padding: "4px 10px", fontSize: "12px", color: "#1d4ed8", cursor: "pointer" }}>
            View →
          </button>
        )}
      </div>
    </div>
  );
}

export default function Dashboard({ navigate }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch("/api/dashboard")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div style={{ padding: "32px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>{today}</div>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "24px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
          Good {getGreeting()} 👋
        </h1>
        <p style={{ color: "#64748b", fontSize: "14px", margin: "4px 0 0" }}>Here's your sales overview for today.</p>
      </div>

      {loading ? (
        <div style={{ color: "#94a3b8", fontSize: "14px" }}>Loading…</div>
      ) : !data ? (
        <div style={{ color: "#ef4444", fontSize: "14px" }}>Could not load dashboard. Is the backend running?</div>
      ) : (
        <>
          {/* Stat cards */}
          <div style={{ display: "flex", gap: "16px", marginBottom: "28px", flexWrap: "wrap" }}>
            <StatCard icon="🔴" label="Overdue follow-ups"  value={data.overdue_follow_ups} color="#ef4444" />
            <StatCard icon="📅" label="Due today"           value={data.due_today}          color="#f59e0b" />
            <StatCard icon="🔥" label="Hot deals"           value={data.hot_deals}          color="#10b981" onClick={() => navigate("pipeline")} />
            <StatCard icon="👥" label="Total clients"       value={data.total_clients}      color="#3b82f6" onClick={() => navigate("clients")} />
          </div>

          {/* Empty state */}
          {data.total_clients === 0 && (
            <div style={{
              background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
              border: "1px solid #bfdbfe", borderRadius: "16px",
              padding: "40px", textAlign: "center", marginBottom: "24px",
            }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📸</div>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "20px", color: "#1e3a8a", marginBottom: "8px" }}>
                Log your first meeting
              </h2>
              <p style={{ color: "#3b82f6", fontSize: "14px", marginBottom: "20px" }}>
                Take a photo of your handwritten meeting notes. AI will extract everything in seconds.
              </p>
              <button onClick={() => navigate("log-meeting")} style={{
                background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                color: "#fff", border: "none", borderRadius: "10px",
                padding: "12px 28px", fontSize: "14px", fontWeight: 600, cursor: "pointer",
              }}>
                📸 Upload meeting notes →
              </button>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {/* Recent meetings */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: "15px", fontWeight: 600, color: "#0f172a", margin: 0 }}>Recent Meetings</h3>
                <button onClick={() => navigate("clients")} style={{ background: "none", border: "none", color: "#3b82f6", fontSize: "12px", cursor: "pointer" }}>View all →</button>
              </div>
              {(data.recent_meetings || []).length === 0 ? (
                <div style={{ color: "#94a3b8", fontSize: "13px", padding: "16px 0" }}>No meetings yet.</div>
              ) : (
                (data.recent_meetings || []).map((m, i) => <MeetingRow key={i} m={m} navigate={navigate} />)
              )}
            </div>

            {/* Upcoming follow-ups */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: "15px", fontWeight: 600, color: "#0f172a", margin: 0 }}>Upcoming Follow-ups</h3>
              </div>
              {(data.upcoming_follow_ups || []).length === 0 ? (
                <div style={{ color: "#94a3b8", fontSize: "13px", padding: "16px 0" }}>No upcoming follow-ups.</div>
              ) : (
                (data.upcoming_follow_ups || []).map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "13.5px", color: "#1e293b" }}>{m.client_name}</div>
                      <div style={{ fontSize: "12px", color: "#94a3b8" }}>{m.follow_up_date}</div>
                    </div>
                    <span style={{
                      fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: "999px",
                      background: isToday(m.follow_up_date) ? "#fef3c7" : "#f1f5f9",
                      color: isToday(m.follow_up_date) ? "#92400e" : "#475569",
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
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
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
