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
import { DEFAULT_SATUAN, SatuanSelect, SatuanSettingsModal, hitungTotalDenganSatuan } from "../../components/SatuanPicker";
import { Lampiran1Preview } from "../../components/DocTemplatePreview";

const STEPS = ["Isi Formulir", "RAB & Ruang Lingkup", "Konfirmasi", "Simpan"];
const MONTHS_ID = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const PPN_OPTIONS = ["Non PPN", "11%"];

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
const emptyItemDraft = () => ({ uraian: "", qty: "", satuan: "", hargaVendor1: "", ppn: "11%" });

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
  const [satuanList, setSatuanList] = useState(DEFAULT_SATUAN);
  const [showSatuanModal, setShowSatuanModal] = useState(false);

  const [reviewRow, setReviewRow] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [filterBulan, setFilterBulan] = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const setComboOpts = (k, opts) => setCombo((p) => ({ ...p, [k]: opts }));
  const grandTotal = items.reduce((s, it) => s + hitungTotalDenganSatuan({ qty: it.qty, satuan: it.satuan, harga: it.hargaVendor1, ppn: it.ppn }, satuanList).total, 0);

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
    // Terbaru di atas (newest-oldest), berdasarkan waktu terakhir disimpan.
    return [...l].sort((a, b) => new Date(b.savedAt || 0) - new Date(a.savedAt || 0));
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
          ppn: it.ppnEvaluasi || it.ppn || "11%",
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
    // Simpan hasil hitungan (base/ppn/total) langsung di tiap item, bukan cuma
    // raw qty/harga/satuan — supaya nilai tercatat tetap akurat & konsisten
    // walau daftar satuan (faktor konversi) berubah di sesi berikutnya.
    const itemsWithTotals = items.map((it) => {
      const t = hitungTotalDenganSatuan({ qty: it.qty, satuan: it.satuan, harga: it.hargaVendor1, ppn: it.ppn }, satuanList);
      return { ...it, base: t.base, ppnNilai: t.ppnNilai, total: t.total, faktor: t.faktor };
    });
    const grandTotalFinal = itemsWithTotals.reduce((s, it) => s + it.total, 0);
    const record = {
      submissionId: activeRab.idNumber, pengajuanId, form, items: itemsWithTotals,
      grandTotal: grandTotalFinal, savedAt: new Date().toISOString(),
    };
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
  // record.items sudah punya total/ppnNilai/base tersimpan (dihitung saat
  // finalizeSave), fallback ke hitung ulang kalau data lama belum punya itu.
  const itemTotal = (it) => (typeof it.total === "number" ? it.total : hitungTotalDenganSatuan({ qty: it.qty, satuan: it.satuan, harga: it.hargaVendor1, ppn: it.ppn }, satuanList).total);
  const recordGrandTotal = (record) => (typeof record.grandTotal === "number" ? record.grandTotal : (record.items || []).reduce((s, it) => s + itemTotal(it), 0));

  const buildDocxData = (record) => ({
    submissionId: record.submissionId,
    tanggal: formatTanggal(record.form?.tanggal),
    namaPengadaan: record.form?.namaPengadaan || "",
    procost: record.form?.procost || "-", expType: record.form?.expType || "-",
    task: record.form?.task || "-", expOrg: record.form?.expOrg || "-",
    grandTotal: rupiah(recordGrandTotal(record)),
    vendor1: record.form?.vendor1 || "-", vendor2: record.form?.vendor2 || "-", vendor3: record.form?.vendor3 || "-",
    // "baris" = 1 baris tabel siap-cetak per item, dipisah tab antar kolom dan
    // diakhiri \n biar docxtemplater (linebreaks:true) render jadi baris baru di Word.
    items: (record.items || []).map((it) => {
      const uraian = it.uraian || "";
      const qty = String(it.qty || "");
      const satuan = it.satuan || "";
      const hargaVendor1 = rupiah(it.hargaVendor1 || 0);
      const ppn = it.ppn || "-";
      const total = rupiah(itemTotal(it));
      return {
        uraian, qty, satuan, hargaVendor1, ppn, total,
        baris: `${uraian}\t${qty}\t${satuan}\t${hargaVendor1}\t${ppn}\t${total}\n`,
      };
    }),
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
        subtitle: `${record.submissionId} · Grand Total ${rupiah(recordGrandTotal(record))}`,
        rows: [
          ["Submission ID", record.submissionId],
          ["Nama Pengadaan", record.form?.namaPengadaan || "-"],
          ["Tanggal", formatTanggal(record.form?.tanggal)],
        ],
        table: (record.items || []).map((it) => ({ ...it, total: itemTotal(it) })),
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
          right={<Button icon={Plus} onClick={startWizard}>Tambah Lampiran 1</Button>}
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
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "13%" }} />
                <col style={{ width: "27%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "17%" }} />
                <col style={{ width: "30%" }} />
              </colgroup>
              <thead><tr>{["Submission ID", "Nama Pengadaan", "Tanggal", "Grand Total", "Aksi"].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {displayList.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: "center", color: T.muted, padding: "28px 12px" }}>Belum ada data LMP 1. Klik &quot;+ Tambah LMP 1&quot; untuk mulai.</td></tr>
                ) : displayList.map((r, i) => {
                  const total = recordGrandTotal(r);
                  return (
                    <tr key={r.submissionId} style={{ background: i % 2 ? T.rowAlt : T.card }}>
                      <td style={{ ...td, whiteSpace: "normal" }}>{r.submissionId}</td>
                      <td style={{ ...td, whiteSpace: "normal" }}>{r.form?.namaPengadaan || "-"}</td>
                      <td style={{ ...td, whiteSpace: "normal" }}>{formatTanggal(r.form?.tanggal)}</td>
                      <td style={{ ...td, textAlign: "left", whiteSpace: "normal" }}>{rupiah(total)}</td>
                      <td style={{ ...td, textAlign: "left" }}>
                        <div style={{ display: "flex", gap: 5, justifyContent: "flex-start", flexWrap: "wrap" }}>
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
              { key: "ppn", label: "PPN" },
              { key: "total", label: "Total", render: (r) => rupiah(itemTotal(r)) },
            ],
            data: reviewRow.items || [],
          } : null}
          totals={reviewRow ? [{ label: "Grand Total", value: rupiah(recordGrandTotal(reviewRow)) }] : []}
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
            <FieldBlock label="Vendor 1"><ComboManaged value={form.vendor1} options={combo.vendor} onChange={(v) => set("vendor1", v)} onOptions={(o) => setComboOpts("vendor", o)} placeholder="Pilih Vendor 1…" /></FieldBlock>
            <FieldBlock label="Vendor 2" hint="(opsional)"><ComboManaged value={form.vendor2} options={combo.vendor} onChange={(v) => set("vendor2", v)} onOptions={(o) => setComboOpts("vendor", o)} placeholder="Pilih Vendor 2..." /></FieldBlock>
            <FieldBlock label="Vendor 3" hint="(opsional)"><ComboManaged value={form.vendor3} options={combo.vendor} onChange={(v) => set("vendor3", v)} onOptions={(o) => setComboOpts("vendor", o)} placeholder="Pilih Vendor 3..." /></FieldBlock>
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
            <Button icon={Plus} onClick={openAddItem}>Tambah baris</Button>
          </div>

          <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden", overflowX: "auto", marginTop: 14 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead><tr>{["Uraian", "Qty", "Satuan", "Harga vendor 1", "PPN", "Total", ""].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: "center", color: T.muted, padding: "20px 12px" }}>Belum ada baris.</td></tr>
                ) : items.map((r, i) => (
                  <tr key={r.id} style={{ background: i % 2 ? T.rowAlt : T.card }}>
                    <td style={td}>{r.uraian}</td>
                    <td style={{ ...td, textAlign: "right" }}>{r.qty}</td>
                    <td style={td}>{r.satuan}</td>
                    <td style={{ ...td, textAlign: "right" }}>{rupiah(r.hargaVendor1 || 0)}</td>
                    <td style={td}>{r.ppn || "-"}</td>
                    <td style={{ ...td, textAlign: "right", fontWeight: 700 }}>{rupiah(hitungTotalDenganSatuan({ qty: r.qty, satuan: r.satuan, harga: r.hargaVendor1, ppn: r.ppn }, satuanList).total)}</td>
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
              <FieldBlock label="Satuan">
                <SatuanSelect
                  value={itemDraft.satuan}
                  satuanList={satuanList}
                  setSatuanList={setSatuanList}
                  onChange={(v) => setItemDraft({ ...itemDraft, satuan: v })}
                  onOpenSettings={() => setShowSatuanModal(true)}
                  inputStyle={inputStyle}
                />
              </FieldBlock>
              <FieldBlock label="Harga vendor 1"><input type="number" value={itemDraft.hargaVendor1} onChange={(e) => setItemDraft({ ...itemDraft, hargaVendor1: e.target.value })} style={inputStyle} /></FieldBlock>
              <FieldBlock label="PPN">
                <select value={itemDraft.ppn} onChange={(e) => setItemDraft({ ...itemDraft, ppn: e.target.value })} style={inputStyle}>
                  {PPN_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </FieldBlock>
              <div style={{ fontSize: 12.5, color: T.muted, textAlign: "right", paddingTop: 4, borderTop: `1px dashed ${T.border}` }}>
                Total baris ini: <b style={{ color: T.heading }}>{rupiah(hitungTotalDenganSatuan({ qty: itemDraft.qty, satuan: itemDraft.satuan, harga: itemDraft.hargaVendor1, ppn: itemDraft.ppn }, satuanList).total)}</b>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
              <Button variant="ghost" onClick={() => setShowItemModal(false)}>Batal</Button>
              <Button icon={Check} onClick={saveItemModal}>Simpan</Button>
            </div>
          </Modal>

          <SatuanSettingsModal
            key={showSatuanModal ? `open-${satuanList.length}` : "closed"}
            open={showSatuanModal}
            onClose={() => setShowSatuanModal(false)}
            satuanList={satuanList}
            setSatuanList={setSatuanList}
            inputStyle={inputStyle}
          />
        </Card>
      )}

      {step === 2 && (
        <Card>
          <h3 style={{ fontFamily: font.display, fontSize: 16, marginBottom: 4 }}>Konfirmasi</h3>
          <p style={{ color: T.muted, fontSize: 12.5, marginBottom: 18 }}>Cek dulu datanya, bisa langsung diunduh dari sini sebelum disimpan final.</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 24px", marginBottom: 18, borderBottom: `1px solid ${T.border}`, paddingBottom: 16 }} className="responsive-form-grid">
            <ReviewRow label="Submission ID" value={activeRab?.idNumber} />
            <ReviewRow label="Tanggal" value={formatTanggal(form.tanggal)} />
            <ReviewRow label="Nama Pengadaan" value={form.namaPengadaan} full />
            <ReviewRow label="Procost" value={form.procost} />
            <ReviewRow label="Exp. Type" value={form.expType} />
            <ReviewRow label="Task" value={form.task} />
            <ReviewRow label="Exp. Org" value={form.expOrg} />
            <ReviewRow label="Vendor 1" value={form.vendor1} />
            <ReviewRow label="Vendor 2" value={form.vendor2 || "-"} />
            <ReviewRow label="Vendor 3" value={form.vendor3 || "-"} />
          </div>

          <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden", overflowX: "auto", marginBottom: 6 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead><tr>{["Uraian", "Qty", "Satuan", "Harga vendor 1", "PPN", "Total"].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {items.map((r, i) => (
                  <tr key={r.id} style={{ background: i % 2 ? T.rowAlt : T.card }}>
                    <td style={{ ...td, whiteSpace: "normal" }}>{r.uraian}</td>
                    <td style={{ ...td, textAlign: "right" }}>{r.qty}</td>
                    <td style={td}>{r.satuan}</td>
                    <td style={{ ...td, textAlign: "right" }}>{rupiah(r.hargaVendor1 || 0)}</td>
                    <td style={td}>{r.ppn || "-"}</td>
                    <td style={{ ...td, textAlign: "right", fontWeight: 700 }}>{rupiah(hitungTotalDenganSatuan({ qty: r.qty, satuan: r.satuan, harga: r.hargaVendor1, ppn: r.ppn }, satuanList).total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ textAlign: "right", marginBottom: 18, fontSize: 16, fontWeight: 700, color: T.heading }}>Grand Total: {rupiah(grandTotal)}</div>

          <SectionLabel dashed>Pratinjau Dokumen (A4, sesuai Template_Lampiran_1.docx)</SectionLabel>
          <div style={{ marginBottom: 16 }}>
            <Lampiran1Preview
              submissionId={activeRab?.idNumber}
              tanggal={formatTanggal(form.tanggal)}
              namaPengadaan={form.namaPengadaan}
              procost={form.procost}
              expType={form.expType}
              task={form.task}
              expOrg={form.expOrg}
              items={items.map((r) => ({
                uraian: r.uraian, qty: r.qty, satuan: r.satuan, hargaVendor1: r.hargaVendor1,
              }))}
              grandTotal={grandTotal}
              vendor1={form.vendor1}
              vendor2={form.vendor2}
              vendor3={form.vendor3}
            />
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 6, flexWrap: "wrap" }}>
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
    <div style={{ gridColumn: full ? "1 / -1" : "auto", display: "grid", gridTemplateColumns: "140px 1fr", gap: 12, fontSize: 13, padding: "6px 0", alignItems: "start" }}>
      <div style={{ color: T.muted }}>{label}</div>
      <div style={{ fontWeight: 600, color: T.text, wordBreak: "break-word", overflowWrap: "anywhere" }}>{value || "-"}</div>
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
