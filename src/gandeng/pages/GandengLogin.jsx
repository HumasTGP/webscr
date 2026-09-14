import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Copy, Eye, EyeOff, Mail } from "lucide-react";
import { font } from "../../lib/theme";
import GlassLoginShell from "../../portal/components/GlassLoginShell";
import { MitraIllustration } from "../../portal/components/LoginIllustrations";
import { authenticateGandeng, consumeResetToken, createResetLink, registerGandengAccount } from "../lib/accounts";

function getResetToken() {
  if (typeof window === "undefined") return "";
  const match = window.location.hash.match(/gandeng-reset=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

export default function GandengLogin({ onLogin, onBack }) {
  const resetToken = useMemo(getResetToken, []);
  const [mode, setMode] = useState(resetToken ? "reset" : "login");
  const [form, setForm] = useState({ email: "", organization: "", username: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [resetLink, setResetLink] = useState("");
  const [copied, setCopied] = useState(false);
  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const switchMode = (next) => { setMode(next); setError(""); setNotice(""); setResetLink(""); setCopied(false); };
  const copyLink = () => { navigator.clipboard?.writeText(resetLink).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); };

  const login = (e) => {
    e.preventDefault(); setError("");
    if (!form.username.trim() || !form.password) return setError("Username/email dan password wajib diisi.");
    const res = authenticateGandeng(form.username, form.password);
    if (!res.ok) return setError(res.reason === "inactive" ? "Akun GANDENG sedang dinonaktifkan." : "Username/email atau password salah.");
    onLogin({ ...res.account, name: res.account.organization || res.account.username });
  };

  const register = (e) => {
    e.preventDefault(); setError("");
    if (!form.email.trim() || !form.organization.trim() || !form.username.trim() || !form.password) return setError("Email, nama perusahaan/lembaga, username, dan password wajib diisi.");
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError("Format email belum valid.");
    if (form.password.length < 6) return setError("Password minimal 6 karakter.");
    if (form.password !== form.confirm) return setError("Konfirmasi password belum sama.");
    const res = registerGandengAccount(form);
    if (!res.ok) return setError(res.reason === "email" ? "Email sudah terdaftar." : "Username sudah digunakan.");
    setNotice("Akun GANDENG berhasil dibuat. Silakan login menggunakan username/email dan password yang baru dibuat.");
    setForm((p) => ({ ...p, username: res.account.username, password: "", confirm: "" }));
    setMode("login");
  };

  const requestReset = (e) => {
    e.preventDefault(); setError(""); setNotice("");
    if (!form.email.trim()) return setError("Masukkan email akun GANDENG.");
    const res = createResetLink(form.email);
    if (!res.ok) return setError("Email tersebut belum terdaftar sebagai akun GANDENG.");
    setResetLink(res.link);
    setNotice("Tautan reset sudah dibuat dan berlaku 30 menit. Pengiriman email otomatis memerlukan email service; sementara tautan dapat dikirim melalui aplikasi email perangkat ini.");
  };

  const reset = (e) => {
    e.preventDefault(); setError("");
    if (!form.username.trim() || !form.password) return setError("Username baru dan password baru wajib diisi.");
    if (form.password.length < 6) return setError("Password minimal 6 karakter.");
    if (form.password !== form.confirm) return setError("Konfirmasi password belum sama.");
    const res = consumeResetToken(resetToken, form.username, form.password);
    if (!res.ok) return setError(res.reason === "username" ? "Username sudah digunakan akun lain." : "Tautan reset tidak valid atau sudah kedaluwarsa.");
    if (typeof window !== "undefined") window.history.replaceState(null, "", window.location.pathname);
    setNotice("Username dan password berhasil diperbarui. Silakan login.");
    setForm((p) => ({ ...p, password: "", confirm: "" })); setMode("login");
  };

  const title = mode === "register" ? "DAFTAR GANDENG" : mode === "forgot" ? "RESET GANDENG" : mode === "reset" ? "BUAT AKUN BARU" : "GANDENG";
  return <GlassLoginShell title={title} subtitle="Sistem Pengajuan dan Pengelolaan Kerja Sama" onBack={onBack} illustration={<MitraIllustration />} accent="#CF0000" accentSoft="#FDEAEA" brandTitle="GANDENG" backgroundImage="/login-plant.png">
    <form onSubmit={mode === "register" ? register : mode === "forgot" ? requestReset : mode === "reset" ? reset : login} style={{ fontFamily: font.body }}>
      {mode === "register" && <>
        <Field label="Email"><input className="gl-input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="nama@perusahaan.co.id" autoFocus /></Field>
        <Field label="Nama Perusahaan / Lembaga"><input className="gl-input" value={form.organization} onChange={(e) => set("organization", e.target.value)} placeholder="Contoh: PT Sejahtera Abadi" /></Field>
        <Field label="Username"><input className="gl-input" value={form.username} onChange={(e) => set("username", e.target.value)} placeholder="Buat username unik" autoComplete="username" /></Field>
        <PasswordField label="Password" visible={showPw} setVisible={setShowPw} value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Minimal 6 karakter" autoComplete="new-password" />
        <PasswordField label="Konfirmasi Password" visible={showConfirm} setVisible={setShowConfirm} value={form.confirm} onChange={(e) => set("confirm", e.target.value)} placeholder="Ulangi password" autoComplete="new-password" />
      </>}
      {mode === "forgot" && <Field label="Email Terdaftar"><input className="gl-input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="nama@perusahaan.co.id" autoFocus /></Field>}
      {(mode === "login" || mode === "reset") && <Field label={mode === "login" ? "Username atau Email" : "Username"}><input className="gl-input" value={form.username} onChange={(e) => set("username", e.target.value)} placeholder={mode === "login" ? "Masukkan username atau email" : "Buat username"} autoFocus autoComplete="username" /></Field>}
      {(mode === "login" || mode === "reset") && <PasswordField label={mode === "login" ? "Password" : "Password Baru"} visible={showPw} setVisible={setShowPw} value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Masukkan password" autoComplete={mode === "login" ? "current-password" : "new-password"} />}
      {mode === "reset" && <PasswordField label="Konfirmasi Password" visible={showConfirm} setVisible={setShowConfirm} value={form.confirm} onChange={(e) => set("confirm", e.target.value)} placeholder="Ulangi password" autoComplete="new-password" />}
      {error && <div className="gl-error" role="alert"><AlertTriangle size={14} /> {error}</div>}
      {notice && <div style={{ display:"flex",gap:8,alignItems:"flex-start",padding:"9px 11px",marginBottom:9,borderRadius:8,background:"#EFFAF3",color:"#166E49",fontSize:11.5,lineHeight:1.4 }}><CheckCircle2 size={14} style={{flexShrink:0,marginTop:1}} />{notice}</div>}
      {resetLink && <div style={{marginBottom:9}}>
        <div style={{padding:"8px 10px",borderRadius:8,background:"#F7FAFF",border:"1px solid #D0DFF4",marginBottom:7}}>
          <div style={{fontSize:10,fontWeight:700,color:"#5F7A9A",marginBottom:4}}>TAUTAN RESET</div>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <span style={{fontSize:10.5,color:"#1A3D6B",wordBreak:"break-all",flex:1,lineHeight:1.35}}>{resetLink}</span>
            <button type="button" onClick={copyLink} title="Salin tautan" style={{flexShrink:0,border:"1px solid #D0DFF4",background:"#fff",borderRadius:7,padding:"5px 7px",cursor:"pointer",display:"flex",alignItems:"center",gap:4,fontSize:10.5,fontWeight:700,color:copied?"#1E7F3E":"#CF0000"}}><Copy size={12}/>{copied?"Tersalin":"Salin"}</button>
          </div>
        </div>
        <a href={`mailto:${encodeURIComponent(form.email)}?subject=${encodeURIComponent("Reset Akun GANDENG")}&body=${encodeURIComponent(`Gunakan tautan berikut untuk membuat username dan password baru:\n\n${resetLink}\n\nTautan berlaku 30 menit.`)}`} style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:7,minHeight:35,borderRadius:8,border:"1px solid #CF0000",color:"#CF0000",textDecoration:"none",fontWeight:700,fontSize:11.5 }}><Mail size={14}/> Kirim via Email</a>
      </div>}
      <button type="submit" className="gl-submit">{mode === "register" ? "BUAT AKUN" : mode === "forgot" ? "BUAT TAUTAN RESET" : mode === "reset" ? "SIMPAN AKUN BARU" : "LOGIN"}</button>
      <div className="gl-forgot" style={{ display:"flex",justifyContent:"center",gap:10,flexWrap:"wrap" }}>{mode === "login" ? <><button type="button" onClick={() => switchMode("register")} style={linkBtn}>Daftar akun</button><span>·</span><button type="button" onClick={() => switchMode("forgot")} style={linkBtn}>Lupa password?</button></> : <button type="button" onClick={() => switchMode("login")} style={linkBtn}>Kembali ke Login</button>}</div>
    </form>
  </GlassLoginShell>;
}
function Field({ label, children }) { return <div className="gl-field"><label className="gl-label">{label}</label>{children}</div>; }
function PasswordField({ label, visible, setVisible, ...inputProps }) { return <div className="gl-field"><label className="gl-label">{label}</label><input className="gl-input has-eye" type={visible ? "text" : "password"} {...inputProps} /><button type="button" className="gl-eye-btn" onClick={() => setVisible((p) => !p)} aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}>{visible ? <Eye size={18} /> : <EyeOff size={18} />}</button></div>; }
const linkBtn = { border:0,background:"transparent",padding:0,color:"#CF0000",cursor:"pointer",fontWeight:700,fontSize:"inherit" };
