import { useState } from "react";
import { Save } from "lucide-react";
import { T, font } from "../../lib/theme";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";

const EMPTY = { nomorPR: "", nomorPO: "", idBast: "", idBapb: "" };

/**
 * Alur PO beda dari NON PO/CC — ada proses ERP (Nomor PR -> diproses PCR -> Nomor PO),
 * dan begitu kerjaan selesai, BAST + BAPB dibuat di luar sistem (di ERP) - yang perlu
 * dicatat di sini cukup Nomor PR/PO dan ID BAST/BAPB-nya, bukan dokumen lengkap.
 */
export default function PoErpDataPage({ rab, notify }) {
  const [dataByRab, setDataByRab] = useState({});
  const [activeRab, setActiveRab] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const select = (r) => {
    setActiveRab(r);
    setForm(dataByRab[r.idNumber] || EMPTY);
  };

  const save = () => {
    if (!activeRab) return;
    setDataByRab((prev) => ({ ...prev, [activeRab.idNumber]: form }));
    notify?.(`Data ERP untuk ${activeRab.idNumber} disimpan.`, "success", "Data PO");
  };

  const inputStyle = {
    width: "100%", padding: "10px 12px", borderRadius: 8,
    border: `1px solid ${T.border}`, background: T.inputBg,
    fontSize: 13, color: T.text, boxSizing: "border-box",
  };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: T.heading, marginBottom: 5, display: "block" };

  return (
    <div>
      <PageHeader
        eyebrow="Pembayaran - PO"
        title="BAST & BAPB (Data ERP)"
        description="Catat Nomor PR & Nomor PO dari ERP, lalu setelah pekerjaan selesai dan BAST/BAPB dibuat di ERP, input ID BAST dan ID BAPB-nya di sini."
      />

      <div style={{ display: "grid", gridTemplateColumns: "minmax(220px, 280px) minmax(0, 1fr)", gap: 16 }} className="responsive-two-col">
        <Card>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.heading, marginBottom: 10 }}>Pilih RAB (PO)</div>
          {!rab?.length ? (
            <div style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.55 }}>
              Belum ada RAB kategori PO.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 6 }}>
              {rab.map((r) => {
                const isActive = activeRab?.idNumber === r.idNumber;
                const hasSaved = !!dataByRab[r.idNumber];
                return (
                  <button key={r.idNumber} onClick={() => select(r)} style={{
                    padding: "10px 12px", borderRadius: 8, textAlign: "left",
                    border: `1px solid ${isActive ? T.blue : T.border}`,
                    background: isActive ? T.blueSoft : T.bg,
                    color: T.text, cursor: "pointer", minWidth: 0,
                  }}>
                    <div style={{ fontFamily: font.mono, fontWeight: 700, color: T.blue, fontSize: 12 }}>{r.idNumber}</div>
                    <div style={{ fontSize: 11.5, color: T.muted, marginTop: 3, lineHeight: 1.45, overflowWrap: "anywhere" }}>
                      {r.judulKegiatan}{hasSaved && <span style={{ color: "#1E7F3E", fontWeight: 700 }}> · tersimpan</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        <Card>
          {!activeRab ? (
            <div style={{ padding: "34px 10px", textAlign: "center", color: T.muted, fontSize: 13.5, lineHeight: 1.6 }}>
              Pilih RAB di sebelah kiri untuk mengisi data ERP.
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: 17 }}>
                <div style={{ fontFamily: font.mono, fontSize: 12, fontWeight: 700, color: T.blue }}>{activeRab.idNumber}</div>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: T.heading, marginTop: 3 }}>{activeRab.judulKegiatan}</div>
              </div>

              <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>
                Proses Pengadaan (ERP)
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 13, marginBottom: 20 }}>
                <div>
                  <label style={labelStyle}>Nomor PR</label>
                  <input style={inputStyle} value={form.nomorPR} onChange={(e) => set("nomorPR", e.target.value)} placeholder="Nomor PR dari ERP" />
                </div>
                <div>
                  <label style={labelStyle}>Nomor PO</label>
                  <input style={inputStyle} value={form.nomorPO} onChange={(e) => set("nomorPO", e.target.value)} placeholder="Diisi setelah PR diproses PCR & nomor PO terbit" />
                </div>
              </div>

              <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>
                Setelah Pekerjaan Selesai
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 13 }}>
                <div>
                  <label style={labelStyle}>ID BAST</label>
                  <input style={inputStyle} value={form.idBast} onChange={(e) => set("idBast", e.target.value)} placeholder="ID dokumen BAST dari ERP" />
                </div>
                <div>
                  <label style={labelStyle}>ID BAPB</label>
                  <input style={inputStyle} value={form.idBapb} onChange={(e) => set("idBapb", e.target.value)} placeholder="ID dokumen BAPB (Berita Acara Pemeriksaan Barang) dari ERP" />
                </div>
              </div>

              <div style={{ marginTop: 18 }}>
                <button onClick={save} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "9px 15px", borderRadius: 8, border: "none",
                  background: T.blue, color: "#fff", cursor: "pointer", fontSize: 12.5, fontWeight: 700,
                }}><Save size={14} /> Simpan</button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
