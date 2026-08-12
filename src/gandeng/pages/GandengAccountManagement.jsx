import { useEffect, useMemo, useState } from "react";
import { Building2, CheckCircle2, Search, SearchX, Shield, ShieldCheck, Trash2, UserRoundCheck, UserRoundX, XCircle } from "lucide-react";
import { T, font } from "../../lib/theme";
import Card from "../../components/Card";
import { loadGandengAccounts, replaceGandengAccounts } from "../lib/accounts";

export default function GandengAccountManagement({ notify }) {
  const [accounts, setAccounts] = useState(() => loadGandengAccounts());
  const [query, setQuery] = useState("");
  useEffect(() => replaceGandengAccounts(accounts), [accounts]);

  const companyAccounts = useMemo(() => accounts.filter((a) => !a.isAdmin), [accounts]);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return companyAccounts.filter((a) => !q || [a.organization, a.username, a.email].some((v) => String(v || "").toLowerCase().includes(q)));
  }, [companyAccounts, query]);
  const activeCount = companyAccounts.filter((a) => a.active !== false).length;
  const inactiveCount = companyAccounts.length - activeCount;

  const toggle = (id) => setAccounts((prev) => prev.map((a) => a.id === id ? { ...a, active: a.active === false } : a));
  const remove = (id) => { setAccounts((prev) => prev.filter((a) => a.id !== id)); notify?.("Akun GANDENG dihapus.", "success"); };

  return <div className="system-body" style={{maxWidth:1180}}>
    <section className="gandeng-admin-hero" style={{position:"relative",overflow:"hidden",borderRadius:18,padding:"24px clamp(20px,3vw,30px)",marginBottom:16,background:"linear-gradient(135deg,#FFF8F0 0%,#FFFDFC 58%,#F7FAFF 100%)",border:"1px solid #F0E4D7"}}>
      <div className="gandeng-admin-hero-art" style={{position:"absolute",right:"clamp(12px,4vw,46px)",top:"50%",transform:"translateY(-50%)",width:132,height:132,borderRadius:"50%",background:"linear-gradient(145deg,#FFF0DD,#FFF8EF)",display:"grid",placeItems:"center",color:"#FF8A1E",opacity:.95}}><ShieldCheck size={72} strokeWidth={1.5}/></div>
      <div className="gandeng-admin-hero-copy" style={{position:"relative",zIndex:1,maxWidth:650,paddingRight:"clamp(0px,14vw,150px)"}}>
        <div style={{fontSize:10.5,fontWeight:800,letterSpacing:1.2,textTransform:"uppercase",color:"#FF8A1E",marginBottom:8}}>Administrator GANDENG</div>
        <h1 style={{margin:0,color:T.heading,fontFamily:font.display,fontSize:"clamp(26px,3vw,36px)",lineHeight:1.08}}>Manajemen Akun</h1>
        <p style={{margin:"10px 0 0",color:T.muted,fontSize:13,lineHeight:1.65,maxWidth:610}}>Kelola akun perusahaan atau lembaga yang menggunakan GANDENG tanpa mencampurkannya dengan akses internal SAKTI dan Si Lapak Priok.</p>
      </div>
    </section>

    <div className="responsive-card-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:12,marginBottom:16}}>
      <Summary icon={Building2} label="Total Akun" value={companyAccounts.length} note="Perusahaan / lembaga terdaftar" tone="blue" />
      <Summary icon={UserRoundCheck} label="Akun Aktif" value={activeCount} note="Dapat mengakses GANDENG" tone="green" />
      <Summary icon={UserRoundX} label="Non-Aktif" value={inactiveCount} note="Akses sedang dinonaktifkan" tone="red" />
    </div>

    <Card style={{padding:0,overflow:"hidden",borderRadius:16}}>
      <div style={{padding:"14px 16px",borderBottom:`1px solid ${T.border}`}}>
        <div style={{position:"relative",maxWidth:560}}><Search size={16} color={T.muted} style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)"}}/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Cari perusahaan, email, atau username..." style={{width:"100%",height:42,padding:"0 12px 0 40px",borderRadius:10,border:`1px solid ${T.border}`,background:T.inputBg,color:T.text}}/></div>
      </div>
      <div style={{overflowX:"auto"}}><table style={{width:"100%",minWidth:760,borderCollapse:"collapse",fontSize:12.5}}><thead><tr style={{background:"#F7F9FC"}}>{["Perusahaan / Lembaga","Email","Username","Status","Aksi"].map((h)=><th key={h} style={th}>{h}</th>)}</tr></thead><tbody>{visible.length ? visible.map((a)=><tr key={a.id}><td style={td}><div style={{fontWeight:800,color:T.heading,overflowWrap:"anywhere"}}>{a.organization || "-"}</div><div style={{fontSize:10.5,color:T.muted,marginTop:3}}>{a.id}</div></td><td style={{...td,overflowWrap:"anywhere"}}>{a.email}</td><td style={{...td,fontFamily:font.mono,fontWeight:700}}>{a.username}</td><td style={td}><span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"5px 9px",borderRadius:999,background:a.active===false?"#FCE1E1":"#DEF6E5",color:a.active===false?"#B01818":"#1E7F3E",fontWeight:800,whiteSpace:"nowrap"}}>{a.active===false?<XCircle size={12}/>:<CheckCircle2 size={12}/>} {a.active===false?"Non-Aktif":"Aktif"}</span></td><td style={td}><div style={{display:"flex",gap:6}}><button onClick={()=>toggle(a.id)} title={a.active===false?"Aktifkan":"Nonaktifkan"} style={iconBtn}><Shield size={14}/></button><button onClick={()=>remove(a.id)} title="Hapus akun" style={{...iconBtn,color:T.danger}}><Trash2 size={14}/></button></div></td></tr>) : <tr><td colSpan="5" style={{padding:"42px 20px",textAlign:"center",color:T.muted,lineHeight:1.6}}><div style={{width:72,height:72,borderRadius:18,margin:"0 auto 12px",display:"grid",placeItems:"center",background:"#EEF4FF",color:"#3974E8"}}><SearchX size={34}/></div><div style={{fontFamily:font.display,fontSize:15,fontWeight:800,color:T.heading}}>Belum ada akun GANDENG</div><div style={{fontSize:12,marginTop:4}}>yang sesuai pencarian.</div></td></tr>}</tbody></table></div>
    </Card>
  </div>;
}
function Summary({icon:Icon,label,value,note,tone}){const map={blue:["#2F6FED","#EAF1FF"],green:["#1E8E4A","#E6F6EC"],red:["#C62828","#FCEAEA"]};const [accent,bg]=map[tone]||map.blue;return <Card style={{padding:"16px",minWidth:0,borderRadius:15}}><div style={{display:"flex",alignItems:"center",gap:12}}><div style={{width:42,height:42,borderRadius:11,display:"grid",placeItems:"center",background:bg,color:accent,flexShrink:0}}><Icon size={19}/></div><div style={{minWidth:0}}><div style={{fontSize:10.5,color:T.muted,fontWeight:800,textTransform:"uppercase",letterSpacing:.45}}>{label}</div><div style={{fontFamily:font.display,fontSize:27,fontWeight:800,color:T.heading,marginTop:3}}>{value}</div></div></div><div style={{fontSize:10.5,color:T.muted,marginTop:10,lineHeight:1.45,paddingLeft:54}}>{note}</div></Card>}
const th={padding:"12px 14px",textAlign:"left",borderBottom:"1px solid var(--border)",color:T.heading,fontSize:10.5,textTransform:"uppercase",letterSpacing:.5};
const td={padding:"13px 14px",borderBottom:"1px solid var(--border)",color:T.text,verticalAlign:"middle"};
const iconBtn={width:30,height:30,display:"grid",placeItems:"center",borderRadius:7,border:"1px solid var(--border)",background:"var(--card)",color:"#125AE8",cursor:"pointer"};
