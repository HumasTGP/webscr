import { useState } from "react";
import { ArrowLeft, ArrowRight, Eye, FileText, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { T, font } from "../../lib/theme";
import { nextNumericId, rupiah } from "../../lib/utils";
import { generateDocxFromTemplateWithRows, formatTanggalPanjang } from "../../lib/docxGenerate";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import DatePicker from "../../components/DatePicker";
import EmptyState from "../../components/EmptyState";

const EMPTY_FORM = {
  judul: "", hariTanggal: "", jam: "", tempat: "", nomorAwal: "", jumlahBaris: "", jumlahPerBaris: "",
};

// TTD Serah Terima BERDIRI SENDIRI - tidak terhubung ke Cash Card manapun.
// Nomor barisnya bisa lanjutan (mis. 21-40), bukan selalu mulai dari 1, sesuai
// pola asli yang dipakai lapangan (lihat contoh TANDA_TERIMA_21-40.xlsx).
export default function TtdSerahTerimaPage({ ccTtd, setCcTtd, notify }) {
  const [stage, setStage] = useState("list"); // list | form | preview
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingRow, setEditingRow] = useState(null);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activePreviewRow, setActivePreviewRow] = useState(null);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const displayList = search
    ? ccTtd.filter((r) => (r.judul || "").toLowerCase().includes(search.toLowerCase()))
    : ccTtd;

  const startAdd = () => {
    setEditingRow(null);
    const id = nextNumericId(ccTtd, "id");
    setForm({ ...EMPTY_FORM, id, hariTanggal: new Date().toISOString().slice(0, 10) });
    setStage("form");
  };
  const startEdit = (row) => {
    setEditingRow(row);
    setForm({ ...row });
    setStage("form");
  };

  const goPreview = () => {
    if (!form.judul.trim()) return notify("Isi Judul terlebih dahulu.", "error");
    const jumlahBaris = parseInt(form.jumlahBaris, 10) || 1;
    const nomorAwal = parseInt(form.nomorAwal, 10) || 1;
    setStage("preview");
    setActivePreviewRow({ ...form, jumlahBaris, nomorAwal });
  };

  const saveAndBack = () => {
    const jumlahBaris = parseInt(form.jumlahBaris, 10) || 1;
    const nomorAwal = parseInt(form.nomorAwal, 10) || 1;
    const payload = { ...form, jumlahBaris, nomorAwal };
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
  // CATATAN TEMPLATE (lihat generateDocxFromTemplateWithRows di
  // docxGenerate.js untuk penjelasan lengkap cara bikin templatenya):
  // Template_TTD_Serah_Terima_CC.docx BELUM ADA di public/templates/ - file
  // ini perlu ditambahkan manual. Templatenya harus punya 1 baris tabel
  // contoh dengan marker "[[row]]" di salah satu selnya, dan placeholder
  // per kolom: [no], [nama], [jumlah], [ttd]. Baris itu akan di-clone
  // otomatis sebanyak jumlahBaris yang diisi user di form.
  const downloadDocx = async (rowArg) => {
    const row = rowArg || activePreviewRow;
    if (!row) return;
    const nomorAwal = parseInt(row.nomorAwal, 10) || 1;
    const jumlahBaris = parseInt(row.jumlahBaris, 10) || 1;
    const rowsData = Array.from({ length: jumlahBaris }, (_, i) => ({
      no: String(nomorAwal + i),
      nama: "",
      jumlah: row.jumlahPerBaris ? rupiah(row.jumlahPerBaris) : "",
      ttd: "",
    }));
    const totalJumlah = row.jumlahPerBaris ? rupiah((Number(row.jumlahPerBaris) || 0) * jumlahBaris) : "";
    try {
      await generateDocxFromTemplateWithRows(
        "/templates/Template_TTD_Serah_Terima_CC.docx",
        {
          data: {
            hariTanggal: row.hariTanggal ? formatTanggalPanjang(row.hariTanggal) : "",
            jam: row.jam || "",
            tempat: row.tempat || "",
            judul: row.judul || "",
            totalJumlah,
            tanggalCetak: formatTanggalPanjang(new Date().toISOString().slice(0, 10)),
            namaAsmanKas: "Astri Oktavina",
          },
          rowsData,
        },
        `TTD-Serah-Terima-${row.id || "baru"}.docx`
      );
      notify("TTD Serah Terima (.docx) berhasil diunduh.", "success");
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
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px 18px" }}>
            <div style={{ flex: "1 1 200px", maxWidth: 280 }}>
              <label style={labelStyle}>ID <span style={{ fontWeight: 400, color: T.muted }}>(otomatis)</span></label>
              <input value={form.id || ""} disabled style={inputDisabledStyle} />
            </div>
            <div style={{ flex: "1 1 100%" }}>
              <label style={labelStyle}>Judul</label>
              <input value={form.judul} onChange={(e) => set("judul", e.target.value)} placeholder="cth. Bantuan Peringatan HUT RI RW 05" style={inputStyle} />
            </div>
            <div style={{ flex: "1 1 200px", maxWidth: 280 }}>
              <label style={labelStyle}>Hari/Tanggal</label>
              <DatePicker value={form.hariTanggal} onChange={(v) => set("hariTanggal", v)} />
            </div>
            <div style={{ flex: "1 1 200px", maxWidth: 280 }}>
              <label style={labelStyle}>Jam</label>
              <input value={form.jam} onChange={(e) => set("jam", e.target.value)} placeholder="cth. 09.00-Selesai" style={inputStyle} />
            </div>
            <div style={{ flex: "1 1 200px", maxWidth: 280 }}>
              <label style={labelStyle}>Tempat</label>
              <input value={form.tempat} onChange={(e) => set("tempat", e.target.value)} placeholder="cth. RPTRA Sunter" style={inputStyle} />
            </div>
            <div style={{ flex: "1 1 200px", maxWidth: 280 }}>
              <label style={labelStyle}>Nomor Awal <span style={{ fontWeight: 400, color: T.muted }}>(bisa lanjutan, cth. 21)</span></label>
              <input type="number" min="1" value={form.nomorAwal} onChange={(e) => set("nomorAwal", e.target.value)} placeholder="cth. 21" style={inputStyle} />
            </div>
            <div style={{ flex: "1 1 200px", maxWidth: 280 }}>
              <label style={labelStyle}>Jumlah Baris <span style={{ fontWeight: 400, color: T.muted }}>(berapa baris TTD dibutuhkan)</span></label>
              <input type="number" min="1" value={form.jumlahBaris} onChange={(e) => set("jumlahBaris", e.target.value)} placeholder="cth. 20" style={inputStyle} />
            </div>
            <div style={{ flex: "1 1 200px", maxWidth: 280 }}>
              <label style={labelStyle}>Jumlah per baris <span style={{ fontWeight: 400, color: T.muted }}>(opsional, Rp per orang)</span></label>
              <input type="number" value={form.jumlahPerBaris} onChange={(e) => set("jumlahPerBaris", e.target.value)} placeholder="cth. 100000" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
            <Button icon={ArrowRight} onClick={goPreview}>Lihat preview</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (stage === "preview") {
    const row = activePreviewRow || {};
    const nomorAwal = parseInt(row.nomorAwal, 10) || 1;
    const jumlahBaris = parseInt(row.jumlahBaris, 10) || 1;
    const nomorAkhir = nomorAwal + jumlahBaris - 1;
    return (
      <div>
        <PageHeader eyebrow="Cash Card" title="Preview TTD Serah Terima" />
        <Card>
          <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: "22px 26px", background: "#fff", maxWidth: 560, margin: "0 auto", fontFamily: "'Times New Roman', Times, serif" }}>
            <div style={{ textAlign: "center", fontWeight: 700, fontSize: 13.5, marginBottom: 2, color: T.heading, fontFamily: font.display }}>TANDA TERIMA</div>
            <div style={{ textAlign: "right", color: T.muted, fontSize: 11, marginBottom: 12 }}>
              Jakarta, {row.hariTanggal ? formatTanggalPanjang(row.hariTanggal) : "-"}
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.8, marginBottom: 12 }}>
              <div>Hari/Tanggal : {row.hariTanggal ? formatTanggalPanjang(row.hariTanggal) : "-"}</div>
              <div>Jam : {row.jam || "-"}</div>
              <div>Tempat : {row.tempat || "-"}</div>
              <div>Agenda/Acara : {row.judul || "-"}</div>
            </div>
            <div style={{ border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, textAlign: "center" }}>No</th>
                    <th style={thStyle}>Nama</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Jumlah</th>
                    <th style={{ ...thStyle, textAlign: "center" }}>Tanda Tangan</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: Math.min(jumlahBaris, 6) }, (_, i) => (
                    <tr key={i}>
                      <td style={{ ...tdStyle, textAlign: "center" }}>{nomorAwal + i}</td>
                      <td style={tdStyle}>&nbsp;</td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>{row.jumlahPerBaris ? rupiah(row.jumlahPerBaris) : "-"}</td>
                      <td style={tdStyle}>&nbsp;</td>
                    </tr>
                  ))}
                  {jumlahBaris > 6 && (
                    <tr>
                      <td colSpan={4} style={{ ...tdStyle, textAlign: "center", color: T.muted }}>
                        … dan {jumlahBaris - 6} baris lagi (nomor {nomorAwal + 6} - {nomorAkhir})
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ textAlign: "center", marginTop: 22, fontSize: 11.5 }}>
              <div>Mengetahui,</div>
              <div style={{ fontWeight: 700, marginTop: 34 }}>Astri Oktavina</div>
              <div style={{ color: T.muted, fontSize: 10 }}>ASMAN KAS</div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 16 }}>
            <Button icon={FileText} onClick={downloadDocx}>Unduh Word (.docx)</Button>
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
                  <th style={{ ...thStyle, textAlign: "right" }}>Jumlah Baris</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {displayList.map((row, i) => (
                  <tr key={row.id} style={{ background: i % 2 === 1 ? T.rowAlt : undefined }}>
                    <td style={tdStyle}>{row.id}</td>
                    <td style={tdStyle}>{row.judul}</td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>{row.jumlahBaris}</td>
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
