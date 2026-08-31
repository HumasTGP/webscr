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

// ---------------- grafik bar berkelompok: dokumen masuk per kategori & periode
const PERIODE_OPTIONS = [
  { key: "mingguan", label: "Mingguan" },
  { key: "bulanan", label: "Bulanan" },
  { key: "tahunan", label: "Tahunan" },
];

const CHART_BARS = [
  { key: "proposal-rekap", field: "proposal", label: "Proposal", color: T.success },
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
const MONTH_FULL = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

// Label ringkas buat sumbu-X ("24–30 Agu"), dan label lengkap buat tooltip
// ("24–30 Agustus 2026" / lintas bulan "28 Agu–3 Sep 2026" / lintas tahun).
function weekLabels(from, toInclusive) {
  const sameMonth = from.getMonth() === toInclusive.getMonth() && from.getFullYear() === toInclusive.getFullYear();
  const short = sameMonth
    ? `${from.getDate()}–${toInclusive.getDate()} ${MONTH_SHORT[from.getMonth()]}`
    : `${from.getDate()} ${MONTH_SHORT[from.getMonth()]}–${toInclusive.getDate()} ${MONTH_SHORT[toInclusive.getMonth()]}`;
  const sameYear = from.getFullYear() === toInclusive.getFullYear();
  const full = sameMonth
    ? `${from.getDate()}–${toInclusive.getDate()} ${MONTH_FULL[from.getMonth()]} ${toInclusive.getFullYear()}`
    : sameYear
      ? `${from.getDate()} ${MONTH_FULL[from.getMonth()]}–${toInclusive.getDate()} ${MONTH_FULL[toInclusive.getMonth()]} ${toInclusive.getFullYear()}`
      : `${from.getDate()} ${MONTH_FULL[from.getMonth()]} ${from.getFullYear()}–${toInclusive.getDate()} ${MONTH_FULL[toInclusive.getMonth()]} ${toInclusive.getFullYear()}`;
  return { short, full };
}

// Titik-titik waktu per periode:
// - mingguan: beberapa minggu kalender terakhir (Senin s.d. Minggu, interval 7
//   hari yang konsisten — bukan dibagi berdasar jumlah data), label ringkas
//   "24–30 Agu" buat sumbu-X dan label lengkap "24–30 Agustus 2026" buat tooltip
// - bulanan: 12 bulan tahun berjalan penuh (Januari 31 hari, Februari ikut
//   leap year lewat Date(y, m+1, 0), dst — gak diasumsikan sama), scrollable
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
      const toInclusive = new Date(to.getTime() - 86400000); // Minggu (hari terakhir minggu itu)
      const { short, full } = weekLabels(from, toInclusive);
      points.push({ label: short, labelFull: full, from, to });
    }
  } else if (periode === "bulanan") {
    const y = now.getFullYear();
    for (let m = 0; m < 12; m++) {
      points.push({ label: MONTH_SHORT[m], labelFull: `${MONTH_FULL[m]} ${y}`, from: new Date(y, m, 1), to: new Date(y, m + 1, 1) });
    }
  } else {
    const startYear = 2025;
    const endYear = Math.max(2027, now.getFullYear() + 1);
    for (let y = startYear; y <= endYear; y++) {
      points.push({ label: String(y), labelFull: String(y), from: new Date(y, 0, 1), to: new Date(y + 1, 0, 1) });
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
      labelFull: p.labelFull,
      proposal: proposalsInRange.length,
      nonPo: subsInRange.filter((s) => s.kategori === "NON PO").length,
      po: subsInRange.filter((s) => s.kategori === "PO").length,
      cc: subsInRange.filter((s) => s.kategori === "Cash Card").length,
    };
  });
}

function KategoriBarChart({ submissions, proposals, goto }) {
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

  const [hover, setHover] = useState(null); // { left, top, gi, bi, bar, value, periodLabel }
  const cardRef = useRef(null);

  // Bulanan discroll horizontal: tiap grup (bulan) punya lebar tetap yang
  // nyaman dibaca, sisanya discroll (drag/geser biasa, atau tombol panah).
  const scrollable = periode === "bulanan";
  const H = 210, padL = 34, padR = 16, padT = 14, padB = periode === "mingguan" ? 34 : 26;
  const groupGap = 78;
  const plotW = scrollable ? groupGap * series.length : 760 - padL - padR;
  const W = scrollable ? plotW + padL + padR : 760;
  const innerH = H - padT - padB;
  const scrollBoxRef = useRef(null);
  const scrollByGroup = (dir) => {
    scrollBoxRef.current?.scrollBy({ left: dir * groupGap, behavior: "smooth" });
  };

  const maxVal = Math.max(1, ...series.flatMap((s) => CHART_BARS.map((b) => s[b.field])));
  const niceMax = Math.ceil(maxVal / 4) * 4 || 4;
  const groupWidth = series.length > 0 ? plotW / series.length : 0;
  const barGap = 3;
  const barWidth = Math.max(6, (groupWidth - barGap * (CHART_BARS.length + 1)) / CHART_BARS.length);
  const yFor = (v) => padT + innerH - (v / niceMax) * innerH;
  const groupX = (i) => padL + i * groupWidth;

  const gridVals = [0, niceMax / 2, niceMax];

  // Tooltip diposisikan pakai koordinat layar sungguhan (bukan persentase dari
  // total lebar SVG) — biar tetap akurat pas mode bulanan lagi discroll,
  // karena SVG-nya jauh lebih lebar dari viewport yang keliatan.
  const showTooltip = (e, gi, bi, bar, value, periodLabel) => {
    const cardBox = cardRef.current?.getBoundingClientRect();
    const barBox = e.currentTarget.getBoundingClientRect();
    if (!cardBox) return;
    setHover({
      left: barBox.left + barBox.width / 2 - cardBox.left,
      top: barBox.top - cardBox.top,
      gi, bi, bar, value, periodLabel,
    });
  };

  return (
    <div ref={cardRef} style={{ position: "relative", marginBottom: 20 }}>
    <Card>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h3 style={{ fontFamily: font.display, fontSize: 15, margin: 0, color: T.heading, fontWeight: 700 }}>
            Dokumen Masuk
          </h3>
          <div style={{ display: "flex", gap: 12, marginTop: 7, flexWrap: "wrap" }}>
            {CHART_BARS.map((b) => (
              <div key={b.key} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: T.muted }}>
                <span style={{ width: 7, height: 7, borderRadius: 2, background: b.color, display: "inline-block" }} />
                {b.label}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", gap: 3, background: T.bg, borderRadius: 8, padding: 3 }}>
            {PERIODE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => { setPeriode(opt.key); setHover(null); }}
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
                  transition: "background .2s ease, color .2s ease",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {scrollable && (
            <button
              type="button"
              onClick={() => scrollByGroup(1)}
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
        className="hide-scrollbar"
        style={{
          width: "100%",
          overflowX: scrollable ? "auto" : "hidden",
          transition: "opacity .2s ease",
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

          {series.map((s, gi) => (
            <g key={gi}>
              {CHART_BARS.map((b, bi) => {
                const val = s[b.field];
                const bh = (val / niceMax) * innerH;
                const bx = groupX(gi) + barGap + bi * (barWidth + barGap);
                const by = yFor(val);
                const isHovered = hover?.gi === gi && hover?.bi === bi;
                return (
                  <rect
                    key={b.key}
                    x={bx}
                    y={by}
                    width={barWidth}
                    height={Math.max(0, bh)}
                    rx={2.5}
                    fill={b.color}
                    opacity={isHovered ? 1 : 0.92}
                    style={{ cursor: "pointer", transition: "opacity .15s ease, transform .15s ease" }}
                    transform={isHovered ? "translate(0 -2)" : undefined}
                    onMouseEnter={(e) => showTooltip(e, gi, bi, b, val, s.labelFull)}
                    onMouseMove={(e) => showTooltip(e, gi, bi, b, val, s.labelFull)}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => goto(b.key)}
                  />
                );
              })}
            </g>
          ))}

          {series.map((s, i) => (
            <text key={i} x={groupX(i) + groupWidth / 2} y={H - padB + 16} fontSize={9.5} fill={T.muted} textAnchor="middle">
              {s.label}
            </text>
          ))}
        </svg>
      </div>

      {/* Custom tooltip (bukan title/tooltip bawaan browser) — posisi pakai
          koordinat layar sungguhan dari bar yang di-hover, jadi tetap akurat
          walau mode bulanan lagi discroll. */}
      {hover && (
        <div
          style={{
            position: "absolute",
            left: hover.left,
            top: hover.top,
            transform: "translate(-50%, calc(-100% - 8px))",
            background: T.heading,
            color: T.card,
            borderRadius: 8,
            padding: "8px 11px",
            fontSize: 11.5,
            lineHeight: 1.5,
            pointerEvents: "none",
            boxShadow: T.shadowMd,
            whiteSpace: "nowrap",
            zIndex: 5,
            transition: "opacity .15s ease",
          }}
        >
          <div style={{ fontWeight: 700 }}>{hover.bar.label}</div>
          <div>{hover.value} dokumen</div>
          <div style={{ color: T.muted, fontSize: 10.5, marginTop: 2 }}>{hover.periodLabel}</div>
        </div>
      )}
    </Card>
    </div>
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
      <KategoriBarChart submissions={data.nonpoSubmissions} proposals={data.proposals} goto={goto} />

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
