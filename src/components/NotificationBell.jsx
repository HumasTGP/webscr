import { useState } from "react";
import { Bell, ChevronRight } from "lucide-react";
import { T, font } from "../lib/theme";

/**
 * Ikon lonceng permanen di topbar - beda dari NotificationPopup (yang muncul
 * otomatis), ini dibuka manual kapan saja user mau cek ringkasan singkat.
 * Klik "Lihat semua" mengarahkan ke halaman riwayat notifikasi penuh.
 */
export default function NotificationBell({ items, onOpenItem, onSeeAll }) {
  const [open, setOpen] = useState(false);
  const count = items.length;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifikasi"
        style={{
          position: "relative", width: 32, height: 32, borderRadius: "50%",
          display: "grid", placeItems: "center", background: T.blueSoft,
          border: `1px solid ${T.border}`, color: T.blue, cursor: "pointer", flexShrink: 0,
        }}
      >
        <Bell size={15} />
        {count > 0 && (
          <span style={{
            position: "absolute", top: -3, right: -3, background: T.danger, color: "#fff",
            fontSize: 9.5, fontWeight: 700, width: 16, height: 16, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 99 }}
          />
          <div style={{
            position: "absolute", top: 40, right: 0, width: 300, maxWidth: "calc(100vw - 32px)",
            maxHeight: 360, overflowY: "auto", background: T.card, border: `1px solid ${T.border}`,
            borderRadius: 12, boxShadow: T.shadowLg, zIndex: 100,
          }}>
            {count === 0 ? (
              <div style={{ padding: "20px 16px", fontSize: 12.5, color: T.muted, textAlign: "center" }}>
                Tidak ada notifikasi baru.
              </div>
            ) : (
              items.slice(0, 6).map((it) => (
                <div
                  key={it.id}
                  onClick={() => { setOpen(false); onOpenItem(it); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                    borderBottom: `1px solid ${T.border}`, cursor: "pointer",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {it.title}
                    </div>
                    <div style={{ fontSize: 11, color: T.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {it.subtitle}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div
              onClick={() => { setOpen(false); onSeeAll(); }}
              style={{
                padding: "10px 14px", textAlign: "center", fontSize: 12, fontWeight: 600,
                color: T.blue, cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", gap: 4,
              }}
            >
              Lihat semua <ChevronRight size={13} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
