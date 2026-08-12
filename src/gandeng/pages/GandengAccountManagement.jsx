import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Search, Shield, Trash2, XCircle } from "lucide-react";
import { T, font } from "../../lib/theme";
import Card from "../../components/Card";
import PageHeader from "../../components/PageHeader";
import { loadGandengAccounts, replaceGandengAccounts } from "../lib/accounts";

export default function GandengAccountManagement({ notify }) {
  const [accounts, setAccounts] = useState(() => loadGandengAccounts());
  const [query, setQuery] = useState("");
  useEffect(() => replaceGandengAccounts(accounts), [accounts]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return accounts.filter((a) => !a.isAdmin).filter((a) => !q || [a.organization, a.username, a.email].some((v) => String(v || "").toLowerCase().includes(q)));
  }, [accounts, query]);

  const toggle = (id) => setAccounts((prev) => prev.map((a) => a.id === id ? { ...a, active: a.active === false } : a));
  const remove = (id) => { setAccounts((prev) => prev.filter((a) => a.id !== id)); notify?.("Akun GANDENG dihapus.", "success"); };

  return <div className="system-body" style={{maxWidth:1180}}>
    <PageHeader eyebrow="Administrator GANDENG" title="Manajemen Akun GANDENG" description="Kelola akun perusahaan atau lembaga GANDENG. Akun ini terpisah dari akses internal SAKTI dan Si Lapak Priok." />
    <div className="responsive-toolbar" style={{ display:"flex", gap:10, alignItems:"center", marginBottom:16 }}><div style={{position:"relative",flex:"1 1 360px",minWidth:0}}><Search size={15} color={T.muted} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}}/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Cari perusahaan, email, atau username..." style={{width:"100%",height:42,padding:"0 12px 0 38px",borderRadius:9,border:`1px solid ${T.border}`,background:T.inputBg,color:T.text}}/></div><span className="count-summary">Menampilkan {visible.length} akun</span></div>
    <Card padded={false}><div style={{overflowX:"auto"}}><table style={{width:"100%",minWidth:720,borderCollapse:"collapse",fontSize:12.5}}><thead><tr style={{background:T.bg}}>{["Perusahaan / Lembaga","Email","Username","Status","Aksi"].map((h)=><th key={h} style={th}>{h}</th>)}</tr></thead><tbody>{visible.length ? visible.map((a)=><tr key={a.id}><td style={td}><div style={{fontWeight:800,color:T.heading,overflowWrap:"anywhere"}}>{a.organization || "-"}</div><div style={{fontSize:10.5,color:T.muted,marginTop:2}}>{a.id}</div></td><td style={{...td,overflowWrap:"anywhere"}}>{a.email}</td><td style={{...td,fontFamily:font.mono,fontWeight:700}}>{a.username}</td><td style={td}><span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 9px",borderRadius:999,background:a.active===false?"#FCE1E1":"#DEF6E5",color:a.active===false?"#B01818":"#1E7F3E",fontWeight:800,whiteSpace:"nowrap"}}>{a.active===false?<XCircle size={12}/>:<CheckCircle2 size={12}/>} {a.active===false?"Non-Aktif":"Aktif"}</span></td><td style={td}><div style={{display:"flex",gap:6}}><button onClick={()=>toggle(a.id)} title={a.active===false?"Aktifkan":"Nonaktifkan"} style={iconBtn}><Shield size={14}/></button><button onClick={()=>remove(a.id)} title="Hapus akun" style={{...iconBtn,color:T.danger}}><Trash2 size={14}/></button></div></td></tr>) : <tr><td colSpan="5" style={{padding:28,textAlign:"center",color:T.muted,lineHeight:1.55}}>Belum ada akun GANDENG yang sesuai pencarian.</td></tr>}</tbody></table></div></Card>
  </div>;
}
const th={padding:"11px 14px",textAlign:"left",borderBottom:"1px solid var(--border)",color:T.heading,fontSize:11,textTransform:"uppercase",letterSpacing:.4};
const td={padding:"12px 14px",borderBottom:"1px solid var(--border)",color:T.text,verticalAlign:"middle"};
const iconBtn={width:30,height:30,display:"grid",placeItems:"center",borderRadius:7,border:"1px solid var(--border)",background:"var(--card)",color:T.blue,cursor:"pointer"};
