import { useMemo, useState } from "react";
import {
  Check, ClipboardCheck, FileSpreadsheet, FileText,
  FolderCheck, Send, ShieldCheck,
} from "lucide-react";
import { T, font } from "../lib/theme";
import { DOC_STATUS, STATUS_META, SUB_DOCS } from "../lib/data";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Button from "../components/Button";
import Modal from "../components/Modal";
import DataTable from "../components/DataTable";

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

function StatusPill({ statusKey, rejectedBy }) {
  const meta = STATUS_META[statusKey] || STATUS_META.draft;
  let label = meta.label;
  if (statusKey === DOC_STATUS.REJECTED && rejectedBy) {
    label = rejectedBy === "asman" ? "Ditolak Asman" : "Ditolak MADM";
  }
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "3px 10px", borderRadius: 999,
      background: meta.bg, color: meta.color,
      fontSize: 11.5, fontWeight: 700, letterSpacing: 0.3,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.color }} />
      {label}
    </span>
  );
}

function DotStatus({ done, label }) {
  return (
    <span
      title={label + (done ? " — sudah ada" : " — belum")}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 22, height: 22, borderRadius: "50%",
        background: done ? "#DEF6E5" : "#F1F5F9",
        color: done ? "#1E7F3E" : "#94A3B8",
        border: `1px solid ${done ? "#87D3A2" : "#CBD5E1"}`,
        fontSize: 11, fontWeight: 800,
      }}
    >{done ? "✓" : "—"}</span>
  );
}

export default function KasPackagesPage({
  rab, tor, bast, pakta, packages,
  onUpsertPackage, notify, goto,
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
      const status = pkg?.status || DOC_STATUS.DRAFT;
      return {
        idRab, judul: rabRow.judulKegiatan || "—",
        kategori: rabRow.kategori || "—",
        contents, completed, totalRequired, isComplete, status, pkg,
      };
    });
  }, [rab, tor, bast, pakta, packages]);

  const submit = (row) => {
    onUpsertPackage(row.idRab, {
      judul: row.judul, kategori: row.kategori,
      formEvaluasi: row.pkg?.formEvaluasi ?? true,
      status: DOC_STATUS.SUBMITTED,
      submittedAt: new Date().toISOString(),
      // Bersihkan semua trace review lama supaya paket resubmit tampil bersih.
      reviewedAt: "", reviewedBy: "", reviewNote: "",
      processedAt: "", processedBy: "", processNote: "",
      rejectedBy: "",
    });
    notify(`Paket ${row.idRab} dikirim ke Asman.`, "success", "Paket Kas");
    setDetail(null);
  };

  const toggleFormEval = (row) => {
    onUpsertPackage(row.idRab, {
      ...(row.pkg || {}),
      judul: row.judul, kategori: row.kategori,
      formEvaluasi: !(row.pkg?.formEvaluasi ?? false),
      status: row.pkg?.status || DOC_STATUS.DRAFT,
    });
  };

  const columns = [
    { key: "idRab", label: "ID Paket",
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
    { key: "status", label: "Status", render: (r) => <StatusPill statusKey={r.status} rejectedBy={r.pkg?.rejectedBy} /> },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Administrasi Kas"
        title="Paket Kas — Kirim ke Asman"
        description="Satu paket = satu ID RAB berisi RAB + TOR + BAST + Pakta Integritas + Form Evaluasi. Setelah semua lengkap, kirim satu paket sekaligus ke Asman untuk review."
      />

      <Card padded={false} style={{ marginBottom: 14 }}>
        <DataTable
          rows={rows}
          columns={columns}
          emptyLabel="Belum ada RAB. Buat RAB dulu di menu RAB untuk membentuk paket kas."
          onRowClick={setDetail}
        />
      </Card>

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? `Paket ${detail.idRab}` : ""}
        icon={FolderCheck}
        width={620}
      >
        {detail && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <StatusPill statusKey={detail.status} rejectedBy={detail.pkg?.rejectedBy} />
              <span style={{ fontSize: 12, color: T.muted }}>
                {detail.completed}/{detail.totalRequired} dokumen wajib terisi
              </span>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "140px 1fr",
              rowGap: 8, columnGap: 12,
              fontSize: 13, marginBottom: 14,
            }}>
              <div style={{ color: T.muted }}>Judul</div>
              <div style={{ fontWeight: 600 }}>{detail.judul}</div>
              <div style={{ color: T.muted }}>Kategori</div>
              <div>{detail.kategori}</div>
            </div>

            <div style={{
              fontFamily: font.mono, fontSize: 10.5, letterSpacing: 1.2, textTransform: "uppercase",
              color: T.muted, marginBottom: 6,
            }}>Isi Paket</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
              {SUB_DOCS.map((sd) => {
                const Icon = SUB_ICONS[sd.key];
                const done = !!detail.contents[sd.key];
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
                      onClick={() => goto(sd.key)}
                      style={{ padding: "4px 10px", fontSize: 12 }}
                    >
                      {done ? "Buka" : "Buat"}
                    </Button>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => toggleFormEval(detail)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 12px",
                  border: `1px solid ${detail.pkg?.formEvaluasi ? "#87D3A2" : T.border}`,
                  background: detail.pkg?.formEvaluasi ? "#F0FBF4" : T.bg,
                  borderRadius: 8, cursor: "pointer", textAlign: "left", width: "100%",
                }}
              >
                <Check size={16} color={detail.pkg?.formEvaluasi ? "#1E7F3E" : T.muted} />
                <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>
                  Form Evaluasi
                  <div style={{ fontSize: 11, fontWeight: 400, color: T.muted }}>
                    Klik untuk tandai form evaluasi sudah dilampirkan.
                  </div>
                </div>
                <DotStatus done={!!detail.pkg?.formEvaluasi} label="Form Evaluasi" />
              </button>
            </div>

            {detail.pkg?.reviewNote && (
              <div style={{
                padding: "10px 12px", borderRadius: 8, marginBottom: 8,
                background: STATUS_META.rejected.bg,
                border: `1px solid ${STATUS_META.rejected.color}30`,
                color: STATUS_META.rejected.color, fontSize: 12.5,
              }}>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>
                  Catatan Asman ({detail.pkg.reviewedBy || "asman"}):
                </div>
                {detail.pkg.reviewNote}
              </div>
            )}
            {detail.pkg?.processNote && (
              <div style={{
                padding: "10px 12px", borderRadius: 8, marginBottom: 12,
                background: STATUS_META.processed.bg,
                border: `1px solid ${STATUS_META.processed.color}30`,
                color: STATUS_META.processed.color, fontSize: 12.5,
              }}>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>
                  Catatan MADM ({detail.pkg.processedBy || "madm"}):
                </div>
                {detail.pkg.processNote}
              </div>
            )}
            {detail.status === DOC_STATUS.PROCESSED && !detail.pkg?.processNote && (
              <div style={{
                padding: "10px 12px", borderRadius: 8, marginBottom: 12,
                background: STATUS_META.processed.bg,
                border: `1px solid ${STATUS_META.processed.color}30`,
                color: STATUS_META.processed.color, fontSize: 12.5,
              }}>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>
                  Paket selesai diproses oleh MADM ({detail.pkg?.processedBy || "madm"}).
                </div>
                Tidak ada catatan tambahan.
              </div>
            )}

            <div style={{
              display: "flex", gap: 10, justifyContent: "flex-end",
              paddingTop: 14, borderTop: `1px solid ${T.border}`, flexWrap: "wrap",
            }}>
              <Button variant="ghost" onClick={() => setDetail(null)}>Tutup</Button>
              {(detail.status === DOC_STATUS.DRAFT ||
                detail.status === DOC_STATUS.REJECTED) && (
                <Button
                  variant="accent"
                  icon={Send}
                  disabled={!detail.isComplete}
                  onClick={() => submit(detail)}
                  title={
                    !detail.isComplete
                      ? "Lengkapi RAB, TOR, BAST, PI, dan Form Evaluasi dulu"
                      : "Kirim paket ini ke Asman"
                  }
                >
                  Kirim ke Asman
                </Button>
              )}
              {detail.status === DOC_STATUS.SUBMITTED && (
                <span style={{ color: T.muted, fontSize: 12.5, alignSelf: "center" }}>
                  Sudah dikirim — menunggu review Asman.
                </span>
              )}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
