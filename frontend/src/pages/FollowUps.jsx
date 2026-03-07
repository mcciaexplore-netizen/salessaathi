import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function FollowUps({ navigate }) {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // We can use the same clients API and filter on frontend for now, 
        // or add a specific follow-ups API. Let's filter on frontend for simplicity.
        api.leads.list()
            .then(d => {
                const withFollowups = d.filter(l => l.next_follow_up_date)
                    .sort((a, b) => new Date(a.next_follow_up_date) - new Date(b.next_follow_up_date));
                setLeads(withFollowups);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const isOverdue = (dateStr) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(dateStr) < today;
    };

    const isToday = (dateStr) => {
        const today = new Date().toISOString().split('T')[0];
        return dateStr === today;
    };

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: "2.5rem" }}>
                <h1 style={{ fontSize: "1.85rem", marginBottom: "0.5rem" }}>Upcoming & Pending Follow-Ups</h1>
                <p style={{ color: "var(--text-secondary)" }}>Don't miss a beat. Keep track of all your scheduled interactions.</p>
            </header>

            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                {loading ? (
                    <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-secondary)" }}>Loading follow-ups...</div>
                ) : leads.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ textAlign: "left", backgroundColor: "var(--bg-secondary)" }}>
                                    <th style={{ padding: "1rem 1.5rem", fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "600", textTransform: 'uppercase' }}>Date</th>
                                    <th style={{ padding: "1rem 1.5rem", fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "600", textTransform: 'uppercase' }}>Company</th>
                                    <th style={{ padding: "1rem 1.5rem", fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "600", textTransform: 'uppercase' }}>Contact Person</th>
                                    <th style={{ padding: "1rem 1.5rem", fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "600", textTransform: 'uppercase' }}>Notes</th>
                                    <th style={{ padding: "1rem 1.5rem", fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "600", textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: "1rem 1.5rem", fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "600", textTransform: 'uppercase' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leads.map(lead => (
                                    <tr key={lead.id} style={{
                                        borderBottom: "1px solid var(--border-color)",
                                        backgroundColor: isOverdue(lead.next_follow_up_date) ? "rgba(239, 68, 68, 0.02)" : "transparent"
                                    }}>
                                        <td style={{ padding: "1.25rem 1.5rem" }}>
                                            <div style={{
                                                fontWeight: "600",
                                                fontSize: '0.85rem',
                                                color: isOverdue(lead.next_follow_up_date) ? "#ef4444" :
                                                    isToday(lead.next_follow_up_date) ? "var(--accent-primary)" : "inherit"
                                            }}>
                                                {new Date(lead.next_follow_up_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                {isToday(lead.next_follow_up_date) && <span style={{ marginLeft: '8px', fontSize: '0.7rem' }}>TODAY</span>}
                                                {isOverdue(lead.next_follow_up_date) && <span style={{ marginLeft: '8px', fontSize: '0.7rem' }}>OVERDUE</span>}
                                            </div>
                                        </td>
                                        <td style={{ padding: "1.25rem 1.5rem" }}>
                                            <div style={{ fontWeight: "600", fontSize: '0.9rem' }}>{lead.company}</div>
                                        </td>
                                        <td style={{ padding: "1.25rem 1.5rem", fontSize: "0.85rem" }}>{lead.name}</td>
                                        <td style={{ padding: "1.25rem 1.5rem", fontSize: "0.85rem", maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {lead.follow_up_notes || <span style={{ color: 'var(--text-muted)' }}>No notes</span>}
                                        </td>
                                        <td style={{ padding: "1.25rem 1.5rem" }}>
                                            <span className={`badge badge-${lead.deal_stage?.toLowerCase().replace(/\s+/g, "-") || "new"}`}>
                                                {lead.deal_stage}
                                            </span>
                                        </td>
                                        <td style={{ padding: "1.25rem 1.5rem" }}>
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
                    <div style={{ padding: "5rem 2rem", textAlign: "center", color: "var(--text-secondary)" }}>
                        <p>No follow-ups scheduled.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
