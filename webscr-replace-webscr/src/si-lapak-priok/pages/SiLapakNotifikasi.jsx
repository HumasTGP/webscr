import { AlertCircle, CheckCircle2, ClipboardCheck, FileText, Package, ShieldCheck, UserRound } from "lucide-react";
import { T, font } from "../../lib/theme";
import Card from "../../components/Card";

const ICON_BY_TYPE = {
  duty: ShieldCheck,
  package: Package,
  letter: FileText,
  guest: UserRound,
  done: CheckCircle2,
};

export default function SiLapakNotifikasi({ items, onOpenItem }) {
  const activeCount = items.filter((item) => item.type !== "done").length;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <ClipboardCheck size={17} color="#8C7600" />
        <div style={{ fontSize: 12, color: T.muted }}>
          {activeCount ? `${activeCount} tindakan masih perlu diselesaikan.` : "Semua tindakan sudah selesai."}
        </div>
      </div>
      <Card padded={false}>
        {items.length === 0 ? (
          <div style={{ padding: "36px 18px", textAlign: "center", color: T.muted, fontSize: 12.5 }}>
            Belum ada notifikasi.
          </div>
        ) : items.map((item, index) => {
          const Icon = ICON_BY_TYPE[item.type] || AlertCircle;
          const done = item.type === "done";
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => onOpenItem(item)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: "14px 18px", border: 0,
                borderBottom: index < items.length - 1 ? `1px solid ${T.border}` : "none",
                background: T.card, cursor: "pointer", textAlign: "left", fontFamily: font.body,
              }}
            >
              <span style={{
                width: 34, height: 34, borderRadius: 9, display: "grid", placeItems: "center", flexShrink: 0,
                background: done ? "#E5F6EF" : "#FFF7C2", color: done ? "#1D9E75" : "#8C7600",
              }}><Icon size={16} /></span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: T.text }}>{item.title}</span>
                {item.subtitle && <span style={{ display: "block", fontSize: 11, color: T.muted, marginTop: 2 }}>{item.subtitle}</span>}
              </span>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: done ? T.success : "#8C7600", flexShrink: 0 }}>
                {done ? "Selesai" : "Buka"}
              </span>
            </button>
          );
        })}
      </Card>
    </div>
  );
}
