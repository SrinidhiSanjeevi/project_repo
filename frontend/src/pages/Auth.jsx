import React, { useState } from "react";
import { Lock, Mail, User, Sparkles } from "lucide-react";

export default function Auth({ onLoginSuccess, showToast }) {
  const [tab, setTab] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (tab === "signup" && !name)) {
      showToast("Please fill in all fields", "error");
      return;
    }

    setLoading(true);
    const endpoint = tab === "login" ? "/api/auth/login" : "/api/auth/signup";
    const body = tab === "login" ? { email, password } : { name, email, password };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok && data.success) {
        if (tab === "login") {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          showToast("Welcome back!", "success");
          onLoginSuccess(data.user, data.token);
        } else {
          showToast("Registration successful! Please login.", "success");
          setTab("login");
          setPassword("");
        }
      } else {
        showToast(data.message || "Something went wrong", "error");
      }
    } catch (error) {
      setLoading(false);
      showToast("Server connection failed", "error");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #e0e7ff 0%, #cffafe 100%)",
        padding: "20px",
      }}
    >
      <div
        className="glass-card"
        style={{
          width: "440px",
          padding: "40px",
          borderRadius: "24px",
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 40px -15px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div
            style={{
              display: "inline-flex",
              background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
              color: "white",
              padding: "12px",
              borderRadius: "16px",
              marginBottom: "12px",
            }}
          >
            <Sparkles size={24} />
          </div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800 }}>HomeEase</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "4px" }}>
            Premium On-Demand Home Services
          </p>
        </div>

        {/* Tab Controls */}
        <div
          style={{
            display: "flex",
            background: "#f1f5f9",
            padding: "4px",
            borderRadius: "12px",
            marginBottom: "24px",
          }}
        >
          <button
            onClick={() => setTab("login")}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              background: tab === "login" ? "white" : "transparent",
              color: tab === "login" ? "var(--primary)" : "var(--text-muted)",
              boxShadow: tab === "login" ? "var(--shadow-sm)" : "none",
              fontSize: "0.9rem",
              fontWeight: 700,
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab("signup")}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              background: tab === "signup" ? "white" : "transparent",
              color: tab === "signup" ? "var(--primary)" : "var(--text-muted)",
              boxShadow: tab === "signup" ? "var(--shadow-sm)" : "none",
              fontSize: "0.9rem",
              fontWeight: 700,
            }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {tab === "signup" && (
            <div className="form-group">
              <label>Full Name</label>
              <div style={{ position: "relative" }}>
                <User
                  size={18}
                  style={{ position: "absolute", left: "14px", top: "14px", color: "var(--text-muted)" }}
                />
                <input
                  type="text"
                  placeholder="e.g., John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: "44px" }}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail
                size={18}
                style={{ position: "absolute", left: "14px", top: "14px", color: "var(--text-muted)" }}
              />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: "44px" }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "24px" }}>
            <label>Password</label>
            <div style={{ position: "relative" }}>
              <Lock
                size={18}
                style={{ position: "absolute", left: "14px", top: "14px", color: "var(--text-muted)" }}
              />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: "44px" }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", height: "48px" }}
          >
            {loading ? "Please wait..." : tab === "login" ? "Sign In" : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
