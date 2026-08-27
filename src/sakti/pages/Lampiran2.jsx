import { useState } from "react";
import { Download, Save } from "lucide-react";
import { T, font } from "../../lib/theme";
import { generateDocxFromTemplate, formatTanggalPanjang } from "../../lib/docxGenerate";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import DatePicker from "../../components/DatePicker";

const EMPTY = {
  nilaiPenawaran: "",
  nilaiNegosiasi: "",
  tanggalNegosiasi: "",
  pelaksanaPekerjaan: "",
  keterangan: "",
};

export default function Lampiran2Page({ rab, notify, list = [], setList }) {
  const [activeRab, setActiveRab] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const inputStyle = {
    width: "100%", padding: "9px 11px", borderRadius: 7,
    border: `1px solid ${T.border}`, background: T.inputBg,
    color: T.text, fontSize: 12.5, boxSizing: "border-box",
  };
  const labelStyle = { display: "block", marginBottom: 5, fontSize: 11.5, fontWeight: 700, color: T.heading };

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const selectRab = (r) => {
    setActiveRab(r);
    const existing = list.find((x) => x.submissionId === r.idNumber);
    if (existing) {
      setForm(existing.form || EMPTY);
    } else {
      const vendor = r.vendor1 || r.vendor || "";
      setForm({ ...EMPTY, pelaksanaPekerjaan: vendor });
    }
  };

  const save = () => {
    if (!activeRab) return;
    const record = { submissionId: activeRab.idNumber, form, savedAt: new Date().toISOString() };
    if (setList) {
      setList((prev) => {
        const idx = prev.findIndex((x) => x.submissionId === activeRab.idNumber);
        return idx >= 0 ? prev.map((x, i) => i === idx ? record : x) : [...prev, record];
      });
    }
    notify?.("Data Lampiran 2 disimpan.", "success", "Lampiran 2 disimpan");
  };

  const downloadDocx = async () => {
    if (!activeRab) return;
    try {
      await generateDocxFromTemplate(
        "/templates/Template_Lampiran_2.docx",
        {
          namaPengadaan: activeRab.judulKegiatan || "",
          nilaiPenawaran: form.nilaiPenawaran || "",
          nilaiNegosiasi: form.nilaiNegosiasi || "",
          tanggalNegosiasi: formatTanggalPanjang(form.tanggalNegosiasi),
          pelaksanaPekerjaan: form.pelaksanaPekerjaan || activeRab.vendor || "",
          keterangan: form.keterangan || "",
        },
        `Lampiran-2-${activeRab.idNumber}.docx`
      );
      notify?.("Lampiran 2 berhasil dibuat dari data sistem.", "success");
    } catch (e) {
      notify?.(`Gagal membuat Lampiran 2: ${e.message}`, "error");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Dokumen Pembayaran"
        title="Lampiran 2 - Negosiasi, SPK/SPB & BAST"
        description="Isi data berdasarkan RAB terpilih. Data tetap terhubung ke pekerjaan yang sama dan tidak meminta input ulang nomor RAB."
      />

      <div style={{ display: "grid", gridTemplateColumns: "minmax(220px, 280px) minmax(0, 1fr)", gap: 16 }} className="responsive-two-col">
        <Card>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.heading, marginBottom: 10 }}>Pilih RAB / Pekerjaan</div>
          {!rab?.length ? (
            <div style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.55 }}>Belum ada RAB.</div>
          ) : (
            <div style={{ display: "grid", gap: 6 }}>
              {rab.map((r) => {
                const savedAt = list.find((x) => x.submissionId === r.idNumber)?.savedAt;
                return (
                <button key={r.idNumber} onClick={() => selectRab(r)} style={{
                  padding: "10px 12px", borderRadius: 8, textAlign: "left",
                  border: `1px solid ${activeRab?.idNumber === r.idNumber ? T.blue : T.border}`,
                  background: activeRab?.idNumber === r.idNumber ? T.blueSoft : T.bg,
                  color: T.text, cursor: "pointer", minWidth: 0,
                }}>
                  <div style={{ fontFamily: font.mono, fontWeight: 700, fontSize: 12, color: T.blue }}>{r.idNumber}</div>
                  <div style={{ fontSize: 11.5, color: T.muted, marginTop: 3, lineHeight: 1.45, overflowWrap: "anywhere" }}>{r.judulKegiatan}</div>
                  {savedAt && (
                    <div style={{ fontSize: 10.5, color: "#1E7F3E", marginTop: 4, fontWeight: 600 }}>
                      Tersimpan, terakhir update {formatSavedAt(savedAt)}
                    </div>
                  )}
                </button>
                );
              })}
            </div>
          )}
        </Card>

        <Card>
          {!activeRab ? (
            <div style={{ padding: "34px 10px", textAlign: "center", color: T.muted, fontSize: 13.5, lineHeight: 1.6 }}>
              Pilih RAB untuk mengisi Lampiran 2.
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontFamily: font.mono, fontWeight: 700, fontSize: 12, color: T.blue }}>{activeRab.idNumber}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.heading, marginTop: 3, lineHeight: 1.45 }}>{activeRab.judulKegiatan}</div>
              </div>

              <Section title="Berita Acara Negosiasi">
                <Field label="Nilai Penawaran"><input style={inputStyle} type="number" value={form.nilaiPenawaran} onChange={(e) => set("nilaiPenawaran", e.target.value)} /></Field>
                <Field label="Nilai Negosiasi"><input style={inputStyle} type="number" value={form.nilaiNegosiasi} onChange={(e) => set("nilaiNegosiasi", e.target.value)} /></Field>
                <Field label="Tanggal Negosiasi"><DatePicker value={form.tanggalNegosiasi} onChange={(v) => set("tanggalNegosiasi", v)} /></Field>
                <Field label="Pelaksana Pekerjaan"><input style={inputStyle} value={form.pelaksanaPekerjaan} onChange={(e) => set("pelaksanaPekerjaan", e.target.value)} placeholder={activeRab.vendor || "Nama vendor/pelaksana"} /></Field>
                <Field label="Keterangan" full><textarea style={{ ...inputStyle, minHeight: 72, resize: "vertical" }} value={form.keterangan} onChange={(e) => set("keterangan", e.target.value)} /></Field>
              </Section>

              <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginTop: 18 }}>
                <button onClick={save} style={actionStyle(T.blue, "#fff", "transparent")}><Save size={14} /> Simpan</button>
                <button onClick={downloadDocx} style={actionStyle(T.card, T.heading, T.border)}><Download size={14} /> Download Word</button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function formatSavedAt(iso) {
  const d = new Date(iso);
  const tgl = d.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "2-digit" });
  const jam = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  return `${tgl} jam ${jam}`;
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontFamily: font.display, fontSize: 13.5, fontWeight: 700, color: T.heading, marginBottom: 10 }}>{title}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12 }}>{children}</div>
    </div>
  );
}

function Field({ label, children, full }) {
  return (
    <div style={full ? { gridColumn: "1 / -1", minWidth: 0 } : { minWidth: 0 }}>
      <label style={{ display: "block", marginBottom: 5, fontSize: 11.5, fontWeight: 700, color: T.heading }}>{label}</label>
      {children}
    </div>
  );
}

function actionStyle(background, color, borderColor) {
  return {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "9px 15px", borderRadius: 8,
    border: borderColor === "transparent" ? "none" : `1px solid ${borderColor}`,
    background, color, cursor: "pointer", fontSize: 12.5, fontWeight: 700,
  };
}
