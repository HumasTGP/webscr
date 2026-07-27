import { T, font } from "../lib/theme";

export default function PageHeader({ eyebrow, title, description, meta, right }) {
  return (
    <div
      className="app-page-header"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 24,
        paddingBottom: 18,
        borderBottom: `1px solid ${T.border}`,
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", gap: 14, alignItems: "stretch", minWidth: 0 }}>
        <div
          style={{
            width: 4,
            borderRadius: 2,
            background: T.blue,
            flexShrink: 0,
            alignSelf: "stretch",
          }}
        />
        <div style={{ minWidth: 0 }}>
          {eyebrow && (
            <span
              style={{
                fontFamily: font.mono,
                fontSize: 10.5,
                color: T.blue,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              {eyebrow}
            </span>
          )}
          <h1
            style={{
              fontFamily: font.display,
              fontSize: 22,
              margin: eyebrow ? "4px 0 0" : 0,
              color: T.heading,
              lineHeight: 1.3,
            }}
          >
            {title}
          </h1>
          {description && (
            <p
              style={{
                color: T.muted,
                marginTop: 4,
                maxWidth: 640,
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              {description}
            </p>
          )}
          {meta && meta.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
              {meta.map((m) => (
                <span
                  key={m.label}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: T.bg,
                    border: `1px solid ${T.border}`,
                    fontSize: 12,
                    color: T.text,
                  }}
                >
                  <span style={{ color: T.muted }}>{m.label}</span>
                  <b style={{ color: T.heading }}>{m.value}</b>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      {right}
    </div>
  );
}
