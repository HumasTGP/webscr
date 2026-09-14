import { useState, useMemo } from "react";
import { T, font } from "../../lib/theme";
import { CheckCircle2, XCircle, Search, ChevronDown, ChevronUp } from "lucide-react";
import PageHeader from "../../components/PageHeader";

const STEPS = ["Proposal Masuk", "Proposal Diproses", "Proposal Disetujui/Ditolak"];

const TABS = [
  { key: "semua", label: "Semua" },
  { key: "menunggu", label: "Menunggu Proses" },
  { key: "diterima", label: "Diterima" },
  { key: "ditolak", label: "Ditolak" },
];

function isRejected(status) {
  return status && status.startsWith("ditolak");
}
function isApproved(status) {
  return status === "disetujui";
}

// Tahap sederhana buat sisi user: 1=Masuk, 2=Diproses, 3=Disetujui/Ditolak.
function simpleStep(status) {
  if (isApproved(status) || isRejected(status)) return 3;
  if (!status) return 1;
  return 2;
}

function getTabKey(status) {
  if (isRejected(status)) return "ditolak";
  if (isApproved(status)) return "diterima";
  return "menunggu";
}

function simpleStatusMeta(status) {
  if (isRejected(status)) return { label: "Ditolak", color: "#B01818", bg: "#FCE1E1" };
  if (isApproved(status)) return { label: "Diterima", color: "#1E7F3E", bg: "#DEF6E5" };
  return { label: "Menunggu Proses", color: "#8A6D00", bg: "#FFF4D0" };
}

function StatusBadge({ status }) {
  const meta = simpleStatusMeta(status);
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

function StepProgress({ status }) {
  const currentStep = simpleStep(status);
  const rejected = isRejected(status);

  return (
    <div style={{ display: "flex", alignItems: "center", margin: "4px 0 8px" }}>
      {STEPS.map((label, i) => {
        const done = currentStep > i + 1;
        const active = currentStep === i + 1;
        const fail = rejected && active;
        let bg = T.border;
        let fg = T.muted;
        if (done && !(rejected && i + 1 === 3)) { bg = "#1E7F3E"; fg = "#fff"; }
        else if (fail) { bg = "#B01818"; fg = "#fff"; }
        else if (active && !fail) { bg = "#0E4C92"; fg = "#fff"; }

        return (
          <div key={label} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: 68 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: bg, color: fg,
                display: "grid", placeItems: "center",
                fontSize: 11, fontWeight: 700,
              }}>
                {done ? <CheckCircle2 size={14} /> : fail ? <XCircle size={14} /> : i + 1}
              </div>
              <span style={{ fontSize: 10, color: active ? T.heading : T.muted, fontWeight: active ? 700 : 500, textAlign: "center" }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 2, margin: "0 3px",
                background: currentStep > i + 1 ? "#1E7F3E" : T.border,
                marginBottom: 16,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function FinalDescription({ status }) {
  if (isApproved(status)) {
    return (
      <div style={{ padding: "10px 12px", borderRadius: 8, background: "#DEF6E5", color: "#1E7F3E", fontSize: 12.5, marginTop: 12 }}>
        Proposal Anda telah <b>disetujui</b>. Tim kami akan menghubungi Anda untuk tindak lanjut kerja sama.
      </div>
    );
  }
  if (isRejected(status)) {
    return (
      <div style={{ padding: "10px 12px", borderRadius: 8, background: "#FCE1E1", color: "#B01818", fontSize: 12.5, marginTop: 12 }}>
        Proposal Anda <b>ditolak</b>. Silakan periksa catatan pada riwayat status di bawah untuk detail alasannya.
      </div>
    );
  }
  return null;
}

function TrackingCard({ item }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      background: T.card,
      border: `1px solid ${T.border}`,
      borderRadius: 12,
      overflow: "hidden",
      marginBottom: 10,
    }}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        style={{
          width: "100%",
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          background: "none",
          border: 0,
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.heading, marginBottom: 3, lineHeight: 1.4, overflowWrap: "anywhere" }}>
            {item.judulPengajuan}
          </div>
          <div style={{ fontSize: 11.5, color: T.muted }}>
            {item.namaLembaga}
            <span style={{ fontFamily: font.mono, fontWeight: 700, marginLeft: 8 }}>#{item.id}</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <StatusBadge status={item.status} />
          {open ? <ChevronUp size={15} color={T.muted} /> : <ChevronDown size={15} color={T.muted} />}
        </div>
      </button>

      {open && (
        <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${T.border}` }}>
          <div style={{ paddingTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 12 }}>
              Progres Tahapan
            </div>
            <StepProgress status={item.status} />
            <FinalDescription status={item.status} />

            {item.timeline && item.timeline.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 10 }}>
                  Riwayat Status
                </div>
                <div style={{ borderLeft: `2px solid ${T.border}`, marginLeft: 10, paddingLeft: 14 }}>
                  {item.timeline.map((t, i) => {
                    const meta = simpleStatusMeta(t.status);
                    return (
                      <div key={i} style={{ marginBottom: 13, position: "relative" }}>
                        <div style={{
                          position: "absolute", left: -20, top: 3,
                          width: 8, height: 8, borderRadius: "50%",
                          background: meta.color || T.muted,
                          border: `2px solid ${T.card}`,
                        }} />
                        <div style={{ fontSize: 10.5, color: T.muted, marginBottom: 2 }}>
                          {new Date(t.tanggal).toLocaleString("id-ID", {
                            weekday: "long", day: "2-digit", month: "long", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })} WIB &mdash; {t.oleh}
                        </div>
                        <div style={{ fontSize: 12.5, color: T.heading, fontWeight: 600 }}>
                          {meta.label || t.status}
                        </div>
                        {t.catatan && (
                          <div style={{ fontSize: 11.5, color: T.muted, marginTop: 2 }}>{t.catatan}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function GandengTracking({ mitraList }) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("semua");

  const sorted = useMemo(() =>
    [...mitraList].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [mitraList]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sorted.filter((item) => {
      if (tab !== "semua" && getTabKey(item.status) !== tab) return false;
      if (q && !item.judulPengajuan?.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [sorted, query, tab]);

  const counts = useMemo(() => {
    const c = { semua: mitraList.length };
    mitraList.forEach((item) => {
      const k = getTabKey(item.status);
      c[k] = (c[k] || 0) + 1;
    });
    return c;
  }, [mitraList]);

  return (
    <div style={{ fontFamily: font.body, padding: "clamp(18px,3vw,28px) clamp(16px,4vw,32px)", maxWidth: 900, width: "100%", boxSizing: "border-box" }}>
      <PageHeader
        title="Tracking Status Proposal"
        description="Pantau perkembangan setiap pengajuan proposal secara real-time."
      />

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 14 }}>
        <Search size={15} color={T.muted} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari berdasarkan judul proposal..."
          style={{
            width: "100%", boxSizing: "border-box",
            height: 40, padding: "0 14px 0 38px",
            borderRadius: 10, border: `1px solid ${T.border}`,
            background: T.card, color: T.text, fontSize: 13, outline: "none",
          }}
        />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16, overflowX: "auto", paddingBottom: 2 }}>
        {TABS.map((t) => {
          const count = counts[t.key] || 0;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "6px 13px", borderRadius: 20,
                border: active ? "1px solid #0E4C92" : `1px solid ${T.border}`,
                background: active ? "#EAF1FF" : T.card,
                color: active ? "#0E4C92" : T.muted,
                fontSize: 12, fontWeight: active ? 700 : 500,
                cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
              }}
            >
              {t.label}
              {count > 0 && (
                <span style={{
                  minWidth: 18, height: 18, borderRadius: 9,
                  display: "grid", placeItems: "center",
                  background: active ? "#0E4C92" : T.border,
                  color: active ? "#fff" : T.muted,
                  fontSize: 10, fontWeight: 700, padding: "0 4px",
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{
          background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 12, padding: "40px 24px",
          textAlign: "center", color: T.muted, fontSize: 14,
        }}>
          {mitraList.length === 0 ? "Belum ada pengajuan untuk dilacak." : "Tidak ada pengajuan yang sesuai filter."}
        </div>
      ) : (
        <div>
          {filtered.map((item) => (
            <TrackingCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
