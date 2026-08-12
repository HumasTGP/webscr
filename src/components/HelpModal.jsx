import { ArrowRight, MessageCircle } from "lucide-react";
import { T, font } from "../lib/theme";
import Modal from "./Modal";

const HELP_PHONE = "+62 858-1429-0877";
const HELP_WA_NUMBER = "6285814290877";
const HELP_WA_MESSAGE = "Halo! Saya mengalami problem";
const HELP_HOURS = "Senin-Jumat, 08.00-16.00 WIB";

function WhatsAppIcon({ size = 19, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20.52 3.48A11.82 11.82 0 0 0 12.1 0C5.56 0 .24 5.32.24 11.86c0 2.09.55 4.13 1.59 5.93L.14 24l6.36-1.67a11.84 11.84 0 0 0 5.6 1.43h.01C18.65 23.76 24 18.44 24 11.9c0-3.18-1.24-6.17-3.48-8.42Zm-8.41 18.28h-.01a9.83 9.83 0 0 1-5.01-1.37l-.36-.21-3.77.99 1.01-3.68-.23-.38a9.86 9.86 0 0 1-1.51-5.25C2.23 6.43 6.66 2 12.1 2c2.64 0 5.12 1.03 6.98 2.9a9.8 9.8 0 0 1 2.9 6.99c0 5.44-4.43 9.87-9.87 9.87Zm5.41-7.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.95 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47a8.93 8.93 0 0 1-1.64-2.04c-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.08-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.19 1.87.12.57-.08 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z"
        fill={color}
      />
    </svg>
  );
}

export default function HelpModal({ open, onClose, onGotoPanduan }) {
  const waUrl = `https://wa.me/${HELP_WA_NUMBER}?text=${encodeURIComponent(HELP_WA_MESSAGE)}`;
  return (
    <Modal open={open} onClose={onClose} title="Butuh Bantuan?" icon={MessageCircle} width={360}>
      <p style={{ color: T.muted, fontSize: 13.5, marginBottom: 18, lineHeight: 1.6 }}>
        Hubungi tim Admin/IT SAKTI jika ada kendala saat menggunakan sistem ini.
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
          <WhatsAppIcon size={19} color="#fff" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: font.mono,
              fontSize: 16,
              fontWeight: 700,
              color: T.heading,
              letterSpacing: 0.3,
              overflowWrap: "anywhere",
            }}
          >
            {HELP_PHONE}
          </div>
          <div style={{ fontSize: 11.5, color: T.muted, marginTop: 2 }}>
            WhatsApp · {HELP_HOURS}
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
