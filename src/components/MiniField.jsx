import { T } from "../lib/theme";

export const miniInputStyle = {
  padding: "9px 10px",
  borderRadius: 7,
  border: `1px solid ${T.border}`,
  background: T.inputBg,
  color: T.text,
  fontSize: 13,
  width: "100%",
};

export default function MiniField({ label, children, full }) {
  return (
    <div
      style={{
        flex: full ? "1 1 100%" : "1 1 170px",
        maxWidth: full ? "100%" : 240,
        minWidth: 0,
      }}
    >
      <label
        style={{
          display: "block",
          fontSize: 11.5,
          fontWeight: 600,
          color: T.muted,
          marginBottom: 5,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
