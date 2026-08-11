import { useEffect, useRef, useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import AutoLogo from "../../components/AutoLogo";
import "../styles/portal-showcase.css";

const SAKTI_ROLES = [
  { key: "sikas-humas", label: "Humas" },
  { key: "sikas-asman", label: "Asman" },
  { key: "sikas-madm", label: "MADM" },
];

export default function LandingGateway({ onSelect }) {
  const [saktiOpen, setSaktiOpen] = useState(false);
  const saktiRef = useRef(null);

  useEffect(() => {
    const close = (event) => {
      if (!saktiRef.current?.contains(event.target)) setSaktiOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="gateway-page">
      <header className="gateway-header">
        <button className="gateway-brand" type="button" aria-label="PLN Indonesia Power">
          <AutoLogo alt="PLN Indonesia Power" className="gateway-logo" />
        </button>

        <nav className="gateway-nav" aria-label="Navigasi portal">
          <button className="gateway-nav-link active" type="button">Beranda</button>

          <div className="gateway-sakti" ref={saktiRef}>
            <button
              className="gateway-nav-link"
              type="button"
              onClick={() => setSaktiOpen((value) => !value)}
              aria-expanded={saktiOpen}
            >
              Sakti <ChevronDown size={17} strokeWidth={2.2} />
            </button>
            {saktiOpen && (
              <div className="gateway-dropdown">
                {SAKTI_ROLES.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onSelect(item.key)}
                  >
                    SAKTI - {item.label.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="gateway-nav-link" type="button" onClick={() => onSelect("silapak")}>
            Si Lapak Priok <ExternalLink size={17} strokeWidth={2.1} />
          </button>
          <button className="gateway-nav-link" type="button" onClick={() => onSelect("mitra")}>
            Gandeng <ExternalLink size={17} strokeWidth={2.1} />
          </button>
        </nav>
      </header>

      <main className="gateway-hero">
        <div className="gateway-hero-photo" aria-hidden="true" />
        <div className="gateway-hero-fade" aria-hidden="true" />
        <section className="gateway-copy">
          <div className="gateway-eyebrow">Portal Layanan Terintegrasi</div>
          <h1>
            Satu Portal,<br />
            Berbagai Solusi<span>.</span>
          </h1>
          <div className="gateway-accent" />
          <p>
            Akses mudah ke berbagai sistem dan layanan digital<br className="gateway-desktop-break" />
            untuk mendukung kinerja dan kolaborasi di<br className="gateway-desktop-break" />
            PLN Indonesia Power.
          </p>
        </section>
      </main>

      <footer className="gateway-footer">
        © 2026 PLN Indonesia Power. Seluruh hak dilindungi.
      </footer>
    </div>
  );
}
