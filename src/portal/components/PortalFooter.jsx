import { Facebook, Instagram, Youtube } from "lucide-react";
import AutoLogo from "../../components/AutoLogo";
import { PORTAL_CONFIG } from "../config/portalConfig";

function TikTokIcon({ size = 20 }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { icon: Facebook,   href: PORTAL_CONFIG.social.facebook,  label: "Facebook PLN Indonesia Power"  },
  { icon: Instagram,  href: PORTAL_CONFIG.social.instagram, label: "Instagram PLN Indonesia Power" },
  { icon: TikTokIcon, href: PORTAL_CONFIG.social.tiktok,   label: "TikTok PLN Indonesia Power"    },
  { icon: Youtube,    href: PORTAL_CONFIG.social.youtube,   label: "YouTube PLN Indonesia Power"   },
];

const NAVIGASI_LINKS = [
  { label: "Beranda",          id: "hero"     },
  { label: "Akses Sistem Kami", id: "services" },
  { label: "Kawasan Industri",  id: "ruko"     },
  { label: "Tim Kami",          id: "team"     },
  { label: "Hubungi Kami",      id: "contact"  },
];

export default function PortalFooter({ onSelect }) {
  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <footer className="portal-footer">
      <div className="portal-footer-inner">
        <div className="portal-footer-top">

          {/* Kolom 1: Brand */}
          <div className="portal-footer-brand-col">
            <div className="portal-footer-logo-row">
              <AutoLogo
                alt="PLN Indonesia Power"
                style={{
                  height: 44,
                  width: "auto",
                  filter: "brightness(0) invert(1)",
                  flexShrink: 0,
                }}
              />
              <div>
                <div className="portal-footer-brand-name">PLN Indonesia Power</div>
                <span className="portal-footer-brand-sub">UBP Priok</span>
              </div>
            </div>
            <p className="portal-footer-desc">
              Portal layanan digital terintegrasi PLN Indonesia Power Unit
              Bisnis Pembangkitan Priok, mendukung digitalisasi operasional
              dan tata kelola perusahaan.
            </p>
          </div>

          {/* Kolom 2: Navigasi */}
          <div>
            <div className="portal-footer-col-title">Navigasi</div>
            <ul className="portal-footer-links">
              {NAVIGASI_LINKS.map(({ label, id }) => (
                <li key={id}>
                  <button onClick={() => scrollTo(id)}>{label}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 3: Layanan */}
          <div>
            <div className="portal-footer-col-title">Layanan</div>
            <ul className="portal-footer-links">
              <li><button onClick={() => onSelect("sikas")}>SIKAS PLN</button></li>
              <li><button onClick={() => onSelect("silapak")}>Si Lapak Priok</button></li>
              <li><button onClick={() => onSelect("mitra")}>Pengajuan Mitra</button></li>
              <li>
                <a href={PORTAL_CONFIG.rukoPriok.url} target="_blank" rel="noopener noreferrer">
                  Ruko Priok
                </a>
              </li>
              <li>
                <a href="https://www.plnindonesiapower.co.id" target="_blank" rel="noopener noreferrer">
                  PLN Indonesia Power
                </a>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Ikuti Kami */}
          <div>
            <div className="portal-footer-col-title">Ikuti Kami</div>
            <div className="portal-footer-social">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="portal-footer-social-btn"
                  aria-label={label}
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
            <p className="portal-footer-social-desc">
              Ikuti kami di media sosial untuk informasi terbaru seputar
              PLN Indonesia Power UBP Priok.
            </p>
          </div>

        </div>

        <div className="portal-footer-bottom">
          &copy; {new Date().getFullYear()} PLN Indonesia Power UBP Priok. Seluruh hak dilindungi.
        </div>
      </div>
    </footer>
  );
}
