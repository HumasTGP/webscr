import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Download,
  Eye,
  Pencil,
  Plus,
  Printer,
  Trash2,
  X,
} from "lucide-react";
import { T, font } from "../../lib/theme";
import { nextIdFor } from "../../lib/utils";
import { generateSikasPdf } from "../../lib/pdf";
import { generateDocxFromTemplate } from "../../lib/docxGenerate";
import { TorDocPreview } from "../../components/DocTemplatePreview";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import FlowSteps from "../../components/FlowSteps";
import DataTable from "../../components/DataTable";

const STEPS = ["Isi Formulir", "Konfirmasi", "Simpan"];
const KATEGORI_TABS = ["Semua", "PO", "NON PO", "Cash Card"];
const MONTHS_ID = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

function monthKey(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}

function monthLabel(key) {
  const [year, month] = key.split("-");
  return `${MONTHS_ID[parseInt(month, 10) - 1]} ${year}`;
}

function formatTanggalDisplay(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
}

const sectionHeadStyle = {
  fontFamily: font.mono,
  fontSize: 11.5,
  letterSpacing: "0.6px",
  textTransform: "uppercase",
  color: T.blue,
  fontWeight: 700,
  marginBottom: 10,
  marginTop: 0,
};

const sectionHeadDashedStyle = {
  ...sectionHeadStyle,
  borderTop: `1px dashed ${T.border}`,
  paddingTop: 14,
  marginTop: 4,
};

const fieldFlexStyle = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: "18px 16px",
  marginBottom: 14,
};

const fieldStyle = {
  flex: "1 1 240px",
  maxWidth: 340,
  minWidth: 0,
};

const fieldFullStyle = {
  flex: "1 1 100%",
  maxWidth: "100%",
};

const labelStyle = {
  display: "block",
  fontSize: 12.5,
  fontWeight: 600,
  color: T.text,
  lineHeight: 1.35,
  marginBottom: 6,
};

const hintStyle = { fontWeight: 400, color: T.muted };

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: `1px solid ${T.border}`,
  background: T.inputBg,
  color: T.text,
  fontSize: 13.5,
  fontFamily: font.body,
  boxSizing: "border-box",
};

const inputDisabledStyle = {
  ...inputStyle,
  background: T.bg,
  color: T.muted,
};

const textareaStyle = {
  ...inputStyle,
  resize: "vertical",
  minHeight: 70,
  lineHeight: 1.5,
};

const iconBtnStyle = (color) => ({
  width: 28,
  height: 28,
  borderRadius: 6,
  border: `1px solid ${T.border}`,
  background: T.card,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color,
  padding: 0,
});

const reviewItemStyle = { flex: "1 1 220px", maxWidth: 340, borderBottom: `1px solid ${T.border}`, paddingBottom: 8 };
const reviewItemFullStyle = { flex: "1 1 100%", maxWidth: "100%", borderBottom: `1px solid ${T.border}`, paddingBottom: 8 };

function ReviewItem({ label, value, full }) {
  return (
    <div style={full ? reviewItemFullStyle : reviewItemStyle}>
      <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.4px" }}>{label}</div>
      <div style={{ fontSize: 14, color: T.text, fontWeight: 500, marginTop: 2, whiteSpace: "pre-line" }}>{value || "-"}</div>
    </div>
  );
}

export default function TORPage({ tor, setTor, rab, notify }) {
  const [mode, setMode] = useState("list");
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({});
  const [filterBulan, setFilterBulan] = useState("");
  const [filterKategori, setFilterKategori] = useState("Semua");
  const [reviewRow, setReviewRow] = useState(null);
  const [editingTor, setEditingTor] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [docPreviewRow, setDocPreviewRow] = useState(null);

  const rabIdOptions = useMemo(
    () => rab.map((r) => ({ value: r.idNumber, label: `${r.idNumber}${r.judulKegiatan ? " - " + r.judulKegiatan : ""}` })),
    [rab]
  );

  const baseTor = useMemo(
    () => (filterKategori === "Semua" ? tor : tor.filter((t) => t.kategori === filterKategori)),
    [tor, filterKategori]
  );

  const bulanOptions = useMemo(() => {
    const months = new Set();
    baseTor.forEach((t) => {
      const k = monthKey(t.hariTanggal || t.tanggalInput);
      if (k) months.add(k);
    });
    return [...months].sort().reverse();
  }, [baseTor]);

  const displayTor = useMemo(
    () => (filterBulan ? baseTor.filter((t) => monthKey(t.hariTanggal || t.tanggalInput) === filterBulan) : baseTor),
    [baseTor, filterBulan]
  );

  const setField = (key, val) => {
    if (key === "id") {
      const r = rab.find((r) => r.idNumber === val);
      setValues((prev) => ({ ...prev, id: val, judulKegiatan: r ? (r.judulKegiatan || "") : prev.judulKegiatan }));
    } else {
      setValues((prev) => ({ ...prev, [key]: val }));
    }
  };

  const startWizard = () => {
    setValues({ id: nextIdFor("TOR", tor, "id") });
    setEditingTor(null);
    setStep(0);
    setMode("wizard");
  };

  const startEdit = (row) => {
    setReviewRow(null);
    setEditingTor(row);
    setValues({ ...row });
    setStep(0);
    setMode("wizard");
  };

  const saveAll = () => {
    const record = { ...values };
    if (editingTor) {
      setTor((prev) => prev.map((t) => t === editingTor ? { ...t, ...record } : t));
    } else {
      setTor((prev) => [...prev, { ...record, tanggalInput: new Date().toISOString() }]);
    }
    setEditingTor(null);
    setStep(2);
    notify("Data TOR berhasil disimpan!", "success", "TOR");
  };

  const doDelete = (row) => {
    setTor((prev) => prev.filter((t) => t !== row));
    setDeleteConfirm(null);
    if (reviewRow === row) setReviewRow(null);
    notify("TOR berhasil dihapus.", "success");
  };

  const doDownloadTorDocx = async (record) => {
    const idText = record.id || "tor";
    try {
      await generateDocxFromTemplate(
        "/templates/Template_TOR.docx",
        {
          id: record.id || "",
          judulKegiatan: record.judulKegiatan || "",
          kategori: record.kategori || "",
          latarBelakang: record.latarBelakang || "",
          tujuanUmum: record.tujuanUmum || "",
          tujuanKhusus: record.tujuanKhusus || "",
          sasaran: record.sasaran || "",
          hariTanggal: record.hariTanggal || "",
          tempat: record.tempat || "",
          narasumber: record.narasumber || "",
        },
        `TOR-${idText}.docx`
      );
      notify("TOR (.docx) berhasil diunduh.", "success");
    } catch (e) {
      notify(`Gagal membuat TOR: ${e.message}`, "error");
    }
  };

  const doDownloadTorPdf = async (record) => {
    await generateSikasPdf({
      title: "Term of Reference (TOR)",
      subtitle: record.id || "-",
      rows: [
        { label: "ID TOR", value: record.id || "-" },
        { label: "Judul Kegiatan", value: record.judulKegiatan || "-" },
        { label: "Kategori", value: record.kategori || "-" },
        { label: "Latar Belakang", value: record.latarBelakang || "-" },
        { label: "Tujuan Umum", value: record.tujuanUmum || "-" },
        { label: "Tujuan Khusus", value: record.tujuanKhusus || "-" },
        { label: "Sasaran", value: record.sasaran || "-" },
        { label: "Hari/Tanggal", value: record.hariTanggal || "-" },
        { label: "Tempat", value: record.tempat || "-" },
        { label: "Narasumber", value: record.narasumber || "-" },
      ],
      filename: `TOR-${record.id || "tor"}`,
    });
    notify("TOR (PDF) berhasil diunduh.", "success");
  };

  // ============ LIST MODE ============
  if (mode === "list") {
    const LIST_COLUMNS = [
      { key: "id", label: "ID TOR" },
      { key: "kategori", label: "Kategori" },
      { key: "judulKegiatan", label: "Judul Kegiatan" },
      { key: "tempat", label: "Tempat" },
      {
        key: "hariTanggal",
        label: "Tanggal",
        render: (r) => r.hariTanggal ? formatTanggalDisplay(r.hariTanggal) : (r.tanggalInput ? formatTanggalDisplay(r.tanggalInput) : "-"),
      },
      {
        key: "_aksi",
        label: "Aksi",
        render: (r) => (
          <div style={{ display: "inline-flex", gap: 5, justifyContent: "center" }}>
            <button type="button" title="Edit" onClick={(e) => { e.stopPropagation(); startEdit(r); }} style={iconBtnStyle(T.blue)}>
              <Pencil size={13} />
            </button>
            <button type="button" title="Cetak / Unduh" onClick={(e) => { e.stopPropagation(); setDocPreviewRow(r); }} style={iconBtnStyle(T.text)}>
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
          eyebrow="Modul TOR"
          title="TOR"
          description="Term of Reference kegiatan, dirujuk dari ID RAB. Klik salah satu baris untuk melihat detail atau mengubah data."
          right={<Button icon={Plus} onClick={startWizard}>+ Tambah TOR</Button>}
        />

        {/* Kategori tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 6, background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 5 }}>
          {KATEGORI_TABS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => { setFilterKategori(k); setFilterBulan(""); }}
              style={{
                flex: 1,
                border: "none",
                background: filterKategori === k ? T.navy : "transparent",
                color: filterKategori === k ? "#fff" : T.muted,
                padding: "9px 13px",
                borderRadius: 7,
                fontSize: 12.5,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {k}
            </button>
          ))}
        </div>

        {/* Filter Bulan */}
        <Card style={{ marginBottom: 14, padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: T.text, whiteSpace: "nowrap" }}>Filter Bulan:</span>
            <select
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
              style={{ padding: "8px 10px", borderRadius: 7, border: `1px solid ${T.border}`, background: T.inputBg, color: T.text, fontSize: 13 }}
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

        {/* Table */}
        <DataTable
          columns={LIST_COLUMNS}
          rows={displayTor}
          emptyLabel="Belum ada data TOR. Klik '+ Tambah TOR' untuk membuat pengajuan pertama."
          onRowClick={(r) => setReviewRow(r)}
          searchable
          searchPlaceholder="Cari berdasarkan ID atau judul kegiatan…"
        />

        {/* Review Modal */}
        {reviewRow && (
          <Modal
            open={!!reviewRow}
            onClose={() => setReviewRow(null)}
            title={`Review ${reviewRow.id || "TOR"}`}
            width={560}
          >
            <p style={{ color: T.muted, fontSize: 12.5, marginBottom: 16, marginTop: 0 }}>
              Ringkasan data yang sudah tersimpan. Ini bukan mode edit, cuma buat lihat sekilas.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px 24px", marginBottom: 16 }}>
              <ReviewItem label="ID TOR" value={reviewRow.id} />
              <ReviewItem label="Kategori" value={reviewRow.kategori} />
              <ReviewItem label="Judul Kegiatan" value={reviewRow.judulKegiatan} full />
              <ReviewItem label="Hari/Tanggal" value={reviewRow.hariTanggal ? formatTanggalDisplay(reviewRow.hariTanggal) : "-"} />
              <ReviewItem label="Tempat" value={reviewRow.tempat} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
              <Button variant="ghost" onClick={() => setReviewRow(null)}>Tutup</Button>
              <Button icon={Pencil} onClick={() => startEdit(reviewRow)}>Edit TOR ini</Button>
            </div>
          </Modal>
        )}

        {/* Doc preview + download modal */}
        {docPreviewRow && (
          <Modal
            open={!!docPreviewRow}
            onClose={() => setDocPreviewRow(null)}
            title={docPreviewRow.id ? `Preview TOR - ${docPreviewRow.id}` : "Preview TOR"}
            icon={Eye}
            width={660}
          >
            <p style={{ color: T.muted, fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
              Periksa data di bawah. File akan dibuat sesuai template dan diunduh setelah kamu klik tombol download.
            </p>
            <TorDocPreview values={docPreviewRow} />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20, flexWrap: "wrap" }}>
              <Button variant="ghost" onClick={() => setDocPreviewRow(null)}>Batal</Button>
              <Button variant="ghost" icon={Download} onClick={async () => { await doDownloadTorPdf(docPreviewRow); setDocPreviewRow(null); }}>Download PDF</Button>
              <Button icon={Download} onClick={async () => { await doDownloadTorDocx(docPreviewRow); setDocPreviewRow(null); }}>Download Word (.docx)</Button>
            </div>
          </Modal>
        )}

        {/* Hapus confirm */}
        {deleteConfirm && (
          <Modal
            open={!!deleteConfirm}
            onClose={() => setDeleteConfirm(null)}
            title="Hapus TOR?"
            width={400}
          >
            <p style={{ color: T.text, fontSize: 13.5, lineHeight: 1.6 }}>
              TOR <strong>{deleteConfirm.id}</strong> — <em>{deleteConfirm.judulKegiatan}</em> — akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
              <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>Batal</Button>
              <Button variant="danger" icon={Trash2} onClick={() => doDelete(deleteConfirm)}>Ya, Hapus</Button>
            </div>
          </Modal>
        )}
      </div>
    );
  }

  // ============ WIZARD MODE ============
  const backToList = () => { setMode("list"); setValues({}); setEditingTor(null); setStep(0); };

  // Step 0: Isi Formulir
  if (step === 0) {
    const canNext = values.id && values.judulKegiatan && values.kategori && values.latarBelakang && values.hariTanggal && values.tempat;

    return (
      <div>
        <PageHeader
          eyebrow={editingTor ? "Edit TOR" : "Tambah TOR"}
          title="TOR"
          right={<Button variant="ghost" icon={ArrowLeft} onClick={backToList}>Kembali</Button>}
        />
        <FlowSteps steps={STEPS} current={0} />

        <Card>
          {/* Identitas */}
          <div style={sectionHeadStyle}>Identitas</div>
          <div style={fieldFlexStyle}>
            <div style={fieldStyle}>
              <label style={labelStyle}>
                ID TOR <span style={hintStyle}>(pilih dari ID RAB yang sudah dibuat)</span>
              </label>
              <select
                value={values.id || ""}
                onChange={(e) => setField("id", e.target.value)}
                style={inputStyle}
              >
                <option value="">— Pilih ID RAB —</option>
                {rabIdOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>
                Judul Kegiatan <span style={hintStyle}>(otomatis dari ID RAB)</span>
              </label>
              <input
                value={values.judulKegiatan || ""}
                disabled
                style={inputDisabledStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Kategori</label>
              <select
                value={values.kategori || ""}
                onChange={(e) => setField("kategori", e.target.value)}
                style={inputStyle}
              >
                <option value="">Pilih kategori…</option>
                <option>PO</option>
                <option>NON PO</option>
                <option>Cash Card</option>
              </select>
            </div>
          </div>

          {/* Latar Belakang */}
          <div style={sectionHeadDashedStyle}>Latar Belakang</div>
          <div style={fieldFlexStyle}>
            <div style={fieldFullStyle}>
              <label style={labelStyle}>Latar Belakang</label>
              <textarea
                value={values.latarBelakang || ""}
                onChange={(e) => setField("latarBelakang", e.target.value)}
                style={textareaStyle}
                rows={4}
              />
            </div>
          </div>

          {/* Tujuan */}
          <div style={sectionHeadDashedStyle}>Tujuan</div>
          <div style={fieldFlexStyle}>
            <div style={fieldFullStyle}>
              <label style={labelStyle}>a. Tujuan Umum</label>
              <textarea
                value={values.tujuanUmum || ""}
                onChange={(e) => setField("tujuanUmum", e.target.value)}
                style={textareaStyle}
                rows={3}
              />
            </div>
            <div style={fieldFullStyle}>
              <label style={labelStyle}>
                b. Tujuan Khusus <span style={hintStyle}>(satu poin per baris)</span>
              </label>
              <textarea
                value={values.tujuanKhusus || ""}
                onChange={(e) => setField("tujuanKhusus", e.target.value)}
                style={textareaStyle}
                rows={3}
              />
            </div>
          </div>

          {/* Sasaran */}
          <div style={sectionHeadDashedStyle}>Sasaran</div>
          <div style={fieldFlexStyle}>
            <div style={fieldFullStyle}>
              <label style={labelStyle}>
                Sasaran <span style={hintStyle}>(satu poin per baris)</span>
              </label>
              <textarea
                value={values.sasaran || ""}
                onChange={(e) => setField("sasaran", e.target.value)}
                style={textareaStyle}
                rows={3}
              />
            </div>
          </div>

          {/* Rencana Kegiatan */}
          <div style={sectionHeadDashedStyle}>Rencana Kegiatan</div>
          <div style={fieldFlexStyle}>
            <div style={fieldStyle}>
              <label style={labelStyle}>a. Hari/Tanggal</label>
              <input
                type="date"
                value={values.hariTanggal || ""}
                onChange={(e) => setField("hariTanggal", e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>b. Tempat</label>
              <input
                value={values.tempat || ""}
                onChange={(e) => setField("tempat", e.target.value)}
                style={inputStyle}
                placeholder="cth. Ancol, Jakarta Utara"
              />
            </div>
            <div style={fieldFullStyle}>
              <label style={labelStyle}>
                c. Narasumber <span style={hintStyle}>(opsional)</span>
              </label>
              <input
                value={values.narasumber || ""}
                onChange={(e) => setField("narasumber", e.target.value)}
                style={inputStyle}
                placeholder="Opsional"
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
            <Button
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => { if (!canNext) { notify("Lengkapi ID TOR, Judul, Kategori, Latar Belakang, Hari/Tanggal, dan Tempat terlebih dahulu.", "error"); return; } setStep(1); }}
            >
              Lanjutkan
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Step 1: Konfirmasi
  if (step === 1) {
    return (
      <div>
        <PageHeader
          eyebrow={editingTor ? "Edit TOR" : "Tambah TOR"}
          title="TOR"
        />
        <FlowSteps steps={STEPS} current={1} />

        <Card>
          <h3 style={{ fontFamily: font.display, fontSize: 16, margin: "0 0 4px", color: T.heading }}>Datanya udah bener?</h3>
          <p style={{ color: T.muted, fontSize: 12.5, margin: "0 0 18px" }}>Tinjau data sebelum disimpan.</p>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px 24px", marginBottom: 16 }}>
            <ReviewItem label="ID TOR" value={values.id} />
            <ReviewItem label="Kategori" value={values.kategori} />
            <ReviewItem label="Judul Kegiatan" value={values.judulKegiatan} full />
            <ReviewItem label="Latar Belakang" value={values.latarBelakang} full />
            <ReviewItem label="Tujuan Umum" value={values.tujuanUmum} full />
            <ReviewItem label="Hari/Tanggal" value={values.hariTanggal ? formatTanggalDisplay(values.hariTanggal) : "-"} />
            <ReviewItem label="Tempat" value={values.tempat} />
          </div>

          {/* Doc preview */}
          <div style={{ ...sectionHeadDashedStyle, display: "flex", alignItems: "center", gap: 8 }}>
            Pratinjau dokumen
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#E7F5EE", color: "#166E49", fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 999, letterSpacing: 0 }}>
              baru di sini
            </span>
          </div>
          <TorDocPreview values={values} />

          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            <Button variant="ghost" icon={Download} onClick={() => doDownloadTorDocx(values)}>
              Unduh Word (.docx)
            </Button>
            <Button variant="ghost" icon={Download} onClick={() => doDownloadTorPdf(values)}>
              Unduh PDF
            </Button>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, gap: 10 }}>
            <Button variant="ghost" icon={ArrowLeft} onClick={() => setStep(0)}>
              Tidak, edit lagi
            </Button>
            <Button icon={Check} onClick={saveAll}>
              Ya, sudah benar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Step 2: Simpan / Done
  if (step === 2) {
    return (
      <div>
        <PageHeader
          eyebrow="Tambah TOR"
          title="TOR"
        />
        <FlowSteps steps={STEPS} current={2} />

        <Card style={{ textAlign: "center", padding: "40px 24px" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#E7F5EE", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <CheckCircle2 size={28} color="#166E49" />
          </div>
          <h3 style={{ fontFamily: font.display, fontSize: 18, margin: "0 0 8px", color: T.heading }}>
            Data TOR Tersimpan!
          </h3>
          <p style={{ color: T.muted, fontSize: 13.5, lineHeight: 1.6, margin: "0 0 24px" }}>
            TOR <strong>{values.id}</strong> — <em>{values.judulKegiatan}</em> — berhasil disimpan.
          </p>

          {/* Quick doc preview */}
          <div style={{ maxWidth: 480, margin: "0 auto 24px", textAlign: "left" }}>
            <TorDocPreview values={values} />
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
            <Button variant="ghost" icon={Download} onClick={() => doDownloadTorDocx(values)}>
              Unduh Word (.docx)
            </Button>
            <Button variant="ghost" icon={Download} onClick={() => doDownloadTorPdf(values)}>
              Unduh PDF
            </Button>
          </div>

          <Button icon={ArrowLeft} onClick={backToList}>
            Kembali ke Daftar TOR
          </Button>
        </Card>
      </div>
    );
  }

  return null;
}
