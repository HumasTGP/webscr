import { HelpCircle, LayoutDashboard, Search, UserRoundCog } from "lucide-react";
import { T, font } from "../../lib/theme";
import SidebarExitButton from "../../components/SidebarExitButton";

const BASE_MENU = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "tracking", label: "Tracking Status Proposal", icon: Search },
  { key: "bantuan", label: "Bantuan", icon: HelpCircle },
];

const ACTIVE_BG = "#FDEAEA";
const ACTIVE_FG = "#CF0000";

export default function GandengSidebar({ active, onSelect, onLogout, user }) {
  const menu = user?.isAdmin ? [{ key: "account-management", label: "Manajemen Akun", icon: UserRoundCog }, ...BASE_MENU] : BASE_MENU;
  return <div className="system-sidebar-wrap"><aside className="system-sidebar">
    <div className="system-brand"><div className="system-brand-logo"><img src="/logo-gandeng.png" alt="GANDENG" /></div><div className="system-brand-copy"><div className="system-brand-title">GANDENG</div><div className="system-brand-subtitle">Pengajuan & Kerja Sama</div></div></div>
    <nav style={{flex:1,padding:"12px 14px",display:"flex",flexDirection:"column",gap:4,overflowY:"auto"}}>{menu.map(({key,label,icon:Icon})=>{const isActive=active===key;return <button key={key} onClick={()=>onSelect(key)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"9px 10px",borderRadius:10,border:0,cursor:"pointer",background:isActive?ACTIVE_BG:"transparent",color:isActive?ACTIVE_FG:T.text,fontWeight:isActive?800:500,fontSize:13,fontFamily:font.body,textAlign:"left"}}><Icon size={16} style={{flexShrink:0}}/><span>{label}</span></button>})}</nav>
    <SidebarExitButton onClick={onLogout} />
  </aside></div>;
}
