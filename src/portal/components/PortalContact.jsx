import { useState } from "react";
import { MapPin, Phone, Mail, Send, Facebook, Instagram, Youtube } from "lucide-react";
import { PORTAL_CONFIG } from "../config/portalConfig";
import { useReveal } from "../hooks/useReveal";

// TikTok icon (tidak ada di lucide-react)
function TikTokIcon({ size = 16 }) {
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

const CONTACT_SOCIAL = [
  { icon: Facebook,   href: PORTAL_CONFIG.social.facebook,  label: "Facebook PLN Indonesia Power" },
  { icon: Instagram,  href: PORTAL_CONFIG.social.instagram, label: "Instagram PLN Indonesia Power" },
  { icon: TikTokIcon, href: PORTAL_CONFIG.social.tiktok,   label: "TikTok PLN Indonesia Power" },
  { icon: Youtube,    href: PORTAL_CONFIG.social.youtube,   label: "YouTube PLN Indonesia Power" },
];

export default function PortalContact() {
  const [headerRef, headerVisible] = useReveal();

  return (
    <section className="portal-section portal-section-light" id="contact">
      <div className="portal-section-inner">
        <div
          ref={headerRef}
          className={`portal-section-header portal-reveal ${headerVisible ? "visible" : ""}`}
        >
          <h2 className="portal-section-title">Hubungi Kami</h2>
          <div className="portal-section-divider" />
          <p className="portal-section-subtitle">
            Ada pertanyaan atau ingin berkolaborasi? Kirim pesan dan tim kami
            akan segera merespons melalui WhatsApp.
          </p>
        </div>

        <div className="portal-contact-inner">
          <ContactForm />
          <ContactMap />
        </div>
      </div>
    </section>
  );
}

function ContactForm() {
  const [ref, visible] = useReveal();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { number } = PORTAL_CONFIG.whatsapp;
    const text = encodeURIComponent(
      `Halo PLN Indonesia Power UBP Priok,\n\n` +
      `Saya ingin menghubungi PLN Indonesia Power UBP Priok.\n\n` +
      `Nama:\n${form.name}\n\n` +
      `Email:\n${form.email}\n\n` +
      `Subjek:\n${form.subject}\n\n` +
      `Pesan:\n${form.message}\n\n` +
      `Terima kasih.`
    );
    window.open(
      `https://wa.me/${number}?text=${text}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div
      ref={ref}
      className={`portal-contact-form-wrap portal-reveal ${visible ? "visible" : ""}`}
    >
      <div className="portal-contact-form-title">Kirim Pesan</div>
      <p className="portal-contact-form-sub">
        <Send size={13} style={{ flexShrink: 0 }} />
        Pesan diteruskan via WhatsApp secara otomatis.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="portal-form-row">
          <div className="portal-form-group">
            <label className="portal-form-label" htmlFor="contact-name">Nama</label>
            <input
              id="contact-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Nama lengkap"
              className="portal-form-input"
            />
          </div>
          <div className="portal-form-group">
            <label className="portal-form-label" htmlFor="contact-email">Email</label>
            <input
              id="contact-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="email@contoh.com"
              className="portal-form-input"
            />
          </div>
        </div>

        <div className="portal-form-group">
          <label className="portal-form-label" htmlFor="contact-subject">Subjek</label>
          <input
            id="contact-subject"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            required
            placeholder="Subjek pesan Anda"
            className="portal-form-input"
          />
        </div>

        <div className="portal-form-group">
          <label className="portal-form-label" htmlFor="contact-message">Pesan</label>
          <textarea
            id="contact-message"
            name="message"
            value={form.message}
            onChange={handleChange}
            required
            placeholder="Tulis pesan Anda di sini..."
            className="portal-form-input portal-form-textarea"
          />
        </div>

        <button type="submit" className="portal-form-submit">
          <Send size={14} />
          Kirim via WhatsApp
        </button>
      </form>
    </div>
  );
}

function ContactMap() {
  const [ref, visible] = useReveal();
  const { shareUrl, embedSrc } = PORTAL_CONFIG.maps;
  const { phone, email, address } = PORTAL_CONFIG.company;

  return (
    <div
      ref={ref}
      className={`portal-contact-map-col portal-reveal portal-reveal-d2 ${visible ? "visible" : ""}`}
    >
      <div className="portal-map-frame">
        <iframe
          src={embedSrc}
          title="Lokasi PLN Indonesia Power UBP Priok"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="portal-contact-info-list">
        <div className="portal-contact-info-item">
          <div className="portal-contact-info-icon"><MapPin size={16} /></div>
          <div>
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "inherit", textDecoration: "underline", textDecorationColor: "rgba(0,0,0,0.2)" }}
            >
              {address}
            </a>
          </div>
        </div>

        <div className="portal-contact-info-item">
          <div className="portal-contact-info-icon"><Phone size={16} /></div>
          <div>{phone}</div>
        </div>

        <div className="portal-contact-info-item">
          <div className="portal-contact-info-icon"><Mail size={16} /></div>
          <div>{email}</div>
        </div>
      </div>

      {/* Social media */}
      <div className="portal-contact-social">
        {CONTACT_SOCIAL.map(({ icon: Icon, href, label }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="portal-contact-social-btn"
            aria-label={label}
          >
            <Icon size={16} />
          </a>
        ))}
      </div>
    </div>
  );
}
