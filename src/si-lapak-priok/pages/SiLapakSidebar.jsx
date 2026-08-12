import { BookUser, HelpCircle, History, LayoutDashboard, ListChecks, LogOut, Package, PackageCheck } from "lucide-react";
import { font } from "../../lib/theme";

const ACCENT = "#FDEA6F";
const ITEMS = [
  { key:"dashboard",label:"Dashboard",icon:LayoutDashboard },
  { key:"tambah",label:"Tambah Paket",icon:Package },
  { key:"data",label:"Data Paket",icon:ListChecks },
  { key:"ambil",label:"Ambil Paket",icon:PackageCheck },
  { key:"tamu",label:"Buku Tamu",icon:BookUser },
  { key:"riwayat",label:"Riwayat",icon:History },
  { key:"bantuan",label:"Bantuan",icon:HelpCircle },
];

export default function SiLapakSidebar({ active, onSelect, onLogout }) {
  return <aside style={{ width:240,height:"100vh",position:"sticky",top:0,background:"#26230D",display:"flex",flexDirection:"column",flexShrink:0 }}>
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"20px 18px",borderBottom:"1px solid rgba(253,234,111,.16)"}}>
      <div style={{width:44,height:44,borderRadius:10,background:"#fff",display:"grid",placeItems:"center",padding:5,flexShrink:0}}><img src="/logo-silapak.png" alt="Si Lapak Priok" style={{width:34,height:34,objectFit:"contain"}}/></div>
      <div><div style={{color:"#fff",fontFamily:font.display,fontSize:14,fontWeight:800,lineHeight:1.3}}>Si Lapak Priok</div><div style={{color:"rgba(255,255,255,.55)",fontSize:10,fontFamily:font.mono}}>Tamu & Paket</div></div>
    </div>
    <nav style={{flex:1,padding:"12px 10px",overflowY:"auto"}}>{ITEMS.map((m)=>{const Icon=m.icon,isActive=active===m.key;return <button key={m.key} onClick={()=>onSelect(m.key)} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"10px 12px",marginBottom:3,borderRadius:8,border:0,cursor:"pointer",background:isActive?ACCENT:"transparent",color:isActive?"#292400":"rgba(255,255,255,.72)",fontWeight:isActive?800:500,fontSize:13.5,fontFamily:font.body,textAlign:"left"}}><Icon size={17} style={{flexShrink:0}}/><span>{m.label}</span></button>})}</nav>
    <div style={{padding:14,borderTop:"1px solid rgba(253,234,111,.16)"}}><button onClick={onLogout} style={{width:"100%",display:"flex",alignItems:"center",gap:10,justifyContent:"center",padding:"9px 12px",borderRadius:8,border:`1px solid ${ACCENT}`,background:"transparent",color:ACCENT,cursor:"pointer",fontSize:12.5,fontWeight:700}}><LogOut size={15}/>Keluar</button></div>
  </aside>;
}
