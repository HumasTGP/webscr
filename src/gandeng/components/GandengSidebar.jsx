import { ArrowLeft, ClipboardList, FilePlus, HelpCircle, LayoutDashboard, LogOut, Search, UserRoundCog } from "lucide-react";
import { T, font } from "../../lib/theme";

const BASE_MENU = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "pengajuan-baru", label: "Pengajuan Baru", icon: FilePlus },
  { key: "riwayat", label: "Riwayat Pengajuan", icon: ClipboardList },
  { key: "tracking", label: "Tracking Status", icon: Search },
  { key: "bantuan", label: "Bantuan", icon: HelpCircle },
];

export default function GandengSidebar({ active, onSelect, onLogout, onBackToPortal, user }) {
  const menu = user?.isAdmin ? [{ key: "account-management", label: "Manajemen Akun", icon: UserRoundCog }, ...BASE_MENU] : BASE_MENU;
  return <div style={{ padding: "16px 0 16px 16px", flexShrink: 0, position: "sticky", top: 0, height: "100vh", boxSizing: "border-box" }}>
    <aside className="gandeng-sidebar" style={{ width: 236, height: "calc(100vh - 32px)", background: T.card, border: `1px solid ${T.border}`, borderRadius: 22, boxShadow: T.shadowSm, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "16px 14px 14px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "#fff", border: `1px solid ${T.border}`, display: "grid", placeItems: "center", flexShrink: 0 }}><img src="/logo-gandeng.png" alt="GANDENG" style={{ width: 32, height: 32, objectFit: "contain" }} /></div>
          <div className="gandeng-brand-copy" style={{ minWidth: 0 }}><div style={{ fontFamily: font.display, fontSize: 14, fontWeight: 800, color: T.heading }}>GANDENG</div><div style={{ fontSize: 10.5, color: T.muted, lineHeight: 1.4 }}>Pengajuan & Kerja Sama</div></div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 4, overflowY: "auto" }}>
        {menu.map(({ key, label, icon: Icon }) => { const isActive = active === key; return <button key={key} onClick={() => onSelect(key)} style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 38, padding: "8px 11px", borderRadius: 10, border: 0, background: isActive ? T.navy : "transparent", color: isActive ? "#fff" : T.text, cursor: "pointer", fontSize: 12.5, fontWeight: isActive ? 700 : 500, fontFamily: font.body, width: "100%", textAlign: "left" }}><Icon size={16} style={{ flexShrink: 0 }} /><span>{label}</span></button>; })}
      </nav>
      <div style={{ padding: "10px", borderTop: `1px solid ${T.border}`, display: "grid", gap: 4 }}>
        <BottomButton onClick={onBackToPortal} icon={ArrowLeft} label="Kembali ke Portal" />
        <BottomButton onClick={onLogout} icon={LogOut} label="Keluar" danger />
      </div>
    </aside>
  </div>;
}
function BottomButton({ onClick, icon: Icon, label, danger }) { return <button className="gandeng-bottom-button" onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 36, padding: "8px 11px", borderRadius: 9, border: 0, background: "transparent", color: danger ? T.danger : T.muted, cursor: "pointer", fontSize: 12.5, fontWeight: 600, width: "100%", textAlign: "left" }}><Icon size={15} style={{ flexShrink: 0 }} /><span className="gandeng-bottom-label">{label}</span></button>; }
