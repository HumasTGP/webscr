import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock, FileText, Paperclip, Plus, Send, XCircle } from "lucide-react";
import { T, font } from "../../lib/theme";
import { MITRA_STATUS } from "../../lib/data";
import { uid, rupiah } from "../../lib/utils";
import PageHeader from "../../components/PageHeader";
import Modal from "../../components/Modal";
import { DashboardMetricCard, DashboardRecentList, DashboardTrendCard } from "../../components/DashboardVisuals";

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t=setInterval(()=>setNow(new Date()),1000); return()=>clearInterval(t); },[]);
  return <div style={{textAlign:"right"}}><div style={{fontSize:11.5,color:T.muted}}>{now.toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div><div style={{fontSize:17,fontWeight:800,color:T.heading,marginTop:2}}>{now.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit",second:"2-digit"})} <span style={{fontSize:10.5,fontWeight:600,color:T.muted}}>WIB</span></div></div>;
}

function simpleStatus(status) {
  if (status?.startsWith("ditolak")) return { label:"Ditolak", color:"#B01818", bg:"#FCE1E1" };
  if (status === "disetujui") return { label:"Diterima", color:"#1E7F3E", bg:"#DEF6E5" };
  return { label:"Menunggu Proses", color:"#8A6D00", bg:"#FFF4D0" };
}

function Badge({ status }) {
  const meta=simpleStatus(status);
  return <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 9px",borderRadius:999,background:meta.bg,color:meta.color,fontSize:11,fontWeight:800,whiteSpace:"nowrap"}}><span style={{width:5,height:5,borderRadius:"50%",background:meta.color}}/>{meta.label}</span>;
}

const MAX_FILE_MB=10;
function PengajuanForm({ user, onSubmit, onClose }) {
  const lockedOrg=!user?.isAdmin&&!!user?.organization;
  const [form,setForm]=useState({namaLembaga:user?.organization||"",alamatLembaga:"",namaPIC:"",teleponPIC:"",emailPIC:user?.email||"",judulPengajuan:"",nilaiDiajukan:"",catatan:""});
  const [file,setFile]=useState(null); const [fileError,setFileError]=useState("");
  const set=(k,v)=>setForm((p)=>({...p,[k]:v}));
  const input={width:"100%",padding:"10px 12px",borderRadius:8,border:`1px solid ${T.border}`,background:T.inputBg,color:T.text,boxSizing:"border-box",fontSize:13};
  const label={display:"block",fontSize:11.5,fontWeight:700,color:T.heading,marginBottom:5};
  const onFileChange=(e)=>{const f=e.target.files?.[0];if(!f)return;if(f.size>MAX_FILE_MB*1024*1024){setFileError(`Ukuran file maksimal ${MAX_FILE_MB}MB.`);setFile(null);return;}setFileError("");setFile(f);};
  const handleSubmit=(e)=>{e.preventDefault();if(!form.namaLembaga||!form.judulPengajuan)return;onSubmit({...form,nilaiDiajukan:Number(form.nilaiDiajukan)||0,proposalFile:file?{fileName:file.name,fileSize:file.size,url:URL.createObjectURL(file)}:null});};
  return <form onSubmit={handleSubmit}><div style={{display:"grid",gap:13}}><div><label style={label}>Nama Perusahaan / Lembaga</label><input style={{...input,background:lockedOrg?T.bg:T.inputBg}} value={form.namaLembaga} onChange={(e)=>set("namaLembaga",e.target.value)} readOnly={lockedOrg} required/></div><div><label style={label}>Alamat Perusahaan / Lembaga</label><textarea style={{...input,minHeight:60,resize:"vertical"}} value={form.alamatLembaga} onChange={(e)=>set("alamatLembaga",e.target.value)}/></div><div className="responsive-form-grid" style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:12}}><div><label style={label}>Nama PIC</label><input style={input} value={form.namaPIC} onChange={(e)=>set("namaPIC",e.target.value)}/></div><div><label style={label}>Nomor Telepon PIC</label><input style={input} value={form.teleponPIC} onChange={(e)=>set("teleponPIC",e.target.value)}/></div></div><div><label style={label}>Email PIC</label><input style={input} type="email" value={form.emailPIC} onChange={(e)=>set("emailPIC",e.target.value)}/></div><div><label style={label}>Judul Pengajuan</label><input style={input} value={form.judulPengajuan} onChange={(e)=>set("judulPengajuan",e.target.value)} required/></div><div><label style={label}>Nilai Diajukan (Rp)</label><input style={input} type="number" value={form.nilaiDiajukan} onChange={(e)=>set("nilaiDiajukan",e.target.value)}/></div><div><label style={label}>Catatan</label><textarea style={{...input,minHeight:80,resize:"vertical"}} value={form.catatan} onChange={(e)=>set("catatan",e.target.value)}/></div><div><label style={label}>Upload Proposal (maks. {MAX_FILE_MB}MB)</label><label style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",borderRadius:8,border:`1.5px dashed ${T.border}`,background:T.bg,cursor:"pointer",fontSize:12.5,color:T.muted}}><Paperclip size={15}/>{file?file.name:"Klik untuk pilih file proposal…"}<input type="file" onChange={onFileChange} style={{display:"none"}}/></label>{fileError&&<div style={{fontSize:11.5,color:"#B01818",marginTop:4}}>{fileError}</div>}</div></div><div className="responsive-actions" style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:18}}><button type="button" onClick={onClose} style={secondary}>Batal</button><button type="submit" style={primary}><Send size={14}/>Kirim Pengajuan</button></div></form>;
}

export default function GandengDashboard({ mitraList, user, setMitraList, notify, onGoto }) {
  const [showForm,setShowForm]=useState(false);
  const total=mitraList.length;
  const diproses=mitraList.filter((m)=>!m.status?.startsWith("ditolak")&&m.status!=="disetujui").length;
  const disetujui=mitraList.filter((m)=>m.status==="disetujui").length;
  const ditolak=mitraList.filter((m)=>m.status?.startsWith("ditolak")).length;
  const recent=useMemo(()=>[...mitraList].sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0)).slice(0,6),[mitraList]);
  const trend=[{label:"Total",value:total},{label:"Diproses",value:diproses},{label:"Disetujui",value:disetujui},{label:"Ditolak",value:ditolak}];
  const handleSubmit=(data)=>{const now=new Date().toISOString();const newItem={id:uid("MTR"),...data,ownerAccountId:user?.id||"",ownerEmail:user?.email||"",status:MITRA_STATUS.MENUNGGU_HUMAS,createdAt:now,timeline:[{status:MITRA_STATUS.MENUNGGU_HUMAS,tanggal:now,oleh:data.namaLembaga||"Pengaju",catatan:"Pengajuan diterima melalui GANDENG"}]};setMitraList?.((prev)=>[...prev,newItem]);setShowForm(false);notify?.("Pengajuan proposal berhasil dikirim.","success","Pengajuan Baru");};

  return <div style={{fontFamily:font.body,padding:"clamp(18px,3vw,28px) clamp(16px,4vw,32px)",maxWidth:1100,width:"100%",boxSizing:"border-box"}}>
    <PageHeader title="Dashboard" description={`Selamat datang, ${user?.organization||user?.name||"Pengguna"}. Ajukan proposal dan pantau status proposal anda di website ini.`} right={<LiveClock/>}/>
    <div className="responsive-card-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:12,marginBottom:16}}>
      <DashboardMetricCard icon={FileText} label="Total Pengajuan" value={total} note="Seluruh pengajuan akun" color="#CF0000" soft="#FDEAEA"/>
      <DashboardMetricCard icon={Clock} label="Sedang Diproses" value={diproses} note="Menunggu tindak lanjut" color="#8A6D00" soft="#FFF4D0"/>
      <DashboardMetricCard icon={CheckCircle2} label="Disetujui" value={disetujui} note="Pengajuan diterima" color="#1E7F3E" soft="#DEF6E5"/>
      <DashboardMetricCard icon={XCircle} label="Ditolak" value={ditolak} note="Pengajuan ditolak" color="#B01818" soft="#FCE1E1"/>
    </div>
    <div className="dashboard-main-grid" style={{display:"grid",gridTemplateColumns:"minmax(0,1.4fr) minmax(300px,.8fr)",gap:16,alignItems:"start"}}>
      <DashboardTrendCard title="Status Pengajuan" subtitle="Ringkasan pengajuan pada akun GANDENG ini" data={trend} color="#CF0000" />
      <DashboardRecentList title="Pengajuan Terbaru" items={recent} emptyLabel="Belum ada pengajuan pada akun ini." renderItem={(m)=><div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}><div style={{width:34,height:34,borderRadius:10,background:"#FDEAEA",color:"#CF0000",display:"grid",placeItems:"center",fontSize:10,fontWeight:800,flexShrink:0}}>PJ</div><div style={{flex:1,minWidth:0}}><div style={{fontSize:12.5,fontWeight:800,color:T.heading,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.judulPengajuan}</div><div style={{fontSize:10.5,color:T.muted,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.namaLembaga} · {m.nilaiDiajukan?rupiah(m.nilaiDiajukan):"-"}</div></div><Badge status={m.status}/></div>} />
    </div>
    <div className="responsive-actions" style={{display:"flex",gap:12,marginTop:18,flexWrap:"wrap"}}><button onClick={()=>setShowForm(true)} style={primary}><Plus size={14}/>Buat Pengajuan Baru</button><button onClick={()=>onGoto("tracking")} style={secondary}>Tracking Status Proposal</button></div>
    {showForm&&<Modal open onClose={()=>setShowForm(false)} title="Buat Pengajuan Proposal Baru" icon={Plus} width={560}><PengajuanForm user={user} onSubmit={handleSubmit} onClose={()=>setShowForm(false)}/></Modal>}
  </div>;
}

const primary={display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,minHeight:40,padding:"0 18px",borderRadius:8,border:0,background:"var(--blue)",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:800};
const secondary={display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,minHeight:40,padding:"0 18px",borderRadius:8,border:"1px solid var(--border)",background:"var(--card)",color:"var(--text)",cursor:"pointer",fontSize:13,fontWeight:700};
