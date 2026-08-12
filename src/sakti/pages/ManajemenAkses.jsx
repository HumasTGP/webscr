import { useMemo, useState } from "react";
import { AlertTriangle, Calendar, Check, KeyRound, Pencil, ShieldAlert, Trash2, UserCog, UserPlus } from "lucide-react";
import { T, font } from "../../lib/theme";
import { isUserActive, localDateStr } from "../../lib/data";
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
const MANAGED_ROLES = new Set(ACCESS_ROLES.map((r) => r.value));
const ROLE_TONE = {
  humas: { color: "#036D9A", bg: "#E5F4FA" },
  asman: { color: "#7A5600", bg: "#FFF4C7" },
  madm: { color: "#5B35A4", bg: "#EFE8FF" },
  silapak: { color: "#6A5400", bg: "#FFF7C7" },
};

function roleLabel(role) {
  return ACCESS_ROLES.find((r) => r.value === role)?.label || role;
}
function RolePill({ role }) {
  const meta = ROLE_TONE[role] || { color: T.text, bg: T.bg };
  return <span style={{ padding: "4px 10px", borderRadius: 999, background: meta.bg, color: meta.color, fontSize: 11.5, fontWeight: 800, whiteSpace: "nowrap" }}>{roleLabel(role)}</span>;
}
function StatusPill({ user }) {
  const active = isUserActive(user);
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, background: active ? "#DEF6E5" : "#FCE1E1", color: active ? "#1E7F3E" : "#B01818", fontSize: 11.5, fontWeight: 800 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />{active ? "Aktif" : "Non-Aktif"}</span>;
}

const inputStyle = { width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.inputBg, color: T.text, fontSize: 13 };
const labelStyle = { display: "block", fontSize: 11.5, color: T.muted, fontWeight: 700, marginBottom: 5 };
function todayStr() { return localDateStr(new Date()); }
function plusYearStr() { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return localDateStr(d); }

function UserForm({ initial, onCancel, onSave, existingUsers }) {
  const [role, setRole] = useState(initial?.role || "humas");
  const [username, setUsername] = useState(initial?.username || "");
  const [password, setPassword] = useState(initial?.password || "");
  const [activeFrom, setActiveFrom] = useState(initial?.activeFrom || todayStr());
  const [activeTo, setActiveTo] = useState(initial?.activeTo || plusYearStr());
  const [err, setErr] = useState("");

  const submit = () => {
    const cleanUser = username.trim();
    if (!cleanUser) return setErr("Username wajib diisi.");
    if (!password.trim()) return setErr("Password wajib diisi.");
    if (activeFrom && activeTo && activeFrom > activeTo) return setErr("Tanggal aktif sampai harus setelah tanggal aktif dari.");
    if (existingUsers.some((u) => u.id !== initial?.id && u.role === role && u.username === cleanUser)) return setErr(`Username ${cleanUser} sudah digunakan pada role ${roleLabel(role)}.`);
    if (role === "humas" && cleanUser.toLowerCase() === "admin") return setErr("Username admin dicadangkan untuk akun administrator sistem.");
    onSave({ id: initial?.id || uid("USR"), role, username: cleanUser, password, activeFrom, activeTo });
  };

  return <div>
    <div className="responsive-form-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
      <div><label style={labelStyle}>Sistem / Role</label><select style={inputStyle} value={role} onChange={(e) => setRole(e.target.value)}>{ACCESS_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}</select></div>
      <div><label style={labelStyle}>Username</label><input style={inputStyle} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" autoFocus /></div>
      <div style={{ gridColumn: "1 / -1" }}><label style={labelStyle}>Password</label><input style={inputStyle} type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" /></div>
      <div><label style={labelStyle}><Calendar size={12} style={{ verticalAlign: -2, marginRight: 4 }} />Aktif Dari</label><input style={inputStyle} type="date" value={activeFrom} onChange={(e) => setActiveFrom(e.target.value)} /></div>
      <div><label style={labelStyle}><Calendar size={12} style={{ verticalAlign: -2, marginRight: 4 }} />Aktif Sampai</label><input style={inputStyle} type="date" value={activeTo} onChange={(e) => setActiveTo(e.target.value)} /></div>
    </div>
    {err && <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12, padding: "9px 12px", borderRadius: 8, background: "#FCE1E1", color: "#B01818", fontSize: 12.5 }}><AlertTriangle size={14} />{err}</div>}
    <div className="responsive-actions" style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}><Button variant="ghost" onClick={onCancel}>Batal</Button><Button variant="accent" icon={Check} onClick={submit}>{initial ? "Simpan Perubahan" : "Tambahkan Akun"}</Button></div>
  </div>;
}

export default function ManajemenAksesPage({ users, setUsers, notify }) {
  const managedUsers = useMemo(() => users.filter((u) => MANAGED_ROLES.has(u.role)), [users]);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const stats = useMemo(() => ({
    total: managedUsers.length,
    active: managedUsers.filter(isUserActive).length,
    inactive: managedUsers.filter((u) => !isUserActive(u)).length,
  }), [managedUsers]);
  const filteredUsers = useMemo(() => statusFilter === "active" ? managedUsers.filter(isUserActive) : statusFilter === "inactive" ? managedUsers.filter((u) => !isUserActive(u)) : managedUsers, [managedUsers, statusFilter]);

  const saveUser = (next) => {
    setUsers((prev) => prev.some((u) => u.id === next.id) ? prev.map((u) => u.id === next.id ? next : u) : [...prev, next]);
    setFormOpen(false); setEditTarget(null); notify?.("Data akun berhasil disimpan.", "success");
  };
  const doDelete = () => {
    if (!deleteTarget) return;
    setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    notify?.(`Akun ${deleteTarget.username} dihapus.`, "success");
    setDeleteTarget(null);
  };

  const columns = [
    { key: "role", label: "Sistem / Role", render: (r) => <RolePill role={r.role} /> },
    { key: "username", label: "Username", render: (r) => <span style={{ fontFamily: font.mono, fontWeight: 700 }}>{r.username}</span> },
    { key: "activeFrom", label: "Aktif Dari" }, { key: "activeTo", label: "Aktif Sampai" },
    { key: "status", label: "Status", render: (r) => <StatusPill user={r} /> },
    { key: "aksi", label: "Aksi", render: (r) => <div style={{ display: "flex", gap: 6 }}><button onClick={(e) => { e.stopPropagation(); setEditTarget(r); setFormOpen(true); }} style={iconBtn}><Pencil size={13} /></button><button onClick={(e) => { e.stopPropagation(); setDeleteTarget(r); }} style={{ ...iconBtn, color: T.danger }}><Trash2 size={13} /></button></div> },
  ];

  return <div>
    <PageHeader eyebrow="Administrator SAKTI & Si Lapak Priok" title="Manajemen Akses" description="Kelola akun SAKTI (Humas, Asman, MADM) dan Si Lapak Priok. Akun GANDENG dikelola terpisah di dalam GANDENG." right={<Button icon={UserPlus} onClick={() => { setEditTarget(null); setFormOpen(true); }}>Tambah Akun</Button>} />
    <div className="responsive-card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10, marginBottom: 14 }}>
      <Stat icon={UserCog} label="Total Akun" value={stats.total} color={T.blue} bg={T.blueSoft} />
      <Stat icon={Check} label="Aktif" value={stats.active} color="#1E7F3E" bg="#DEF6E5" />
      <Stat icon={ShieldAlert} label="Non-Aktif" value={stats.inactive} color="#B01818" bg="#FCE1E1" />
    </div>
    <div className="responsive-actions" style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>{[{key:"all",label:"Semua",count:stats.total},{key:"active",label:"Aktif",count:stats.active},{key:"inactive",label:"Non-Aktif",count:stats.inactive}].map((f) => <button key={f.key} onClick={() => setStatusFilter(f.key)} style={{ padding: "8px 14px", borderRadius: 999, border: `1px solid ${statusFilter === f.key ? T.blue : T.border}`, background: statusFilter === f.key ? T.blueSoft : T.card, color: statusFilter === f.key ? T.blue : T.muted, fontWeight: 700, cursor: "pointer" }}>{f.label} · {f.count}</button>)}</div>
    <Card padded={false}><DataTable rows={filteredUsers} columns={columns} searchable emptyLabel="Belum ada akun SAKTI / Si Lapak Priok." onRowClick={(r) => { setEditTarget(r); setFormOpen(true); }} /></Card>
    <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editTarget ? `Edit Akun - ${editTarget.username}` : "Tambah Akun"} icon={editTarget ? KeyRound : UserPlus} width={520}><UserForm initial={editTarget} onCancel={() => setFormOpen(false)} onSave={saveUser} existingUsers={managedUsers} /></Modal>
    <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Hapus Akun?" icon={AlertTriangle} width={400}>{deleteTarget && <><p style={{ color: T.muted, lineHeight: 1.6 }}>Akun <b>{deleteTarget.username}</b> ({roleLabel(deleteTarget.role)}) akan dihapus.</p><div className="responsive-actions" style={{ display:"flex",gap:10,justifyContent:"flex-end" }}><Button variant="ghost" onClick={() => setDeleteTarget(null)}>Batal</Button><Button variant="accent" icon={Trash2} onClick={doDelete}>Hapus</Button></div></>}</Modal>
  </div>;
}

function Stat({ icon: Icon, label, value, color, bg }) { return <Card style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 34, height: 34, borderRadius: 9, background: bg, color, display: "grid", placeItems: "center" }}><Icon size={16} /></div><div><div style={{ fontSize: 10.5, color: T.muted, textTransform: "uppercase", letterSpacing: .7 }}>{label}</div><div style={{ fontFamily: font.display, fontSize: 20, fontWeight: 800, color: T.heading }}>{value}</div></div></Card>; }
const iconBtn = { width: 29, height: 29, display: "grid", placeItems: "center", borderRadius: 7, border: `1px solid ${T.border}`, background: T.card, color: T.blue, cursor: "pointer" };
