import React from "react";
import { T, font } from "../lib/theme";
import FieldInput from "./FieldInput";

// Kenapa flexbox, bukan grid?
// Kalau grid pakai auto-fit + 1fr, baris terakhir yang jumlah field-nya
// kurang dari kolom penuh akan STRETCH memenuhi lebar container — kolomnya
// jadi lebih besar dari kolom baris di atasnya, dan tidak sejajar.
// Pakai flex + justifyContent center + max-width pada tiap field: baris
// yang kurang otomatis TER-CENTER, ukuran field tetap sama dengan baris
// yang penuh.
export default function FormGrid({ fields, values, onChange, minWidth = 240, align = "center" }) {
  let lastSection = null;
  const firstSection = fields[0]?.section;

  const fieldWrap = (full) => ({
    flex: full ? "1 1 100%" : `1 1 ${minWidth}px`,
    maxWidth: full ? "100%" : 340,
    minWidth: 0,
  });

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "left" ? "flex-start" : "center",
        gap: "18px 16px",
      }}
    >
      {fields.map((f) => {
        const showSection = f.section && f.section !== lastSection;
        lastSection = f.section || lastSection;
        const isFirstSection = f.section === firstSection;

        return (
          <React.Fragment key={f.key}>
            {showSection && (
              <div
                style={{
                  flexBasis: "100%",
                  width: "100%",
                  fontFamily: font.mono,
                  fontSize: 11.5,
                  letterSpacing: 0.6,
                  textTransform: "uppercase",
                  color: T.blue,
                  fontWeight: 700,
                  paddingTop: isFirstSection ? 0 : 14,
                  marginTop: isFirstSection ? 0 : 4,
                  borderTop: isFirstSection ? "none" : `1px dashed ${T.border}`,
                }}
              >
                {f.section}
              </div>
            )}
            <div style={fieldWrap(f.full)}>
              <label
                style={{
                  display: "block",
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: T.text,
                  lineHeight: 1.35,
                  minHeight: 32,
                  marginBottom: 6,
                }}
              >
                {f.label}{" "}
                {f.hint && (
                  <span style={{ fontWeight: 400, color: T.muted }}>({f.hint})</span>
                )}
              </label>
              <FieldInput
                field={f}
                value={values[f.key]}
                onChange={(v) => onChange(f.key, v)}
              />
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function ReviewList({ fields, values }) {
  const hasValue = (v) => (Array.isArray(v) ? v.length > 0 : v);
  const display = (v) => (Array.isArray(v) ? v.join(", ") : String(v));
  const visible = fields.filter((f) => hasValue(values[f.key]));
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "10px 24px",
      }}
    >
      {visible.map((f) => (
        <div
          key={f.key}
          style={{
            flex: "1 1 220px",
            maxWidth: 340,
            minWidth: 0,
            borderBottom: `1px solid ${T.border}`,
            paddingBottom: 8,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: T.muted,
              textTransform: "uppercase",
              letterSpacing: 0.4,
            }}
          >
            {f.label}
          </div>
          <div
            style={{
              fontSize: 14,
              color: T.text,
              fontWeight: 500,
              marginTop: 2,
              overflowWrap: "break-word",
            }}
          >
            {display(values[f.key])}
          </div>
        </div>
      ))}
    </div>
  );
}
