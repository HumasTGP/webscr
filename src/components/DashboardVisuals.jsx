import { ArrowUpRight } from "lucide-react";
import { T, font } from "../lib/theme";

export function DashboardMetricCard({ icon: Icon, label, value, note, color, soft, onClick }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      style={{
        width: "100%",
        minWidth: 0,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "13px 14px",
        borderRadius: 14,
        border: `1px solid ${T.border}`,
        background: T.card,
        color: T.text,
        cursor: onClick ? "pointer" : "default",
        textAlign: "left",
        fontFamily: font.body,
        boxShadow: "0 6px 20px rgba(15,40,70,.04)",
      }}
    >
      <div style={{ width: 38, height: 38, borderRadius: 11, background: soft, color, display: "grid", placeItems: "center", flexShrink: 0 }}>
        <Icon size={18} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
          <div style={{ fontFamily: font.display, fontSize: 24, lineHeight: 1, color: T.heading, fontWeight: 800 }}>{value}</div>
          {onClick && <ArrowUpRight size={14} color={T.muted} />}
        </div>
        <div style={{ marginTop: 5, fontSize: 11.5, fontWeight: 700, color: T.heading, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</div>
        {note && <div style={{ marginTop: 2, fontSize: 10.5, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{note}</div>}
      </div>
    </Tag>
  );
}

export function DashboardTrendCard({ title, subtitle, data, color, emptyLabel = "Belum ada data." }) {
  const safe = Array.isArray(data) ? data.filter((d) => Number.isFinite(Number(d.value))) : [];
  const width = 520;
  const height = 210;
  const pad = { l: 34, r: 18, t: 18, b: 38 };
  const max = Math.max(1, ...safe.map((d) => Number(d.value)));
  const usableW = width - pad.l - pad.r;
  const usableH = height - pad.t - pad.b;
  const points = safe.map((d, i) => {
    const x = safe.length <= 1 ? pad.l + usableW / 2 : pad.l + (i / (safe.length - 1)) * usableW;
    const y = pad.t + usableH - (Number(d.value) / max) * usableH;
    return { ...d, x, y };
  });
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = points.length ? `${path} L${points[points.length - 1].x},${height - pad.b} L${points[0].x},${height - pad.b} Z` : "";

  return (
    <div style={{ border: `1px solid ${T.border}`, background: T.card, borderRadius: 16, padding: "16px 16px 12px", boxShadow: "0 8px 24px rgba(15,40,70,.04)", minWidth: 0 }}>
      <div style={{ fontFamily: font.display, fontSize: 14.5, fontWeight: 800, color: T.heading }}>{title}</div>
      {subtitle && <div style={{ fontSize: 10.8, color: T.muted, marginTop: 3 }}>{subtitle}</div>}
      {points.length === 0 ? (
        <div style={{ height: 210, display: "grid", placeItems: "center", color: T.muted, fontSize: 12 }}>{emptyLabel}</div>
      ) : (
        <div style={{ marginTop: 8, overflow: "hidden" }}>
          <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label={title}>
            {[0, .25, .5, .75, 1].map((r) => {
              const y = pad.t + usableH - usableH * r;
              return <line key={r} x1={pad.l} x2={width - pad.r} y1={y} y2={y} stroke={T.border} strokeWidth="1" opacity=".65" />;
            })}
            {areaPath && <path d={areaPath} fill={color} opacity=".09" />}
            {path && <path d={path} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />}
            {points.map((p) => <circle key={`${p.label}-${p.x}`} cx={p.x} cy={p.y} r="4.5" fill={T.card} stroke={color} strokeWidth="3" />)}
            {points.map((p) => <text key={`label-${p.label}-${p.x}`} x={p.x} y={height - 14} textAnchor="middle" fontSize="10" fill={T.muted}>{p.label}</text>)}
          </svg>
        </div>
      )}
    </div>
  );
}

export function DashboardRecentList({ title, items, emptyLabel = "Belum ada aktivitas.", renderItem }) {
  return (
    <div style={{ border: `1px solid ${T.border}`, background: T.card, borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 24px rgba(15,40,70,.04)" }}>
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}`, fontFamily: font.display, fontSize: 14, fontWeight: 800, color: T.heading }}>{title}</div>
      {items?.length ? items.map((item, index) => <div key={item.id || item.key || index} style={{ padding: "13px 16px", borderBottom: index < items.length - 1 ? `1px solid ${T.border}` : "none" }}>{renderItem(item, index)}</div>) : <div style={{ padding: "28px 16px", textAlign: "center", color: T.muted, fontSize: 12.5 }}>{emptyLabel}</div>}
    </div>
  );
}
