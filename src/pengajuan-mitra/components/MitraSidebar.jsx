import { LayoutDashboard, FilePlus, ClipboardList, Search, HelpCircle, LogOut, ArrowLeft } from "lucide-react";
import { font } from "../../lib/theme";

const MENU_ITEMS = [
  { key: "dashboard",       label: "Dashboard",         icon: LayoutDashboard },
  { key: "pengajuan-baru", label: "Pengajuan Baru",    icon: FilePlus },
  { key: "riwayat",        label: "Riwayat Pengajuan", icon: ClipboardList },
  { key: "tracking",       label: "Tracking Status",   icon: Search },
  { key: "bantuan",        label: "Bantuan",           icon: HelpCircle },
];

export default function MitraSidebar({ active, onSelect, onLogout, onBackToPortal }) {
  return (
    <aside className="gandeng-sidebar" style={{
      width: 220,
      height: "100vh",
      position: "sticky",
      top: 0,
      background: "#0A1628",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      overflow: "hidden",
      borderRight: "1px solid rgba(255,255,255,0.07)",
    }}>
      <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: "rgba(255,255,255,.96)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <img src="/logo-gandeng.png" alt="GANDENG" style={{ width: 30, height: 30, objectFit: "contain" }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>GANDENG</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", lineHeight: 1.4 }}>Portal Pengajuan Proposal</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
        {MENU_ITEMS.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 8, border: "none",
                background: isActive ? "rgba(255,199,44,0.15)" : "transparent",
                color: isActive ? "#FFC72C" : "rgba(255,255,255,0.62)",
                cursor: "pointer", fontSize: 13, fontWeight: isActive ? 700 : 500,
                fontFamily: font.body, width: "100%", textAlign: "left",
                transition: "all .12s ease",
                borderLeft: isActive ? "3px solid #FFC72C" : "3px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.color = "#fff";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,0.62)";
                }
              }}
            >
              <Icon size={16} style={{ flexShrink: 0 }} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      <div style={{
        padding: "10px 10px 16px",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        display: "flex", flexDirection: "column", gap: 2,
      }}>
        <BottomButton onClick={onBackToPortal} icon={ArrowLeft} label="Kembali ke Portal" />
        <BottomButton onClick={onLogout} icon={LogOut} label="Keluar" danger />
      </div>
    </aside>
  );
}

function BottomButton({ onClick, icon: Icon, label, danger = false }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "9px 12px", borderRadius: 8, border: "none",
        background: "transparent", color: "rgba(255,255,255,0.52)",
        cursor: "pointer", fontSize: 13, fontWeight: 500,
        fontFamily: font.body, width: "100%", textAlign: "left",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger ? "rgba(176,24,24,0.12)" : "rgba(255,255,255,0.06)";
        e.currentTarget.style.color = danger ? "#F87171" : "#fff";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "rgba(255,255,255,0.52)";
      }}
    >
      <Icon size={16} style={{ flexShrink: 0 }} />
      <span>{label}</span>
    </button>
  );
}
