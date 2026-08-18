import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { T } from "../../lib/theme";
import { EKSPEDISI_OPT } from "../../lib/siLapakPriokData";

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  border: `1px solid ${T.border}`,
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: 12,
  color: T.text,
  background: T.card,
  outline: "none",
};

export default function DataPaket({ paket, onProsesAmbil, onUpdate, onDelete }) {
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState(paket[0]?.id || null);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const filtered = paket.filter(
    (p) => p.namaPenerima.toLowerCase().includes(q.toLowerCase()) || p.noResi.toLowerCase().includes(q.toLowerCase())
  );
  const selected = paket.find((p) => p.id === selectedId) || filtered[0];

  const startEdit = () => { setDraft({ ...selected }); setEditMode(true); };
  const saveEdit = () => { onUpdate(draft); setEditMode(false); };

  return (
    <div>
      {paket.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", color: T.muted }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "#FFF7C2", display: "grid", placeItems: "center", margin: "0 auto 12px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8C7600" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8h14M5 8a2 2 0 1 1 0-4h14a2 2 0 1 1 0 4M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8"/></svg>
          </div>
          <div style={{ fontWeight: 700, fontSize: 13.5, color: "#5B4B00", marginBottom: 4 }}>Belum ada paket</div>
          <div style={{ fontSize: 12 }}>Paket yang tercatat akan muncul di sini.</div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ flex: "1.3 1 340px" }}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama atau nomor resi" style={{ ...inputStyle, padding: "9px 12px", marginBottom: 12 }} />
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead><tr><Th>Nama</Th><Th>Resi</Th><Th>Status</Th></tr></thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} onClick={() => { setSelectedId(p.id); setEditMode(false); }} style={{ cursor: "pointer", background: selected?.id === p.id ? T.blueSoft : "transparent" }}>
                    <Td>{p.namaPenerima}</Td><Td>{p.noResi}</Td><Td><StatusPill status={p.status} /></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selected && (
            <div style={{ flex: "1 1 300px" }}>
              <div style={{ background: T.bg, borderRadius: 12, padding: 18 }}>
                {!editMode ? (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: T.heading }}>{selected.namaPenerima}</div>
                      <div style={{ display: "flex", gap: 6 }}><IconBtn onClick={startEdit} title="Edit"><Pencil size={14} /></IconBtn><IconBtn onClick={() => setConfirmDelete(true)} title="Hapus" danger><Trash2 size={14} /></IconBtn></div>
                    </div>
                    <DetailRow label="Ekspedisi" value={selected.ekspedisi} />
                    <DetailRow label="Nomor resi" value={selected.noResi} />
                    <DetailRow label="Satpam" value={selected.satpam} />
                    <DetailRow label="Diterima" value={`${selected.diterimaTanggal}, ${selected.diterimaJam}`} />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "7px 0" }}><span style={{ color: T.muted }}>Status</span><StatusPill status={selected.status} /></div>
                    {selected.status === "Belum Diambil" && <button type="button" onClick={() => onProsesAmbil(selected)} style={{ width: "100%", marginTop: 12, padding: 10, borderRadius: 8, border: "none", background: T.navy, color: "#fff", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>Proses ambil paket</button>}
                    {confirmDelete && (
                      <div style={{ marginTop: 12, background: "#FBE4E4", border: "1px solid #E8B4B4", borderRadius: 8, padding: 12 }}>
                        <div style={{ fontSize: 11.5, color: "#7A1F1F", marginBottom: 8 }}>Hapus data paket ini? Tindakan tidak dapat dibatalkan.</div>
                        <div style={{ display: "flex", gap: 8 }}><button type="button" onClick={() => { onDelete(selected.id); setConfirmDelete(false); }} style={{ flex: 1, padding: 8, borderRadius: 6, border: "none", background: "#C43A2B", color: "#fff", fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>Hapus</button><button type="button" onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: 8, borderRadius: 6, border: `1px solid ${T.border}`, background: T.card, fontSize: 11.5, cursor: "pointer" }}>Batal</button></div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: T.heading, marginBottom: 12 }}>Edit paket</div>
                    <EditField label="Nama penerima"><input style={inputStyle} value={draft.namaPenerima} onChange={(e) => setDraft({ ...draft, namaPenerima: e.target.value })} /></EditField>
                    <EditField label="Ekspedisi"><select style={inputStyle} value={draft.ekspedisi} onChange={(e) => setDraft({ ...draft, ekspedisi: e.target.value })}>{EKSPEDISI_OPT.map((op) => (<option key={op} value={op}>{op}</option>))}</select></EditField>
                    <EditField label="Nomor resi"><input style={inputStyle} value={draft.noResi} onChange={(e) => setDraft({ ...draft, noResi: e.target.value })} /></EditField>
                    <div style={{ display: "flex", gap: 8, marginTop: 14 }}><button type="button" onClick={saveEdit} style={{ flex: 1, padding: 9, borderRadius: 8, border: "none", background: T.navy, color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Simpan</button><button type="button" onClick={() => setEditMode(false)} style={{ flex: 1, padding: 9, borderRadius: 8, border: `1px solid ${T.border}`, background: T.card, fontSize: 12, cursor: "pointer" }}>Batal</button></div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Th({ children }) { return <th style={{ textAlign: "left", padding: "8px 10px", color: T.muted, fontWeight: 600, borderBottom: `1px solid ${T.border}`, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.03em" }}>{children}</th>; }
function Td({ children }) { return <td style={{ padding: "9px 10px", borderBottom: `1px solid ${T.border}`, color: T.text }}>{children}</td>; }
function DetailRow({ label, value }) { return <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "7px 0", borderBottom: `1px solid ${T.border}` }}><span style={{ color: T.muted }}>{label}</span><span style={{ color: T.text, fontWeight: 500 }}>{value}</span></div>; }
function EditField({ label, children }) { return <div style={{ marginBottom: 10 }}><label style={{ display: "block", fontSize: 10.5, color: T.muted, marginBottom: 4 }}>{label}</label>{children}</div>; }
function IconBtn({ children, onClick, title, danger }) { return <button type="button" onClick={onClick} title={title} style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${T.border}`, background: T.card, color: danger ? "#C43A2B" : T.muted, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>{children}</button>; }
function StatusPill({ status }) { const done = status === "Sudah Diambil"; return <span style={{ display: "inline-block", fontSize: 9.5, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: done ? "#E5F6EF" : "#FDF3DD", color: done ? "#1D9E75" : "#B7791F" }}>{status}</span>; }
