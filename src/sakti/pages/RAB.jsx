import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Pencil,
  Plus,
  Printer,
  Trash2,
  X,
} from "lucide-react";
import { T, font } from "../../lib/theme";
import { OPT } from "../../lib/data";
import { nextIdFor, rupiah, uid } from "../../lib/utils";
import { generateSikasPdf, rowsFromFields } from "../../lib/pdf";
import { generateDocxFromTemplate } from "../../lib/docxGenerate";
import { RabDocPreview } from "../../components/DocTemplatePreview";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import FlowSteps from "../../components/FlowSteps";
import DataTable from "../../components/DataTable";
import MiniField, { miniInputStyle } from "../../components/MiniField";

const STEPS = ["Data RAB", "Uraian RAB", "Konfirmasi", "Simpan"];

const MONTHS_ID = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

const buildSimpleFields = () => [
  { key: "idNumber", label: "ID number", hint: "otomatis, bisa diubah manual" },
  { key: "tanggalRab", label: "Tanggal RAB", type: "date" },
  { key: "judulKegiatan", label: "Judul program", full: true },
  { key: "dokumenTor", label: "Dokumen TOR", type: "file-upload", full: true },
];

const simpleFieldLabels = {
  idNumber: "ID number",
  tanggalRab: "Tanggal RAB",
  judulKegiatan: "Judul program",
  dokumenTor: "Dokumen TOR",
};

function itemTotals(row) {
  const qty = Number(row.qty) || 0;
  const harga = Number(row.harga) || 0;
  const qtyEval = Number(row.qtyEvaluasi) || 0;
  const hargaEval = Number(row.hargaEvaluasi) || 0;
  const ppn = row.ppn === "11%" ? 1.11 : 1;
  const ppnEval = row.ppnEvaluasi === "11%" ? 1.11 : 1;
  return {
    total: qty * harga * ppn,
    totalEvaluasi: qtyEval * hargaEval * ppnEval,
  };
}

function formatTanggalDisplay(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
}

function monthKey(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}

function monthLabel(key) {
  const [year, month] = key.split("-");
  return `${MONTHS_ID[parseInt(month,10)-1]} ${year}`;
}

export default function RABPage({ rab, setRab, vendors, notify, defaultKategori }) {
  const [mode, setMode] = useState("list");
  const [step, setStep] = useState(0);
  const [items, setItems] = useState([]);
  const [header, setHeader] = useState({});
  const [rowDraft, setRowDraft] = useState({});
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [reviewRow, setReviewRow] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingRab, setEditingRab] = useState(null);
  const [rabPreview, setRabPreview] = useState(null);
  const [filterBulan, setFilterBulan] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const totalEvaluasi = items.reduce((s, r) => s + (r.totalEvaluasi || 0), 0);

  const baseRab = useMemo(
    () => (defaultKategori ? rab.filter((r) => r.kategori === defaultKategori) : rab),
    [rab, defaultKategori]
  );

  const bulanOptions = useMemo(() => {
    const months = new Set();
    baseRab.forEach(r => { const k = monthKey(r.tanggalRab || r.tanggalInput); if (k) months.add(k); });
    return [...months].sort().reverse();
  }, [baseRab]);

  const displayRab = useMemo(
    () => (filterBulan ? baseRab.filter(r => monthKey(r.tanggalRab || r.tanggalInput) === filterBulan) : baseRab),
    [baseRab, filterBulan]
  );

  const startWizard = () => {
    setItems([]);
    setRowDraft({});
    setEditingId(null);
    setEditingRab(null);
    const baseHeader = { idNumber: nextIdFor("RAB", rab, "idNumber") };
    if (defaultKategori) baseHeader.kategori = defaultKategori;
    setHeader(baseHeader);
    setStep(0);
    setMode("wizard");
  };

  const startEdit = (row) => {
    setReviewRow(null);
    setItems(row.items || []);
    setRowDraft({});
    setEditingId(null);
    setEditingRab(row);
    setHeader({ ...row });
    setStep(0);
    setMode("wizard");
  };

  const saveRow = () => {
    if (!rowDraft.uraian) return notify("Isi uraian barang terlebih dahulu.", "error");
    const totals = itemTotals(rowDraft);
    if (editingId) {
      setItems((prev) => prev.map((r) => r.id === editingId ? { ...r, ...rowDraft, ...totals, id: editingId } : r));
      setEditingId(null);
    } else {
      setItems((prev) => [...prev, { id: uid("ITM"), ...rowDraft, ...totals }]);
    }
    setRowDraft({});
  };

  const startEditRow = (row) => {
    setRowDraft({ ...row });
    setEditingId(row.id);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => { setRowDraft({}); setEditingId(null); };

  const deleteRow = (id) => {
    if (editingId === id) cancelEdit();
    setItems((prev) => prev.filter((r) => r.id !== id));
  };

  const saveAll = () => {
    const record = { ...header, items, totalEvaluasi };
    if (editingRab) {
      setRab((prev) => prev.map((r) => r === editingRab ? { ...r, ...record } : r));
    } else {
      setRab((prev) => [...prev, { ...record, tanggalInput: new Date().toISOString() }]);
    }
    setEditingRab(null);
    setShowSaveModal(false);
    setShowSuccessModal(true);
  };

  const finish = () => {
    setShowSuccessModal(false);
    setMode("list");
    notify("Data RAB berhasil disimpan!", "success", "RAB");
  };

  const doDeleteRab = (row) => {
    setRab((prev) => prev.filter((r) => r !== row));
    setDeleteConfirm(null);
    notify("RAB berhasil dihapus.", "success");
  };

  const doDownloadRabPdf = async (record) => {
    const fields = buildSimpleFields();
    await generateSikasPdf({
      title: "Rencana Anggaran Biaya (RAB)",
      subtitle: `${record.idNumber || "-"} · Total Evaluasi ${rupiah(record.totalEvaluasi || 0)}`,
      rows: fields.map((f) => ({ label: f.label, value: record[f.key] || "-" })),
      table: record.items || [],
      filename: `RAB-${record.idNumber || "record"}`,
    });
  };

  const doDownloadRabDocx = async (record) => {
    const idText = record.idNumber || "record";
    const itemsText = (record.items || []).map((item, i) =>
      `${i + 1}. ${item.uraian || ""} - Qty: ${item.qtyEvaluasi || item.qty || ""} ${item.satuan || ""} × Rp ${(item.hargaEvaluasi || item.harga || 0).toLocaleString("id-ID")} = Rp ${(item.totalEvaluasi || 0).toLocaleString("id-ID")}`
    ).join("\n");
    try {
      await generateDocxFromTemplate(
        "/templates/Template_RAB.docx",
        {
          idNumber: record.idNumber || "",
          judulKegiatan: record.judulKegiatan || "",
          kategori: record.kategori || "",
          tanggalRab: record.tanggalRab || "",
          totalEvaluasi: rupiah(record.totalEvaluasi || 0),
          itemsText,
          items: (record.items || []).map((item, i) => ({
            no: String(i + 1),
            uraian: item.uraian || "",
            qty: String(item.qtyEvaluasi || item.qty || ""),
            satuan: item.satuan || "",
            harga: rupiah(item.hargaEvaluasi || item.harga || 0),
            total: rupiah(item.totalEvaluasi || 0),
          })),
        },
        `RAB-${idText}.docx`
      );
      notify("RAB (.docx) berhasil diunduh.", "success");
    } catch (e) {
      notify(`Gagal membuat RAB: ${e.message}`, "error");
    }
  };

  const openRabPreview = (record) => {
    setReviewRow(null);
    setRabPreview(record);
  };
  const closeRabPreview = () => setRabPreview(null);

  const renderRabPreview = () => {
    if (!rabPreview) return null;
    const idText = rabPreview.idNumber || "";
    return (
      <Modal open={!!rabPreview} onClose={closeRabPreview} title={idText ? "Preview RAB - " + idText : "Preview RAB"} icon={Eye} width={660}>
        <p style={{ color: T.muted, fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
          Periksa data di bawah. File akan dibuat sesuai template dan diunduh setelah kamu klik tombol download.
        </p>
        <RabDocPreview values={rabPreview} />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20, flexWrap: "wrap" }}>
          <Button variant="ghost" onClick={closeRabPreview}>Batal</Button>
          <Button variant="ghost" icon={Download} onClick={async () => { await doDownloadRabPdf(rabPreview); closeRabPreview(); }}>Download PDF</Button>
          <Button icon={Download} onClick={async () => { await doDownloadRabDocx(rabPreview); closeRabPreview(); }}>Download Word (.docx)</Button>
        </div>
      </Modal>
    );
  };

  if (mode === "list") {
    const pageTitle = defaultKategori ? `RAB - ${defaultKategori}` : "Rencana Anggaran Biaya";
    const pageDesc = defaultKategori
      ? `Daftar RAB dengan kategori ${defaultKategori}. Klik baris untuk melihat detail.`
      : "Kelola seluruh data Rencana Anggaran Biaya. Klik salah satu baris untuk melihat detail atau mengubah data.";
    const addLabel = defaultKategori ? `Buat RAB ${defaultKategori}` : "Add New RAB";

    const LIST_COLUMNS = [
      { key: "idNumber", label: "ID Number" },
      {
        key: "tanggalRab",
        label: "Tanggal RAB",
        render: (r) => r.tanggalRab ? formatTanggalDisplay(r.tanggalRab) : (r.tanggalInput ? new Date(r.tanggalInput).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-"),
      },
      { key: "judulKegiatan", label: "Judul Kegiatan" },
      { key: "kategori", label: "Kategori" },
      { key: "bidang", label: "Bidang" },
      { key: "vendor", label: "Vendor" },
      { key: "totalEvaluasi", label: "Total Evaluasi", render: (r) => rupiah(r.totalEvaluasi) },
      {
        key: "_aksi",
        label: "Aksi",
        render: (r) => (
          <div style={{ display: "inline-flex", gap: 5, justifyContent: "center" }}>
            <button type="button" title="Edit" onClick={(e) => { e.stopPropagation(); startEdit(r); }} style={iconBtnStyle(T.blue)}>
              <Pencil size={13} />
            </button>
            <button type="button" title="Cetak / Unduh" onClick={(e) => { e.stopPropagation(); openRabPreview(r); }} style={iconBtnStyle(T.text)}>
              <Printer size={13} />
            </button>
            <button type="button" title="Hapus" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(r); }} style={iconBtnStyle(T.danger)}>
              <Trash2 size={13} />
            </button>
          </div>
        ),
      },
    ];

    return (
      <div>
        <PageHeader
          eyebrow="Modul RAB"
          title={pageTitle}
          description={pageDesc}
          right={<Button icon={Plus} onClick={startWizard}>{addLabel}</Button>}
        />

        {/* Filter Bulan */}
        {bulanOptions.length > 0 && (
          <Card style={{ marginBottom: 14, padding: "12px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: T.text, whiteSpace: "nowrap" }}>Filter Bulan:</label>
              <select
                value={filterBulan}
                onChange={(e) => setFilterBulan(e.target.value)}
                style={{ padding: "8px 10px", borderRadius: 7, border: `1px solid ${T.border}`, background: T.inputBg, color: T.text, fontSize: 13, flex: "0 0 auto" }}
              >
                <option value="">Semua bulan</option>
                {bulanOptions.map((k) => (
                  <option key={k} value={k}>{monthLabel(k)}</option>
                ))}
              </select>
              {filterBulan && (
                <button type="button" onClick={() => setFilterBulan("")} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                  <X size={12} /> Hapus filter
                </button>
              )}
            </div>
          </Card>
        )}

        <Card padded={false}>
          <DataTable
            emptyLabel={`Belum ada RAB${defaultKategori ? ` kategori ${defaultKategori}` : ""}. Klik "${addLabel}" untuk membuat pengajuan pertama.`}
            columns={LIST_COLUMNS}
            rows={displayRab}
            onRowClick={setReviewRow}
          />
        </Card>

        {/* Review Modal */}
        <RabReviewModal
          row={reviewRow}
          onClose={() => setReviewRow(null)}
          onEdit={startEdit}
          onDownload={openRabPreview}
        />

        {/* Delete Confirm Modal */}
        <Modal
          open={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="Hapus RAB?"
          icon={Trash2}
          width={420}
        >
          <p style={{ color: T.muted, fontSize: 13.5, marginBottom: 20, lineHeight: 1.6 }}>
            RAB <b style={{ fontFamily: font.mono, color: T.text }}>{deleteConfirm?.idNumber}</b> akan dihapus permanen dan tidak bisa dipulihkan.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>Batal</Button>
            <Button variant="accent" icon={Trash2} onClick={() => doDeleteRab(deleteConfirm)}>Hapus</Button>
          </div>
        </Modal>

        {renderRabPreview()}
      </div>
    );
  }

  const savingNow = showSaveModal || showSuccessModal;
  const currentStep = savingNow ? 3 : step;

  return (
    <div>
      <PageHeader
        eyebrow={editingRab ? "Edit RAB" : "Add New RAB"}
        title="Formulir Pengajuan RAB"
        right={
          <Button variant="ghost" icon={ArrowLeft} onClick={() => setMode("list")}>
            Kembali ke daftar
          </Button>
        }
      />
      <FlowSteps steps={STEPS} current={currentStep} />

      {step === 0 && (
        <StepDataRAB
          header={header}
          setHeader={setHeader}
          onNext={() => setStep(1)}
        />
      )}

      {step === 1 && (
        <StepUraian
          rowDraft={rowDraft}
          setRowDraft={setRowDraft}
          items={items}
          editingId={editingId}
          onSaveRow={saveRow}
          onEditRow={startEditRow}
          onCancelEdit={cancelEdit}
          onDeleteRow={deleteRow}
          onBack={() => setStep(0)}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && !savingNow && (
        <StepKonfirmasi
          header={header}
          items={items}
          totalEvaluasi={totalEvaluasi}
          onBack={() => setStep(1)}
          onSave={() => setShowSaveModal(true)}
        />
      )}

      <Modal open={showSaveModal} onClose={() => setShowSaveModal(false)} title="Simpan Data RAB?" icon={Check} width={420}>
        <p style={{ color: T.muted, fontSize: 13.5, marginBottom: 20, lineHeight: 1.6 }}>
          RAB <b style={{ fontFamily: font.mono, color: T.text }}>{header.idNumber}</b> dengan total evaluasi{" "}
          <b style={{ color: T.text }}>{rupiah(totalEvaluasi)}</b> akan disimpan.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button variant="ghost" onClick={() => setShowSaveModal(false)}>Batal</Button>
          <Button variant="accent" icon={Check} onClick={saveAll}>Simpan Data</Button>
        </div>
      </Modal>

      <SimpanScreen
        open={showSuccessModal}
        header={header}
        items={items}
        totalEvaluasi={totalEvaluasi}
        onDone={finish}
        onDownloadDocx={() => doDownloadRabDocx({ ...header, items, totalEvaluasi })}
        onDownloadPdf={() => doDownloadRabPdf({ ...header, items, totalEvaluasi })}
      />

      {renderRabPreview()}
    </div>
  );
}

// ===================== STEP COMPONENTS =====================

function StepDataRAB({ header, setHeader, onNext }) {
  const set = (key, val) => setHeader((prev) => ({ ...prev, [key]: val }));

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) set("dokumenTor", file.name);
  };

  const inp = {
    width: "100%",
    padding: "9px 11px",
    borderRadius: 8,
    border: `1px solid ${T.border}`,
    background: T.inputBg,
    color: T.text,
    fontSize: 13,
    boxSizing: "border-box",
    fontFamily: font.body,
  };

  return (
    <Card>
      <h3 style={{ fontFamily: font.display, fontSize: 16, marginBottom: 4 }}>Data RAB</h3>
      <p style={{ fontSize: 12.5, color: T.muted, marginBottom: 18, lineHeight: 1.6 }}>
        Isian dasar untuk RAB ini. Detail biaya diisi di step Uraian RAB.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px" }}>
        <div>
          <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: T.text, marginBottom: 6 }}>
            ID number <span style={{ fontWeight: 400, color: T.muted }}>(otomatis, bisa diubah manual)</span>
          </label>
          <input
            style={inp}
            value={header.idNumber || ""}
            onChange={(e) => set("idNumber", e.target.value)}
            placeholder="cth. RAB-2026-001"
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: T.text, marginBottom: 6 }}>
            Tanggal RAB
          </label>
          <input
            type="date"
            style={inp}
            value={header.tanggalRab || ""}
            onChange={(e) => set("tanggalRab", e.target.value)}
          />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: T.text, marginBottom: 6 }}>
            Judul program
          </label>
          <input
            style={inp}
            value={header.judulKegiatan || ""}
            onChange={(e) => set("judulKegiatan", e.target.value)}
            placeholder="cth. Bantuan Perbaikan Jalan Metro Marina Ancol"
          />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: T.text, marginBottom: 6 }}>
            Dokumen TOR
          </label>
          {header.dokumenTor ? (
            <div style={{
              border: `1.5px solid ${T.success}`,
              borderRadius: 9,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: T.successSoft,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "#fff", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <FileText size={18} color={T.success} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{header.dokumenTor}</div>
                <div style={{ fontSize: 11.5, color: T.muted }}>File TOR terlampir</div>
              </div>
              <button type="button" onClick={() => set("dokumenTor", null)} style={{ border: "none", background: "none", color: T.muted, cursor: "pointer", display: "flex", alignItems: "center" }}>
                <X size={15} />
              </button>
            </div>
          ) : (
            <label style={{
              border: `1.5px dashed #A9C7D4`,
              borderRadius: 9,
              padding: "18px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: T.bg,
              cursor: "pointer",
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: T.blueSoft, display: "grid", placeItems: "center", flexShrink: 0 }}>
                <FileText size={18} color={T.blue} />
              </div>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: T.text }}>Klik untuk lampirkan file TOR</div>
                <div style={{ fontSize: 11.5, color: T.muted }}>PDF, Word, atau format lainnya</div>
              </div>
              <input type="file" style={{ display: "none" }} onChange={handleFile} />
            </label>
          )}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 22 }}>
        <Button onClick={onNext}>Lanjutkan <ArrowRight size={15} /></Button>
      </div>
    </Card>
  );
}

function StepUraian({ rowDraft, setRowDraft, items, editingId, onSaveRow, onEditRow, onCancelEdit, onDeleteRow, onBack, onNext }) {
  const set = (key) => (e) => setRowDraft({ ...rowDraft, [key]: e.target.value });
  return (
    <Card>
      <div style={{ display: "flex", gap: 8, alignItems: "center", background: "#FFF4D6", color: T.yellowText, padding: "10px 14px", borderRadius: 8, marginBottom: 18, fontSize: 13 }}>
        ⚠️ Hati-hati dalam pengisian RAB! Data akan tampil seperti tabel Excel pada dasbor.
      </div>

      <h3 style={{ fontFamily: font.display, fontSize: 16, marginBottom: 4 }}>Input Uraian RAB (per item)</h3>
      <p style={{ fontSize: 12.5, color: T.muted, marginBottom: 16 }}>
        Isi satu baris untuk tiap barang/jasa, lalu tekan "Tambah baris" untuk menambahkannya ke tabel di bawah.
      </p>

      <SectionHeader>Harga Pengajuan</SectionHeader>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-start", gap: 14, marginBottom: 18 }}>
        <MiniField label="Uraian" full>
          <input placeholder="Nama barang/jasa" value={rowDraft.uraian || ""} onChange={set("uraian")} style={miniInputStyle} />
        </MiniField>
        <MiniField label="Satuan">
          <SelectOrManual options={OPT.satuan} value={rowDraft.satuan || ""} onChange={(v) => setRowDraft({ ...rowDraft, satuan: v })} manualPlaceholder="Ketik satuan sendiri…" />
        </MiniField>
        <MiniField label="Qty">
          <input type="number" placeholder="0" value={rowDraft.qty || ""} onChange={set("qty")} style={miniInputStyle} />
        </MiniField>
        <MiniField label="Harga Satuan">
          <input type="number" placeholder="Rp 0" value={rowDraft.harga || ""} onChange={set("harga")} style={miniInputStyle} />
        </MiniField>
        <MiniField label="PPN">
          <select value={rowDraft.ppn || ""} onChange={set("ppn")} style={miniInputStyle}>
            <option value="">Pilih…</option>
            {OPT.ppn.map((s) => <option key={s}>{s}</option>)}
          </select>
        </MiniField>
      </div>

      <SectionHeader dashed>Harga Evaluasi</SectionHeader>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-start", gap: 14, marginBottom: 18 }}>
        <MiniField label="Qty Evaluasi">
          <input type="number" placeholder="0" value={rowDraft.qtyEvaluasi || ""} onChange={set("qtyEvaluasi")} style={miniInputStyle} />
        </MiniField>
        <MiniField label="Harga Satuan Evaluasi">
          <input type="number" placeholder="Rp 0" value={rowDraft.hargaEvaluasi || ""} onChange={set("hargaEvaluasi")} style={miniInputStyle} />
        </MiniField>
        <MiniField label="PPN Evaluasi">
          <select value={rowDraft.ppnEvaluasi || ""} onChange={set("ppnEvaluasi")} style={miniInputStyle}>
            <option value="">Pilih…</option>
            {OPT.ppn.map((s) => <option key={s}>{s}</option>)}
          </select>
        </MiniField>
        <MiniField label="Keterangan">
          <input placeholder="Opsional" value={rowDraft.keterangan || ""} onChange={set("keterangan")} style={miniInputStyle} />
        </MiniField>
        <MiniField label="Ket. Pemakaian" full>
          <input placeholder="Opsional" value={rowDraft.ketPemakaian || ""} onChange={set("ketPemakaian")} style={miniInputStyle} />
        </MiniField>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 6 }}>
        {editingId && <Button variant="ghost" onClick={onCancelEdit}>Batal edit</Button>}
        <Button variant={editingId ? "primary" : "subtle"} icon={editingId ? Check : Plus} onClick={onSaveRow}>
          {editingId ? "Update baris" : "Tambah baris"}
        </Button>
      </div>
      {editingId && (
        <p style={{ fontSize: 11.5, color: T.blue, marginBottom: 14 }}>
          Sedang mengedit baris — perubahan tersimpan setelah tekan "Update baris".
        </p>
      )}

      {items.length === 0 ? (
        <div style={{ padding: "36px 20px", textAlign: "center", border: `1px dashed ${T.border}`, borderRadius: 10, color: T.muted, fontSize: 13 }}>
          Belum ada baris item. Lengkapi form di atas lalu tekan <b style={{ color: T.text }}>Tambah baris</b>.
        </div>
      ) : (
        <BreakdownTable items={items} editingId={editingId} onEdit={onEditRow} onDelete={onDeleteRow} />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
        <Button variant="ghost" icon={ArrowLeft} onClick={onBack}>Kembali</Button>
        <Button disabled={!items.length} onClick={onNext}>Lanjutkan <ArrowRight size={15} /></Button>
      </div>
    </Card>
  );
}

function StepKonfirmasi({ header, items, totalEvaluasi, onBack, onSave }) {
  const totalPengajuan = items.reduce((s, r) => s + (r.total || 0), 0);
  return (
    <Card>
      <h3 style={{ fontFamily: font.display, fontSize: 16, marginBottom: 4 }}>Konfirmasi RAB</h3>
      <p style={{ color: T.muted, fontSize: 13, marginBottom: 18 }}>Periksa kembali semua data sebelum disimpan.</p>

      <SectionHeader>Data RAB</SectionHeader>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", marginBottom: 18, paddingBottom: 16, borderBottom: `1px solid ${T.border}` }}>
        <ReviewRow label="ID number" value={header.idNumber} />
        <ReviewRow label="Tanggal RAB" value={formatTanggalDisplay(header.tanggalRab)} />
        <ReviewRow label="Judul program" value={header.judulKegiatan} full />
        {header.dokumenTor && <ReviewRow label="Dokumen TOR" value={`📄 ${header.dokumenTor}`} full />}
      </div>

      <SectionHeader>Uraian RAB ({items.length} baris)</SectionHeader>
      <BreakdownTable items={items} compact />

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", background: T.blueSoft, border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px 18px", margin: "14px 0 4px" }}>
        <div>
          <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.4, color: T.muted, fontWeight: 700 }}>Total Pengajuan</div>
          <div style={{ fontFamily: font.display, fontSize: 19, color: T.heading, marginTop: 2 }}>{rupiah(totalPengajuan)}</div>
        </div>
        <div>
          <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.4, color: T.blue, fontWeight: 700 }}>Total Realisasi Evaluasi</div>
          <div style={{ fontFamily: font.display, fontSize: 19, color: T.navy, marginTop: 2 }}>{rupiah(totalEvaluasi)}</div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
        <Button variant="ghost" icon={ArrowLeft} onClick={onBack}>Tidak, edit lagi</Button>
        <Button onClick={onSave}>Ya, simpan <ArrowRight size={15} /></Button>
      </div>
    </Card>
  );
}

function SimpanScreen({ open, header, items, totalEvaluasi, onDone, onDownloadDocx, onDownloadPdf }) {
  if (!open) return null;
  return (
    <Card>
      <div style={{ textAlign: "center", padding: "10px 0 6px" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: T.successSoft, display: "grid", placeItems: "center", margin: "0 auto 14px" }}>
          <CheckCircle2 size={28} color={T.success} />
        </div>
        <h3 style={{ fontFamily: font.display, fontSize: 17, margin: "0 0 6px" }}>Data RAB Berhasil Disimpan!</h3>
        <p style={{ color: T.muted, fontSize: 13, margin: "0 0 20px" }}>{header.idNumber} sudah tercatat di daftar RAB.</p>

        {/* Doc preview */}
        <div style={{
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          padding: "20px 24px",
          background: "#fff",
          maxWidth: 520,
          margin: "0 auto 18px",
          textAlign: "left",
          fontSize: 12.5,
        }}>
          <div style={{ textAlign: "center", fontWeight: 700, fontSize: 13.5, marginBottom: 2, color: T.navy }}>RENCANA ANGGARAN BIAYA</div>
          <div style={{ textAlign: "center", color: T.muted, fontSize: 11, marginBottom: 16 }}>PT PLN Indonesia Power UBP Priok</div>
          {[
            ["ID number", header.idNumber],
            ["Judul program", header.judulKegiatan],
            ["Tanggal RAB", formatTanggalDisplay(header.tanggalRab)],
            ["Total realisasi evaluasi", rupiah(totalEvaluasi)],
          ].map(([label, val]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px dotted ${T.border}` }}>
              <span style={{ color: T.muted }}>{label}</span>
              <span style={{ fontWeight: 600, maxWidth: "60%", textAlign: "right" }}>{val || "-"}</span>
            </div>
          ))}

          {/* TTD block */}
          <div style={{ display: "flex", justifyContent: "space-around", marginTop: 28, textAlign: "center", fontSize: 11.5 }}>
            <div>
              <div style={{ color: T.muted }}>Pembuat</div>
              <div style={{ borderTop: `1px solid ${T.text}`, width: 110, margin: "38px auto 4px" }} />
              <div style={{ fontWeight: 700 }}>Nama User Login</div>
              <span style={{ display: "inline-block", marginTop: 4, fontSize: 9.5, background: T.successSoft, color: T.success, padding: "2px 7px", borderRadius: 999, fontWeight: 700 }}>otomatis dari akun</span>
            </div>
            <div>
              <div style={{ color: T.muted }}>Menyetujui</div>
              <div style={{ borderTop: `1px solid ${T.text}`, width: 110, margin: "38px auto 4px" }} />
              <div style={{ fontWeight: 700 }}>Nama Asman</div>
              <span style={{ display: "inline-block", marginTop: 4, fontSize: 9.5, background: T.successSoft, color: T.success, padding: "2px 7px", borderRadius: 999, fontWeight: 700 }}>otomatis, sesuai bidang</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 10 }}>
          <Button variant="ghost" icon={Download} onClick={onDownloadDocx}>Unduh Word (.docx)</Button>
          <Button variant="ghost" icon={Download} onClick={onDownloadPdf}>Unduh PDF</Button>
        </div>
        <Button icon={ArrowLeft} onClick={onDone} style={{ width: "100%", justifyContent: "center" }}>
          Kembali ke Daftar RAB
        </Button>
      </div>
    </Card>
  );
}

// ===================== REVIEW MODAL =====================

function RabReviewModal({ row, onClose, onEdit, onDownload }) {
  if (!row) return null;
  const items = row.items || [];
  const totalEvaluasi = items.reduce((s, r) => s + (r.totalEvaluasi || 0), 0);

  return (
    <Modal open={!!row} onClose={onClose} title={`Review ${row.idNumber || "RAB"}`} icon={Eye} width={580}>
      <p style={{ color: T.muted, fontSize: 12.5, marginBottom: 14, lineHeight: 1.6 }}>
        Ringkasan data yang sudah tersimpan. Ini bukan mode edit, cuma buat lihat sekilas.
      </p>

      <SectionHeader>Data RAB</SectionHeader>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 16px", marginBottom: 16 }}>
        <ReviewRow label="ID number" value={row.idNumber} />
        <ReviewRow label="Tanggal RAB" value={formatTanggalDisplay(row.tanggalRab)} />
        <ReviewRow label="Judul program" value={row.judulKegiatan} full />
        {row.dokumenTor && <ReviewRow label="Dokumen TOR" value={`📄 ${row.dokumenTor}`} full />}
      </div>

      <SectionHeader>Uraian RAB ({items.length} baris)</SectionHeader>
      <div style={{ overflowX: "auto", border: `1px solid ${T.border}`, borderRadius: 10, marginBottom: 14 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
          <thead>
            <tr>
              {["Uraian", "Qty", "PPN", "Total Evaluasi"].map((h) => (
                <th key={h} style={{ background: T.blueSoft, color: T.navy, fontWeight: 700, textAlign: h === "Uraian" ? "left" : "right", padding: "8px 10px", fontSize: 10.5, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: "center", padding: "16px", color: T.muted, fontSize: 12.5 }}>Tidak ada uraian</td></tr>
            )}
            {items.map((r, i) => (
              <tr key={r.id || i} style={{ background: i % 2 ? T.rowAlt : T.card }}>
                <td style={{ padding: "8px 10px", borderBottom: `1px solid ${T.border}` }}>{r.uraian}</td>
                <td style={{ padding: "8px 10px", borderBottom: `1px solid ${T.border}`, textAlign: "right" }}>{r.qtyEvaluasi || r.qty || 0}</td>
                <td style={{ padding: "8px 10px", borderBottom: `1px solid ${T.border}`, textAlign: "right", color: T.muted }}>{r.ppnEvaluasi || r.ppn || "-"}</td>
                <td style={{ padding: "8px 10px", borderBottom: `1px solid ${T.border}`, textAlign: "right", fontWeight: 700, color: T.navy }}>{rupiah(r.totalEvaluasi)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", gap: 24, background: T.blueSoft, border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 10.5, textTransform: "uppercase", color: T.blue, fontWeight: 700 }}>Total Realisasi Evaluasi</div>
          <div style={{ fontFamily: font.display, fontSize: 18, color: T.navy, marginTop: 2 }}>{rupiah(totalEvaluasi)}</div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <Button variant="ghost" onClick={onClose}>Tutup</Button>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="ghost" icon={Download} onClick={() => { onClose(); onDownload(row); }}>Cetak / Unduh</Button>
          <Button icon={Pencil} onClick={() => onEdit(row)}>Edit RAB ini</Button>
        </div>
      </div>
    </Modal>
  );
}

// ===================== TABLE =====================

function BreakdownTable({ items, onEdit, onDelete, editingId, compact }) {
  const th = { padding: "9px 11px", background: T.blueSoft, color: T.navy, fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.3, borderBottom: `1px solid ${T.border}`, textAlign: "left", whiteSpace: "nowrap" };
  const td = { padding: "9px 11px", borderBottom: `1px solid ${T.border}`, color: T.text, fontSize: 12.5, whiteSpace: "nowrap" };
  const num = { textAlign: "right", fontVariantNumeric: "tabular-nums" };
  const showActions = Boolean(onEdit || onDelete);

  const totalPengajuan = items.reduce((s, r) => s + (r.total || 0), 0);
  const totalEvaluasi = items.reduce((s, r) => s + (r.totalEvaluasi || 0), 0);

  if (compact) {
    return (
      <div style={{ overflowX: "auto", border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden", marginBottom: 14 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>Uraian</th>
              <th style={th}>Satuan</th>
              <th style={{ ...th, ...num }}>Qty</th>
              <th style={{ ...th, ...num }}>Total Pengajuan</th>
              <th style={{ ...th, ...num }}>PPN</th>
              <th style={{ ...th, ...num }}>Total Evaluasi</th>
              <th style={th}>Ket. Pemakaian</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r, i) => (
              <tr key={r.id || i} style={{ background: i % 2 ? T.rowAlt : T.card }}>
                <td style={{ ...td, fontWeight: 600, whiteSpace: "normal", minWidth: 160 }}>{r.uraian}</td>
                <td style={td}>{r.satuan || "-"}</td>
                <td style={{ ...td, ...num }}>{r.qtyEvaluasi || r.qty || 0}</td>
                <td style={{ ...td, ...num }}>{rupiah(r.total)}</td>
                <td style={{ ...td, ...num, color: T.muted }}>{r.ppnEvaluasi || r.ppn || "-"}</td>
                <td style={{ ...td, ...num, fontWeight: 700, color: T.navy }}>{rupiah(r.totalEvaluasi)}</td>
                <td style={{ ...td, color: r.ketPemakaian ? T.text : T.muted }}>{r.ketPemakaian || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const groupTh = { ...th, textAlign: "center", color: T.blue, borderBottom: `1px dashed ${T.border}`, fontFamily: font.mono };
  const divider = { borderLeft: `1px dashed ${T.border}` };

  return (
    <div style={{ overflowX: "auto", border: `1px solid ${T.border}`, borderRadius: 10 }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={groupTh} colSpan={2}></th>
            <th style={groupTh} colSpan={4}>Harga Pengajuan</th>
            <th style={{ ...groupTh, ...divider }} colSpan={4}>Harga Evaluasi</th>
            <th style={{ ...groupTh, ...divider }} colSpan={2}>Keterangan</th>
            {showActions && <th style={{ ...groupTh, ...divider }}></th>}
          </tr>
          <tr>
            <th style={th}>Uraian</th>
            <th style={th}>Satuan</th>
            <th style={{ ...th, ...num }}>Qty</th>
            <th style={{ ...th, ...num }}>Harga</th>
            <th style={{ ...th, ...num }}>PPN</th>
            <th style={{ ...th, ...num }}>Total</th>
            <th style={{ ...th, ...num, ...divider }}>Qty</th>
            <th style={{ ...th, ...num }}>Harga</th>
            <th style={{ ...th, ...num }}>PPN</th>
            <th style={{ ...th, ...num }}>Total</th>
            <th style={{ ...th, ...divider }}>Keterangan</th>
            <th style={th}>Ket. Pemakaian</th>
            {showActions && <th style={{ ...th, ...divider, textAlign: "center" }}>Aksi</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((r, i) => {
            const isEditing = editingId && editingId === r.id;
            return (
              <tr key={r.id || i} style={{ background: isEditing ? T.blueSoft : i % 2 ? T.rowAlt : T.card, outline: isEditing ? `2px solid ${T.blue}` : "none", outlineOffset: -2 }}>
                <td style={{ ...td, fontWeight: 600, color: T.heading, whiteSpace: "normal", minWidth: 160 }}>{r.uraian}</td>
                <td style={td}>{r.satuan || "-"}</td>
                <td style={{ ...td, ...num }}>{r.qty || 0}</td>
                <td style={{ ...td, ...num }}>{rupiah(r.harga)}</td>
                <td style={{ ...td, ...num, color: T.muted }}>{r.ppn || "-"}</td>
                <td style={{ ...td, ...num, fontWeight: 700, color: T.heading }}>{rupiah(r.total)}</td>
                <td style={{ ...td, ...num, ...divider }}>{r.qtyEvaluasi || 0}</td>
                <td style={{ ...td, ...num }}>{rupiah(r.hargaEvaluasi)}</td>
                <td style={{ ...td, ...num, color: T.muted }}>{r.ppnEvaluasi || "-"}</td>
                <td style={{ ...td, ...num, fontWeight: 700, color: T.navy }}>{rupiah(r.totalEvaluasi)}</td>
                <td style={{ ...td, ...divider, color: r.keterangan ? T.text : T.muted, maxWidth: 180, whiteSpace: "normal" }}>{r.keterangan || "-"}</td>
                <td style={{ ...td, color: r.ketPemakaian ? T.text : T.muted, maxWidth: 180, whiteSpace: "normal" }}>{r.ketPemakaian || "-"}</td>
                {showActions && (
                  <td style={{ ...td, ...divider, textAlign: "center" }}>
                    <div style={{ display: "inline-flex", gap: 4 }}>
                      {onEdit && <button type="button" title="Edit baris" onClick={() => onEdit(r)} style={iconBtnStyle(T.blue)}><Pencil size={14} /></button>}
                      {onDelete && <button type="button" title="Hapus baris" onClick={() => onDelete(r.id)} style={iconBtnStyle(T.danger)}><Trash2 size={14} /></button>}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ===================== HELPERS =====================

function ReviewRow({ label, value, full }) {
  return (
    <div style={{ gridColumn: full ? "1 / -1" : "auto", display: "grid", gridTemplateColumns: "140px 1fr", gap: "3px 10px", padding: "5px 0", fontSize: 13 }}>
      <div style={{ color: T.muted }}>{label}</div>
      <div style={{ fontWeight: 600, color: T.text }}>{value || "-"}</div>
    </div>
  );
}

function SectionHeader({ children, dashed }) {
  return (
    <div style={{ fontFamily: font.mono, fontSize: 11.5, letterSpacing: 0.6, textTransform: "uppercase", color: T.blue, fontWeight: 700, marginBottom: 10, paddingTop: dashed ? 4 : 0, borderTop: dashed ? `1px dashed ${T.border}` : "none" }}>
      {children}
    </div>
  );
}

function SelectOrManual({ options, value, onChange, manualPlaceholder }) {
  const isManual = value === "__manual__";
  const typedOutside = value && value !== "__manual__" && !options.includes(value);
  if (isManual || typedOutside) {
    return (
      <div style={{ display: "flex", gap: 6 }}>
        <input autoFocus value={value === "__manual__" ? "" : value} placeholder={manualPlaceholder || "Ketik sendiri…"} onChange={(e) => onChange(e.target.value || "__manual__")} style={miniInputStyle} />
        <button type="button" title="Kembali ke pilihan" onClick={() => onChange("")} style={{ flexShrink: 0, width: 34, borderRadius: 7, border: `1px solid ${T.border}`, background: T.bg, color: T.muted, cursor: "pointer" }}><X size={13} /></button>
      </div>
    );
  }
  return (
    <select value={value || ""} onChange={(e) => onChange(e.target.value)} style={miniInputStyle}>
      <option value="">Pilih…</option>
      {options.map((o) => <option key={o}>{o}</option>)}
      <option value="__manual__">✎ Isi manual…</option>
    </select>
  );
}

const iconBtnStyle = (color) => ({
  border: `1px solid ${T.border}`,
  background: "#fff",
  color,
  cursor: "pointer",
  width: 28,
  height: 28,
  borderRadius: 6,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
});

export function SuccessModal({ open, message, onDone, onDownloadPdf, onDownloadDocx }) {
  return (
    <Modal open={open} width={420}>
      <div style={{ textAlign: "center", padding: "12px 0" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: T.successSoft, display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
          <CheckCircle2 size={28} color={T.success} />
        </div>
        <h3 style={{ fontFamily: font.display, fontSize: 17, margin: "0 0 6px" }}>Data Anda Telah Berhasil Disimpan!</h3>
        <p style={{ color: T.muted, fontSize: 13, margin: "0 0 20px" }}>{message}</p>
        {onDownloadDocx && (
          <Button variant="ghost" icon={Download} style={{ width: "100%", justifyContent: "center", marginBottom: 8 }} onClick={onDownloadDocx}>
            Preview &amp; Unduh Word (.docx)
          </Button>
        )}
        {onDownloadPdf && (
          <Button variant="ghost" icon={Eye} style={{ width: "100%", justifyContent: "center", marginBottom: 8 }} onClick={onDownloadPdf}>
            Preview &amp; Unduh PDF
          </Button>
        )}
        <Button style={{ width: "100%", justifyContent: "center" }} onClick={onDone}>Selesai</Button>
      </div>
    </Modal>
  );
}
