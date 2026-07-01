import React, { useState, useEffect } from "react";
import { ShieldAlert, PhoneCall, MapPin, User, Star, Flame, Loader2 } from "lucide-react";

export default function Emergency({ activeEmergencies, onDispatchEmergency, showToast }) {
  const [category, setCategory] = useState("Electrical");
  const [description, setDescription] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !contactNumber || !address) {
      showToast("Please fill in all details for immediate dispatch", "error");
      return;
    }

    setLoading(true);
    await onDispatchEmergency({ category, description, contactNumber, address });
    setLoading(false);
    
    // Reset form description
    setDescription("");
  };

  return (
    <div style={{ animation: "fadeInUp 0.4s ease-out", padding: "40px 0" }}>
      
      {/* Emergency Alert Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, hsl(343, 90%, 60%) 0%, #be123c 100%)",
          color: "white",
          padding: "30px",
          borderRadius: "24px",
          display: "flex",
          alignItems: "center",
          gap: "24px",
          marginBottom: "40px",
          boxShadow: "0 10px 30px rgba(225, 29, 72, 0.3)",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.2)",
            padding: "16px",
            borderRadius: "50%",
            animation: "pulse 2s infinite",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ShieldAlert size={36} />
        </div>
        <div style={{ flex: 1, minWidth: "250px" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Immediate Response Emergency Services</h2>
          <p style={{ opacity: 0.9, fontSize: "0.95rem", marginTop: "4px" }}>
            Got a dangerous spark, a burst pipe, or locked out? Request an emergency specialist. Dispatch takes less than 5 minutes.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "30px" }}>
        
        {/* Step-by-Step Dispatch Form */}
        <div className="glass-card" style={{ padding: "30px", height: "fit-content" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Flame size={20} color="var(--accent)" /> Request Emergency Dispatch
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Select Emergency Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Electrical">Electrical (Short Circuit, Sparking, Total Blackout)</option>
                <option value="Plumbing">Plumbing (Burst Pipe, Sewage Blockage, Faucet Flood)</option>
                <option value="Security">Security (Main Lockout, Smart Lock Glitch, Broken Window)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Describe the Emergency</label>
              <textarea
                placeholder="Describe what happened so the dispatch expert carries correct gear..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ minHeight: "90px" }}
              />
            </div>

            <div className="form-group">
              <label>Emergency Contact Number</label>
              <input
                type="tel"
                placeholder="Enter active phone number"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "24px" }}>
              <label>Location / Address</label>
              <input
                type="text"
                placeholder="Flat / House details, building name, street..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-danger" style={{ width: "100%" }} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Dispatching...
                </>
              ) : (
                <>
                  <PhoneCall size={18} /> Dispatch Specialist Now
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Active Emergencies Dashboard */}
        <div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "20px" }}>
            Live Emergency Tracking ({activeEmergencies.length})
          </h3>

          {activeEmergencies.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {activeEmergencies.map((em) => (
                <div
                  key={em._id}
                  className="glass-card"
                  style={{
                    padding: "24px",
                    border: "1px solid var(--accent)",
                    boxShadow: "0 4px 20px rgba(244, 63, 94, 0.08)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <span
                      style={{
                        background: "var(--accent)",
                        color: "white",
                        padding: "4px 10px",
                        borderRadius: "10px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                      }}
                    >
                      {em.category} Emergency
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
                      Requested: {new Date(em.createdAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <p style={{ fontSize: "0.9rem", fontWeight: 500, marginBottom: "12px" }}>
                    "{em.description}"
                  </p>

                  <div style={{ display: "flex", gap: "8px", color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "16px" }}>
                    <MapPin size={14} style={{ marginTop: "2px" }} />
                    <span>{em.address}</span>
                  </div>

                  {/* Assigned Provider Detail */}
                  <div
                    style={{
                      background: "var(--bg-main)",
                      padding: "16px",
                      borderRadius: "12px",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>
                      DISPATCH STATUS: ON THE WAY
                    </span>

                    {em.assignedProfessional ? (
                      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <img
                          src={em.assignedProfessional.image}
                          alt={em.assignedProfessional.name}
                          style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover" }}
                        />
                        <div>
                          <span style={{ fontWeight: 700, fontSize: "0.9rem", display: "block" }}>
                            {em.assignedProfessional.name}
                          </span>
                          <div style={{ display: "flex", gap: "10px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            <span>{em.assignedProfessional.experience} yrs exp</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                              <Star size={12} fill="var(--warning)" stroke="var(--warning)" />
                              {em.assignedProfessional.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)" }}>
                        <Loader2 size={16} className="animate-spin" />
                        <span style={{ fontSize: "0.8rem" }}>Searching for closest available specialist...</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="glass-card"
              style={{
                padding: "40px",
                textAlign: "center",
                color: "var(--text-muted)",
                background: "white",
              }}
            >
              <ShieldAlert size={36} style={{ margin: "0 auto 12px auto" }} />
              <p style={{ fontSize: "0.95rem", fontWeight: 600 }}>No active emergency dispatches.</p>
              <p style={{ fontSize: "0.85rem", marginTop: "4px" }}>
                Use the dispatch form on the left if you need urgent technical service.
              </p>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
          70% { transform: scale(1); box-shadow: 0 0 0 12px rgba(255, 255, 255, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
