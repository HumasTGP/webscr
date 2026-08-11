import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import AutoLogo from "../../components/AutoLogo";

const NAV_LINKS = [
  { label: "Beranda",  id: "hero"     },
  { label: "Sistem",   id: "services" },
  { label: "Kawasan",  id: "ruko"     },
  { label: "Tim",      id: "team"     },
  { label: "Kontak",   id: "contact"  },
];

export default function PortalNavbar({ onBackToWork }) {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
      if (menuOpen) setMenuOpen(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [menuOpen]);

  const scrollTo = (id) => {
    if (id === "hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
    setMenuOpen(false);
  };

  return (
    <nav className={`portal-navbar ${scrolled ? "scrolled" : "top"}`}>
      <div className="portal-nav-inner">

        {/* Logo */}
        <button
          className="portal-nav-logo"
          onClick={() => scrollTo("hero")}
          aria-label="Kembali ke atas"
        >
          <AutoLogo
            alt="PLN Indonesia Power"
            style={{
              height: 38,
              width: "auto",
              filter: scrolled ? "none" : "brightness(0) invert(1)",
              flexShrink: 0,
              transition: "filter 0.3s ease",
            }}
          />
          <div className="portal-nav-logo-text-wrap">
            <span className="portal-nav-logo-text">PLN Indonesia Power</span>
            <span className="portal-nav-logo-sub">UBP Priok</span>
          </div>
        </button>

        {/* Nav links — desktop */}
        <ul className="portal-nav-links" role="list">
          {NAV_LINKS.map((link) => (
            <li key={link.id}>
              <button
                className="portal-nav-link"
                onClick={() => scrollTo(link.id)}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Right: CTA + hamburger */}
        <div className="portal-nav-right">
          <button className="portal-nav-cta" onClick={onBackToWork}>
            Akses Sistem
          </button>
          <button
            className="portal-nav-hamburger"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`portal-nav-mobile-menu ${menuOpen ? "open" : ""}`}>
        {NAV_LINKS.map((link) => (
          <button
            key={link.id}
            className="portal-nav-mobile-link"
            onClick={() => scrollTo(link.id)}
          >
            {link.label}
          </button>
        ))}
        <button
          className="portal-nav-mobile-cta"
          onClick={() => { onBackToWork(); setMenuOpen(false); }}
        >
          Akses Sistem
        </button>
      </div>
    </nav>
  );
}
