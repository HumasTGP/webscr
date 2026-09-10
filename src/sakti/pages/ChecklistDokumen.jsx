import { useRef, useState } from "react";
import { CheckSquare, Upload } from "lucide-react";
import { T, font } from "../../lib/theme";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import { fileToDataUrl } from "../../lib/signature";

/**
 * "Tracking Dokumen Selesai" (dulu bernama Checklist Dokumen).
 *
 * Tahap SETELAH dokumen di menu Non PO/Cash Card/PO lengkap - laporan Humas
 * soal proses pencairan dana kas. Isinya murni PENANDA MANUAL, bukan alur
 * approval sistem: checkbox "Sudah di Akutansi" lalu "Sudah di Keuangan"
 * (diklik sendiri oleh Humas), plus tempat upload scan dokumen fisik yang
 * sudah ditandatangani basah. TIDAK ADA akun/role baru Akutansi/Keuangan -
 * proses itu terjadi di luar sistem, ini cuma status penanda.
 *
 * Hanya HUMAS dan ASMAN yang bisa melihat halaman ini, tidak MADM.
 */
export default function ChecklistDokumenPage({ rab = [], notify, paymentPackages = [], setPaymentPackages, user }) {
  const [search, setSearch] = useState("");
  const fileInputRefs = useRef({});

  if (user && user.role !== "humas" && user.role !== "asman") {
    return (
      <div>
        <PageHeader
          eyebrow="Pembayaran"
          title="Tracking Dokumen Selesai"
          description="Halaman ini hanya bisa diakses oleh Humas dan Asman."
        />
        <Card>
          <div style={{ padding: "24px 12px", textAlign: "center", color: T.muted, fontSize: 13 }}>
            Kamu tidak memiliki akses ke halaman ini.
          </div>
        </Card>
      </div>
    );
  }

  const packageFor = (idRab) => paymentPackages.find((p) => p.idRab === idRab) || {};

  // Humas bisa centang & upload, Asman read-only (cuma lihat) - sesuai
  // ketentuan role untuk halaman ini.
  const canEdit = !user || user.role === "humas";

  const toggleFlag = (idRab, key) => {
    const existing = packageFor(idRab);
    const current = { idRab, ...existing };
    const next = { ...current, [key]: !current[key] };
    setPaymentPackages?.((prev) => {
      const found = prev.find((p) => p.idRab === idRab);
      if (found) return prev.map((p) => (p.idRab === idRab ? { ...p, [key]: next[key] } : p));
      return [...prev, next];
    });
  };

  const handleUploadScan = async (idRab, file) => {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setPaymentPackages?.((prev) => {
      const found = prev.find((p) => p.idRab === idRab);
      const entry = { scanFileName: file.name, scanUrl: dataUrl };
      if (found) return prev.map((p) => (p.idRab === idRab ? { ...p, ...entry } : p));
      return [...prev, { idRab, ...entry }];
    });
    notify?.(`Scan dokumen untuk ${idRab} berhasil diunggah.`, "success");
  };

  const filteredRab = search.trim()
    ? rab.filter(
        (r) =>
          (r.idNumber || "").toLowerCase().includes(search.trim().toLowerCase()) ||
          (r.judulKegiatan || "").toLowerCase().includes(search.trim().toLowerCase())
      )
    : rab;

  return (
    <div>
      <PageHeader
        eyebrow="Pembayaran"
        title="Tracking Dokumen Selesai"
        description="Tandai progres pencairan dana kas untuk tiap RAB, lalu unggah scan dokumen fisik yang sudah ditandatangani basah."
      />

      <Card>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari ID RAB atau judul kegiatan..."
          style={{
            width: "100%", maxWidth: 320, padding: "9px 12px", borderRadius: 8,
            border: `1px solid ${T.border}`, background: T.inputBg, color: T.text,
            fontSize: 13, fontFamily: "inherit", marginBottom: 16,
          }}
        />

        {filteredRab.length === 0 ? (
          <div style={{ padding: "24px 12px", textAlign: "center", color: T.muted, fontSize: 13 }}>
            Tidak ada RAB yang cocok.
          </div>
        ) : (
          filteredRab.map((r) => {
            const pkg = packageFor(r.idNumber);
            return (
              <div key={r.idNumber} style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px 16px", marginBottom: 12 }}>
                <div style={{ fontFamily: font.mono, fontWeight: 700, color: T.blue, fontSize: 12 }}>{r.idNumber}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.heading, marginTop: 2, marginBottom: 12 }}>{r.judulKegiatan}</div>

                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, padding: "7px 0", borderTop: `1px solid ${T.border}`, cursor: canEdit ? "pointer" : "default" }}>
                  <input type="checkbox" checked={!!pkg.diAkutansi} disabled={!canEdit} onChange={() => canEdit && toggleFlag(r.idNumber, "diAkutansi")} style={{ width: 16, height: 16 }} />
                  Sudah di Akutansi
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, padding: "7px 0", borderTop: `1px solid ${T.border}`, cursor: canEdit ? "pointer" : "default" }}>
                  <input type="checkbox" checked={!!pkg.diKeuangan} disabled={!canEdit} onChange={() => canEdit && toggleFlag(r.idNumber, "diKeuangan")} style={{ width: 16, height: 16 }} />
                  Sudah di Keuangan
                </label>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", paddingTop: 10, marginTop: 4, borderTop: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: 12.5, color: T.muted, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: "1 1 140px" }}>
                    {pkg.scanFileName ? `Scan: ${pkg.scanFileName}` : "Scan dokumen fisik (TTD basah)"}
                  </span>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    {pkg.scanUrl && (
                      <a
                        href={pkg.scanUrl}
                        download={pkg.scanFileName}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12,
                          fontWeight: 600, padding: "6px 12px", borderRadius: 6,
                          border: `1px solid ${T.border}`, background: "#fff", color: T.blue, textDecoration: "none",
                        }}
                      >
                        Lihat
                      </a>
                    )}
                    {canEdit && (
                      <>
                        <input
                          ref={(el) => (fileInputRefs.current[r.idNumber] = el)}
                          type="file"
                          accept="image/*,.pdf"
                          style={{ display: "none" }}
                          onChange={(e) => handleUploadScan(r.idNumber, e.target.files?.[0])}
                        />
                        <button
                          onClick={() => fileInputRefs.current[r.idNumber]?.click()}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12,
                            fontWeight: 600, padding: "6px 12px", borderRadius: 6,
                            border: `1px solid ${T.border}`, background: "#fff", color: T.text, cursor: "pointer",
                          }}
                        >
                          <Upload size={13} /> {pkg.scanFileName ? "Ganti" : "Upload"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </Card>
    </div>
  );
}
