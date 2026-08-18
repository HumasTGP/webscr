import { useEffect, useMemo, useState } from "react";
import { Clock, FileSpreadsheet, Handshake, Megaphone } from "lucide-react";
import { T, font } from "../../lib/theme";
import { roleLabel, rupiah } from "../../lib/utils";
import { StatusBadge } from "../../components/Badge";
import { DashboardMetricCard, DashboardRecentList, DashboardTrendCard } from "../../components/DashboardVisuals";

function greetingFor(hour) {
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const dateStr = now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  return <div style={{ display:"inline-flex",alignItems:"center",gap:6,padding:"5px 11px",borderRadius:9,background:T.blueSoft,border:`1px solid ${T.border}`,fontSize:12,color:T.blue,fontWeight:700,fontFamily:font.mono }}><Clock size={13}/>{dateStr} · {timeStr} WIB</div>;
}

export default function Dashboard({ data, goto, user }) {
  const now = new Date();
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

  const recent = useMemo(() => {
    const items = [
      ...data.proposals.map((p) => ({ id:`p-${p.id}`, type:"Proposal", title:p.judulProposal || "(tanpa judul)", subtitle:`${p.namaLembaga || "-"}${p.nilaiDiajukan ? ` · ${rupiah(p.nilaiDiajukan)}` : ""}`, status:p.statusProposal })),
      ...data.konten.map((k) => ({ id:`k-${k.id}`, type:"Publikasi", title:k.judul || "(tanpa judul)", subtitle:`${k.kategori || "-"} · ${k.tanggal || "belum dijadwal"}`, status:k.status })),
      ...data.rab.map((r) => ({ id:`r-${r.idNumber}`, type:"RAB", title:r.judulKegiatan || r.idNumber, subtitle:r.idNumber, status:"RAB" })),
    ];
    return items.slice(0, 6);
  }, [data]);

  const trendData = [
    { label:"Proposal", value:data.proposals.length },
    { label:"RAB", value:data.rab.length },
    { label:"Dokumen", value:data.bast.length + data.tor.length + data.pakta.length },
    { label:"Laporan", value:data.laporan.length },
  ];

  return <div>
    <div style={{ marginBottom:18,paddingBottom:16,borderBottom:`1px solid ${T.border}` }}>
      <h1 style={{ margin:0,fontFamily:font.display,fontSize:"clamp(22px,3vw,28px)",color:T.heading,lineHeight:1.2 }}>{greetingFor(now.getHours())}{user?.role ? `, ${roleLabel(user.role)}` : ""}.</h1>
      <div style={{ marginTop:8 }}><LiveClock/></div>
    </div>

    <div className="responsive-card-grid" style={{ display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:12,marginBottom:16 }}>
      <DashboardMetricCard icon={Handshake} label="Proposal" value={proposalCounts.total} note={`${proposalCounts.baru} baru · ${proposalCounts.disetujui} disetujui`} color="#036D9A" soft="#E5F4FA" onClick={()=>goto("proposal-rekap")}/>
      <DashboardMetricCard icon={Megaphone} label="Publikasi" value={kontenCounts.total} note={`${kontenCounts.terbit} terbit · ${kontenCounts.draft} antrean`} color="#B88700" soft="#FFF4D6" onClick={()=>goto("konten")}/>
      <DashboardMetricCard icon={FileSpreadsheet} label="RAB" value={data.rab.length} note="RAB diajukan" color="#036D9A" soft="#E5F4FA" onClick={()=>goto("rab")}/>
    </div>

    <div className="dashboard-main-grid" style={{ display:"grid",gridTemplateColumns:"minmax(0,1.45fr) minmax(300px,.8fr)",gap:16,alignItems:"start" }}>
      <DashboardTrendCard title="Progres Dokumen" subtitle="Ringkasan jumlah data pada setiap tahapan utama SAKTI" data={trendData} color="#036D9A" />
      <DashboardRecentList title="Aktivitas Terbaru" items={recent} emptyLabel="Belum ada aktivitas." renderItem={(item)=><div style={{ display:"flex",alignItems:"center",gap:10,minWidth:0 }}><div style={{ width:34,height:34,borderRadius:10,background:item.type==="Publikasi"?"#FFF4D6":"#E5F4FA",color:item.type==="Publikasi"?"#B88700":"#036D9A",display:"grid",placeItems:"center",fontSize:10,fontWeight:800,flexShrink:0 }}>{item.type.slice(0,2).toUpperCase()}</div><div style={{ flex:1,minWidth:0 }}><div style={{ fontSize:12.5,fontWeight:800,color:T.heading,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{item.title}</div><div style={{ marginTop:2,fontSize:10.5,color:T.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{item.subtitle}</div></div><StatusBadge value={item.status}/></div>} />
    </div>
  </div>;
}
