import { useMemo, useState } from "react";
import { Plus, Search, Trash2, X } from "lucide-react";
import { T, font } from "../../lib/theme";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import ComboManaged from "../../components/ComboManaged";

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

function StatusDot({ status, title }) {
  const styles = {
    done:  { color: "#166E49", title: "Sudah" },
    draft: { color: "#C98A0A", title: "Draft" },
    none:  { color: "#A9B3B6", title: "Belum dibuat" },
  };
  const s = styles[status] || styles.none;
  const sym = status === "done" ? "✓" : status === "draft" ? "•" : "—";
  return (
    <span title={title || s.title} style={{ color: s.color, fontWeight: 700, fontSize: 15 }}>
      {sym}
    </span>
  );
}

function docStatus(list, rabId, idKey = "id") {
  const match = list.find((r) => (r[idKey] || r.submissionId || r.id) === rabId);
  if (!match) return "none";
  return "done";
}

export const DEFAULT_COMBO = {
  bidang: ["Keamanan & Humas", "Umum", "SDM"],
  program: [
    "Pelayanan Masyarakat", "Pemberdayaan Masyarakat", "Pembinaan Hubungan Masyarakat",
    "Keamanan PLTGU Blok 1-2", "Keamanan PLTD Senayan", "Keamanan PLTGU Blok 3", "Keamanan PLTGU Blok 4",
  ],
  subprogram: [
    "Karitatif", "Charity", "Pengembangan Kapasitas", "Infrastruktur",
    "Fasilitasi Kegiatan Corporate", "Ekonomi", "Keamanan",
  ],
  kategori: [
    "Covid19", "Keamanan", "Mitigasi Bencana", "Tanggap Darurat Bencana", "Pemulihan Bencana",
    "Peresmian", "Kesehatan", "Pendidikan", "Ekonomi", "Pemberdayaan", "Lingkungan", "Forum Warga",
    "Bencana Alam", "Pemasaran Produk", "Keagamaan / Komunikasi Sosial", "Kemitraan",
    "Hari Besar Nasional", "Publikasi", "Pelatihan", "Riset dan Pengembangan", "Awarding", "Kesenian",
  ],
};

const EMPTY_FORM = { rabId: "", bidang: "", tanggalKegiatan: "", judulKegiatan: "", program: "", subprogram: "", kategoriProgram: "" };

export default function NonPoPage({ rab, lmp1, lmp2, bast, pakta, bapp, formVerif, notify, onNavigate, kategori, submissions, setSubmissions, combo, setCombo }) {
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [filterBulan, setFilterBulan] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const nonpoList = useMemo(
    () => (submissions || []).filter((r) => !kategori || r.kategori === kategori),
    [submissions, kategori]
  );
  const setNonpoList = (updater) => {
    setSubmissions((prev) => {
      const prevFiltered = prev.filter((r) => !kategori || r.kategori === kategori);
      const others = prev.filter((r) => kategori && r.kategori !== kategori);
      const nextFiltered = typeof updater === "function" ? updater(prevFiltered) : updater;
      return [...others, ...nextFiltered];
    });
  };

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));
  const setComboOpts = (key, opts) => setCombo((p) => ({ ...p, [key]: opts }));

  const bulanOptions = useMemo(() => {
    const months = new Set();
    nonpoList.forEach((r) => { const k = monthKey(r.tanggalKegiatan); if (k) months.add(k); });
    return [...months].sort().reverse();
  }, [nonpoList]);

  const displayList = useMemo(() => {
    let list = nonpoList;
    if (filterBulan) list = list.filter((r) => monthKey(r.tanggalKegiatan) === filterBulan);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r) => (r.rabId || "").toLowerCase().includes(q) || (r.judulKegiatan || "").toLowerCase().includes(q));
    }
    return list;
  }, [nonpoList, filterBulan, search]);

  const kategoriSuffix = kategori === "PO" ? "po" : kategori === "Cash Card" ? "cc" : "nonpo";
  const saveAdd = () => {
    if (!form.rabId) return notify("Pilih ID RAB terlebih dahulu.", "error");
    setNonpoList((prev) => [...prev, { ...form, kategori: kategori || "NON PO", createdAt: new Date().toISOString() }]);
    setAddOpen(false);
    setForm(EMPTY_FORM);
    notify("NON PO berhasil ditambahkan.", "success");
    if (onNavigate) onNavigate(`lmp1-${kategoriSuffix}`);
  };

  const doDelete = (row) => {
    setNonpoList((prev) => prev.filter((r) => r !== row));
    setDeleteConfirm(null);
    notify("NON PO berhasil dihapus.", "success");
  };

  const rabOptions = rab.map((r) => r.idNumber);

  const thStyle = { textAlign: "left", padding: "8px 10px", background: T.bg, borderBottom: `1px solid ${T.border}`, color: T.muted, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3px", whiteSpace: "nowrap" };
  const tdStyle = { padding: "9px 10px", borderBottom: `1px solid ${T.border}`, fontSize: 12.5 };
  const tdCenterStyle = { ...tdStyle, textAlign: "center" };

  return (
    <div>
      <PageHeader
        eyebrow="Pembayaran"
        title={kategori || "NON PO"}
        description={`Daftar semua pengajuan ${kategori || "NON PO"}. Klik '+ Tambah ${kategori || "NON PO"}' untuk mulai pengajuan baru, lalu lanjut ke LMP 1 dst dari submenu di sidebar.`}
        right={<Button icon={Plus} onClick={() => setAddOpen(true)}>+ Tambah {kategori || "NON PO"}</Button>}
      />

      {/* Filter + search bar */}
      <Card style={{ marginBottom: 14, padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 200px", maxWidth: 280 }}>
            <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.muted }} />
            <input
              placeholder="Cari ID, judul kegiatan…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "8px 10px 8px 30px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.bg, fontSize: 12.5, boxSizing: "border-box", fontFamily: "inherit" }}
            />
          </div>
          <select
            value={filterBulan}
            onChange={(e) => setFilterBulan(e.target.value)}
            style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.card, fontSize: 12.5, color: T.text, fontFamily: "inherit" }}
          >
            <option value="">Semua bulan</option>
            {bulanOptions.map((k) => <option key={k} value={k}>{monthLabel(k)}</option>)}
          </select>
          {(search || filterBulan) && (
            <button type="button" onClick={() => { setSearch(""); setFilterBulan(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
              <X size={12} /> Reset
            </button>
          )}
        </div>
      </Card>

      {/* Checklist table */}
      <Card style={{ padding: 0 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr>
                <th style={thStyle}>Submission ID</th>
                <th style={thStyle}>Judul kegiatan</th>
                <th style={thStyle}>Bidang</th>
                <th style={thStyle}>Program</th>
                <th style={{ ...thStyle, textAlign: "center" }}>LMP1</th>
                <th style={{ ...thStyle, textAlign: "center" }}>LMP2</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Verif</th>
                <th style={{ ...thStyle, textAlign: "center" }}>BAST</th>
                <th style={{ ...thStyle, textAlign: "center" }}>PI</th>
                <th style={{ ...thStyle, textAlign: "center" }}>BAPP</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {displayList.length === 0 && (
                <tr>
                  <td colSpan={11} style={{ ...tdStyle, textAlign: "center", color: T.muted, padding: "28px 12px" }}>
                    Belum ada pengajuan NON PO. Klik "+ Tambah NON PO" untuk mulai.
                  </td>
                </tr>
              )}
              {displayList.map((row, i) => {
                const rabId = row.rabId;
                const lmp1Status = docStatus(lmp1 || [], rabId, "submissionId");
                const lmp2Status = docStatus(lmp2 || [], rabId, "submissionId");
                const verifStatus = docStatus(formVerif || [], rabId, "submissionId");
                const bastStatus = docStatus(bast || [], rabId, "id");
                const piStatus = docStatus(pakta || [], rabId, "id");
                const bappStatus = docStatus(bapp || [], rabId, "id");
                return (
                  <tr key={i} style={{ background: i % 2 === 1 ? T.rowAlt : undefined }}>
                    <td style={tdStyle}>{rabId}</td>
                    <td style={tdStyle}>{row.judulKegiatan}</td>
                    <td style={tdStyle}>{row.bidang}</td>
                    <td style={tdStyle}>{row.program}</td>
                    <td style={tdCenterStyle}><StatusDot status={lmp1Status} /></td>
                    <td style={tdCenterStyle}><StatusDot status={lmp2Status} /></td>
                    <td style={tdCenterStyle}><StatusDot status={verifStatus} /></td>
                    <td style={tdCenterStyle}><StatusDot status={bastStatus} /></td>
                    <td style={tdCenterStyle}><StatusDot status={piStatus} /></td>
                    <td style={tdCenterStyle}><StatusDot status={bappStatus} /></td>
                    <td style={tdCenterStyle}>
                      <button type="button" title="Hapus" onClick={() => setDeleteConfirm(row)} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${T.border}`, background: T.card, cursor: "pointer", color: T.danger, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <div style={{ fontSize: 11.5, color: T.muted, margin: "10px 2px 0", lineHeight: 1.6 }}>
        ✓ hijau = dokumen sudah dibuat, • kuning = masih draft, — abu = belum dibuat. Lanjutkan pengajuan dari submenu sidebar di sebelah kiri.
      </div>

      {/* Add NON PO modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Tambah NON PO" width={560}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px 16px", marginBottom: 8 }}>
          <div style={{ flex: "1 1 100%", maxWidth: "100%" }}>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: T.text, marginBottom: 6 }}>
              ID dari RAB <span style={{ fontWeight: 400, color: T.muted }}>(pilih dari daftar RAB)</span>
            </label>
            <select
              value={form.rabId}
              onChange={(e) => {
                const id = e.target.value;
                const r = rab.find((r) => r.idNumber === id);
                set("rabId", id);
                set("judulKegiatan", r ? (r.judulKegiatan || "") : "");
              }}
              style={{ width: "100%", padding: "9px 11px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.inputBg, color: T.text, fontSize: 13, fontFamily: "inherit" }}
            >
              <option value="">— Pilih ID RAB —</option>
              {rabOptions.map((id) => {
                const r = rab.find((r) => r.idNumber === id);
                return <option key={id} value={id}>{id}{r?.judulKegiatan ? ` - ${r.judulKegiatan}` : ""}</option>;
              })}
            </select>
          </div>

          <div style={{ flex: "1 1 200px", maxWidth: 280 }}>
            <ComboManaged
              label="Bidang"
              value={form.bidang}
              options={combo.bidang}
              onChange={(v) => set("bidang", v)}
              onOptions={(opts) => setComboOpts("bidang", opts)}
              placeholder="Pilih bidang…"
            />
          </div>

          <div style={{ flex: "1 1 200px", maxWidth: 280 }}>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: T.text, marginBottom: 6 }}>Tanggal kegiatan</label>
            <input type="date" value={form.tanggalKegiatan} onChange={(e) => set("tanggalKegiatan", e.target.value)} style={{ width: "100%", padding: "9px 11px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.inputBg, color: T.text, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" }} />
          </div>

          <div style={{ flex: "1 1 100%", maxWidth: "100%" }}>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: T.text, marginBottom: 6 }}>
              Judul kegiatan <span style={{ fontWeight: 400, color: T.muted }}>(otomatis dari RAB)</span>
            </label>
            <input
              value={form.judulKegiatan}
              disabled
              placeholder="terisi otomatis setelah pilih RAB"
              style={{ width: "100%", padding: "9px 11px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.bg, color: T.muted, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ flex: "1 1 200px", maxWidth: 280 }}>
            <ComboManaged
              label="Program"
              value={form.program}
              options={combo.program}
              onChange={(v) => set("program", v)}
              onOptions={(opts) => setComboOpts("program", opts)}
              placeholder="Pilih program…"
            />
          </div>

          <div style={{ flex: "1 1 200px", maxWidth: 280 }}>
            <ComboManaged
              label="Sub Program"
              value={form.subprogram}
              options={combo.subprogram}
              onChange={(v) => set("subprogram", v)}
              onOptions={(opts) => setComboOpts("subprogram", opts)}
              placeholder="Pilih sub program…"
            />
          </div>

          <div style={{ flex: "1 1 200px", maxWidth: 280 }}>
            <ComboManaged
              label="Kategori Program"
              value={form.kategoriProgram}
              options={combo.kategori}
              onChange={(v) => set("kategoriProgram", v)}
              onOptions={(opts) => setComboOpts("kategori", opts)}
              placeholder="Pilih kategori…"
            />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, gap: 10 }}>
          <Button variant="ghost" onClick={() => setAddOpen(false)}>Batal</Button>
          <Button onClick={saveAdd}>Simpan & lanjut ke LMP 1 →</Button>
        </div>
      </Modal>

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Hapus NON PO?" width={400}>
          <p style={{ color: T.text, fontSize: 13.5, lineHeight: 1.6 }}>
            Pengajuan NON PO <strong>{deleteConfirm.rabId}</strong> — <em>{deleteConfirm.judulKegiatan}</em> — akan dihapus permanen.
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
