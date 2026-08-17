import { useMemo, useState } from "react";
import {
  AlertTriangle, ArrowRight, Check, Handshake, X,
} from "lucide-react";
import { T, font } from "../../lib/theme";
import { DOC_STATUS, STATUS_META } from "../../lib/data";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";

const TAB_FILTERS = {
  masuk:     (p) => p.status === DOC_STATUS.SUBMITTED || p.status === DOC_STATUS.IN_REVIEW,
  disetujui: (p) => p.status === DOC_STATUS.APPROVED,
  ditolak:   (p) => p.status === DOC_STATUS.REJECTED,
  diproses:  (p) => p.status === DOC_STATUS.PROCESSED,
};

const TABS = [
  { key: "masuk",     label: "Baru Masuk" },
  { key: "disetujui", label: "Disetujui" },
  { key: "ditolak",   label: "Ditolak" },
  { key: "diproses",  label: "Telah Diproses" },
];

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

export default function InboxProposalPage({ user, proposals, onUpdateProposal, notify }) {
  const [tab, setTab] = useState("masuk");
  const [detail, setDetail] = useState(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState("");

  const counts = useMemo(() => {
    const c = { masuk: 0, disetujui: 0, ditolak: 0, diproses: 0 };
    for (const p of proposals) {
      for (const t of TABS) if (TAB_FILTERS[t.key](p)) c[t.key] += 1;
    }
    return c;
  }, [proposals]);

  const rows = useMemo(
    () => proposals.filter(TAB_FILTERS[tab]),
    [proposals, tab]
  );

  const openItem = (p) => {
    setDetail(p);
    if (user.role === "asman" && p.status === DOC_STATUS.SUBMITTED) {
      onUpdateProposal(p.id, { status: DOC_STATUS.IN_REVIEW });
    }
  };

  const doApprove = () => {
    if (!detail) return;
    onUpdateProposal(detail.id, {
      status: DOC_STATUS.APPROVED,
      statusProposal: "Disetujui",
      reviewedBy: user.username,
      reviewedAt: new Date().toISOString(),
      reviewNote: "",
    });
    notify(`Proposal ${detail.id} disetujui - dikirim ke MADM.`, "success");
    setDetail(null);
  };

  const doReject = () => {
    if (!detail || !rejectNote.trim()) return;
    const now = new Date().toISOString();
    const patch = { status: DOC_STATUS.REJECTED, statusProposal: "Ditolak" };
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
    onUpdateProposal(detail.id, patch);
    notify(`Proposal ${detail.id} ditolak - catatan dikirim ke Humas.`, "error");
    setRejectNote(""); setRejectOpen(false); setDetail(null);
  };

  const doProcess = () => {
    if (!detail) return;
    onUpdateProposal(detail.id, {
      status: DOC_STATUS.PROCESSED,
      statusProposal: "Disetujui",
      processedAt: new Date().toISOString(),
      processedBy: user.username,
      processNote: "",
    });
    notify(`Proposal ${detail.id} selesai diproses.`, "success");
    setDetail(null);
  };

  const liveDetail = detail ? (proposals.find((p) => p.id === detail.id) || detail) : null;

  return (
    <div>
      <PageHeader
        eyebrow={user.role === "asman" ? "Panel Asman" : "Panel MADM"}
        title="Inbox Proposal"
        description={
          user.role === "asman"
            ? "Proposal yang dikirim Humas. Klik untuk buka, beri catatan, lalu setujui / tolak."
            : "Proposal yang sudah disetujui Asman. Tandai selesai diproses atau tolak dengan catatan."
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
            const meta = STATUS_META[
              t.key === "masuk" ? "submitted" : t.key === "disetujui" ? "approved" : t.key === "ditolak" ? "rejected" : "processed"
            ];
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
            { key: "id", label: "ID Proposal",
              render: (r) => <span style={{ fontFamily: font.mono, fontSize: 12.5, fontWeight: 700 }}>{r.id}</span> },
            { key: "namaLembaga", label: "Instansi" },
            { key: "judulProposal", label: "Judul Proposal" },
            { key: "status", label: "Status", render: (r) => <StatusPill statusKey={r.status} rejectedBy={r.rejectedBy} /> },
          ]}
          onRowClick={openItem}
          emptyLabel={
            tab === "masuk"     ? "Belum ada Proposal baru masuk." :
            tab === "disetujui" ? "Belum ada Proposal yang disetujui." :
            tab === "ditolak"   ? "Tidak ada Proposal yang ditolak." :
                                  "Belum ada Proposal yang selesai diproses."
          }
        />
      </Card>

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? `Proposal ${detail.id}` : ""}
        icon={Handshake}
        width={560}
      >
        {detail && liveDetail && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
              <StatusPill statusKey={liveDetail.status} rejectedBy={liveDetail.rejectedBy} />
              {liveDetail.reviewedBy && (
                <span style={{ fontSize: 11.5, color: T.muted }}>
                  di-review oleh <b>{liveDetail.reviewedBy}</b>
                  {liveDetail.reviewedAt && ` - ${new Date(liveDetail.reviewedAt).toLocaleString("id-ID")}`}
                </span>
              )}
              {liveDetail.processedAt && (
                <span style={{ fontSize: 11.5, color: T.muted }}>
                  diproses oleh <b>{liveDetail.processedBy || "madm"}</b>
                  {` - ${new Date(liveDetail.processedAt).toLocaleString("id-ID")}`}
                </span>
              )}
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "140px 1fr",
              rowGap: 6, columnGap: 12,
              fontSize: 13, marginBottom: 14,
            }}>
              <div style={{ color: T.muted }}>Instansi</div>
              <div style={{ fontWeight: 600 }}>{liveDetail.namaLembaga}</div>
              <div style={{ color: T.muted }}>Judul Proposal</div>
              <div>{liveDetail.judulProposal}</div>
              {liveDetail.nilaiDiajukan && (
                <>
                  <div style={{ color: T.muted }}>Nilai Diajukan</div>
                  <div style={{ fontWeight: 700 }}>{liveDetail.nilaiDiajukan}</div>
                </>
              )}
              {liveDetail.catatanInternal && (
                <>
                  <div style={{ color: T.muted }}>Catatan Internal</div>
                  <div>{liveDetail.catatanInternal}</div>
                </>
              )}
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
        title="Tolak Proposal"
        icon={AlertTriangle}
        width={440}
      >
        <p style={{ fontSize: 13, color: T.muted, marginBottom: 12, lineHeight: 1.6 }}>
          Isi catatan alasan penolakan. Catatan akan terlihat oleh Humas untuk direvisi dan dikirim ulang.
        </p>
        <textarea
          value={rejectNote}
          onChange={(e) => setRejectNote(e.target.value)}
          placeholder="Contoh: anggaran yang diajukan terlalu besar, mohon direvisi."
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
