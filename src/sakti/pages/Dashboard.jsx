import { useEffect, useMemo, useRef, useState } from "react";
import { DOC_STATUS } from "../../lib/data";
import {
  ChevronRight,
  FileSpreadsheet,
  Handshake,
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
  { key: "mingguan", label: "Mingguan" },
  { key: "bulanan", label: "Bulanan" },
  { key: "tahunan", label: "Tahunan" },
];

const CHART_LINES = [
  { key: "proposal-rekap", field: "proposal", label: "Proposal", color: "#7C4DBF" },
  { key: "nonpo-overview", field: "nonPo", label: "NON PO", color: T.blue },
  { key: "po-overview", field: "po", label: "PO", color: T.navy },
  { key: "cc-overview", field: "cc", label: "Cash Card", color: T.yellowText },
];

function startOfWeek(d) {
  const x = new Date(d);
  const day = x.getDay() === 0 ? 7 : x.getDay(); // Senin = awal minggu
  x.setDate(x.getDate() - (day - 1));
  x.setHours(0, 0, 0, 0);
  return x;
}

const MONTH_SHORT = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

function pad2(n) { return String(n).padStart(2, "0"); }
function ddmmyy(d) { return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${String(d.getFullYear()).slice(-2)}`; }

// Titik-titik waktu per periode:
// - mingguan: beberapa minggu kalender terakhir (Senin s.d. Minggu), label
//   rentang tanggal "dd/mm/yy - dd/mm/yy"
// - bulanan: 12 bulan tahun berjalan penuh, scrollable — bukan di-squeeze
// - tahunan: 2025 s.d. tahun berjalan + 1 (otomatis nambah tiap tahun baru),
//   minimal tetap menampilkan sampai 2027
function buildPoints(periode, now) {
  const points = [];

  if (periode === "mingguan") {
    const thisWeekStart = startOfWeek(now);
    for (let i = 5; i >= 0; i--) {
      const from = new Date(thisWeekStart);
      from.setDate(from.getDate() - i * 7);
      const to = new Date(from);
      to.setDate(to.getDate() + 7);
      const to_inclusive = new Date(to.getTime() - 86400000); // Minggu (hari terakhir minggu itu)
      points.push({ label: `${ddmmyy(from)} - ${ddmmyy(to_inclusive)}`, from, to });
    }
  } else if (periode === "bulanan") {
    const y = now.getFullYear();
    for (let m = 0; m < 12; m++) {
      points.push({ label: MONTH_SHORT[m], from: new Date(y, m, 1), to: new Date(y, m + 1, 1) });
    }
  } else {
    const startYear = 2025;
    const endYear = Math.max(2027, now.getFullYear() + 1);
    for (let y = startYear; y <= endYear; y++) {
      points.push({ label: String(y), from: new Date(y, 0, 1), to: new Date(y + 1, 0, 1) });
    }
  }
  return points;
}

function buildSeries(submissions, proposals, periode, now) {
  const points = buildPoints(periode, now);
  return points.map((p) => {
    const subsInRange = submissions.filter((s) => {
      const t = s.createdAt ? new Date(s.createdAt) : null;
      return t && t >= p.from && t < p.to;
    });
    const proposalsInRange = proposals.filter((pr) => {
      const t = pr.createdAt ? new Date(pr.createdAt) : null;
      return t && t >= p.from && t < p.to;
    });
    return {
      label: p.label,
      proposal: proposalsInRange.length,
      nonPo: subsInRange.filter((s) => s.kategori === "NON PO").length,
      po: subsInRange.filter((s) => s.kategori === "PO").length,
      cc: subsInRange.filter((s) => s.kategori === "Cash Card").length,
    };
  });
}

function KategoriLineChart({ submissions, proposals, goto }) {
  const [periode, setPeriode] = useState("mingguan");
  // "now" disimpan sebagai state (bukan langsung new Date() di dalam useMemo)
  // dan di-refresh tiap beberapa menit, supaya begitu jam berganti ke minggu
  // (atau bulan/tahun) baru, titik grafik ikut otomatis geser tanpa perlu
  // reload halaman.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 5 * 60 * 1000); // tiap 5 menit
    return () => clearInterval(id);
  }, []);

  const series = useMemo(
    () => buildSeries(submissions || [], proposals || [], periode, now),
    [submissions, proposals, periode, now]
  );

  // Bulanan di-scroll horizontal: container dibatasi max-width supaya cuma
  // ~6 titik (bulan) yang keliatan di awal, sisanya discroll (drag/geser
  // biasa, atau klik tombol panah kecil di kanan judul).
  const scrollable = periode === "bulanan";
  const H = 200, padL = 34, padR = 16, padT = 14, padB = 26;
  const pointGap = scrollable ? 62 : null;
  const innerW = scrollable ? pointGap * (series.length - 1) : undefined;
  const W = scrollable ? innerW + padL + padR : 760;
  const plotW = scrollable ? innerW : W - padL - padR;
  const innerH = H - padT - padB;
  const scrollBoxRef = useRef(null);
  const scrollByPoint = (dir) => {
    scrollBoxRef.current?.scrollBy({ left: dir * pointGap, behavior: "smooth" });
  };

  const maxVal = Math.max(1, ...series.flatMap((s) => CHART_LINES.map((l) => s[l.field])));
  const niceMax = Math.ceil(maxVal / 4) * 4 || 4;
  const stepX = series.length > 1 ? plotW / (series.length - 1) : 0;
  const yFor = (v) => padT + innerH - (v / niceMax) * innerH;
  const xFor = (i) => padL + i * stepX;

  const pathFor = (field) =>
    series.map((s, i) => `${i === 0 ? "M" : "L"} ${xFor(i).toFixed(1)} ${yFor(s[field]).toFixed(1)}`).join(" ");

  const gridVals = [0, niceMax / 2, niceMax];

  return (
    <Card style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h3 style={{ fontFamily: font.display, fontSize: 15, margin: 0, color: T.heading, fontWeight: 700 }}>
            Dokumen Masuk
          </h3>
          <div style={{ display: "flex", gap: 12, marginTop: 7, flexWrap: "wrap" }}>
            {CHART_LINES.map((l) => (
              <div key={l.key} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: T.muted }}>
                <span style={{ width: 7, height: 7, borderRadius: 999, background: l.color, display: "inline-block" }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", gap: 3, background: T.bg, borderRadius: 8, padding: 3 }}>
            {PERIODE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setPeriode(opt.key)}
                style={{
                  border: "none",
                  borderRadius: 6,
                  padding: "6px 12px",
                  fontSize: 11.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  background: periode === opt.key ? T.card : "transparent",
                  color: periode === opt.key ? T.heading : T.muted,
                  boxShadow: periode === opt.key ? "0 1px 2px rgba(16,24,40,0.08)" : "none",
                  transition: "background .15s ease",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {scrollable && (
            <button
              type="button"
              onClick={() => scrollByPoint(1)}
              title="Geser ke bulan berikutnya"
              style={{
                width: 26, height: 26, borderRadius: 999, border: `1px solid ${T.border}`,
                background: T.card, color: T.muted, cursor: "pointer",
                display: "grid", placeItems: "center", flexShrink: 0,
              }}
            >
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>

      <div
        ref={scrollBoxRef}
        style={{
          width: "100%",
          overflowX: scrollable ? "auto" : "hidden",
        }}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: scrollable ? W : "100%", height: "auto", minWidth: scrollable ? W : 280, display: "block" }}
        >
          {gridVals.map((v, i) => (
            <g key={i}>
              <line x1={padL} x2={W - padR} y1={yFor(v)} y2={yFor(v)} stroke={T.border} strokeWidth={1} strokeDasharray={v === 0 ? "0" : "3 4"} />
              <text x={2} y={yFor(v) + 3} fontSize={9.5} fill={T.muted}>{Math.round(v)}</text>
            </g>
          ))}

          {CHART_LINES.map((l) => (
            <path key={l.key} d={pathFor(l.field)} fill="none" stroke={l.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          ))}

          {CHART_LINES.map((l) =>
            series.map((s, i) => (
              <circle
                key={`${l.key}-${i}`}
                cx={xFor(i)}
                cy={yFor(s[l.field])}
                r={2.6}
                fill={l.color}
                style={{ cursor: "pointer" }}
                onClick={() => goto(l.key)}
              >
                <title>{`${l.label} · ${s.label}: ${s[l.field]}`}</title>
              </circle>
            ))
          )}

          {series.map((s, i) =>
            periode === "mingguan" ? (
              <g key={i}>
                <text x={xFor(i)} y={H - 12} fontSize={8} fill={T.muted} textAnchor="middle">
                  {s.label.split(" - ")[0]}
                </text>
                <text x={xFor(i)} y={H - 4} fontSize={8} fill={T.muted} textAnchor="middle">
                  s/d {s.label.split(" - ")[1]}
                </text>
              </g>
            ) : (
              <text key={i} x={xFor(i)} y={H - 7} fontSize={9.5} fill={T.muted} textAnchor="middle">
                {s.label}
              </text>
            )
          )}
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
      <KategoriLineChart submissions={data.nonpoSubmissions} proposals={data.proposals} goto={goto} />

      {/* Stakeholder + RAB tiles */}
      <div
        className="stat-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
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
          icon={FileSpreadsheet}
          value={data.rab.length}
          label="RAB diajukan"
          onClick={() => goto("rab")}
        />
      </div>

      {/* Panel: proposal terbaru */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <ProposalSpotlight items={data.proposals} goto={goto} />
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
