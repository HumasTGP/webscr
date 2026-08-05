import { ArrowRight, MessageCircle } from "lucide-react";
import { T, font } from "../lib/theme";
import { HELP_CONTACT } from "../lib/data";
import Modal from "./Modal";

export default function HelpModal({ open, onClose, onGotoPanduan }) {
  const waUrl = `https://wa.me/${HELP_CONTACT.waNumber}?text=${encodeURIComponent(HELP_CONTACT.waMessage)}`;
  return (
    <Modal open={open} onClose={onClose} title="Butuh Bantuan?" icon={MessageCircle} width={360}>
      <p style={{ color: T.muted, fontSize: 13.5, marginBottom: 18, lineHeight: 1.6 }}>
        Hubungi tim Admin/IT SIKAS jika ada kendala saat menggunakan sistem ini.
      </p>

      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: T.blueSoft,
          borderRadius: 10,
          padding: "14px 16px",
          marginBottom: 14,
          textDecoration: "none",
          color: "inherit",
          transition: "background .15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#DCFCE7")}
        onMouseLeave={(e) => (e.currentTarget.style.background = T.blueSoft)}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#25D366",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <MessageCircle size={17} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: font.mono,
              fontSize: 16,
              fontWeight: 700,
              color: T.heading,
              letterSpacing: 0.3,
            }}
          >
            {HELP_CONTACT.phone}
          </div>
          <div style={{ fontSize: 11.5, color: T.muted, marginTop: 2 }}>
            Chat via WhatsApp · {HELP_CONTACT.hours}
          </div>
        </div>
      </a>

      <button
        onClick={() => {
          onClose();
          onGotoPanduan();
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "transparent",
          border: "none",
          color: T.blue,
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 600,
          padding: 0,
        }}
      >
        Lihat Panduan Penggunaan <ArrowRight size={14} />
      </button>
    </Modal>
  );
}
