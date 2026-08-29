import { Pencil } from "lucide-react";
import { T, font } from "../lib/theme";
import Modal from "./Modal";
import Button from "./Button";

/**
 * Modal Review read-only — dipakai pas klik baris di daftar (RAB/TOR/NON PO dst).
 * `rows`: array {label, value, full?} buat bagian ringkasan atas.
 * `table`: opsional {title, columns:[{key,label}], data:[...]} buat tabel item.
 * `totals`: opsional array {label, value} buat bar total di bawah tabel.
 */
export default function ReviewModal({
  open, onClose, title, subtitle, rows = [], table, totals, onEdit, editLabel = "Edit ini", width = 560,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} width={width}>
      {subtitle && (
        <p style={{ color: T.muted, fontSize: 12.5, margin: "-8px 0 16px" }}>{subtitle}</p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: "6px 16px", marginBottom: table ? 16 : 4 }}>
        {rows.map((r, i) => (
          <div key={i} style={{ gridColumn: r.full ? "1 / -1" : "auto" }}>
            <div style={{ fontSize: 11, color: T.muted }}>{r.label}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text, overflowWrap: "anywhere" }}>{r.value ?? "-"}</div>
          </div>
        ))}
      </div>

      {table && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.blue, textTransform: "uppercase", letterSpacing: 0.4, margin: "0 0 8px", textAlign: "center" }}>
            {table.title}
          </div>
          <div style={{ border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden", overflowX: "auto", marginBottom: 14 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr>
                  {table.columns.map((c) => (
                    <th key={c.key} style={{
                      background: T.blueSoft, color: T.navy, fontWeight: 700, textAlign: "center",
                      padding: "8px 10px", fontSize: 10.5, textTransform: "uppercase", whiteSpace: "nowrap",
                    }}>{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.data.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 ? T.rowAlt : T.card }}>
                    {table.columns.map((c) => (
                      <td key={c.key} style={{ padding: "8px 10px", borderBottom: `1px solid ${T.border}`, whiteSpace: "nowrap", textAlign: "center" }}>
                        {c.render ? c.render(row) : (row[c.key] ?? "-")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {totals && totals.length > 0 && (
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", background: T.blueSoft, border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 16px", marginBottom: 6 }}>
          {totals.map((t, i) => (
            <div key={i}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.4, color: T.navy, fontWeight: 700 }}>{t.label}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: T.navy, marginTop: 2 }}>{t.value}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18, gap: 10, flexWrap: "wrap" }}>
        <Button variant="ghost" onClick={onClose}>Tutup</Button>
        {onEdit && (
          <Button icon={Pencil} onClick={onEdit}>{editLabel}</Button>
        )}
      </div>
    </Modal>
  );
}
