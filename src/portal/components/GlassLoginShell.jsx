import { ArrowLeft } from "lucide-react";
import AutoLogo from "../../components/AutoLogo";
import "../styles/glass-login.css";

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
  return (
    <div className="gl-page" style={{ "--gl-accent": accent, "--gl-soft": accentSoft }}>
      <div className="gl-top-brand">
        <AutoLogo alt="PLN Indonesia Power" />
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
          <div className="gl-visual-icon">{illustration}</div>
          <div className="gl-brand-title">{brandTitle || title}</div>
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
