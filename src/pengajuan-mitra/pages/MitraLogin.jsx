import { useState } from "react";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";
import { font } from "../../lib/theme";
import { HELP_CONTACT } from "../../lib/data";
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
      const res = authenticate ? authenticate("mitra", username.trim(), password) : { ok: false, reason: "wrong" };
      if (!res.ok) {
        setError(res.reason === "inactive" ? "Akun sedang tidak aktif (di luar rentang tanggal berlaku)." : "Username atau password salah.");
        setLoading(false);
      } else {
        onLogin({ username: res.user.username, name: res.user.username, role: "mitra" });
      }
    }, 500);
  };

  const waUrl = `https://wa.me/${HELP_CONTACT.waNumber}?text=${encodeURIComponent(HELP_CONTACT.waMessage)}`;

  return (
    <GlassLoginShell
      title="GANDENG"
      subtitle="Sistem Pengajuan dan Pengelolaan Kerja Sama"
      onBack={onBack}
      illustration={<MitraIllustration />}
      accent="#EEF8CD"
      accentSoft="#F8FCEB"
      brandTitle="GANDENG"
      backgroundImage="/login-plant.png"
    >
      <form onSubmit={handleSubmit} style={{ fontFamily: font.body }}>
        <div className="gl-field">
          <label className="gl-label">Username</label>
          <input className="gl-input" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Masukkan username" autoComplete="username" autoFocus />
        </div>
        <div className="gl-field">
          <label className="gl-label">Password</label>
          <input className="gl-input has-eye" type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan password" autoComplete="current-password" />
          <button type="button" className="gl-eye-btn" onClick={() => setShowPw((p) => !p)} aria-label={showPw ? "Sembunyikan password" : "Tampilkan password"}>
            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {error && <div className="gl-error" role="alert"><AlertTriangle size={14} /> {error}</div>}
        <button type="submit" disabled={loading} className="gl-submit">{loading ? "Memeriksa akun…" : "LOGIN"}</button>
        <div className="gl-forgot">Lupa password? <a href={waUrl} target="_blank" rel="noopener noreferrer">Klik di sini</a></div>
      </form>
    </GlassLoginShell>
  );
}
