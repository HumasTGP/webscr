import { X } from "lucide-react";
import { T, font } from "../lib/theme";

export default function Modal({
  open,
  onClose,
  title,
  icon: Icon,
  tone = "navy",
  children,
  width = 480,
}) {
  if (!open) return null;
  const accent = tone === "danger" ? T.danger : tone === "success" ? T.success : T.navy;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(7,27,54,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 300,
        padding: 20,
        animation: "overlay-in .15s ease",
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div
        style={{
          background: T.card,
          borderRadius: 14,
          width,
          maxWidth: "100%",
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: T.shadowLg,
          animation: "modal-in .18s cubic-bezier(.2,.8,.3,1)",
        }}
      >
        {title && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "18px 22px",
              borderBottom: `1px solid ${T.border}`,
            }}
          >
            {Icon && (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: `${accent}14`,
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={17} color={accent} />
              </div>
            )}
            <h3
              style={{
                fontFamily: font.display,
                fontSize: 16.5,
                margin: 0,
                color: T.heading,
                flex: 1,
              }}
            >
              {title}
            </h3>
            {onClose && (
              <button
                onClick={onClose}
                aria-label="Tutup"
                style={{
                  border: "none",
                  background: "transparent",
                  color: T.muted,
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <X size={17} />
              </button>
            )}
          </div>
        )}
        <div style={{ padding: 22 }}>{children}</div>
      </div>
    </div>
  );
}
