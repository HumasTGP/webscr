import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { T, font } from "../lib/theme";
import EmptyState from "./EmptyState";

export default function DataTable({
  columns,
  rows,
  emptyLabel,
  onRowClick,
  searchable = true,
  searchPlaceholder = "Cari data…",
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) =>
      columns.some((c) => String(r[c.key] ?? "").toLowerCase().includes(q))
    );
  }, [rows, query, columns]);

  return (
    <div>
      {searchable && rows.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "12px 16px",
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <div style={{ position: "relative", width: 280, maxWidth: "100%" }}>
            <Search
              size={14}
              color={T.muted}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              style={{
                width: "100%",
                padding: "9px 12px 9px 34px",
                borderRadius: 8,
                border: `1px solid ${T.border}`,
                background: T.bg,
                color: T.text,
                fontSize: 13,
                fontFamily: font.body,
              }}
            />
          </div>
          <span style={{ fontSize: 12, color: T.muted, whiteSpace: "nowrap" }}>
            {filtered.length} dari {rows.length} baris
          </span>
        </div>
      )}

      {!filtered.length ? (
        <EmptyState
          label={rows.length ? "Tidak ada hasil yang cocok dengan pencarian." : emptyLabel}
        />
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    style={{
                      textAlign: "left",
                      padding: "11px 16px",
                      background: T.bg,
                      borderBottom: `1px solid ${T.border}`,
                      color: T.muted,
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr
                  key={r.id || i}
                  onClick={() => onRowClick && onRowClick(r)}
                  style={{
                    cursor: onRowClick ? "pointer" : "default",
                    background: i % 2 ? T.rowAlt : T.card,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = T.blueSoft)}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = i % 2 ? T.rowAlt : T.card)
                  }
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      style={{
                        padding: "13px 16px",
                        borderBottom: `1px solid ${T.border}`,
                        color: T.text,
                      }}
                    >
                      {c.render ? c.render(r) : (r[c.key] ?? (
                        <span style={{ color: T.muted }}>-</span>
                      ))}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
