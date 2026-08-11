import { useState } from "react";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";
import { font } from "../../lib/theme";
import { ADMIN_CREDENTIALS, HELP_CONTACT } from "../../lib/data";
import GlassLoginShell from "../../portal/components/GlassLoginShell";
import { SikasIllustration } from "../../portal/components/LoginIllustrations";

const ROLE_LABEL = { humas: "HUMAS", asman: "ASMAN", madm: "MADM" };

function selectedRole(fallback = "humas") {
  try {
    const stored = window.localStorage.getItem("portal.sakti.role");
    return ROLE_LABEL[stored] ? stored : fallback;
  } catch (_) {
    return fallback;
  }
}

export default function LoginScreen({ onLogin, onBack, authenticate, fixedRole }) {
  const [role] = useState(() => fixedRole || selectedRole());
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
    const res = authenticate ? authenticate(role, u, password) : { ok: false, reason: "wrong" };
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
    setTimeout(() => onLogin({ role, username: u }), 350);
  };

  const waUrl = `https://wa.me/${HELP_CONTACT.waNumber}?text=${encodeURIComponent(HELP_CONTACT.waMessage)}`;
  const roleLabel = ROLE_LABEL[role] || "HUMAS";

  return (
    <GlassLoginShell
      title={`SAKTI - ${roleLabel}`}
      subtitle={<>Sistem Aplikasi Keuangan Terintegrasi<br />PLN Indonesia Power</>}
      onBack={onBack}
      illustration={<SikasIllustration />}
      accent="#0B57C8"
      accentSoft="#EAF3FF"
      brandTitle="SAKTI"
      roleLabel={roleLabel}
    >
      <form onSubmit={submit} style={{ fontFamily: font.body }}>
        <div className="gl-field">
          <label className="gl-label">Username</label>
          <input
            className="gl-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Masukkan username"
            autoComplete="username"
            autoFocus
          />
        </div>

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
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>

        {error && <div className="gl-error" role="alert"><AlertTriangle size={14} /> {error}</div>}

        <button type="submit" disabled={loading} className="gl-submit">
          {loading ? "Memeriksa akun…" : "LOGIN"}
        </button>
        <div className="gl-forgot">Lupa password? <a href={waUrl} target="_blank" rel="noopener noreferrer">Klik di sini</a></div>
      </form>
    </GlassLoginShell>
  );
}
