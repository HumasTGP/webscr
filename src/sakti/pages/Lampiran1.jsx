import { useState } from "react";
import { Download, Plus, Save, Trash2 } from "lucide-react";
import { T, font } from "../../lib/theme";
import { uid, rupiah } from "../../lib/utils";
import { generateDocxFromTemplate, formatTanggalPanjang } from "../../lib/docxGenerate";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import ComboManaged from "../../components/ComboManaged";

const DEFAULT_COMBO = {
  procost: ["Belanja Modal", "Belanja Operasional", "Belanja Pegawai"],
  expType: ["Direct", "Indirect", "Capital"],
  task: ["KAS", "UMB", "PRIOK"],
  expOrg: ["1010", "1020", "2010"],
  vendor: [],
};

const EMPTY_FORM = {
  subSection: "",
  submissionId: "",
  tanggal: "",
  namaPengadaan: "",
  procost: "",
  expType: "",
  task: "",
  expOrg: "",
  vendor1: "",
  vendor2: "",
  vendor3: "",
  preferredVendor: "",
  kesesuaianProcost: "",
  ketersediaanAnggaran: "",
  invoiceNonPo: "",
  ketAka: "",
  ketMadm: "",
  approvalMadm: "",
  ketSrmMum: "",
  approvalSrmMum: "",
};

function newItem() {
  return { id: uid("LP1"), uraian: "", jumlah: "", satuan: "", hargaVendor1: "", hargaVendor2: "", hargaVendor3: "" };
}

export default function Lampiran1Page({ rab, notify, list = [], setList }) {
  const [activeRab, setActiveRab] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [items, setItems] = useState([]);
  const [combo, setCombo] = useState(DEFAULT_COMBO);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const setComboOpts = (key, opts) => setCombo((p) => ({ ...p, [key]: opts }));

  const chooseRab = (r) => {
    setActiveRab(r);
    const existing = list.find((x) => x.submissionId === r.idNumber);
    if (existing) {
      setForm(existing.form || EMPTY_FORM);
      setItems(existing.items || []);
      return;
    }
    setForm({
      ...EMPTY_FORM,
      namaPengadaan: r.judulKegiatan || "",
      procost: r.procost || "",
      expType: r.expType || "",
      task: r.task || "",
      expOrg: r.expOrg || "",
      vendor1: r.vendor || "",
      preferredVendor: r.vendor || "",
    });
    setItems((r.items || []).map((it) => ({
      id: uid("LP1"),
      uraian: it.uraian || "",
      jumlah: it.qtyEvaluasi || it.qty || "",
      satuan: it.satuan || "",
      hargaVendor1: it.hargaEvaluasi || it.harga || "",
      hargaVendor2: "",
      hargaVendor3: "",
    })));
  };

  const updateItem = (index, key, value) => {
    setItems((prev) => prev.map((item, i) => i === index ? { ...item, [key]: value } : item));
  };

  const save = () => {
    if (!activeRab) return;
    const record = { submissionId: activeRab.idNumber, form, items, savedAt: new Date().toISOString() };
    if (setList) {
      setList((prev) => {
        const idx = prev.findIndex((x) => x.submissionId === activeRab.idNumber);
        return idx >= 0 ? prev.map((x, i) => i === idx ? record : x) : [...prev, record];
      });
    }
    notify?.("Lampiran 1 disimpan.", "success", "Lampiran 1 disimpan");
  };

  const grandTotal = items.reduce((sum, item) => sum + (Number(item.jumlah) || 0) * (Number(item.hargaVendor1) || 0), 0);

  const downloadDocx = async () => {
    if (!activeRab) return;
    const itemsText = items.map((item, index) => {
      const qty = Number(item.jumlah) || 0;
      return `${index + 1}. ${item.uraian || "-"} | ${qty} ${item.satuan || ""} | Vendor 1: ${rupiah(qty * (Number(item.hargaVendor1) || 0))} | Vendor 2: ${rupiah(qty * (Number(item.hargaVendor2) || 0))} | Vendor 3: ${rupiah(qty * (Number(item.hargaVendor3) || 0))}`;
    }).join("\n");
    try {
      await generateDocxFromTemplate(
        "/templates/Template_Lampiran_1.docx",
        {
          subSection: form.subSection,
          submissionId: form.submissionId,
          tanggal: formatTanggalPanjang(form.tanggal),
          namaPengadaan: form.namaPengadaan || activeRab.judulKegiatan || "",
          procost: form.procost,
          expType: form.expType,
          task: form.task,
          expOrg: form.expOrg,
          itemsText,
          grandTotal: rupiah(grandTotal),
          vendor1: form.vendor1,
          vendor2: form.vendor2,
          vendor3: form.vendor3,
          preferredVendor: form.preferredVendor,
          kesesuaianProcost: form.kesesuaianProcost,
          ketersediaanAnggaran: form.ketersediaanAnggaran,
          invoiceNonPo: form.invoiceNonPo,
          ketAka: form.ketAka,
          ketMadm: form.ketMadm,
          approvalMadm: form.approvalMadm,
          ketSrmMum: form.ketSrmMum,
          approvalSrmMum: form.approvalSrmMum,
        },
        `Lampiran-1-${activeRab.idNumber}.docx`
      );
      notify?.("Lampiran 1 berhasil dibuat dari data sistem.", "success");
    } catch (e) {
      notify?.(`Gagal membuat Lampiran 1: ${e.message}`, "error");
    }
  };

  const inputStyle = {
    width: "100%", padding: "9px 10px", borderRadius: 7,
    border: `1px solid ${T.border}`, background: T.inputBg,
    color: T.text, fontSize: 12.5, boxSizing: "border-box",
  };

  return (
    <div>
      <PageHeader
        eyebrow="Dokumen Pembayaran"
        title="Lampiran 1 - Pengadaan Langsung / Invoice Non PO"
        description="Data Lampiran 1 diisi dari pekerjaan/RAB yang dipilih, kemudian dilengkapi perbandingan vendor dan verifikasi sesuai kebutuhan pengadaan."
      />

      <div className="responsive-two-col" style={{ display: "grid", gridTemplateColumns: "minmax(220px, 280px) minmax(0, 1fr)", gap: 16 }}>
        <Card>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.heading, marginBottom: 10 }}>Pilih RAB / Pekerjaan</div>
          {!rab?.length ? <div style={{ color: T.muted, fontSize: 12.5 }}>Belum ada RAB.</div> : (
            <div style={{ display: "grid", gap: 6 }}>
              {rab.map((r) => (
                <button key={r.idNumber} onClick={() => chooseRab(r)} style={{
                  padding: "10px 12px", borderRadius: 8, textAlign: "left",
                  border: `1px solid ${activeRab?.idNumber === r.idNumber ? T.blue : T.border}`,
                  background: activeRab?.idNumber === r.idNumber ? T.blueSoft : T.bg,
                  color: T.text, cursor: "pointer", minWidth: 0,
                }}>
                  <div style={{ fontFamily: font.mono, fontWeight: 700, color: T.blue, fontSize: 12 }}>{r.idNumber}</div>
                  <div style={{ fontSize: 11.5, color: T.muted, marginTop: 3, lineHeight: 1.45, overflowWrap: "anywhere" }}>{r.judulKegiatan}</div>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card>
          {!activeRab ? (
            <div style={{ padding: "34px 8px", textAlign: "center", color: T.muted, fontSize: 13.5 }}>Pilih RAB untuk mengisi Lampiran 1.</div>
          ) : (
            <div>
              <Section title="Identitas Pengadaan">
                <Field label="Sub Section"><input style={inputStyle} value={form.subSection} onChange={(e) => set("subSection", e.target.value)} /></Field>
                <Field label="Submission ID"><input style={inputStyle} value={form.submissionId} onChange={(e) => set("submissionId", e.target.value)} /></Field>
                <Field label="Tanggal"><input style={inputStyle} type="date" value={form.tanggal} onChange={(e) => set("tanggal", e.target.value)} /></Field>
                <Field label="Nama Pengadaan" full><input style={inputStyle} value={form.namaPengadaan} onChange={(e) => set("namaPengadaan", e.target.value)} /></Field>
                <Field label="Procost"><ComboManaged value={form.procost} options={combo.procost} onChange={(v) => set("procost", v)} onOptions={(o) => setComboOpts("procost", o)} placeholder="Pilih procost…" /></Field>
                <Field label="Exp. Type"><ComboManaged value={form.expType} options={combo.expType} onChange={(v) => set("expType", v)} onOptions={(o) => setComboOpts("expType", o)} placeholder="Pilih exp type…" /></Field>
                <Field label="Task"><ComboManaged value={form.task} options={combo.task} onChange={(v) => set("task", v)} onOptions={(o) => setComboOpts("task", o)} placeholder="Pilih task…" /></Field>
                <Field label="Exp. Org"><ComboManaged value={form.expOrg} options={combo.expOrg} onChange={(v) => set("expOrg", v)} onOptions={(o) => setComboOpts("expOrg", o)} placeholder="Pilih exp org…" /></Field>
              </Section>

              <div style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 9 }}>
                  <div style={{ fontFamily: font.display, fontSize: 13.5, fontWeight: 700, color: T.heading }}>RAB dan Ruang Lingkup Pengadaan</div>
                  <button onClick={() => setItems((prev) => [...prev, newItem()])} style={buttonStyle(T.blue, "#fff", "transparent")}><Plus size={14} /> Tambah Baris</button>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", minWidth: 760, borderCollapse: "collapse", fontSize: 12 }}>
                    <thead><tr style={{ background: T.bg }}>
                      {['Uraian','Jumlah','Satuan','Harga Vendor 1 + PPN','Harga Vendor 2 + PPN','Harga Vendor 3 + PPN',''].map((h) => <th key={h} style={{ padding: 8, borderBottom: `1px solid ${T.border}`, textAlign: "left" }}>{h}</th>)}
                    </tr></thead>
                    <tbody>{items.map((item, i) => <tr key={item.id}>
                      <td style={td}><input style={inputStyle} value={item.uraian} onChange={(e) => updateItem(i, "uraian", e.target.value)} /></td>
                      <td style={td}><input style={{...inputStyle,width:76}} type="number" value={item.jumlah} onChange={(e) => updateItem(i, "jumlah", e.target.value)} /></td>
                      <td style={td}><input style={{...inputStyle,width:80}} value={item.satuan} onChange={(e) => updateItem(i, "satuan", e.target.value)} /></td>
                      <td style={td}><input style={inputStyle} type="number" value={item.hargaVendor1} onChange={(e) => updateItem(i, "hargaVendor1", e.target.value)} /></td>
                      <td style={td}><input style={inputStyle} type="number" value={item.hargaVendor2} onChange={(e) => updateItem(i, "hargaVendor2", e.target.value)} /></td>
                      <td style={td}><input style={inputStyle} type="number" value={item.hargaVendor3} onChange={(e) => updateItem(i, "hargaVendor3", e.target.value)} /></td>
                      <td style={td}><button onClick={() => setItems((prev) => prev.filter((_, x) => x !== i))} style={{ border:0, background:"transparent", color:T.danger, cursor:"pointer" }}><Trash2 size={14}/></button></td>
                    </tr>)}</tbody>
                  </table>
                </div>
                <div style={{ textAlign: "right", marginTop: 9, fontSize: 13, fontWeight: 700, color: T.heading }}>Grand Total Vendor 1: {rupiah(grandTotal)}</div>
              </div>

              <Section title="Vendor dan Preferred Vendor">
                <Field label="Vendor 1"><ComboManaged value={form.vendor1} options={combo.vendor} onChange={(v) => set("vendor1", v)} onOptions={(o) => setComboOpts("vendor", o)} placeholder="Pilih vendor 1…" /></Field>
                <Field label="Vendor 2"><ComboManaged value={form.vendor2} options={combo.vendor} onChange={(v) => set("vendor2", v)} onOptions={(o) => setComboOpts("vendor", o)} placeholder="Pilih vendor 2…" /></Field>
                <Field label="Vendor 3"><ComboManaged value={form.vendor3} options={combo.vendor} onChange={(v) => set("vendor3", v)} onOptions={(o) => setComboOpts("vendor", o)} placeholder="Pilih vendor 3…" /></Field>
                <Field label="Preferred Vendor"><input style={inputStyle} value={form.preferredVendor} onChange={(e) => set("preferredVendor", e.target.value)} /></Field>
              </Section>

              <Section title="Verifikasi dan Persetujuan Pengadaan">
                {[
                  ["kesesuaianProcost","Kesesuaian Procost"],["ketersediaanAnggaran","Ketersediaan Anggaran"],["invoiceNonPo","Invoice Non PO"],
                  ["ketAka","Ket. AKA"],["ketMadm","Ket. MADM"],["approvalMadm","Approval MADM"],["ketSrmMum","Ket. SRM MUM"],["approvalSrmMum","Approval SRM MUM"],
                ].map(([key,label]) => <Field key={key} label={label}><input style={inputStyle} value={form[key]} onChange={(e) => set(key,e.target.value)} /></Field>)}
              </Section>

              <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginTop: 18 }}>
                <button onClick={save} style={buttonStyle(T.blue, "#fff", "transparent")}><Save size={14}/> Simpan</button>
                <button onClick={downloadDocx} style={buttonStyle(T.card, T.heading, T.border)}><Download size={14}/> Download Word</button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

const td = { padding: 6, borderBottom: "1px solid var(--border)" };
function Section({ title, children }) {
  return <div style={{ marginBottom: 18 }}><div style={{ fontFamily: font.display, fontSize: 13.5, fontWeight: 700, color: T.heading, marginBottom: 10 }}>{title}</div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 11 }}>{children}</div></div>;
}
function Field({ label, children, full }) {
  return <div style={full ? { gridColumn: "1 / -1", minWidth: 0 } : { minWidth: 0 }}><label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: T.heading, marginBottom: 5 }}>{label}</label>{children}</div>;
}
function buttonStyle(background, color, borderColor) {
  return { display:"inline-flex",alignItems:"center",gap:6,padding:"8px 13px",borderRadius:8,border:borderColor==="transparent"?"none":`1px solid ${borderColor}`,background,color,cursor:"pointer",fontSize:12,fontWeight:700 };
}
