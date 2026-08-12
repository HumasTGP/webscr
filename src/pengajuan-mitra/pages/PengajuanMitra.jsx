import { useState } from "react";
import { CheckCircle2, XCircle, Send, Eye, Plus, ChevronRight } from "lucide-react";
import { T, font } from "../../lib/theme";
import { MITRA_STATUS, MITRA_STATUS_META } from "../../lib/data";
import { uid, rupiah } from "../../lib/utils";
import Card from "../../components/Card";
import PageHeader from "../../components/PageHeader";
import Modal from "../../components/Modal";

const STEPS = [
  { label: "Humas", key: "humas" },
  { label: "ASMAN", key: "asman" },
  { label: "MADM", key: "madm" },
  { label: "Disetujui", key: "final" },
];

function stepFromStatus(status) {
  const meta = MITRA_STATUS_META[status];
  return meta ? meta.step : 0;
}

function isRejected(status) {
  return status && status.startsWith("ditolak");
}

function StatusBadgeMitra({ status }) {
  const meta = MITRA_STATUS_META[status] || { label: status, color: "#94A3B8", bg: "#F1F5F9" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 999,
      background: meta.bg, color: meta.color,
      fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.color }} />
      {meta.label}
    </span>
  );
}

function ProgressTimeline({ timeline, currentStatus }) {
  const currentStep = stepFromStatus(currentStatus);
  const rejected = isRejected(currentStatus);

  return (
    <div style={{ padding: "8px 0", overflowX: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 20, minWidth: 360 }}>
        {STEPS.map((s, i) => {
          const done = currentStep > i + 1 || (currentStep === 4 && i === 3);
          const active = currentStep === i + 1;
          const fail = rejected && active;
          let bg = T.border;
          let fg = T.muted;
          if (done) { bg = "#1E7F3E"; fg = "#fff"; }
          else if (fail) { bg = "#B01818"; fg = "#fff"; }
          else if (active) { bg = "#0E4C92"; fg = "#fff"; }

          return (
            <div key={s.key} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 60 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: bg, color: fg,
                  display: "grid", placeItems: "center",
                  fontSize: 13, fontWeight: 700,
                  border: active ? `2px solid ${fail ? "#B01818" : "#0E4C92"}` : "none",
                }}>
                  {done ? <CheckCircle2 size={16} /> : fail ? <XCircle size={16} /> : i + 1}
                </div>
                <span style={{ fontSize: 10.5, color: active ? T.heading : T.muted, fontWeight: active ? 700 : 500, textAlign: "center" }}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  flex: 1, height: 2, margin: "0 4px",
                  background: currentStep > i + 1 ? "#1E7F3E" : T.border,
                  marginBottom: 18,
                }} />
              )}
            </div>
          );
        })}
      </div>

      {timeline && timeline.length > 0 && (
        <div style={{ borderLeft: `2px solid ${T.border}`, marginLeft: 15, paddingLeft: 18 }}>
          {timeline.map((t, i) => {
            const meta = MITRA_STATUS_META[t.status] || {};
            return (
              <div key={i} style={{ marginBottom: 14, position: "relative", minWidth: 0 }}>
                <div style={{
                  position: "absolute", left: -25, top: 3,
                  width: 10, height: 10, borderRadius: "50%",
                  background: meta.color || T.muted,
                  border: `2px solid ${T.card}`,
                }} />
                <div style={{ fontSize: 11, color: T.muted, marginBottom: 2, lineHeight: 1.45 }}>
                  {new Date(t.tanggal).toLocaleString("id-ID", {
                    weekday: "long", day: "2-digit", month: "long", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })} WIB - {t.oleh}
                </div>
                <div style={{ fontSize: 13, color: T.heading, fontWeight: 600, lineHeight: 1.45 }}>
                  {meta.label || t.status}
                </div>
                {t.catatan && (
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 2, lineHeight: 1.55, overflowWrap: "anywhere" }}>{t.catatan}</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MitraForm({ onSubmit, onClose }) {
  const [form, setForm] = useState({
    namaLembaga: "", kontakPIC: "", kontakTelp: "",
    judulPengajuan: "", nilaiDiajukan: "", deskripsi: "",
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    border: `1px solid ${T.border}`, background: T.inputBg,
    fontSize: 13, color: T.text, boxSizing: "border-box",
  };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: T.heading, marginBottom: 4, display: "block" };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      if (!form.namaLembaga || !form.judulPengajuan) return;
      onSubmit({ ...form, nilaiDiajukan: Number(form.nilaiDiajukan) || 0 });
    }}>
      <div style={{ display: "grid", gap: 14 }}>
        <div>
          <label style={labelStyle}>Nama Lembaga / Organisasi</label>
          <input style={inputStyle} value={form.namaLembaga} onChange={(e) => set("namaLembaga", e.target.value)} required />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          <div>
            <label style={labelStyle}>Kontak PIC</label>
            <input style={inputStyle} value={form.kontakPIC} onChange={(e) => set("kontakPIC", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>No. Telepon</label>
            <input style={inputStyle} value={form.kontakTelp} onChange={(e) => set("kontakTelp", e.target.value)} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Judul Pengajuan</label>
          <input style={inputStyle} value={form.judulPengajuan} onChange={(e) => set("judulPengajuan", e.target.value)} required />
        </div>
        <div>
          <label style={labelStyle}>Nilai Diajukan (Rp)</label>
          <input style={inputStyle} type="number" value={form.nilaiDiajukan} onChange={(e) => set("nilaiDiajukan", e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Deskripsi</label>
          <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={form.deskripsi} onChange={(e) => set("deskripsi", e.target.value)} />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
        <button type="button" onClick={onClose} style={{
          padding: "10px 20px", borderRadius: 8, border: `1px solid ${T.border}`,
          background: T.card, color: T.text, cursor: "pointer", fontSize: 13, fontWeight: 600,
        }}>Batal</button>
        <button type="submit" style={{
          padding: "10px 20px", borderRadius: 8, border: "none",
          background: T.blue, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600,
        }}>
          <Send size={13} style={{ marginRight: 6, verticalAlign: "middle" }} />
          Kirim Pengajuan
        </button>
      </div>
    </form>
  );
}

function ReviewPanel({ item, userRole, onApprove, onReject }) {
  const [catatan, setCatatan] = useState("");

  const canReview = (
    (userRole === "humas" && (item.status === MITRA_STATUS.MENUNGGU_HUMAS || item.status === MITRA_STATUS.DIPROSES_HUMAS)) ||
    (userRole === "asman" && (item.status === MITRA_STATUS.MENUNGGU_ASMAN || item.status === MITRA_STATUS.DIPROSES_ASMAN)) ||
    (userRole === "madm" && (item.status === MITRA_STATUS.MENUNGGU_MADM || item.status === MITRA_STATUS.DIPROSES_MADM))
  );

  if (!canReview) return null;

  return (
    <div style={{
      marginTop: 16, padding: 16, borderRadius: 10,
      background: T.blueSoft, border: `1px solid ${T.border}`,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.heading, marginBottom: 10 }}>
        Review Pengajuan GANDENG
      </div>
      <textarea
        value={catatan}
        onChange={(e) => setCatatan(e.target.value)}
        placeholder="Catatan / alasan / permintaan revisi"
        style={{
          width: "100%", padding: "10px 14px", borderRadius: 8,
          border: `1px solid ${T.border}`, background: T.inputBg,
          fontSize: 13, color: T.text, minHeight: 60, resize: "vertical",
          boxSizing: "border-box",
        }}
      />
      <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
        <button onClick={() => onApprove(catatan)} style={{
          padding: "9px 18px", borderRadius: 8, border: "none",
          background: "#1E7F3E", color: "#fff", cursor: "pointer",
          fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6,
        }}>
          <CheckCircle2 size={14} /> Setujui
        </button>
        <button onClick={() => onReject(catatan)} style={{
          padding: "9px 18px", borderRadius: 8, border: "none",
          background: "#B01818", color: "#fff", cursor: "pointer",
          fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6,
        }}>
          <XCircle size={14} /> Tolak / Kembalikan
        </button>
      </div>
    </div>
  );
}

export default function PengajuanMitraPage({ mitraList, setMitraList, user, notify, onBackToPortal }) {
  const [showForm, setShowForm] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  const handleSubmit = (data) => {
    const now = new Date().toISOString();
    const newItem = {
      id: uid("MTR"),
      ...data,
      status: MITRA_STATUS.MENUNGGU_HUMAS,
      createdAt: now,
      timeline: [
        { status: MITRA_STATUS.MENUNGGU_HUMAS, tanggal: now, oleh: "Pengaju", catatan: "Pengajuan diterima melalui GANDENG" },
      ],
    };
    setMitraList((prev) => [...prev, newItem]);
    setShowForm(false);
    if (notify) notify("Pengajuan GANDENG berhasil dikirim.", "success", "Pengajuan GANDENG baru");
  };

  const handleApprove = (item, catatan) => {
    const now = new Date().toISOString();
    const approverLabel = user?.role === "humas" ? "Humas" : user?.role === "asman" ? "ASMAN" : "MADM";
    let nextStatus;
    if (item.status === MITRA_STATUS.MENUNGGU_HUMAS || item.status === MITRA_STATUS.DIPROSES_HUMAS) {
      nextStatus = MITRA_STATUS.MENUNGGU_ASMAN;
    } else if (item.status === MITRA_STATUS.MENUNGGU_ASMAN || item.status === MITRA_STATUS.DIPROSES_ASMAN) {
      nextStatus = MITRA_STATUS.MENUNGGU_MADM;
    } else {
      nextStatus = MITRA_STATUS.DISETUJUI;
    }

    setMitraList((prev) => prev.map((m) => {
      if (m.id !== item.id) return m;
      return {
        ...m,
        status: nextStatus,
        timeline: [...(m.timeline || []), {
          status: nextStatus, tanggal: now, oleh: approverLabel,
          catatan: catatan || `Disetujui oleh ${approverLabel}`,
        }],
      };
    }));
    setDetailItem(null);
    if (notify) notify(`Pengajuan ${item.id} disetujui oleh ${approverLabel}.`, "success");
  };

  const handleReject = (item, catatan) => {
    const now = new Date().toISOString();
    const approverLabel = user?.role === "humas" ? "Humas" : user?.role === "asman" ? "ASMAN" : "MADM";
    let rejectStatus;
    if (item.status === MITRA_STATUS.MENUNGGU_HUMAS || item.status === MITRA_STATUS.DIPROSES_HUMAS) {
      rejectStatus = MITRA_STATUS.DITOLAK_HUMAS;
    } else if (item.status === MITRA_STATUS.MENUNGGU_ASMAN || item.status === MITRA_STATUS.DIPROSES_ASMAN) {
      rejectStatus = MITRA_STATUS.DITOLAK_ASMAN;
    } else {
      rejectStatus = MITRA_STATUS.DITOLAK_MADM;
    }

    setMitraList((prev) => prev.map((m) => {
      if (m.id !== item.id) return m;
      return {
        ...m,
        status: rejectStatus,
        timeline: [...(m.timeline || []), {
          status: rejectStatus, tanggal: now, oleh: approverLabel,
          catatan: catatan || `Ditolak / dikembalikan oleh ${approverLabel}`,
        }],
      };
    }));
    setDetailItem(null);
    if (notify) notify(`Pengajuan ${item.id} dikembalikan / ditolak.`, "error");
  };

  return (
    <div style={{ fontFamily: font.body, minWidth: 0 }}>
      <PageHeader
        eyebrow="GANDENG"
        title="Pengajuan GANDENG"
        description="Pengajuan proposal dari masyarakat/vendor dengan alur pemeriksaan Humas → ASMAN → MADM. Catatan review tetap tersimpan pada tracking pengajuan."
      />

      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <button
          onClick={() => setShowForm(true)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "10px 18px", borderRadius: 8, border: "none",
            background: T.blue, color: "#fff", cursor: "pointer",
            fontSize: 13, fontWeight: 600,
          }}
        >
          <Plus size={15} /> Buat Pengajuan Baru
        </button>
        {onBackToPortal && (
          <button
            onClick={onBackToPortal}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "10px 18px", borderRadius: 8,
              border: `1px solid ${T.border}`, background: T.card,
              color: T.text, cursor: "pointer", fontSize: 13, fontWeight: 600,
            }}
          >
            Kembali ke Portal
          </button>
        )}
      </div>

      {mitraList.length === 0 ? (
        <Card>
          <div style={{ padding: "32px 0", textAlign: "center", color: T.muted, fontSize: 14, lineHeight: 1.6 }}>
            Belum ada pengajuan GANDENG. Klik "Buat Pengajuan Baru" untuk memulai.
          </div>
        </Card>
      ) : (
        <Card padded={false}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: 720, borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: T.bg }}>
                  {["ID", "Lembaga", "Judul Pengajuan", "Nilai", "Status", ""].map((h) => (
                    <th key={h} style={{
                      padding: "12px 16px", textAlign: "left", fontWeight: 700,
                      color: T.heading, borderBottom: `1px solid ${T.border}`,
                      fontSize: 11.5, letterSpacing: 0.3, textTransform: "uppercase",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mitraList.map((m) => (
                  <tr
                    key={m.id}
                    style={{ cursor: "pointer", transition: "background .1s ease" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = T.blueSoft)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    onClick={() => setDetailItem(m)}
                  >
                    <td style={{ padding: "13px 16px", borderBottom: `1px solid ${T.border}`, fontFamily: font.mono, fontWeight: 700, fontSize: 12 }}>{m.id}</td>
                    <td style={{ padding: "13px 16px", borderBottom: `1px solid ${T.border}` }}>{m.namaLembaga}</td>
                    <td style={{ padding: "13px 16px", borderBottom: `1px solid ${T.border}`, maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.judulPengajuan}</td>
                    <td style={{ padding: "13px 16px", borderBottom: `1px solid ${T.border}`, whiteSpace: "nowrap" }}>{m.nilaiDiajukan ? rupiah(m.nilaiDiajukan) : "-"}</td>
                    <td style={{ padding: "13px 16px", borderBottom: `1px solid ${T.border}` }}><StatusBadgeMitra status={m.status} /></td>
                    <td style={{ padding: "13px 16px", borderBottom: `1px solid ${T.border}` }}><ChevronRight size={14} color={T.muted} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {showForm && (
        <Modal open onClose={() => setShowForm(false)} title="Buat Pengajuan GANDENG Baru" icon={Plus} width={520}>
          <MitraForm onSubmit={handleSubmit} onClose={() => setShowForm(false)} />
        </Modal>
      )}

      {detailItem && (
        <Modal open onClose={() => setDetailItem(null)} title={`Detail Pengajuan GANDENG - ${detailItem.id}`} icon={Eye} width={560}>
          <div style={{ display: "grid", gap: 12, minWidth: 0 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: T.muted, marginBottom: 2 }}>Lembaga</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.heading, overflowWrap: "anywhere" }}>{detailItem.namaLembaga}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: T.muted, marginBottom: 2 }}>Kontak PIC</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.heading, overflowWrap: "anywhere" }}>{detailItem.kontakPIC || "-"}</div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: T.muted, marginBottom: 2 }}>Judul Pengajuan</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.heading, lineHeight: 1.5, overflowWrap: "anywhere" }}>{detailItem.judulPengajuan}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: T.muted, marginBottom: 2 }}>Nilai Diajukan</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.heading }}>{detailItem.nilaiDiajukan ? rupiah(detailItem.nilaiDiajukan) : "-"}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: T.muted, marginBottom: 2 }}>Status</div>
                <StatusBadgeMitra status={detailItem.status} />
              </div>
            </div>
            {detailItem.deskripsi && (
              <div>
                <div style={{ fontSize: 11, color: T.muted, marginBottom: 2 }}>Deskripsi</div>
                <div style={{ fontSize: 13, color: T.text, lineHeight: 1.6, overflowWrap: "anywhere" }}>{detailItem.deskripsi}</div>
              </div>
            )}

            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.heading, marginBottom: 12 }}>Tracking Proses</div>
              <ProgressTimeline timeline={detailItem.timeline} currentStatus={detailItem.status} />
            </div>

            <ReviewPanel
              item={detailItem}
              userRole={user?.role}
              onApprove={(catatan) => handleApprove(detailItem, catatan)}
              onReject={(catatan) => handleReject(detailItem, catatan)}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
