import { useState } from "react";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";
import { font } from "../../lib/theme";
import GlassLoginShell from "../../portal/components/GlassLoginShell";
import { MitraIllustration } from "../../portal/components/LoginIllustrations";

export default function MitraLogin({ onLogin, onBack, authenticate }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Username dan password wajib diisi.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const res = authenticate
        ? authenticate("mitra", username.trim(), password)
        : { ok: false, reason: "wrong" };
      if (!res.ok) {
        setError(
          res.reason === "inactive"
            ? "Akun sedang tidak aktif (di luar rentang tanggal berlaku)."
            : "Username atau password salah."
        );
        setLoading(false);
      } else {
        onLogin({ username: res.user.username, name: res.user.username, role: "mitra" });
      }
    }, 500);
  };

  return (
    <GlassLoginShell
      title="Gandeng"
      subtitle="Gerbang Administrasi & Pengajuan Proposal Mitra — PLN Indonesia Power UBP Priok"
      onBack={onBack}
      illustration={<MitraIllustration />}
    >
      <form onSubmit={handleSubmit} style={{ fontFamily: font.body }}>
        {/* Username */}
        <div className="gl-field">
          <label className="gl-label">Username</label>
          <input
            className="gl-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Masukkan username"
            autoComplete="username"
            autoFocus
          />
        </div>

        {/* Password */}
        <div className="gl-field">
          <label className="gl-label">Password</label>
          <input
            className="gl-input has-eye"
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan password"
            autoComplete="current-password"
          />
          <button
            type="button"
            className="gl-eye-btn"
            onClick={() => setShowPw((p) => !p)}
            aria-label={showPw ? "Sembunyikan password" : "Tampilkan password"}
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
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
            background: "linear-gradient(90deg, #7C3AED 0%, #6366F1 100%)",
            color: "#fff",
            boxShadow: "0 8px 24px rgba(124,58,237,0.40)",
            marginTop: 4,
          }}
        >
          {loading ? "Masuk…" : "Masuk"}
        </button>
      </form>
    </GlassLoginShell>
  );
}
