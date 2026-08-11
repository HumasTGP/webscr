import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import AutoLogo from "../../components/AutoLogo";

const NAV_LINKS = [
  { label: "Beranda",          id: "hero"     },
  { label: "Akses Sistem Kami", id: "services" },
  { label: "Kawasan Industri",  id: "ruko"     },
  { label: "Tim Kami",          id: "team"     },
  { label: "Hubungi Kami",      id: "contact"  },
];

export default function PortalNavbar({ onBackToWork }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive]     = useState("hero");

  // Track which section is in view
  useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.id);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <nav className="portal-navbar">
      <div className="portal-nav-inner">
        {/* Logo */}
        <button className="portal-nav-logo" onClick={() => scrollTo("hero")} aria-label="Beranda">
          <AutoLogo
            alt="PLN Indonesia Power"
            style={{ height: 36, width: "auto", flexShrink: 0 }}
          />
          <div className="portal-nav-logo-text-wrap">
            <span className="portal-nav-logo-text">PLN Indonesia Power</span>
            <span className="portal-nav-logo-sub">UBP Priok</span>
          </div>
        </button>

        {/* Desktop links */}
        <ul className="portal-nav-links">
          {NAV_LINKS.map(({ label, id }) => (
            <li key={id}>
              <button
                className={`portal-nav-link${active === id ? " active" : ""}`}
                onClick={() => scrollTo(id)}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>

        {/* Hamburger */}
        <button
          className="portal-nav-hamburger"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`portal-nav-mobile-menu${menuOpen ? " open" : ""}`}>
        {NAV_LINKS.map(({ label, id }) => (
          <button
            key={id}
            className={`portal-nav-mobile-link${active === id ? " active" : ""}`}
            onClick={() => scrollTo(id)}
          >
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
