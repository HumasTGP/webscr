import { useEffect, useState } from "react";
import AutoLogo from "../../components/AutoLogo";

export default function PortalNavbar({ onBackToWork }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`portal-navbar ${scrolled ? "scrolled" : "top"}`}>
      <div className="portal-nav-inner">
        <button
          className="portal-nav-logo"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Kembali ke atas"
        >
          <AutoLogo
            alt="PLN Indonesia Power"
            style={{
              height: 40,
              width: "auto",
              filter: "brightness(0) invert(1)",
              flexShrink: 0,
            }}
          />
          <div>
            <span className="portal-nav-logo-text">PLN Indonesia Power</span>
            <span className="portal-nav-logo-sub">UBP Priok</span>
          </div>
        </button>

        <button className="portal-nav-cta" onClick={onBackToWork}>
          Back to Work
        </button>
      </div>
    </nav>
  );
}
