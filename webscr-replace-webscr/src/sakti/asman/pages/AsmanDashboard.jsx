import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Inbox as InboxIcon, ThumbsDown, ThumbsUp, Clock, FileSignature } from "lucide-react";
import { T, font } from "../../../lib/theme";
import { DOC_STATUS, STATUS_META } from "../../../lib/data";
import PageHeader from "../../../components/PageHeader";
import Card from "../../../components/Card";
import DataTable from "../../../components/DataTable";

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const dateStr = now.toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("id-ID", {
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  });
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "5px 11px", borderRadius: 8,
      background: T.blueSoft, border: `1px solid ${T.border}`,
      fontSize: 12, color: T.blue, fontWeight: 600,
      fontFamily: font.mono, flexWrap: "wrap",
    }}>
      <Clock size={13} />
      {dateStr} - {timeStr} WIB
    </div>
  );
}

function CounterTile({ icon: Icon, label, value, meta, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 9,
        padding: "17px 17px 15px",
        borderRadius: 14,
        border: `1px solid ${meta.color}40`,
        background: `linear-gradient(140deg, ${meta.bg} 0%, ${T.card} 130%)`,
        cursor: "pointer",
        textAlign: "left",
        overflow: "hidden",
        minWidth: 0,
        transition: "transform .12s ease, box-shadow .15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 12px 28px rgba(10,42,80,0.10)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        display: "grid", placeItems: "center",
        background: meta.color, color: "#fff",
      }}>
        <Icon size={19} />
      </div>
      <div style={{
        fontSize: 10.5, letterSpacing: 1,
        textTransform: "uppercase", lineHeight: 1.4,
        fontFamily: font.mono, color: meta.color, fontWeight: 700,
      }}>{label}</div>
      <div style={{
        fontFamily: font.display, fontSize: 31, lineHeight: 1, color: T.heading,
      }}>{value}</div>
    </button>
  );
}

export default function AsmanDashboard({ user, packages, evaluasiList = [], goto }) {
  const counts = useMemo(() => {
    const c = { submitted: 0, approved: 0, rejected: 0, processed: 0 };
    for (const p of packages) {
      if (p.status === DOC_STATUS.SUBMITTED || p.status === DOC_STATUS.IN_REVIEW) c.submitted++;
      else if (p.status === DOC_STATUS.APPROVED) c.approved++;
      else if (p.status === DOC_STATUS.REJECTED) c.rejected++;
      else if (p.status === DOC_STATUS.PROCESSED) c.processed++;
    }
    return c;
  }, [packages]);

  const evalCounts = useMemo(() => {
    const c = { submitted: 0, approved: 0, rejected: 0, processed: 0 };
    for (const e of evaluasiList) {
      if (e.status === DOC_STATUS.SUBMITTED || e.status === DOC_STATUS.IN_REVIEW) c.submitted++;
      else if (e.status === DOC_STATUS.APPROVED) c.approved++;
      else if (e.status === DOC_STATUS.REJECTED) c.rejected++;
      else if (e.status === DOC_STATUS.PROCESSED) c.processed++;
    }
    return c;
  }, [evaluasiList]);

  const recent = useMemo(() => {
    const sortKey = (p) => p.processedAt || p.reviewedAt || p.submittedAt || "";
    return [...packages]
      .sort((a, b) => (sortKey(b) || "").localeCompare(sortKey(a) || ""))
      .slice(0, 8);
  }, [packages]);

  const isAsman = user.role === "asman";
  const roleLabel = isAsman ? "ASMAN" : "MADM";
  const desc = isAsman
    ? "Ringkasan dokumen yang menjadi tanggung jawab ASMAN untuk diperiksa sebelum diteruskan ke MADM."
    : "Ringkasan dokumen yang telah melalui pemeriksaan ASMAN dan menunggu keputusan atau proses MADM.";

  const packageLabels = isAsman
    ? ["Menunggu Review ASMAN", "Disetujui ASMAN", "Ditolak ASMAN", "Telah Diproses MADM"]
    : ["Menunggu Persetujuan MADM", "Siap Diproses MADM", "Ditolak", "Selesai Diproses MADM"];

  const evalLabels = isAsman
    ? ["Evaluasi Menunggu ASMAN", "Evaluasi Disetujui", "Evaluasi Ditolak", "Evaluasi Selesai"]
    : ["Evaluasi Menunggu MADM", "Evaluasi Siap Diproses", "Evaluasi Ditolak", "Evaluasi Selesai"];

  return (
    <div style={{ minWidth: 0 }}>
      <PageHeader
        eyebrow={`Panel ${roleLabel}`}
        title={`Dashboard ${roleLabel}`}
        description={desc}
      />

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 12, flexWrap: "wrap", marginBottom: 16,
      }}>
        <LiveClock />
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          padding: "6px 10px", borderRadius: 8,
          border: `1px solid ${T.border}`, background: T.card,
          fontSize: 11.5, color: T.muted, lineHeight: 1.4,
        }}>
          <FileSignature size={14} color={T.blue} />
          {isAsman ? "ASMAN: pemeriksaan / paraf sebelum MADM" : "MADM: persetujuan / proses akhir"}
        </div>
      </div>

      <div style={{
        fontFamily: font.mono, fontSize: 10.5, letterSpacing: 1.1,
        textTransform: "uppercase", color: T.muted, marginBottom: 8,
      }}>
        Paket Kas dan Dokumen RAB
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))",
        gap: 14, marginBottom: 20,
      }}>
        <CounterTile icon={InboxIcon} label={packageLabels[0]} value={counts.submitted} meta={STATUS_META.submitted} onClick={() => goto("inbox")} />
        <CounterTile icon={ThumbsUp} label={packageLabels[1]} value={counts.approved} meta={STATUS_META.approved} onClick={() => goto("inbox")} />
        <CounterTile icon={ThumbsDown} label={packageLabels[2]} value={counts.rejected} meta={STATUS_META.rejected} onClick={() => goto("inbox")} />
        <CounterTile icon={CheckCircle2} label={packageLabels[3]} value={counts.processed} meta={STATUS_META.processed} onClick={() => goto("inbox")} />
      </div>

      <div style={{
        fontFamily: font.mono, fontSize: 10.5, letterSpacing: 1.1,
        textTransform: "uppercase", color: T.muted, marginBottom: 8,
      }}>
        Form Evaluasi
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))",
        gap: 14, marginBottom: 20,
      }}>
        <CounterTile icon={InboxIcon} label={evalLabels[0]} value={evalCounts.submitted} meta={STATUS_META.submitted} onClick={() => goto("inbox-evaluasi")} />
        <CounterTile icon={ThumbsUp} label={evalLabels[1]} value={evalCounts.approved} meta={STATUS_META.approved} onClick={() => goto("inbox-evaluasi")} />
        <CounterTile icon={ThumbsDown} label={evalLabels[2]} value={evalCounts.rejected} meta={STATUS_META.rejected} onClick={() => goto("inbox-evaluasi")} />
        <CounterTile icon={CheckCircle2} label={evalLabels[3]} value={evalCounts.processed} meta={STATUS_META.processed} onClick={() => goto("inbox-evaluasi")} />
      </div>

      <Card padded={false}>
        <div style={{
          padding: "14px 18px",
          borderBottom: `1px solid ${T.border}`,
          fontFamily: font.display, fontSize: 14,
        }}>
          Aktivitas Dokumen Terbaru
        </div>
        <DataTable
          rows={recent}
          columns={[
            { key: "idRab", label: "ID Paket",
              render: (r) => <span style={{ fontFamily: font.mono, fontWeight: 700, fontSize: 12.5 }}>{r.idRab}</span> },
            { key: "judul", label: "Judul" },
            { key: "kategori", label: "Kategori" },
            { key: "status", label: "Status",
              render: (r) => {
                const m = STATUS_META[r.status] || STATUS_META.draft;
                return (
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "3px 10px", borderRadius: 999,
                    background: m.bg, color: m.color,
                    fontSize: 11.5, fontWeight: 700,
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.color }} />
                    {m.label}
                  </span>
                );
              },
            },
            { key: "updatedAt", label: "Update Terakhir",
              render: (r) => {
                const t = r.processedAt || r.reviewedAt || r.submittedAt;
                return t ? new Date(t).toLocaleString("id-ID", {
                  day: "2-digit", month: "short", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                }) : "-";
              },
            },
          ]}
          emptyLabel="Belum ada aktivitas."
          onRowClick={() => goto("inbox")}
        />
      </Card>
    </div>
  );
}
