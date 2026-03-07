import { useEffect, useState } from "react";
import { api } from "../services/api";

const STATUS_OPTIONS = [
  "New Lead", "Contacted", "Interested", "Follow-Up Required", "Converted", "Not Interested"
];

const STAGE_COLORS = {
  "New Lead": "badge-new",
  "Contacted": "badge-contacted",
  "Interested": "badge-interested",
  "Follow-Up Required": "badge-followup",
  "Converted": "badge-converted",
  "Not Interested": "badge-not-interested"
};

export default function Clients({ navigate }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchLeads = (q = "") => {
    setLoading(true);
    api.leads.list(q)
      .then(d => {
        setLeads(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    // Simple Debounce
    const timeoutId = setTimeout(() => {
      fetchLeads(e.target.value);
    }, 500);
    return () => clearTimeout(timeoutId);
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await api.leads.update(leadId, { deal_stage: newStatus });
      setLeads(leads.map(l => l.id === leadId ? { ...l, deal_stage: newStatus } : l));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="animate-fade-in">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.85rem", marginBottom: "0.5rem" }}>Lead Management</h1>
          <p style={{ color: "var(--text-secondary)" }}>Track and manage your company leads across the funnel.</p>
        </div>
        <button className="btn-primary" onClick={() => navigate("log-meeting")}>
          ➕ Add New Lead
        </button>
      </header>

      <div className="card" style={{ marginBottom: "2rem", padding: "1rem" }}>
        <input
          type="text"
          placeholder="Search by company, contact or phone..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            fetchLeads(e.target.value);
          }}
          style={{
            width: "100%",
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            border: "1px solid var(--border-color)",
            outline: "none",
            backgroundColor: "var(--bg-secondary)",
            fontSize: "0.9rem",
            fontFamily: 'inherit'
          }}
        />
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-secondary)" }}>Loading leads...</div>
        ) : leads.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", backgroundColor: "var(--bg-secondary)" }}>
                  <th style={{ padding: "1rem 1.5rem", fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "600", textTransform: 'uppercase' }}>Company</th>
                  <th style={{ padding: "1rem 1.5rem", fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "600", textTransform: 'uppercase' }}>Contact Person</th>
                  <th style={{ padding: "1rem 1.5rem", fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "600", textTransform: 'uppercase' }}>Interest / Source</th>
                  <th style={{ padding: "1rem 1.5rem", fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "600", textTransform: 'uppercase' }}>Phone/Email</th>
                  <th style={{ padding: "1rem 1.5rem", fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "600", textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: "1rem 1.5rem", fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "600", textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <div style={{ fontWeight: "600", fontSize: '0.9rem' }}>{lead.company}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Added {new Date(lead.created_at).toLocaleDateString()}</div>
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem", fontSize: "0.85rem" }}>{lead.name}</td>
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <div style={{ fontSize: "0.8rem", color: 'var(--text-primary)' }}>{lead.service_interest || "N/A"}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{lead.lead_source || "Unknown"}</div>
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem", fontSize: "0.8rem" }}>
                      <div>{lead.phone}</div>
                      <div style={{ color: "var(--text-muted)" }}>{lead.email}</div>
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <select
                        value={lead.deal_stage}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        style={{
                          padding: "0.4rem 0.6rem",
                          borderRadius: "6px",
                          border: "1px solid var(--border-color)",
                          fontSize: "0.75rem",
                          backgroundColor: "white",
                          cursor: "pointer",
                          fontFamily: 'inherit',
                          minWidth: '140px'
                        }}
                      >
                        {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <button
                        onClick={() => navigate("client-detail", { clientId: lead.id })}
                        style={{ color: "var(--accent-primary)", fontWeight: "600", fontSize: "0.8rem", background: "none" }}
                      >
                        Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "5rem 2rem", textAlign: "center", color: "var(--text-secondary)" }}>
            <p>No leads found in the system. Start by adding one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
