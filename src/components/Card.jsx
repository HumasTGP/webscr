import { T } from "../lib/theme";

export default function Card({ children, style, padded = true, ...rest }) {
  return (
    <div
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        padding: padded ? 22 : 0,
        boxShadow: T.shadowSm,
        animation: "fade-in .2s ease",
        transition: "border-color .15s ease, transform .15s ease, box-shadow .15s ease",
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
