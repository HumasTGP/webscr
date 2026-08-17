import { useMemo, useState } from "react";
import {
  AlertTriangle, ArrowRight, Check, Wallet, X,
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
  { key: "masuk", label: "Baru Masuk" },
  { key: "disetujui", label: "Disetujui" },
  { key: "ditolak", label: "Ditolak" },
  { key: "diproses", label: "Telah Diproses" },
];
const KATEGORI_TABS = ["Semua", "NON PO", "PO", "Cash Card"];

function StatusPill({ statusKey, rejectedBy }) {
  const meta = STATUS_META[statusKey] || STATUS_META.draft;
  let label = meta.label;
  if (statusKey === DOC_STATUS.REJECTED && rejectedBy) label = rejectedBy === "asman" ? "Ditolak Asman" : "Ditolak MADM";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 999,
      background: meta.bg, color: meta.color, fontSize: 11.5, fontWeight: 700,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.color }} />
      {label}
    </span>
  );
}

export default function InboxPembayaranPage({ user, paymentPackages, onUpdatePackage, notify }) {
  const [tab, setTab] = useState("masuk");
  const [kategoriFilter, setKategoriFilter] = useState("Semua");
  const [detail, setDetail] = useState(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState("");

  const byKategori = useMemo(
    () => kategoriFilter === "Semua" ? paymentPackages : paymentPackages.filter((p) => p.kategori === kategoriFilter),
    [paymentPackages, kategoriFilter]
  );

  const counts = useMemo(() => {
    const c = { masuk: 0, disetujui: 0, ditolak: 0, diproses: 0 };
    for (const p of byKategori) for (const t of TABS) if (TAB_FILTERS[t.key](p)) c[t.key] += 1;
    return c;
  }, [byKategori]);

  const rows = useMemo(() => byKategori.filter(TAB_FILTERS[tab]), [byKategori, tab]);

  const openItem = (p) => {
    setDetail(p);
    if (user.role === "asman" && p.status === DOC_STATUS.SUBMITTED) {
      onUpdatePackage(p.id, { status: DOC_STATUS.IN_REVIEW });
    }
  };

  const doApprove = () => {
    if (!detail) return;
    onUpdatePackage(detail.id, { status: DOC_STATUS.APPROVED, reviewedBy: user.username, reviewedAt: new Date().toISOString(), reviewNote: "" });
    notify(`Paket ${detail.idRab} disetujui - dikirim ke MADM.`, "success");
    setDetail(null);
  };
  const doReject = () => {
    if (!detail || !rejectNote.trim()) return;
    const now = new Date().toISOString();
    const patch = { status: DOC_STATUS.REJECTED };
    if (user.role === "asman") { patch.reviewedBy = user.username; patch.reviewedAt = now; patch.reviewNote = rejectNote.trim(); patch.rejectedBy = "asman"; }
    else { patch.processedBy = user.username; patch.processedAt = now; patch.processNote = rejectNote.trim(); patch.rejectedBy = "madm"; }
    onUpdatePackage(detail.id, patch);
    notify(`Paket ${detail.idRab} ditolak - catatan dikirim ke Humas.`, "error");
    setRejectNote(""); setRejectOpen(false); setDetail(null);
  };
  const doProcess = () => {
    if (!detail) return;
    onUpdatePackage(detail.id, { status: DOC_STATUS.PROCESSED, processedAt: new Date().toISOString(), processedBy: user.username, processNote: "" });
    notify(`Paket ${detail.idRab} selesai diproses.`, "success");
    setDetail(null);
  };

  const liveDetail = detail ? (paymentPackages.find((p) => p.id === detail.id) || detail) : null;

  return (
    <div>
      <PageHeader
        eyebrow={user.role === "asman" ? "Panel Asman" : "Panel MADM"}
        title="Inbox Pembayaran"
        description="Paket dokumen pembayaran (NON PO / PO / Cash Card) yang dikirim Humas setelah checklist-nya lengkap."
      />

      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {KATEGORI_TABS.map((k) => (
          <button key={k} onClick={() => setKategoriFilter(k)} style={{
            padding: "7px 14px", borderRadius: 999, cursor: "pointer",
            border: `1.5px solid ${kategoriFilter === k ? T.navy : T.border}`,
            background: kategoriFilter === k ? T.blueSoft : T.card,
            color: kategoriFilter === k ? T.navy : T.muted, fontSize: 12.5, fontWeight: 600,
          }}>{k}</button>
        ))}
      </div>

      <Card style={{ marginBottom: 14, padding: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${TABS.length}, minmax(0, 1fr))`, gap: 8 }}>
          {TABS.map((t) => {
            const active = tab === t.key;
            const meta = STATUS_META[t.key === "masuk" ? "submitted" : t.key === "disetujui" ? "approved" : t.key === "ditolak" ? "rejected" : "processed"];
            return (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4, padding: "10px 12px",
                border: `1px solid ${active ? meta.color : T.border}`, background: active ? meta.bg : T.card,
                borderRadius: 10, cursor: "pointer", textAlign: "left",
              }}>
                <span style={{ fontSize: 10.5, letterSpacing: 1.2, textTransform: "uppercase", fontFamily: font.mono, color: active ? meta.color : T.muted }}>{t.label}</span>
                <span style={{ fontFamily: font.display, fontSize: 22, lineHeight: 1, color: active ? meta.color : T.heading }}>{counts[t.key]}</span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card padded={false}>
        <DataTable
          rows={rows}
          columns={[
            { key: "idRab", label: "ID RAB", render: (r) => <span style={{ fontFamily: font.mono, fontSize: 12.5, fontWeight: 700 }}>{r.idRab}</span> },
            { key: "judulKegiatan", label: "Judul Kegiatan" },
            { key: "kategori", label: "Kategori" },
            { key: "status", label: "Status", render: (r) => <StatusPill statusKey={r.status} rejectedBy={r.rejectedBy} /> },
          ]}
          onRowClick={openItem}
          emptyLabel={
            tab === "masuk" ? "Belum ada paket pembayaran baru masuk." :
            tab === "disetujui" ? "Belum ada paket yang disetujui." :
            tab === "ditolak" ? "Tidak ada paket yang ditolak." :
            "Belum ada paket yang selesai diproses."
          }
        />
      </Card>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail ? `Paket ${detail.idRab}` : ""} icon={Wallet} width={520}>
        {detail && liveDetail && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
              <StatusPill statusKey={liveDetail.status} rejectedBy={liveDetail.rejectedBy} />
              {liveDetail.reviewedBy && <span style={{ fontSize: 11.5, color: T.muted }}>di-review oleh <b>{liveDetail.reviewedBy}</b></span>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", rowGap: 6, columnGap: 12, fontSize: 13, marginBottom: 14 }}>
              <div style={{ color: T.muted }}>Judul Kegiatan</div>
              <div style={{ fontWeight: 600 }}>{liveDetail.judulKegiatan}</div>
              <div style={{ color: T.muted }}>Kategori</div>
              <div>{liveDetail.kategori}</div>
            </div>

            {liveDetail.checklist && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>
                  Kelengkapan Dokumen
                </div>
                <div style={{ display: "grid", gap: 5, maxHeight: 220, overflowY: "auto" }}>
                  {liveDetail.checklist.standar?.map((d) => (
                    <div key={d.nama} style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
                      borderRadius: 7, fontSize: 12.5,
                      background: d.ada ? T.successSoft : T.bg,
                      color: d.ada ? T.success : T.muted,
                    }}>
                      {d.ada ? <Check size={13} /> : <X size={13} />}
                      {d.nama}
                    </div>
                  ))}
                  {liveDetail.checklist.lainnya?.map((d) => (
                    <div key={d.id} style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
                      borderRadius: 7, fontSize: 12.5,
                      background: d.ada ? T.successSoft : T.bg,
                      color: d.ada ? T.success : T.muted,
                    }}>
                      {d.ada ? <Check size={13} /> : <X size={13} />}
                      {d.nama} <span style={{ opacity: 0.7 }}>(lainnya)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {liveDetail.reviewNote && (
              <div style={{ padding: "10px 12px", borderRadius: 8, marginBottom: 8, background: STATUS_META.rejected.bg, border: `1px solid ${STATUS_META.rejected.color}30`, color: STATUS_META.rejected.color, fontSize: 12.5 }}>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>Catatan Asman:</div>{liveDetail.reviewNote}
              </div>
            )}
            {liveDetail.processNote && (
              <div style={{ padding: "10px 12px", borderRadius: 8, marginBottom: 12, background: STATUS_META.processed.bg, border: `1px solid ${STATUS_META.processed.color}30`, color: STATUS_META.processed.color, fontSize: 12.5 }}>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>Catatan MADM:</div>{liveDetail.processNote}
              </div>
            )}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 14, borderTop: `1px solid ${T.border}`, flexWrap: "wrap" }}>
              <Button variant="ghost" onClick={() => setDetail(null)}>Tutup</Button>
              {user.role === "asman" && (liveDetail.status === DOC_STATUS.SUBMITTED || liveDetail.status === DOC_STATUS.IN_REVIEW) && (
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

      <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title="Tolak Paket Pembayaran" icon={AlertTriangle} width={440}>
        <p style={{ fontSize: 13, color: T.muted, marginBottom: 12, lineHeight: 1.6 }}>
          Isi catatan alasan penolakan. Catatan akan terlihat oleh Humas untuk direvisi dan dikirim ulang.
        </p>
        <textarea value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} rows={4}
          placeholder="Contoh: dokumen checklist belum lengkap, mohon dilengkapi kembali."
          style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.inputBg, color: T.text, fontSize: 13, fontFamily: font.body, resize: "vertical" }} />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
          <Button variant="ghost" onClick={() => setRejectOpen(false)}>Batal</Button>
          <Button variant="accent" icon={X} onClick={doReject} disabled={!rejectNote.trim()}>Konfirmasi Tolak</Button>
        </div>
      </Modal>
    </div>
  );
}
