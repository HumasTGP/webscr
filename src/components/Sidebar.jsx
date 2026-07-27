import { useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { T, font } from "../lib/theme";
import { MENU, MENU_GROUPS, ROLES } from "../lib/data";
import { roleInitials } from "../lib/utils";
import Badge from "./Badge";
import AutoLogo from "./AutoLogo";

const fade = (collapsed, extra = {}) => ({
  opacity: collapsed ? 0 : 1,
  maxWidth: collapsed ? 0 : 200,
  overflow: "hidden",
  whiteSpace: "nowrap",
  transition: "opacity .15s ease, max-width .15s ease",
  ...extra,
});

function groupMenu() {
  return MENU_GROUPS.map((g) => ({
    ...g,
    items: MENU.filter((m) => m.group === g.key),
  })).filter((g) => g.items.length > 0);
}

function CollapsedDivider() {
  return (
    <div
      style={{
        height: 1,
        margin: "10px 18px",
        background: "rgba(255,255,255,0.08)",
      }}
    />
  );
}

export default function Sidebar({
  active,
  onSelect,
  user,
  onLogout,
  collapsed,
  setCollapsed,
}) {
  const groups = groupMenu();

  const [openGroups, setOpenGroups] = useState(() => {
    const initial = {};
    groupMenu().forEach((g) => {
      initial[g.key] = g.items.some((m) => m.key === active);
    });
    return initial;
  });
  const toggleGroup = (key) =>
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <aside
      style={{
        width: collapsed ? 76 : 240,
        height: "100vh",
        position: "sticky",
        top: 0,
        background: T.navyDeep,
        display: "flex",
        flexDirection: "column",
        transition: "width .18s ease",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: collapsed ? "column" : "row",
          alignItems: "center",
          gap: 10,
          padding: collapsed ? "18px 10px" : "20px 18px",
          borderBottom: "1px solid #12294A",
          transition: "padding .18s ease",
        }}
      >
        <AutoLogo
          alt="Logo PLN"
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            background: "#fff",
            objectFit: "contain",
            padding: 5,
            flexShrink: 0,
          }}
        />
        <div style={fade(collapsed, { flex: collapsed ? "none" : 1 })}>
          <div
            style={{
              color: "#fff",
              fontFamily: font.display,
              fontSize: 15,
              lineHeight: 1.3,
            }}
          >
            SIKAS PLN
          </div>
          <div
            style={{
              color: "#93ACD1",
              fontSize: 10.5,
              fontFamily: font.mono,
            }}
          >
            Administrasi Kas
          </div>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Buka sidebar" : "Tutup sidebar"}
          title={collapsed ? "Buka sidebar" : "Tutup sidebar"}
          style={{
            flexShrink: 0,
            width: 30,
            height: 30,
            borderRadius: 8,
            display: "grid",
            placeItems: "center",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid #1C4A7C",
            color: "#93ACD1",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,199,44,0.16)";
            e.currentTarget.style.color = T.yellow;
            e.currentTarget.style.borderColor = T.yellow;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            e.currentTarget.style.color = "#93ACD1";
            e.currentTarget.style.borderColor = "#1C4A7C";
          }}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      <nav
        style={{
          flex: 1,
          padding: "8px 10px 14px",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {groups.map((g, gIdx) => {
          const isOpen = collapsed ? false : !!openGroups[g.key];
          const groupActive = g.items.some((m) => m.key === active);

          return (
            <div key={g.key}>
              {gIdx > 0 && collapsed && <CollapsedDivider />}

              {/* Header grup = tombol dropdown untuk main menu ini */}
              <button
                onClick={() =>
                  collapsed ? onSelect(g.items[0]?.key) : toggleGroup(g.key)
                }
                title={g.label}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: collapsed ? "10px 12px" : "10px 12px 10px 10px",
                  marginTop: gIdx > 0 ? 6 : 0,
                  marginBottom: 2,
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  background: "transparent",
                  justifyContent: collapsed ? "center" : "flex-start",
                }}
              >
                {!collapsed && (
                  <span
                    style={{
                      width: 10,
                      height: 2,
                      borderRadius: 1,
                      background: T.yellow,
                      flexShrink: 0,
                    }}
                  />
                )}
                <span
                  style={fade(collapsed, {
                    flex: 1,
                    maxWidth: collapsed ? 0 : 220,
                    textAlign: "left",
                    fontFamily: font.mono,
                    fontSize: 10.5,
                    letterSpacing: 1.5,
                    color: groupActive ? T.yellow : "#8CA3C7",
                    textTransform: "uppercase",
                  })}
                >
                  {g.label}
                </span>
                {!collapsed && (
                  <ChevronDown
                    size={13}
                    color={groupActive ? T.yellow : "#8CA3C7"}
                    style={{
                      flexShrink: 0,
                      transition: "transform .15s ease",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                )}
              </button>

              {(isOpen || collapsed) && (
                <div style={{ marginBottom: 4 }}>
                  {g.items.map((m) => {
                    const Icon = m.icon;
                    const isActive = active === m.key;
                    return (
                      <button
                        key={m.key}
                        onClick={() => onSelect(m.key)}
                        title={m.label}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "10px 12px",
                          marginBottom: 2,
                          borderRadius: 8,
                          border: "none",
                          cursor: "pointer",
                          background: isActive
                            ? "rgba(255,199,44,0.14)"
                            : "transparent",
                          color: isActive ? T.yellow : "#B9C9E1",
                          fontWeight: isActive ? 700 : 500,
                          fontSize: 13.5,
                          fontFamily: font.body,
                          borderLeft: isActive
                            ? `3px solid ${T.yellow}`
                            : "3px solid transparent",
                          justifyContent: collapsed ? "center" : "flex-start",
                        }}
                        onMouseEnter={(e) =>
                          !isActive &&
                          (e.currentTarget.style.background = "rgba(255,255,255,0.06)")
                        }
                        onMouseLeave={(e) =>
                          !isActive && (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <Icon size={17} style={{ flexShrink: 0 }} />
                        <span
                          style={fade(collapsed, { maxWidth: collapsed ? 0 : 180 })}
                        >
                          {m.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div
        style={{
          padding: collapsed ? "14px 10px" : 14,
          borderTop: "1px solid #12294A",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: collapsed ? "column" : "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: T.yellow,
              color: T.navyDeep,
              display: "grid",
              placeItems: "center",
              fontFamily: font.display,
              fontWeight: 700,
              fontSize: 12,
              flexShrink: 0,
            }}
          >
            {roleInitials(user.role)}
          </div>

          <div style={fade(collapsed, { flex: collapsed ? "none" : 1 })}>
            <Badge tone="yellow">
              {ROLES.find((r) => r.value === user.role)?.label}
            </Badge>
          </div>

          <button
            onClick={onLogout}
            title="Keluar"
            aria-label="Keluar"
            style={{
              flexShrink: 0,
              width: 32,
              height: 32,
              borderRadius: 8,
              display: "grid",
              placeItems: "center",
              border: "1px solid #1C4A7C",
              background: "transparent",
              color: "#B9C9E1",
              cursor: "pointer",
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
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
