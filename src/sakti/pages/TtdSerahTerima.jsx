import { useState } from "react";
import { ArrowLeft, ArrowRight, Eye, FileText, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { T, font } from "../../lib/theme";
import { nextNumericId, rupiah } from "../../lib/utils";
import { generateDocxFromTemplateWithPages, formatTanggalPanjang } from "../../lib/docxGenerate";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import DatePicker from "../../components/DatePicker";
import EmptyState from "../../components/EmptyState";

const EMPTY_KEGIATAN = { nama: "", keterangan: "", jumlah: "" };
const EMPTY_FORM = { ccId: "", judul: "", kegiatan: [{ ...EMPTY_KEGIATAN }] };

// TTD Serah Terima dipilih dari Cash Card (sama seperti Non PO/CC lain) -
// pilih ccId dari daftar, Judul otomatis terisi dari judulCc Cash Card itu.
//
// SATU submission TTD Serah Terima = SATU FILE Word berisi BEBERAPA HALAMAN,
// satu halaman per kegiatan dalam Cash Card itu (sesuai contoh dokumen asli
// user: tiap kegiatan minggu itu dapat lembar "TANDA TERIMA" sendiri, karena
// penerimanya beda-beda orang dan tanda tangannya ditulis tangan manual,
// bukan tanda tangan digital sistem). Makanya form-nya berupa daftar
// kegiatan yang bisa ditambah/dihapus baris, bukan cuma "jumlah baris" angka.
export default function TtdSerahTerimaPage({ ccTtd, setCcTtd, ccList = [], notify }) {
  const [stage, setStage] = useState("list"); // list | form | preview
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingRow, setEditingRow] = useState(null);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activePreviewRow, setActivePreviewRow] = useState(null);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const setKegiatan = (idx, key, value) => {
    setForm((p) => ({
      ...p,
      kegiatan: p.kegiatan.map((k, i) => (i === idx ? { ...k, [key]: value } : k)),
    }));
  };
  const addKegiatan = () => setForm((p) => ({ ...p, kegiatan: [...p.kegiatan, { ...EMPTY_KEGIATAN }] }));
  const removeKegiatan = (idx) => setForm((p) => ({
    ...p,
    kegiatan: p.kegiatan.length > 1 ? p.kegiatan.filter((_, i) => i !== idx) : p.kegiatan,
  }));

  const displayList = search
    ? ccTtd.filter((r) => (r.judul || "").toLowerCase().includes(search.toLowerCase()))
    : ccTtd;

  const startAdd = () => {
    setEditingRow(null);
    const id = nextNumericId(ccTtd, "id");
    setForm({ ...EMPTY_FORM, id, kegiatan: [{ ...EMPTY_KEGIATAN }] });
    setStage("form");
  };
  const startEdit = (row) => {
    setEditingRow(row);
    setForm({ ...row, kegiatan: row.kegiatan?.length ? row.kegiatan : [{ ...EMPTY_KEGIATAN }] });
    setStage("form");
  };

  const goPreview = () => {
    if (!form.judul.trim()) return notify("Pilih Cash Card terlebih dahulu.", "error");
    if (!form.kegiatan.some((k) => k.nama.trim())) return notify("Isi minimal satu kegiatan.", "error");
    setStage("preview");
    setActivePreviewRow({ ...form });
  };

  const saveAndBack = () => {
    const payload = { ...form };
    if (editingRow) {
      setCcTtd((prev) => prev.map((r) => (r.id === editingRow.id ? payload : r)));
      notify("TTD Serah Terima berhasil diperbarui.", "success");
    } else {
      setCcTtd((prev) => [...prev, payload]);
      notify("TTD Serah Terima berhasil ditambahkan.", "success");
    }
    setStage("list");
    setEditingRow(null);
    setForm(EMPTY_FORM);
  };

  const openPreviewFromList = (row) => {
    setActivePreviewRow(row);
    setForm(row);
    setEditingRow(row);
    setStage("preview");
  };

  const doDelete = (row) => {
    setCcTtd((prev) => prev.filter((r) => r.id !== row.id));
    setDeleteConfirm(null);
    notify("TTD Serah Terima berhasil dihapus.", "success");
  };

  // downloadDocx bisa dipanggil dari 2 tempat: dari preview (pakai
  // activePreviewRow) ATAU langsung dari tombol di list (row dikirim
  // eksplisit) - supaya download gak wajib buka preview dulu.
  //
  // Template_TTD_Serah_Terima_CC.docx sudah ada di public/templates/, marker
  // "[[page-start]]"/"[[page-end]]" menandai satu halaman "TANDA TERIMA" yang
  // di-clone sebanyak jumlah kegiatan - tiap halaman kolom TTD-nya dibiarkan
  // kosong untuk ditandatangani manual oleh penerima masing-masing kegiatan.
  const downloadDocx = async (rowArg) => {
    const row = rowArg || activePreviewRow;
    if (!row) return;
    const kegiatanList = (row.kegiatan || []).filter((k) => k.nama.trim());
    if (!kegiatanList.length) return notify("Tidak ada kegiatan untuk dicetak.", "error");

    const pagesData = kegiatanList.map((k) => ({
      no: "1",
      nama: k.nama || "",
      keterangan: k.keterangan || "",
      jumlah: k.jumlah ? rupiah(k.jumlah).replace("Rp", "").trim() : "",
      totalJumlah: k.jumlah ? rupiah(k.jumlah).replace("Rp", "").trim() : "",
    }));

    try {
      await generateDocxFromTemplateWithPages(
        "/templates/Template_TTD_Serah_Terima_CC.docx",
        {
          data: {
            tanggalCetak: formatTanggalPanjang(new Date().toISOString().slice(0, 10)),
            namaAsmanKas: "Astri Oktavina",
          },
          pagesData,
        },
        `TTD-Serah-Terima-${row.id || "baru"}.docx`
      );
      notify(`TTD Serah Terima (.docx, ${pagesData.length} halaman) berhasil diunduh.`, "success");
    } catch (e) {
      notify(`Gagal membuat TTD Serah Terima: ${e.message}`, "error");
    }
  };

  const thStyle = { textAlign: "left", padding: "8px 10px", background: T.bg, borderBottom: `1px solid ${T.border}`, color: T.muted, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3px", whiteSpace: "nowrap" };
  const tdStyle = { padding: "9px 10px", borderBottom: `1px solid ${T.border}`, fontSize: 12.5 };
  const tdCenterStyle = { ...tdStyle, textAlign: "center" };
  const inputStyle = { width: "100%", padding: "9px 11px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.inputBg, color: T.text, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" };
  const inputDisabledStyle = { ...inputStyle, background: T.bg, color: T.muted };
  const labelStyle = { display: "block", fontSize: 12.5, fontWeight: 600, color: T.text, marginBottom: 6 };
  const iconBtnStyle = { width: 26, height: 26, borderRadius: 6, border: `1px solid ${T.border}`, background: T.card, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.muted, marginRight: 3 };

  if (stage === "form") {
    return (
      <div>
        <PageHeader
          eyebrow="Cash Card" title="TTD Serah Terima"
          right={<Button variant="ghost" icon={ArrowLeft} onClick={() => setStage("list")}>Kembali ke daftar</Button>}
        />
        <Card>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px 18px", marginBottom: 20 }}>
            <div style={{ flex: "1 1 200px", maxWidth: 280 }}>
              <label style={labelStyle}>ID <span style={{ fontWeight: 400, color: T.muted }}>(otomatis)</span></label>
              <input value={form.id || ""} disabled style={inputDisabledStyle} />
            </div>

            <div style={{ flex: "1 1 100%" }}>
              <label style={labelStyle}>
                Cash Card <span style={{ fontWeight: 400, color: T.muted }}>(ketik untuk cari, lalu pilih dari daftar)</span>
              </label>
              <input
                list="cc-options-ttd"
                value={form.ccId ? `${form.ccId} - ${form.judul || ""}` : ""}
                onChange={(e) => {
                  const typed = e.target.value;
                  const match = ccList.find((r) => `${r.id} - ${r.judulCc || ""}` === typed);
                  if (match) {
                    set("ccId", match.id);
                    set("judul", match.judulCc || "");
                  } else {
                    set("ccId", "");
                    set("judul", typed);
                  }
                }}
                placeholder="Cari ID atau judul Cash Card..."
                style={inputStyle}
              />
              <datalist id="cc-options-ttd">
                {ccList.map((r) => (
                  <option key={r.id} value={`${r.id} - ${r.judulCc || ""}`} />
                ))}
              </datalist>
            </div>

            <div style={{ flex: "1 1 100%" }}>
              <label style={labelStyle}>
                Judul <span style={{ fontWeight: 400, color: T.muted }}>(otomatis dari Cash Card yang dipilih)</span>
              </label>
              <input value={form.judul} disabled placeholder="terisi otomatis setelah pilih Cash Card" style={inputDisabledStyle} />
            </div>
          </div>

          <div style={{
            fontFamily: font.mono, fontSize: 10.5, letterSpacing: 1.2, textTransform: "uppercase",
            color: T.muted, marginBottom: 10,
          }}>Daftar Kegiatan (satu halaman Tanda Terima per kegiatan)</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
            {form.kegiatan.map((k, idx) => (
              <div key={idx} style={{
                border: `1px solid ${T.border}`, borderRadius: 8, padding: "12px 14px",
                display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end",
              }}>
                <div style={{ flex: "2 1 220px" }}>
                  <label style={labelStyle}>Uraian kegiatan</label>
                  <input value={k.nama} onChange={(e) => setKegiatan(idx, "nama", e.target.value)} placeholder="cth. Partisipasi Kegiatan HUT RI" style={inputStyle} />
                </div>
                <div style={{ flex: "1 1 120px" }}>
                  <label style={labelStyle}>Keterangan</label>
                  <input value={k.keterangan} onChange={(e) => setKegiatan(idx, "keterangan", e.target.value)} placeholder="cth. 1 Lot" style={inputStyle} />
                </div>
                <div style={{ flex: "1 1 150px" }}>
                  <label style={labelStyle}>Jumlah (Rp)</label>
                  <input type="number" value={k.jumlah} onChange={(e) => setKegiatan(idx, "jumlah", e.target.value)} placeholder="cth. 1000000" style={inputStyle} />
                </div>
                <button
                  type="button"
                  onClick={() => removeKegiatan(idx)}
                  disabled={form.kegiatan.length <= 1}
                  title="Hapus kegiatan ini"
                  style={{ ...iconBtnStyle, color: T.danger, opacity: form.kegiatan.length <= 1 ? 0.4 : 1, marginBottom: 2 }}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <Button variant="ghost" icon={Plus} onClick={addKegiatan}>Tambah kegiatan</Button>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
            <Button icon={ArrowRight} onClick={goPreview}>Lihat preview</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (stage === "preview") {
    const row = activePreviewRow || {};
    const kegiatanList = (row.kegiatan || []).filter((k) => k.nama.trim());
    return (
      <div>
        <PageHeader eyebrow="Cash Card" title="Preview TTD Serah Terima" />
        <Card>
          <div style={{ fontSize: 12.5, color: T.muted, marginBottom: 14, textAlign: "center" }}>
            {kegiatanList.length} halaman akan dibuat, satu halaman "TANDA TERIMA" untuk tiap kegiatan berikut ini.
          </div>
          {kegiatanList.map((k, i) => (
            <div key={i} style={{
              border: `1px solid ${T.border}`, borderRadius: 10, padding: "18px 22px",
              background: "#fff", maxWidth: 560, margin: "0 auto 16px",
              fontFamily: "'Times New Roman', Times, serif",
            }}>
              <div style={{ textAlign: "center", fontWeight: 700, fontSize: 13.5, marginBottom: 14, color: T.heading, fontFamily: font.display }}>
                TANDA TERIMA {kegiatanList.length > 1 ? `(halaman ${i + 1})` : ""}
              </div>
              <div style={{ border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr>
                      <th style={{ ...thStyle, textAlign: "center" }}>No</th>
                      <th style={thStyle}>Uraian</th>
                      <th style={{ ...thStyle, textAlign: "center" }}>Keterangan</th>
                      <th style={{ ...thStyle, textAlign: "right" }}>Jumlah</th>
                      <th style={{ ...thStyle, textAlign: "center" }}>TTD</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ ...tdStyle, textAlign: "center" }}>1</td>
                      <td style={tdStyle}>{k.nama}</td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>{k.keterangan || "-"}</td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>{k.jumlah ? rupiah(k.jumlah) : "-"}</td>
                      <td style={tdStyle}>&nbsp;</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div style={{ textAlign: "center", marginTop: 22, fontSize: 11.5 }}>
                <div>Mengetahui,</div>
                <div style={{ fontWeight: 700, marginTop: 34 }}>Astri Oktavina</div>
                <div style={{ color: T.muted, fontSize: 10 }}>ASMAN KAS</div>
              </div>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 6 }}>
            <Button icon={FileText} onClick={() => downloadDocx()}>Unduh Word ({kegiatanList.length} halaman)</Button>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
            <Button variant="ghost" icon={ArrowLeft} onClick={() => setStage("form")}>Edit lagi</Button>
            <Button onClick={saveAndBack}>Simpan &amp; kembali ke daftar</Button>
          </div>
        </Card>
      </div>
    );
  }

  // ===== list =====
  return (
    <div>
      <PageHeader
        eyebrow="Cash Card" title="TTD Serah Terima"
        right={<Button icon={Plus} onClick={startAdd}>Tambah TTD Serah Terima</Button>}
      />
      <Card>
        <div style={{ position: "relative", maxWidth: 280, marginBottom: 14 }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.muted }} />
          <input placeholder="Cari judul…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: "100%", padding: "8px 10px 8px 30px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.bg, fontSize: 12.5, boxSizing: "border-box", fontFamily: "inherit" }} />
        </div>
        {displayList.length === 0 ? (
          <EmptyState label="Belum ada TTD Serah Terima." hint='Klik "Tambah TTD Serah Terima" untuk mulai.' />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Judul</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Jumlah Kegiatan</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {displayList.map((row, i) => (
                  <tr key={row.id} style={{ background: i % 2 === 1 ? T.rowAlt : undefined }}>
                    <td style={tdStyle}>{row.id}</td>
                    <td style={tdStyle}>{row.judul}</td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>{(row.kegiatan || []).filter((k) => k.nama?.trim()).length}</td>
                    <td style={tdCenterStyle}>
                      <button type="button" title="Lihat / Cetak" onClick={() => openPreviewFromList(row)} style={iconBtnStyle}><Eye size={12} /></button>
                      <button type="button" title="Download Word (.docx)" onClick={() => downloadDocx(row)} style={iconBtnStyle}><FileText size={12} /></button>
                      <button type="button" title="Edit" onClick={() => startEdit(row)} style={iconBtnStyle}><Pencil size={12} /></button>
                      <button type="button" title="Hapus" onClick={() => setDeleteConfirm(row)} style={{ ...iconBtnStyle, color: T.danger }}><Trash2 size={12} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {deleteConfirm && (
        <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Hapus TTD Serah Terima?" width={380}>
          <p style={{ color: T.muted, fontSize: 13.5, marginBottom: 18, lineHeight: 1.6 }}>
            TTD Serah Terima <strong>{deleteConfirm.judul}</strong> akan dihapus permanen dari daftar.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>Batal</Button>
            <Button variant="danger" icon={Trash2} onClick={() => doDelete(deleteConfirm)}>Hapus</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
