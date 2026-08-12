import { useState } from "react";
import { Download, Save } from "lucide-react";
import { T, font } from "../../lib/theme";
import { uid, rupiah } from "../../lib/utils";
import { generateDocxFromTemplate, formatTanggalPanjang } from "../../lib/docxGenerate";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";

const EMPTY = {
  nomorVerifikasi: "",
  tanggal: "",
  kegiatan: "",
  jumlahBiaya: "",
  terbilang: "",
  kepada: "",
};

export default function FormVerifikasiPage({ rab, notify }) {
  const [forms, setForms] = useState([]);
  const [activeRab, setActiveRab] = useState(null);
  const [formData, setFormData] = useState(EMPTY);

  const set = (k, v) => setFormData((p) => ({ ...p, [k]: v }));

  const inputStyle = {
    width: "100%", padding: "10px 12px", borderRadius: 8,
    border: `1px solid ${T.border}`, background: T.inputBg,
    fontSize: 13, color: T.text, boxSizing: "border-box",
  };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: T.heading, marginBottom: 5, display: "block" };

  const loadForm = (r) => {
    setActiveRab(r);
    const existing = forms.find((f) => f.rabId === r.idNumber);
    if (existing) {
      setFormData({
        nomorVerifikasi: existing.nomorVerifikasi || "",
        tanggal: existing.tanggal || "",
        kegiatan: existing.kegiatan || r.judulKegiatan || "",
        jumlahBiaya: existing.jumlahBiaya || r.totalEvaluasi || "",
        terbilang: existing.terbilang || "",
        kepada: existing.kepada || "",
      });
      return;
    }
    setFormData({
      ...EMPTY,
      kegiatan: r.judulKegiatan || "",
      jumlahBiaya: r.totalEvaluasi || "",
      kepada: "Manager Administrasi UBP Priok",
    });
  };

  const handleSave = () => {
    if (!activeRab) return;
    const existing = forms.find((f) => f.rabId === activeRab.idNumber);
    if (existing) {
      setForms((prev) => prev.map((f) => f.rabId === activeRab.idNumber ? { ...f, ...formData, updatedAt: new Date().toISOString() } : f));
    } else {
      setForms((prev) => [...prev, {
        id: uid("VRF"), rabId: activeRab.idNumber, ...formData, createdAt: new Date().toISOString(),
      }]);
    }
    notify?.("Form verifikasi disimpan.", "success", "Form Verifikasi disimpan");
  };

  const handleDownload = async () => {
    if (!activeRab) return;
    try {
      await generateDocxFromTemplate(
        "/templates/Template_Verifikasi.docx",
        {
          nomorVerifikasi: formData.nomorVerifikasi || "",
          tanggal: formatTanggalPanjang(formData.tanggal),
          kegiatan: formData.kegiatan || activeRab.judulKegiatan || "",
          jumlahBiaya: formData.jumlahBiaya ? rupiah(Number(formData.jumlahBiaya)) : "",
          terbilang: formData.terbilang || "",
          kepada: formData.kepada || "",
        },
        `Form-Verifikasi-${activeRab.idNumber}.docx`
      );
      notify?.("Form verifikasi berhasil dibuat dari data sistem.", "success");
    } catch (e) {
      notify?.(`Gagal membuat Form Verifikasi: ${e.message}`, "error");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Dokumen Pembayaran"
        title="Form Verifikasi"
        description="Format pengisian disesuaikan dengan Formulir Verifikasi resmi dan tetap mengambil konteks pekerjaan dari RAB yang dipilih."
      />

      <div style={{ display: "grid", gridTemplateColumns: "minmax(220px, 280px) minmax(0, 1fr)", gap: 16 }} className="responsive-two-col">
        <Card>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.heading, marginBottom: 10 }}>Pilih RAB / Pekerjaan</div>
          {!rab?.length ? (
            <div style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.55 }}>Belum ada RAB.</div>
          ) : (
            <div style={{ display: "grid", gap: 6 }}>
              {rab.map((r) => {
                const isActive = activeRab?.idNumber === r.idNumber;
                const hasSaved = forms.some((f) => f.rabId === r.idNumber);
                return (
                  <button key={r.idNumber} onClick={() => loadForm(r)} style={{
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
              Pilih RAB di sebelah kiri untuk mengisi Form Verifikasi.
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: 17 }}>
                <div style={{ fontFamily: font.mono, fontSize: 12, fontWeight: 700, color: T.blue }}>{activeRab.idNumber}</div>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: T.heading, marginTop: 3, lineHeight: 1.45 }}>{activeRab.judulKegiatan}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 13 }}>
                <div>
                  <label style={labelStyle}>Nomor Verifikasi</label>
                  <input style={inputStyle} value={formData.nomorVerifikasi} onChange={(e) => set("nomorVerifikasi", e.target.value)} placeholder="Nomor verifikasi" />
                </div>
                <div>
                  <label style={labelStyle}>Tanggal</label>
                  <input style={inputStyle} type="date" value={formData.tanggal} onChange={(e) => set("tanggal", e.target.value)} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Kegiatan</label>
                  <input style={inputStyle} value={formData.kegiatan} onChange={(e) => set("kegiatan", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Jumlah Biaya</label>
                  <input style={inputStyle} type="number" value={formData.jumlahBiaya} onChange={(e) => set("jumlahBiaya", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Terbilang</label>
                  <input style={inputStyle} value={formData.terbilang} onChange={(e) => set("terbilang", e.target.value)} placeholder="Contoh: lima belas juta rupiah" />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Kepada</label>
                  <input style={inputStyle} value={formData.kepada} onChange={(e) => set("kepada", e.target.value)} />
                </div>
              </div>

              <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginTop: 18 }}>
                <button onClick={handleSave} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "9px 15px", borderRadius: 8, border: "none",
                  background: T.blue, color: "#fff", cursor: "pointer", fontSize: 12.5, fontWeight: 700,
                }}><Save size={14} /> Simpan</button>
                <button onClick={handleDownload} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "9px 15px", borderRadius: 8, border: `1px solid ${T.border}`,
                  background: T.card, color: T.heading, cursor: "pointer", fontSize: 12.5, fontWeight: 700,
                }}><Download size={14} /> Download Word</button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
