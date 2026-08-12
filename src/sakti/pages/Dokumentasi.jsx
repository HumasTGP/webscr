import { useMemo, useState } from "react";
import { Camera, CheckCircle2, Clock3, Eye, Search, Trash2, Upload } from "lucide-react";
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
    <PageHeader eyebrow="Pelaksanaan" title="Dokumentasi" description="Cari kegiatan berdasarkan ID RAB atau judul, lalu unggah dan kelola dokumentasi pada kegiatan yang sesuai." />

    <Card style={{padding:14,marginBottom:18}}>
      <div style={{ position: "relative", minWidth: 0 }}>
        <Search size={16} color={T.muted} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari ID RAB atau judul kegiatan..." style={{ width: "100%", height: 42, boxSizing: "border-box", padding: "0 14px 0 38px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.inputBg, color: T.text }} />
      </div>
    </Card>

    {!rab?.length ? <Card><Empty text="Belum ada RAB. Buat RAB terlebih dahulu untuk mengunggah dokumentasi." /></Card> : <div className="responsive-two-col" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16, alignItems: "start" }}>
      <StatusColumn title="Dokumentasi Tersedia" subtitle="Kegiatan yang sudah memiliki file dokumentasi." count={uploaded.length} icon={CheckCircle2} tone="success">
        {uploaded.length ? uploaded.map((r) => <RabCard key={r.idNumber} rabItem={r} docs={docs.filter((d) => d.rabId === r.idNumber)} onUpload={() => setShowUpload(r)} onPreview={setPreview} onDelete={handleDelete} />) : <EmptyStateCard text="Belum ada kegiatan yang memiliki dokumentasi." />}
      </StatusColumn>
      <StatusColumn title="Menunggu Dokumentasi" subtitle="Kegiatan yang belum memiliki file dokumentasi." count={pending.length} icon={Clock3} tone="pending">
        {pending.length ? pending.map((r) => <RabCard key={r.idNumber} rabItem={r} docs={[]} onUpload={() => setShowUpload(r)} onPreview={setPreview} onDelete={handleDelete} />) : <EmptyStateCard text="Semua kegiatan yang tampil sudah memiliki dokumentasi." />}
      </StatusColumn>
    </div>}

    <UploadDocModal open={!!showUpload} onClose={() => setShowUpload(null)} title={showUpload ? `Upload Dokumentasi - ${showUpload.idNumber}` : ""} subtitle={showUpload?.judulKegiatan} accept="image/*,.pdf,.doc,.docx" onSave={(files, keterangan) => handleSave(showUpload, files, keterangan)} />

    {preview && <Modal open onClose={() => setPreview(null)} title={preview.fileName} icon={Eye} width={600}>{preview.fileType?.startsWith("image/") ? <img src={preview.url} alt={preview.fileName} style={{ width: "100%", maxHeight: "70vh", objectFit: "contain", borderRadius: 8 }} /> : <div style={{ textAlign: "center", padding: "32px 0", color: T.muted }}><p style={{margin:"0 0 12px"}}>Preview tidak tersedia untuk tipe file ini.</p><a href={preview.url} download={preview.fileName} style={{ color: T.blue, fontWeight: 700 }}>Download file</a></div>}</Modal>}
  </div>;
}

function StatusColumn({ title, subtitle, count, tone, icon: Icon, children }) {
  const success = tone === "success";
  return <section style={{ minWidth: 0 }}>
    <Card style={{padding:"13px 14px",marginBottom:10}}>
      <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}><div style={{width:34,height:34,borderRadius:10,display:"grid",placeItems:"center",background:success?T.successSoft:"#FFF4D0",color:success?T.success:"#8A6D00",flexShrink:0}}><Icon size={16}/></div><div style={{flex:1,minWidth:0}}><div style={{fontFamily:font.display,fontSize:13.5,fontWeight:800,color:T.heading,lineHeight:1.3}}>{title}</div><div style={{fontSize:10.5,color:T.muted,lineHeight:1.4,marginTop:2}}>{subtitle}</div></div><span style={{minWidth:30,height:26,padding:"0 8px",borderRadius:999,display:"grid",placeItems:"center",background:success?T.successSoft:"#FFF4D0",color:success?T.success:"#8A6D00",fontSize:11.5,fontWeight:800,flexShrink:0}}>{count}</span></div>
    </Card>
    <div style={{ display: "grid", gap: 10 }}>{children}</div>
  </section>;
}

function RabCard({ rabItem, docs, onUpload, onPreview, onDelete }) {
  return <Card style={{padding:"15px 16px"}}>
    <div className="responsive-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: docs.length ? 12 : 0 }}>
      <div style={{ minWidth: 0 }}><div style={{ fontFamily: font.mono, fontSize: 11, fontWeight: 800, color: T.blue, letterSpacing:.2 }}>{rabItem.idNumber}</div><div style={{ marginTop: 4, color: T.heading, fontSize: 13.5, fontWeight: 700, lineHeight: 1.45, overflowWrap: "anywhere" }}>{rabItem.judulKegiatan}</div></div>
      <button onClick={onUpload} style={actionBtn}><Upload size={14} /> Upload</button>
    </div>
    {docs.length > 0 && <div style={{ display: "grid", gap: 8, paddingTop:10, borderTop:`1px solid ${T.border}` }}>{docs.map((d) => <div key={d.id} style={{ padding: "9px 10px", borderRadius: 8, background: T.bg, display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>{d.fileType?.startsWith("image/") ? <img src={d.url} alt="" style={{ width: 34, height: 34, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} /> : <Camera size={17} color={T.muted} />}<div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12, fontWeight: 700, color: T.heading, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.fileName}</div><div style={{ fontSize: 10.5, color: T.muted }}>{(d.fileSize / 1024).toFixed(1)} KB</div></div><button onClick={() => onPreview(d)} style={iconBtn} title="Lihat"><Eye size={14} /></button><button onClick={() => onDelete(d.id)} style={{ ...iconBtn, color: T.danger }} title="Hapus"><Trash2 size={14} /></button></div>)}</div>}
  </Card>;
}
function EmptyStateCard({text}){return <Card style={{padding:"28px 18px",textAlign:"center",color:T.muted,fontSize:12.5,lineHeight:1.55,borderStyle:"dashed"}}>{text}</Card>}
function Empty({ text }) { return <div style={{ padding: "32px 12px", textAlign: "center", color: T.muted, fontSize: 12.5, lineHeight: 1.55 }}>{text}</div>; }
const actionBtn = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 36, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", color: "var(--blue)", cursor: "pointer", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 };
const iconBtn = { width: 28, height: 28, display: "grid", placeItems: "center", border: 0, background: "transparent", color: T.blue, cursor: "pointer", flexShrink: 0 };
