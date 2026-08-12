import { ClipboardList, FilePlus, HelpCircle, LayoutDashboard, LogOut, Search, UserRoundCog } from "lucide-react";
import { T, font } from "../../lib/theme";

const BASE_MENU = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "pengajuan-baru", label: "Pengajuan Baru", icon: FilePlus },
  { key: "riwayat", label: "Riwayat Pengajuan", icon: ClipboardList },
  { key: "tracking", label: "Tracking Status", icon: Search },
  { key: "bantuan", label: "Bantuan", icon: HelpCircle },
];

const ACTIVE_BG  = "#EAF1FF";
const ACTIVE_FG  = "#0B46C8";

export default function GandengSidebar({ active, onSelect, onLogout, user }) {
  const menu = user?.isAdmin
    ? [{ key: "account-management", label: "Manajemen Akun", icon: UserRoundCog }, ...BASE_MENU]
    : BASE_MENU;

  return (
    <div className="system-sidebar-wrap">
      <aside className="system-sidebar">
        <div className="system-brand">
          <div className="system-brand-logo">
            <img src="/logo-gandeng.png" alt="GANDENG" />
          </div>
          <div className="system-brand-copy">
            <div className="system-brand-title">GANDENG</div>
            <div className="system-brand-subtitle">Pengajuan & Kerja Sama</div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 4, overflowY: "auto" }}>
          {menu.map(({ key, label, icon: Icon }) => {
            const isActive = active === key;
            return (
              <button
                key={key}
                onClick={() => onSelect(key)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 10px",
                  borderRadius: 10,
                  border: 0,
                  cursor: "pointer",
                  background: isActive ? ACTIVE_BG : "transparent",
                  color: isActive ? ACTIVE_FG : T.text,
                  fontWeight: isActive ? 800 : 500,
                  fontSize: 13,
                  fontFamily: font.body,
                  textAlign: "left",
                }}
              >
                <Icon size={16} style={{ flexShrink: 0 }} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <div style={{ padding: "12px 14px 14px", borderTop: `1px solid ${T.border}` }}>
          <button
            className="mobile-hide-sidebar"
            onClick={onLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 9,
              padding: "9px 12px",
              borderRadius: 10,
              border: "1px solid #FFCDD2",
              background: "#FFF5F5",
              color: "#C62828",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            <LogOut size={14} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
