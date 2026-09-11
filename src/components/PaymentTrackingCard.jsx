import { useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { T, font } from "../lib/theme";

function formatTime(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).replace(".", ":") + " WIB";
}

function stageMeta(label) {
  if (label === "Selesai") return { color: "#1E7F3E", bg: "#DEF6E5" };
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

function buildRabSteps(kategori) {
  if (kategori === "PO") {
    return [
      { key: "rab", label: "RAB Dibuat" },
      { key: "ttd-asman-rab", label: "TTD Asman RAB" },
      { key: "ttd-madm-rab", label: "TTD MADM RAB" },
      { key: "payment", label: "Proses PO" },
      { key: "documents", label: "Dokumen" },
      { key: "external", label: "Proses Akhir" },
      { key: "done", label: "Selesai" },
    ];
  }
  return [
    { key: "rab", label: "RAB Dibuat" },
    { key: "ttd-asman-rab", label: "TTD Asman RAB" },
    { key: "ttd-madm-rab", label: "TTD MADM RAB" },
    { key: "payment", label: kategori === "Cash Card" ? "Cash Card Dibuat" : "NON PO Dibuat" },
    { key: "documents", label: "Dokumen" },
    { key: "external", label: "Proses Akhir" },
    { key: "done", label: "Selesai" },
  ];
}

function rabActiveIndex(steps, stageLabel) {
  if (stageLabel === "Selesai") return steps.length - 1;
  if (stageLabel === "Menunggu TTD Asman") return 1;
  if (stageLabel === "Menunggu TTD MADM") return 2;
  if ((stageLabel || "").startsWith("Siap Dibuat")) return 3;
  if (["Dokumen Diproses", "Menunggu Nomor PR", "Menunggu Nomor PO", "Menunggu BAST/BAPB"].includes(stageLabel)) return 4;
  if (["Menunggu TTD Officer Comdev", "Menunggu TTD Asman Dokumen", "Menunggu Akutansi", "Menunggu Keuangan", "Menunggu Scan Dokumen"].includes(stageLabel)) return 5;
  return 0;
}

function buildPaymentSteps(kategori, stage, paymentCreatedAt, paymentPackage) {
  const masterLabel = kategori === "Cash Card" ? "Cash Card Dibuat" : kategori === "PO" ? "Proses PO Dimulai" : "NON PO Dibuat";
  const docs = (stage.docProgress || []).map((doc) => ({
    key: `doc-${doc.key}`,
    label: doc.key,
    done: !!doc.done,
    at: doc.at || null,
  }));

  return [
    {
      key: "master",
      label: masterLabel,
      done: !!stage.paymentId || !!paymentCreatedAt,
      at: paymentCreatedAt || null,
    },
    ...docs,
    { key: "officer", label: "TTD Officer Comdev", done: !!paymentPackage?.ttdOfficerComdev, at: paymentPackage?.ttdOfficerComdevAt || null },
    { key: "asman", label: "TTD Asman", done: !!paymentPackage?.ttdAsman, at: paymentPackage?.ttdAsmanAt || null },
    { key: "akutansi", label: "Akutansi", done: !!paymentPackage?.diAkutansi, at: paymentPackage?.diAkutansiAt || null },
    { key: "keuangan", label: "Keuangan", done: !!paymentPackage?.diKeuangan, at: paymentPackage?.diKeuanganAt || null },
    { key: "scan", label: "Scan Dokumen", done: !!paymentPackage?.scanUrl, at: paymentPackage?.scanUploadedAt || null },
    { key: "selesai", label: "Selesai", done: stage.label === "Selesai", at: stage.label === "Selesai" ? (paymentPackage?.scanUploadedAt || null) : null },
  ];
}

function StepProgress({ steps, activeIndex }) {
  return (
    <div style={{ overflowX: "auto", paddingBottom: 4 }}>
      <div style={{ display: "flex", alignItems: "center", minWidth: Math.max(760, steps.length * 104) }}>
        {steps.map((step, i) => {
          const done = !!step.done || i < activeIndex;
          const active = !done && i === activeIndex;
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
                  maxWidth: 92,
                }}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div style={{
                  flex: 1, height: 2, margin: "0 3px 16px",
                  background: done ? "#1E7F3E" : T.border,
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function paymentHistory(kategori, stage, paymentCreatedAt, paymentPackage) {
  const steps = buildPaymentSteps(kategori, stage, paymentCreatedAt, paymentPackage);
  const completed = steps.filter((s) => s.done && s.key !== "selesai");
  const events = completed.map((s) => ({ label: s.label, at: s.at, current: false }));
  if (stage.label === "Selesai") {
    events.push({ label: "Selesai", at: paymentPackage?.scanUploadedAt || null, current: true });
  } else {
    events.push({ label: stage.label, at: null, current: true });
  }
  return events;
}

function rabHistory(rab, kategori, stage, paymentCreatedAt) {
  const events = [];
  if (rab?.tanggalInput || rab?.tanggalRab) events.push({ label: "RAB Dibuat", at: rab.tanggalInput || rab.tanggalRab });
  if (rab?.signatureAsman?.signedAt) events.push({ label: "TTD Asman RAB", at: rab.signatureAsman.signedAt });
  if (rab?.signatureMadm?.signedAt) events.push({ label: "TTD MADM RAB", at: rab.signatureMadm.signedAt });
  if (paymentCreatedAt) events.push({ label: kategori === "Cash Card" ? "Cash Card Dibuat" : kategori === "PO" ? "Proses PO Dimulai" : "NON PO Dibuat", at: paymentCreatedAt });
  events.push({ label: stage.label, at: null, current: true });
  return events;
}

export default function PaymentTrackingCard({
  rab,
  stage,
  kategori,
  paymentCreatedAt,
  paymentPackage,
  defaultOpen = false,
  scope = "rab", // "rab" | "payment"
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (!rab || !stage) return null;

  const actualKategori = kategori || rab.kategori || "NON PO";
  const meta = stageMeta(stage.label);
  const doneDocs = (stage.docProgress || []).filter((d) => d.done).length;
  const totalDocs = (stage.docProgress || []).length;

  const paymentSteps = useMemo(
    () => buildPaymentSteps(actualKategori, stage, paymentCreatedAt, paymentPackage),
    [actualKategori, stage, paymentCreatedAt, paymentPackage]
  );
  const paymentActiveIndex = Math.max(0, paymentSteps.findIndex((s) => !s.done));
  const rabSteps = useMemo(() => buildRabSteps(actualKategori), [actualKategori]);
  const rabIndex = rabActiveIndex(rabSteps, stage.label);
  const steps = scope === "payment"
    ? paymentSteps
    : rabSteps.map((s, i) => ({ ...s, done: stage.label === "Selesai" || i < rabIndex }));
  const activeIndex = scope === "payment" ? paymentActiveIndex : rabIndex;
  const history = scope === "payment"
    ? paymentHistory(actualKategori, stage, paymentCreatedAt, paymentPackage)
    : rabHistory(rab, actualKategori, stage, paymentCreatedAt);

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
              {scope === "payment" ? "Tracking Aktivitas Dokumen" : "Progres Tahapan"}
            </div>
            <StepProgress steps={steps} activeIndex={activeIndex} />

            <div style={{ padding: "10px 12px", borderRadius: 8, background: meta.bg, color: meta.color, fontSize: 12.5, marginTop: 10 }}>
              Tahap saat ini: <b>{stage.label}</b>
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

            {scope === "payment" && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 9 }}>
                  Proses Dokumen Selesai
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[
                    ["TTD Officer Comdev", !!paymentPackage?.ttdOfficerComdev],
                    ["TTD Asman", !!paymentPackage?.ttdAsman],
                    ["Akutansi", !!paymentPackage?.diAkutansi],
                    ["Keuangan", !!paymentPackage?.diKeuangan],
                    ["Scan", !!paymentPackage?.scanUrl],
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
                    const isCurrent = !!item.current;
                    const color = isCurrent ? meta.color : "#1E7F3E";
                    const time = formatTime(item.at);
                    return (
                      <div key={`${item.label}-${i}`} style={{ marginBottom: 13, position: "relative" }}>
                        <div style={{
                          position: "absolute", left: -20, top: 3,
                          width: 8, height: 8, borderRadius: "50%",
                          background: color,
                          border: `2px solid ${T.card}`,
                        }} />
                        <div style={{ fontSize: 10.5, color: T.muted, marginBottom: 2 }}>
                          {isCurrent && !item.at ? "Saat ini — Sistem" : time || "Waktu tidak tersedia"}
                        </div>
                        <div style={{ fontSize: 12.5, color: T.heading, fontWeight: 600 }}>{item.label}</div>
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
