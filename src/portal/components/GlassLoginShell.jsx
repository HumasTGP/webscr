import { ArrowLeft } from "lucide-react";
import "../styles/glass-login.css";

const APP_LOGOS = {
  SAKTI: "/logo-sakti.png",
  "SI LAPAK PRIOK": "/logo-silapak.png",
  GANDENG: "/logo-gandeng.png",
};

export default function GlassLoginShell({
  title,
  subtitle,
  onBack,
  illustration,
  children,
  accent = "#0B57C8",
  accentSoft = "#EAF3FF",
  roleLabel = "",
  brandTitle = "",
  backgroundImage = "/login-plant.png",
}) {
  const visualTitle = brandTitle || title;
  const appLogo = APP_LOGOS[visualTitle];
  const lightVisual = visualTitle === "SI LAPAK PRIOK";

  return (
    <div
      className="gl-page"
      style={{
        "--gl-accent": accent,
        "--gl-soft": accentSoft,
        "--gl-background-image": `url('${backgroundImage}')`,
      }}
    >
      <div className="gl-top-brand">
        <img src="/logo-pln.png" alt="PLN Indonesia Power" />
      </div>

      <div className="gl-card">
        <div className="gl-form-panel">
          <button type="button" className="gl-back-btn" onClick={onBack}>
            <ArrowLeft size={18} /> Kembali ke Beranda
          </button>
          <div className="gl-login-heading">
            <div className="gl-title">{title}</div>
            <div className="gl-subtitle">{subtitle}</div>
          </div>
          {children}
        </div>

        <div className={`gl-visual-panel${lightVisual ? " gl-visual-panel--light" : ""}`}>
          <div className="gl-visual-glow" aria-hidden="true" />
          <div className="gl-visual-icon">
            {appLogo ? <img className="gl-app-logo" src={appLogo} alt={visualTitle} /> : illustration}
          </div>
          <div className="gl-brand-title">{visualTitle}</div>
          {roleLabel && <div className="gl-role-pill">{roleLabel}</div>}
          <p className="gl-visual-copy">Akses sistem secara aman melalui Portal Digital PLN Indonesia Power UBP Priok.</p>
        </div>
      </div>

      <footer className="gl-footer">© 2026 PLN Indonesia Power</footer>
    </div>
  );
}
