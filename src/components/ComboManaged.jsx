import { useState } from "react";
import { Settings, Trash2, Plus, X } from "lucide-react";
import { T } from "../lib/theme";

/**
 * ComboManaged — select with gear button to open an inline panel for
 * searching, adding, and removing items from a master list.
 *
 * Props:
 *   id        — unique id string for this instance
 *   label     — field label (string)
 *   hint      — optional hint text
 *   value     — currently selected value (string)
 *   options   — master list of option strings
 *   onChange  — (newValue) => void
 *   onOptions — (newOptions) => void — called when master list changes
 *   placeholder — placeholder text for select
 */
export default function ComboManaged({ id, label, hint, value, options = [], onChange, onOptions, placeholder = "Pilih…" }) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [addText, setAddText] = useState("");

  const filtered = search ? options.filter((o) => o.toLowerCase().includes(search.toLowerCase())) : options;

  const addItem = () => {
    const v = addText.trim();
    if (!v || options.includes(v)) return;
    const next = [...options, v];
    onOptions?.(next);
    onChange?.(v);
    setAddText("");
  };

  const removeItem = (item) => {
    const next = options.filter((o) => o !== item);
    onOptions?.(next);
    if (value === item) onChange?.("");
  };

  const selectStyle = {
    flex: 1,
    padding: "9px 11px",
    borderRadius: 8,
    border: `1px solid ${T.border}`,
    background: T.inputBg,
    color: T.text,
    fontSize: 13,
    minWidth: 0,
    fontFamily: "inherit",
  };

  const gearBtnStyle = {
    flexShrink: 0,
    width: 34,
    height: 38,
    borderRadius: 8,
    border: `1px solid ${T.border}`,
    background: T.card,
    color: T.blue,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const panelStyle = {
    marginTop: 8,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    padding: 10,
    background: T.bg,
  };

  const panelInputStyle = {
    flex: 1,
    padding: "7px 9px",
    borderRadius: 6,
    border: `1px solid ${T.border}`,
    fontSize: 12,
    fontFamily: "inherit",
  };

  return (
    <div>
      {label && (
        <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: T.text, marginBottom: 6 }}>
          {label} {hint && <span style={{ fontWeight: 400, color: T.muted }}>{hint}</span>}
        </label>
      )}
      <div style={{ display: "flex", gap: 6 }}>
        <select
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)}
          style={selectStyle}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <button
          type="button"
          style={gearBtnStyle}
          onClick={() => setPanelOpen((v) => !v)}
          title="Kelola pilihan"
        >
          <Settings size={15} />
        </button>
      </div>

      {panelOpen && (
        <div style={panelStyle}>
          {/* Search */}
          {options.length > 5 && (
            <div style={{ marginBottom: 6 }}>
              <input
                placeholder={`Cari… (${options.length} data)`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ ...panelInputStyle, width: "100%", boxSizing: "border-box" }}
              />
            </div>
          )}
          {/* Add row */}
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            <input
              placeholder="Tambah pilihan baru"
              value={addText}
              onChange={(e) => setAddText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
              style={panelInputStyle}
            />
            <button
              type="button"
              onClick={addItem}
              style={{ flexShrink: 0, padding: "0 12px", borderRadius: 6, border: "none", background: T.navy, color: "#fff", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
            >
              <Plus size={13} />
            </button>
          </div>
          {/* List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 160, overflowY: "auto" }}>
            {filtered.length === 0 && (
              <div style={{ fontSize: 12, color: T.muted, textAlign: "center", padding: "8px 0" }}>Belum ada data.</div>
            )}
            {filtered.map((o) => (
              <div
                key={o}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 11.5 }}
              >
                <span style={{ flex: 1, cursor: "pointer", color: value === o ? T.blue : T.text }} onClick={() => { onChange?.(o); setPanelOpen(false); }}>
                  {o}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(o)}
                  style={{ border: "none", background: "transparent", cursor: "pointer", color: T.muted, padding: 2, display: "flex", alignItems: "center" }}
                  title="Hapus"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" onClick={() => { setPanelOpen(false); setSearch(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
              <X size={12} /> Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
