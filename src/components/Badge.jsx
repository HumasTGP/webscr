import { T, font } from "../lib/theme";

const TONES = {
  blue:    { bg: T.blueSoft,    fg: T.blue },
  yellow:  { bg: "#FFF4D6",     fg: T.yellowText },
  success: { bg: T.successSoft, fg: T.success },
  danger:  { bg: T.dangerSoft,  fg: T.danger },
  muted:   { bg: T.bg,          fg: T.muted },
};

const STATUS_TONE = {
  // Proposal
  "Baru Masuk": "yellow",
  "Ditinjau": "blue",
  "Disetujui": "success",
  "Ditolak": "danger",
  // Mirroring Konten
  "Draft": "muted",
  "Menunggu Review": "yellow",
  "Terjadwal": "blue",
  "Terbit": "success",
  "Dibatalkan": "danger",
};

export default function Badge({ children, tone = "blue", solid = false }) {
  const c = TONES[tone] || TONES.blue;
  return (
    <span
      style={{
        display: "inline-block",
        background: solid ? c.fg : c.bg,
        color: solid ? "#fff" : c.fg,
        fontFamily: font.mono,
        fontSize: 11,
        letterSpacing: 0.4,
        padding: "3px 8px",
        borderRadius: 4,
        fontWeight: 600,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ value, fallback = "muted", solid = false }) {
  if (!value) return null;
  return (
    <Badge tone={STATUS_TONE[value] || fallback} solid={solid}>
      {value}
    </Badge>
  );
}
