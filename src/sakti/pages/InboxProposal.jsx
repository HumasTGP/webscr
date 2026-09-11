import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle, ArrowRight, Check, Eye, Handshake, X,
} from "lucide-react";
import { T, font } from "../../lib/theme";
import { DOC_STATUS, STATUS_META } from "../../lib/data";
import { buildSignatureStamp, hasSavedSignature } from "../../lib/signature";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import { proposalDocuments } from "../../lib/recordLinks";
import { bastStepFields, paktaStepFields } from "../../lib/wizardFields";
import SignaturePanel from "../../components/SignaturePanel";

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

// Dot status TTD kecil untuk kolom tabel - pola sama seperti TtdDot di
// RAB.jsx, ditulis ulang di sini (bukan diimpor dari RAB.jsx) biar dua
// halaman ini tidak saling coupling satu sama lain.
function TtdDotInline({ signed }) {
  return (
    <span
      title={signed ? "Sudah tanda tangan" : "Belum tanda tangan"}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 20, height: 20, borderRadius: "50%", fontSize: 11, fontWeight: 700,
        background: signed ? "#DEF6E5" : "#EEF0F3",
        color: signed ? "#1E7F3E" : "#9AA3AD",
      }}
    >
      {signed ? "✓" : "•"}
    </span>
  );
}

// Tombol kecil untuk kolom tabel - dipakai untuk quick TTD dan See More
// (pola sama seperti IconBtn di RAB.jsx, ditulis ulang di sini biar dua
// halaman ini tidak saling coupling).
function IconBtn({ children, onClick, title }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "4px 8px", borderRadius: 6, border: `1px solid ${T.border}`,
        background: T.card, color: T.muted, cursor: "pointer", fontSize: 11.5,
      }}
    >
      {children}
    </button>
  );
}

export default function InboxProposalPage({ user, proposals, onUpdateProposal, notify, signProposal, openTargetId, onConsumeOpenTarget, evaluasiList = [] }) {
  const [tab, setTab] = useState("masuk");
  const [detail, setDetail] = useState(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState("");

  // Deep-link dari notifikasi (lihat App.jsx openNotificationTarget) - begitu
  // openTargetId cocok dengan salah satu id Proposal, otomatis buka
  // detailnya, bukan cuma pindah ke halaman Inbox Proposal doang. One-shot:
  // begitu berhasil dibuka, minta App.jsx bersihkan openTargetId
  // (onConsumeOpenTarget) supaya balik ke halaman ini lewat menu biasa nanti
  // tidak otomatis buka detail yang sama lagi.
  useEffect(() => {
    if (!openTargetId) return;
    const found = proposals.find((p) => p.id === openTargetId);
    if (found) {
      setDetail(found);
      onConsumeOpenTarget?.();
    }
  }, [openTargetId, proposals]);

  // Form Evaluasi terkait Proposal ini - relasinya lewat proposalId, dipakai
  // di panel detail untuk menampilkan skor/keputusan evaluasi yang sudah
  // diisi Humas.
  const evaluasiByProposalId = useMemo(() => {
    const map = {};
    evaluasiList.forEach((e) => { map[e.proposalId] = e; });
    return map;
  }, [evaluasiList]);

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

  // Tempel tanda tangan tersimpan user ke Proposal - pola SAMA PERSIS seperti
  // quickSign di RAB.jsx (lihat lib/signature.js). Ini TAMBAHAN di samping
  // flow Setujui/Tolak/Proses lama, bukan pengganti - keduanya tetap ada.
  // Kondisi kapan Asman/MADM BOLEH menandatangani sebuah Proposal - dipakai
  // konsisten di 3 tempat (kolom tabel, SignaturePanel, dan guard di
  // quickSignProposal itu sendiri) supaya tidak ada celah. Proposal yang
  // sudah Ditolak/Diproses TIDAK BOLEH ditandatangani lagi - sebelumnya
  // cuma cek signature kosong tanpa cek status sama sekali.
  const canSignProposalAsman = (p) =>
    user.role === "asman" &&
    (p.status === DOC_STATUS.SUBMITTED || p.status === DOC_STATUS.IN_REVIEW) &&
    !p.signatureAsman;

  const canSignProposalMadm = (p) =>
    user.role === "madm" &&
    p.status === DOC_STATUS.APPROVED &&
    !!p.signatureAsman &&
    !p.signatureMadm;

  const quickSignProposal = (p, stage) => {
    // Guard tambahan - kalau dipanggil di luar kondisi yang seharusnya
    // (misal race condition status berubah), tetap tidak akan menandatangani.
    if (stage === "asman" && !canSignProposalAsman(p)) {
      notify?.(`Proposal ${p.id} tidak bisa ditandatangani sekarang (status: ${STATUS_META[p.status]?.label || p.status}).`, "error");
      return;
    }
    if (stage === "madm" && !canSignProposalMadm(p)) {
      notify?.(`Proposal ${p.id} tidak bisa ditandatangani sekarang (status: ${STATUS_META[p.status]?.label || p.status}).`, "error");
      return;
    }
    if (!hasSavedSignature(user)) {
      notify?.("Belum ada tanda tangan tersimpan di profil kamu. Unggah dulu di Pengaturan Profil.", "error");
      return;
    }
    const stamp = buildSignatureStamp(user);
    signProposal?.(p.id, stage, stamp);
    notify?.(`Proposal ${p.id} berhasil ditandatangani.`, "success");
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
            // TTD Asman/MADM (poin 1, 3) - SAMA PERSIS pola RAB: quick sign
            // langsung di tabel (bukan cuma dot status), stopPropagation
            // supaya klik tombol TTD tidak ikut membuka modal See More.
            ...[["evaluasi", "Form Evaluasi"], ["bast", "BAST"], ["pi", "PI"]].map(([key, label]) => ({
              key, label, render: (r) => <span title={proposalDocuments(r, evaluasiList)[key] ? "Tersedia" : "Belum tersedia"}>{proposalDocuments(r, evaluasiList)[key] ? "✓" : "—"}</span>,
            })),
            { key: "ttdAsman", label: "TTD Asman", render: (r) => (
              <span onClick={(e) => e.stopPropagation()}>
                {canSignProposalAsman(r) ? (
                  <IconBtn title="Tanda tangan sebagai Asman" onClick={() => quickSignProposal(r, "asman")}><Check size={13} /></IconBtn>
                ) : (
                  <TtdDotInline signed={!!r.signatureAsman} />
                )}
              </span>
            ) },
            { key: "ttdMadm", label: "TTD MADM", render: (r) => (
              <span onClick={(e) => e.stopPropagation()}>
                {canSignProposalMadm(r) ? (
                  <IconBtn title="Tanda tangan sebagai MADM" onClick={() => quickSignProposal(r, "madm")}><Check size={13} /></IconBtn>
                ) : (
                  <TtdDotInline signed={!!r.signatureMadm} />
                )}
              </span>
            ) },
            // See More sebagai tombol eksplisit (poin 3) - sebelumnya cuma
            // klik baris tanpa indikator visual bahwa ada detail yang bisa
            // dibuka. Tetap stopPropagation biar tidak dobel trigger.
            { key: "seeMore", label: "", render: (r) => (
              <span onClick={(e) => e.stopPropagation()}>
                <IconBtn title="Lihat selengkapnya" onClick={() => openItem(r)}><Eye size={13} /> See More</IconBtn>
              </span>
            ) },
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
              fontFamily: font.mono, fontSize: 10.5, letterSpacing: 1.2, textTransform: "uppercase",
              color: T.muted, margin: "4px 0 8px",
            }}>Informasi Proposal</div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "140px 1fr",
              rowGap: 6, columnGap: 12,
              fontSize: 13, marginBottom: 16,
            }}>
              <div style={{ color: T.muted }}>Tanggal Masuk</div>
              <div>{liveDetail.tanggalMasuk ? new Date(liveDetail.tanggalMasuk).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}</div>
              <div style={{ color: T.muted }}>Instansi</div>
              <div style={{ fontWeight: 600 }}>{liveDetail.namaLembaga || "-"}</div>
              <div style={{ color: T.muted }}>Sumber Pengaju</div>
              <div>{liveDetail.sumberPengaju || "-"}</div>
              <div style={{ color: T.muted }}>Judul Proposal</div>
              <div>{liveDetail.judulProposal || "-"}</div>
              <div style={{ color: T.muted }}>Program</div>
              <div>{liveDetail.jenisProgram || "-"}{liveDetail.subprogram ? ` / ${liveDetail.subprogram}` : ""}</div>
              {liveDetail.nilaiDiajukan != null && (
                <>
                  <div style={{ color: T.muted }}>Nilai Diajukan</div>
                  <div style={{ fontWeight: 700 }}>Rp{Number(liveDetail.nilaiDiajukan).toLocaleString("id-ID")}</div>
                </>
              )}
              {(liveDetail.kontakPIC || liveDetail.kontakTelp || liveDetail.kontakEmail) && (
                <>
                  <div style={{ color: T.muted }}>Kontak</div>
                  <div>
                    {liveDetail.kontakPIC || "-"}
                    {liveDetail.kontakTelp && <div style={{ fontSize: 12, color: T.muted }}>{liveDetail.kontakTelp}</div>}
                    {liveDetail.kontakEmail && <div style={{ fontSize: 12, color: T.muted }}>{liveDetail.kontakEmail}</div>}
                  </div>
                </>
              )}
              {liveDetail.ringkasan && (
                <>
                  <div style={{ color: T.muted }}>Ringkasan</div>
                  <div>{liveDetail.ringkasan}</div>
                </>
              )}
              {liveDetail.catatanInternal && (
                <>
                  <div style={{ color: T.muted }}>Catatan Internal</div>
                  <div>{liveDetail.catatanInternal}</div>
                </>
              )}
            </div>

            {/* Form Evaluasi (poin baru) - relasinya via proposalId, diisi
                Humas di ProposalEvaluasi.jsx, ditarik read-only di sini. */}
            {evaluasiByProposalId[liveDetail.id] && (
              <>
                <div style={{
                  fontFamily: font.mono, fontSize: 10.5, letterSpacing: 1.2, textTransform: "uppercase",
                  color: T.muted, margin: "4px 0 8px",
                }}>Form Evaluasi</div>
                <div style={{
                  border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px",
                  fontSize: 13, marginBottom: 16,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: T.muted }}>Penilai</span>
                    <span style={{ fontWeight: 600 }}>{evaluasiByProposalId[liveDetail.id].penilai}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: T.muted }}>Skor Akhir</span>
                    <span style={{ fontFamily: font.mono, fontWeight: 700 }}>{evaluasiByProposalId[liveDetail.id].skorAkhir?.toFixed?.(2) ?? evaluasiByProposalId[liveDetail.id].skorAkhir}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: T.muted }}>Keputusan</span>
                    <span style={{ fontWeight: 600 }}>{evaluasiByProposalId[liveDetail.id].keputusan}</span>
                  </div>
                  {evaluasiByProposalId[liveDetail.id].catatan && (
                    <div style={{ marginTop: 6, paddingTop: 6, borderTop: `1px solid ${T.border}`, color: T.text }}>
                      {evaluasiByProposalId[liveDetail.id].catatan}
                    </div>
                  )}
                </div>
              </>
            )}

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

            <div style={{ margin: "14px 0", fontWeight: 700 }}>Dokumen Proposal</div>
            {[["bast", "BAST", bastStepFields()], ["pi", "PI", paktaStepFields()]].map(([key, label, fields]) => {
              const record = proposalDocuments(liveDetail, evaluasiList)[key];
              return <section key={key} style={{ padding: 12, marginBottom: 10, border: `1px solid ${T.border}`, borderRadius: 8 }}>
                <div style={{ fontWeight: 700 }}>{label} {record ? "✓" : "—"}</div>
                {record ? fields.map((f) => <div key={f.key} style={{ fontSize: 12.5, marginTop: 5, overflowWrap: "anywhere" }}><span style={{ color: T.muted }}>{f.label}: </span>{record[f.key] || "—"}</div>) : <p>Belum ada record {label}.</p>}
              </section>;
            })}

            {/* TTD digital Proposal (TAMBAHAN, poin 1-2) - pola sama seperti
                RAB: quick sign pakai signature tersimpan dari Pengaturan
                Profil. Ini di SAMPING flow Setujui/Tolak/Proses lama, bukan
                pengganti - keduanya berdampingan. */}
            <SignaturePanel
              asman={liveDetail.signatureAsman}
              madm={liveDetail.signatureMadm}
              canSignAsman={canSignProposalAsman(liveDetail)}
              canSignMadm={canSignProposalMadm(liveDetail)}
              onSignAsman={() => quickSignProposal(liveDetail, "asman")}
              onSignMadm={() => quickSignProposal(liveDetail, "madm")}
            />

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
                  <Button
                    variant="accent" icon={Check} onClick={doApprove}
                    disabled={!liveDetail.signatureAsman}
                  >
                    Setujui
                  </Button>
                </>
              )}
              {user.role === "madm" && liveDetail.status === DOC_STATUS.APPROVED && (
                <>
                  <Button variant="ghost" icon={X} onClick={() => setRejectOpen(true)}>Tolak</Button>
                  <Button
                    variant="accent" icon={ArrowRight} onClick={doProcess}
                    disabled={!liveDetail.signatureMadm}
                  >
                    Tandai Telah Diproses
                  </Button>
                </>
              )}
            </div>
            {user.role === "asman" &&
              (liveDetail.status === DOC_STATUS.SUBMITTED || liveDetail.status === DOC_STATUS.IN_REVIEW) &&
              !liveDetail.signatureAsman && (
                <div style={{ textAlign: "right", fontSize: 11.5, color: T.muted, marginTop: 4 }}>
                  Tanda tangani Proposal ini dulu sebelum menyetujui.
                </div>
            )}
            {user.role === "madm" && liveDetail.status === DOC_STATUS.APPROVED && !liveDetail.signatureMadm && (
              <div style={{ textAlign: "right", fontSize: 11.5, color: T.muted, marginTop: 4 }}>
                Tanda tangani Proposal ini dulu sebelum menandai diproses.
              </div>
            )}
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
