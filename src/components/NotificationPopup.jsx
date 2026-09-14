import { AlertCircle, ArrowRight } from "lucide-react";
import { T, font } from "../lib/theme";
import Modal from "./Modal";
import Button from "./Button";

/**
 * Pop-up yang muncul otomatis (dipicu dari App.jsx, lihat useEffect di sana)
 * setiap kali user login/refresh, selama masih ada hal yang menunggu mereka.
 * SATU pop-up berisi DAFTAR RINGKAS semua item, TIDAK ditumpuk satu-satu per
 * RAB - ini keputusan eksplisit biar tidak mengganggu kalau item-nya banyak.
 */
export default function NotificationPopup({ open, items, onClose, onOpenItem }) {
  return (
    <Modal open={open} onClose={onClose} title="" width={420}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{
          width: 34, height: 34, borderRadius: "50%", background: "#FFF3D6",
          color: "#8A6100", display: "grid", placeItems: "center", flexShrink: 0,
        }}>
          <AlertCircle size={17} />
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, fontFamily: font.display, color: T.heading, marginTop: 4 }}>
          {items.length === 1 ? "Ada 1 hal yang menunggu kamu" : `Ada ${items.length} hal yang menunggu kamu`}
        </div>
      </div>

      <div style={{ marginBottom: 6 }}>
        {items.map((it) => (
          <div
            key={it.id}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "9px 12px", background: T.bg, borderRadius: 8, marginBottom: 6, gap: 10,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {it.title}
              </div>
              {it.subtitle && (
                <div style={{ fontSize: 11, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {it.subtitle}
                </div>
              )}
            </div>
            <button
              onClick={() => onOpenItem(it)}
              title="Buka"
              style={{
                display: "inline-flex", alignItems: "center", gap: 4, flexShrink: 0,
                fontSize: 11.5, fontWeight: 600, color: T.blue, background: "transparent",
                border: `1px solid ${T.border}`, borderRadius: 6, padding: "5px 9px", cursor: "pointer",
              }}
            >
              Buka <ArrowRight size={12} />
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
        <Button variant="ghost" onClick={onClose}>Nanti dulu</Button>
      </div>
    </Modal>
  );
}
