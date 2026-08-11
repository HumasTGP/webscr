import { useState } from "react";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";
import { font } from "../../lib/theme";
import GlassLoginShell from "../../portal/components/GlassLoginShell";
import { SilapakIllustration } from "../../portal/components/LoginIllustrations";

export default function SilapakLogin({ onLogin, onBack, authenticate }) {
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
    const res = authenticate
      ? authenticate("silapak", username.trim(), password)
      : { ok: false, reason: "wrong" };
    if (!res.ok) {
      setError(
        res.reason === "inactive"
          ? "Akun sedang tidak aktif (di luar rentang tanggal berlaku)."
          : "Username atau password salah."
      );
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => onLogin(), 300);
  };

  return (
    <GlassLoginShell
      title="Si Lapak Priok"
      subtitle="Sistem Penerimaan Tamu & Paket — PLN Indonesia Power UBP Priok"
      onBack={onBack}
      illustration={<SilapakIllustration />}
    >
      <form onSubmit={submit} style={{ fontFamily: font.body }}>
        {/* Username */}
        <div className="gl-field">
          <label className="gl-label">Username</label>
          <input
            className="gl-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Masukkan username"
            autoComplete="username"
          />
        </div>

        {/* Password */}
        <div className="gl-field">
          <label className="gl-label">Password</label>
          <input
            className="gl-input has-eye"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan password"
            autoComplete="current-password"
          />
          <button
            type="button"
            className="gl-eye-btn"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          >
            {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>

        {error && (
          <div className="gl-error" role="alert">
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="gl-submit"
          style={{
            background: "linear-gradient(90deg, #0D9488 0%, #06B6D4 100%)",
            color: "#fff",
            boxShadow: "0 8px 24px rgba(13,148,136,0.40)",
            marginTop: 4,
          }}
        >
          {loading ? "Memeriksa akun…" : "Login"}
        </button>
      </form>
    </GlassLoginShell>
  );
}
