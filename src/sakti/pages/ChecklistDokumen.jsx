import { useState } from "react";
import { CheckSquare, Plus, Printer, Send, Trash2 } from "lucide-react";
import { T, font } from "../../lib/theme";
import { DOC_STATUS } from "../../lib/data";
import { printChecklist } from "../../lib/utils";
import { uid } from "../../lib/utils";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";

const STANDAR_CHECKLIST_DOCS = [
  "Surat Permohonan Pembayaran (SPP)",
  "Kwitansi",
  "Invoice",
  "Faktur Pajak (FP)/Surat Keterangan Non PKP (bila tidak dapat menerbitkan FP)",
  "Surat Pengukuhan Pengusaha Kena Pajak (bila ada FP)",
  "NPWP (bila ada)/KTP (bila tidak ada NPWP)",
  "Berita Acara Pemeriksaan Pekerjaan (BAPP)",
  "Berita Acara Serah Terima Pekerjaan (BASTP)",
  "Kontrak (PJ/SPK)",
  "Laporan",
  "Bank Garansi",
  "Daftar Hadir",
  "Form Verifikasi",
  "Lampiran 1 (Rincian Pekerjaan)",
  "Lampiran 2",
];

export default function ChecklistDokumenPage({ rab, notify, paymentPackages = [], setPaymentPackages }) {
  const [checked, setChecked] = useState({});
  const [lainnya, setLainnya] = useState({}); // { [rabId]: [{ id, nama, ada }] }

  const packageFor = (idRab) => paymentPackages.find((p) => p.idRab === idRab);

  const kirimKeAsman = (r) => {
    const existing = packageFor(r.idNumber);
    const now = new Date().toISOString();
    const checklistSnapshot = {
      standar: STANDAR_CHECKLIST_DOCS.map((item) => ({ nama: item, ada: !!checked[`${r.idNumber}::${item}`] })),
      lainnya: (lainnya[r.idNumber] || []).filter((it) => it.nama.trim()),
    };
    if (existing) {
      setPaymentPackages((prev) => prev.map((p) => p.idRab === r.idNumber ? {
        ...p, status: DOC_STATUS.SUBMITTED, submittedAt: now, checklist: checklistSnapshot,
        reviewedBy: "", reviewedAt: "", reviewNote: "",
        processedBy: "", processedAt: "", processNote: "", rejectedBy: "",
      } : p));
    } else {
      setPaymentPackages((prev) => [...prev, {
        id: uid("PAY"), idRab: r.idNumber, judulKegiatan: r.judulKegiatan,
        kategori: r.kategori || "-", status: DOC_STATUS.SUBMITTED, submittedAt: now,
        checklist: checklistSnapshot,
      }]);
    }
    notify?.(`Paket pembayaran ${r.idNumber} dikirim ke Asman.`, "success", "Kirim ke Asman");
  };

  const toggleStandar = (rabId, item) => {
    setChecked((prev) => {
      const key = `${rabId}::${item}`;
      return { ...prev, [key]: !prev[key] };
    });
  };

  const addLainnya = (rabId) => {
    setLainnya((prev) => ({
      ...prev,
      [rabId]: [...(prev[rabId] || []), { id: uid("CKL"), nama: "", ada: false }],
    }));
  };
  const updateLainnya = (rabId, id, patch) => {
    setLainnya((prev) => ({
      ...prev,
      [rabId]: (prev[rabId] || []).map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }));
  };
  const removeLainnya = (rabId, id) => {
    setLainnya((prev) => ({
      ...prev,
      [rabId]: (prev[rabId] || []).filter((it) => it.id !== id),
    }));
  };

  const getProgress = (rabId) => {
    const extra = lainnya[rabId] || [];
    const total = STANDAR_CHECKLIST_DOCS.length + extra.length;
    const doneStandar = STANDAR_CHECKLIST_DOCS.filter((item) => checked[`${rabId}::${item}`]).length;
    const doneExtra = extra.filter((it) => it.ada).length;
    const done = doneStandar + doneExtra;
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  };

  const handlePrint = (r) => {
    const extra = lainnya[r.idNumber] || [];
    const items = [
      ...STANDAR_CHECKLIST_DOCS.map((nama) => ({ nama, ada: !!checked[`${r.idNumber}::${nama}`] })),
      ...extra.filter((it) => it.nama.trim()).map((it) => ({ nama: it.nama, ada: it.ada })),
    ];
    printChecklist({
      title: "Checklist Kelengkapan Dokumen",
      subtitle: `${r.idNumber} - ${r.judulKegiatan}`,
      items,
    });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Pembayaran"
        title="Checklist Dokumen"
        description="Centang dokumen standar yang sudah tersedia sebelum proses pembayaran. Dokumen di luar daftar bisa ditambahkan lewat bagian Lainnya."
      />

      {(!rab || rab.length === 0) ? (
        <Card>
          <div style={{ padding: "32px 0", textAlign: "center", color: T.muted, fontSize: 14 }}>
            Belum ada RAB.
          </div>
        </Card>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {rab.map((r) => {
            const progress = getProgress(r.idNumber);
            const extra = lainnya[r.idNumber] || [];
            return (
              <Card key={r.idNumber}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div style={{ fontFamily: font.mono, fontSize: 12, fontWeight: 700, color: T.blue }}>{r.idNumber}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.heading, marginTop: 2 }}>{r.judulKegiatan}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button onClick={() => handlePrint(r)} style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "8px 14px", borderRadius: 8, border: `1px solid ${T.border}`,
                      background: T.card, color: T.heading, cursor: "pointer", fontSize: 12, fontWeight: 600,
                    }}><Printer size={14} /> Cetak</button>
                    {(() => {
                      const pkg = packageFor(r.idNumber);
                      const already = pkg && pkg.status !== DOC_STATUS.REJECTED;
                      const noneChecked = progress.done === 0;
                      return (
                        <button
                          onClick={() => kirimKeAsman(r)}
                          disabled={noneChecked || already}
                          title={noneChecked ? "Centang minimal 1 dokumen dulu" : already ? "Sudah dikirim, menunggu diproses" : "Kirim dokumen yang sudah ada ke Asman"}
                          style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "8px 14px", borderRadius: 8, border: "none",
                            background: (noneChecked || already) ? T.border : T.blue,
                            color: (noneChecked || already) ? T.muted : "#fff",
                            cursor: (noneChecked || already) ? "not-allowed" : "pointer",
                            fontSize: 12, fontWeight: 600,
                          }}
                        ><Send size={14} /> {already ? "Terkirim" : "Kirim ke Asman"}</button>
                      );
                    })()}
                  </div>
                </div>

                <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>
                  Dokumen Standar
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 8, marginBottom: 16 }}>
                  {STANDAR_CHECKLIST_DOCS.map((item, i) => {
                    const key = `${r.idNumber}::${item}`;
                    const isChecked = !!checked[key];
                    return (
                      <button
                        key={item}
                        onClick={() => toggleStandar(r.idNumber, item)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "10px 12px", borderRadius: 8,
                          border: `1px solid ${isChecked ? "#1E7F3E" : T.border}`,
                          background: isChecked ? "#DEF6E5" : T.bg,
                          cursor: "pointer", textAlign: "left", fontSize: 12.5,
                          color: isChecked ? "#1E7F3E" : T.text,
                          fontWeight: isChecked ? 600 : 500,
                        }}
                      >
                        <CheckSquare size={16} color={isChecked ? "#1E7F3E" : T.muted} style={{ flexShrink: 0 }} />
                        <span>{i + 1}. {item}</span>
                      </button>
                    );
                  })}
                </div>

                <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>
                  Lainnya (diisi manual)
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
                  {extra.length === 0 && (
                    <div style={{ padding: "12px 14px", border: `1px dashed ${T.border}`, borderRadius: 8, color: T.muted, fontSize: 12 }}>
                      Belum ada dokumen tambahan.
                    </div>
                  )}
                  {extra.map((it) => (
                    <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => updateLainnya(r.idNumber, it.id, { ada: !it.ada })}
                        style={{
                          flexShrink: 0, width: 24, height: 24, borderRadius: 6,
                          border: `1px solid ${it.ada ? "#1E7F3E" : T.border}`,
                          background: it.ada ? "#DEF6E5" : T.card,
                          display: "grid", placeItems: "center", cursor: "pointer",
                        }}
                      >
                        {it.ada && <CheckSquare size={13} color="#1E7F3E" />}
                      </button>
                      <input
                        value={it.nama}
                        onChange={(e) => updateLainnya(r.idNumber, it.id, { nama: e.target.value })}
                        placeholder="Nama dokumen lainnya…"
                        style={{
                          flex: 1, padding: "8px 10px", borderRadius: 7,
                          border: `1px solid ${T.border}`, background: T.card, color: T.text, fontSize: 12.5,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeLainnya(r.idNumber, it.id)}
                        style={{ flexShrink: 0, border: "none", background: "transparent", color: T.danger, cursor: "pointer", padding: 4 }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => addLainnya(r.idNumber)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "7px 12px", borderRadius: 8, border: `1px solid ${T.border}`,
                    background: T.bg, color: T.text, cursor: "pointer", fontSize: 12, fontWeight: 600,
                  }}
                >
                  <Plus size={13} /> Tambah dokumen lainnya
                </button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
