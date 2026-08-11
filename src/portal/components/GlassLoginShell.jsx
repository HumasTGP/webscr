import { ArrowLeft } from "lucide-react";
import AutoLogo from "../../components/AutoLogo";
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
}) {
  const visualTitle = brandTitle || title;
  const appLogo = APP_LOGOS[visualTitle];

  return (
    <div className="gl-page" style={{ "--gl-accent": accent, "--gl-soft": accentSoft }}>
      <div className="gl-top-brand">
        <AutoLogo
          alt="PLN Indonesia Power"
          style={{ background: "transparent", mixBlendMode: "multiply" }}
        />
      </div>

      <div className="gl-card">
        <div className="gl-form-panel">
          <button type="button" className="gl-back-btn" onClick={onBack}>
            <ArrowLeft size={18} /> Kembali ke Beranda
          </button>
          <div className="gl-title">{title}</div>
          <div className="gl-subtitle">{subtitle}</div>
          {children}
        </div>

        <div className="gl-visual-panel">
          <div className="gl-visual-icon">
            {appLogo ? (
              <img
                className="gl-app-logo"
                src={appLogo}
                alt={visualTitle}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fallback = e.currentTarget.nextElementSibling;
                  if (fallback) fallback.style.display = "grid";
                }}
              />
            ) : null}
            <div className="gl-illustration-fallback" style={{ display: appLogo ? "none" : "grid" }}>
              {illustration}
            </div>
          </div>
          <div className="gl-brand-title">{visualTitle}</div>
          {roleLabel && <div className="gl-role-pill">{roleLabel}</div>}
          <div className="gl-yellow-line" />
          <div className="gl-company">PLN Indonesia Power</div>
          <div className="gl-plant-art" aria-hidden="true" />
          <div className="gl-wave gl-wave-one" />
          <div className="gl-wave gl-wave-two" />
        </div>
      </div>

      <footer className="gl-footer">© 2026 PLN Indonesia Power. All rights reserved.</footer>
    </div>
  );
}
