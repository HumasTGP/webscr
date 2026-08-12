import { useState, useEffect } from "react";
import { FileText, Clock, CheckCircle2, XCircle, ArrowRight, Send } from "lucide-react";
import { T, font } from "../../lib/theme";
import { MITRA_STATUS_META } from "../../lib/data";
import { rupiah } from "../../lib/utils";

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const tanggal = now.toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const jam = now.toLocaleTimeString("id-ID", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.72)", marginBottom: 2, lineHeight: 1.45 }}>
        {tanggal}
      </div>
      <div style={{ fontSize: "clamp(22px, 4vw, 28px)", fontWeight: 800, color: "#fff", letterSpacing: -0.5, lineHeight: 1.15 }}>
        {jam} <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.62)" }}>WIB</span>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 11) return "Selamat Pagi";
  if (h < 15) return "Selamat Siang";
  if (h < 18) return "Selamat Sore";
  return "Selamat Malam";
}

function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div style={{
      background: T.card,
      border: `1px solid ${T.border}`,
      borderRadius: 12,
      padding: "16px 18px",
      display: "flex",
      alignItems: "center",
      gap: 12,
      minWidth: 0,
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 10,
        background: bg, display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={19} color={color} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: T.heading }}>{value}</div>
        <div style={{ fontSize: 12, color: T.muted, marginTop: 1, lineHeight: 1.35 }}>{label}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const meta = MITRA_STATUS_META[status] || { label: status, color: "#94A3B8", bg: "#F1F5F9" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 9px", borderRadius: 999,
      background: meta.bg, color: meta.color,
      fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: meta.color }} />
      {meta.label}
    </span>
  );
}

function FlowCard() {
  const steps = ["Pengajuan", "Humas", "ASMAN", "MADM", "Selesai"];
  return (
    <div style={{
      background: T.card,
      border: `1px solid ${T.border}`,
      borderRadius: 12,
      padding: "16px 18px",
      marginBottom: 22,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.heading, marginBottom: 12 }}>Alur Pengajuan GANDENG</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
        {steps.map((step, index) => (
          <div key={step} style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "7px 10px", borderRadius: 8,
              background: index === 0 ? T.blueSoft : T.bg,
              border: `1px solid ${T.border}`,
              color: index === 0 ? T.blue : T.text,
              fontSize: 11.5, fontWeight: 700,
            }}>
              {index === 0 && <Send size={13} />}{step}
            </div>
            {index < steps.length - 1 && <ArrowRight size={13} color={T.muted} />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MitraDashboard({ mitraList, user, onGoto }) {
  const total = mitraList.length;
  const diproses = mitraList.filter((m) => m.status && m.status.startsWith("diproses")).length;
  const disetujui = mitraList.filter((m) => m.status === "disetujui").length;
  const ditolak = mitraList.filter((m) => m.status && m.status.startsWith("ditolak")).length;

  const recent = [...mitraList]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 3);

  return (
    <div style={{
      fontFamily: font.body,
      padding: "clamp(18px, 3vw, 28px) clamp(16px, 4vw, 32px)",
      maxWidth: 1100,
      width: "100%",
      boxSizing: "border-box",
    }}>
      <div style={{
        background: "linear-gradient(135deg, #0A1628 0%, #0E4C92 100%)",
        borderRadius: 16,
        padding: "clamp(20px, 4vw, 28px) clamp(20px, 4vw, 32px)",
        marginBottom: 22,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 20,
        flexWrap: "wrap",
        boxShadow: "0 8px 32px rgba(10,22,40,0.2)",
      }}>
        <div style={{ minWidth: 0, flex: "1 1 320px" }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginBottom: 5, lineHeight: 1.45 }}>
            {getGreeting()}, <strong style={{ color: "#FFC72C" }}>{user?.name || "Pengguna"}</strong>
          </div>
          <div style={{ fontSize: "clamp(19px, 3vw, 23px)", fontWeight: 800, color: "#fff", marginBottom: 5, lineHeight: 1.25 }}>
            Selamat datang di GANDENG
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.62)", lineHeight: 1.6, maxWidth: 560 }}>
            Ajukan proposal dan pantau proses pemeriksaan dari Humas, ASMAN, sampai MADM tanpa mengubah data pengajuan yang sudah dikirim.
          </div>
        </div>
        <LiveClock />
      </div>

      <FlowCard />

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
        gap: 14,
        marginBottom: 22,
      }}>
        <StatCard label="Total Pengajuan" value={total} icon={FileText} color="#0E4C92" bg="#DEEBFA" />
        <StatCard label="Sedang Diproses" value={diproses} icon={Clock} color="#8A6D00" bg="#FFF4D0" />
        <StatCard label="Disetujui" value={disetujui} icon={CheckCircle2} color="#1E7F3E" bg="#DEF6E5" />
        <StatCard label="Perlu Revisi / Ditolak" value={ditolak} icon={XCircle} color="#B01818" bg="#FCE1E1" />
      </div>

      <div style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        overflow: "hidden",
      }}>
        <div style={{
          padding: "16px 20px",
          borderBottom: `1px solid ${T.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.heading }}>Pengajuan Terbaru</div>
          <button
            onClick={() => onGoto("riwayat")}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              background: "none", border: "none",
              color: T.blue, cursor: "pointer",
              fontSize: 12, fontWeight: 600,
              fontFamily: font.body,
            }}
          >
            Lihat semua <ArrowRight size={13} />
          </button>
        </div>

        {recent.length === 0 ? (
          <div style={{ padding: "32px 20px", textAlign: "center", color: T.muted, fontSize: 13, lineHeight: 1.6 }}>
            Belum ada pengajuan. Buat pengajuan baru untuk memulai proses GANDENG.
          </div>
        ) : (
          <div>
            {recent.map((m, i) => (
              <div
                key={m.id}
                style={{
                  padding: "14px 20px",
                  borderBottom: i < recent.length - 1 ? `1px solid ${T.border}` : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ minWidth: 0, flex: "1 1 260px" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.heading, marginBottom: 3, lineHeight: 1.45, overflowWrap: "anywhere" }}>
                    {m.judulPengajuan}
                  </div>
                  <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.5, overflowWrap: "anywhere" }}>
                    {m.namaLembaga} &bull; {m.nilaiDiajukan ? rupiah(m.nilaiDiajukan) : "-"}
                  </div>
                </div>
                <StatusBadge status={m.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
        <button
          onClick={() => onGoto("pengajuan-baru")}
          style={{
            padding: "11px 20px", borderRadius: 8, border: "none",
            background: "#0E4C92", color: "#fff",
            cursor: "pointer", fontSize: 13, fontWeight: 600,
            fontFamily: font.body,
          }}
        >
          + Buat Pengajuan Baru
        </button>
        <button
          onClick={() => onGoto("tracking")}
          style={{
            padding: "11px 20px", borderRadius: 8,
            border: `1px solid ${T.border}`,
            background: T.card, color: T.text,
            cursor: "pointer", fontSize: 13, fontWeight: 600,
            fontFamily: font.body,
          }}
        >
          Tracking Status
        </button>
      </div>
    </div>
  );
}
