import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock, FolderCheck, Inbox as InboxIcon, ThumbsDown } from "lucide-react";
import { T, font } from "../../../lib/theme";
import { DOC_STATUS, STATUS_META } from "../../../lib/data";
import PageHeader from "../../../components/PageHeader";
import { DashboardMetricCard, DashboardRecentList, DashboardTrendCard } from "../../../components/DashboardVisuals";

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const timer=setInterval(()=>setNow(new Date()),1000); return()=>clearInterval(timer); },[]);
  return <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"5px 11px",borderRadius:9,background:T.blueSoft,border:`1px solid ${T.border}`,fontSize:12,color:T.blue,fontWeight:700,fontFamily:font.mono}}><Clock size={13}/>{now.toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"})} · {now.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false})} WIB</div>;
}

export default function MADMDashboard({ packages, evaluasiList = [], goto }) {
  const counts = useMemo(()=>{ const c={approved:0,rejected:0,processed:0,total:0}; for(const p of packages){c.total++; if(p.status===DOC_STATUS.APPROVED)c.approved++; else if(p.status===DOC_STATUS.REJECTED)c.rejected++; else if(p.status===DOC_STATUS.PROCESSED)c.processed++;} return c; },[packages]);
  const pending = useMemo(()=>packages.filter((p)=>p.status===DOC_STATUS.APPROVED).sort((a,b)=>(b.reviewedAt||"").localeCompare(a.reviewedAt||"")).slice(0,6),[packages]);
  const evalApproved=evaluasiList.filter((e)=>e.status===DOC_STATUS.APPROVED).length;
  const trend=[{label:"Menunggu",value:counts.approved},{label:"Diproses",value:counts.processed},{label:"Ditolak",value:counts.rejected},{label:"Evaluasi",value:evalApproved}];

  return <div>
    <PageHeader eyebrow="Panel MADM" title="Dashboard MADM" description="Paket kas yang telah disetujui Asman dan menunggu diproses oleh MADM." right={<LiveClock/>}/>
    <div className="responsive-card-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:12,marginBottom:16}}>
      <DashboardMetricCard icon={InboxIcon} label="Menunggu Diproses" value={counts.approved} note="Sudah disetujui Asman" color={STATUS_META.approved.color} soft={STATUS_META.approved.bg} onClick={()=>goto("inbox")}/>
      <DashboardMetricCard icon={CheckCircle2} label="Telah Diproses" value={counts.processed} note="Proses akhir selesai" color={STATUS_META.processed.color} soft={STATUS_META.processed.bg} onClick={()=>goto("inbox")}/>
      <DashboardMetricCard icon={ThumbsDown} label="Ditolak" value={counts.rejected} note="Perlu tindak lanjut" color={STATUS_META.rejected.color} soft={STATUS_META.rejected.bg} onClick={()=>goto("inbox")}/>
      <DashboardMetricCard icon={FolderCheck} label="Total Paket" value={counts.total} note="Seluruh paket tercatat" color="#036D9A" soft="#E5F4FA" onClick={()=>goto("inbox")}/>
    </div>
    <div className="dashboard-main-grid" style={{display:"grid",gridTemplateColumns:"minmax(0,1.4fr) minmax(300px,.8fr)",gap:16,alignItems:"start"}}>
      <DashboardTrendCard title="Distribusi Proses MADM" subtitle="Status dokumen dan evaluasi yang berada pada tahap MADM" data={trend} color="#036D9A" />
      <DashboardRecentList title="Menunggu Diproses" items={pending} emptyLabel="Tidak ada paket yang menunggu diproses." renderItem={(r)=><div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}><div style={{width:34,height:34,borderRadius:10,background:STATUS_META.approved.bg,color:STATUS_META.approved.color,display:"grid",placeItems:"center",fontSize:10,fontWeight:800,flexShrink:0}}>{String(r.kategori||"RAB").slice(0,2).toUpperCase()}</div><div style={{flex:1,minWidth:0}}><div style={{fontSize:12.5,fontWeight:800,color:T.heading,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.judul||r.idRab}</div><div style={{fontSize:10.5,color:T.muted,marginTop:2}}>{r.idRab} · {r.kategori||"-"}</div></div></div>} />
    </div>
  </div>;
}
