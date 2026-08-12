import { useMemo, useState } from "react";
import { Camera, Eye, Search, Trash2, Upload } from "lucide-react";
import { T, font } from "../../lib/theme";
import { uid } from "../../lib/utils";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import UploadDocModal from "../../components/UploadDocModal";

function rabNumber(id = "") {
  const match = String(id).match(/(\d+)(?!.*\d)/);
  return match ? Number(match[1]) : -1;
}

export default function DokumentasiPage({ rab, notify }) {
  const [docs, setDocs] = useState([]);
  const [showUpload, setShowUpload] = useState(null);
  const [preview, setPreview] = useState(null);
  const [query, setQuery] = useState("");

  const handleSave = (rabItem, files, keterangan) => {
    if (!rabItem) return;
    const newDocs = files.map((f) => ({
      id: uid("DOK"), rabId: rabItem.idNumber, judulRab: rabItem.judulKegiatan,
      fileName: f.name, fileSize: f.size, fileType: f.type, keterangan,
      uploadedAt: new Date().toISOString(), url: URL.createObjectURL(f),
    }));
    setDocs((prev) => [...prev, ...newDocs]);
    notify?.(`${newDocs.length} file dokumentasi berhasil disimpan.`, "success", "Upload Dokumentasi");
  };

  const handleDelete = (docId) => {
    setDocs((prev) => prev.filter((d) => d.id !== docId));
    notify?.("Dokumentasi dihapus.", "success");
  };

  const sortedRab = useMemo(() => [...(rab || [])].sort((a, b) => {
    const n = rabNumber(b.idNumber) - rabNumber(a.idNumber);
    return n || String(b.idNumber).localeCompare(String(a.idNumber), "id", { numeric: true });
  }), [rab]);

  const filteredRab = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sortedRab;
    return sortedRab.filter((r) => String(r.idNumber).toLowerCase().includes(q) || String(r.judulKegiatan || "").toLowerCase().includes(q));
  }, [query, sortedRab]);

  const uploaded = filteredRab.filter((r) => docs.some((d) => d.rabId === r.idNumber));
  const pending = filteredRab.filter((r) => !docs.some((d) => d.rabId === r.idNumber));

  return <div>
    <PageHeader eyebrow="Pelaksanaan" title="Dokumentasi" description="Cari ID RAB, unggah dokumentasi kegiatan, dan pantau RAB yang sudah maupun belum memiliki dokumentasi." />

    <div className="responsive-toolbar" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
      <div style={{ position: "relative", flex: "1 1 360px", minWidth: 0 }}>
        <Search size={16} color={T.muted} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari ID RAB atau judul kegiatan..." style={{ width: "100%", height: 42, boxSizing: "border-box", padding: "0 14px 0 38px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.inputBg, color: T.text }} />
      </div>
      <div style={{ fontSize: 12, color: T.muted, whiteSpace: "nowrap" }}>{filteredRab.length} RAB</div>
    </div>

    {!rab?.length ? <Card><Empty text="Belum ada RAB. Buat RAB terlebih dahulu untuk mengunggah dokumentasi." /></Card> : <div className="responsive-two-col" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16, alignItems: "start" }}>
      <StatusColumn title="Sudah Upload Dokumentasi" count={uploaded.length} tone="success">
        {uploaded.length ? uploaded.map((r) => <RabCard key={r.idNumber} rabItem={r} docs={docs.filter((d) => d.rabId === r.idNumber)} onUpload={() => setShowUpload(r)} onPreview={setPreview} onDelete={handleDelete} />) : <Empty text="Belum ada RAB yang memiliki dokumentasi." compact />}
      </StatusColumn>
      <StatusColumn title="Belum Upload Dokumentasi" count={pending.length} tone="pending">
        {pending.length ? pending.map((r) => <RabCard key={r.idNumber} rabItem={r} docs={[]} onUpload={() => setShowUpload(r)} onPreview={setPreview} onDelete={handleDelete} />) : <Empty text="Semua RAB yang tampil sudah memiliki dokumentasi." compact />}
      </StatusColumn>
    </div>}

    <UploadDocModal open={!!showUpload} onClose={() => setShowUpload(null)} title={showUpload ? `Upload Dokumentasi - ${showUpload.idNumber}` : ""} subtitle={showUpload?.judulKegiatan} accept="image/*,.pdf,.doc,.docx" onSave={(files, keterangan) => handleSave(showUpload, files, keterangan)} />

    {preview && <Modal open onClose={() => setPreview(null)} title={preview.fileName} icon={Eye} width={600}>{preview.fileType?.startsWith("image/") ? <img src={preview.url} alt={preview.fileName} style={{ width: "100%", maxHeight: "70vh", objectFit: "contain", borderRadius: 8 }} /> : <div style={{ textAlign: "center", padding: "32px 0", color: T.muted }}><p>Preview tidak tersedia untuk tipe file ini.</p><a href={preview.url} download={preview.fileName} style={{ color: T.blue, fontWeight: 700 }}>Download file</a></div>}</Modal>}
  </div>;
}

function StatusColumn({ title, count, tone, children }) {
  const success = tone === "success";
  return <section style={{ minWidth: 0 }}>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 10, padding: "0 2px" }}><div style={{ fontFamily: font.display, fontSize: 14, fontWeight: 800, color: T.heading }}>{title}</div><span style={{ minWidth: 28, height: 24, padding: "0 8px", borderRadius: 999, display: "grid", placeItems: "center", background: success ? T.successSoft : "#FFF4D0", color: success ? T.success : "#8A6D00", fontSize: 11.5, fontWeight: 800 }}>{count}</span></div>
    <div style={{ display: "grid", gap: 10 }}>{children}</div>
  </section>;
}

function RabCard({ rabItem, docs, onUpload, onPreview, onDelete }) {
  return <Card>
    <div className="responsive-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: docs.length ? 12 : 0 }}>
      <div style={{ minWidth: 0 }}><div style={{ fontFamily: font.mono, fontSize: 12, fontWeight: 800, color: T.blue }}>{rabItem.idNumber}</div><div style={{ marginTop: 3, color: T.heading, fontSize: 13.5, fontWeight: 700, lineHeight: 1.45, overflowWrap: "anywhere" }}>{rabItem.judulKegiatan}</div></div>
      <button onClick={onUpload} style={actionBtn}><Upload size={14} /> Upload</button>
    </div>
    {docs.length > 0 && <div style={{ display: "grid", gap: 8 }}>{docs.map((d) => <div key={d.id} style={{ padding: "9px 10px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.bg, display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>{d.fileType?.startsWith("image/") ? <img src={d.url} alt="" style={{ width: 34, height: 34, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} /> : <Camera size={17} color={T.muted} />}<div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12, fontWeight: 700, color: T.heading, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.fileName}</div><div style={{ fontSize: 10.5, color: T.muted }}>{(d.fileSize / 1024).toFixed(1)} KB</div></div><button onClick={() => onPreview(d)} style={iconBtn} title="Lihat"><Eye size={14} /></button><button onClick={() => onDelete(d.id)} style={{ ...iconBtn, color: T.danger }} title="Hapus"><Trash2 size={14} /></button></div>)}</div>}
  </Card>;
}

function Empty({ text, compact }) { return <div style={{ padding: compact ? "18px 12px" : "32px 12px", textAlign: "center", color: T.muted, fontSize: 12.5, lineHeight: 1.55 }}>{text}</div>; }
const actionBtn = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 36, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", color: "var(--blue)", cursor: "pointer", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 };
const iconBtn = { width: 28, height: 28, display: "grid", placeItems: "center", border: 0, background: "transparent", color: T.blue, cursor: "pointer", flexShrink: 0 };
