import { useState } from "react";
import { LogIn, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { T, font } from "../../lib/theme";

export default function MitraLogin({ onLogin, onBack }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      if (username === "mitra" && password === "mitra") {
        onLogin({ username, name: "Mitra User", role: "mitra" });
      } else {
        setError("Username atau password salah.");
      }
      setLoading(false);
    }, 500);
  };

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.08)",
    fontSize: 14,
    color: "#fff",
    boxSizing: "border-box",
    outline: "none",
    fontFamily: font.body,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A1628",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: font.body,
        padding: 24,
      }}
    >
      {/* Background decoration */}
      <div style={{
        position: "fixed",
        inset: 0,
        background: "radial-gradient(ellipse at 60% 20%, rgba(255,199,44,0.07) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(14,76,146,0.18) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />

      {/* Back button */}
      <div style={{ width: "100%", maxWidth: 420, marginBottom: 20, position: "relative", zIndex: 1 }}>
        <button
          onClick={onBack}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "transparent", border: "none",
            color: "rgba(255,255,255,0.6)", cursor: "pointer",
            fontSize: 13, fontWeight: 500, padding: 0,
            fontFamily: font.body,
          }}
        >
          <ArrowLeft size={15} />
          Kembali ke Portal
        </button>
      </div>

      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 16,
          padding: "36px 32px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo & Title */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: "linear-gradient(135deg, #FFC72C 0%, #E6A700 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 14px",
            boxShadow: "0 8px 24px rgba(255,199,44,0.25)",
          }}>
            <LogIn size={24} color="#0A1628" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>
            Portal Mitra
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
            Sistem Pengajuan Kerjasama Mitra PLN
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 6, display: "block" }}>
              Username
            </label>
            <input
              style={inputStyle}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              required
              autoFocus
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 6, display: "block" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                style={{ ...inputStyle, paddingRight: 44 }}
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: "rgba(255,255,255,0.5)", padding: 0, display: "flex",
                }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              padding: "10px 14px", borderRadius: 8,
              background: "rgba(176,24,24,0.15)", border: "1px solid rgba(176,24,24,0.3)",
              color: "#F87171", fontSize: 13,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px 24px", borderRadius: 8, border: "none",
              background: loading ? "rgba(255,199,44,0.5)" : "linear-gradient(135deg, #FFC72C 0%, #E6A700 100%)",
              color: "#0A1628", cursor: loading ? "not-allowed" : "pointer",
              fontSize: 14, fontWeight: 700, marginTop: 6,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              fontFamily: font.body,
              boxShadow: loading ? "none" : "0 4px 16px rgba(255,199,44,0.3)",
              transition: "all .15s ease",
            }}
          >
            <LogIn size={15} />
            {loading ? "Masuk..." : "Masuk"}
          </button>
        </form>

        <div style={{ marginTop: 20, padding: "12px 14px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textAlign: "center" }}>
            Demo: username <strong style={{ color: "rgba(255,255,255,0.5)" }}>mitra</strong> / password <strong style={{ color: "rgba(255,255,255,0.5)" }}>mitra</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
