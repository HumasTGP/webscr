import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  Check,
  KeyRound,
  Pencil,
  ShieldAlert,
  Trash2,
  UserCog,
  UserPlus,
} from "lucide-react";
import { T, font } from "../../lib/theme";
import { isUserActive } from "../../lib/data";
import { uid } from "../../lib/utils";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";

const ACCESS_ROLES = [
  { value: "humas", label: "SAKTI - Humas" },
  { value: "asman", label: "SAKTI - Asman" },
  { value: "madm", label: "SAKTI - MADM" },
  { value: "silapak", label: "Si Lapak Priok" },
];

const MANAGED_ROLES = new Set(ACCESS_ROLES.map((item) => item.value));
const ROLE_TONE = {
  humas: { color: "#036D9A", bg: "#E5F4FA" },
  asman: { color: "#7A5600", bg: "#FFF4C7" },
  madm: { color: "#5B35A4", bg: "#EFE8FF" },
  silapak: { color: "#6A5400", bg: "#FFF7C7" },
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  borderRadius: 8,
  border: `1px solid ${T.border}`,
  background: T.card,
  color: T.text,
  fontSize: 13,
};

const labelStyle = {
  display: "block",
  fontSize: 11.5,
  color: T.muted,
  fontWeight: 700,
  marginBottom: 5,
};

const iconBtn = {
  width: 29,
  height: 29,
  display: "grid",
  placeItems: "center",
  borderRadius: 7,
  border: `1px solid ${T.border}`,
  background: T.card,
  color: T.blue,
  cursor: "pointer",
};

function dateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function oneYearFromNow() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return dateString(date);
}

function roleLabel(role) {
  return ACCESS_ROLES.find((item) => item.value === role)?.label || String(role || "-");
}

function RolePill({ role }) {
  const meta = ROLE_TONE[role] || { color: T.text, bg: T.bg };
  return (
    <span
      style={{
        display: "inline-flex",
        padding: "4px 10px",
        borderRadius: 999,
        background: meta.bg,
        color: meta.color,
        fontSize: 11.5,
        fontWeight: 800,
        whiteSpace: "nowrap",
      }}
    >
      {roleLabel(role)}
    </span>
  );
}

function StatusPill({ user }) {
  const active = isUserActive(user);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 999,
        background: active ? "#DEF6E5" : "#FCE1E1",
        color: active ? "#1E7F3E" : "#B01818",
        fontSize: 11.5,
        fontWeight: 800,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />
      {active ? "Aktif" : "Non-Aktif"}
    </span>
  );
}

function UserForm({ initial, onCancel, onSave, existingUsers }) {
  const [role, setRole] = useState(initial?.role || "humas");
  const [username, setUsername] = useState(initial?.username || "");
  const [password, setPassword] = useState(initial?.password || "");
  const [activeFrom, setActiveFrom] = useState(initial?.activeFrom || dateString());
  const [activeTo, setActiveTo] = useState(initial?.activeTo || oneYearFromNow());
  const [error, setError] = useState("");

  const submit = () => {
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();
    const users = Array.isArray(existingUsers) ? existingUsers : [];

    if (!cleanUsername) return setError("Username wajib diisi.");
    if (!cleanPassword) return setError("Password wajib diisi.");
    if (activeFrom && activeTo && activeFrom > activeTo) {
      return setError("Tanggal aktif sampai harus setelah tanggal aktif dari.");
    }
    if (
      users.some(
        (item) =>
          item?.id !== initial?.id &&
          item?.role === role &&
          String(item?.username || "").toLowerCase() === cleanUsername.toLowerCase()
      )
    ) {
      return setError(`Username ${cleanUsername} sudah digunakan pada ${roleLabel(role)}.`);
    }
    if (role === "humas" && cleanUsername.toLowerCase() === "admin") {
      return setError("Username admin dicadangkan untuk administrator SAKTI.");
    }

    onSave({
      id: initial?.id || uid("USR"),
      role,
      username: cleanUsername,
      password: cleanPassword,
      activeFrom,
      activeTo,
    });
  };

  return (
    <div>
      <div
        className="responsive-form-grid"
        style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}
      >
        <div>
          <label style={labelStyle}>Sistem / Role</label>
          <select style={inputStyle} value={role} onChange={(event) => setRole(event.target.value)}>
            {ACCESS_ROLES.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Username</label>
          <input style={inputStyle} value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Username" autoFocus />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Password</label>
          <input style={inputStyle} type="text" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" />
        </div>
        <div>
          <label style={labelStyle}><Calendar size={12} style={{ verticalAlign: -2, marginRight: 4 }} />Aktif Dari</label>
          <input style={inputStyle} type="date" value={activeFrom} onChange={(event) => setActiveFrom(event.target.value)} />
        </div>
        <div>
          <label style={labelStyle}><Calendar size={12} style={{ verticalAlign: -2, marginRight: 4 }} />Aktif Sampai</label>
          <input style={inputStyle} type="date" value={activeTo} onChange={(event) => setActiveTo(event.target.value)} />
        </div>
      </div>

      {error && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12, padding: "9px 12px", borderRadius: 8, background: "#FCE1E1", color: "#B01818", fontSize: 12.5 }}>
          <AlertTriangle size={14} />{error}
        </div>
      )}

      <div className="responsive-actions" style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
        <Button variant="ghost" onClick={onCancel}>Batal</Button>
        <Button variant="accent" icon={Check} onClick={submit}>{initial ? "Simpan Perubahan" : "Tambahkan Akun"}</Button>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, color, bg }) {
  return (
    <Card style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: bg, color, display: "grid", placeItems: "center" }}>
        <Icon size={16} />
      </div>
      <div>
        <div style={{ fontSize: 10.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.7 }}>{label}</div>
        <div style={{ fontFamily: font.body, fontSize: 20, fontWeight: 800, color: T.heading }}>{value}</div>
      </div>
    </Card>
  );
}

export default function ManajemenAksesPage({ users, setUsers, notify }) {
  const safeUsers = Array.isArray(users) ? users.filter(Boolean) : [];
  const managedUsers = useMemo(
    () => safeUsers.filter((item) => MANAGED_ROLES.has(item?.role)),
    [users]
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const stats = useMemo(() => {
    const active = managedUsers.filter((item) => isUserActive(item)).length;
    return { total: managedUsers.length, active, inactive: managedUsers.length - active };
  }, [managedUsers]);

  const filteredUsers = useMemo(() => {
    if (statusFilter === "active") return managedUsers.filter((item) => isUserActive(item));
    if (statusFilter === "inactive") return managedUsers.filter((item) => !isUserActive(item));
    return managedUsers;
  }, [managedUsers, statusFilter]);

  const saveUser = (next) => {
    if (typeof setUsers !== "function") {
      notify?.("Manajemen akun belum siap. Muat ulang halaman lalu coba lagi.", "error");
      return;
    }
    setUsers((previous) => {
      const source = Array.isArray(previous) ? previous : [];
      return source.some((item) => item?.id === next.id)
        ? source.map((item) => item?.id === next.id ? next : item)
        : [...source, next];
    });
    setFormOpen(false);
    setEditTarget(null);
    notify?.("Data akun berhasil disimpan.", "success");
  };

  const deleteUser = () => {
    if (!deleteTarget || typeof setUsers !== "function") return;
    setUsers((previous) => (Array.isArray(previous) ? previous : []).filter((item) => item?.id !== deleteTarget.id));
    notify?.(`Akun ${deleteTarget.username} dihapus.`, "success");
    setDeleteTarget(null);
  };

  const columns = useMemo(() => [
    { key: "role", label: "Sistem / Role", render: (row) => <RolePill role={row?.role} /> },
    { key: "username", label: "Username", render: (row) => <span style={{ fontFamily: font.mono, fontWeight: 700 }}>{row?.username || "-"}</span> },
    { key: "activeFrom", label: "Aktif Dari" },
    { key: "activeTo", label: "Aktif Sampai" },
    { key: "status", label: "Status", render: (row) => <StatusPill user={row} /> },
    {
      key: "aksi",
      label: "Aksi",
      render: (row) => (
        <div style={{ display: "flex", gap: 6 }}>
          <button
            type="button"
            aria-label={`Edit ${row?.username || "akun"}`}
            onClick={(event) => {
              event.stopPropagation();
              setEditTarget(row);
              setFormOpen(true);
            }}
            style={iconBtn}
          >
            <Pencil size={13} />
          </button>
          <button
            type="button"
            aria-label={`Hapus ${row?.username || "akun"}`}
            onClick={(event) => {
              event.stopPropagation();
              setDeleteTarget(row);
            }}
            style={{ ...iconBtn, color: T.danger || "#B01818" }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ], []);

  return (
    <div>
      <PageHeader
        eyebrow="Administrator SAKTI & Si Lapak Priok"
        title="Manajemen Akses"
        right={
          <Button icon={UserPlus} onClick={() => { setEditTarget(null); setFormOpen(true); }}>
            Tambah Akun
          </Button>
        }
      />

      <div className="responsive-card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10, marginBottom: 14 }}>
        <Stat icon={UserCog} label="Total Akun" value={stats.total} color={T.blue} bg={T.blueSoft} />
        <Stat icon={Check} label="Aktif" value={stats.active} color="#1E7F3E" bg="#DEF6E5" />
        <Stat icon={ShieldAlert} label="Non-Aktif" value={stats.inactive} color="#B01818" bg="#FCE1E1" />
      </div>

      <div className="responsive-actions" style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {[
          { key: "all", label: "Semua", count: stats.total },
          { key: "active", label: "Aktif", count: stats.active },
          { key: "inactive", label: "Non-Aktif", count: stats.inactive },
        ].map((filter) => (
          <button
            type="button"
            key={filter.key}
            onClick={() => setStatusFilter(filter.key)}
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              border: `1px solid ${statusFilter === filter.key ? T.blue : T.border}`,
              background: statusFilter === filter.key ? T.blueSoft : T.card,
              color: statusFilter === filter.key ? T.blue : T.muted,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {filter.label} · {filter.count}
          </button>
        ))}
      </div>

      <Card padded={false}>
        <DataTable
          rows={filteredUsers}
          columns={columns}
          searchable
          searchPlaceholder="Cari username atau role..."
          emptyLabel="Belum ada akun SAKTI / Si Lapak Priok."
          onRowClick={(row) => { setEditTarget(row); setFormOpen(true); }}
        />
      </Card>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editTarget ? `Edit Akun - ${editTarget.username}` : "Tambah Akun"}
        icon={editTarget ? KeyRound : UserPlus}
        width={520}
      >
        <UserForm
          initial={editTarget}
          onCancel={() => setFormOpen(false)}
          onSave={saveUser}
          existingUsers={managedUsers}
        />
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Akun?"
        icon={AlertTriangle}
        width={400}
      >
        {deleteTarget && (
          <>
            <p style={{ color: T.muted, lineHeight: 1.6 }}>
              Akun <b>{deleteTarget.username}</b> ({roleLabel(deleteTarget.role)}) akan dihapus.
            </p>
            <div className="responsive-actions" style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Batal</Button>
              <Button variant="accent" icon={Trash2} onClick={deleteUser}>Hapus</Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
