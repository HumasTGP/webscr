import { useState } from "react";
import { CheckSquare, Printer } from "lucide-react";
import { T, font } from "../lib/theme";
import { printChecklist } from "../lib/utils";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";

const INTERNAL_CHECKLIST = [
  "Daftar Hadir",
  "Form Verifikasi",
  "Lampiran 1 (Rincian Pekerjaan)",
  "Lampiran 2 (Checklist)",
  "Berita Acara Serah Terima (BAST)",
  "Berita Acara Pemeriksaan Pekerjaan (BAPP)",
  "Pakta Integritas (PI)",
  "Dokumentasi Kegiatan",
  "Eviden Pendukung",
];

export default function Lampiran2Page({ rab, notify }) {
  const [checked, setChecked] = useState({});

  const toggle = (rabId, item) => {
    setChecked((prev) => {
      const key = `${rabId}::${item}`;
      return { ...prev, [key]: !prev[key] };
    });
  };

  const getProgress = (rabId) => {
    const total = INTERNAL_CHECKLIST.length;
    const done = INTERNAL_CHECKLIST.filter((item) => checked[`${rabId}::${item}`]).length;
    return { total, done, pct: Math.round((done / total) * 100) };
  };

  const handlePrint = (r) => {
    const items = INTERNAL_CHECKLIST.map((nama) => ({
      nama,
      ada: !!checked[`${r.idNumber}::${nama}`],
    }));
    printChecklist({
      title: "Lampiran 2 - Checklist Internal",
      subtitle: `${r.idNumber} - ${r.judulKegiatan}`,
      items,
    });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Pembayaran"
        title="Lampiran 2 - Checklist"
        description="Checklist internal kelengkapan dokumen untuk proses pembayaran."
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
            const complete = progress.done === progress.total;
            return (
              <Card key={r.idNumber}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontFamily: font.mono, fontSize: 12, fontWeight: 700, color: T.blue }}>{r.idNumber}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.heading, marginTop: 2 }}>{r.judulKegiatan}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                      background: complete ? "#DEF6E5" : "#FFF4D0",
                      color: complete ? "#1E7F3E" : "#8A6D00",
                    }}>
                      {progress.done}/{progress.total} ({progress.pct}%)
                    </div>
                    <button onClick={() => handlePrint(r)} style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "8px 14px", borderRadius: 8, border: `1px solid ${T.border}`,
                      background: T.card, color: T.heading, cursor: "pointer", fontSize: 12, fontWeight: 600,
                    }}><Printer size={14} /> Cetak</button>
                  </div>
                </div>

                <div style={{
                  height: 4, borderRadius: 2, background: T.border, marginBottom: 14, overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%", borderRadius: 2, width: `${progress.pct}%`,
                    background: complete ? "#1E7F3E" : T.blue,
                    transition: "width .3s ease",
                  }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 8 }}>
                  {INTERNAL_CHECKLIST.map((item) => {
                    const key = `${r.idNumber}::${item}`;
                    const isChecked = !!checked[key];
                    return (
                      <button
                        key={item}
                        onClick={() => toggle(r.idNumber, item)}
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
                        <CheckSquare size={16} color={isChecked ? "#1E7F3E" : T.muted} />
                        {item}
                      </button>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
