import { ChevronRight, HelpCircle } from "lucide-react";
import { T, font } from "../../lib/theme";
import { roleInitials, roleLabel } from "../../lib/utils";

export default function Topbar({ activeLabel, user, onHelpClick }) {
  return (
    <div
      className="app-topbar"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: T.topbarBg,
        backdropFilter: "blur(6px)",
        borderBottom: `1px solid ${T.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        minHeight: 58,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          color: T.muted,
          fontFamily: font.body,
          minWidth: 0,
        }}
      >
        <span className="hide-mobile">SAKTI</span>
        <ChevronRight size={13} className="hide-mobile" />
        <span
          style={{
            color: T.heading,
            fontWeight: 700,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {activeLabel}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        <button
          onClick={onHelpClick}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "transparent",
            border: "none",
            color: T.muted,
            cursor: "pointer",
            fontSize: 13,
            padding: 4,
          }}
        >
          <HelpCircle size={16} /> <span className="hide-mobile">Bantuan</span>
        </button>

        <div className="hide-mobile" style={{ width: 1, height: 20, background: T.border }} />

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: T.navy,
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontSize: 10.5,
              fontFamily: font.display,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {roleInitials(user.role)}
          </div>
          <span
            className="hide-mobile"
            style={{ fontSize: 13, fontWeight: 600, color: T.text }}
          >
            {roleLabel(user.role)}
          </span>
        </div>
      </div>
    </div>
  );
}
