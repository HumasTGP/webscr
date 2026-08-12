import { BarChart3, Boxes, PackageCheck, UserRoundCheck, Users } from "lucide-react";
import { T, font } from "../../lib/theme";
import Card from "../../components/Card";
import PageHeader from "../../components/PageHeader";
import { DutyBanner } from "./DutyPicker";

export default function SiLapakMenu({ duty, onOpenDuty, paket, tamu }) {
  const belumDiambil = paket.filter((p) => p.status === "Belum Diambil").length;
  const tamuHariIni = tamu.filter((t) => t.tanggalKey === new Date().toDateString()).length;
  const paketMasukPerBulan = groupByBulan(paket, (p) => p.diterimaTanggal);
  const paketKeluarPerBulan = groupByBulan(paket.filter((p) => p.status === "Sudah Diambil"), (p) => p.diterimaTanggal);
  const tamuPerBulan = groupByBulan(tamu, (t) => t.tanggal, true);

  const stats = [
    { icon: Boxes, label: "Paket Belum Diambil", value: belumDiambil, note: "Menunggu proses pengambilan" },
    { icon: UserRoundCheck, label: "Tamu Hari Ini", value: tamuHariIni, note: "Kunjungan tercatat hari ini" },
    { icon: PackageCheck, label: "Total Paket", value: paket.length, note: "Seluruh paket yang tercatat" },
    { icon: Users, label: "Total Kunjungan", value: tamu.length, note: "Seluruh kunjungan tamu" },
  ];

  return <div>
    <PageHeader title="Dashboard" description="Ringkasan aktivitas paket, kunjungan tamu, dan petugas yang sedang berjaga." />
    <DutyBanner duty={duty} onOpen={onOpenDuty} />

    <div className="responsive-card-grid silapak-kpi-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,minmax(0,1fr))", gap:12, margin:"18px 0" }}>
      {stats.map(({ icon:Icon, label, value, note }) => <Card key={label} style={{ padding:"16px 17px", minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:10.5, color:T.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:.5, lineHeight:1.4 }}>{label}</div>
            <div style={{ marginTop:7, fontFamily:font.display, fontSize:26, fontWeight:800, color:"#8C7600", lineHeight:1 }}>{value}</div>
          </div>
          <div style={{ width:36, height:36, borderRadius:10, background:"#FFF7C2", color:"#8C7600", display:"grid", placeItems:"center", flexShrink:0 }}><Icon size={17}/></div>
        </div>
        <div style={{ marginTop:10, fontSize:10.5, color:T.muted, lineHeight:1.45 }}>{note}</div>
      </Card>)}
    </div>

    <div style={{ display:"flex", alignItems:"center", gap:8, margin:"8px 0 12px" }}><BarChart3 size={16} color="#8C7600"/><h3 style={{ margin:0, fontFamily:font.display, fontSize:14, color:T.heading }}>Aktivitas Bulanan</h3></div>
    <div className="silapak-chart-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,minmax(0,1fr))", gap:14 }}>
      <ChartPanel title="Paket Masuk" subtitle="Jumlah paket yang diterima" data={paketMasukPerBulan} color="#B79A00" />
      <ChartPanel title="Paket Keluar" subtitle="Paket yang sudah diambil" data={paketKeluarPerBulan} color="#1D9E75" />
      <ChartPanel title="Kunjungan Tamu" subtitle="Jumlah tamu yang tercatat" data={tamuPerBulan} color="#7C4FD1" />
    </div>
  </div>;
}

function ChartPanel({ title, subtitle, data, color }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return <Card style={{ padding:"16px 17px", minHeight:190, minWidth:0 }}>
    <div style={{ fontFamily:font.display, fontSize:12.5, fontWeight:800, color:T.heading }}>{title}</div>
    <div style={{ marginTop:3, fontSize:10.5, color:T.muted }}>{subtitle}</div>
    {data.length === 0 ? <div style={{ height:112, display:"grid", placeItems:"center", color:T.muted, fontSize:11.5 }}>Belum ada data.</div> : <>
      <div style={{ display:"flex", gap:8, alignItems:"flex-end", height:90, marginTop:14, padding:"0 4px", borderBottom:`1px solid ${T.border}` }}>
        {data.map((d) => <div key={d.label} style={{ flex:1, height:`${Math.max(8,(d.count/max)*100)}%`, background:color, borderRadius:"5px 5px 0 0", minWidth:8 }} title={`${d.label}: ${d.count}`}/>) }
      </div>
      <div style={{ display:"flex", gap:8, marginTop:7, padding:"0 4px" }}>{data.map((d)=><span key={d.label} style={{ flex:1, textAlign:"center", fontSize:9, color:T.muted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.label}</span>)}</div>
    </>}
  </Card>;
}

function groupByBulan(list, getDate, isISO) {
  const map = {};
  list.forEach((item) => {
    const raw = getDate(item);
    let key;
    if (isISO) {
      const d = new Date(raw);
      key = Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString("id-ID", { month:"short", year:"2-digit" });
    } else key = raw?.split(" ").slice(-2).join(" ") || "-";
    map[key] = (map[key] || 0) + 1;
  });
  return Object.entries(map).map(([label,count]) => ({ label,count }));
}
