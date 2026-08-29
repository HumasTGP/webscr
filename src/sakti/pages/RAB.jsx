import { useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, Check, Download, Eye, FileText, Pencil, Plus,
  Printer, Settings, Trash2, Upload, X,
} from "lucide-react";
import { T, font } from "../../lib/theme";
import { printChecklist, rupiah, uid } from "../../lib/utils";
import { generateRabPdf } from "../../lib/pdf";
import { generateDocxFromTemplate } from "../../lib/docxGenerate";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import DatePicker from "../../components/DatePicker";
import ReviewModal from "../../components/ReviewModal";
import { DEFAULT_SATUAN, SatuanSelect, SatuanSettingsModal } from "../../components/SatuanPicker";

const STEPS = ["Data RAB", "Uraian RAB", "Konfirmasi RAB", "Simpan"];
const PPN_OPTIONS = ["Non PPN", "11%"];
const MONTHS_ID = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

// Satuan bawaan. "faktor" = pengali qty ke jumlah fisik barang
// (mis. 1 lusin = 12 pcs), dipakai buat hitung total baris.
function emptyItemDraft() {
  return {
    uraian: "", satuan: "", qty: "", hargaSatuan: "", ppn: "11%",
    qtyEvaluasi: "", hargaSatuanEvaluasi: "", ppnEvaluasi: "11%",
    keterangan: "", keteranganPemakaian: "",
  };
}

// PPN dihitung dari base (qty x faktor satuan x harga satuan).
// Vendor = harga satuan × 1.15 (auto). "11%" -> base * 1.11.
function itemTotals(row, satuanList) {
  const faktor = satuanList.find((s) => s.nama === row.satuan)?.faktor || 1;
  const qty = Number(row.qty) || 0;
  const qtyEvaluasi = Number(row.qtyEvaluasi) || 0;
  const hargaSatuan = Number(row.hargaSatuan) || 0;
  const hargaSatuanEvaluasi = Number(row.hargaSatuanEvaluasi) || 0;
  const hargaSatuanVendor = hargaSatuan * 1.15;
  const hargaSatuanEvaluasiVendor = hargaSatuanEvaluasi * 1.15;

  const basePengajuan = qty * faktor * hargaSatuan;
  const baseVendor = qty * faktor * hargaSatuanVendor;
  const baseEvaluasi = qtyEvaluasi * faktor * hargaSatuanEvaluasi;
  const baseEvaluasiVendor = qtyEvaluasi * faktor * hargaSatuanEvaluasiVendor;

  const ppnRatePengajuan = row.ppn === "11%" ? 0.11 : 0;
  const ppnRateEvaluasi = row.ppnEvaluasi === "11%" ? 0.11 : 0;

  const ppnNilaiPengajuan = basePengajuan * ppnRatePengajuan;
  // Vendor selalu PPN 11% dari total vendor (bukan dari harga satuan per item)
  const ppnNilaiVendor = baseVendor * 0.11;
  const ppnNilaiEvaluasi = baseEvaluasi * ppnRateEvaluasi;
  const ppnNilaiEvaluasiVendor = baseEvaluasiVendor * 0.11;

  return {
    basePengajuan, baseVendor, baseEvaluasi, baseEvaluasiVendor,
    hargaSatuanVendor, hargaSatuanEvaluasiVendor,
    ppnNilaiPengajuan, ppnNilaiVendor, ppnNilaiEvaluasi, ppnNilaiEvaluasiVendor,
    totalPengajuan: basePengajuan + ppnNilaiPengajuan,
    totalVendor: baseVendor + ppnNilaiVendor,
    totalEvaluasi: baseEvaluasi + ppnNilaiEvaluasi,
    totalEvaluasiVendor: baseEvaluasiVendor + ppnNilaiEvaluasiVendor,
  };
}

function monthKeyOf(dateStr) {
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function monthLabelOf(key) {
  const [y, m] = key.split("-");
  return `${MONTHS_ID[Number(m) - 1]} ${y}`;
}

// ID RAB murni angka 3 digit (001, 002, ...), gak ada huruf/prefix.
// Ambil angka di EKOR string aja (misal dari data lama "RAB-2026-001" -> 001),
// biar prefix tahun/huruf peninggalan data lama gak ikut kebawa jadi nomor urut.
function nextRabIdNumber(rab) {
  const maxNum = (rab || []).reduce((max, r) => {
    const m = String(r.idNumber || "").match(/(\d{1,3})$/);
    const n = m ? parseInt(m[1], 10) : NaN;
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  return String(maxNum + 1).padStart(3, "0");
}

export default function RABPage({ rab, setRab, vendors, notify, user, packages = [], defaultKategori }) {
  const [mode, setMode] = useState("list");
  const [step, setStep] = useState(0);
  const [items, setItems] = useState([]);
  const [header, setHeader] = useState({});
  const [itemDraft, setItemDraft] = useState(emptyItemDraft());
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingRabId, setEditingRabId] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [satuanList, setSatuanList] = useState(DEFAULT_SATUAN);
  const [showSatuanModal, setShowSatuanModal] = useState(false);
  const [savingRow, setSavingRow] = useState(false);

  const [reviewRow, setReviewRow] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [previewId, setPreviewId] = useState("");
  const [filterBulan, setFilterBulan] = useState("");
  const [query, setQuery] = useState("");

  const totalPengajuan = items.reduce((s, r) => s + (r.totalPengajuan || 0), 0);
  const totalVendor = items.reduce((s, r) => s + (r.totalVendor || 0), 0);
  const totalEvaluasi = items.reduce((s, r) => s + (r.totalEvaluasi || 0), 0);
  const totalEvaluasiVendor = items.reduce((s, r) => s + (r.totalEvaluasiVendor || 0), 0);

  // ---------- helpers ----------
  const namaAsmanFor = (idNumber) => {
    const pkg = packages.find((p) => p.idRab === idNumber);
    return pkg?.reviewedBy || "";
  };
  const namaPembuat = user?.username || user?.name || "-";

  const displayRab = useMemo(() => {
    let list = defaultKategori ? rab.filter((r) => r.kategori === defaultKategori) : rab;
    if (filterBulan) list = list.filter((r) => monthKeyOf(r.tanggalRab) === filterBulan);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((r) => (r.idNumber || "").toLowerCase().includes(q) || (r.judulKegiatan || "").toLowerCase().includes(q));
    }
    // Terbaru di atas (newest-first), berdasarkan waktu input terakhir.
    return [...list].sort((a, b) => new Date(b.tanggalInput || 0) - new Date(a.tanggalInput || 0));
  }, [rab, defaultKategori, filterBulan, query]);

  const monthOptions = useMemo(() => {
    const set = new Set();
    (defaultKategori ? rab.filter((r) => r.kategori === defaultKategori) : rab).forEach((r) => {
      const k = monthKeyOf(r.tanggalRab);
      if (k) set.add(k);
    });
    return [...set].sort().reverse();
  }, [rab, defaultKategori]);

  // ---------- wizard ----------
  const startWizard = () => {
    setEditingRabId(null);
    setHeader({
      idNumber: nextRabIdNumber(rab),
      tanggalRab: "",
      judulKegiatan: "",
      dokumenTor: null,
      ...(defaultKategori ? { kategori: defaultKategori } : {}),
    });
    setItems([]);
    setItemDraft(emptyItemDraft());
    setEditingItemId(null);
    setStep(0);
    setMode("wizard");
  };

  const startEdit = (record) => {
    setEditingRabId(record.idNumber);
    setHeader({ ...record });
    setItems(record.items || []);
    setItemDraft(emptyItemDraft());
    setEditingItemId(null);
    setStep(0);
    setMode("wizard");
    setReviewRow(null);
  };

  const setH = (key, val) => setHeader((p) => ({ ...p, [key]: val }));

  const onUploadTor = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setH("dokumenTor", { fileName: f.name, fileSize: f.size, url: URL.createObjectURL(f) });
  };

  // savingRow = kunci sesaat biar klik ganda / event dobel gak nambahin baris 2x.
  const saveItemRow = (e) => {
    e?.preventDefault?.();
    if (savingRow) return;
    if (!itemDraft.uraian.trim()) return notify("Isi Uraian terlebih dahulu.", "error");
    setSavingRow(true);
    const totals = itemTotals(itemDraft, satuanList);
    const row = { ...itemDraft, ...totals, id: editingItemId || uid("ITM") };
    setItems((prev) => editingItemId ? prev.map((r) => (r.id === editingItemId ? row : r)) : [...prev, row]);
    setItemDraft(emptyItemDraft());
    setEditingItemId(null);
    setTimeout(() => setSavingRow(false), 250);
  };
  const editItemRow = (row) => { setItemDraft(row); setEditingItemId(row.id); };
  const cancelEditItem = () => { setItemDraft(emptyItemDraft()); setEditingItemId(null); };
  const deleteItemRow = (id) => setItems((prev) => prev.filter((r) => r.id !== id));

  const finalizeSave = () => {
    const record = {
      ...header,
      // Kategori RAB udah gak dipakai lagi di web (fitur pemilihan kategori dihapus),
      // tapi field ini masih dipakai downstream (menu NON PO/PO/CC, laporan, dashboard)
      // buat filter data — jadi tiap RAB baru otomatis dianggap masuk ke NON PO.
      kategori: header.kategori || "NON PO",
      items,
      totalPengajuan,
      totalVendor,
      totalEvaluasi,
      totalEvaluasiVendor,
      tanggalInput: header.tanggalInput || new Date().toISOString(),
      pelaksanaanSelesai: header.pelaksanaanSelesai ?? false,
    };
    setRab((prev) => {
      const exists = prev.some((r) => r.idNumber === editingRabId);
      return exists
        ? prev.map((r) => (r.idNumber === editingRabId ? record : r))
        : [...prev, record];
    });
    setEditingRabId(record.idNumber);
    setShowSaveModal(false);
    setStep(3);
    notify(editingRabId ? "RAB berhasil diperbarui!" : "Data RAB berhasil disimpan!", "success", "RAB");
  };

  const deleteRab = (idNumber) => {
    setRab((prev) => prev.filter((r) => r.idNumber !== idNumber));
    notify(`RAB ${idNumber} dihapus.`, "success");
    setDeleteTarget(null);
  };

  // ---------- docx / pdf ----------
  // Cocok dengan tag di Template_RAB.docx: header ID/Tanggal/Judul, baris item
  // (loop {#items}), lalu 3 baris ringkasan (Jumlah / PPN / Jumlah+PPN) yang
  // dipisah antara kolom Usulan (pengajuan) dan Evaluasi.
  const buildDocxData = (record) => {
    const items = record.items || [];
    // Template tags pakai nama lama — nilainya dari harga vendor (+15%) sudah termasuk PPN.
    const jumlahPengajuan = items.reduce((s, it) => s + (it.baseVendor || 0), 0);
    const ppnPengajuan = items.reduce((s, it) => s + (it.ppnNilaiVendor || 0), 0);
    const jumlahEvaluasiTotal = items.reduce((s, it) => s + (it.baseEvaluasiVendor || 0), 0);
    const ppnEvaluasi = items.reduce((s, it) => s + (it.ppnNilaiEvaluasiVendor || 0), 0);

    return {
      idNumber: record.idNumber || "",
      tanggalRab: record.tanggalRab ? formatTanggal(record.tanggalRab) : "",
      judulKegiatan: record.judulKegiatan || "",
      namaPembuat: record.idNumber === header.idNumber && mode === "wizard" ? namaPembuat : (record.namaPembuat || namaPembuat),
      namaAsman: namaAsmanFor(record.idNumber) || "-",
      jumlahPengajuan: rupiah(jumlahPengajuan),
      ppnPengajuan: rupiah(ppnPengajuan),
      totalPengajuan: rupiah(record.totalVendor || 0),
      jumlahEvaluasiTotal: rupiah(jumlahEvaluasiTotal),
      ppnEvaluasi: rupiah(ppnEvaluasi),
      totalEvaluasi: rupiah(record.totalEvaluasiVendor || 0),
      items: items.map((it) => ({
        uraian: it.uraian || "",
        satuan: it.satuan || "",
        qty: String(it.qty || ""),
        hargaSatuan: rupiah(it.hargaSatuanVendor || 0),
        jumlah: rupiah(it.baseVendor || 0),
        qtyEvaluasi: String(it.qtyEvaluasi || ""),
        hargaSatuanEvaluasi: rupiah(it.hargaSatuanEvaluasiVendor || 0),
        jumlahEvaluasi: rupiah(it.baseEvaluasiVendor || 0),
      })),
    };
  };

  const downloadDocx = async (record) => {
    try {
      await generateDocxFromTemplate("/templates/Template_RAB.docx", buildDocxData(record), `RAB-${record.idNumber}.docx`);
      notify("RAB (.docx) berhasil diunduh.", "success");
    } catch (e) {
      notify(`Gagal membuat RAB: ${e.message}`, "error");
    }
  };
  const downloadPdf = async (record) => {
    try {
      const data = buildDocxData(record);
      const its = record.items || [];
      await generateRabPdf({
        idNumber: data.idNumber,
        tanggalRab: data.tanggalRab,
        judulKegiatan: data.judulKegiatan,
        items: its,
        jumlahPengajuan: its.reduce((s, it) => s + (it.baseVendor || 0), 0),
        ppnPengajuan: its.reduce((s, it) => s + (it.ppnNilaiVendor || 0), 0),
        totalPengajuan: record.totalVendor || 0,
        jumlahEvaluasi: its.reduce((s, it) => s + (it.baseEvaluasiVendor || 0), 0),
        ppnEvaluasi: its.reduce((s, it) => s + (it.ppnNilaiEvaluasiVendor || 0), 0),
        totalEvaluasi: record.totalEvaluasiVendor || 0,
        namaAsman: data.namaAsman,
        namaPembuat: data.namaPembuat,
        filename: `RAB-${record.idNumber || "record"}`,
      });
      notify("RAB (.pdf) berhasil diunduh.", "success");
    } catch (e) {
      notify(`Gagal membuat PDF: ${e.message}`, "error");
    }
  };

  const previewRecord = rab.find((r) => r.idNumber === previewId);
  const currentStepIndex = step;

  const pageTitle = defaultKategori ? `RAB - ${defaultKategori}` : "Rencana Anggaran Biaya";
  const pageDesc = defaultKategori
    ? `Daftar RAB dengan kategori ${defaultKategori}. Klik baris untuk melihat detail.`
    : "Kelola seluruh data Rencana Anggaran Biaya. Klik salah satu baris untuk melihat detail atau mengubah data.";
  const addLabel = defaultKategori ? `Buat RAB ${defaultKategori}` : "Tambah RAB Baru";

  // ================= LIST MODE =================
  if (mode === "list") {
    return (
      <div>
        <PageHeader
          title={pageTitle}
          description={pageDesc}
          right={<Button icon={Plus} onClick={startWizard}>{addLabel}</Button>}
        />

        <Card style={{ marginBottom: 14 }}>
          <SectionLabel dashed>Preview &amp; Download berdasarkan ID</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: previewRecord ? 16 : 0 }} className="responsive-form-grid">
            <select value={previewId} onChange={(e) => setPreviewId(e.target.value)} style={selectStyle}>
              <option value="">- Pilih ID RAB -</option>
              {displayRab.map((r) => <option key={r.idNumber} value={r.idNumber}>{r.idNumber} - {r.judulKegiatan}</option>)}
            </select>
            <select value={filterBulan} onChange={(e) => setFilterBulan(e.target.value)} style={selectStyle}>
              <option value="">Semua bulan</option>
              {monthOptions.map((k) => <option key={k} value={k}>{monthLabelOf(k)}</option>)}
            </select>
          </div>

          {previewRecord && (
            <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: 16, background: T.bg }}>
              <div style={{ fontFamily: font.mono, fontSize: 12, fontWeight: 700, color: T.blue }}>{previewRecord.idNumber}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.heading, margin: "3px 0 10px" }}>{previewRecord.judulKegiatan}</div>
              <div style={{ fontSize: 12.5, color: T.muted, marginBottom: 12 }}>
                Tanggal RAB: {formatTanggal(previewRecord.tanggalRab)} · Total Evaluasi Vendor: {rupiah(previewRecord.totalEvaluasiVendor || previewRecord.totalEvaluasi || 0)}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Button icon={Download} onClick={() => downloadDocx(previewRecord)}>Unduh Word (.docx)</Button>
                <Button variant="ghost" icon={FileText} onClick={() => downloadPdf(previewRecord)}>Unduh PDF</Button>
              </div>
            </div>
          )}
        </Card>

        <Card style={{ marginBottom: 14 }}>
          <SectionLabel>Cari data</SectionLabel>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari berdasarkan ID atau judul kegiatan..."
            style={{ ...selectStyle, width: "100%", boxSizing: "border-box" }}
          />
        </Card>

        <Card padded={false}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  {["ID Number", "Judul Kegiatan", "Kategori", "Bidang", "Vendor", "Total Eval. Vendor", "Aksi"].map((h) => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayRab.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: "center", color: T.muted, padding: "28px 12px" }}>
                    Belum ada data RAB{defaultKategori ? ` kategori ${defaultKategori}` : ""}. Klik &quot;{addLabel}&quot; untuk membuat pengajuan pertama.
                  </td></tr>
                ) : displayRab.map((r, i) => (
                  <tr key={r.idNumber} onClick={() => setReviewRow(r)} style={{ cursor: "pointer", background: i % 2 ? T.rowAlt : T.card }}>
                    <td style={td}>{r.idNumber}</td>
                    <td style={td}>{r.judulKegiatan}</td>
                    <td style={td}>{r.kategori || "-"}</td>
                    <td style={td}>{r.bidang || "-"}</td>
                    <td style={td}>{r.vendor || "-"}</td>
                    <td style={{ ...td, textAlign: "right" }}>{rupiah(r.totalEvaluasiVendor || r.totalEvaluasi || 0)}</td>
                    <td style={{ ...td, textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                        <IconBtn title="Edit" onClick={() => startEdit(r)}><Pencil size={13} /></IconBtn>
                        <IconBtn title="Cetak" onClick={() => downloadDocx(r)}><Printer size={13} /></IconBtn>
                        <IconBtn title="Hapus" danger onClick={() => setDeleteTarget(r)}><Trash2 size={13} /></IconBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ---- Review modal ---- */}
        <ReviewModal
          open={!!reviewRow}
          onClose={() => setReviewRow(null)}
          title={`Review ${reviewRow?.idNumber || ""}`}
          subtitle="Ringkasan data yang sudah tersimpan. Ini bukan mode edit, cuma buat lihat sekilas."
          rows={reviewRow ? [
            { label: "ID number", value: reviewRow.idNumber },
            { label: "Tanggal RAB", value: formatTanggal(reviewRow.tanggalRab) },
            { label: "Judul program", value: reviewRow.judulKegiatan, full: true },
            { label: "Dokumen TOR", value: reviewRow.dokumenTor?.fileName || "-", full: true },
          ] : []}
          table={reviewRow ? {
            title: `Uraian RAB (${(reviewRow.items || []).length} baris)`,
            columns: [
              { key: "uraian", label: "Uraian" },
              { key: "qty", label: "Qty" },
              { key: "ppn", label: "PPN" },
              { key: "totalEvaluasiVendor", label: "Total Eval. Vendor", render: (r) => rupiah(r.totalEvaluasiVendor || r.totalEvaluasi || 0) },
            ],
            data: reviewRow.items || [],
          } : null}
          totals={reviewRow ? [{ label: "Total Evaluasi Vendor", value: rupiah(reviewRow.totalEvaluasiVendor || reviewRow.totalEvaluasi || 0) }] : []}
          onEdit={() => startEdit(reviewRow)}
          editLabel="Edit RAB ini"
        />

        <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Hapus RAB?" tone="danger">
          <p style={{ color: T.muted, fontSize: 13.5, marginBottom: 20, lineHeight: 1.6 }}>
            RAB <b>{deleteTarget?.idNumber}</b> akan dihapus permanen dari daftar. Tindakan ini tidak bisa dibatalkan.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Batal</Button>
            <Button variant="accent" icon={Trash2} onClick={() => deleteRab(deleteTarget.idNumber)}>Ya, Hapus</Button>
          </div>
        </Modal>
      </div>
    );
  }

  // ================= WIZARD MODE =================
  return (
    <div>
      <FlowStepsBar current={currentStepIndex} />

      {step === 0 && (
        <Card>
          <h3 style={{ fontFamily: font.display, fontSize: 16, marginBottom: 4 }}>Data RAB</h3>
          <p style={{ color: T.muted, fontSize: 12.5, marginBottom: 18 }}>
            Isian dasar untuk RAB ini. Detail biaya diisi di step Uraian RAB.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px" }} className="responsive-form-grid">
            <Field label="ID number" hint="(otomatis, 3 angka — cth. 001)">
              <input
                value={header.idNumber || ""}
                onChange={(e) => setH("idNumber", e.target.value.replace(/\D/g, "").slice(0, 3))}
                inputMode="numeric"
                maxLength={3}
                placeholder="001"
                style={inputStyle}
              />
            </Field>
            <Field label="Tanggal RAB">
              <DatePicker value={header.tanggalRab || ""} onChange={(v) => setH("tanggalRab", v)} />
            </Field>
            <Field label="Judul program" full>
              <input
                value={header.judulKegiatan || ""}
                onChange={(e) => setH("judulKegiatan", e.target.value)}
                placeholder="cth. Bantuan Perbaikan Jalan Metro Marina Ancol"
                style={inputStyle}
              />
            </Field>
            <Field label="Dokumen TOR" full>
              <label style={{
                display: "flex", alignItems: "center", gap: 12, padding: 16, borderRadius: 9,
                border: `1.5px dashed ${header.dokumenTor ? T.success : "#A9C7D4"}`,
                background: header.dokumenTor ? T.successSoft : "#FAFCFD", cursor: "pointer",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0, display: "grid", placeItems: "center",
                  background: header.dokumenTor ? "#fff" : T.blueSoft, color: header.dokumenTor ? T.success : T.blue,
                }}>
                  <Upload size={16} />
                </div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: T.text }}>
                    {header.dokumenTor ? `${header.dokumenTor.fileName} terlampir` : "Klik untuk pilih file TOR"}
                  </div>
                  <div style={{ fontSize: 11.5, color: T.muted }}>Cukup lampirkan file TOR - tidak perlu isi field apa pun di sini</div>
                </div>
                <input type="file" onChange={onUploadTor} style={{ display: "none" }} />
              </label>
            </Field>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 22 }}>
            <Button onClick={() => { setH("idNumber", (header.idNumber || "").padStart(3, "0") || nextRabIdNumber(rab)); setStep(1); }}>Lanjutkan <ArrowRight size={15} /></Button>
          </div>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <div style={{ display: "flex", gap: 9, alignItems: "flex-start", background: "#FFF6E0", border: "1px solid #F0D48A", color: "#7A5900", padding: "10px 14px", borderRadius: 8, fontSize: 12.5, marginBottom: 18 }}>
            ⚠ Hati-hati dalam pengisian RAB. Data akan tampil seperti tabel Excel pada dasbor.
          </div>
          <h3 style={{ fontFamily: font.display, fontSize: 16, marginBottom: 4 }}>Input uraian RAB (per item)</h3>
          <p style={{ color: T.muted, fontSize: 12.5, marginBottom: 18 }}>Isi satu baris untuk tiap barang/jasa, lalu tekan &quot;Tambah baris&quot;.</p>

          {/* 1. Harga Satuan Usulan */}
          <SectionLabel>1. Harga Satuan Usulan</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", marginBottom: 18 }} className="responsive-form-grid">
            <Field label="Uraian" full>
              <input value={itemDraft.uraian} onChange={(e) => setItemDraft({ ...itemDraft, uraian: e.target.value })} placeholder="Nama barang/jasa" style={inputStyle} />
            </Field>
            <Field label="Satuan">
              <SatuanSelect
                value={itemDraft.satuan}
                satuanList={satuanList}
                setSatuanList={setSatuanList}
                onChange={(v) => setItemDraft({ ...itemDraft, satuan: v })}
                onOpenSettings={() => setShowSatuanModal(true)}
                inputStyle={inputStyle}
              />
            </Field>
            <Field label="Qty">
              <input type="number" value={itemDraft.qty} onChange={(e) => setItemDraft({ ...itemDraft, qty: e.target.value })} style={inputStyle} />
            </Field>
            <Field label="Harga Satuan Usulan">
              <input type="number" value={itemDraft.hargaSatuan} onChange={(e) => setItemDraft({ ...itemDraft, hargaSatuan: e.target.value })} style={inputStyle} />
            </Field>
          </div>

          {/* 2. Harga Satuan Usulan Vendor (+15% auto) */}
          <SectionLabel dashed>2. Harga Satuan Usulan Vendor (otomatis +15%)</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", marginBottom: 18, background: "#F0F9FF", borderRadius: 8, padding: "14px 14px 6px" }} className="responsive-form-grid">
            <Field label="Qty (otomatis dari usulan)">
              <input value={itemDraft.qty || ""} readOnly disabled style={{ ...inputStyle, background: "#E8F4FB", color: T.muted, cursor: "not-allowed" }} />
            </Field>
            <Field label="Harga Satuan Vendor (+15%)">
              <input
                value={itemDraft.hargaSatuan ? rupiah(Number(itemDraft.hargaSatuan) * 1.15) : ""}
                readOnly disabled
                style={{ ...inputStyle, background: "#E8F4FB", color: T.blue, fontWeight: 700, cursor: "not-allowed" }}
              />
            </Field>
            <Field label="Jumlah Vendor">
              <input
                value={itemDraft.hargaSatuan && itemDraft.qty ? rupiah((Number(itemDraft.qty) || 0) * (Number(itemDraft.hargaSatuan) * 1.15)) : ""}
                readOnly disabled
                style={{ ...inputStyle, background: "#E8F4FB", color: T.blue, fontWeight: 700, cursor: "not-allowed" }}
              />
            </Field>
          </div>

          {/* 3. Harga Satuan Evaluasi */}
          <SectionLabel dashed>3. Harga Satuan Evaluasi</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", marginBottom: 18 }} className="responsive-form-grid">
            <Field label="Qty Evaluasi">
              <input type="number" value={itemDraft.qtyEvaluasi} onChange={(e) => setItemDraft({ ...itemDraft, qtyEvaluasi: e.target.value })} style={inputStyle} />
            </Field>
            <Field label="Harga Satuan Evaluasi">
              <input type="number" value={itemDraft.hargaSatuanEvaluasi} onChange={(e) => setItemDraft({ ...itemDraft, hargaSatuanEvaluasi: e.target.value })} style={inputStyle} />
            </Field>
          </div>

          {/* 4. Harga Satuan Evaluasi Vendor (+15% auto) */}
          <SectionLabel dashed>4. Harga Satuan Evaluasi Vendor (otomatis +15%)</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", marginBottom: 16, background: "#F0F9FF", borderRadius: 8, padding: "14px 14px 6px" }} className="responsive-form-grid">
            <Field label="Qty (otomatis dari evaluasi)">
              <input value={itemDraft.qtyEvaluasi || ""} readOnly disabled style={{ ...inputStyle, background: "#E8F4FB", color: T.muted, cursor: "not-allowed" }} />
            </Field>
            <Field label="Harga Satuan Evaluasi Vendor (+15%)">
              <input
                value={itemDraft.hargaSatuanEvaluasi ? rupiah(Number(itemDraft.hargaSatuanEvaluasi) * 1.15) : ""}
                readOnly disabled
                style={{ ...inputStyle, background: "#E8F4FB", color: T.blue, fontWeight: 700, cursor: "not-allowed" }}
              />
            </Field>
            <Field label="Jumlah Evaluasi Vendor">
              <input
                value={itemDraft.hargaSatuanEvaluasi && itemDraft.qtyEvaluasi ? rupiah((Number(itemDraft.qtyEvaluasi) || 0) * (Number(itemDraft.hargaSatuanEvaluasi) * 1.15)) : ""}
                readOnly disabled
                style={{ ...inputStyle, background: "#E8F4FB", color: T.blue, fontWeight: 700, cursor: "not-allowed" }}
              />
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", marginBottom: 4 }} className="responsive-form-grid">
            <Field label="Keterangan" hint="(opsional)">
              <input value={itemDraft.keterangan} onChange={(e) => setItemDraft({ ...itemDraft, keterangan: e.target.value })} placeholder="Opsional" style={inputStyle} />
            </Field>
            <Field label="Keterangan Pemakaian" hint="(opsional)">
              <input value={itemDraft.keteranganPemakaian} onChange={(e) => setItemDraft({ ...itemDraft, keteranganPemakaian: e.target.value })} placeholder="cth. dipakai untuk perbaikan RT 03" style={inputStyle} />
            </Field>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6, marginBottom: 6 }}>
            {editingItemId && <Button variant="ghost" icon={X} onClick={cancelEditItem}>Batal Edit</Button>}
            <Button variant={editingItemId ? "accent" : "ghost"} icon={editingItemId ? Check : Plus} onClick={saveItemRow} disabled={savingRow}>
              {editingItemId ? "Simpan Perubahan" : "Tambah baris"}
            </Button>
          </div>

          <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden", overflowX: "auto", marginTop: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr>
                  {["Uraian", "Satuan", "Qty", "Harga Sat. Vendor", "Jumlah Vendor", "PPN Vendor", "Total Vendor", "Harga Sat. Eval. Vendor", "Jumlah Eval. Vendor", "PPN Eval. Vendor", "Total Eval. Vendor", ""].map((h) => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={12} style={{ textAlign: "center", color: T.muted, padding: "20px 12px" }}>Belum ada baris. Isi form di atas lalu klik &quot;+ Tambah baris&quot;.</td></tr>
                ) : items.map((r, i) => (
                  <tr key={r.id} style={{ background: i % 2 ? T.rowAlt : T.card }}>
                    <td style={td}>{r.uraian}</td>
                    <td style={td}>{r.satuan}</td>
                    <td style={{ ...td, textAlign: "right" }}>{r.qty}</td>
                    <td style={{ ...td, textAlign: "right" }}>{rupiah(r.hargaSatuanVendor || 0)}</td>
                    <td style={{ ...td, textAlign: "right" }}>{rupiah(r.baseVendor || 0)}</td>
                    <td style={{ ...td, textAlign: "right" }}>{r.ppn === "11%" ? rupiah(r.ppnNilaiVendor || 0) : "-"}</td>
                    <td style={{ ...td, textAlign: "right", fontWeight: 700, color: T.blue }}>{rupiah(r.totalVendor || 0)}</td>
                    <td style={{ ...td, textAlign: "right" }}>{rupiah(r.hargaSatuanEvaluasiVendor || 0)}</td>
                    <td style={{ ...td, textAlign: "right" }}>{rupiah(r.baseEvaluasiVendor || 0)}</td>
                    <td style={{ ...td, textAlign: "right" }}>{r.ppnEvaluasi === "11%" ? rupiah(r.ppnNilaiEvaluasiVendor || 0) : "-"}</td>
                    <td style={{ ...td, textAlign: "right", fontWeight: 700, color: T.blue }}>{rupiah(r.totalEvaluasiVendor || 0)}</td>
                    <td style={{ ...td, textAlign: "center" }}>
                      <div style={{ display: "flex", gap: 5, justifyContent: "center" }}>
                        <IconBtn title="Edit" onClick={() => editItemRow(r)}><Pencil size={12} /></IconBtn>
                        <IconBtn title="Hapus" danger onClick={() => deleteItemRow(r.id)}><Trash2 size={12} /></IconBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
            <Button variant="ghost" icon={ArrowLeft} onClick={() => setStep(0)}>Kembali</Button>
            <Button onClick={() => setStep(2)} disabled={items.length === 0}>Lanjutkan <ArrowRight size={15} /></Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <h3 style={{ fontFamily: font.display, fontSize: 16, marginBottom: 4, textAlign: "center" }}>Konfirmasi RAB</h3>
          <p style={{ color: T.muted, fontSize: 12.5, marginBottom: 18, textAlign: "center" }}>Tinjau data sebelum disimpan - tampilan ini mengikuti susunan dokumen RAB yang akan diunduh.</p>

          <SectionLabel>Data RAB</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", marginBottom: 18, borderBottom: `1px solid ${T.border}`, paddingBottom: 16 }}>
            <ReviewRow label="ID number" value={header.idNumber} />
            <ReviewRow label="Tanggal RAB" value={formatTanggal(header.tanggalRab)} />
            <ReviewRow label="Judul program" value={header.judulKegiatan} full />
            <ReviewRow label="Dokumen TOR" value={header.dokumenTor?.fileName || "-"} full />
          </div>

          <SectionLabel>Uraian RAB ({items.length} baris)</SectionLabel>
          {/* Tabel preview ini sengaja disusun persis kayak Template_RAB.docx: grup
              kolom USULAN & EVALUASI berdampingan (masing-masing Qty/Harga
              Satuan/Jumlah), lalu baris ringkasan Jumlah/PPN/Jumlah+PPN di bawah
              per sisi - biar preview di web = isi dokumen yang bakal diunduh. */}
          <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden", overflowX: "auto", marginBottom: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr>
                  <th style={{ ...th, textAlign: "center" }} rowSpan={2}>Uraian</th>
                  <th style={{ ...th, textAlign: "center" }} rowSpan={2}>Satuan</th>
                  <th style={{ ...th, textAlign: "center" }} colSpan={3}>Usulan</th>
                  <th style={{ ...th, textAlign: "center" }} colSpan={3}>Evaluasi</th>
                </tr>
                <tr>
                  {["Qty", "Harga Satuan", "Jumlah", "Qty", "Harga Satuan", "Jumlah"].map((h, i) => (
                    <th key={i} style={{ ...th, textAlign: "center" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((r, i) => (
                  <tr key={r.id} style={{ background: i % 2 ? T.rowAlt : T.card }}>
                    <td style={{ ...td, textAlign: "center" }}>{r.uraian}</td>
                    <td style={{ ...td, textAlign: "center" }}>{r.satuan}</td>
                    <td style={{ ...td, textAlign: "center" }}>{r.qty}</td>
                    <td style={{ ...td, textAlign: "center" }}>{rupiah(r.hargaSatuanVendor || 0)}</td>
                    <td style={{ ...td, textAlign: "center", fontWeight: 700 }}>{rupiah(r.totalVendor || 0)}</td>
                    <td style={{ ...td, textAlign: "center" }}>{r.qtyEvaluasi}</td>
                    <td style={{ ...td, textAlign: "center" }}>{rupiah(r.hargaSatuanEvaluasiVendor || 0)}</td>
                    <td style={{ ...td, textAlign: "center", fontWeight: 700 }}>{rupiah(r.totalEvaluasiVendor || 0)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                {[
                  { label: "Jumlah", u: items.reduce((s, r) => s + (r.baseVendor || 0), 0), e: items.reduce((s, r) => s + (r.baseEvaluasiVendor || 0), 0) },
                  { label: "PPN", u: items.reduce((s, r) => s + (r.ppnNilaiVendor || 0), 0), e: items.reduce((s, r) => s + (r.ppnNilaiEvaluasiVendor || 0), 0) },
                  { label: "Jumlah + PPN", u: totalVendor, e: totalEvaluasiVendor, bold: true },
                ].map((row) => (
                  <tr key={row.label} style={{ background: T.blueSoft }}>
                    <td style={{ ...td, borderBottom: "none" }} colSpan={3}></td>
                    <td style={{ ...td, borderBottom: "none", textAlign: "center", fontWeight: 700 }}>{row.label}</td>
                    <td style={{ ...td, borderBottom: "none", textAlign: "center", fontWeight: row.bold ? 700 : 600 }}>{rupiah(row.u)}</td>
                    <td style={{ ...td, borderBottom: "none" }} colSpan={2}></td>
                    <td style={{ ...td, borderBottom: "none", textAlign: "center", fontWeight: row.bold ? 700 : 600 }}>{rupiah(row.e)}</td>
                  </tr>
                ))}
              </tfoot>
            </table>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
            <Button variant="ghost" icon={ArrowLeft} onClick={() => setStep(1)}>Tidak, edit lagi</Button>
            <Button onClick={() => setShowSaveModal(true)}>Ya, simpan <ArrowRight size={15} /></Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <div style={{ textAlign: "center", padding: "26px 10px" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: T.successSoft, display: "grid", placeItems: "center", margin: "0 auto 14px" }}>
              <Check size={26} color={T.success} />
            </div>
            <h3 style={{ fontFamily: font.display, fontSize: 17, marginBottom: 4 }}>Data RAB berhasil disimpan</h3>
            <p style={{ color: T.muted, fontSize: 13, marginBottom: 20 }}>{header.idNumber} sudah tercatat di daftar RAB.</p>

            <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: "20px 24px", background: "#fff", maxWidth: 480, margin: "0 auto 18px", textAlign: "left", fontSize: 12.5 }}>
              <div style={{ textAlign: "center", fontWeight: 700, fontSize: 13.5, color: T.heading }}>RENCANA ANGGARAN BIAYA</div>
              <div style={{ textAlign: "center", color: T.muted, fontSize: 11, marginBottom: 16 }}>PT PLN Indonesia Power UBP Priok</div>
              <DocRow label="ID number" value={header.idNumber} />
              <DocRow label="Judul program" value={header.judulKegiatan} />
              <DocRow label="Tanggal RAB" value={formatTanggal(header.tanggalRab)} />
              <DocRow label="Total Usulan Vendor" value={rupiah(totalVendor)} />
              <DocRow label="Total Evaluasi Vendor" value={rupiah(totalEvaluasiVendor)} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22, textAlign: "center", fontSize: 11.5 }}>
                <TtdCol role="Pembuat" name={namaPembuat} tag="otomatis dari akun" />
                <TtdCol role="Menyetujui" name={namaAsmanFor(header.idNumber) || "Menunggu approval Asman"} tag={namaAsmanFor(header.idNumber) ? "otomatis, sesuai bidang" : ""} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 12 }}>
              <Button icon={Download} onClick={() => downloadDocx({ ...header, items, totalPengajuan, totalVendor, totalEvaluasi, totalEvaluasiVendor })}>Unduh Word (.docx)</Button>
              <Button variant="ghost" icon={FileText} onClick={() => downloadPdf({ ...header, items, totalPengajuan, totalVendor, totalEvaluasi, totalEvaluasiVendor })}>Unduh PDF</Button>
            </div>
            <Button onClick={() => { setMode("list"); setStep(0); }}>
              <ArrowLeft size={15} /> Kembali ke Daftar RAB
            </Button>
          </div>
        </Card>
      )}

      <SatuanSettingsModal
        key={showSatuanModal ? `open-${satuanList.length}` : "closed"}
        open={showSatuanModal}
        onClose={() => setShowSatuanModal(false)}
        satuanList={satuanList}
        setSatuanList={setSatuanList}
        inputStyle={inputStyle}
      />

      <Modal open={showSaveModal} onClose={() => setShowSaveModal(false)} title="Simpan Data RAB?" icon={Check}>
        <p style={{ color: T.muted, fontSize: 13.5, marginBottom: 20, lineHeight: 1.6 }}>
          Pastikan seluruh data RAB dan Uraian RAB sudah benar sebelum disimpan.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Button variant="ghost" onClick={() => setShowSaveModal(false)}>Batal</Button>
          <Button onClick={finalizeSave}>Ya, Simpan</Button>
        </div>
      </Modal>
    </div>
  );
}

// ---------- small building blocks ----------
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
            }}>
              {i < current ? <Check size={13} /> : i + 1}
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: i === current ? T.blue : T.muted, whiteSpace: "nowrap" }}>{label}</span>
          </div>
          {i < STEPS.length - 1 && <div style={{ width: 34, height: 1.5, background: T.border, margin: "0 6px" }} />}
        </div>
      ))}
    </div>
  );
}
function SectionLabel({ children, dashed }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: T.blue,
      margin: dashed ? "4px 0 10px" : "0 0 10px",
      borderTop: dashed ? `1px dashed ${T.border}` : "none",
      paddingTop: dashed ? 14 : 0,
    }}>{children}</div>
  );
}

function Field({ label, hint, full, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: full ? "1 / -1" : "auto" }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: T.text }}>
        {label} {hint && <span style={{ fontSize: 11, fontWeight: 400, color: T.muted }}>{hint}</span>}
      </label>
      {children}
    </div>
  );
}
function ReviewRow({ label, value, full }) {
  return (
    <div style={{ gridColumn: full ? "1 / -1" : "auto", display: "grid", gridTemplateColumns: "160px 1fr", gap: 12, fontSize: 13, padding: "6px 0" }}>
      <div style={{ color: T.muted }}>{label}</div>
      <div style={{ fontWeight: 600, color: T.text }}>{value || "-"}</div>
    </div>
  );
}
function DocRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px dotted ${T.border}` }}>
      <span style={{ color: T.muted }}>{label}</span><span>{value || "-"}</span>
    </div>
  );
}
function TtdCol({ role, name, tag }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ color: T.muted, fontSize: 10.5 }}>{role}</div>
      <div style={{ borderTop: `1px solid ${T.text}`, width: 110, margin: "38px auto 4px" }} />
      <div style={{ fontWeight: 700, marginTop: 2 }}>{name}</div>
      {tag && <div style={{ display: "inline-block", marginTop: 4, fontSize: 9.5, background: T.successSoft, color: T.success, padding: "2px 7px", borderRadius: 999, fontWeight: 700 }}>{tag}</div>}
    </div>
  );
}
function IconBtn({ children, onClick, title, danger }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 28, height: 28, borderRadius: 6, border: `1px solid ${T.border}`, background: "#fff",
        display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        color: danger ? T.danger : T.muted,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = danger ? T.dangerSoft : T.blueSoft; e.currentTarget.style.color = danger ? T.danger : T.blue; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = danger ? T.danger : T.muted; }}
    >
      {children}
    </button>
  );
}
// Dipakai bareng oleh GenericWizard.jsx (TOR, BAST, PI, Laporan, dst) — JANGAN dihapus.
export function SuccessModal({ open, message, onDone, onDownloadPdf, onDownloadDocx }) {
  return (
    <Modal open={open} onClose={onDone} title="Berhasil Disimpan" tone="success">
      <div style={{ textAlign: "center", padding: "10px 0 6px" }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: T.successSoft, display: "grid", placeItems: "center", margin: "0 auto 14px" }}>
          <Check size={24} color={T.success} />
        </div>
        <p style={{ color: T.text, fontSize: 13.5, marginBottom: 20, lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {onDownloadDocx && <Button icon={Download} onClick={onDownloadDocx}>Unduh Word (.docx)</Button>}
          {onDownloadPdf && <Button variant="ghost" icon={FileText} onClick={onDownloadPdf}>Unduh PDF</Button>}
          <Button variant="ghost" onClick={onDone}>Selesai</Button>
        </div>
      </div>
    </Modal>
  );
}

function formatTanggal(dateStr) {
  const d = dateStr ? new Date(`${dateStr}T00:00:00`) : null;
  if (!d || Number.isNaN(d.getTime())) return dateStr || "-";
  return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
}

const inputStyle = {
  width: "100%", boxSizing: "border-box", padding: "9px 11px", borderRadius: 8,
  border: `1px solid ${T.border}`, background: "#fbfdfe", color: T.text, fontSize: 13, fontFamily: font.body,
};
const selectStyle = { ...inputStyle };
const th = {
  background: T.blueSoft, color: T.navy, fontWeight: 700, textAlign: "left",
  padding: "9px 11px", fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.3, whiteSpace: "nowrap",
};
const td = { padding: "9px 11px", borderBottom: `1px solid ${T.border}`, whiteSpace: "nowrap" };
