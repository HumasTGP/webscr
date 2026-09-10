import { useMemo, useState } from "react";
import {
  ClipboardCheck, FileSpreadsheet, FileText, FolderCheck, ShieldCheck,
} from "lucide-react";
import { T, font } from "../../lib/theme";
import { documentRoute } from "../../lib/recordLinks";
import { SUB_DOCS } from "../../lib/data";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import DataTable from "../../components/DataTable";

const SUB_ICONS = {
  rab: FileSpreadsheet, tor: FileText, bast: ClipboardCheck, pakta: ShieldCheck,
};

function packageContents(idRab, { rab, tor, bast, pakta }) {
  return {
    rab:   rab.find((r) => r.idNumber === idRab) || null,
    tor:   tor.find((r) => r.id === idRab)       || null,
    bast:  bast.find((r) => r.id === idRab)      || null,
    pakta: pakta.find((r) => r.id === idRab)     || null,
  };
}

function DotStatus({ done, label }) {
  return (
    <span
      title={label + (done ? " - sudah ada" : " - belum")}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 22, height: 22, borderRadius: "50%",
        background: done ? "#DEF6E5" : "#F1F5F9",
        color: done ? "#1E7F3E" : "#94A3B8",
        border: `1px solid ${done ? "#87D3A2" : "#CBD5E1"}`,
        fontSize: 11, fontWeight: 800,
      }}
    >{done ? "✓" : "-"}</span>
  );
}

/**
 * "Tracking Kelengkapan Dokumen" (dulu bernama Paket Kas - Kirim ke Asman).
 *
 * Fungsi lama (kirim paket ke Asman untuk direview/approve/reject) sudah
 * dihapus. Sekarang murni menampilkan status kelengkapan dokumen per RAB
 * (RAB, TOR, BAST, Pakta Integritas + Form Evaluasi) - mirip pola StatusDot
 * di NonPoPage/CashCard, tidak ada approve/reject di sini lagi.
 */
export default function PaketKasPage({
  rab, tor, bast, pakta, packages, onUpsertPackage, notify, goto,
}) {
  const [detail, setDetail] = useState(null);

  const rows = useMemo(() => {
    return rab.map((rabRow) => {
      const idRab = rabRow.idNumber;
      const pkg = packages.find((p) => p.idRab === idRab);
      const contents = packageContents(idRab, { rab, tor, bast, pakta });
      const completed = SUB_DOCS.reduce((n, sd) => n + (contents[sd.key] ? 1 : 0), 0);
      const totalRequired = SUB_DOCS.filter((sd) => sd.required).length;
      const isComplete = completed === totalRequired && (pkg?.formEvaluasi ?? false);
      return {
        idRab, judul: rabRow.judulKegiatan || "-",
        kategori: rabRow.kategori || "-",
        contents, completed, totalRequired, isComplete, pkg,
      };
    });
  }, [rab, tor, bast, pakta, packages]);

  // Versi "hidup" dari detail - selalu ambil ulang dari rows (yang sudah
  // dihitung ulang tiap render lewat useMemo di atas), bukan snapshot beku.
  // Tanpa ini, toggleFormEval() mengubah packages tapi modal yang sedang
  // terbuka tetap menampilkan status lama sampai ditutup dan dibuka lagi.
  const liveDetail = detail ? (rows.find((r) => r.idRab === detail.idRab) || detail) : null;

  const toggleFormEval = (row) => {
    onUpsertPackage(row.idRab, {
      ...(row.pkg || {}),
      judul: row.judul, kategori: row.kategori,
      formEvaluasi: !(row.pkg?.formEvaluasi ?? false),
    });
  };

  const columns = [
    { key: "idRab", label: "ID RAB",
      render: (r) => <span style={{ fontFamily: font.mono, fontSize: 12.5, fontWeight: 700 }}>{r.idRab}</span> },
    { key: "judul",    label: "Judul Kegiatan" },
    { key: "kategori", label: "Kategori" },
    { key: "kelengkapan", label: "Kelengkapan", render: (r) => (
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {SUB_DOCS.map((sd) => {
          const Icon = SUB_ICONS[sd.key];
          const done = !!r.contents[sd.key];
          return (
            <span key={sd.key} style={{
              display: "inline-flex", alignItems: "center", gap: 3,
              padding: "2px 7px", borderRadius: 6, fontSize: 11.5, fontWeight: 600,
              background: done ? "#DEF6E5" : "#F1F5F9",
              color: done ? "#1E7F3E" : "#94A3B8",
              border: `1px solid ${done ? "#87D3A2" : "#CBD5E1"}`,
            }}>
              <Icon size={11} /> {sd.label}
            </span>
          );
        })}
        <span style={{
          padding: "2px 7px", borderRadius: 6, fontSize: 11.5, fontWeight: 600,
          background: (r.pkg?.formEvaluasi ?? false) ? "#DEF6E5" : "#F1F5F9",
          color: (r.pkg?.formEvaluasi ?? false) ? "#1E7F3E" : "#94A3B8",
          border: `1px solid ${(r.pkg?.formEvaluasi ?? false) ? "#87D3A2" : "#CBD5E1"}`,
        }}>Eval</span>
      </div>
    )},
    { key: "status", label: "Status", render: (r) => (
      r.isComplete
        ? <span style={{ color: "#1E7F3E", fontWeight: 700, fontSize: 12 }}>Lengkap</span>
        : <span style={{ color: "#94A3B8", fontWeight: 700, fontSize: 12 }}>{r.completed}/{r.totalRequired} dokumen</span>
    )},
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Administrasi Kas"
        title="Tracking Kelengkapan Dokumen"
        description="Status kelengkapan RAB, TOR, BAST, Pakta Integritas, dan Form Evaluasi untuk tiap RAB. Klik baris untuk lihat rincian dan membuka dokumen yang belum ada."
      />

      <Card padded={false} style={{ marginBottom: 14 }}>
        <DataTable
          rows={rows}
          columns={columns}
          emptyLabel="Belum ada RAB. Buat RAB dulu di menu RAB untuk membentuk kelengkapan dokumen."
          onRowClick={setDetail}
        />
      </Card>

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={liveDetail ? `Kelengkapan Dokumen ${liveDetail.idRab}` : ""}
        icon={FolderCheck}
        width={620}
      >
        {liveDetail && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              {liveDetail.isComplete
                ? <span style={{ color: "#1E7F3E", fontWeight: 700, fontSize: 13 }}>Lengkap</span>
                : <span style={{ color: "#94A3B8", fontWeight: 700, fontSize: 13 }}>Belum lengkap</span>}
              <span style={{ fontSize: 12, color: T.muted }}>
                {liveDetail.completed}/{liveDetail.totalRequired} dokumen wajib terisi
              </span>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "140px 1fr",
              rowGap: 8, columnGap: 12,
              fontSize: 13, marginBottom: 14,
            }}>
              <div style={{ color: T.muted }}>Judul</div>
              <div style={{ fontWeight: 600 }}>{liveDetail.judul}</div>
              <div style={{ color: T.muted }}>Kategori</div>
              <div>{liveDetail.kategori}</div>
            </div>

            <div style={{
              fontFamily: font.mono, fontSize: 10.5, letterSpacing: 1.2, textTransform: "uppercase",
              color: T.muted, marginBottom: 6,
            }}>Isi Dokumen</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
              {SUB_DOCS.map((sd) => {
                const Icon = SUB_ICONS[sd.key];
                const done = !!liveDetail.contents[sd.key];
                return (
                  <div key={sd.key} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 12px",
                    border: `1px solid ${done ? "#87D3A2" : T.border}`,
                    background: done ? "#F0FBF4" : T.bg,
                    borderRadius: 8,
                  }}>
                    <Icon size={16} color={done ? "#1E7F3E" : T.muted} />
                    <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{sd.label}</div>
                    <DotStatus done={done} label={sd.label} />
                    <Button
                      variant="ghost"
                      onClick={() => goto(documentRoute(sd.key, liveDetail.kategori), liveDetail.idRab)}
                      style={{ padding: "4px 10px", fontSize: 12 }}
                    >
                      {done ? "Buka" : "Buat"}
                    </Button>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => toggleFormEval(liveDetail)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 12px",
                  border: `1px solid ${liveDetail.pkg?.formEvaluasi ? "#87D3A2" : T.border}`,
                  background: liveDetail.pkg?.formEvaluasi ? "#F0FBF4" : T.bg,
                  borderRadius: 8, cursor: "pointer", textAlign: "left", width: "100%",
                }}
              >
                <ShieldCheck size={16} color={liveDetail.pkg?.formEvaluasi ? "#1E7F3E" : T.muted} />
                <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>
                  Form Evaluasi
                  <div style={{ fontSize: 11, fontWeight: 400, color: T.muted }}>
                    Klik untuk tandai form evaluasi sudah dilampirkan.
                  </div>
                </div>
                <DotStatus done={!!liveDetail.pkg?.formEvaluasi} label="Form Evaluasi" />
              </button>
            </div>

            <div style={{
              display: "flex", justifyContent: "flex-end",
              paddingTop: 14, borderTop: `1px solid ${T.border}`,
            }}>
              <Button variant="ghost" onClick={() => setDetail(null)}>Tutup</Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
