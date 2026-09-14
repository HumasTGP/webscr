import { BookUser, HelpCircle, History, LayoutDashboard, ListChecks, Package, PackageCheck } from "lucide-react";
import { T, font } from "../../lib/theme";
import SidebarExitButton from "../../components/SidebarExitButton";

const ACCENT = "#FDEA6F";
const ACCENT_TEXT = "#5B4B00";
const ITEMS = [
  { key:"dashboard",label:"Dashboard",icon:LayoutDashboard },
  { key:"tambah",label:"Tambah Paket/Surat",icon:Package },
  { key:"data",label:"Data Paket/Surat",icon:ListChecks },
  { key:"ambil",label:"Ambil Paket/Surat",icon:PackageCheck },
  { key:"tamu",label:"Buku Tamu",icon:BookUser },
  { key:"riwayat",label:"Riwayat",icon:History },
  { key:"bantuan",label:"Bantuan",icon:HelpCircle },
];

export default function SiLapakSidebar({ active, onSelect, onLogout }) {
  return <div className="system-sidebar-wrap"><aside className="system-sidebar">
    <div className="system-brand">
      <div className="system-brand-logo"><img src="/logo-silapak.png" alt="Si Lapak Priok" /></div>
      <div className="system-brand-copy"><div className="system-brand-title">Si Lapak Priok</div><div className="system-brand-subtitle">Tamu & Paket</div></div>
    </div>
    <nav style={{flex:1,padding:"12px 14px",overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>{ITEMS.map((m)=>{const Icon=m.icon,isActive=active===m.key;return <button key={m.key} onClick={()=>onSelect(m.key)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"9px 10px",borderRadius:10,border:0,cursor:"pointer",background:isActive?ACCENT:"transparent",color:isActive?ACCENT_TEXT:T.text,fontWeight:isActive?800:500,fontSize:13,fontFamily:font.body,textAlign:"left"}}><Icon size={16} style={{flexShrink:0}}/><span>{m.label}</span></button>})}</nav>
    <SidebarExitButton onClick={onLogout} />
  </aside></div>;
}
