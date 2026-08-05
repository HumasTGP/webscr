import { useState, useEffect } from "react";
import { FileText, Clock, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
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
    <div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginBottom: 2 }}>
        {tanggal}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>
        {jam} <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.55)" }}>WIB</span>
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
      padding: "18px 20px",
      display: "flex",
      alignItems: "center",
      gap: 14,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: bg, display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: T.heading }}>{value}</div>
        <div style={{ fontSize: 12, color: T.muted, marginTop: 1 }}>{label}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const meta = MITRA_STATUS_META[status] || { label: status, color: "#94A3B8", bg: "#F1F5F9" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 9px", borderRadius: 999,
      background: meta.bg, color: meta.color,
      fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: meta.color }} />
      {meta.label}
    </span>
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
    <div style={{ fontFamily: font.body, padding: "28px 32px", maxWidth: 1000 }}>
      {/* Hero Banner */}
      <div style={{
        background: "linear-gradient(135deg, #0A1628 0%, #0E4C92 100%)",
        borderRadius: 16,
        padding: "28px 32px",
        marginBottom: 28,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 20,
        flexWrap: "wrap",
        boxShadow: "0 8px 32px rgba(10,22,40,0.2)",
      }}>
        <div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 4 }}>
            {getGreeting()}, <strong style={{ color: "#FFC72C" }}>{user?.name || "Mitra"}</strong>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 2 }}>
            Selamat datang di Portal Mitra
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
            Pantau dan kelola pengajuan kerjasama Anda di sini.
          </div>
        </div>
        <LiveClock />
      </div>

      {/* Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 14,
        marginBottom: 28,
      }}>
        <StatCard label="Total Pengajuan" value={total} icon={FileText} color="#0E4C92" bg="#DEEBFA" />
        <StatCard label="Diproses" value={diproses} icon={Clock} color="#8A6D00" bg="#FFF4D0" />
        <StatCard label="Disetujui" value={disetujui} icon={CheckCircle2} color="#1E7F3E" bg="#DEF6E5" />
        <StatCard label="Ditolak" value={ditolak} icon={XCircle} color="#B01818" bg="#FCE1E1" />
      </div>

      {/* Recent Activity */}
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
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.heading }}>
            Pengajuan Terbaru
          </div>
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
          <div style={{ padding: "32px 20px", textAlign: "center", color: T.muted, fontSize: 13 }}>
            Belum ada pengajuan. Buat pengajuan baru untuk memulai.
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
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.heading, marginBottom: 2 }}>
                    {m.judulPengajuan}
                  </div>
                  <div style={{ fontSize: 11, color: T.muted }}>
                    {m.namaLembaga} &bull; {m.nilaiDiajukan ? rupiah(m.nilaiDiajukan) : "-"}
                  </div>
                </div>
                <StatusBadge status={m.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
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
