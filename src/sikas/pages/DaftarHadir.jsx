import { useState } from "react";
import { Eye, Plus, Printer, Trash2, Upload, Users } from "lucide-react";
import { T, font } from "../../lib/theme";
import { uid } from "../../lib/utils";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import UploadDocModal from "../../components/UploadDocModal";

export default function DaftarHadirPage({ rab, notify }) {
  const [lists, setLists] = useState([]);
  const [showForm, setShowForm] = useState(null);
  const [formName, setFormName] = useState("");
  const [formInstansi, setFormInstansi] = useState("");
  const [docs, setDocs] = useState([]);
  const [showUpload, setShowUpload] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleSaveDocs = (rabItem, files) => {
    const newDocs = files.map((f) => ({
      id: uid("DH-DOC"),
      rabId: rabItem.idNumber,
      fileName: f.name,
      fileSize: f.size,
      fileType: f.type,
      url: URL.createObjectURL(f),
    }));
    setDocs((prev) => [...prev, ...newDocs]);
    if (notify) notify(`${newDocs.length} file daftar hadir berhasil disimpan.`, "success", "Upload Daftar Hadir");
  };
  const handleDeleteDoc = (id) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
    if (notify) notify("File daftar hadir dihapus.", "success");
  };

  const addEntry = (rabId) => {
    if (!formName.trim()) return;
    setLists((prev) => [...prev, {
      id: uid("DH"),
      rabId,
      nama: formName.trim(),
      instansi: formInstansi.trim(),
      waktu: new Date().toISOString(),
    }]);
    setFormName("");
    setFormInstansi("");
    if (notify) notify("Peserta ditambahkan.", "success");
  };

  const removeEntry = (entryId) => {
    setLists((prev) => prev.filter((e) => e.id !== entryId));
  };

  const printList = (rabItem) => {
    const entries = lists.filter((e) => e.rabId === rabItem.idNumber);
    const win = window.open("", "_blank", "width=850,height=960");
    if (!win) return;
    const rows = entries.map((e, i) => `
      <tr>
        <td style="border:1px solid #333;padding:6px 10px;text-align:center;">${i + 1}</td>
        <td style="border:1px solid #333;padding:6px 10px;">${e.nama}</td>
        <td style="border:1px solid #333;padding:6px 10px;">${e.instansi || "-"}</td>
        <td style="border:1px solid #333;padding:6px 10px;text-align:center;">${new Date(e.waktu).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</td>
        <td style="border:1px solid #333;padding:6px 10px;"></td>
      </tr>
    `).join("");
    win.document.write(`<!doctype html><html><head><meta charset="utf-8" /><title>Daftar Hadir - ${rabItem.idNumber}</title>
      <style>body{font-family:Arial,sans-serif;padding:32px;color:#111;}h1{font-size:16px;margin:0 0 4px;text-align:center;}
      .sub{text-align:center;color:#555;font-size:12px;margin-bottom:22px;}
      table{width:100%;border-collapse:collapse;font-size:12.5px;}th{border:1px solid #333;padding:6px 8px;background:#EFEFEF;}</style>
    </head><body>
      <h1>DAFTAR HADIR</h1>
      <div class="sub">${rabItem.judulKegiatan}<br/>${rabItem.idNumber}</div>
      <table><thead><tr><th>No</th><th>Nama</th><th>Instansi</th><th>Waktu</th><th>Tanda Tangan</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="5" style="border:1px solid #333;padding:12px;text-align:center;color:#999;">Belum ada peserta</td></tr>'}</tbody></table>
      <script>window.onload=function(){window.print();};</script>
    </body></html>`);
    win.document.close();
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    border: `1px solid ${T.border}`, background: T.inputBg,
    fontSize: 13, color: T.text, boxSizing: "border-box",
  };

  return (
    <div>
      <PageHeader
        eyebrow="Pelaksanaan"
        title="Daftar Hadir"
        description="Kelola daftar hadir peserta kegiatan berdasarkan RAB."
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
            const entries = lists.filter((e) => e.rabId === r.idNumber);
            return (
              <Card key={r.idNumber}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontFamily: font.mono, fontSize: 12, fontWeight: 700, color: T.blue }}>{r.idNumber}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.heading, marginTop: 2 }}>{r.judulKegiatan}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button onClick={() => setShowForm(showForm === r.idNumber ? null : r.idNumber)} style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "8px 14px", borderRadius: 8, border: `1px solid ${T.border}`,
                      background: T.card, color: T.blue, cursor: "pointer", fontSize: 12, fontWeight: 600,
                    }}><Plus size={14} /> Tambah</button>
                    <button onClick={() => setShowUpload(r)} style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "8px 14px", borderRadius: 8, border: `1px solid ${T.border}`,
                      background: T.card, color: T.blue, cursor: "pointer", fontSize: 12, fontWeight: 600,
                    }}><Upload size={14} /> Upload</button>
                    <button onClick={() => printList(r)} style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "8px 14px", borderRadius: 8, border: `1px solid ${T.border}`,
                      background: T.card, color: T.heading, cursor: "pointer", fontSize: 12, fontWeight: 600,
                    }}><Printer size={14} /> Cetak</button>
                  </div>
                </div>

                {showForm === r.idNumber && (
                  <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                    <input style={{ ...inputStyle, flex: "1 1 180px" }} placeholder="Nama peserta" value={formName} onChange={(e) => setFormName(e.target.value)} />
                    <input style={{ ...inputStyle, flex: "1 1 150px" }} placeholder="Instansi (opsional)" value={formInstansi} onChange={(e) => setFormInstansi(e.target.value)} />
                    <button onClick={() => addEntry(r.idNumber)} style={{
                      padding: "10px 16px", borderRadius: 8, border: "none",
                      background: T.blue, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600,
                    }}>Tambah</button>
                  </div>
                )}

                {entries.length === 0 ? (
                  <div style={{ fontSize: 12.5, color: T.muted, padding: "8px 0" }}>Belum ada peserta.</div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                      <thead>
                        <tr style={{ background: T.bg }}>
                          <th style={{ padding: "8px 12px", textAlign: "left", borderBottom: `1px solid ${T.border}`, width: 40 }}>No</th>
                          <th style={{ padding: "8px 12px", textAlign: "left", borderBottom: `1px solid ${T.border}` }}>Nama</th>
                          <th style={{ padding: "8px 12px", textAlign: "left", borderBottom: `1px solid ${T.border}` }}>Instansi</th>
                          <th style={{ padding: "8px 12px", textAlign: "left", borderBottom: `1px solid ${T.border}`, width: 80 }}>Waktu</th>
                          <th style={{ padding: "8px 12px", borderBottom: `1px solid ${T.border}`, width: 50 }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {entries.map((e, i) => (
                          <tr key={e.id}>
                            <td style={{ padding: "8px 12px", borderBottom: `1px solid ${T.border}` }}>{i + 1}</td>
                            <td style={{ padding: "8px 12px", borderBottom: `1px solid ${T.border}`, fontWeight: 600 }}>{e.nama}</td>
                            <td style={{ padding: "8px 12px", borderBottom: `1px solid ${T.border}` }}>{e.instansi || "-"}</td>
                            <td style={{ padding: "8px 12px", borderBottom: `1px solid ${T.border}` }}>
                              {new Date(e.waktu).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                            </td>
                            <td style={{ padding: "8px 12px", borderBottom: `1px solid ${T.border}`, textAlign: "center" }}>
                              <button onClick={() => removeEntry(e.id)} title="Hapus" style={{
                                background: "transparent", border: "none", color: T.danger, cursor: "pointer", padding: 2,
                              }}><Trash2 size={14} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div style={{ fontSize: 11, color: T.muted, marginTop: 8 }}>
                  Total peserta: {entries.length}
                </div>

                {docs.filter((d) => d.rabId === r.idNumber).length > 0 && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px dashed ${T.border}` }}>
                    <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>
                      File Daftar Hadir Terupload
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
                      {docs.filter((d) => d.rabId === r.idNumber).map((d) => (
                        <div key={d.id} style={{
                          padding: "10px 12px", borderRadius: 8,
                          border: `1px solid ${T.border}`, background: T.bg,
                          display: "flex", alignItems: "center", gap: 10,
                        }}>
                          {d.fileType?.startsWith("image/") ? (
                            <img src={d.url} alt={d.fileName} style={{ width: 34, height: 34, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
                          ) : (
                            <Users size={16} color={T.muted} style={{ flexShrink: 0 }} />
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: 12.5, fontWeight: 600, color: T.heading,
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}>{d.fileName}</div>
                            <div style={{ fontSize: 10.5, color: T.muted }}>{(d.fileSize / 1024).toFixed(1)} KB</div>
                          </div>
                          <button onClick={() => setPreview(d)} title="Lihat" style={{
                            background: "transparent", border: "none", color: T.blue, cursor: "pointer", padding: 4,
                          }}><Eye size={14} /></button>
                          <button onClick={() => handleDeleteDoc(d.id)} title="Hapus" style={{
                            background: "transparent", border: "none", color: T.danger, cursor: "pointer", padding: 4,
                          }}><Trash2 size={14} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <UploadDocModal
        open={!!showUpload}
        onClose={() => setShowUpload(null)}
        title={showUpload ? `Upload Daftar Hadir - ${showUpload.idNumber}` : ""}
        subtitle={showUpload?.judulKegiatan}
        accept="image/*,.pdf,.doc,.docx"
        onSave={(files) => handleSaveDocs(showUpload, files)}
      />

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
