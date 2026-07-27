import { ArrowRight, Phone } from "lucide-react";
import { T, font } from "../lib/theme";
import { HELP_CONTACT } from "../lib/data";
import Modal from "./Modal";

export default function HelpModal({ open, onClose, onGotoPanduan }) {
  return (
    <Modal open={open} onClose={onClose} title="Butuh Bantuan?" icon={Phone} width={360}>
      <p style={{ color: T.muted, fontSize: 13.5, marginBottom: 18, lineHeight: 1.6 }}>
        Hubungi tim Admin/IT SIKAS PLN kalau ada kendala saat menggunakan sistem ini.
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: T.blueSoft,
          borderRadius: 10,
          padding: "14px 16px",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: T.card,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <Phone size={17} color={T.blue} />
        </div>
        <div>
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
            {HELP_CONTACT.hours}
          </div>
        </div>
      </div>

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
