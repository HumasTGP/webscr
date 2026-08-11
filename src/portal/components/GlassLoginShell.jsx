import { ArrowLeft } from "lucide-react";
import AutoLogo from "../../components/AutoLogo";
import PartnerLogos from "../../components/PartnerLogos";
import { font } from "../../lib/theme";
import "../styles/glass-login.css";

/**
 * Shell seragam untuk semua halaman login portal.
 *
 * Props:
 *  title        — nama sistem (tampil besar, uppercase)
 *  subtitle     — deskripsi singkat sistem
 *  onBack       — callback tombol "Back to Work"
 *  illustration — JSX untuk panel putih kanan (SVG/ikon)
 *  children     — konten form (input, tombol, dll.)
 */
export default function GlassLoginShell({
  title,
  subtitle,
  onBack,
  illustration,
  children,
}) {
  return (
    <div className="gl-page">
      <div className="gl-card">
        {/* Panel kiri: glass form */}
        <div className="gl-form-panel">
          <button
            type="button"
            className="gl-back-btn"
            onClick={onBack}
          >
            <ArrowLeft size={13} />
            Back to Work
          </button>

          <div className="gl-title">{title}</div>
          <div className="gl-subtitle">{subtitle}</div>

          {children}

          <div className="gl-back-link">
            Kembali ke portal?&nbsp;
            <button
              type="button"
              className="gl-back-link-btn"
              onClick={onBack}
            >
              Back to Work
            </button>
          </div>
        </div>

        {/* Panel kanan: ilustrasi putih */}
        <div className="gl-visual-panel">
          {illustration}
          <div className="gl-visual-label">{title}</div>
        </div>
      </div>

      {/* Strip powered-by (fixed bottom) */}
      <div className="powered-by-strip" style={{ fontFamily: font.body }}>
        <span className="powered-by-label">Powered by</span>
        <div className="powered-by-logos">
          <div className="powered-by-logo-box">
            <AutoLogo alt="PLN" />
          </div>
          <PartnerLogos />
        </div>
      </div>
    </div>
  );
}
