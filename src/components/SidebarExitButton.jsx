import { LogOut } from "lucide-react";
import { T, font } from "../lib/theme";

export default function SidebarExitButton({ onClick, compact = false }) {
  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        title="Keluar"
        aria-label="Keluar"
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          border: "1px solid #F2B8B8",
          background: "#FFF5F5",
          color: "#CF0000",
          cursor: "pointer",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        <LogOut size={16} />
      </button>
    );
  }

  return (
    <div style={{ padding: "12px 14px 14px", borderTop: `1px solid ${T.border}` }}>
      <button
        type="button"
        onClick={onClick}
        className="mobile-hide-sidebar"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 9,
          padding: "9px 12px",
          borderRadius: 10,
          border: "1px solid #F2B8B8",
          background: "#FFF5F5",
          color: "#CF0000",
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 700,
          fontFamily: font.body,
        }}
      >
        <LogOut size={14} />
        <span>Keluar</span>
      </button>
    </div>
  );
}
