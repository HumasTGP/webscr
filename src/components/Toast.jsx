import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { T, font } from "../lib/theme";

export default function Toast({ toast }) {
  if (!toast) return null;
  const isError = toast.type === "error";
  return (
    <div
      role="status"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 400,
        background: T.card,
        color: T.text,
        padding: "14px 16px",
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 14px 40px rgba(7,27,54,0.22)",
        border: `1px solid ${T.border}`,
        fontFamily: font.body,
        fontSize: 13.5,
        maxWidth: 360,
        animation: "toast-in .25s cubic-bezier(.2,.8,.3,1)",
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          background: isError ? T.dangerSoft : T.successSoft,
        }}
      >
        {isError ? (
          <AlertTriangle size={16} color={T.danger} />
        ) : (
          <CheckCircle2 size={16} color={T.success} />
        )}
      </div>
      <span style={{ fontWeight: 500 }}>{toast.message}</span>
    </div>
  );
}
