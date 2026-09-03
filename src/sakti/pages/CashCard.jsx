import { useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { T, font } from "../../lib/theme";
import { nextNumericId, parseLocalDate, rupiah, terbilang as toTerbilang } from "../../lib/utils";
import { OPT } from "../../lib/data";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import ComboManaged from "../../components/ComboManaged";
import DatePicker from "../../components/DatePicker";
import EmptyState from "../../components/EmptyState";

const MONTHS_ID = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
function monthKey(dateStr) {
  const d = parseLocalDate(dateStr);
  if (!d) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function monthLabel(key) {
  const [year, month] = key.split("-");
  return `${MONTHS_ID[parseInt(month, 10) - 1]} ${year}`;
}

export const DEFAULT_CC_COMBO = {
  bidang: ["Keamanan & Humas", "Umum", "SDM"],
  procost: OPT.procost,
  expType: OPT.expType,
  satuan: ["pcs", "set", "lot", "unit", "paket", "box", "dus", "liter", "meter", "orang", "hari"],
  vendor: ["CV Sumber Jaya", "ABB SAKTI INDUSTRI, PT", "ABDIBANGUN BUANA, PT"],
};

function StatusDot({ status, title, onClick }) {
  const styles = {
    done: { color: "#166E49", title: "Sudah dibuat - klik untuk buka" },
    draft: { color: "#C98A0A", title: "Draft - klik untuk lanjutkan" },
    none: { color: "#A9B3B6", title: "Belum dibuat - klik untuk mulai" },
  };
  const s = styles[status] || styles.none;
  const sym = status === "done" ? "✓" : status === "draft" ? "•" : "—";
  return (
    <button
      type="button"
      onClick={onClick}
      title={title || s.title}
      style={{
        color: s.color, fontWeight: 700, fontSize: 15,
        border: "none", background: "transparent", cursor: onClick ? "pointer" : "default",
        padding: "2px 6px", borderRadius: 6,
      }}
      onMouseEnter={(e) => { if (onClick) e.currentTarget.style.background = "rgba(0,0,0,0.06)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
    >
      {sym}
    </button>
  );
}

const EMPTY_CC = {
  judulCc: "", tanggal: "", bidang: "", saldoKas: "", procost: "",
};

// Cash Card BERDIRI SENDIRI - tidak dipilih dari RAB. "ID" dan "Submission ID"
// dibuat otomatis (angkanya sama) dan jadi bagian depan nomor dokumen turunan
// (Nomor Pengajuan, Nomor BA, dst), yang diisi di halaman Detail CC, bukan di sini.
export default function CashCardPage({
  ccList, setCcList, ccItems, ccBast, ccPakta, ccBapp,
  combo, setCombo, notify, onNavigate,
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_CC);
  const [search, setSearch] = useState("");
  const [filterBulan, setFilterBulan] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [overviewRow, setOverviewRow] = useState(null);
  const [editingRow, setEditingRow] = useState(null);

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));
  const setComboOpts = (key, opts) => setCombo((p) => ({ ...p, [key]: opts }));

  const bulanOptions = useMemo(() => {
    const months = new Set();
    ccList.forEach((r) => { const k = monthKey(r.tanggal); if (k) months.add(k); });
    return [...months].sort().reverse();
  }, [ccList]);

  const displayList = useMemo(() => {
    let list = ccList;
    if (filterBulan) list = list.filter((r) => monthKey(r.tanggal) === filterBulan);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r) =>
        (r.id || "").toLowerCase().includes(q) ||
        (r.judulCc || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [ccList, filterBulan, search]);

  const openAdd = () => {
    setEditingRow(null);
    const id = nextNumericId(ccList, "id");
    setForm({ ...EMPTY_CC, id });
    setAddOpen(true);
  };
  const openEdit = (row) => {
    setEditingRow(row);
    setForm({ ...row });
    setAddOpen(true);
  };

  const saveAdd = () => {
    if (!form.judulCc.trim()) return notify("Isi Judul CC terlebih dahulu.", "error");
    if (editingRow) {
      setCcList((prev) => prev.map((r) => (r.id === editingRow.id ? { ...r, ...form } : r)));
      notify("Cash Card berhasil diperbarui.", "success");
    } else {
      setCcList((prev) => [...prev, { ...form, createdAt: new Date().toISOString() }]);
      notify("Cash Card berhasil ditambahkan.", "success");
    }
    setAddOpen(false);
    setEditingRow(null);
    setForm(EMPTY_CC);
  };

  const doDelete = (row) => {
    setCcList((prev) => prev.filter((r) => r.id !== row.id));
    setDeleteConfirm(null);
    notify("Cash Card berhasil dihapus.", "success");
  };

  const thStyle = { textAlign: "left", padding: "8px 10px", background: T.bg, borderBottom: `1px solid ${T.border}`, color: T.muted, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3px", whiteSpace: "nowrap" };
  const tdStyle = { padding: "9px 10px", borderBottom: `1px solid ${T.border}`, fontSize: 12.5 };
  const tdCenterStyle = { ...tdStyle, textAlign: "center" };
  const tdNumStyle = { ...tdStyle, textAlign: "right", fontVariantNumeric: "tabular-nums" };

  return (
    <div>
      <PageHeader
        eyebrow="Pembayaran"
        title="Cash Card"
        right={<Button icon={Plus} onClick={openAdd}>Tambah Cash Card</Button>}
      />

      <Card style={{ marginBottom: 14, padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 200px", maxWidth: 280 }}>
            <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.muted }} />
            <input
              placeholder="Cari ID, Submission ID, judul…"
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

      <Card style={{ padding: 0 }}>
        {displayList.length === 0 ? (
          <EmptyState
            label="Belum ada pengajuan Cash Card."
            hint='Klik "Tambah Cash Card" untuk mulai.'
            actionLabel="Tambah Cash Card"
            onAction={openAdd}
          />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Submission ID</th>
                  <th style={thStyle}>Judul CC</th>
                  <th style={thStyle}>Bidang</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Saldo Kas</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Penagihan</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>BAST</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>PI</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>BAPP</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {displayList.map((row, i) => {
                  const hasItems = ccItems.some((it) => it.ccId === row.id);
                  const bastRow = ccBast.find((b) => b.id === row.id);
                  const paktaRow = ccPakta.find((p) => p.id === row.id);
                  const bappRow = ccBapp.find((b) => b.id === row.id);
                  const bastStatus = bastRow ? (bastRow.tanggal && bastRow.namaPihakKedua ? "done" : "draft") : "none";
                  const piStatus = paktaRow ? (paktaRow.tanggalPi && paktaRow.namaPenerima ? "done" : "draft") : "none";
                  const bappStatus = bappRow ? "done" : "none";
                  return (
                    <tr key={row.id} style={{ background: i % 2 === 1 ? T.rowAlt : undefined }}>
                      <td style={tdStyle}>
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: 6, background: T.bg, border: `1px solid ${T.border}`, fontWeight: 700, color: T.muted, fontSize: 11 }}>{row.id}</span>
                      </td>
                      <td style={tdStyle}>{row.id}</td>
                      <td style={tdStyle}>{row.judulCc}</td>
                      <td style={tdStyle}>{row.bidang || "-"}</td>
                      <td style={tdNumStyle}>{row.saldoKas ? rupiah(row.saldoKas) : "-"}</td>
                      <td style={tdCenterStyle}><StatusDot status={hasItems ? "done" : "none"} onClick={() => onNavigate?.("detail-cc")} /></td>
                      <td style={tdCenterStyle}><StatusDot status={bastStatus} onClick={() => onNavigate?.("bast-cc")} /></td>
                      <td style={tdCenterStyle}><StatusDot status={piStatus} onClick={() => onNavigate?.("pakta-cc")} /></td>
                      <td style={tdCenterStyle}><StatusDot status={bappStatus} onClick={() => onNavigate?.("bapp-cc")} /></td>
                      <td style={tdCenterStyle}>
                        <button type="button" title="Lihat" onClick={() => setOverviewRow(row)} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${T.border}`, background: T.card, cursor: "pointer", color: T.muted, display: "inline-flex", alignItems: "center", justifyContent: "center", marginRight: 3 }}>
                          <Eye size={12} />
                        </button>
                        <button type="button" title="Edit" onClick={() => openEdit(row)} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${T.border}`, background: T.card, cursor: "pointer", color: T.muted, display: "inline-flex", alignItems: "center", justifyContent: "center", marginRight: 3 }}>
                          <Pencil size={12} />
                        </button>
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
        )}
      </Card>
      <div style={{ fontSize: 11.5, color: T.muted, margin: "10px 2px 0", lineHeight: 1.6 }}>
        ✓ hijau = dokumen sudah dibuat, • kuning = masih draft, — abu = belum dibuat. Klik titik status untuk langsung buka dokumen terkait.
      </div>

      {/* Modal Tambah/Edit Cash Card */}
      <Modal open={addOpen} onClose={() => { setAddOpen(false); setEditingRow(null); }} title={editingRow ? "Edit Cash Card" : "Tambah Cash Card"} width={560}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px 16px", marginBottom: 8 }}>
          <div style={{ flex: "1 1 200px", maxWidth: 280 }}>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: T.text, marginBottom: 6 }}>
              ID <span style={{ fontWeight: 400, color: T.muted }}>(otomatis)</span>
            </label>
            <input value={form.id || ""} disabled style={{ width: "100%", padding: "9px 11px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.bg, color: T.muted, fontSize: 13, boxSizing: "border-box" }} />
          </div>
          <div style={{ flex: "1 1 200px", maxWidth: 280 }}>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: T.text, marginBottom: 6 }}>Tanggal</label>
            <DatePicker value={form.tanggal} onChange={(v) => set("tanggal", v)} />
          </div>
          <div style={{ flex: "1 1 100%", maxWidth: "100%" }}>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: T.text, marginBottom: 6 }}>Judul CC</label>
            <input
              value={form.judulCc}
              onChange={(e) => set("judulCc", e.target.value)}
              placeholder="cth. Cash Card Kegiatan Donor Darah PMI"
              style={{ width: "100%", padding: "9px 11px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.inputBg, color: T.text, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" }}
            />
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
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: T.text, marginBottom: 6 }}>Saldo kas</label>
            <input
              type="number"
              value={form.saldoKas}
              onChange={(e) => set("saldoKas", e.target.value)}
              placeholder="Rp"
              style={{ width: "100%", padding: "9px 11px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.inputBg, color: T.text, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ flex: "1 1 200px", maxWidth: 280 }}>
            <ComboManaged
              label="Procost"
              value={form.procost}
              options={combo.procost}
              onChange={(v) => set("procost", v)}
              onOptions={(opts) => setComboOpts("procost", opts)}
              placeholder="Pilih procost…"
            />
          </div>
          <div style={{ flex: "1 1 100%", maxWidth: "100%" }}>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: T.text, marginBottom: 6 }}>
              Terbilang <span style={{ fontWeight: 400, color: T.muted }}>(otomatis, dari Saldo Kas)</span>
            </label>
            <input
              value={form.saldoKas ? toTerbilang(form.saldoKas) : ""}
              disabled
              placeholder="terisi otomatis setelah isi Saldo Kas"
              style={{ width: "100%", padding: "9px 11px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.bg, color: T.muted, fontSize: 13, boxSizing: "border-box" }}
            />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, gap: 10 }}>
          <Button variant="ghost" onClick={() => { setAddOpen(false); setEditingRow(null); }}>Batal</Button>
          <Button onClick={saveAdd}>Simpan</Button>
        </div>
      </Modal>

      {/* Modal Overview */}
      {overviewRow && (
        <Modal open={!!overviewRow} onClose={() => setOverviewRow(null)} title={`Overview Cash Card - ${overviewRow.id}`} width={480}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 20px" }}>
            {[
              ["Judul CC", overviewRow.judulCc],
              ["Bidang", overviewRow.bidang],
              ["Saldo kas", overviewRow.saldoKas ? rupiah(overviewRow.saldoKas) : "-"],
              ["Nomor Pengajuan", overviewRow.nomorPengajuan || "-"],
              ["Judul Pengajuan", overviewRow.judulPengajuan || "-"],
              ["Procost", overviewRow.procost || "-"],
            ].map(([label, val]) => (
              <div key={label} style={{ flex: "1 1 200px", maxWidth: 320, borderBottom: `1px solid ${T.border}`, paddingBottom: 8 }}>
                <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</div>
                <div style={{ fontSize: 13.5, color: T.text, fontWeight: 500, marginTop: 2 }}>{val || "-"}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <Button onClick={() => setOverviewRow(null)}>Tutup</Button>
          </div>
        </Modal>
      )}

      {/* Modal Hapus */}
      {deleteConfirm && (
        <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Hapus Cash Card?" width={400}>
          <p style={{ color: T.text, fontSize: 13.5, lineHeight: 1.6 }}>
            Cash Card <strong>{deleteConfirm.id}</strong> beserta seluruh rekap di dalamnya akan dihapus permanen.
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
