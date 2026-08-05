import { useState } from "react";
import { FilePlus, Save, Printer } from "lucide-react";
import { T, font } from "../../lib/theme";
import { uid } from "../../lib/utils";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";

export default function FormVerifikasiPage({ rab, notify }) {
  const [forms, setForms] = useState([]);

  const [activeRab, setActiveRab] = useState(null);
  const [formData, setFormData] = useState({
    tpb: "", procost: "", nomorSPK: "", tanggalSPK: "",
    nilaiKontrak: "", keterangan: "",
  });

  const set = (k, v) => setFormData((p) => ({ ...p, [k]: v }));

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    border: `1px solid ${T.border}`, background: T.inputBg,
    fontSize: 13, color: T.text, boxSizing: "border-box",
  };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: T.heading, marginBottom: 4, display: "block" };

  const handleSave = () => {
    if (!activeRab) return;
    const existing = forms.find((f) => f.rabId === activeRab.idNumber);
    if (existing) {
      setForms((prev) => prev.map((f) => f.rabId === activeRab.idNumber ? { ...f, ...formData, updatedAt: new Date().toISOString() } : f));
    } else {
      setForms((prev) => [...prev, {
        id: uid("VRF"),
        rabId: activeRab.idNumber,
        ...formData,
        createdAt: new Date().toISOString(),
      }]);
    }
    if (notify) notify("Form verifikasi disimpan.", "success", "Form Verifikasi disimpan");
  };

  const loadForm = (r) => {
    setActiveRab(r);
    const existing = forms.find((f) => f.rabId === r.idNumber);
    if (existing) {
      setFormData({
        tpb: existing.tpb || "", procost: existing.procost || "",
        nomorSPK: existing.nomorSPK || "", tanggalSPK: existing.tanggalSPK || "",
        nilaiKontrak: existing.nilaiKontrak || "", keterangan: existing.keterangan || "",
      });
    } else {
      setFormData({ tpb: "", procost: "", nomorSPK: "", tanggalSPK: "", nilaiKontrak: "", keterangan: "" });
    }
  };

  const handlePrint = () => {
    if (!activeRab) return;
    const win = window.open("", "_blank", "width=850,height=960");
    if (!win) return;
    win.document.write(`<!doctype html><html><head><meta charset="utf-8" /><title>Form Verifikasi - ${activeRab.idNumber}</title>
      <style>body{font-family:Arial,sans-serif;padding:32px;color:#111;}h1{font-size:16px;margin:0 0 4px;text-align:center;}
      .sub{text-align:center;color:#555;font-size:12px;margin-bottom:22px;}
      table{width:100%;border-collapse:collapse;font-size:13px;}
      td{padding:8px 12px;border:1px solid #ccc;vertical-align:top;}
      .label{font-weight:600;width:35%;background:#f9f9f9;}</style>
    </head><body>
      <h1>FORM VERIFIKASI</h1>
      <div class="sub">${activeRab.idNumber} - ${activeRab.judulKegiatan}</div>
      <table>
        <tr><td class="label">TPB</td><td>${formData.tpb || "-"}</td></tr>
        <tr><td class="label">Procost</td><td>${formData.procost || "-"}</td></tr>
        <tr><td class="label">Nomor SPK</td><td>${formData.nomorSPK || "-"}</td></tr>
        <tr><td class="label">Tanggal SPK</td><td>${formData.tanggalSPK || "-"}</td></tr>
        <tr><td class="label">Nilai Kontrak</td><td>${formData.nilaiKontrak || "-"}</td></tr>
        <tr><td class="label">Keterangan</td><td>${formData.keterangan || "-"}</td></tr>
      </table>
      <script>window.onload=function(){window.print();};</script>
    </body></html>`);
    win.document.close();
  };

  return (
    <div>
      <PageHeader
        eyebrow="Pembayaran"
        title="Form Verifikasi"
        description="Isi data verifikasi meliputi TPB, Procost, dan dokumen terkait."
      />

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.heading, marginBottom: 10 }}>Pilih RAB</div>
          {(!rab || rab.length === 0) ? (
            <div style={{ fontSize: 12.5, color: T.muted }}>Belum ada RAB.</div>
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
                    cursor: "pointer", fontSize: 12,
                  }}>
                    <div style={{ fontFamily: font.mono, fontWeight: 700, color: T.blue }}>{r.idNumber}</div>
                    <div style={{ fontSize: 11.5, color: T.muted, marginTop: 2 }}>
                      {r.judulKegiatan}
                      {hasSaved && <span style={{ color: "#1E7F3E", fontWeight: 600 }}> (tersimpan)</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        <Card>
          {!activeRab ? (
            <div style={{ padding: "32px 0", textAlign: "center", color: T.muted, fontSize: 14 }}>
              Pilih RAB di sebelah kiri untuk mengisi form verifikasi.
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: font.mono, fontSize: 12, fontWeight: 700, color: T.blue }}>{activeRab.idNumber}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.heading, marginTop: 2 }}>{activeRab.judulKegiatan}</div>
              </div>

              <div style={{ display: "grid", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>TPB</label>
                    <input style={inputStyle} value={formData.tpb} onChange={(e) => set("tpb", e.target.value)} placeholder="Nomor TPB" />
                  </div>
                  <div>
                    <label style={labelStyle}>Procost</label>
                    <input style={inputStyle} value={formData.procost} onChange={(e) => set("procost", e.target.value)} placeholder="Kode Procost" />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Nomor SPK</label>
                    <input style={inputStyle} value={formData.nomorSPK} onChange={(e) => set("nomorSPK", e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Tanggal SPK</label>
                    <input style={inputStyle} type="date" value={formData.tanggalSPK} onChange={(e) => set("tanggalSPK", e.target.value)} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Nilai Kontrak</label>
                  <input style={inputStyle} type="number" value={formData.nilaiKontrak} onChange={(e) => set("nilaiKontrak", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Keterangan</label>
                  <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={formData.keterangan} onChange={(e) => set("keterangan", e.target.value)} />
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                <button onClick={handleSave} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "10px 18px", borderRadius: 8, border: "none",
                  background: T.blue, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600,
                }}><Save size={14} /> Simpan</button>
                <button onClick={handlePrint} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "10px 18px", borderRadius: 8, border: `1px solid ${T.border}`,
                  background: T.card, color: T.heading, cursor: "pointer", fontSize: 13, fontWeight: 600,
                }}><Printer size={14} /> Cetak</button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
