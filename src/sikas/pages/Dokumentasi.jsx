import { useState } from "react";
import { Camera, Upload, Trash2, Eye } from "lucide-react";
import { T, font } from "../../lib/theme";
import { uid } from "../../lib/utils";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Modal from "../../components/Modal";

export default function DokumentasiPage({ rab, notify }) {
  const [docs, setDocs] = useState([]);
  const [showUpload, setShowUpload] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleUpload = (rabItem, files) => {
    if (!files || files.length === 0) return;
    const newDocs = Array.from(files).map((f) => ({
      id: uid("DOK"),
      rabId: rabItem.idNumber,
      judulRab: rabItem.judulKegiatan,
      fileName: f.name,
      fileSize: f.size,
      fileType: f.type,
      uploadedAt: new Date().toISOString(),
      url: URL.createObjectURL(f),
    }));
    setDocs((prev) => [...prev, ...newDocs]);
    setShowUpload(null);
    if (notify) notify(`${newDocs.length} file dokumentasi berhasil diunggah.`, "success", "Upload Dokumentasi");
  };

  const handleDelete = (docId) => {
    setDocs((prev) => prev.filter((d) => d.id !== docId));
    if (notify) notify("Dokumentasi dihapus.", "success");
  };

  return (
    <div>
      <PageHeader
        eyebrow="Pelaksanaan"
        title="Dokumentasi"
        description="Unggah dan kelola dokumentasi kegiatan berdasarkan RAB terkait."
      />

      {(!rab || rab.length === 0) ? (
        <Card>
          <div style={{ padding: "32px 0", textAlign: "center", color: T.muted, fontSize: 14 }}>
            Belum ada RAB. Buat RAB terlebih dahulu untuk mengunggah dokumentasi.
          </div>
        </Card>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {rab.map((r) => {
            const rabDocs = docs.filter((d) => d.rabId === r.idNumber);
            return (
              <Card key={r.idNumber}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontFamily: font.mono, fontSize: 12, fontWeight: 700, color: T.blue }}>{r.idNumber}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.heading, marginTop: 2 }}>{r.judulKegiatan}</div>
                  </div>
                  <button
                    onClick={() => setShowUpload(r)}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "8px 14px", borderRadius: 8, border: `1px solid ${T.border}`,
                      background: T.card, color: T.blue, cursor: "pointer", fontSize: 12, fontWeight: 600,
                    }}
                  >
                    <Upload size={14} /> Upload
                  </button>
                </div>

                {rabDocs.length === 0 ? (
                  <div style={{ fontSize: 12.5, color: T.muted, padding: "8px 0" }}>
                    Belum ada dokumentasi untuk RAB ini.
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
                    {rabDocs.map((d) => (
                      <div key={d.id} style={{
                        padding: "10px 12px", borderRadius: 8,
                        border: `1px solid ${T.border}`, background: T.bg,
                        display: "flex", alignItems: "center", gap: 10,
                      }}>
                        <Camera size={16} color={T.muted} style={{ flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 12.5, fontWeight: 600, color: T.heading,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>{d.fileName}</div>
                          <div style={{ fontSize: 10.5, color: T.muted }}>
                            {(d.fileSize / 1024).toFixed(1)} KB
                          </div>
                        </div>
                        <button onClick={() => setPreview(d)} title="Lihat" style={{
                          background: "transparent", border: "none", color: T.blue, cursor: "pointer", padding: 4,
                        }}><Eye size={14} /></button>
                        <button onClick={() => handleDelete(d.id)} title="Hapus" style={{
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
        <Modal open onClose={() => setShowUpload(null)} title={`Upload Dokumentasi - ${showUpload.idNumber}`} icon={Upload} width={420}>
          <div style={{ padding: "10px 0" }}>
            <div style={{ fontSize: 13, color: T.muted, marginBottom: 14 }}>
              <b>{showUpload.judulKegiatan}</b>
            </div>
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={(e) => handleUpload(showUpload, e.target.files)}
              style={{ fontSize: 13 }}
            />
          </div>
        </Modal>
      )}

      {preview && (
        <Modal open onClose={() => setPreview(null)} title={preview.fileName} icon={Eye} width={600}>
          {preview.fileType && preview.fileType.startsWith("image/") ? (
            <img src={preview.url} alt={preview.fileName} style={{ width: "100%", borderRadius: 8 }} />
          ) : (
            <div style={{ textAlign: "center", padding: "32px 0", color: T.muted }}>
              <p>Preview tidak tersedia untuk tipe file ini.</p>
              <a href={preview.url} download={preview.fileName} style={{ color: T.blue, fontWeight: 600 }}>
                Download file
              </a>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
