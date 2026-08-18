import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock, Inbox as InboxIcon, ThumbsDown, ThumbsUp } from "lucide-react";
import { T, font } from "../../../lib/theme";
import { DOC_STATUS, STATUS_META } from "../../../lib/data";
import PageHeader from "../../../components/PageHeader";
import { DashboardMetricCard, DashboardRecentList, DashboardTrendCard } from "../../../components/DashboardVisuals";

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const timer=setInterval(()=>setNow(new Date()),1000); return()=>clearInterval(timer); },[]);
  return <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"5px 11px",borderRadius:9,background:T.blueSoft,border:`1px solid ${T.border}`,fontSize:12,color:T.blue,fontWeight:700,fontFamily:font.mono}}><Clock size={13}/>{now.toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"})} · {now.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false})} WIB</div>;
}

export default function AsmanDashboard({ user, packages, evaluasiList = [], goto }) {
  const counts = useMemo(()=>{ const c={submitted:0,approved:0,rejected:0,processed:0}; for(const p of packages){ if(p.status===DOC_STATUS.SUBMITTED||p.status===DOC_STATUS.IN_REVIEW)c.submitted++; else if(p.status===DOC_STATUS.APPROVED)c.approved++; else if(p.status===DOC_STATUS.REJECTED)c.rejected++; else if(p.status===DOC_STATUS.PROCESSED)c.processed++; } return c; },[packages]);
  const recent = useMemo(()=>[...packages].sort((a,b)=>(b.processedAt||b.reviewedAt||b.submittedAt||"").localeCompare(a.processedAt||a.reviewedAt||a.submittedAt||"")).slice(0,6),[packages]);
  const isAsman=user.role==="asman";
  const roleLabel=isAsman?"ASMAN":"MADM";
  const labels=isAsman?["Menunggu Review","Disetujui","Ditolak","Diproses MADM"]:["Menunggu Persetujuan","Siap Diproses","Ditolak","Selesai"];
  const trend=[{label:"Menunggu",value:counts.submitted},{label:"Disetujui",value:counts.approved},{label:"Ditolak",value:counts.rejected},{label:"Selesai",value:counts.processed}];

  return <div>
    <PageHeader eyebrow={`Panel ${roleLabel}`} title={`Dashboard ${roleLabel}`} description={isAsman?"Ringkasan dokumen yang menjadi tanggung jawab ASMAN untuk diperiksa sebelum diteruskan ke MADM.":"Ringkasan dokumen yang telah melalui pemeriksaan ASMAN dan menunggu keputusan atau proses MADM."} right={<LiveClock/>}/>
    <div className="responsive-card-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:12,marginBottom:16}}>
      <DashboardMetricCard icon={InboxIcon} label={labels[0]} value={counts.submitted} note="Dokumen aktif" color={STATUS_META.submitted.color} soft={STATUS_META.submitted.bg} onClick={()=>goto("inbox")}/>
      <DashboardMetricCard icon={ThumbsUp} label={labels[1]} value={counts.approved} note="Siap tahap berikut" color={STATUS_META.approved.color} soft={STATUS_META.approved.bg} onClick={()=>goto("inbox")}/>
      <DashboardMetricCard icon={ThumbsDown} label={labels[2]} value={counts.rejected} note="Perlu tindak lanjut" color={STATUS_META.rejected.color} soft={STATUS_META.rejected.bg} onClick={()=>goto("inbox")}/>
      <DashboardMetricCard icon={CheckCircle2} label={labels[3]} value={counts.processed} note="Proses selesai" color={STATUS_META.processed.color} soft={STATUS_META.processed.bg} onClick={()=>goto("inbox")}/>
    </div>
    <div className="dashboard-main-grid" style={{display:"grid",gridTemplateColumns:"minmax(0,1.4fr) minmax(300px,.8fr)",gap:16,alignItems:"start"}}>
      <DashboardTrendCard title="Distribusi Status Dokumen" subtitle="Ringkasan paket kas dan dokumen RAB" data={trend} color="#036D9A" />
      <DashboardRecentList title="Aktivitas Dokumen Terbaru" items={recent} emptyLabel="Belum ada aktivitas." renderItem={(r)=>{const m=STATUS_META[r.status]||STATUS_META.draft;return <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}><div style={{width:34,height:34,borderRadius:10,background:m.bg,color:m.color,display:"grid",placeItems:"center",fontWeight:800,fontSize:10,flexShrink:0}}>{String(r.kategori||"RAB").slice(0,2).toUpperCase()}</div><div style={{flex:1,minWidth:0}}><div style={{fontSize:12.5,fontWeight:800,color:T.heading,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.judul||r.idRab}</div><div style={{fontSize:10.5,color:T.muted,marginTop:2}}>{r.idRab} · {r.kategori||"-"}</div></div><span style={{padding:"4px 8px",borderRadius:999,background:m.bg,color:m.color,fontSize:10.5,fontWeight:800,whiteSpace:"nowrap"}}>{m.label}</span></div>;}}/>
    </div>
  </div>;
}
