import { useRef, useState } from "react";
import { Check, Upload } from "lucide-react";
import { T } from "../../lib/theme";
import { fileToDataUrl } from "../../lib/signature";
import { uploadFile } from "../../lib/api";
import Card from "../../components/Card";
import Button from "../../components/Button";
import PageHeader from "../../components/PageHeader";

/**
 * Halaman "Pengaturan Profil" - dipakai Asman & MADM untuk upload gambar
 * tanda tangan mereka SEKALI SAJA. Setelah tersimpan di sini, gambar itu
 * otomatis ditempel setiap kali mereka menandatangani RAB/Proposal (lihat
 * lib/signature.js buildSignatureStamp() dan components/SignaturePanel.jsx).
 */
export default function PengaturanProfilPage({ user, saveMySignature, notify }) {
  const [preview, setPreview] = useState(user?.signatureUrl || "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notify?.("Pilih file gambar (PNG/JPG) untuk tanda tangan.", "error");
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setPreview(dataUrl);
    setSelectedFile(file);
  };

  const save = async () => {
    if (!preview) {
      notify?.("Pilih gambar tanda tangan dulu sebelum disimpan.", "error");
      return;
    }
    try {
      setSaving(true);
      const signatureUrl = selectedFile
        ? (await uploadFile(selectedFile, "signature", {
            documentType: "TTD",
            recordId: user.id,
            title: user.nama || user.username || user.id,
          })).file.url
        : preview;
      setPreview(signatureUrl);
      setSelectedFile(null);
      saveMySignature?.(user.id, signatureUrl, user.nama || user.username);
      notify?.("Tanda tangan berhasil disimpan ke profil kamu.", "success");
    } catch (error) {
      notify?.(`Upload tanda tangan gagal: ${error.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Pengaturan Akun"
        title="Pengaturan Profil"
        description="Unggah gambar tanda tangan kamu sekali di sini. Setiap kali menandatangani RAB atau Proposal, gambar ini otomatis ditempel, tidak perlu digambar ulang."
      />

      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="responsive-two-col">
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.heading, marginBottom: 6 }}>Nama</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 4 }}>{user?.nama || user?.username || "-"}</div>
            <div style={{ fontSize: 12, color: T.muted, textTransform: "uppercase" }}>{user?.role || ""}</div>

            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.heading, marginBottom: 8 }}>
                Tanda tangan tersimpan
              </div>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <Button variant="ghost" icon={Upload} onClick={() => inputRef.current?.click()}>
                {preview ? "Ganti gambar tanda tangan" : "Unggah gambar tanda tangan"}
              </Button>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.heading, marginBottom: 8 }}>Preview</div>
            <div style={{
              width: "100%", maxWidth: 280, height: 120, border: `1.5px solid ${T.border}`,
              borderRadius: 10, background: "#fff", display: "flex", alignItems: "center",
              justifyContent: "center", overflow: "hidden", padding: 10,
            }}>
              {preview ? (
                <img src={preview} alt="Preview tanda tangan" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              ) : (
                <span style={{ fontSize: 12.5, color: T.muted }}>Belum ada tanda tangan</span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
          <Button icon={Check} onClick={save} disabled={saving}>{saving ? "Menyimpan..." : "Simpan Tanda Tangan"}</Button>
        </div>
      </Card>
    </div>
  );
}
