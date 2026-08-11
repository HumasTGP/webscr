import sikasLogo from "../../assets/sikas-logo.svg";
import silapakLogo from "../../assets/silapak-logo.svg";
import mitraLogo from "../../assets/mitra-logo.svg";

const APP_CARDS = [
  {
    key: "sikas",
    logo: sikasLogo,
    name: "SIKAS PLN",
    desc: "Sistem Realisasi dan Monitoring CSR",
  },
  {
    key: "silapak",
    logo: silapakLogo,
    name: "Si Lapak Priok",
    desc: "Penerimaan Tamu dan Manajemen Paket",
  },
  {
    key: "mitra",
    logo: mitraLogo,
    name: "Pengajuan Mitra",
    desc: "Proposal Kerjasama dan Administrasi",
  },
];

const PARTICLES = [
  { id: 0, size: 70,  top: "12%", left: "8%",  delay: "0s",   dur: "14s" },
  { id: 1, size: 40,  top: "70%", left: "4%",  delay: "3s",   dur: "10s" },
  { id: 2, size: 55,  top: "30%", left: "92%", delay: "1.5s", dur: "12s" },
  { id: 3, size: 30,  top: "80%", left: "88%", delay: "5s",   dur: "9s"  },
  { id: 4, size: 45,  top: "55%", left: "50%", delay: "2s",   dur: "13s" },
  { id: 5, size: 25,  top: "18%", left: "60%", delay: "6s",   dur: "11s" },
  { id: 6, size: 60,  top: "90%", left: "30%", delay: "0.5s", dur: "15s" },
  { id: 7, size: 35,  top: "42%", left: "20%", delay: "4s",   dur: "10s" },
];

export default function PortalHero({ onSelect, onScrollDown }) {
  return (
    <section className="portal-hero" id="hero">
      {/* Partikel dekoratif */}
      <div className="portal-hero-particles" aria-hidden="true">
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="portal-hero-particle"
            style={{
              width: p.size,
              height: p.size,
              top: p.top,
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.dur,
            }}
          />
        ))}
      </div>

      <div className="portal-hero-inner">
        {/* Konten teks */}
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
            <button
              className="portal-hero-btn-primary"
              onClick={onScrollDown}
            >
              Akses Sistem
            </button>
            <button
              className="portal-hero-btn-secondary"
              onClick={() =>
                document
                  .getElementById("contact")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
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

        {/* Kartu aplikasi mengambang */}
        <div className="portal-hero-visual" aria-hidden="true">
          <div className="portal-hero-illustration">
            <div className="portal-hero-app-cards">
              {APP_CARDS.map((card) => (
                <div
                  key={card.key}
                  className="portal-hero-app-card"
                  onClick={() => onSelect(card.key)}
                >
                  <div className="portal-hero-app-icon">
                    <img src={card.logo} alt="" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="portal-hero-app-name">{card.name}</div>
                    <div className="portal-hero-app-desc">{card.desc}</div>
                  </div>
                  <div className="portal-hero-app-arrow">›</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
