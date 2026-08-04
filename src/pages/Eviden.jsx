import { useState } from "react";
import { Paperclip, Upload, Trash2, Eye, FileText } from "lucide-react";
import { T, font } from "../lib/theme";
import { uid } from "../lib/utils";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Modal from "../components/Modal";

export default function EvidenPage({ rab, notify }) {
  const [evidens, setEvidens] = useState([]);
  const [showUpload, setShowUpload] = useState(null);
  const [keterangan, setKeterangan] = useState("");

  const handleUpload = (rabItem, files) => {
    if (!files || files.length === 0) return;
    const newItems = Array.from(files).map((f) => ({
      id: uid("EVD"),
      rabId: rabItem.idNumber,
      judulRab: rabItem.judulKegiatan,
      fileName: f.name,
      fileSize: f.size,
      fileType: f.type,
      keterangan: keterangan.trim(),
      uploadedAt: new Date().toISOString(),
      url: URL.createObjectURL(f),
    }));
    setEvidens((prev) => [...prev, ...newItems]);
    setShowUpload(null);
    setKeterangan("");
    if (notify) notify(`${newItems.length} eviden berhasil diunggah.`, "success", "Upload Eviden");
  };

  const handleDelete = (id) => {
    setEvidens((prev) => prev.filter((e) => e.id !== id));
    if (notify) notify("Eviden dihapus.", "success");
  };

  return (
    <div>
      <PageHeader
        eyebrow="Pelaksanaan"
        title="Eviden Lainnya"
        description="Unggah eviden pendukung kegiatan seperti foto, surat, atau dokumen tambahan."
      />

      {(!rab || rab.length === 0) ? (
        <Card>
          <div style={{ padding: "32px 0", textAlign: "center", color: T.muted, fontSize: 14 }}>
            Belum ada RAB. Buat RAB terlebih dahulu.
          </div>
        </Card>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {rab.map((r) => {
            const items = evidens.filter((e) => e.rabId === r.idNumber);
            return (
              <Card key={r.idNumber}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontFamily: font.mono, fontSize: 12, fontWeight: 700, color: T.blue }}>{r.idNumber}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.heading, marginTop: 2 }}>{r.judulKegiatan}</div>
                  </div>
                  <button onClick={() => setShowUpload(r)} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 14px", borderRadius: 8, border: `1px solid ${T.border}`,
                    background: T.card, color: T.blue, cursor: "pointer", fontSize: 12, fontWeight: 600,
                  }}><Upload size={14} /> Upload Eviden</button>
                </div>

                {items.length === 0 ? (
                  <div style={{ fontSize: 12.5, color: T.muted, padding: "8px 0" }}>Belum ada eviden.</div>
                ) : (
                  <div style={{ display: "grid", gap: 8 }}>
                    {items.map((e) => (
                      <div key={e.id} style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "10px 12px", borderRadius: 8,
                        border: `1px solid ${T.border}`, background: T.bg,
                      }}>
                        <FileText size={16} color={T.muted} style={{ flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 12.5, fontWeight: 600, color: T.heading,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>{e.fileName}</div>
                          <div style={{ fontSize: 10.5, color: T.muted }}>
                            {(e.fileSize / 1024).toFixed(1)} KB
                            {e.keterangan ? ` - ${e.keterangan}` : ""}
                          </div>
                        </div>
                        <button onClick={() => handleDelete(e.id)} title="Hapus" style={{
                          background: "transparent", border: "none", color: T.danger, cursor: "pointer", padding: 4,
                        }}><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {showUpload && (
        <Modal open onClose={() => { setShowUpload(null); setKeterangan(""); }} title={`Upload Eviden - ${showUpload.idNumber}`} icon={Upload} width={420}>
          <div style={{ display: "grid", gap: 14, padding: "10px 0" }}>
            <div style={{ fontSize: 13, color: T.muted }}>
              <b>{showUpload.judulKegiatan}</b>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.heading, marginBottom: 4, display: "block" }}>Keterangan (opsional)</label>
              <input
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Contoh: Foto serah terima"
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 8,
                  border: `1px solid ${T.border}`, background: T.inputBg,
                  fontSize: 13, color: T.text, boxSizing: "border-box",
                }}
              />
            </div>
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              onChange={(e) => handleUpload(showUpload, e.target.files)}
              style={{ fontSize: 13 }}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
