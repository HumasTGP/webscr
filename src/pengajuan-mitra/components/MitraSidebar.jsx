import { LayoutDashboard, FilePlus, ClipboardList, Search, HelpCircle, LogOut, ArrowLeft } from "lucide-react";
import { T, font } from "../../lib/theme";

const MENU_ITEMS = [
  { key: "dashboard",      label: "Dashboard",          icon: LayoutDashboard },
  { key: "pengajuan-baru", label: "Pengajuan Baru",     icon: FilePlus },
  { key: "riwayat",        label: "Riwayat Pengajuan",  icon: ClipboardList },
  { key: "tracking",       label: "Tracking Status",    icon: Search },
  { key: "bantuan",        label: "Bantuan",             icon: HelpCircle },
];

export default function MitraSidebar({ active, onSelect, onLogout, onBackToPortal }) {
  return (
    <aside
      style={{
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
      }}
    >
      {/* Logo / Header */}
      <div style={{
        padding: "20px 18px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: "linear-gradient(135deg, #FFC72C 0%, #E6A700 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 16, fontWeight: 900, color: "#0A1628" }}>M</span>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>Portal Mitra</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>PLN UBP Priok</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
        {MENU_ITEMS.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 8,
                border: "none",
                background: isActive
                  ? "rgba(255,199,44,0.15)"
                  : "transparent",
                color: isActive ? "#FFC72C" : "rgba(255,255,255,0.6)",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                fontFamily: font.body,
                width: "100%",
                textAlign: "left",
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
                  e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                }
              }}
            >
              <Icon size={16} style={{ flexShrink: 0 }} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div style={{
        padding: "10px 10px 16px",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}>
        <button
          onClick={onBackToPortal}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 12px", borderRadius: 8, border: "none",
            background: "transparent", color: "rgba(255,255,255,0.5)",
            cursor: "pointer", fontSize: 13, fontWeight: 500,
            fontFamily: font.body, width: "100%", textAlign: "left",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "rgba(255,255,255,0.5)";
          }}
        >
          <ArrowLeft size={16} style={{ flexShrink: 0 }} />
          <span>Kembali ke Portal</span>
        </button>

        <button
          onClick={onLogout}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 12px", borderRadius: 8, border: "none",
            background: "transparent", color: "rgba(255,255,255,0.5)",
            cursor: "pointer", fontSize: 13, fontWeight: 500,
            fontFamily: font.body, width: "100%", textAlign: "left",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(176,24,24,0.12)";
            e.currentTarget.style.color = "#F87171";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "rgba(255,255,255,0.5)";
          }}
        >
          <LogOut size={16} style={{ flexShrink: 0 }} />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
