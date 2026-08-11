import { ExternalLink } from "lucide-react";
import { PORTAL_CONFIG } from "../config/portalConfig";
import { useReveal } from "../hooks/useReveal";

export default function PortalRukoPriok() {
  const [leftRef, leftVisible] = useReveal();
  const [rightRef, rightVisible] = useReveal();

  return (
    <section className="portal-section portal-section-dark" id="ruko">
      <div className="portal-section-inner">
        <div className="portal-ruko-inner">
          {/* Teks kiri */}
          <div
            ref={leftRef}
            className={`portal-reveal ${leftVisible ? "visible" : ""}`}
          >
            <div className="portal-ruko-eyebrow">
              Unit Bisnis Pembangkitan Priok
            </div>
            <h2 className="portal-ruko-title">
              Kawasan Industri<br />
              <span>PLN Indonesia Power</span>
              <br />di Tanjung Priok
            </h2>
            <p className="portal-ruko-desc">
              PLN Indonesia Power UBP Priok adalah unit pembangkitan strategis
              yang berlokasi di Tanjung Priok, Jakarta Utara. Kawasan ini
              mendukung ketahanan energi nasional dengan sistem pengelolaan
              digital yang modern dan terintegrasi — mulai dari administrasi
              kas, pengelolaan lapak, hingga kemitraan bisnis.
            </p>

            <div className="portal-ruko-stats">
              <div className="portal-ruko-stat">
                <div className="portal-ruko-stat-num">UBP</div>
                <div className="portal-ruko-stat-label">
                  Unit Bisnis Pembangkitan
                </div>
              </div>
              <div className="portal-ruko-stat">
                <div className="portal-ruko-stat-num">Priok</div>
                <div className="portal-ruko-stat-label">
                  Tanjung Priok, Jakarta Utara
                </div>
              </div>
              <div className="portal-ruko-stat">
                <div className="portal-ruko-stat-num">CSR</div>
                <div className="portal-ruko-stat-label">
                  Program Tanggung Jawab Sosial
                </div>
              </div>
              <div className="portal-ruko-stat">
                <div className="portal-ruko-stat-num">Digital</div>
                <div className="portal-ruko-stat-label">
                  Sistem Layanan Terintegrasi
                </div>
              </div>
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

          {/* Ilustrasi kanan */}
          <div
            ref={rightRef}
            className={`portal-ruko-visual portal-reveal portal-reveal-d2 ${rightVisible ? "visible" : ""}`}
          >
            <div className="portal-ruko-svg-wrap">
              <BuildingIllustration />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BuildingIllustration() {
  return (
    <svg
      viewBox="0 0 360 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: 340 }}
      aria-hidden="true"
    >
      {/* Ground */}
      <line
        x1="20" y1="265" x2="340" y2="265"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1.5"
      />

      {/* Main building body */}
      <rect
        x="90" y="85" width="180" height="180" rx="5"
        fill="rgba(255,255,255,0.06)"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1.5"
      />

      {/* Window grid */}
      {[105, 135, 165, 195].map((y) =>
        [108, 148, 188, 228].map((x) => (
          <rect
            key={`w-${x}-${y}`}
            x={x} y={y} width="22" height="16" rx="2"
            fill="rgba(255,199,44,0.22)"
            stroke="rgba(255,199,44,0.38)"
            strokeWidth="0.8"
          />
        ))
      )}

      {/* Door */}
      <rect
        x="164" y="222" width="32" height="43" rx="3"
        fill="rgba(14,76,146,0.45)"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="1.5"
      />
      <circle cx="192" cy="244" r="2" fill="rgba(255,255,255,0.6)" />

      {/* Roof detail */}
      <rect
        x="86" y="78" width="188" height="10" rx="2"
        fill="rgba(14,76,146,0.5)"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="1"
      />

      {/* Flag pole */}
      <line
        x1="180" y1="36" x2="180" y2="78"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="1.5"
      />
      <path
        d="M180 38 L212 50 L180 62 Z"
        fill="#FFC72C"
        opacity="0.85"
      />

      {/* Left tree */}
      <ellipse
        cx="46" cy="242" rx="20" ry="25"
        fill="rgba(22,110,73,0.38)"
        stroke="rgba(22,110,73,0.55)"
        strokeWidth="1"
      />
      <rect
        x="44" y="258" width="4" height="12"
        fill="rgba(255,255,255,0.18)"
      />

      {/* Right tree */}
      <ellipse
        cx="314" cy="240" rx="20" ry="25"
        fill="rgba(22,110,73,0.38)"
        stroke="rgba(22,110,73,0.55)"
        strokeWidth="1"
      />
      <rect
        x="312" y="256" width="4" height="14"
        fill="rgba(255,255,255,0.18)"
      />

      {/* PLN watermark text */}
      <text
        x="180" y="148"
        textAnchor="middle"
        fill="rgba(255,255,255,0.07)"
        fontSize="46"
        fontWeight="800"
        fontFamily="var(--font-display)"
      >
        PLN
      </text>

      {/* Decorative circles */}
      <circle
        cx="60" cy="130" r="20"
        stroke="rgba(255,199,44,0.12)"
        strokeWidth="1"
        fill="none"
      />
      <circle
        cx="300" cy="180" r="28"
        stroke="rgba(14,76,146,0.25)"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}
