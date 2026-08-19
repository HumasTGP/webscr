import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { T, font } from "../lib/theme";

const MONTHS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
const DOW = ["M", "S", "S", "R", "K", "J", "S"];

function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function parseDateStr(s) {
  if (!s) return null;
  const [y, m, d] = String(s).split("-").map(Number);
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d);
  return Number.isNaN(dt.getTime()) ? null : dt;
}
function displayLabel(s) {
  const d = parseDateStr(s);
  if (!d) return "";
  return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Date picker kalender kustom (sesuai wireframerab.html/wireframetor.html — dpInit/
 * dpToggle/dpNav/dpRender/dpSelect direplika sebagai komponen React). Reusable di
 * semua field tanggal yang perlu input manual (RAB, TOR, NON PO dst). Value/onChange
 * pakai string "YYYY-MM-DD", drop-in.
 */
export default function DatePicker({ value, onChange, placeholder = "Pilih tanggal", disabled }) {
  const [open, setOpen] = useState(false);
  const selected = parseDateStr(value);
  const [viewDate, setViewDate] = useState(() => selected || new Date());
  const [pos, setPos] = useState({ top: 0, left: 0, width: 250 });
  const fieldRef = useRef(null);
  const popupRef = useRef(null);

  const recalcPos = () => {
    const r = fieldRef.current?.getBoundingClientRect();
    if (!r) return;
    const w = 250;
    let left = r.left;
    if (left + w > window.innerWidth - 8) left = Math.max(8, window.innerWidth - w - 8);
    setPos({ top: r.bottom + 6, left, width: w });
  };

  useLayoutEffect(() => { if (open) recalcPos(); /* eslint-disable-next-line */ }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (
        fieldRef.current && !fieldRef.current.contains(e.target) &&
        popupRef.current && !popupRef.current.contains(e.target)
      ) setOpen(false);
    };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", recalcPos, true);
    window.addEventListener("resize", recalcPos);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", recalcPos, true);
      window.removeEventListener("resize", recalcPos);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const toggle = () => {
    if (disabled) return;
    if (!open) setViewDate(selected || new Date());
    setOpen((o) => !o);
  };
  const pick = (d) => { onChange(toDateStr(d)); setOpen(false); };
  const goMonth = (delta) => setViewDate((v) => new Date(v.getFullYear(), v.getMonth() + delta, 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // Senin di depan
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div ref={fieldRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        style={{
          width: "100%", boxSizing: "border-box",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "9px 11px", borderRadius: 8,
          border: `1px solid ${T.border}`,
          background: disabled ? T.bg : "#fbfdfe",
          color: value ? T.text : T.muted,
          fontSize: 13, fontFamily: font.body, textAlign: "left",
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        <span>{value ? displayLabel(value) : placeholder}</span>
        <Calendar size={15} color={disabled ? T.muted : T.blue} style={{ flexShrink: 0 }} />
      </button>

      {open && createPortal(
        <div
          ref={popupRef}
          style={{
            position: "fixed", zIndex: 1000, top: pos.top, left: pos.left, width: pos.width,
            background: T.card, border: `1px solid ${T.border}`, borderRadius: 10,
            boxShadow: T.shadowLg, padding: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <button type="button" onClick={() => goMonth(-1)} style={navBtn} aria-label="Bulan sebelumnya"><ChevronLeft size={14} /></button>
            <span style={{ fontFamily: font.display, fontWeight: 700, fontSize: 13, color: T.heading }}>{MONTHS_ID[month]} {year}</span>
            <button type="button" onClick={() => goMonth(1)} style={navBtn} aria-label="Bulan berikutnya"><ChevronRight size={14} /></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, fontSize: 11.5, textAlign: "center", marginBottom: 2 }}>
            {DOW.map((d, i) => <div key={i} style={{ color: T.muted, fontWeight: 700, padding: "4px 0" }}>{d}</div>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
            {cells.map((d, i) => {
              if (!d) return <div key={i} />;
              const dt = new Date(year, month, d);
              const isSel = selected && toDateStr(selected) === toDateStr(dt);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => pick(dt)}
                  style={{
                    border: "none", background: isSel ? T.blue : "transparent",
                    color: isSel ? "#fff" : T.text, fontWeight: isSel ? 700 : 400,
                    padding: "6px 0", borderRadius: 6, cursor: "pointer", fontSize: 12,
                  }}
                  onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = T.blueSoft; }}
                  onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = "transparent"; }}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

const navBtn = {
  border: "none", background: "var(--bg)", width: 24, height: 24, borderRadius: 6,
  cursor: "pointer", color: "var(--heading)", display: "grid", placeItems: "center",
};
