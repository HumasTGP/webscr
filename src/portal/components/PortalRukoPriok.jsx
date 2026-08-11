import { ExternalLink, MapPin, Building2, Briefcase, Zap } from "lucide-react";
import { PORTAL_CONFIG } from "../config/portalConfig";
import { useReveal } from "../hooks/useReveal";

const STATS = [
  { icon: MapPin,    label: "Strategis",  sub: "Dekat Pelabuhan Tanjung Priok" },
  { icon: Zap,       label: "Industri",   sub: "Kawasan Pembangkitan Energi"   },
  { icon: Briefcase, label: "Bisnis",     sub: "Ekosistem Mitra dan Komersial" },
  { icon: Building2, label: "Digital",    sub: "Sistem Layanan Terintegrasi"   },
];

export default function PortalRukoPriok() {
  const [leftRef,  leftVisible]  = useReveal();
  const [rightRef, rightVisible] = useReveal();

  return (
    <section className="portal-section portal-section-dark" id="ruko">
      <div className="portal-section-inner">
        <div className="portal-ruko-inner">

          {/* Teks kiri */}
          <div ref={leftRef} className={`portal-reveal ${leftVisible ? "visible" : ""}`}>
            <div className="portal-ruko-eyebrow">Unit Bisnis Pembangkitan Priok</div>
            <h2 className="portal-ruko-title">
              Kawasan Industri PLN Indonesia Power
              <br />
              <span>di Tanjung Priok</span>
            </h2>
            <p className="portal-ruko-desc">
              PLN Indonesia Power UBP Priok berlokasi di kawasan industri
              Tanjung Priok, Jakarta Utara. Kawasan ini merupakan pusat kegiatan
              pembangkitan energi strategis yang terintegrasi dengan ekosistem
              bisnis dan perdagangan pelabuhan Tanjung Priok. Didukung oleh area
              komersial Ruko Priok, kawasan ini menyediakan fasilitas usaha bagi
              mitra dan pelaku bisnis yang beroperasi di sekitar wilayah UBP
              Priok.
            </p>

            <div className="portal-ruko-stats">
              {STATS.map(({ icon: Icon, label, sub }) => (
                <div className="portal-ruko-stat" key={label}>
                  <div className="portal-ruko-stat-icon"><Icon size={18} /></div>
                  <div>
                    <div className="portal-ruko-stat-num">{label}</div>
                    <div className="portal-ruko-stat-label">{sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <a
              href={PORTAL_CONFIG.rukoPriok.url}
              target="_blank"
              rel="noopener noreferrer"
              className="portal-ruko-btn"
            >
              Kunjungi Ruko Priok <ExternalLink size={14} />
            </a>
          </div>

          {/* Foto kanan */}
          <div
            ref={rightRef}
            className={`portal-ruko-visual portal-reveal portal-reveal-d2 ${rightVisible ? "visible" : ""}`}
          >
            <div className="portal-ruko-photo-wrap">
              <div className="portal-ruko-circle-ring" />
              <div className="portal-ruko-circle-frame">
                <img
                  src="/portal-bg.png"
                  alt="Kawasan PLN Indonesia Power UBP Priok"
                  className="portal-ruko-photo"
                />
              </div>
              <div className="portal-ruko-circle-accent" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
