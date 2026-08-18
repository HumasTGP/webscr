import { useEffect, useMemo, useState } from "react";
import { Boxes, PackageCheck, UserRoundCheck, Users } from "lucide-react";
import { T, font } from "../../lib/theme";
import PageHeader from "../../components/PageHeader";
import { DutyBanner } from "./DutyPicker";
import { DashboardMetricCard, DashboardRecentList, DashboardTrendCard } from "../../components/DashboardVisuals";

function formatClock(date) {
  return {
    tanggal: date.toLocaleDateString("id-ID", { weekday:"long", day:"2-digit", month:"long", year:"numeric" }),
    waktu: `${date.toLocaleTimeString("id-ID", { hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:false })} WIB`,
  };
}

export default function SiLapakMenu({ duty, onOpenDuty, paket, tamu }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const timer=window.setInterval(()=>setNow(new Date()),1000); return()=>window.clearInterval(timer); },[]);

  const belumDiambil = paket.filter((p) => p.status === "Belum Diambil").length;
  const tamuHariIni = tamu.filter((t) => t.tanggalKey === new Date().toDateString()).length;
  const paketMasukPerBulan = groupByBulan(paket, (p) => p.diterimaTanggal);
  const clock = formatClock(now);
  const recent = useMemo(() => {
    const p = paket.slice(-4).reverse().map((x,i)=>({id:`p-${x.id||i}`,kind:"Paket",title:x.namaPenerima||x.nama||"Paket masuk",subtitle:`${x.status||"-"} · ${x.diterimaTanggal||"-"}`}));
    const t = tamu.slice(-4).reverse().map((x,i)=>({id:`t-${x.id||i}`,kind:"Tamu",title:x.nama||x.namaTamu||"Kunjungan tamu",subtitle:`${x.instansi||x.keperluan||"-"} · ${x.tanggal||"-"}`}));
    return [...p,...t].slice(0,6);
  },[paket,tamu]);

  return <div>
    <PageHeader title="Dashboard" description="Ringkasan aktivitas paket, kunjungan tamu, dan petugas yang sedang berjaga." meta={[{label:"Tanggal",value:clock.tanggal},{label:"Waktu",value:clock.waktu}]}/>
    <DutyBanner duty={duty} onOpen={onOpenDuty}/>

    <div className="responsive-card-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:12,margin:"18px 0 16px"}}>
      <DashboardMetricCard icon={Boxes} label="Paket Belum Diambil" value={belumDiambil} note="Menunggu pengambilan" color="#8C7600" soft="#FFF7C2"/>
      <DashboardMetricCard icon={UserRoundCheck} label="Tamu Hari Ini" value={tamuHariIni} note="Kunjungan hari ini" color="#8C7600" soft="#FFF7C2"/>
      <DashboardMetricCard icon={PackageCheck} label="Total Paket" value={paket.length} note="Seluruh paket tercatat" color="#8C7600" soft="#FFF7C2"/>
      <DashboardMetricCard icon={Users} label="Total Kunjungan" value={tamu.length} note="Seluruh kunjungan tamu" color="#8C7600" soft="#FFF7C2"/>
    </div>

    <div className="dashboard-main-grid" style={{display:"grid",gridTemplateColumns:"minmax(0,1.45fr) minmax(300px,.8fr)",gap:16,alignItems:"start"}}>
      <DashboardTrendCard title="Paket Masuk per Bulan" subtitle="Tren jumlah paket yang diterima" data={paketMasukPerBulan.map((d)=>({label:d.label,value:d.count}))} color="#B79A00" emptyLabel="Belum ada data paket."/>
      <DashboardRecentList title="Aktivitas Terbaru" items={recent} emptyLabel="Belum ada aktivitas paket atau tamu." renderItem={(item)=><div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}><div style={{width:34,height:34,borderRadius:10,background:"#FFF7C2",color:"#8C7600",display:"grid",placeItems:"center",fontSize:10,fontWeight:800,flexShrink:0}}>{item.kind.slice(0,2).toUpperCase()}</div><div style={{flex:1,minWidth:0}}><div style={{fontSize:12.5,fontWeight:800,color:T.heading,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.title}</div><div style={{fontSize:10.5,color:T.muted,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.subtitle}</div></div></div>}/>
    </div>
  </div>;
}

function groupByBulan(list, getDate) {
  const map = {};
  list.forEach((item) => {
    const raw = getDate(item);
    const key = raw?.split(" ").slice(-2).join(" ") || "-";
    map[key] = (map[key] || 0) + 1;
  });
  return Object.entries(map).map(([label,count]) => ({ label,count }));
}
