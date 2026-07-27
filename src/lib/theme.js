export const font = {
  display: "var(--font-display)",
  body: "var(--font-body)",
  mono: "var(--font-mono)",
};

export const T = {
  bg: "var(--bg)",
  card: "var(--card)",
  inputBg: "var(--input-bg)",
  rowAlt: "var(--row-alt)",
  border: "var(--border)",
  text: "var(--text)",
  muted: "var(--muted)",
  heading: "var(--heading)",
  navy: "var(--navy)",
  blue: "var(--blue)",
  blueSoft: "var(--blue-soft)",
  danger: "var(--danger)",
  dangerSoft: "var(--danger-soft)",
  success: "var(--success)",
  successSoft: "var(--success-soft)",
  topbarBg: "var(--topbar-bg)",

  navyDeep: "#071B36",
  yellow: "#FFC72C",
  yellowDeep: "#E6A700",
  yellowText: "#8A6100",

  shadowSm: "var(--shadow-sm)",
  shadowMd: "var(--shadow-md)",
  shadowLg: "var(--shadow-lg)",
};

export function setTheme(mode) {
  document.documentElement.setAttribute("data-theme", mode);
}
