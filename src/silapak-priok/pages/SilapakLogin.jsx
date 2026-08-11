import { useState } from "react";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";
import { font } from "../../lib/theme";
import { HELP_CONTACT } from "../../lib/data";
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
    const res = authenticate ? authenticate("silapak", username.trim(), password) : { ok: false, reason: "wrong" };
    if (!res.ok) {
      setError(res.reason === "inactive" ? "Akun sedang tidak aktif (di luar rentang tanggal berlaku)." : "Username atau password salah.");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => onLogin(), 300);
  };

  const waUrl = `https://wa.me/${HELP_CONTACT.waNumber}?text=${encodeURIComponent(HELP_CONTACT.waMessage)}`;

  return (
    <GlassLoginShell
      title="SI LAPAK PRIOK"
      subtitle="Sistem Pengelolaan Penerimaan Tamu dan Paket"
      onBack={onBack}
      illustration={<SilapakIllustration />}
      accent="#FFC5AA"
      accentSoft="#FFF4EE"
      brandTitle="SI LAPAK PRIOK"
      backgroundImage="/portal-bg.png"
    >
      <form onSubmit={submit} style={{ fontFamily: font.body }}>
        <div className="gl-field">
          <label className="gl-label">Username</label>
          <input className="gl-input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Masukkan username" autoComplete="username" autoFocus />
        </div>
        <div className="gl-field">
          <label className="gl-label">Password</label>
          <input className="gl-input has-eye" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan password" autoComplete="current-password" />
          <button type="button" className="gl-eye-btn" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}>
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>
        {error && <div className="gl-error" role="alert"><AlertTriangle size={14} /> {error}</div>}
        <button type="submit" disabled={loading} className="gl-submit">{loading ? "Memeriksa akun…" : "LOGIN"}</button>
        <div className="gl-forgot">Lupa password? <a href={waUrl} target="_blank" rel="noopener noreferrer">Klik di sini</a></div>
      </form>
    </GlassLoginShell>
  );
}
