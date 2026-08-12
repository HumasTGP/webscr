import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Search, Shield, Trash2, UserRoundCog, XCircle } from "lucide-react";
import { T, font } from "../../lib/theme";
import Card from "../../components/Card";
import PageHeader from "../../components/PageHeader";
import { loadGandengAccounts, replaceGandengAccounts } from "../lib/accounts";

export default function MitraAccountManagement({ notify }) {
  const [accounts, setAccounts] = useState(() => loadGandengAccounts());
  const [query, setQuery] = useState("");
  useEffect(() => replaceGandengAccounts(accounts), [accounts]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return accounts.filter((a) => !a.isAdmin).filter((a) => !q || [a.organization, a.username, a.email].some((v) => String(v || "").toLowerCase().includes(q)));
  }, [accounts, query]);

  const toggle = (id) => setAccounts((prev) => prev.map((a) => a.id === id ? { ...a, active: a.active === false } : a));
  const remove = (id) => { setAccounts((prev) => prev.filter((a) => a.id !== id)); notify?.("Akun GANDENG dihapus.", "success"); };

  return <div style={{ padding:"clamp(18px,3vw,28px) clamp(16px,4vw,32px)", maxWidth:1100, width:"100%", boxSizing:"border-box" }}>
    <PageHeader eyebrow="Administrator GANDENG" title="Manajemen Akun GANDENG" description="Akun GANDENG dikelola terpisah dari SAKTI dan Si Lapak Priok. Pengguna membuat akun sendiri dengan email, username, dan password." />
    <div className="responsive-toolbar" style={{ display:"flex", gap:10, alignItems:"center", marginBottom:16 }}><div style={{position:"relative",flex:"1 1 360px"}}><Search size={15} color={T.muted} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}}/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Cari perusahaan, email, atau username..." style={{width:"100%",height:42,padding:"0 12px 0 38px",borderRadius:9,border:`1px solid ${T.border}`,background:T.inputBg,color:T.text}}/></div><div style={{fontSize:12,color:T.muted}}>Total {visible.length} akun</div></div>
    <Card padded={false}><div style={{overflowX:"auto"}}><table style={{width:"100%",minWidth:720,borderCollapse:"collapse",fontSize:12.5}}><thead><tr style={{background:T.bg}}>{["Perusahaan / Lembaga","Email","Username","Status","Aksi"].map((h)=><th key={h} style={th}>{h}</th>)}</tr></thead><tbody>{visible.length ? visible.map((a)=><tr key={a.id}><td style={td}><div style={{fontWeight:800,color:T.heading}}>{a.organization || "-"}</div><div style={{fontSize:10.5,color:T.muted,marginTop:2}}>{a.id}</div></td><td style={td}>{a.email}</td><td style={{...td,fontFamily:font.mono,fontWeight:700}}>{a.username}</td><td style={td}><span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 9px",borderRadius:999,background:a.active===false?"#FCE1E1":"#DEF6E5",color:a.active===false?"#B01818":"#1E7F3E",fontWeight:800}}>{a.active===false?<XCircle size={12}/>:<CheckCircle2 size={12}/>} {a.active===false?"Non-Aktif":"Aktif"}</span></td><td style={td}><div style={{display:"flex",gap:6}}><button onClick={()=>toggle(a.id)} title={a.active===false?"Aktifkan":"Nonaktifkan"} style={iconBtn}><Shield size={14}/></button><button onClick={()=>remove(a.id)} title="Hapus akun" style={{...iconBtn,color:T.danger}}><Trash2 size={14}/></button></div></td></tr>) : <tr><td colSpan="5" style={{padding:28,textAlign:"center",color:T.muted}}>Belum ada akun GANDENG yang sesuai pencarian.</td></tr>}</tbody></table></div></Card>
  </div>;
}
const th={padding:"11px 14px",textAlign:"left",borderBottom:"1px solid var(--border)",color:T.heading,fontSize:11,textTransform:"uppercase",letterSpacing:.4};
const td={padding:"12px 14px",borderBottom:"1px solid var(--border)",color:T.text,verticalAlign:"middle"};
const iconBtn={width:30,height:30,display:"grid",placeItems:"center",borderRadius:7,border:"1px solid var(--border)",background:"var(--card)",color:T.blue,cursor:"pointer"};
