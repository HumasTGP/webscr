import { useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, Check, Download, Eye, FileText, Pencil, Plus,
  Printer, Trash2, X,
} from "lucide-react";
import { T, font } from "../../lib/theme";
import { nextIdFor, rupiah, uid } from "../../lib/utils";
import { generateSikasPdf } from "../../lib/pdf";
import { generateDocxFromTemplate, formatTanggalPanjang } from "../../lib/docxGenerate";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import DatePicker from "../../components/DatePicker";
import ComboManaged from "../../components/ComboManaged";
import ReviewModal from "../../components/ReviewModal";

const STEPS = ["Isi Formulir", "RAB & Ruang Lingkup", "Konfirmasi", "Simpan"];
const MONTHS_ID = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

const DEFAULT_COMBO = {
  procost: [
    "23-1501-PPA-OP-LUO-8C-01", "23-1501-PPA-OP-ADM-7Q-01", "23-1501-PPA-OP-ADM-7Q-31",
    "23-1501-PPA-OP-ADM-7Q-41", "23-1501-PPA-OP-JAS-3A-04", "23-1501-PPA-OP-JAS-3A-34",
    "23-1501-PPA-OP-JAS-3A-44", "23-1501-PPA-OP-JAS-3K-31", "24-1501-PPA-OP-LUO-8C-01",
    "24-1501-PPA-OP-ADM-7Q-01", "24-1301-NON-OP-LUO-8C-01", "24-1501-PPA-OP-JAS-3A-04",
    "24-1501-PPA-OP-JAS-3D-01", "25-1501-PPA-OP-LUO-8C-01", "25-1501-PPA-OP-ADM-7Q-01",
    "25-1301-NON-OP-LUO-8C-01", "26-1501-PPA-OP-LUO-8C-01", "26-1501-PPA-OP-ADM-7Q-01",
    "26-1301-NON-OP-LUO-8C-01",
  ],
  expType: [
    "72-LO Beban Plyn Masy-ComDev", "72-LO Beban Pmbrdy Masy-ComDev", "72-LO Beban Hub Masy-ComDev",
    "67-ADM Keamanan", "63-JSB-PRVNT-KPMM-JS TAD Adm", "63-JSB-SUPRT-BANG-Gedung Batu",
    "67-ADM Abodemen & Iklan", "63-JSB-OVRHL-IMSN-Trbo Gnrtor",
    "72-LOTJSL-TPB1-TanpaKemiskinan", "72-LOTJSL-TPB2-TanpaKelaparan", "72-LOTJSL-TPB3-Khidupn&Sejhtra",
    "72-LOTJSL-TPB4-PndidknBrkualts", "72-LOTJSL-TPB5-Ksetaraan Gender", "72-LOTJSL-TPB6-AirBersih&Layak",
    "72-LOTJSL-TPB7-EnrgBrshTrjgkau", "72-LOTJSL-TPB8-PekLykPertmbEko", "72-LOTJSL-TPB9-IndustInovInfra",
    "72-LOTJSL-TPB10-BerkrgKsnjangn", "72-LOTJSL-TPB11-Kota&KomLanjut", "72-LOTJSL-TPB12-KonsProdTjgjwb",
    "72-LOTJSL-TPB13-Pen Prubhnlklim", "72-LOTJSL-TPB14-EkosistemLaut", "72-LOTJSL-TPB15-EkosistmDaratn",
    "72-LOTJSL-TPB16-PrdmaiAdilLmbg", "72-LOTJSL-TPB17-Kmitraan Tujuan",
  ],
  task: ["01", "02"],
  ppn: ["0%", "11%"],
  expOrg: [
    "1501-PRO PGU-Kantor Utama",
    "1501-PRO PGU-PLTGU Tg. Priok Blok II GT 2 F.Kit Common",
    "1501-PRO PGU-PLTGU Tg.Priok Blok III GT 3 F.Kit Common",
    "1501-PRO PGU-PLTGU Tg.Priok Blok IV GT 4 F.Kit Common",
    "1501-PRO POMU-PLTD Tg.Priok Senayan F.Kit Common",
    "1301-HO-KANTOR INDUK-KP",
    "1501-PRO POMU-PLTGU Tg. Priok Blok II ST 2.0",
    "1301-HO-Kantor Utama - KP",
  ],
  vendor: [
    "Adjusment Budget KP", "ABB SAKTI INDUSTRI PT", "ABDIBANGUN BUANA PT", "ACITYA DIPTA KAHYUNA PT",
    "ADHIGANA PERKASA MANDIRI PT", "ADHIKA TEKNIK UTAMA CV", "ADHIWIYATA BINA BESTARI PT",
    "ADIKARA KARYA PRATAMA PT", "ADIKA PUTRA MANDIRI PT", "AETRA AIR JAKARTA PT",
  ],
};

const EMPTY_FORM = {
  tanggal: "", namaPengadaan: "",
  procost: "", expType: "", task: "", expOrg: "", ppn: "",
  vendor1: "", vendor2: "", vendor3: "",
};
const emptyItemDraft = () => ({ uraian: "", qty: "", satuan: "", hargaVendor1: "" });

function monthKey(dateStr) {
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function monthLabel(key) { const [y, m] = key.split("-"); return `${MONTHS_ID[Number(m) - 1]} ${y}`; }
function formatSavedAt(iso) {
  const d = new Date(iso);
  return `${d.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "2-digit" })} jam ${d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
}
function formatTanggal(dateStr) {
  const d = dateStr ? new Date(`${dateStr}T00:00:00`) : null;
  if (!d || Number.isNaN(d.getTime())) return dateStr || "-";
  return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
}

export default function Lampiran1Page({ rab, notify, list = [], setList }) {
  const [mode, setMode] = useState("list");
  const [step, setStep] = useState(0);
  const [activeRab, setActiveRab] = useState(null);
  const [editingSubmissionId, setEditingSubmissionId] = useState(null);
  const [pengajuanId, setPengajuanId] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [items, setItems] = useState([]);
  const [itemDraft, setItemDraft] = useState(emptyItemDraft());
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [combo, setCombo] = useState(DEFAULT_COMBO);

  const [reviewRow, setReviewRow] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [filterBulan, setFilterBulan] = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const setComboOpts = (k, opts) => setCombo((p) => ({ ...p, [k]: opts }));
  const grandTotal = items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.hargaVendor1) || 0), 0);

  const monthOptions = useMemo(() => {
    const set2 = new Set();
    list.forEach((r) => { const k = monthKey(r.form?.tanggal); if (k) set2.add(k); });
    return [...set2].sort().reverse();
  }, [list]);

  const displayList = useMemo(() => {
    let l = list;
    if (filterBulan) l = l.filter((r) => monthKey(r.form?.tanggal) === filterBulan);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      l = l.filter((r) => (r.submissionId || "").toLowerCase().includes(q) || (r.form?.namaPengadaan || "").toLowerCase().includes(q));
    }
    return l;
  }, [list, filterBulan, search]);

  // ---------- wizard ----------
  const startWizard = () => {
    setEditingSubmissionId(null);
    setActiveRab(null);
    setPengajuanId(nextIdFor("LMP1", list, "pengajuanId"));
    setForm(EMPTY_FORM);
    setItems([]);
    setStep(0);
    setMode("wizard");
  };
  const startEdit = (record) => {
    const r = rab.find((x) => x.idNumber === record.submissionId);
    setEditingSubmissionId(record.submissionId);
    setActiveRab(r || { idNumber: record.submissionId, judulKegiatan: record.form?.namaPengadaan });
    setPengajuanId(record.pengajuanId || nextIdFor("LMP1", list, "pengajuanId"));
    setForm(record.form || EMPTY_FORM);
    setItems(record.items || []);
    setStep(0);
    setMode("wizard");
    setReviewRow(null);
  };

  const pickRab = (id) => {
    const r = rab.find((x) => x.idNumber === id);
    setActiveRab(r || null);
    if (r) {
      setForm((p) => ({ ...p, namaPengadaan: p.namaPengadaan || r.judulKegiatan || "" }));
      if (items.length === 0 && (r.items || []).length > 0) {
        setItems(r.items.map((it) => ({
          id: uid("LP1I"), uraian: it.uraian || "", qty: it.qtyEvaluasi || it.qty || "",
          satuan: it.satuan || "", hargaVendor1: it.hargaSatuanEvaluasi || it.hargaSatuan || "",
        })));
      }
    }
  };

  const openAddItem = () => { setItemDraft(emptyItemDraft()); setEditingItemId(null); setShowItemModal(true); };
  const openEditItem = (row) => { setItemDraft(row); setEditingItemId(row.id); setShowItemModal(true); };
  const saveItemModal = () => {
    if (!itemDraft.uraian.trim()) return notify("Isi Uraian dulu.", "error");
    const row = { ...itemDraft, id: editingItemId || uid("LP1I") };
    setItems((prev) => editingItemId ? prev.map((r) => (r.id === editingItemId ? row : r)) : [...prev, row]);
    setShowItemModal(false);
  };
  const deleteItemRow = (id) => setItems((prev) => prev.filter((r) => r.id !== id));

  const finalizeSave = () => {
    if (!activeRab) return notify("Pilih Submission ID (RAB) dulu.", "error");
    const record = { submissionId: activeRab.idNumber, pengajuanId, form, items, savedAt: new Date().toISOString() };
    setList((prev) => {
      const idx = prev.findIndex((x) => x.submissionId === activeRab.idNumber);
      return idx >= 0 ? prev.map((x, i) => (i === idx ? record : x)) : [...prev, record];
    });
    setEditingSubmissionId(activeRab.idNumber);
    setStep(3);
    notify(editingSubmissionId ? "LMP 1 berhasil diperbarui!" : "LMP 1 berhasil disimpan!", "success");
  };

  const deleteRecord = (record) => {
    setList((prev) => prev.filter((r) => r.submissionId !== record.submissionId));
    notify(`LMP 1 untuk ${record.submissionId} dihapus.`, "success");
    setDeleteTarget(null);
  };

  // ---------- docx / pdf ----------
  const buildDocxData = (record) => ({
    submissionId: record.submissionId,
    tanggal: formatTanggal(record.form?.tanggal),
    namaPengadaan: record.form?.namaPengadaan || "",
    procost: record.form?.procost || "-", expType: record.form?.expType || "-",
    task: record.form?.task || "-", expOrg: record.form?.expOrg || "-",
    grandTotal: rupiah((record.items || []).reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.hargaVendor1) || 0), 0)),
    vendor1: record.form?.vendor1 || "-", vendor2: record.form?.vendor2 || "-", vendor3: record.form?.vendor3 || "-",
    items: (record.items || []).map((it) => ({
      uraian: it.uraian || "", qty: String(it.qty || ""), satuan: it.satuan || "",
      hargaVendor1: rupiah(it.hargaVendor1 || 0), total: rupiah((Number(it.qty) || 0) * (Number(it.hargaVendor1) || 0)),
    })),
  });
  const downloadDocx = async (record) => {
    try {
      await generateDocxFromTemplate("/templates/Template_Lampiran_1.docx", buildDocxData(record), `LMP1-${record.submissionId}.docx`);
      notify("Lampiran 1 (.docx) berhasil diunduh.", "success");
    } catch (e) { notify(`Gagal membuat Lampiran 1: ${e.message}`, "error"); }
  };
  const downloadPdf = async (record) => {
    try {
      await generateSikasPdf({
        title: "Lampiran 1 - Rincian Pekerjaan & Perbandingan Vendor",
        subtitle: `${record.submissionId} · Grand Total ${rupiah((record.items || []).reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.hargaVendor1) || 0), 0))}`,
        rows: [
          ["Submission ID", record.submissionId],
          ["Nama Pengadaan", record.form?.namaPengadaan || "-"],
          ["Tanggal", formatTanggal(record.form?.tanggal)],
        ],
        table: record.items || [],
        filename: `LMP1-${record.submissionId}`,
      });
      notify("Lampiran 1 (.pdf) berhasil diunduh.", "success");
    } catch (e) { notify(`Gagal membuat PDF: ${e.message}`, "error"); }
  };

  // ================= LIST MODE =================
  if (mode === "list") {
    return (
      <div>
        <PageHeader
          eyebrow="Pembayaran"
          title="LMP 1"
          description="Lampiran 1 - rincian pekerjaan dan perbandingan vendor, dirujuk dari RAB yang sudah selesai pelaksanaannya."
          right={<Button icon={Plus} onClick={startWizard}>+ Tambah LMP 1</Button>}
        />

        <Card style={{ marginBottom: 14, padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari Submission ID / nama pengadaan…"
              style={{ flex: "1 1 220px", boxSizing: "border-box", padding: "8px 10px", borderRadius: 7, border: `1px solid ${T.border}`, background: T.inputBg, color: T.text, fontSize: 13 }}
            />
            <select value={filterBulan} onChange={(e) => setFilterBulan(e.target.value)} style={{ padding: "8px 10px", borderRadius: 7, border: `1px solid ${T.border}`, background: T.inputBg, color: T.text, fontSize: 13 }}>
              <option value="">Semua bulan</option>
              {monthOptions.map((k) => <option key={k} value={k}>{monthLabel(k)}</option>)}
            </select>
            {(search || filterBulan) && (
              <button type="button" onClick={() => { setSearch(""); setFilterBulan(""); }} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                <X size={12} /> Reset
              </button>
            )}
          </div>
        </Card>

        <Card padded={false}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr>{["Submission ID", "Nama Pengadaan", "Tanggal", "Grand Total", "Aksi"].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {displayList.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: "center", color: T.muted, padding: "28px 12px" }}>Belum ada data LMP 1. Klik &quot;+ Tambah LMP 1&quot; untuk mulai.</td></tr>
                ) : displayList.map((r, i) => {
                  const total = (r.items || []).reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.hargaVendor1) || 0), 0);
                  return (
                    <tr key={r.submissionId} style={{ background: i % 2 ? T.rowAlt : T.card }}>
                      <td style={td}>{r.submissionId}</td>
                      <td style={td}>{r.form?.namaPengadaan || "-"}</td>
                      <td style={td}>{formatTanggal(r.form?.tanggal)}</td>
                      <td style={{ ...td, textAlign: "right" }}>{rupiah(total)}</td>
                      <td style={{ ...td, textAlign: "center" }}>
                        <div style={{ display: "flex", gap: 5, justifyContent: "center" }}>
                          <IconBtn title="Lihat" onClick={() => setReviewRow(r)}><Eye size={13} /></IconBtn>
                          <IconBtn title="Edit" onClick={() => startEdit(r)}><Pencil size={13} /></IconBtn>
                          <IconBtn title="Hapus" danger onClick={() => setDeleteTarget(r)}><Trash2 size={13} /></IconBtn>
                          <IconBtn title="Print/Unduh" onClick={() => downloadDocx(r)}><Printer size={13} /></IconBtn>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <ReviewModal
          open={!!reviewRow}
          onClose={() => setReviewRow(null)}
          title={`Review LMP 1 - ${reviewRow?.submissionId || ""}`}
          rows={reviewRow ? [
            { label: "Submission ID", value: reviewRow.submissionId },
            { label: "Tanggal", value: formatTanggal(reviewRow.form?.tanggal) },
            { label: "Nama Pengadaan", value: reviewRow.form?.namaPengadaan, full: true },
            { label: "Procost", value: reviewRow.form?.procost },
            { label: "Exp. Type", value: reviewRow.form?.expType },
            { label: "Vendor 1", value: reviewRow.form?.vendor1 },
            { label: "Vendor 2", value: reviewRow.form?.vendor2 || "-" },
            { label: "Vendor 3", value: reviewRow.form?.vendor3 || "-" },
          ] : []}
          table={reviewRow ? {
            title: `RAB & Ruang Lingkup (${(reviewRow.items || []).length} baris)`,
            columns: [
              { key: "uraian", label: "Uraian" }, { key: "qty", label: "Qty" }, { key: "satuan", label: "Satuan" },
              { key: "total", label: "Total", render: (r) => rupiah((Number(r.qty) || 0) * (Number(r.hargaVendor1) || 0)) },
            ],
            data: reviewRow.items || [],
          } : null}
          totals={reviewRow ? [{ label: "Grand Total", value: rupiah((reviewRow.items || []).reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.hargaVendor1) || 0), 0)) }] : []}
          onEdit={() => startEdit(reviewRow)}
          editLabel="Edit LMP 1 ini"
        />

        <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Hapus LMP 1?" tone="danger">
          <p style={{ color: T.muted, fontSize: 13.5, marginBottom: 20, lineHeight: 1.6 }}>
            LMP 1 untuk <b>{deleteTarget?.submissionId}</b> akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Batal</Button>
            <Button variant="accent" icon={Trash2} onClick={() => deleteRecord(deleteTarget)}>Ya, Hapus</Button>
          </div>
        </Modal>
      </div>
    );
  }

  // ================= WIZARD MODE =================
  return (
    <div>
      <FlowStepsBar current={step} />

      {step === 0 && (
        <Card>
          <h3 style={{ fontFamily: font.display, fontSize: 16, marginBottom: 4 }}>Isi Formulir</h3>
          <p style={{ color: T.muted, fontSize: 12.5, marginBottom: 18 }}>Data dasar pengajuan LMP 1.</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", marginBottom: 20 }} className="responsive-form-grid">
            <FieldBlock label="ID pengajuan" hint="(otomatis)"><input value={pengajuanId} disabled style={disabledStyle} /></FieldBlock>
            <FieldBlock label="Submission ID" hint="(pilih RAB yang sudah selesai pelaksanaannya)">
              <select value={activeRab?.idNumber || ""} onChange={(e) => pickRab(e.target.value)} style={inputStyle}>
                <option value="">- Pilih Submission ID -</option>
                {rab.map((r) => <option key={r.idNumber} value={r.idNumber}>{r.idNumber} - {r.judulKegiatan}</option>)}
              </select>
            </FieldBlock>
            <FieldBlock label="Tanggal kegiatan"><DatePicker value={form.tanggal} onChange={(v) => set("tanggal", v)} /></FieldBlock>
            <FieldBlock label="Judul kegiatan" hint="(otomatis dari RAB)"><input value={activeRab?.judulKegiatan || ""} disabled style={disabledStyle} /></FieldBlock>
            <FieldBlock label="Nama Pengadaan" full><input value={form.namaPengadaan} onChange={(e) => set("namaPengadaan", e.target.value)} style={inputStyle} /></FieldBlock>
          </div>

          <SectionLabel>Klasifikasi anggaran</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", marginBottom: 20 }} className="responsive-form-grid">
            <FieldBlock label="Procost"><ComboManaged value={form.procost} options={combo.procost} onChange={(v) => set("procost", v)} onOptions={(o) => setComboOpts("procost", o)} placeholder="Pilih procost…" /></FieldBlock>
            <FieldBlock label="Exp. Type"><ComboManaged value={form.expType} options={combo.expType} onChange={(v) => set("expType", v)} onOptions={(o) => setComboOpts("expType", o)} placeholder="Pilih exp type…" /></FieldBlock>
            <FieldBlock label="Task"><ComboManaged value={form.task} options={combo.task} onChange={(v) => set("task", v)} onOptions={(o) => setComboOpts("task", o)} placeholder="Pilih task…" /></FieldBlock>
            <FieldBlock label="Exp. Org"><ComboManaged value={form.expOrg} options={combo.expOrg} onChange={(v) => set("expOrg", v)} onOptions={(o) => setComboOpts("expOrg", o)} placeholder="Pilih exp org…" /></FieldBlock>
            <FieldBlock label="PPN"><ComboManaged value={form.ppn} options={combo.ppn} onChange={(v) => set("ppn", v)} onOptions={(o) => setComboOpts("ppn", o)} placeholder="Pilih PPN…" /></FieldBlock>
          </div>

          <SectionLabel dashed>Vendor</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px 20px" }} className="responsive-form-grid">
            <FieldBlock label="Vendor 1"><ComboManaged value={form.vendor1} options={combo.vendor} onChange={(v) => set("vendor1", v)} onOptions={(o) => setComboOpts("vendor", o)} placeholder="Pilih vendor 1…" /></FieldBlock>
            <FieldBlock label="Vendor 2" hint="(opsional)"><ComboManaged value={form.vendor2} options={combo.vendor} onChange={(v) => set("vendor2", v)} onOptions={(o) => setComboOpts("vendor", o)} placeholder="- Kosong -" /></FieldBlock>
            <FieldBlock label="Vendor 3" hint="(opsional)"><ComboManaged value={form.vendor3} options={combo.vendor} onChange={(v) => set("vendor3", v)} onOptions={(o) => setComboOpts("vendor", o)} placeholder="- Kosong -" /></FieldBlock>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 22 }}>
            <Button onClick={() => { if (!activeRab) return notify("Pilih Submission ID dulu.", "error"); setStep(1); }}>Lanjutkan <ArrowRight size={15} /></Button>
          </div>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
            <div>
              <h3 style={{ fontFamily: font.display, fontSize: 16, margin: 0 }}>RAB & Ruang Lingkup</h3>
              <p style={{ color: T.muted, fontSize: 12.5, margin: "4px 0 0" }}>Baris awal diisi otomatis dari Uraian RAB terkait - tambah/ubah sesuai kebutuhan.</p>
            </div>
            <Button icon={Plus} onClick={openAddItem}>+ Tambah baris</Button>
          </div>

          <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden", overflowX: "auto", marginTop: 14 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead><tr>{["Uraian", "Qty", "Satuan", "Harga vendor 1", "Total", ""].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", color: T.muted, padding: "20px 12px" }}>Belum ada baris.</td></tr>
                ) : items.map((r, i) => (
                  <tr key={r.id} style={{ background: i % 2 ? T.rowAlt : T.card }}>
                    <td style={td}>{r.uraian}</td>
                    <td style={{ ...td, textAlign: "right" }}>{r.qty}</td>
                    <td style={td}>{r.satuan}</td>
                    <td style={{ ...td, textAlign: "right" }}>{rupiah(r.hargaVendor1 || 0)}</td>
                    <td style={{ ...td, textAlign: "right" }}>{rupiah((Number(r.qty) || 0) * (Number(r.hargaVendor1) || 0))}</td>
                    <td style={{ ...td, textAlign: "center" }}>
                      <div style={{ display: "flex", gap: 5, justifyContent: "center" }}>
                        <IconBtn title="Edit" onClick={() => openEditItem(r)}><Pencil size={12} /></IconBtn>
                        <IconBtn title="Hapus" danger onClick={() => deleteItemRow(r.id)}><Trash2 size={12} /></IconBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ textAlign: "right", marginTop: 12, fontSize: 15, fontWeight: 700, color: T.heading }}>Grand Total: {rupiah(grandTotal)}</div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
            <Button variant="ghost" icon={ArrowLeft} onClick={() => setStep(0)}>Kembali</Button>
            <Button onClick={() => setStep(2)} disabled={items.length === 0}>Lanjutkan <ArrowRight size={15} /></Button>
          </div>

          <Modal open={showItemModal} onClose={() => setShowItemModal(false)} title={editingItemId ? "Edit Baris" : "Tambah Baris"} width={420}>
            <div style={{ display: "grid", gap: 12 }}>
              <FieldBlock label="Uraian"><input value={itemDraft.uraian} onChange={(e) => setItemDraft({ ...itemDraft, uraian: e.target.value })} style={inputStyle} /></FieldBlock>
              <FieldBlock label="Qty"><input type="number" value={itemDraft.qty} onChange={(e) => setItemDraft({ ...itemDraft, qty: e.target.value })} style={inputStyle} /></FieldBlock>
              <FieldBlock label="Satuan"><input value={itemDraft.satuan} onChange={(e) => setItemDraft({ ...itemDraft, satuan: e.target.value })} style={inputStyle} /></FieldBlock>
              <FieldBlock label="Harga vendor 1"><input type="number" value={itemDraft.hargaVendor1} onChange={(e) => setItemDraft({ ...itemDraft, hargaVendor1: e.target.value })} style={inputStyle} /></FieldBlock>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
              <Button variant="ghost" onClick={() => setShowItemModal(false)}>Batal</Button>
              <Button icon={Check} onClick={saveItemModal}>Simpan</Button>
            </div>
          </Modal>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <h3 style={{ fontFamily: font.display, fontSize: 16, marginBottom: 4 }}>Konfirmasi</h3>
          <p style={{ color: T.muted, fontSize: 12.5, marginBottom: 18 }}>Cek dulu datanya, bisa langsung diunduh dari sini sebelum disimpan final.</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", marginBottom: 18, borderBottom: `1px solid ${T.border}`, paddingBottom: 16 }}>
            <ReviewRow label="Submission ID" value={activeRab?.idNumber} />
            <ReviewRow label="Tanggal" value={formatTanggal(form.tanggal)} />
            <ReviewRow label="Nama Pengadaan" value={form.namaPengadaan} full />
            <ReviewRow label="Vendor 1 / 2 / 3" value={[form.vendor1, form.vendor2, form.vendor3].filter(Boolean).join(" / ") || "-"} full />
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 6 }}>
            <Button icon={Download} onClick={() => downloadDocx({ submissionId: activeRab?.idNumber, form, items })}>Unduh Word (.docx)</Button>
            <Button variant="ghost" icon={FileText} onClick={() => downloadPdf({ submissionId: activeRab?.idNumber, form, items })}>Unduh PDF</Button>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
            <Button variant="ghost" icon={ArrowLeft} onClick={() => setStep(1)}>Tidak, edit lagi</Button>
            <Button onClick={finalizeSave}>Ya, simpan <ArrowRight size={15} /></Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <div style={{ textAlign: "center", padding: "26px 10px" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: T.successSoft, display: "grid", placeItems: "center", margin: "0 auto 14px" }}>
              <Check size={26} color={T.success} />
            </div>
            <h3 style={{ fontFamily: font.display, fontSize: 17, marginBottom: 4 }}>LMP 1 tersimpan</h3>
            <p style={{ color: T.muted, fontSize: 13, marginBottom: 20 }}>{activeRab?.idNumber} sudah tercatat di daftar LMP 1.</p>
            <Button onClick={() => setMode("list")}><ArrowLeft size={15} /> Kembali ke daftar LMP 1</Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function FlowStepsBar({ current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0, marginBottom: 20 }}>
      {STEPS.map((label, i) => (
        <div key={label} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 26, height: 26, borderRadius: "50%", display: "grid", placeItems: "center",
              fontSize: 12, fontWeight: 700, flexShrink: 0,
              background: i < current ? T.success : i === current ? T.blue : "#fff",
              color: i <= current ? "#fff" : T.muted,
              border: i > current ? `1.5px solid ${T.border}` : "none",
            }}>{i < current ? <Check size={13} /> : i + 1}</div>
            <span style={{ fontSize: 12, fontWeight: 600, color: i === current ? T.blue : T.muted, whiteSpace: "nowrap" }}>{label}</span>
          </div>
          {i < STEPS.length - 1 && <div style={{ width: 34, height: 1.5, background: T.border, margin: "0 6px" }} />}
        </div>
      ))}
    </div>
  );
}
function SectionLabel({ children, dashed }) {
  return <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: T.blue, margin: dashed ? "4px 0 10px" : "0 0 10px", borderTop: dashed ? `1px dashed ${T.border}` : "none", paddingTop: dashed ? 14 : 0 }}>{children}</div>;
}
function FieldBlock({ label, hint, full, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: full ? "1 / -1" : "auto" }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{label} {hint && <span style={{ fontSize: 11, fontWeight: 400, color: T.muted }}>{hint}</span>}</label>
      {children}
    </div>
  );
}
function ReviewRow({ label, value, full }) {
  return (
    <div style={{ gridColumn: full ? "1 / -1" : "auto", display: "grid", gridTemplateColumns: "160px 1fr", gap: 12, fontSize: 13, padding: "6px 0" }}>
      <div style={{ color: T.muted }}>{label}</div><div style={{ fontWeight: 600, color: T.text }}>{value || "-"}</div>
    </div>
  );
}
function IconBtn({ children, onClick, title, danger }) {
  return (
    <button onClick={onClick} title={title} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${T.border}`, background: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: danger ? T.danger : T.muted }}>
      {children}
    </button>
  );
}

const inputStyle = { width: "100%", boxSizing: "border-box", padding: "9px 11px", borderRadius: 8, border: `1px solid ${T.border}`, background: "#fbfdfe", color: T.text, fontSize: 13, fontFamily: font.body };
const disabledStyle = { ...inputStyle, background: T.bg, color: T.muted };
const th = { background: T.blueSoft, color: T.navy, fontWeight: 700, textAlign: "left", padding: "9px 11px", fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.3, whiteSpace: "nowrap" };
const td = { padding: "9px 11px", borderBottom: `1px solid ${T.border}`, whiteSpace: "nowrap" };
