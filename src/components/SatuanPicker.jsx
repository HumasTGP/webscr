import { useState } from "react";
import { Plus, Settings, Trash2, X } from "lucide-react";
import { T, font } from "../lib/theme";
import Button from "./Button";
import Modal from "./Modal";

// Satuan bawaan. "faktor" = pengali qty ke jumlah fisik barang
// (mis. 1 lusin = 12 pcs), dipakai buat hitung total baris di RAB/Lampiran 1.
export const DEFAULT_SATUAN = [
  { nama: "Pcs", faktor: 1 },
  { nama: "Unit", faktor: 1 },
  { nama: "Lot", faktor: 1 },
  { nama: "Set", faktor: 1 },
  { nama: "Paket", faktor: 1 },
  { nama: "Lusin", faktor: 12 },
  { nama: "Kodi", faktor: 20 },
  { nama: "Gross", faktor: 144 },
];

const defaultInputStyle = {
  width: "100%", boxSizing: "border-box", padding: "9px 11px", borderRadius: 8,
  border: `1px solid ${T.border}`, background: "#fbfdfe", color: T.text, fontSize: 13, fontFamily: font.body,
};

// Dropdown satuan + tombol "add new" inline + tombol buka pengaturan konversi.
export function SatuanSelect({ value, satuanList, setSatuanList, onChange, onOpenSettings, inputStyle = defaultInputStyle }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  if (adding) {
    return (
      <div style={{ display: "flex", gap: 6 }}>
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Nama satuan baru…"
          style={{ ...inputStyle, flex: 1 }}
        />
        <button
          type="button"
          onClick={() => {
            const nama = draft.trim();
            if (!nama) return;
            setSatuanList((prev) => (prev.some((s) => s.nama.toLowerCase() === nama.toLowerCase()) ? prev : [...prev, { nama, faktor: 1 }]));
            onChange(nama);
            setDraft("");
            setAdding(false);
          }}
          style={{ flexShrink: 0, padding: "0 12px", borderRadius: 8, border: "none", background: T.blue, color: "#fff", cursor: "pointer", fontSize: 12.5, fontWeight: 700 }}
        >Simpan</button>
        <button type="button" onClick={() => { setAdding(false); setDraft(""); }} style={{ flexShrink: 0, width: 34, borderRadius: 8, border: `1px solid ${T.border}`, background: "#fff", color: T.muted, cursor: "pointer" }}>
          <X size={14} style={{ margin: "0 auto" }} />
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 6 }}>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
        <option value="">- Pilih satuan -</option>
        {satuanList.map((s) => <option key={s.nama} value={s.nama}>{s.nama}{s.faktor !== 1 ? ` (x${s.faktor})` : ""}</option>)}
      </select>
      <button type="button" title="Tambah satuan baru" onClick={() => setAdding(true)} style={{ flexShrink: 0, width: 34, borderRadius: 8, border: `1px solid ${T.border}`, background: T.bg, color: T.blue, cursor: "pointer", display: "grid", placeItems: "center" }}>
        <Plus size={15} />
      </button>
      <button type="button" title="Atur satuan & konversi" onClick={onOpenSettings} style={{ flexShrink: 0, width: 34, borderRadius: 8, border: `1px solid ${T.border}`, background: T.bg, color: T.muted, cursor: "pointer", display: "grid", placeItems: "center" }}>
        <Settings size={14} />
      </button>
    </div>
  );
}

// Modal kelola daftar satuan: ubah nama & faktor konversi, hapus, atau tambah baru.
// key={satuanList.length + "-" + open} di titik pemanggilan bikin state rows
// selalu mulai fresh dari satuanList terbaru tiap kali modal dibuka.
export function SatuanSettingsModal({ open, onClose, satuanList, setSatuanList, inputStyle = defaultInputStyle }) {
  const [rows, setRows] = useState(satuanList);
  const [newNama, setNewNama] = useState("");
  const [newFaktor, setNewFaktor] = useState("1");

  const updateRow = (i, key, val) => setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)));
  const removeRow = (i) => setRows((prev) => prev.filter((_, idx) => idx !== i));
  const addRow = () => {
    const nama = newNama.trim();
    if (!nama) return;
    if (rows.some((r) => r.nama.toLowerCase() === nama.toLowerCase())) return;
    setRows((prev) => [...prev, { nama, faktor: Number(newFaktor) || 1 }]);
    setNewNama("");
    setNewFaktor("1");
  };
  const save = () => {
    const cleaned = rows
      .map((r) => ({ nama: r.nama.trim(), faktor: Number(r.faktor) || 1 }))
      .filter((r) => r.nama);
    setSatuanList(cleaned.length ? cleaned : DEFAULT_SATUAN);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Atur Satuan & Konversi" icon={Settings} width={520}>
      <p style={{ color: T.muted, fontSize: 12.5, marginBottom: 14, lineHeight: 1.6 }}>
        Faktor konversi dipakai buat ngitung total baris. Cth: 1 Lusin = 12, jadi qty 5 Lusin dihitung 5 x 12 x harga satuan. Satuan biasa (Pcs, Unit, dst) faktornya 1.
      </p>
      <div style={{ display: "grid", gap: 8, maxHeight: 260, overflowY: "auto", marginBottom: 14 }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 90px 30px", gap: 8, alignItems: "center" }}>
            <input value={r.nama} onChange={(e) => updateRow(i, "nama", e.target.value)} style={inputStyle} />
            <input type="number" min="1" value={r.faktor} onChange={(e) => updateRow(i, "faktor", e.target.value)} style={inputStyle} />
            <button type="button" onClick={() => removeRow(i)} title="Hapus" style={{ border: "none", background: "transparent", color: T.danger, cursor: "pointer" }}><Trash2 size={15} /></button>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 90px auto", gap: 8, alignItems: "center", marginBottom: 20, borderTop: `1px dashed ${T.border}`, paddingTop: 14 }}>
        <input value={newNama} onChange={(e) => setNewNama(e.target.value)} placeholder="Satuan baru…" style={inputStyle} />
        <input type="number" min="1" value={newFaktor} onChange={(e) => setNewFaktor(e.target.value)} style={inputStyle} />
        <Button variant="ghost" icon={Plus} onClick={addRow}>Tambah</Button>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <Button variant="ghost" onClick={onClose}>Batal</Button>
        <Button onClick={save}>Simpan Perubahan</Button>
      </div>
    </Modal>
  );
}

// PPN dihitung dari base (qty x faktor satuan x harga satuan), baru
// ditambahkan ke base itu buat dapet total baris. "11%" -> base * 1.11.
export function hitungTotalDenganSatuan({ qty, satuan, harga, ppn }, satuanList) {
  const faktor = satuanList.find((s) => s.nama === satuan)?.faktor || 1;
  const base = (Number(qty) || 0) * faktor * (Number(harga) || 0);
  const ppnRate = ppn === "11%" ? 0.11 : 0;
  const ppnNilai = base * ppnRate;
  const total = base + ppnNilai;
  return { base, ppnNilai, total, faktor };
}
