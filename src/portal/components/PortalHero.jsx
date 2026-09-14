export default function PortalHero({ onScrollDown }) {
  return (
    <section className="portal-hero" id="hero">
      {/* Foto full-bleed kanan */}
      <div className="portal-hero-bg" aria-hidden="true">
        <img
          src="/portal-bg.jpg"
          alt=""
          className="portal-hero-bg-img"
        />
        <div className="portal-hero-bg-fade" />
      </div>

      <div className="portal-hero-inner">
        <div className="portal-hero-content">
          <h1 className="portal-hero-h1">
            Selamat Datang<br />
            di PLN Indonesia Power<br />
            <span>UBP Priok</span>
          </h1>

          <p className="portal-hero-p">
            Platform terintegrasi untuk mengakses seluruh sistem digital
            PLN Indonesia Power Unit Bisnis Pembangkitan Priok. Mulai dari
            monitoring CSR, pengelolaan lapak, hingga pengajuan kerjasama
            mitra bisnis.
          </p>

          <div className="portal-hero-actions">
            <button className="portal-hero-btn-primary" onClick={onScrollDown}>
              Akses Sistem Kami
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
      </div>
    </section>
  );
}
