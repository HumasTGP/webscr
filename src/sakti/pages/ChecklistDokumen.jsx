import { useRef, useState } from "react";
import { CheckCircle2, Upload } from "lucide-react";
import { T, font } from "../../lib/theme";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import { fileToDataUrl } from "../../lib/signature";

/**
 * Tracking Dokumen Selesai = pencatatan proses di luar sistem.
 * Urutan wajib:
 * 1) TTD Officer Comdev
 * 2) TTD Asman
 * 3) Akutansi
 * 4) Keuangan
 * 5) Upload scan fisik
 * 6) Selesai
 */
function getTrackingDokumenStatus(pkg) {
  if (!pkg?.ttdOfficerComdev) {
    return { label: "Menunggu TTD Officer Comdev", color: "#8A6D00", bg: "#FFF4D6" };
  }
  if (!pkg?.ttdAsman) {
    return { label: "Menunggu TTD Asman", color: "#8A6D00", bg: "#FFF4D6" };
  }
  if (!pkg?.diAkutansi) {
    return { label: "Menunggu Akutansi", color: "#8A6D00", bg: "#FFF4D6" };
  }
  if (!pkg?.diKeuangan) {
    return { label: "Menunggu Keuangan", color: "#8A6D00", bg: "#FFF4D6" };
  }
  if (!pkg?.scanUrl) {
    return { label: "Menunggu Scan Dokumen", color: "#8A6D00", bg: "#FFF4D6" };
  }
  return { label: "Selesai", color: "#1E7F3E", bg: "#DEF6E5" };
}

function StatusBadge({ pkg }) {
  const status = getTrackingDokumenStatus(pkg);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
      color: status.color, background: status.bg,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: status.color }} />
      {status.label}
    </span>
  );
}

function MiniProgress({ pkg }) {
  const steps = [
    ["Officer Comdev", !!pkg.ttdOfficerComdev],
    ["Asman", !!pkg.ttdAsman],
    ["Akutansi", !!pkg.diAkutansi],
    ["Keuangan", !!pkg.diKeuangan],
    ["Scan", !!pkg.scanUrl],
  ];
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 4, overflowX: "auto", padding: "2px 0 12px" }}>
      {steps.map(([label, done], i) => (
        <div key={label} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none", minWidth: i < steps.length - 1 ? 112 : 72 }}>
          <div style={{ minWidth: 72, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%",
              display: "grid", placeItems: "center",
              background: done ? "#1E7F3E" : T.border,
              color: done ? "#fff" : T.muted,
              fontSize: 10, fontWeight: 700,
            }}>
              {done ? <CheckCircle2 size={13} /> : i + 1}
            </div>
            <span style={{ fontSize: 9.5, lineHeight: 1.2, textAlign: "center", color: done ? "#166E49" : T.muted, fontWeight: done ? 700 : 500 }}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: 2, margin: "11px 1px 0", background: done ? "#1E7F3E" : T.border }} />
          )}
        </div>
      ))}
    </div>
  );
}

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
  const canEdit = !user || user.role === "humas";

  const toggleFlag = (idRab, key) => {
    setPaymentPackages?.((prev) => {
      const existing = prev.find((p) => p.idRab === idRab) || { idRab };
      const nextValue = !existing[key];
      const now = new Date().toISOString();
      const timeKey = {
        ttdOfficerComdev: "ttdOfficerComdevAt",
        ttdAsman: "ttdAsmanAt",
        diAkutansi: "diAkutansiAt",
        diKeuangan: "diKeuanganAt",
      }[key];

      const next = { ...existing, [key]: nextValue, ...(timeKey ? { [timeKey]: nextValue ? now : null } : {}) };

      // Kalau tahap awal dibatalkan, tahap sesudahnya ikut kembali belum selesai
      // agar urutan tracking tetap konsisten. Scan file tidak dihapus otomatis.
      if (!nextValue) {
        const downstream = {
          ttdOfficerComdev: ["ttdAsman", "diAkutansi", "diKeuangan"],
          ttdAsman: ["diAkutansi", "diKeuangan"],
          diAkutansi: ["diKeuangan"],
          diKeuangan: [],
        }[key] || [];
        downstream.forEach((field) => {
          next[field] = false;
          const downstreamTimeKey = {
            ttdAsman: "ttdAsmanAt",
            diAkutansi: "diAkutansiAt",
            diKeuangan: "diKeuanganAt",
          }[field];
          if (downstreamTimeKey) next[downstreamTimeKey] = null;
        });
      }

      const found = prev.some((p) => p.idRab === idRab);
      return found ? prev.map((p) => (p.idRab === idRab ? next : p)) : [...prev, next];
    });
  };

  const handleUploadScan = async (idRab, file) => {
    if (!file) return;
    const pkg = packageFor(idRab);
    if (!pkg.ttdOfficerComdev || !pkg.ttdAsman || !pkg.diAkutansi || !pkg.diKeuangan) {
      notify?.("Selesaikan TTD Officer Comdev, TTD Asman, Akutansi, dan Keuangan terlebih dahulu sebelum upload scan.", "error");
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setPaymentPackages?.((prev) => {
      const found = prev.find((p) => p.idRab === idRab);
      const entry = {
        scanFileName: file.name,
        scanUrl: dataUrl,
        scanUploadedAt: new Date().toISOString(),
      };
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
        description="Catat proses dokumen luar sistem secara berurutan: TTD Officer Comdev → TTD Asman → Akutansi → Keuangan → upload scan fisik."
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
            const canTtdAsman = !!pkg.ttdOfficerComdev;
            const canAkutansi = !!pkg.ttdOfficerComdev && !!pkg.ttdAsman;
            const canKeuangan = canAkutansi && !!pkg.diAkutansi;
            const canUpload = canKeuangan && !!pkg.diKeuangan;

            const checklist = [
              { key: "ttdOfficerComdev", label: "Sudah TTD Officer Comdev", enabled: true },
              { key: "ttdAsman", label: "Sudah TTD Asman", enabled: canTtdAsman },
              { key: "diAkutansi", label: "Sudah di Akutansi", enabled: canAkutansi },
              { key: "diKeuangan", label: "Sudah di Keuangan", enabled: canKeuangan },
            ];

            return (
              <div key={r.idNumber} style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px 16px", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontFamily: font.mono, fontWeight: 700, color: T.blue, fontSize: 12 }}>{r.idNumber}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.heading, marginTop: 2 }}>{r.judulKegiatan}</div>
                  </div>
                  <StatusBadge pkg={pkg} />
                </div>

                <div style={{ marginTop: 14 }}>
                  <MiniProgress pkg={pkg} />
                </div>

                {checklist.map((item) => (
                  <label key={item.key} style={{
                    display: "flex", alignItems: "center", gap: 8, fontSize: 13,
                    padding: "8px 0", borderTop: `1px solid ${T.border}`,
                    cursor: canEdit && item.enabled ? "pointer" : "default",
                    opacity: item.enabled || pkg[item.key] ? 1 : 0.55,
                  }}>
                    <input
                      type="checkbox"
                      checked={!!pkg[item.key]}
                      disabled={!canEdit || !item.enabled}
                      onChange={() => canEdit && item.enabled && toggleFlag(r.idNumber, item.key)}
                      style={{ width: 16, height: 16 }}
                    />
                    {item.label}
                  </label>
                ))}

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", paddingTop: 10, marginTop: 4, borderTop: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: 12.5, color: T.muted, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: "1 1 140px" }}>
                    {pkg.scanFileName ? `Scan: ${pkg.scanFileName}` : "Scan dokumen fisik setelah Keuangan selesai"}
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
                          disabled={!canUpload}
                          onClick={() => canUpload && fileInputRefs.current[r.idNumber]?.click()}
                          title={!canUpload ? "Selesaikan TTD Officer Comdev, TTD Asman, Akutansi, lalu Keuangan terlebih dahulu" : ""}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12,
                            fontWeight: 600, padding: "6px 12px", borderRadius: 6,
                            border: `1px solid ${T.border}`, background: "#fff", color: canUpload ? T.text : T.muted,
                            cursor: canUpload ? "pointer" : "not-allowed", opacity: canUpload ? 1 : 0.55,
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
