import sikasLogo  from "../../assets/sikas-logo.svg";
import silapakLogo from "../../assets/silapak-logo.svg";
import mitraLogo   from "../../assets/mitra-logo.svg";

const APP_CARDS = [
  { key: "sikas",   logo: sikasLogo,  name: "SIKAS PLN",       desc: "Sistem Realisasi dan Monitoring CSR" },
  { key: "silapak", logo: silapakLogo, name: "Si Lapak Priok", desc: "Penerimaan Tamu dan Manajemen Paket" },
  { key: "mitra",   logo: mitraLogo,  name: "Pengajuan Mitra", desc: "Proposal Kerjasama dan Administrasi" },
];

export default function PortalHero({ onSelect, onScrollDown }) {
  return (
    <section className="portal-hero" id="hero">
      <div className="portal-hero-inner">

        {/* Teks kiri */}
        <div className="portal-hero-content">
          <div className="portal-hero-eyebrow">
            <span className="portal-hero-eyebrow-dot" aria-hidden="true" />
            Portal Layanan Digital
          </div>

          <h1 className="portal-hero-h1">
            Selamat Datang di<br />
            <span>PLN Indonesia Power</span>
            <br />UBP Priok
          </h1>

          <p className="portal-hero-p">
            Platform terintegrasi untuk mengakses seluruh sistem digital PLN
            Indonesia Power Unit Bisnis Pembangkitan Priok. Mulai dari
            monitoring CSR, pengelolaan lapak, hingga pengajuan kerjasama mitra.
          </p>

          <div className="portal-hero-actions">
            <button className="portal-hero-btn-primary" onClick={onScrollDown}>
              Akses Sistem
            </button>
            <button
              className="portal-hero-btn-secondary"
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            >
              Hubungi Kami
            </button>
          </div>

          <div className="portal-hero-stats">
            <div>
              <div className="portal-hero-stat-num">3</div>
              <div className="portal-hero-stat-label">Sistem Terintegrasi</div>
            </div>
            <div>
              <div className="portal-hero-stat-num">24/7</div>
              <div className="portal-hero-stat-label">Akses Digital</div>
            </div>
            <div>
              <div className="portal-hero-stat-num">1</div>
              <div className="portal-hero-stat-label">Portal Terpadu</div>
            </div>
          </div>
        </div>

        {/* Visual kanan: foto + kartu aplikasi */}
        <div className="portal-hero-visual">
          <div className="portal-hero-photo-wrap">
            <img
              src="/portal-bg.jpg"
              alt="PLN Indonesia Power UBP Priok"
              className="portal-hero-photo"
            />
            {/* Floating cards */}
            <div className="portal-hero-float-cards">
              {APP_CARDS.map((card) => (
                <button
                  key={card.key}
                  className="portal-hero-float-card"
                  onClick={() => onSelect(card.key)}
                >
                  <img src={card.logo} alt="" className="portal-hero-float-icon" />
                  <div>
                    <div className="portal-hero-float-name">{card.name}</div>
                    <div className="portal-hero-float-desc">{card.desc}</div>
                  </div>
                  <span className="portal-hero-float-arrow">›</span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
