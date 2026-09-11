import { useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { T, font } from "../lib/theme";

function formatTime(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).replace(".", ":") + " WIB";
}

function stageMeta(label) {
  if (label === "Selesai") return { color: "#1E7F3E", bg: "#DEF6E5" };
  if ((label || "").startsWith("Menunggu TTD")) return { color: "#5F6B76", bg: "#EEF0F3" };
  if ((label || "").startsWith("Menunggu")) return { color: "#8A6D00", bg: "#FFF4D6" };
  if ((label || "").startsWith("Siap")) return { color: "#0E4C92", bg: "#E8F1FB" };
  return { color: "#0E4C92", bg: "#E8F1FB" };
}

function StageBadge({ label }) {
  const meta = stageMeta(label);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 999,
      background: meta.bg, color: meta.color,
      fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.color }} />
      {label}
    </span>
  );
}

function categoryMeta(kategori) {
  if (kategori === "Cash Card") return { label: "Cash Card", color: "#6C4AB6", bg: "#F0EBFA" };
  if (kategori === "PO") return { label: "PO", color: "#0E4C92", bg: "#E8F1FB" };
  return { label: "NON PO", color: "#8A5B00", bg: "#FFF1D6" };
}

function CategoryBadge({ kategori }) {
  const meta = categoryMeta(kategori);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 9px", borderRadius: 999,
      background: meta.bg, color: meta.color,
      fontSize: 10.5, fontWeight: 700, whiteSpace: "nowrap",
    }}>
      {meta.label}
    </span>
  );
}

function getActiveKey(kategori, stageLabel) {
  if (stageLabel === "Selesai") return "selesai";
  if (stageLabel === "Menunggu TTD Asman") return "ttd-asman";
  if (stageLabel === "Menunggu TTD MADM") return "ttd-madm";

  if (kategori === "PO") {
    if (stageLabel === "Siap Dibuat PO") return "proses-po";
    if (stageLabel === "Menunggu Nomor PR") return "nomor-pr";
    if (stageLabel === "Menunggu Nomor PO") return "nomor-po";
    if (stageLabel === "Menunggu BAST/BAPB" || stageLabel === "Dokumen Lengkap") return "bast-bapb";
  } else {
    if ((stageLabel || "").startsWith("Siap Dibuat")) return "master";
    if (stageLabel === "Dokumen Diproses" || stageLabel === "Dokumen Lengkap") return "dokumen";
  }

  if (stageLabel === "Sudah di Akutansi") return "akutansi";
  if (stageLabel === "Menunggu Scan Dokumen") return "scan";
  return "rab";
}

function buildSteps(kategori) {
  if (kategori === "PO") {
    return [
      { key: "rab", label: "RAB Dibuat" },
      { key: "ttd-asman", label: "TTD Asman" },
      { key: "ttd-madm", label: "TTD MADM" },
      { key: "proses-po", label: "Proses PO" },
      { key: "nomor-pr", label: "Nomor PR" },
      { key: "nomor-po", label: "Nomor PO" },
      { key: "bast-bapb", label: "BAST/BAPB" },
      { key: "akutansi", label: "Akutansi" },
      { key: "keuangan", label: "Keuangan" },
      { key: "scan", label: "Scan" },
      { key: "selesai", label: "Selesai" },
    ];
  }

  const masterLabel = kategori === "Cash Card" ? "Cash Card Dibuat" : "NON PO Dibuat";
  return [
    { key: "rab", label: "RAB Dibuat" },
    { key: "ttd-asman", label: "TTD Asman" },
    { key: "ttd-madm", label: "TTD MADM" },
    { key: "master", label: masterLabel },
    { key: "dokumen", label: "Dokumen Lengkap" },
    { key: "akutansi", label: "Akutansi" },
    { key: "keuangan", label: "Keuangan" },
    { key: "scan", label: "Scan" },
    { key: "selesai", label: "Selesai" },
  ];
}

function StepProgress({ kategori, stageLabel }) {
  const steps = useMemo(() => buildSteps(kategori), [kategori]);
  const activeKey = getActiveKey(kategori, stageLabel);
  const activeIndex = Math.max(0, steps.findIndex((s) => s.key === activeKey));
  const finished = stageLabel === "Selesai";

  return (
    <div style={{ overflowX: "auto", paddingBottom: 4 }}>
      <div style={{ display: "flex", alignItems: "center", minWidth: Math.max(760, steps.length * 108) }}>
        {steps.map((step, i) => {
          const done = finished || i < activeIndex;
          const active = !finished && i === activeIndex;
          const bg = done ? "#1E7F3E" : active ? "#0E4C92" : T.border;
          const fg = done || active ? "#fff" : T.muted;
          return (
            <div key={step.key} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 82 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: bg, color: fg,
                  display: "grid", placeItems: "center",
                  fontSize: 11, fontWeight: 700,
                }}>
                  {done ? <CheckCircle2 size={14} /> : i + 1}
                </div>
                <span style={{
                  fontSize: 10, lineHeight: 1.25, textAlign: "center",
                  color: active ? T.heading : T.muted,
                  fontWeight: active ? 700 : 500,
                  maxWidth: 88,
                }}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div style={{
                  flex: 1, height: 2, margin: "0 3px 16px",
                  background: finished || i < activeIndex ? "#1E7F3E" : T.border,
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function buildHistory(rab, kategori, stage, paymentCreatedAt) {
  const events = [];
  const add = (label, tanggal, oleh, catatan) => {
    if (!tanggal) return;
    events.push({ label, tanggal, oleh, catatan });
  };

  add("RAB Dibuat", rab?.tanggalInput || rab?.tanggalRab, "Humas", "RAB masuk ke sistem.");
  add("TTD Asman", rab?.signatureAsman?.signedAt, "Asman", "RAB sudah ditandatangani Asman.");
  add("TTD MADM", rab?.signatureMadm?.signedAt, "MADM", "RAB sudah ditandatangani MADM.");
  add(
    kategori === "Cash Card" ? "Cash Card Dibuat" : kategori === "PO" ? "Proses PO Dimulai" : "NON PO Dibuat",
    paymentCreatedAt,
    "Humas",
    "Master pembayaran sudah dibuat."
  );

  events.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));

  const lastLabel = events.at(-1)?.label;
  if (stage?.label && stage.label !== lastLabel) {
    events.push({ label: stage.label, tanggal: null, oleh: "Sistem", catatan: "Tahap saat ini dihitung otomatis dari data yang sudah tersimpan." });
  }
  return events;
}

export default function PaymentTrackingCard({
  rab,
  stage,
  kategori,
  paymentCreatedAt,
  paymentPackage,
  defaultOpen = false,
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (!rab || !stage) return null;

  const actualKategori = kategori || rab.kategori || "NON PO";
  const history = buildHistory(rab, actualKategori, stage, paymentCreatedAt);
  const meta = stageMeta(stage.label);
  const doneDocs = (stage.docProgress || []).filter((d) => d.done).length;
  const totalDocs = (stage.docProgress || []).length;

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
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%", padding: "14px 18px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          background: "none", border: 0, cursor: "pointer", textAlign: "left",
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: T.heading, lineHeight: 1.4, overflowWrap: "anywhere" }}>
            {rab.judulKegiatan || "RAB tanpa judul"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginTop: 5 }}>
            <span style={{ fontFamily: font.mono, fontSize: 11.5, fontWeight: 700, color: T.blue }}>#{rab.idNumber}</span>
            <CategoryBadge kategori={actualKategori} />
            {stage.paymentId && (
              <span style={{ fontSize: 11.5, color: T.muted }}>Pembayaran: <b style={{ color: T.text }}>{stage.paymentId}</b></span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <StageBadge label={stage.label} />
          {open ? <ChevronUp size={15} color={T.muted} /> : <ChevronDown size={15} color={T.muted} />}
        </div>
      </button>

      {open && (
        <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${T.border}` }}>
          <div style={{ paddingTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 12 }}>
              Progres Tahapan
            </div>
            <StepProgress kategori={actualKategori} stageLabel={stage.label} />

            <div style={{ padding: "10px 12px", borderRadius: 8, background: meta.bg, color: meta.color, fontSize: 12.5, marginTop: 10 }}>
              Tahap saat ini: <b>{stage.label}</b>
              {stage.label === "Selesai" && " — seluruh proses pencatatan sampai scan dokumen sudah lengkap."}
            </div>

            {totalDocs > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 9 }}>
                  Kelengkapan Dokumen ({doneDocs}/{totalDocs})
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {stage.docProgress.map((doc) => (
                    <span key={doc.key} style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "5px 8px", borderRadius: 7,
                      border: `1px solid ${doc.done ? "#BEE2CC" : T.border}`,
                      background: doc.done ? "#F0FAF4" : T.bg,
                      color: doc.done ? "#166E49" : T.muted,
                      fontSize: 11.5, fontWeight: 600,
                    }}>
                      {doc.done ? "✓" : "—"} {doc.key}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(paymentPackage?.diAkutansi || paymentPackage?.diKeuangan || paymentPackage?.scanUrl) && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 9 }}>
                  Proses Akhir
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[
                    ["Akutansi", !!paymentPackage?.diAkutansi],
                    ["Keuangan", !!paymentPackage?.diKeuangan],
                    ["Scan Dokumen", !!paymentPackage?.scanUrl],
                  ].map(([label, done]) => (
                    <span key={label} style={{
                      padding: "5px 8px", borderRadius: 7, fontSize: 11.5, fontWeight: 600,
                      background: done ? "#F0FAF4" : T.bg,
                      color: done ? "#166E49" : T.muted,
                      border: `1px solid ${done ? "#BEE2CC" : T.border}`,
                    }}>
                      {done ? "✓" : "—"} {label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {history.length > 0 && (
              <div style={{ marginTop: 17 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 10 }}>
                  Riwayat Status
                </div>
                <div style={{ borderLeft: `2px solid ${T.border}`, marginLeft: 10, paddingLeft: 14 }}>
                  {history.map((item, i) => {
                    const isCurrent = !item.tanggal;
                    const eventMeta = isCurrent ? meta : { color: "#1E7F3E" };
                    return (
                      <div key={`${item.label}-${i}`} style={{ marginBottom: 13, position: "relative" }}>
                        <div style={{
                          position: "absolute", left: -20, top: 3,
                          width: 8, height: 8, borderRadius: "50%",
                          background: eventMeta.color,
                          border: `2px solid ${T.card}`,
                        }} />
                        <div style={{ fontSize: 10.5, color: T.muted, marginBottom: 2 }}>
                          {item.tanggal ? `${formatTime(item.tanggal)} — ${item.oleh}` : `Saat ini — ${item.oleh}`}
                        </div>
                        <div style={{ fontSize: 12.5, color: T.heading, fontWeight: 600 }}>{item.label}</div>
                        {item.catatan && <div style={{ fontSize: 11.5, color: T.muted, marginTop: 2 }}>{item.catatan}</div>}
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
