import { ArrowRight } from "lucide-react";
import sikasLogo from "../../assets/sikas-logo.svg";
import silapakLogo from "../../assets/silapak-logo.svg";
import mitraLogo from "../../assets/mitra-logo.svg";
import { useReveal } from "../hooks/useReveal";

const SERVICES = [
  {
    key: "sikas",
    logo: sikasLogo,
    name: "SIKAS PLN",
    desc:
      "Sistem Informasi Kas PLN Indonesia Power — platform terintegrasi untuk manajemen RAB, monitoring realisasi kegiatan, dan pelaporan program CSR Unit Bisnis Pembangkitan Priok.",
  },
  {
    key: "silapak",
    logo: silapakLogo,
    name: "Si Lapak Priok",
    desc:
      "Sistem pengelolaan penerimaan tamu dan paket di area PLN Indonesia Power UBP Priok — digitalisasi proses registrasi dan pengambilan paket secara efisien dan terstruktur.",
  },
  {
    key: "mitra",
    logo: mitraLogo,
    name: "Pengajuan Mitra",
    desc:
      "Platform pengajuan dan pengelolaan proposal kerjasama mitra PLN Indonesia Power UBP Priok — mempermudah proses administrasi dan pengelolaan kemitraan bisnis.",
  },
];

export default function PortalServices({ onSelect }) {
  const [headerRef, headerVisible] = useReveal();

  return (
    <section className="portal-section portal-section-light" id="services">
      <div className="portal-section-inner">
        <div
          ref={headerRef}
          className={`portal-section-header portal-reveal ${headerVisible ? "visible" : ""}`}
        >
          <h2 className="portal-section-title">Akses Sistem Kami</h2>
          <div className="portal-section-divider" />
          <p className="portal-section-subtitle">
            Pilih sistem yang ingin Anda akses. Setiap platform dirancang untuk
            mendukung operasional PLN Indonesia Power UBP Priok secara digital
            dan terintegrasi.
          </p>
        </div>

        <div className="portal-services-grid">
          {SERVICES.map((service, i) => (
            <ServiceCard
              key={service.key}
              service={service}
              delay={i * 0.12}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ service, delay, onSelect }) {
  const [ref, visible] = useReveal();

  return (
    <div
      ref={ref}
      className={`portal-service-card portal-reveal ${visible ? "visible" : ""}`}
      style={{ transitionDelay: `${delay}s` }}
      onClick={() => onSelect(service.key)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect(service.key)}
    >
      <div className="portal-service-icon-wrap">
        <img src={service.logo} alt={service.name} />
      </div>
      <div className="portal-service-name">{service.name}</div>
      <p className="portal-service-desc">{service.desc}</p>
      <button
        className="portal-service-btn"
        onClick={(e) => {
          e.stopPropagation();
          onSelect(service.key);
        }}
      >
        Buka Aplikasi <ArrowRight size={13} />
      </button>
    </div>
  );
}
