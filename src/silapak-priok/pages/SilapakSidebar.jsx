import { LayoutDashboard, Package, ListChecks, PackageCheck, BookUser, History, LogOut, HelpCircle } from "lucide-react";
import { T, font } from "../../lib/theme";
import AutoLogo from "../../components/AutoLogo";

const ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "tambah", label: "Tambah Paket", icon: Package },
  { key: "data", label: "Data Paket", icon: ListChecks },
  { key: "ambil", label: "Ambil Paket", icon: PackageCheck },
  { key: "tamu", label: "Buku Tamu", icon: BookUser },
  { key: "riwayat", label: "Riwayat", icon: History },
  { key: "bantuan", label: "Bantuan", icon: HelpCircle },
];

export default function SilapakSidebar({ active, onSelect, onLogout }) {
  return (
    <aside
      style={{
        width: 240,
        height: "100vh",
        position: "sticky",
        top: 0,
        background: T.navyDeep,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "20px 18px",
          borderBottom: "1px solid #12294A",
        }}
      >
        <AutoLogo
          alt="Logo PLN"
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: "#fff",
            objectFit: "contain",
            padding: 5,
            flexShrink: 0,
          }}
        />
        <div>
          <div style={{ color: "#fff", fontFamily: font.display, fontSize: 14, lineHeight: 1.3 }}>
            Si Lapak Priok
          </div>
          <div style={{ color: "#93ACD1", fontSize: 10, fontFamily: font.mono }}>
            Tamu &amp; Paket
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
        {ITEMS.map((m) => {
          const Icon = m.icon;
          const isActive = active === m.key;
          return (
            <button
              key={m.key}
              onClick={() => onSelect(m.key)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                marginBottom: 3,
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                background: isActive ? "rgba(255,199,44,0.14)" : "transparent",
                color: isActive ? T.yellow : "#B9C9E1",
                fontWeight: isActive ? 700 : 500,
                fontSize: 13.5,
                fontFamily: font.body,
                borderLeft: isActive ? `3px solid ${T.yellow}` : "3px solid transparent",
                textAlign: "left",
              }}
              onMouseEnter={(e) => !isActive && (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
              onMouseLeave={(e) => !isActive && (e.currentTarget.style.background = "transparent")}
            >
              <Icon size={17} style={{ flexShrink: 0 }} />
              <span>{m.label}</span>
            </button>
          );
        })}
      </nav>

      <div style={{ padding: 14, borderTop: "1px solid #12294A" }}>
        <button
          onClick={onLogout}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            justifyContent: "center",
            padding: "9px 12px",
            borderRadius: 8,
            border: "1px solid #1C4A7C",
            background: "transparent",
            color: "#B9C9E1",
            cursor: "pointer",
            fontSize: 12.5,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(196,67,43,0.18)";
            e.currentTarget.style.color = "#FF9D89";
            e.currentTarget.style.borderColor = "#7A2E20";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#B9C9E1";
            e.currentTarget.style.borderColor = "#1C4A7C";
          }}
        >
          <LogOut size={15} /> Keluar
        </button>
      </div>
    </aside>
  );
}
