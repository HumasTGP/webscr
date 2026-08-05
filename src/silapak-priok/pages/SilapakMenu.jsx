import { T } from "../../lib/theme";
import { DutyBanner } from "./DutyPicker";

export default function SilapakMenu({ duty, onOpenDuty, paket, tamu }) {
  const belumDiambil = paket.filter((p) => p.status === "Belum Diambil").length;
  const tamuHariIni = tamu.filter((t) => t.tanggalKey === new Date().toDateString()).length;

  const paketMasukPerBulan = groupByBulan(paket, (p) => p.diterimaTanggal);
  const paketKeluarPerBulan = groupByBulan(paket.filter((p) => p.status === "Sudah Diambil"), (p) => p.diterimaTanggal);
  const tamuPerBulan = groupByBulan(tamu, (t) => t.tanggal, true);

  return (
    <div>
      <DutyBanner duty={duty} onOpen={onOpenDuty} />

      <h2 style={{ fontSize: 17, fontWeight: 700, color: T.heading, margin: "0 0 4px" }}>Dashboard</h2>
      <p style={{ fontSize: 12, color: T.muted, margin: "0 0 18px" }}>Ringkasan aktivitas Si Lapak Priok</p>

      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <Kpi n={belumDiambil} l="Paket belum diambil" />
        <Kpi n={tamuHariIni} l="Tamu hari ini" />
        <Kpi n={paket.length} l="Total paket tercatat" />
        <Kpi n={tamu.length} l="Total kunjungan tamu" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        <ChartPanel title="Paket masuk per bulan" data={paketMasukPerBulan} color={T.blue} />
        <ChartPanel title="Paket keluar per bulan" data={paketKeluarPerBulan} color="#1D9E75" />
        <ChartPanel title="Kunjungan tamu per bulan" data={tamuPerBulan} color="#7C4FD1" />
      </div>
    </div>
  );
}

function Kpi({ n, l }) {
  return (
    <div style={{ flex: "1 1 150px", background: T.bg, borderRadius: 10, padding: "14px 16px" }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: T.navy }}>{n}</div>
      <div style={{ fontSize: 10.5, color: T.muted, marginTop: 2 }}>{l}</div>
    </div>
  );
}

function ChartPanel({ title, data, color }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div style={{ background: T.bg, borderRadius: 10, padding: 16 }}>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: T.heading, marginBottom: 12 }}>{title}</div>
      {data.length === 0 ? (
        <div style={{ fontSize: 11.5, color: T.muted }}>Belum ada data.</div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 80 }}>
            {data.map((d) => (
              <div key={d.label} style={{ flex: 1, height: `${(d.count / max) * 100}%`, minHeight: 4, background: color, borderRadius: "4px 4px 0 0" }} title={`${d.label}: ${d.count}`} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            {data.map((d) => (
              <span key={d.label} style={{ flex: 1, textAlign: "center", fontSize: 9, color: T.muted }}>{d.label}</span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function groupByBulan(list, getDate, isISO) {
  const map = {};
  list.forEach((item) => {
    const raw = getDate(item);
    let key;
    if (isISO) {
      const d = new Date(raw);
      key = Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
    } else {
      key = raw?.split(" ").slice(-2).join(" ") || "-";
    }
    map[key] = (map[key] || 0) + 1;
  });
  return Object.entries(map).map(([label, count]) => ({ label, count }));
}
