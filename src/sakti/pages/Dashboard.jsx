import { useEffect, useMemo, useState } from "react";
import { DOC_STATUS } from "../../lib/data";
import {
  FileSpreadsheet,
  Handshake,
  Megaphone,
  Clock,
} from "lucide-react";
import { T, font } from "../../lib/theme";
import { roleLabel, rupiah } from "../../lib/utils";
import Card from "../../components/Card";
import Badge, { StatusBadge } from "../../components/Badge";

// ---------------- greeting kontekstual (bukan sekedar "Selamat Datang") ----
function greetingFor(hour) {
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

// ---------------- summary tile ---------------------------------------------
function Tile({ icon: Icon, value, label, tone = "blue", onClick }) {
  const bg = tone === "yellow" ? "#FFF4D6" : T.blueSoft;
  const fg = tone === "yellow" ? T.yellowText : T.blue;
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        border: `1px solid ${T.border}`,
        background: T.card,
        borderRadius: 10,
        cursor: onClick ? "pointer" : "default",
        textAlign: "left",
        transition: "border-color .15s ease, transform .15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = fg;
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = T.border;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          background: bg,
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={16} color={fg} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: font.display,
            fontSize: 22,
            color: T.heading,
            lineHeight: 1,
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: 11.5,
            color: T.muted,
            marginTop: 3,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </div>
      </div>
    </button>
  );
}


// ---------------- panels -------------------------------------------------
function ProposalSpotlight({ items, goto }) {
  const shown = items.slice(0, 3);
  return (
    <Card>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h3
          style={{
            fontFamily: font.display,
            fontSize: 15.5,
            margin: 0,
            color: T.heading,
          }}
        >
          Proposal Terbaru
        </h3>
        <button
          onClick={() => goto("proposal-rekap")}
          style={{
            background: "transparent",
            border: "none",
            color: T.blue,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            padding: 0,
          }}
        >
          Lihat semua →
        </button>
      </div>
      {!shown.length && (
        <div style={{ fontSize: 13, color: T.muted, padding: "18px 0" }}>
          Belum ada proposal masuk. Klik menu <b>Proposal Stakeholder</b> untuk mulai.
        </div>
      )}
      {shown.map((p, i) => (
        <div
          key={p.id}
          style={{
            display: "flex",
            gap: 12,
            padding: "10px 0",
            borderBottom:
              i < shown.length - 1 ? `1px solid ${T.border}` : "none",
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: T.blueSoft,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <Handshake size={15} color={T.blue} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: T.heading,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {p.judulProposal || "(tanpa judul)"}
            </div>
            <div style={{ fontSize: 11.5, color: T.muted, marginTop: 2 }}>
              {p.namaLembaga} · {p.nilaiDiajukan ? rupiah(p.nilaiDiajukan) : "-"}
            </div>
          </div>
          <div style={{ alignSelf: "center" }}>
            <StatusBadge value={p.statusProposal} />
          </div>
        </div>
      ))}
    </Card>
  );
}

function KontenPipeline({ items, goto }) {
  // Highlight konten yang butuh perhatian: Draft (belum terbit).
  const perluAksi = items.filter((k) => k.status === "Draft");
  const shown = perluAksi.slice(0, 3);
  return (
    <Card>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h3
          style={{
            fontFamily: font.display,
            fontSize: 15.5,
            margin: 0,
            color: T.heading,
          }}
        >
          Antrean Publikasi
        </h3>
        <button
          onClick={() => goto("konten")}
          style={{
            background: "transparent",
            border: "none",
            color: T.blue,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            padding: 0,
          }}
        >
          Buka Mirroring Konten →
        </button>
      </div>
      {!shown.length && (
        <div style={{ fontSize: 13, color: T.muted, padding: "18px 0" }}>
          Tidak ada konten yang menunggu terbit,semua sudah published atau
          dibatalkan.
        </div>
      )}
      {shown.map((k, i) => {
        const jmlPublikasi = Array.isArray(k.publikasi) ? k.publikasi.length : 0;
        return (
          <div
            key={k.id}
            style={{
              display: "flex",
              gap: 12,
              padding: "10px 0",
              borderBottom: i < shown.length - 1 ? `1px solid ${T.border}` : "none",
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: "#FFF4D6",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <Megaphone size={15} color={T.yellowText} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: T.heading,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {k.judul || "(tanpa judul)"}
              </div>
              <div style={{ fontSize: 11.5, color: T.muted, marginTop: 2 }}>
                {k.kategori || "-"} · {k.tanggal || "belum dijadwal"}
                {jmlPublikasi ? ` · ${jmlPublikasi} publikasi` : ""}
              </div>
            </div>
            <div style={{ alignSelf: "center" }}>
              <StatusBadge value={k.status} />
            </div>
          </div>
        );
      })}
    </Card>
  );
}

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
      padding: "4px 12px", borderRadius: 8,
      background: T.blueSoft, border: `1px solid ${T.border}`,
      fontSize: 12.5, color: T.blue, fontWeight: 600,
      fontFamily: font.mono,
    }}>
      <Clock size={13} />
      {dateStr} - {timeStr} WIB
    </div>
  );
}

// ---------------- grafik garis: dokumen masuk per kategori & periode -------
const PERIODE_OPTIONS = [
  { key: "harian", label: "Harian" },
  { key: "mingguan", label: "Mingguan" },
  { key: "bulanan", label: "Bulanan" },
  { key: "tahunan", label: "Tahunan" },
];

function startOfWeek(d) {
  const x = new Date(d);
  const day = x.getDay() === 0 ? 7 : x.getDay(); // Senin = awal minggu
  x.setDate(x.getDate() - (day - 1));
  x.setHours(0, 0, 0, 0);
  return x;
}

// Bikin N titik waktu ke belakang (dari hari ini) sesuai periode yang dipilih,
// lalu hitung jumlah submission per kategori yang jatuh di tiap titik itu.
function buildSeries(submissions, periode) {
  const now = new Date();
  const points = [];

  if (periode === "harian") {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      points.push({ key, label: d.toLocaleDateString("id-ID", { weekday: "short" }), from: new Date(key), to: new Date(new Date(key).getTime() + 86400000) });
    }
  } else if (periode === "mingguan") {
    for (let i = 5; i >= 0; i--) {
      const d = startOfWeek(now);
      d.setDate(d.getDate() - i * 7);
      const to = new Date(d); to.setDate(to.getDate() + 7);
      points.push({ key: d.toISOString().slice(0, 10), label: `${d.getDate()}/${d.getMonth() + 1}`, from: d, to });
    }
  } else if (periode === "bulanan") {
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const to = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      points.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString("id-ID", { month: "short" }), from: d, to });
    }
  } else {
    for (let i = 4; i >= 0; i--) {
      const y = now.getFullYear() - i;
      points.push({ key: String(y), label: String(y), from: new Date(y, 0, 1), to: new Date(y + 1, 0, 1) });
    }
  }

  return points.map((p) => {
    const inRange = submissions.filter((s) => {
      const t = s.createdAt ? new Date(s.createdAt) : null;
      return t && t >= p.from && t < p.to;
    });
    return {
      label: p.label,
      nonPo: inRange.filter((s) => s.kategori === "NON PO").length,
      po: inRange.filter((s) => s.kategori === "PO").length,
      cc: inRange.filter((s) => s.kategori === "Cash Card").length,
    };
  });
}

function KategoriLineChart({ submissions, goto }) {
  const [periode, setPeriode] = useState("bulanan");
  const series = useMemo(() => buildSeries(submissions || [], periode), [submissions, periode]);

  const lines = [
    { key: "nonpo-overview", field: "nonPo", label: "NON PO", color: T.blue },
    { key: "po-overview", field: "po", label: "PO", color: T.navy },
    { key: "cc-overview", field: "cc", label: "Cash Card", color: T.yellowText },
  ];

  const W = 900, H = 220, padL = 30, padR = 12, padT = 12, padB = 28;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const maxVal = Math.max(1, ...series.flatMap((s) => [s.nonPo, s.po, s.cc]));
  const stepX = series.length > 1 ? innerW / (series.length - 1) : 0;
  const yFor = (v) => padT + innerH - (v / maxVal) * innerH;
  const xFor = (i) => padL + i * stepX;

  const pathFor = (field) =>
    series.map((s, i) => `${i === 0 ? "M" : "L"} ${xFor(i).toFixed(1)} ${yFor(s[field]).toFixed(1)}`).join(" ");

  // Gridline horizontal sederhana: 0, tengah, maks
  const gridVals = [0, Math.round(maxVal / 2), maxVal];

  return (
    <Card style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h3 style={{ fontFamily: font.display, fontSize: 15.5, margin: 0, color: T.heading }}>
            Dokumen Masuk per Kategori
          </h3>
          <div style={{ display: "flex", gap: 14, marginTop: 6 }}>
            {lines.map((l) => (
              <div key={l.key} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: T.muted }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: l.color, display: "inline-block" }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, background: T.bg, borderRadius: 8, padding: 3 }}>
          {PERIODE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setPeriode(opt.key)}
              style={{
                border: "none",
                borderRadius: 6,
                padding: "6px 11px",
                fontSize: 11.5,
                fontWeight: 600,
                cursor: "pointer",
                background: periode === opt.key ? T.card : "transparent",
                color: periode === opt.key ? T.heading : T.muted,
                boxShadow: periode === opt.key ? "0 1px 2px rgba(16,24,40,0.08)" : "none",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ width: "100%", overflowX: "auto" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", minWidth: 480, display: "block" }}>
          {gridVals.map((v, i) => (
            <g key={i}>
              <line x1={padL} x2={W - padR} y1={yFor(v)} y2={yFor(v)} stroke={T.border} strokeWidth={1} />
              <text x={2} y={yFor(v) + 3} fontSize={9.5} fill={T.muted}>{v}</text>
            </g>
          ))}

          {lines.map((l) => (
            <path key={l.key} d={pathFor(l.field)} fill="none" stroke={l.color} strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" />
          ))}

          {lines.map((l) =>
            series.map((s, i) => (
              <circle
                key={`${l.key}-${i}`}
                cx={xFor(i)}
                cy={yFor(s[l.field])}
                r={3}
                fill={l.color}
                style={{ cursor: "pointer" }}
                onClick={() => goto(l.key)}
              >
                <title>{`${l.label} · ${series[i].label}: ${s[l.field]}`}</title>
              </circle>
            ))
          )}

          {series.map((s, i) => (
            <text key={i} x={xFor(i)} y={H - 8} fontSize={9.5} fill={T.muted} textAnchor="middle">
              {s.label}
            </text>
          ))}
        </svg>
      </div>
    </Card>
  );
}

export default function Dashboard({ data, packages = [], goto, user }) {
  const fullyApprovedRab = data.rab
    .map((r) => ({ ...r, pkg: packages.find((p) => p.idRab === r.idNumber) }))
    .filter((r) => r.pkg?.status === DOC_STATUS.PROCESSED)
    .sort((a, b) => new Date(b.pkg.processedAt || 0) - new Date(a.pkg.processedAt || 0));
  const now = new Date();
  const greeting = greetingFor(now.getHours());

  const proposalCounts = {
    total: data.proposals.length,
    baru: data.proposals.filter((p) => p.statusProposal === "Baru Masuk").length,
    disetujui: data.proposals.filter((p) => p.statusProposal === "Disetujui").length,
  };
  const kontenCounts = {
    total: data.konten.length,
    draft: data.konten.filter((k) => k.status === "Draft").length,
    terbit: data.konten.filter((k) => k.status === "Terbit").length,
  };
  const kontenPerluAksi = kontenCounts.draft;

  return (
    <div>
      {/* Header,greeting + tanggal panjang */}
      <div
        style={{
          marginBottom: 22,
          paddingBottom: 18,
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <h1
          style={{
            fontFamily: font.display,
            fontSize: 24,
            margin: 0,
            color: T.heading,
            lineHeight: 1.25,
          }}
        >
          {greeting}
          {user?.role ? `, ${roleLabel(user.role)}` : ""}.
        </h1>
        <div style={{ marginTop: 8 }}>
          <LiveClock />
        </div>
      </div>

      {/* Grafik dokumen masuk per kategori (NON PO / PO / Cash Card) */}
      <KategoriLineChart submissions={data.nonpoSubmissions} goto={goto} />

      {/* Stakeholder + Konten tiles */}
      <div
        className="stat-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <Tile
          icon={Handshake}
          value={proposalCounts.total}
          label={`${proposalCounts.baru} baru · ${proposalCounts.disetujui} disetujui`}
          onClick={() => goto("proposal-rekap")}
        />
        <Tile
          icon={Megaphone}
          value={kontenCounts.total}
          label={`${kontenCounts.terbit} terbit · ${kontenPerluAksi} antrean`}
          tone="yellow"
          onClick={() => goto("konten")}
        />
        <Tile
          icon={FileSpreadsheet}
          value={data.rab.length}
          label="RAB diajukan"
          onClick={() => goto("rab")}
        />
      </div>

      {/* Panels: proposal terbaru + antrean publikasi konten */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <ProposalSpotlight items={data.proposals} goto={goto} />
        <KontenPipeline items={data.konten} goto={goto} />
      </div>

      {/* RAB terbaru,referensi cepat */}
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <h3
            style={{
              fontFamily: font.display,
              fontSize: 15.5,
              margin: 0,
              color: T.heading,
            }}
          >
            RAB Disetujui (Asman &amp; MADM)
          </h3>
          <button
            onClick={() => goto("rab")}
            style={{
              background: "transparent",
              border: "none",
              color: T.blue,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
            }}
          >
            Semua RAB →
          </button>
        </div>
        {!fullyApprovedRab.length ? (
          <div style={{ fontSize: 13, color: T.muted, padding: "12px 0" }}>
            Belum ada RAB yang sudah disetujui penuh oleh Asman dan MADM.
            Kirim paket RAB lewat menu Paket Kas untuk memulai proses persetujuan.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 10,
            }}
          >
            {fullyApprovedRab
              .slice(0, 4)
              .map((r) => (
                <div
                  key={r.idNumber}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    background: T.bg,
                    border: `1px solid ${T.border}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: font.mono,
                        fontWeight: 700,
                        color: T.navy,
                        fontSize: 12,
                      }}
                    >
                      {r.idNumber}
                    </span>
                    <Badge tone="blue">{r.kategori || "-"}</Badge>
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 13,
                      color: T.text,
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.judulKegiatan || "-"}
                  </div>
                  <div style={{ marginTop: 4, fontSize: 12, color: T.muted }}>
                    {rupiah(r.totalEvaluasi)}
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>
    </div>
  );
}
