import { FileText, Plus } from "lucide-react";
import { T } from "../lib/theme";
import Button from "./Button";

export default function EmptyState({
  label,
  hint,
  actionLabel,
  onAction,
  icon: Icon = FileText,
}) {
  return (
    <div style={{ padding: "48px 20px", textAlign: "center" }}>
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: 14,
          background: T.blueSoft,
          display: "grid",
          placeItems: "center",
          margin: "0 auto 14px",
          border: `1px solid ${T.border}`,
        }}
      >
        <Icon size={22} color={T.blue} />
      </div>
      <div
        style={{
          fontSize: 14,
          color: T.text,
          fontWeight: 600,
          maxWidth: 340,
          margin: "0 auto",
        }}
      >
        {label || "Belum ada data."}
      </div>
      {hint && (
        <div
          style={{
            fontSize: 12.5,
            color: T.muted,
            marginTop: 6,
            maxWidth: 360,
            margin: "6px auto 0",
            lineHeight: 1.5,
          }}
        >
          {hint}
        </div>
      )}
      {actionLabel && (
        <Button variant="ghost" icon={Plus} style={{ marginTop: 16 }} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
