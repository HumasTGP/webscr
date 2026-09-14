import { AlertCircle, ArrowRight, CheckCircle2, FileSignature } from "lucide-react";
import { T, font } from "../../lib/theme";
import Card from "../../components/Card";
import PageHeader from "../../components/PageHeader";

const ICON_BY_TYPE = {
  sign: FileSignature,
  payment: AlertCircle,
  signed: CheckCircle2,
};

/**
 * Halaman "Notifikasi" - riwayat LENGKAP (bukan cuma yang aktif), supaya
 * user bisa cek kapan saja tanpa perlu nunggu pop-up muncul lagi. Data yang
 * sama dengan pop-up & lonceng, cuma tampilannya daftar panjang.
 */
export default function NotifikasiPage({ items, onOpenItem }) {
  return (
    <div>
      <PageHeader
        eyebrow="Notifikasi"
        title="Riwayat Notifikasi"
        description="Semua hal yang perlu ditindaklanjuti dan riwayat yang sudah selesai."
      />

      <Card padded={false}>
        {items.length === 0 ? (
          <div style={{ padding: "32px 16px", textAlign: "center", color: T.muted, fontSize: 13 }}>
            Belum ada notifikasi.
          </div>
        ) : (
          items.map((it, i) => {
            const Icon = ICON_BY_TYPE[it.type] || AlertCircle;
            const isDone = it.type === "signed";
            return (
              <div
                key={it.id}
                onClick={() => onOpenItem(it)}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "14px 18px",
                  borderBottom: i < items.length - 1 ? `1px solid ${T.border}` : "none",
                  cursor: "pointer",
                }}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                  background: isDone ? T.successSoft : "#FFF3D6",
                  color: isDone ? T.success : "#8A6100",
                  display: "grid", placeItems: "center",
                }}>
                  <Icon size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{it.title}</div>
                  {it.subtitle && (
                    <div style={{ fontSize: 12, color: T.muted, marginTop: 1 }}>{it.subtitle}</div>
                  )}
                </div>
                <ArrowRight size={15} color={T.muted} style={{ flexShrink: 0 }} />
              </div>
            );
          })
        )}
      </Card>
    </div>
  );
}
