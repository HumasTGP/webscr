import { T, font } from "../../lib/theme";
import { MITRA_STATUS_META } from "../../lib/data";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

const STEPS = [
  { label: "Humas", key: "humas" },
  { label: "Asman", key: "asman" },
  { label: "MADM", key: "madm" },
  { label: "Final", key: "final" },
];

function stepFromStatus(status) {
  const meta = MITRA_STATUS_META[status];
  return meta ? meta.step : 0;
}

function isRejected(status) {
  return status && status.startsWith("ditolak");
}

function StatusBadge({ status }) {
  const meta = MITRA_STATUS_META[status] || { label: status, color: "#94A3B8", bg: "#F1F5F9" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: 999,
      background: meta.bg, color: meta.color,
      fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: meta.color }} />
      {meta.label}
    </span>
  );
}

function TrackingCard({ item }) {
  const currentStep = stepFromStatus(item.status);
  const rejected = isRejected(item.status);

  return (
    <div style={{
      background: T.card,
      border: `1px solid ${T.border}`,
      borderRadius: 12,
      overflow: "hidden",
      marginBottom: 16,
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px",
        borderBottom: `1px solid ${T.border}`,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
        background: T.bg,
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.heading, marginBottom: 3 }}>
            {item.judulPengajuan}
          </div>
          <div style={{ fontSize: 12, color: T.muted }}>
            {item.namaLembaga} &bull; <span style={{ fontFamily: font.mono, fontWeight: 700 }}>{item.id}</span>
          </div>
        </div>
        <StatusBadge status={item.status} />
      </div>

      <div style={{ padding: "20px" }}>
        {/* Progress Steps */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
          {STEPS.map((s, i) => {
            const done = currentStep > i + 1 || (currentStep === 4 && i === 3);
            const active = currentStep === i + 1;
            const fail = rejected && active;
            let bg = T.border;
            let fg = T.muted;
            if (done) { bg = "#1E7F3E"; fg = "#fff"; }
            else if (fail) { bg = "#B01818"; fg = "#fff"; }
            else if (active && !fail) { bg = "#0E4C92"; fg = "#fff"; }

            return (
              <div key={s.key} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 56 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%",
                    background: bg, color: fg,
                    display: "grid", placeItems: "center",
                    fontSize: 12, fontWeight: 700,
                  }}>
                    {done ? <CheckCircle2 size={15} /> : fail ? <XCircle size={15} /> : i + 1}
                  </div>
                  <span style={{ fontSize: 10, color: active ? T.heading : T.muted, fontWeight: active ? 700 : 500, textAlign: "center" }}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{
                    flex: 1, height: 2, margin: "0 4px",
                    background: currentStep > i + 1 ? "#1E7F3E" : T.border,
                    marginBottom: 16,
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Timeline */}
        {item.timeline && item.timeline.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.heading, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Riwayat Status
            </div>
            <div style={{ borderLeft: `2px solid ${T.border}`, marginLeft: 12, paddingLeft: 16 }}>
              {item.timeline.map((t, i) => {
                const meta = MITRA_STATUS_META[t.status] || {};
                return (
                  <div key={i} style={{ marginBottom: 16, position: "relative" }}>
                    <div style={{
                      position: "absolute", left: -23, top: 3,
                      width: 9, height: 9, borderRadius: "50%",
                      background: meta.color || T.muted,
                      border: `2px solid ${T.card}`,
                    }} />
                    <div style={{ fontSize: 11, color: T.muted, marginBottom: 2 }}>
                      {new Date(t.tanggal).toLocaleString("id-ID", {
                        weekday: "long", day: "2-digit", month: "long", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })} WIB &mdash; {t.oleh}
                    </div>
                    <div style={{ fontSize: 13, color: T.heading, fontWeight: 600 }}>
                      {meta.label || t.status}
                    </div>
                    {t.catatan && (
                      <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{t.catatan}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GandengTracking({ mitraList }) {
  return (
    <div style={{ fontFamily: font.body, padding: "28px 32px", maxWidth: 900 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4, fontWeight: 700 }}>
          Modul Tracking
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: T.heading, marginBottom: 4 }}>
          Tracking Status Pengajuan
        </div>
        <div style={{ fontSize: 13, color: T.muted }}>
          Pantau perkembangan setiap pengajuan mitra secara real-time.
        </div>
      </div>

      {mitraList.length === 0 ? (
        <div style={{
          background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 12, padding: "40px 24px",
          textAlign: "center", color: T.muted, fontSize: 14,
        }}>
          Belum ada pengajuan untuk dilacak.
        </div>
      ) : (
        <div>
          {mitraList.map((item) => (
            <TrackingCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
