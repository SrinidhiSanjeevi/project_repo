import React, { useState, useEffect } from "react";
import {
  LayoutDashboard, Users, Calendar, Wrench, ShieldAlert,
  TrendingUp, ChevronDown, Trash2, CheckCircle, Clock,
  XCircle, AlertTriangle, Star, RefreshCw, LogOut, Sparkles
} from "lucide-react";

const BASE = "/api/admin";

export default function AdminDashboard({ token, user, onLogout }) {
  const [activeSection, setActiveSection] = useState("overview");
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchStats = async () => {
    const res = await fetch(`${BASE}/stats`, { headers });
    const d = await res.json();
    if (d.success) { setStats(d.stats); setRecentBookings(d.recentBookings); }
  };
  const fetchUsers = async () => {
    const res = await fetch(`${BASE}/users`, { headers });
    const d = await res.json();
    if (d.success) setUsers(d.users);
  };
  const fetchBookings = async () => {
    const res = await fetch(`${BASE}/bookings`, { headers });
    const d = await res.json();
    if (d.success) setBookings(d.bookings);
  };
  const fetchServices = async () => {
    const res = await fetch(`${BASE}/services`, { headers });
    const d = await res.json();
    if (d.success) setServices(d.services);
  };
  const fetchProfessionals = async () => {
    const res = await fetch(`${BASE}/professionals`, { headers });
    const d = await res.json();
    if (d.success) setProfessionals(d.professionals);
  };
  const fetchEmergencies = async () => {
    const res = await fetch(`${BASE}/emergencies`, { headers });
    const d = await res.json();
    if (d.success) setEmergencies(d.emergencies);
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchUsers(), fetchBookings(), fetchServices(), fetchProfessionals(), fetchEmergencies()]);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    const res = await fetch(`${BASE}/users/${id}`, { method: "DELETE", headers });
    const d = await res.json();
    if (d.success) { showToast("User deleted"); fetchUsers(); fetchStats(); }
    else showToast(d.message, "error");
  };

  const handleStatusChange = async (bookingId, status) => {
    const res = await fetch(`${BASE}/bookings/${bookingId}/status`, {
      method: "PUT", headers: jsonHeaders, body: JSON.stringify({ status })
    });
    const d = await res.json();
    if (d.success) { showToast(`Booking marked as ${status}`); fetchBookings(); fetchStats(); }
    else showToast(d.message, "error");
  };

  const statusColor = (s) => ({
    pending: "#f59e0b", confirmed: "#3b82f6",
    completed: "#10b981", cancelled: "#ef4444"
  }[s] || "#6b7280");

  const statusIcon = (s) => ({
    pending: <Clock size={14} />,
    confirmed: <CheckCircle size={14} />,
    completed: <Star size={14} />,
    cancelled: <XCircle size={14} />
  }[s] || <Clock size={14} />);

  const navItems = [
    { id: "overview",       label: "Overview",      icon: LayoutDashboard },
    { id: "users",          label: "Users",         icon: Users },
    { id: "bookings",       label: "Bookings",      icon: Calendar },
    { id: "services",       label: "Services",      icon: Wrench },
    { id: "professionals",  label: "Professionals", icon: Star },
    { id: "emergencies",    label: "Emergencies",   icon: ShieldAlert },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8f9fa", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside style={{
        width: "240px", background: "#0f0f0f", color: "#fff",
        display: "flex", flexDirection: "column",
        position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 200
      }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px", borderBottom: "1px solid #222" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              background: "linear-gradient(135deg, #fff 0%, #d1d5db 100%)",
              color: "#000", width: "36px", height: "36px",
              borderRadius: "10px", display: "flex", alignItems: "center",
              justifyContent: "center"
            }}>
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ fontSize: "1rem", fontWeight: 800 }}>HomeEase</div>
              <div style={{ fontSize: "0.7rem", color: "#888", fontWeight: 500 }}>ADMIN PANEL</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "12px",
                  padding: "10px 14px", borderRadius: "10px", marginBottom: "4px",
                  background: active ? "#fff" : "transparent",
                  color: active ? "#000" : "#999",
                  fontWeight: active ? 700 : 500, fontSize: "0.88rem",
                  border: "none", cursor: "pointer", transition: "all 0.15s",
                  textAlign: "left"
                }}
              >
                <Icon size={17} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div style={{ padding: "16px 12px", borderTop: "1px solid #222" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <div style={{
              width: "34px", height: "34px", borderRadius: "50%",
              background: "#333", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "0.8rem", fontWeight: 700, color: "#fff"
            }}>
              {user?.name?.substring(0, 2).toUpperCase() || "AD"}
            </div>
            <div>
              <div style={{ fontSize: "0.82rem", fontWeight: 700 }}>{user?.name}</div>
              <div style={{ fontSize: "0.7rem", color: "#888" }}>Administrator</div>
            </div>
          </div>
          <button onClick={onLogout} style={{
            width: "100%", display: "flex", alignItems: "center", gap: "8px",
            padding: "8px 12px", borderRadius: "8px", background: "transparent",
            border: "1px solid #333", color: "#888", cursor: "pointer",
            fontSize: "0.82rem", fontWeight: 500, transition: "all 0.15s"
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "#1a1a1a"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#888"; }}
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────── */}
      <main style={{ marginLeft: "240px", flex: 1, padding: "32px", minHeight: "100vh" }}>
        {/* Toast */}
        {toast && (
          <div style={{
            position: "fixed", top: "20px", right: "20px", zIndex: 9999,
            background: toast.type === "error" ? "#ef4444" : "#10b981",
            color: "#fff", padding: "12px 20px", borderRadius: "12px",
            fontWeight: 600, fontSize: "0.9rem", boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
          }}>
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, margin: 0, color: "#0f0f0f" }}>
              {navItems.find(n => n.id === activeSection)?.label}
            </h1>
            <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "0.9rem" }}>
              HomeEase Admin Control Panel
            </p>
          </div>
          <button onClick={loadAll} style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 18px", borderRadius: "12px",
            background: "#0f0f0f", color: "#fff", border: "none",
            cursor: "pointer", fontSize: "0.88rem", fontWeight: 600
          }}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#6b7280" }}>
            <div style={{ fontSize: "2rem", marginBottom: "12px" }}>⏳</div>
            <p>Loading admin data...</p>
          </div>
        ) : (
          <>
            {/* ── OVERVIEW ──────────────────────────────── */}
            {activeSection === "overview" && stats && (
              <div>
                {/* Stats Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "32px" }}>
                  {[
                    { label: "Total Users",       value: stats.totalUsers,       icon: "👥", color: "#3b82f6" },
                    { label: "Total Bookings",    value: stats.totalBookings,    icon: "📋", color: "#8b5cf6" },
                    { label: "Total Revenue",     value: `₹${stats.totalRevenue?.toLocaleString("en-IN")}`, icon: "💰", color: "#10b981" },
                    { label: "Services",          value: stats.totalServices,    icon: "🛠", color: "#f59e0b" },
                    { label: "Professionals",     value: stats.totalProfessionals, icon: "🧑‍🔧", color: "#ec4899" },
                    { label: "Emergencies",       value: stats.totalEmergencies, icon: "🚨", color: "#ef4444" },
                  ].map(({ label, value, icon, color }) => (
                    <div key={label} style={{
                      background: "#fff", borderRadius: "16px", padding: "20px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #f3f4f6"
                    }}>
                      <div style={{ fontSize: "1.8rem", marginBottom: "8px" }}>{icon}</div>
                      <div style={{ fontSize: "1.6rem", fontWeight: 800, color }}>{value}</div>
                      <div style={{ fontSize: "0.82rem", color: "#6b7280", fontWeight: 500, marginTop: "4px" }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Booking Status Breakdown */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
                  <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                    <h3 style={{ fontWeight: 700, marginBottom: "16px", fontSize: "1rem" }}>Booking Status Breakdown</h3>
                    {[
                      { label: "Pending",   value: stats.pendingBookings,   color: "#f59e0b" },
                      { label: "Confirmed", value: stats.confirmedBookings, color: "#3b82f6" },
                      { label: "Completed", value: stats.completedBookings, color: "#10b981" },
                      { label: "Cancelled", value: stats.cancelledBookings, color: "#ef4444" },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                        <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: color, flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: "0.88rem", color: "#374151" }}>{label}</span>
                        <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{value}</span>
                        <div style={{
                          height: "6px", width: `${Math.max((value / (stats.totalBookings || 1)) * 100, 2)}%`,
                          background: color, borderRadius: "3px", maxWidth: "80px"
                        }} />
                      </div>
                    ))}
                  </div>

                  {/* Recent Bookings */}
                  <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                    <h3 style={{ fontWeight: 700, marginBottom: "16px", fontSize: "1rem" }}>Recent Bookings</h3>
                    {recentBookings.map((b) => (
                      <div key={b._id} style={{
                        display: "flex", justifyContent: "space-between",
                        alignItems: "center", padding: "8px 0",
                        borderBottom: "1px solid #f3f4f6"
                      }}>
                        <div>
                          <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{b.user?.name || "Guest"}</div>
                          <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{b.service?.name || b.customServiceName || "Custom Request"}</div>
                        </div>
                        <span style={{
                          padding: "3px 10px", borderRadius: "20px", fontSize: "0.75rem",
                          fontWeight: 600, background: `${statusColor(b.status)}22`, color: statusColor(b.status)
                        }}>
                          {b.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── USERS ─────────────────────────────────── */}
            {activeSection === "users" && (
              <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "hidden" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontWeight: 700, margin: 0 }}>All Users ({users.length})</h3>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f9fafb" }}>
                        {["Name", "Email", "Role", "Phone", "Joined", "Actions"].map(h => (
                          <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.8rem", fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #f3f4f6" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id} style={{ borderBottom: "1px solid #f9fafb" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <div style={{
                                width: "34px", height: "34px", borderRadius: "50%",
                                background: u.role === "admin" ? "#0f0f0f" : "#f3f4f6",
                                color: u.role === "admin" ? "#fff" : "#374151",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "0.78rem", fontWeight: 700, flexShrink: 0
                              }}>
                                {u.name?.substring(0, 2).toUpperCase()}
                              </div>
                              <span style={{ fontWeight: 600, fontSize: "0.88rem" }}>{u.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: "14px 16px", fontSize: "0.85rem", color: "#6b7280" }}>{u.email}</td>
                          <td style={{ padding: "14px 16px" }}>
                            <span style={{
                              padding: "3px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700,
                              background: u.role === "admin" ? "#0f0f0f" : "#f3f4f6",
                              color: u.role === "admin" ? "#fff" : "#374151"
                            }}>
                              {u.role?.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: "14px 16px", fontSize: "0.85rem", color: "#6b7280" }}>{u.phone || "—"}</td>
                          <td style={{ padding: "14px 16px", fontSize: "0.82rem", color: "#9ca3af" }}>
                            {new Date(u.createdAt).toLocaleDateString("en-IN")}
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            {u.role !== "admin" && (
                              <button
                                onClick={() => handleDeleteUser(u._id)}
                                style={{
                                  background: "#fef2f2", color: "#ef4444", border: "none",
                                  padding: "6px 10px", borderRadius: "8px", cursor: "pointer",
                                  display: "flex", alignItems: "center", gap: "5px", fontSize: "0.8rem", fontWeight: 600
                                }}
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── BOOKINGS ──────────────────────────────── */}
            {activeSection === "bookings" && (
              <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "hidden" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid #f3f4f6" }}>
                  <h3 style={{ fontWeight: 700, margin: 0 }}>All Bookings ({bookings.length})</h3>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f9fafb" }}>
                        {["Customer", "Service", "Professional", "Amount", "Status", "Date", "Update"].map(h => (
                          <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.8rem", fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #f3f4f6" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b._id} style={{ borderBottom: "1px solid #f9fafb" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{b.user?.name || "—"}</div>
                            <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{b.user?.email}</div>
                          </td>
                          <td style={{ padding: "14px 16px", fontSize: "0.85rem" }}>
                            {b.service?.name || b.customServiceName || "Custom Request"}
                            {b.isCustomRequest && <span style={{ display: "block", fontSize: "0.72rem", color: "#8b5cf6", fontWeight: 600 }}>CUSTOM</span>}
                          </td>
                          <td style={{ padding: "14px 16px", fontSize: "0.85rem", color: "#6b7280" }}>
                            {b.professional?.name || "—"}
                          </td>
                          <td style={{ padding: "14px 16px", fontWeight: 700, fontSize: "0.9rem" }}>
                            ₹{b.amount?.toLocaleString("en-IN") || "0"}
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: "5px",
                              padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 600,
                              background: `${statusColor(b.status)}18`, color: statusColor(b.status)
                            }}>
                              {statusIcon(b.status)} {b.status}
                            </span>
                          </td>
                          <td style={{ padding: "14px 16px", fontSize: "0.8rem", color: "#9ca3af" }}>
                            {new Date(b.createdAt).toLocaleDateString("en-IN")}
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <select
                              defaultValue={b.status}
                              onChange={(e) => handleStatusChange(b._id, e.target.value)}
                              style={{
                                padding: "6px 10px", borderRadius: "8px", border: "1px solid #e5e7eb",
                                fontSize: "0.8rem", cursor: "pointer", background: "#fff", fontWeight: 600
                              }}
                            >
                              {["pending", "confirmed", "completed", "cancelled"].map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── SERVICES ──────────────────────────────── */}
            {activeSection === "services" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                {services.map((s) => (
                  <div key={s._id} style={{
                    background: "#fff", borderRadius: "16px", overflow: "hidden",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #f3f4f6"
                  }}>
                    {s.image && (
                      <img src={s.image} alt={s.name} style={{ width: "100%", height: "140px", objectFit: "cover" }} />
                    )}
                    <div style={{ padding: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                        <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700 }}>{s.name}</h4>
                        <span style={{ fontWeight: 800, fontSize: "0.95rem" }}>₹{s.price}</span>
                      </div>
                      <span style={{
                        display: "inline-block", padding: "2px 10px", borderRadius: "20px",
                        background: "#f3f4f6", fontSize: "0.72rem", fontWeight: 600, color: "#374151", marginBottom: "6px"
                      }}>
                        {s.category}
                      </span>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#6b7280" }}>
                        <span>⏱ {s.duration}</span>
                        <span>⭐ {s.rating} ({s.numRatings})</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── PROFESSIONALS ─────────────────────────── */}
            {activeSection === "professionals" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
                {professionals.map((p) => (
                  <div key={p._id} style={{
                    background: "#fff", borderRadius: "16px", overflow: "hidden",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #f3f4f6",
                    display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px", textAlign: "center"
                  }}>
                    <img
                      src={p.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=0f0f0f&color=fff&size=80`}
                      alt={p.name}
                      style={{ width: "70px", height: "70px", borderRadius: "50%", objectFit: "cover", marginBottom: "12px" }}
                    />
                    <h4 style={{ margin: "0 0 4px", fontSize: "0.95rem", fontWeight: 700 }}>{p.name}</h4>
                    <span style={{
                      display: "inline-block", padding: "2px 10px", borderRadius: "20px",
                      background: "#f3f4f6", fontSize: "0.72rem", fontWeight: 600, color: "#374151", marginBottom: "8px"
                    }}>
                      {p.category}
                    </span>
                    <div style={{ fontSize: "0.82rem", color: "#6b7280", marginBottom: "6px" }}>
                      ⭐ {p.rating} · {p.experience} yrs exp
                    </div>
                    <span style={{
                      padding: "3px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700,
                      background: p.status === "Available" ? "#dcfce7" : "#fef3c7",
                      color: p.status === "Available" ? "#16a34a" : "#d97706"
                    }}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* ── EMERGENCIES ───────────────────────────── */}
            {activeSection === "emergencies" && (
              <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "hidden" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid #f3f4f6" }}>
                  <h3 style={{ fontWeight: 700, margin: 0, color: "#ef4444" }}>
                    🚨 Emergency Requests ({emergencies.length})
                  </h3>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#fef2f2" }}>
                        {["User", "Issue Type", "Description", "Location", "Status", "Raised At"].map(h => (
                          <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.8rem", fontWeight: 600, color: "#ef4444", borderBottom: "1px solid #fee2e2" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {emergencies.map((e) => (
                        <tr key={e._id} style={{ borderBottom: "1px solid #f9fafb" }}
                          onMouseEnter={el => el.currentTarget.style.background = "#fffbfb"}
                          onMouseLeave={el => el.currentTarget.style.background = "transparent"}
                        >
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{e.user?.name || "—"}</div>
                            <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{e.user?.email}</div>
                          </td>
                          <td style={{ padding: "14px 16px", fontSize: "0.85rem", fontWeight: 600 }}>{e.issueType || e.type || "—"}</td>
                          <td style={{ padding: "14px 16px", fontSize: "0.82rem", color: "#6b7280", maxWidth: "200px" }}>
                            {e.description?.substring(0, 80)}{e.description?.length > 80 ? "..." : ""}
                          </td>
                          <td style={{ padding: "14px 16px", fontSize: "0.82rem", color: "#6b7280" }}>{e.location || "—"}</td>
                          <td style={{ padding: "14px 16px" }}>
                            <span style={{
                              padding: "3px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700,
                              background: e.status === "active" ? "#fef2f2" : "#f0fdf4",
                              color: e.status === "active" ? "#ef4444" : "#16a34a"
                            }}>
                              {e.status}
                            </span>
                          </td>
                          <td style={{ padding: "14px 16px", fontSize: "0.8rem", color: "#9ca3af" }}>
                            {new Date(e.createdAt).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {emergencies.length === 0 && (
                    <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>
                      No emergency requests found.
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
