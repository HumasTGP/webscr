import { ClipboardList, FilePlus, HelpCircle, LayoutDashboard, LogOut, Search, UserRoundCog } from "lucide-react";
import { T, font } from "../../lib/theme";

const BASE_MENU = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "pengajuan-baru", label: "Pengajuan Baru", icon: FilePlus },
  { key: "riwayat", label: "Riwayat Pengajuan", icon: ClipboardList },
  { key: "tracking", label: "Tracking Status", icon: Search },
  { key: "bantuan", label: "Bantuan", icon: HelpCircle },
];

export default function GandengSidebar({ active, onSelect, onLogout, user }) {
  const menu = user?.isAdmin ? [{ key: "account-management", label: "Manajemen Akun", icon: UserRoundCog }, ...BASE_MENU] : BASE_MENU;
  return <div className="system-sidebar-wrap"><aside className="system-sidebar" style={{boxShadow:"0 16px 38px rgba(24,74,180,.09)"}}>
    <div className="system-brand">
      <div className="system-brand-logo"><img src="/logo-gandeng.png" alt="GANDENG" /></div>
      <div className="system-brand-copy"><div className="system-brand-title">GANDENG</div><div className="system-brand-subtitle">Pengajuan & Kerja Sama</div></div>
    </div>
    <nav style={{ flex: 1, padding: "14px", display: "flex", flexDirection: "column", gap: 5, overflowY: "auto" }}>
      {menu.map(({ key, label, icon: Icon }) => {
        const isActive = active === key;
        return <button key={key} onClick={() => onSelect(key)} style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 42, padding: "9px 11px", borderRadius: 11, border: 0, background: isActive ? "linear-gradient(135deg,#125AE8,#0B46C8)" : "transparent", color: isActive ? "#fff" : T.text, boxShadow:isActive?"0 8px 18px rgba(18,90,232,.22)":"none", cursor: "pointer", fontSize: 13, fontWeight: isActive ? 800 : 500, fontFamily: font.body, width: "100%", textAlign: "left" }}><Icon size={16} style={{ flexShrink: 0 }} /><span>{label}</span></button>;
      })}
    </nav>
    <div style={{ padding: "12px 14px 14px", borderTop: `1px solid ${T.border}` }}>
      <button className="mobile-hide-sidebar" onClick={onLogout} style={{ display: "flex", alignItems: "center", justifyContent:"center", gap: 9, minHeight: 42, padding: "9px 12px", borderRadius: 11, border: "1px solid #F3C8C5", background: "#FFF7F6", color: "#D6362F", cursor: "pointer", fontSize: 12.5, fontWeight: 800, width: "100%" }}><LogOut size={15} /><span>Keluar</span></button>
    </div>
  </aside></div>;
}
