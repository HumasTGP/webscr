import { useEffect, useMemo, useState } from "react";
import { Building2, CheckCircle2, Search, Shield, Trash2, UserRoundCheck, UserRoundX, XCircle } from "lucide-react";
import { T, font } from "../../lib/theme";
import Card from "../../components/Card";
import PageHeader from "../../components/PageHeader";
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
    <PageHeader eyebrow="Administrator GANDENG" title="Manajemen Akun" description="Kelola akun perusahaan atau lembaga yang menggunakan GANDENG tanpa mencampurkannya dengan akses internal SAKTI dan Si Lapak Priok." />

    <div className="responsive-card-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:12,marginBottom:16}}>
      <Summary icon={Building2} label="Total Akun" value={companyAccounts.length} note="Perusahaan / lembaga terdaftar" />
      <Summary icon={UserRoundCheck} label="Akun Aktif" value={activeCount} note="Dapat mengakses GANDENG" success />
      <Summary icon={UserRoundX} label="Non-Aktif" value={inactiveCount} note="Akses sedang dinonaktifkan" danger />
    </div>

    <Card style={{padding:0,overflow:"hidden"}}>
      <div style={{padding:"14px 16px",borderBottom:`1px solid ${T.border}`}}>
        <div style={{position:"relative",maxWidth:520}}><Search size={15} color={T.muted} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}}/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Cari perusahaan, email, atau username..." style={{width:"100%",height:42,padding:"0 12px 0 38px",borderRadius:9,border:`1px solid ${T.border}`,background:T.inputBg,color:T.text}}/></div>
      </div>
      <div style={{overflowX:"auto"}}><table style={{width:"100%",minWidth:760,borderCollapse:"collapse",fontSize:12.5}}><thead><tr style={{background:T.bg}}>{["Perusahaan / Lembaga","Email","Username","Status","Aksi"].map((h)=><th key={h} style={th}>{h}</th>)}</tr></thead><tbody>{visible.length ? visible.map((a)=><tr key={a.id}><td style={td}><div style={{fontWeight:800,color:T.heading,overflowWrap:"anywhere"}}>{a.organization || "-"}</div><div style={{fontSize:10.5,color:T.muted,marginTop:3}}>{a.id}</div></td><td style={{...td,overflowWrap:"anywhere"}}>{a.email}</td><td style={{...td,fontFamily:font.mono,fontWeight:700}}>{a.username}</td><td style={td}><span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"5px 9px",borderRadius:999,background:a.active===false?"#FCE1E1":"#DEF6E5",color:a.active===false?"#B01818":"#1E7F3E",fontWeight:800,whiteSpace:"nowrap"}}>{a.active===false?<XCircle size={12}/>:<CheckCircle2 size={12}/>} {a.active===false?"Non-Aktif":"Aktif"}</span></td><td style={td}><div style={{display:"flex",gap:6}}><button onClick={()=>toggle(a.id)} title={a.active===false?"Aktifkan":"Nonaktifkan"} style={iconBtn}><Shield size={14}/></button><button onClick={()=>remove(a.id)} title="Hapus akun" style={{...iconBtn,color:T.danger}}><Trash2 size={14}/></button></div></td></tr>) : <tr><td colSpan="5" style={{padding:"36px 20px",textAlign:"center",color:T.muted,lineHeight:1.6}}>Belum ada akun GANDENG yang sesuai pencarian.</td></tr>}</tbody></table></div>
    </Card>
  </div>;
}
function Summary({icon:Icon,label,value,note,success,danger}){const accent=danger?"#B01818":success?"#1E7F3E":"#CF0000";const bg=danger?"#FCE1E1":success?"#DEF6E5":"#FDEAEA";return <Card style={{padding:"15px 16px",minWidth:0}}><div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"flex-start"}}><div><div style={{fontSize:10.5,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>{label}</div><div style={{fontFamily:font.display,fontSize:25,fontWeight:800,color:T.heading,marginTop:6}}>{value}</div></div><div style={{width:36,height:36,borderRadius:10,display:"grid",placeItems:"center",background:bg,color:accent,flexShrink:0}}><Icon size={17}/></div></div><div style={{fontSize:10.5,color:T.muted,marginTop:8,lineHeight:1.4}}>{note}</div></Card>}
const th={padding:"12px 14px",textAlign:"left",borderBottom:"1px solid var(--border)",color:T.heading,fontSize:10.5,textTransform:"uppercase",letterSpacing:.5};
const td={padding:"13px 14px",borderBottom:"1px solid var(--border)",color:T.text,verticalAlign:"middle"};
const iconBtn={width:30,height:30,display:"grid",placeItems:"center",borderRadius:7,border:"1px solid var(--border)",background:"var(--card)",color:T.blue,cursor:"pointer"};
