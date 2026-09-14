import { useMemo, useState } from "react";
import { Activity, Search } from "lucide-react";
import { T, font } from "../../lib/theme";
import Card from "../../components/Card";
import PageHeader from "../../components/PageHeader";

const ROLE_META = {
  humas:  { label: "Humas",  bg: "#E0F0FF", color: "#0369A1" },
  asman:  { label: "Asman",  bg: "#FEF3C7", color: "#92400E" },
  madm:   { label: "Madm",   bg: "#F3E8FF", color: "#6D28D9" },
};

function RoleBadge({ role }) {
  const meta = ROLE_META[role] || { label: role || "-", bg: T.bg, color: T.muted };
  return (
    <span style={{
      display: "inline-block", padding: "2px 9px", borderRadius: 999,
      background: meta.bg, color: meta.color,
      fontSize: 11, fontWeight: 700,
    }}>
      {meta.label}
    </span>
  );
}

function formatTs(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

export default function LogAktivitasPage({ history }) {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("semua");

  const roles = useMemo(() => {
    const s = new Set(history.map((h) => h.role).filter(Boolean));
    return Array.from(s);
  }, [history]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return history.filter((h) => {
      if (roleFilter !== "semua" && h.role !== roleFilter) return false;
      if (q && ![h.jenis, h.username, h.role].some((v) => String(v || "").toLowerCase().includes(q))) return false;
      return true;
    });
  }, [history, query, roleFilter]);

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="Log Aktivitas"
        description="Rekam jejak setiap aktivitas yang berhasil dilakukan oleh seluruh pengguna sistem, lengkap dengan timestamp dan identitas pengguna."
      />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
        {[
          { label: "Total Aktivitas", value: history.length, color: T.blue, bg: T.blueSoft },
          { label: "Hari Ini", value: history.filter((h) => h.tanggal === new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })).length, color: "#059669", bg: "#D1FAE5" },
          { label: "Pengguna Aktif", value: new Set(history.map((h) => h.username).filter((u) => u && u !== "-")).size, color: "#7C3AED", bg: "#EDE9FE" },
        ].map(({ label, value, color, bg }) => (
          <Card key={label}>
            <div style={{ fontFamily: font.display, fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>{label}</div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 240px" }}>
          <Search size={14} color={T.muted} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari aktivitas, username, atau modul…"
            style={{
              width: "100%", boxSizing: "border-box",
              height: 38, padding: "0 12px 0 34px",
              borderRadius: 8, border: `1px solid ${T.border}`,
              background: T.card, color: T.text, fontSize: 13, fontFamily: font.body,
            }}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{
            height: 38, padding: "0 10px", borderRadius: 8,
            border: `1px solid ${T.border}`, background: T.card,
            color: T.text, fontSize: 13, fontFamily: font.body,
          }}
        >
          <option value="semua">Semua role</option>
          {roles.map((r) => <option key={r} value={r}>{ROLE_META[r]?.label || r}</option>)}
        </select>
      </div>

      {/* Table */}
      <Card padded={false}>
        {rows.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center", color: T.muted }}>
            <Activity size={32} style={{ marginBottom: 10, opacity: 0.3 }} />
            <div style={{ fontSize: 13.5 }}>
              {history.length === 0
                ? "Belum ada aktivitas tercatat. Log akan muncul otomatis saat pengguna menyimpan data."
                : "Tidak ada aktivitas yang sesuai filter."}
            </div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  {["Timestamp", "Username", "Role", "Modul / Aktivitas"].map((h) => (
                    <th key={h} style={{
                      textAlign: "left", padding: "10px 16px",
                      background: T.bg, borderBottom: `1px solid ${T.border}`,
                      color: T.muted, fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((h, i) => (
                  <tr
                    key={h.id}
                    style={{ background: i % 2 ? T.rowAlt : T.card }}
                  >
                    <td style={{ padding: "11px 16px", borderBottom: `1px solid ${T.border}`, whiteSpace: "nowrap" }}>
                      <div style={{ fontFamily: font.mono, fontSize: 12, color: T.heading, fontWeight: 600 }}>
                        {formatTs(h.timestamp)}
                      </div>
                    </td>
                    <td style={{ padding: "11px 16px", borderBottom: `1px solid ${T.border}`, whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: font.mono, fontWeight: 700, fontSize: 12.5, color: T.text }}>
                        {h.username || "-"}
                      </span>
                    </td>
                    <td style={{ padding: "11px 16px", borderBottom: `1px solid ${T.border}` }}>
                      <RoleBadge role={h.role} />
                    </td>
                    <td style={{ padding: "11px 16px", borderBottom: `1px solid ${T.border}` }}>
                      <span style={{
                        display: "inline-block", padding: "3px 10px", borderRadius: 6,
                        background: T.blueSoft, color: T.blue,
                        fontSize: 12, fontWeight: 600,
                      }}>
                        {h.jenis || "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
