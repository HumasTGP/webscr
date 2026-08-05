import { useState } from "react";
import { AlertTriangle, Eye } from "lucide-react";
import { font } from "../../lib/theme";
import AutoLogo from "../../components/AutoLogo";
import PartnerLogos from "../../components/PartnerLogos";

const DEFAULT_BG =
  "radial-gradient(circle at 15% 20%, rgba(255,199,44,0.28), transparent 45%),"
  + " radial-gradient(circle at 85% 82%, rgba(14,76,146,0.55), transparent 50%),"
  + " linear-gradient(135deg, #051428 0%, #0A2A50 40%, #0E4C92 100%)";

function GlassInput({ endAdornment, style, ...props }) {
  return (
    <div style={{ position: "relative", ...style }}>
      <input
        {...props}
        style={{
          width: "100%",
          height: 50,
          boxSizing: "border-box",
          padding: `0 ${endAdornment ? 44 : 18}px 0 18px`,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.30)",
          background: "rgba(255,255,255,0.15)",
          color: "#fff",
          fontSize: 14,
          outline: "none",
        }}
      />
      {endAdornment && (
        <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>
          {endAdornment}
        </div>
      )}
    </div>
  );
}

// Akun bersama satpam. Ganti sesuai kebutuhan tim keamanan.
const SILAPAK_USERNAME = "satpam.priok";
const SILAPAK_PASSWORD = "lapakpriok26";

export default function SilapakLogin({ onLogin, onBack }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Username dan password wajib diisi.");
      return;
    }
    if (username.trim() !== SILAPAK_USERNAME || password !== SILAPAK_PASSWORD) {
      setError("Username atau password salah.");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => onLogin(), 300);
  };

  return (
    <div
      className="login-page"
      style={{
        background: DEFAULT_BG,
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: font.body,
      }}
    >
      <div
        className="login-glass"
        style={{
          width: "100%",
          maxWidth: 420,
          padding: "42px 40px 38px",
          borderRadius: 22,
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(24px) saturate(140%)",
          WebkitBackdropFilter: "blur(24px) saturate(140%)",
          border: "1px solid rgba(255,255,255,0.22)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.10)",
          color: "#fff",
          animation: "fade-in .35s ease",
        }}
      >
        <h1
          style={{
            fontFamily: font.display,
            fontSize: 34,
            fontWeight: 700,
            textAlign: "center",
            margin: "0 0 6px",
            letterSpacing: -0.5,
            textShadow: "0 2px 8px rgba(0,0,0,0.25)",
          }}
        >
          Si Lapak Priok
        </h1>
        <p
          style={{
            textAlign: "center",
            margin: "0 0 26px",
            fontSize: 13,
            fontWeight: 500,
            color: "rgba(255,255,255,0.85)",
          }}
        >
          Penerimaan tamu &amp; paket
        </p>

        <form onSubmit={submit}>
          <GlassInput
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            autoComplete="username"
          />
          <GlassInput
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            style={{ marginTop: 12 }}
            endAdornment={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                style={{
                  background: "transparent",
                  border: "none",
                  color: showPassword ? "#fff" : "rgba(255,255,255,0.55)",
                  cursor: "pointer",
                  padding: 4,
                  display: "flex",
                }}
              >
                <Eye size={17} />
              </button>
            }
          />

          {error && (
            <div
              role="alert"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 14,
                padding: "9px 12px",
                borderRadius: 9,
                background: "rgba(255,90,70,0.20)",
                border: "1px solid rgba(255,90,70,0.35)",
                color: "#FFC5B8",
                fontSize: 12.5,
              }}
            >
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px 20px",
              marginTop: 22,
              borderRadius: 999,
              border: "none",
              background: loading
                ? "linear-gradient(90deg, #E5A916, #FFC72C)"
                : "linear-gradient(90deg, #F2AE1E 0%, #FFC72C 100%)",
              color: "#3A2A00",
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: 2.5,
              cursor: loading ? "wait" : "pointer",
              boxShadow: "0 8px 24px rgba(255,199,44,0.35)",
              textTransform: "uppercase",
            }}
          >
            {loading ? "Memeriksa akun…" : "Login"}
          </button>
        </form>

        <button
          type="button"
          onClick={onBack}
          style={{
            display: "block",
            margin: "18px auto 0",
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,0.6)",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          &#8249; Kembali ke pilihan layanan
        </button>
      </div>

      <div className="powered-by-strip" style={{ fontFamily: font.body }}>
        <span className="powered-by-label">Powered by</span>
        <div className="powered-by-logos">
          <div className="powered-by-logo-box">
            <AutoLogo alt="PLN" />
          </div>
          <PartnerLogos />
        </div>
      </div>
    </div>
  );
}
