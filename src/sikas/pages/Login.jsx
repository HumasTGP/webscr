import { useState } from "react";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";
import { font } from "../../lib/theme";
import { ADMIN_CREDENTIALS, ROLES } from "../../lib/data";
import GlassLoginShell from "../../portal/components/GlassLoginShell";
import { SikasIllustration } from "../../portal/components/LoginIllustrations";

export default function LoginScreen({ onLogin, onBack, authenticate }) {
  const sikasRoles = ROLES.filter((r) => r.value !== "mitra" && r.value !== "silapak");
  const [role, setRole] = useState("humas");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    const u = username.trim();
    if (!u || !password.trim()) {
      setError("Username dan password wajib diisi.");
      return;
    }
    if (
      role === ADMIN_CREDENTIALS.role &&
      u === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password
    ) {
      setError("");
      setLoading(true);
      setTimeout(() => onLogin({ role, username: u, isAdmin: true }), 350);
      return;
    }
    const res = authenticate
      ? authenticate(role, u, password)
      : { ok: false, reason: "wrong" };
    if (!res.ok) {
      setError(
        res.reason === "inactive"
          ? "Akun sedang tidak aktif (di luar rentang tanggal berlaku)."
          : "Username atau password salah untuk role yang dipilih."
      );
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => onLogin({ role, username: u }), 350);
  };

  return (
    <GlassLoginShell
      title="SIKAS PLN"
      subtitle="Sistem Informasi Kas — PLN Indonesia Power UBP Priok"
      onBack={onBack}
      illustration={<SikasIllustration />}
    >
      <form onSubmit={submit} style={{ fontFamily: font.body }}>
        {/* Role tabs */}
        <div className="gl-role-tabs">
          {sikasRoles.map((r) => (
            <button
              key={r.value}
              type="button"
              className={`gl-role-tab${role === r.value ? " active" : ""}`}
              onClick={() => setRole(r.value)}
            >
              {r.label}
            </button>
          ))}
        </div>

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
            className={`gl-input has-eye`}
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
            background: "linear-gradient(90deg, #4568DC 0%, #6B77E5 100%)",
            color: "#fff",
            boxShadow: "0 8px 24px rgba(69,104,220,0.40)",
            marginTop: 4,
          }}
        >
          {loading ? "Memeriksa akun…" : "Login"}
        </button>
      </form>
    </GlassLoginShell>
  );
}
