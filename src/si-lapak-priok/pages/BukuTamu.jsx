import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { T } from "../../lib/theme";
import { uidSilapak } from "../../lib/siLapakPriokData";

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  border: `1px solid ${T.border}`,
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 12.5,
  color: T.text,
  background: T.card,
  outline: "none",
};
const fieldLabel = { display: "block", fontSize: 11.5, fontWeight: 600, color: T.text, marginBottom: 6 };

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function nowHM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function BukuTamu({ onBack, onSaved }) {
  const [tanggal, setTanggal] = useState(todayISO());
  const [jam, setJam] = useState(nowHM());
  const [namaTamu, setNamaTamu] = useState("");
  const [tujuan, setTujuan] = useState("");
  const [pegawai, setPegawai] = useState("");

  const submit = () => {
    if (!tanggal || !jam || !namaTamu.trim() || !tujuan.trim() || !pegawai.trim()) return;
    onSaved({
      id: uidSilapak("TMU"),
      tanggal,
      jam,
      namaTamu: namaTamu.trim(),
      tujuan: tujuan.trim(),
      pegawai: pegawai.trim(),
      tanggalKey: new Date(tanggal).toDateString(),
    });
    setNamaTamu("");
    setTujuan("");
    setPegawai("");
    setTanggal(todayISO());
    setJam(nowHM());
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <button type="button" onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: T.muted, fontSize: 12, cursor: "pointer", marginBottom: 16, padding: 0 }}>
        <ArrowLeft size={14} /> Kembali
      </button>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: T.heading, margin: "0 0 20px" }}>Buku tamu</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label style={fieldLabel}>Tanggal kunjungan <span style={{ color: "#D14343" }}>*</span></label>
          <input type="date" style={inputStyle} value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
        </div>
        <div>
          <label style={fieldLabel}>Jam kunjungan <span style={{ color: "#D14343" }}>*</span></label>
          <input type="time" style={inputStyle} value={jam} onChange={(e) => setJam(e.target.value)} />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={fieldLabel}>Nama tamu <span style={{ color: "#D14343" }}>*</span></label>
          <input style={inputStyle} value={namaTamu} onChange={(e) => setNamaTamu(e.target.value)} placeholder="Contoh: Andi Wijaya" />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={fieldLabel}>Tujuan kunjungan <span style={{ color: "#D14343" }}>*</span></label>
          <input style={inputStyle} value={tujuan} onChange={(e) => setTujuan(e.target.value)} placeholder="Contoh: Rapat proposal CSR" />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={fieldLabel}>Pegawai yang dituju <span style={{ color: "#D14343" }}>*</span></label>
          <input style={inputStyle} value={pegawai} onChange={(e) => setPegawai(e.target.value)} placeholder="Nama pegawai" />
        </div>
      </div>

      <button
        type="button"
        onClick={submit}
        style={{ marginTop: 20, padding: "11px 28px", borderRadius: 8, border: "none", background: T.navy, color: "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}
      >
        Simpan kunjungan
      </button>
    </div>
  );
}
