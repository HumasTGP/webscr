import { useMemo, useState } from "react";
import {
  AlertTriangle, ArrowRight, Check, ClipboardCheck,
  FileSpreadsheet, FileText, FolderOpen,
  ShieldCheck, X,
} from "lucide-react";
import { T, font } from "../lib/theme";
import { DOC_STATUS, STATUS_META, SUB_DOCS } from "../lib/data";
import Card from "../components/Card";
import Button from "../components/Button";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";

const SUB_ICONS = { rab: FileSpreadsheet, tor: FileText, bast: ClipboardCheck, pakta: ShieldCheck };

const TAB_FILTERS = {
  masuk:     (p) => p.status === DOC_STATUS.SUBMITTED || p.status === DOC_STATUS.IN_REVIEW,
  disetujui: (p) => p.status === DOC_STATUS.APPROVED,
  ditolak:   (p) => p.status === DOC_STATUS.REJECTED,
  diproses:  (p) => p.status === DOC_STATUS.PROCESSED,
};

const TABS = [
  { key: "masuk",     label: "Dokumen Baru Masuk", statusKey: DOC_STATUS.SUBMITTED },
  { key: "disetujui", label: "Dokumen Disetujui",  statusKey: DOC_STATUS.APPROVED },
  { key: "ditolak",   label: "Dokumen Ditolak",    statusKey: DOC_STATUS.REJECTED },
  { key: "diproses",  label: "Telah Diproses",     statusKey: DOC_STATUS.PROCESSED },
];

function StatusPill({ statusKey, rejectedBy }) {
  const meta = STATUS_META[statusKey] || STATUS_META.draft;
  // Label lebih spesifik untuk rejected: tunjukkan siapa yang menolak.
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

function subDocsFor(idRab, { rab, tor, bast, pakta }) {
  return {
    rab:   rab.find((r) => r.idNumber === idRab) || null,
    tor:   tor.find((r) => r.id === idRab)       || null,
    bast:  bast.find((r) => r.id === idRab)      || null,
    pakta: pakta.find((r) => r.id === idRab)     || null,
  };
}

export default function InboxPage({
  user, packages, rab, tor, bast, pakta,
  onUpdatePackage, notify,
}) {
  const [tab, setTab] = useState("masuk");
  const [detail, setDetail] = useState(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState("");

  const counts = useMemo(() => {
    const c = { masuk: 0, disetujui: 0, ditolak: 0, diproses: 0 };
    for (const p of packages) {
      for (const t of TABS) if (TAB_FILTERS[t.key](p)) c[t.key] += 1;
    }
    return c;
  }, [packages]);

  const rows = useMemo(
    () => packages.filter(TAB_FILTERS[tab]),
    [packages, tab]
  );

  const openPackage = (p) => {
    setDetail(p);
    if (user.role === "asman" && p.status === DOC_STATUS.SUBMITTED) {
      onUpdatePackage(p.idRab, { status: DOC_STATUS.IN_REVIEW });
    }
  };

  // Asman: setujui paket SUBMITTED/IN_REVIEW → dikirim ke MADM
  const doApprove = () => {
    if (!detail) return;
    onUpdatePackage(detail.idRab, {
      status: DOC_STATUS.APPROVED,
      reviewedBy: user.username,
      reviewedAt: new Date().toISOString(),
      reviewNote: "",
    });
    notify(`Paket ${detail.idRab} disetujui — dikirim ke MADM.`, "success");
    setDetail(null);
  };

  // Tolak — dipakai baik Asman maupun MADM. Simpan alasan di note yang berbeda
  // supaya Humas bisa lihat siapa yang menolak dan kapan.
  const doReject = () => {
    if (!detail || !rejectNote.trim()) return;
    const now = new Date().toISOString();
    const patch = { status: DOC_STATUS.REJECTED };
    if (user.role === "asman") {
      patch.reviewedBy = user.username;
      patch.reviewedAt = now;
      patch.reviewNote = rejectNote.trim();
      patch.rejectedBy = "asman";
    } else if (user.role === "madm") {
      patch.processedBy = user.username;
      patch.processedAt = now;
      patch.processNote = rejectNote.trim();
      patch.rejectedBy = "madm";
    }
    onUpdatePackage(detail.idRab, patch);
    notify(`Paket ${detail.idRab} ditolak — catatan dikirim ke Humas.`, "error");
    setRejectNote(""); setRejectOpen(false); setDetail(null);
  };

  // MADM: setujui/proses paket APPROVED → selesai, notif ke Humas
  const doProcess = () => {
    if (!detail) return;
    onUpdatePackage(detail.idRab, {
      status: DOC_STATUS.PROCESSED,
      processedAt: new Date().toISOString(),
      processedBy: user.username,
      processNote: "",
    });
    notify(`Paket ${detail.idRab} selesai diproses — notifikasi dikirim ke Humas.`, "success");
    setDetail(null);
  };

  // Ambil versi TERBARU dari state supaya modal ikut nge-update setelah
  // auto-transisi ke IN_REVIEW / setelah aksi tolak/setuju.
  const liveDetail = detail ? (packages.find((p) => p.idRab === detail.idRab) || detail) : null;
  const contents = liveDetail ? subDocsFor(liveDetail.idRab, { rab, tor, bast, pakta }) : {};

  return (
    <div>
      <PageHeader
        eyebrow={user.role === "asman" ? "Panel Asman" : "Panel MADM"}
        title="Inbox Paket Kas"
        description={
          user.role === "asman"
            ? "Setiap baris = 1 paket kas (folder) dari Humas berisi RAB + TOR + BAST + PI + Form Evaluasi. Klik untuk buka & setujui / tolak."
            : "Tandai paket yang sudah disetujui Asman sebagai selesai diproses."
        }
      />

      <Card style={{ marginBottom: 14, padding: 12 }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${TABS.length}, minmax(0, 1fr))`,
          gap: 8,
        }}>
          {TABS.map((t) => {
            const active = tab === t.key;
            const meta = STATUS_META[t.statusKey];
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "flex-start",
                  gap: 4, padding: "10px 12px",
                  border: `1px solid ${active ? meta.color : T.border}`,
                  background: active ? meta.bg : T.card,
                  borderRadius: 10, cursor: "pointer",
                  transition: "border-color .15s ease, background .15s ease",
                  textAlign: "left",
                }}
              >
                <span style={{
                  fontSize: 10.5, letterSpacing: 1.2, textTransform: "uppercase",
                  fontFamily: font.mono,
                  color: active ? meta.color : T.muted,
                }}>{t.label}</span>
                <span style={{
                  fontFamily: font.display, fontSize: 22, lineHeight: 1,
                  color: active ? meta.color : T.heading,
                }}>{counts[t.key]}</span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card padded={false}>
        <DataTable
          rows={rows}
          columns={[
            { key: "folder", label: "", render: () => (
              <FolderOpen size={16} color={T.blue} />
            )},
            { key: "idRab", label: "ID Paket",
              render: (r) => <span style={{ fontFamily: font.mono, fontSize: 12.5, fontWeight: 700 }}>{r.idRab}</span> },
            { key: "judul", label: "Judul" },
            { key: "kategori", label: "Kategori" },
            { key: "submittedAt", label: "Dikirim", render: (r) =>
              r.submittedAt ? new Date(r.submittedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "—" },
            { key: "status", label: "Status", render: (r) => <StatusPill statusKey={r.status} rejectedBy={r.rejectedBy} /> },
          ]}
          onRowClick={openPackage}
          emptyLabel={
            tab === "masuk"     ? "Belum ada paket baru masuk." :
            tab === "disetujui" ? "Belum ada paket yang disetujui." :
            tab === "ditolak"   ? "Tidak ada paket yang ditolak." :
                                  "Belum ada paket yang selesai diproses."
          }
        />
      </Card>

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? `Paket ${detail.idRab}` : ""}
        icon={FolderOpen}
        width={640}
      >
        {detail && liveDetail && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
              <StatusPill statusKey={liveDetail.status} rejectedBy={liveDetail.rejectedBy} />
              {liveDetail.reviewedBy && (
                <span style={{ fontSize: 11.5, color: T.muted }}>
                  di-review oleh <b>{liveDetail.reviewedBy}</b>
                  {liveDetail.reviewedAt && ` · ${new Date(liveDetail.reviewedAt).toLocaleString("id-ID")}`}
                </span>
              )}
              {liveDetail.processedAt && (
                <span style={{ fontSize: 11.5, color: T.muted }}>
                  diproses oleh <b>{liveDetail.processedBy || "madm"}</b>
                  {` · ${new Date(liveDetail.processedAt).toLocaleString("id-ID")}`}
                </span>
              )}
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "140px 1fr",
              rowGap: 6, columnGap: 12,
              fontSize: 13, marginBottom: 14,
            }}>
              <div style={{ color: T.muted }}>Judul</div>
              <div style={{ fontWeight: 600 }}>{liveDetail.judul}</div>
              <div style={{ color: T.muted }}>Kategori</div>
              <div>{liveDetail.kategori}</div>
              <div style={{ color: T.muted }}>Total Evaluasi</div>
              <div style={{ fontWeight: 700 }}>
                Rp {Number(contents.rab?.totalEvaluasi || 0).toLocaleString("id-ID")}
              </div>
            </div>

            <div style={{
              fontFamily: font.mono, fontSize: 10.5, letterSpacing: 1.2,
              textTransform: "uppercase", color: T.muted, marginBottom: 6,
            }}>
              Isi Paket
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
              {SUB_DOCS.map((sd) => {
                const doc = contents[sd.key];
                const Icon = SUB_ICONS[sd.key];
                const done = !!doc;
                return (
                  <div
                    key={sd.key}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "9px 12px",
                      border: `1px solid ${done ? "#87D3A2" : T.border}`,
                      background: done ? "#F0FBF4" : T.bg,
                      borderRadius: 8,
                    }}
                  >
                    <Icon size={16} color={done ? "#1E7F3E" : T.muted} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{sd.label}</div>
                      <div style={{ fontSize: 11, color: T.muted }}>
                        {done ? (doc.judulKegiatan || doc.judulBantuan || "—") : "Belum ada dokumen"}
                      </div>
                    </div>
                    <span style={{
                      padding: "2px 8px", borderRadius: 999,
                      fontSize: 10.5, fontWeight: 700,
                      background: done ? "#DEF6E5" : "#F1F5F9",
                      color: done ? "#1E7F3E" : "#94A3B8",
                    }}>
                      {done ? "Ada" : "Belum"}
                    </span>
                  </div>
                );
              })}
              <div style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
                border: `1px solid ${liveDetail.formEvaluasi ? "#87D3A2" : T.border}`,
                background: liveDetail.formEvaluasi ? "#F0FBF4" : T.bg,
                borderRadius: 8,
              }}>
                <Check size={16} color={liveDetail.formEvaluasi ? "#1E7F3E" : T.muted} />
                <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>Form Evaluasi</div>
                <span style={{
                  padding: "2px 8px", borderRadius: 999,
                  fontSize: 10.5, fontWeight: 700,
                  background: liveDetail.formEvaluasi ? "#DEF6E5" : "#F1F5F9",
                  color: liveDetail.formEvaluasi ? "#1E7F3E" : "#94A3B8",
                }}>
                  {liveDetail.formEvaluasi ? "Dilampirkan" : "Belum"}
                </span>
              </div>
            </div>

            {liveDetail.reviewNote && (
              <div style={{
                padding: "10px 12px", borderRadius: 8, marginBottom: 8,
                background: STATUS_META.rejected.bg,
                border: `1px solid ${STATUS_META.rejected.color}30`,
                color: STATUS_META.rejected.color, fontSize: 12.5,
              }}>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>
                  Catatan Asman ({liveDetail.reviewedBy || "asman"}):
                </div>
                {liveDetail.reviewNote}
              </div>
            )}
            {liveDetail.processNote && (
              <div style={{
                padding: "10px 12px", borderRadius: 8, marginBottom: 12,
                background: STATUS_META.processed.bg,
                border: `1px solid ${STATUS_META.processed.color}30`,
                color: STATUS_META.processed.color, fontSize: 12.5,
              }}>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>
                  Catatan MADM ({liveDetail.processedBy || "madm"}):
                </div>
                {liveDetail.processNote}
              </div>
            )}

            <div style={{
              display: "flex", gap: 10, justifyContent: "flex-end",
              paddingTop: 14, borderTop: `1px solid ${T.border}`, flexWrap: "wrap",
            }}>
              <Button variant="ghost" onClick={() => setDetail(null)}>Tutup</Button>
              {user.role === "asman" &&
                (liveDetail.status === DOC_STATUS.SUBMITTED ||
                 liveDetail.status === DOC_STATUS.IN_REVIEW) && (
                <>
                  <Button variant="ghost" icon={X} onClick={() => setRejectOpen(true)}>Tolak</Button>
                  <Button variant="accent" icon={Check} onClick={doApprove}>Setujui</Button>
                </>
              )}
              {user.role === "madm" && liveDetail.status === DOC_STATUS.APPROVED && (
                <>
                  <Button variant="ghost" icon={X} onClick={() => setRejectOpen(true)}>Tolak</Button>
                  <Button variant="accent" icon={ArrowRight} onClick={doProcess}>Tandai Telah Diproses</Button>
                </>
              )}
            </div>
          </>
        )}
      </Modal>

      <Modal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Tolak Paket"
        icon={AlertTriangle}
        width={440}
      >
        <p style={{ fontSize: 13, color: T.muted, marginBottom: 12, lineHeight: 1.6 }}>
          Isi catatan alasan penolakan. Catatan akan terlihat oleh Humas untuk revisi.
        </p>
        <textarea
          value={rejectNote}
          onChange={(e) => setRejectNote(e.target.value)}
          placeholder="Contoh: BAST belum ditandatangani pihak kedua."
          rows={4}
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "10px 12px", borderRadius: 8,
            border: `1px solid ${T.border}`,
            background: T.inputBg, color: T.text,
            fontSize: 13, fontFamily: font.body, resize: "vertical",
          }}
        />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
          <Button variant="ghost" onClick={() => setRejectOpen(false)}>Batal</Button>
          <Button variant="accent" icon={X} onClick={doReject} disabled={!rejectNote.trim()}>
            Konfirmasi Tolak
          </Button>
        </div>
      </Modal>
    </div>
  );
}
