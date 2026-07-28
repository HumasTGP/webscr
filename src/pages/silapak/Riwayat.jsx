import { useState } from "react";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { T } from "../../lib/theme";

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  border: `1px solid ${T.border}`,
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: 12,
  color: T.text,
  background: T.card,
  outline: "none",
};

export default function Riwayat({ paket, tamu, onBack, onUpdateTamu, onDeleteTamu }) {
  const [tab, setTab] = useState("paket");

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: T.muted, fontSize: 12, cursor: "pointer", marginBottom: 16, padding: 0 }}
      >
        <ArrowLeft size={14} /> Kembali
      </button>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: T.heading, margin: "0 0 16px" }}>Riwayat</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        <Tab active={tab === "paket"} onClick={() => setTab("paket")}>Paket ({paket.length})</Tab>
        <Tab active={tab === "tamu"} onClick={() => setTab("tamu")}>Kunjungan tamu ({tamu.length})</Tab>
      </div>

      {tab === "paket" ? (
        <RiwayatPaket paket={paket} />
      ) : (
        <RiwayatTamu tamu={tamu} onUpdate={onUpdateTamu} onDelete={onDeleteTamu} />
      )}
    </div>
  );
}

function Tab({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "8px 16px",
        borderRadius: 8,
        border: `1px solid ${active ? T.navy : T.border}`,
        background: active ? T.navy : T.card,
        color: active ? "#fff" : T.muted,
        fontSize: 12.5,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function RiwayatPaket({ paket }) {
  if (paket.length === 0) return <Empty text="Belum ada riwayat paket." />;
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
      <thead>
        <tr>
          <Th>Diterima</Th><Th>Penerima</Th><Th>Ekspedisi</Th><Th>Resi</Th><Th>Status</Th><Th>Pengambil</Th>
        </tr>
      </thead>
      <tbody>
        {paket.map((p) => (
          <tr key={p.id}>
            <Td>{p.diterimaTanggal}, {p.diterimaJam}</Td>
            <Td>{p.namaPenerima}</Td>
            <Td>{p.ekspedisi}</Td>
            <Td>{p.noResi}</Td>
            <Td>
              <span style={{ fontSize: 9.5, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: p.status === "Sudah Diambil" ? "#E5F6EF" : "#FDF3DD", color: p.status === "Sudah Diambil" ? "#1D9E75" : "#B7791F" }}>
                {p.status}
              </span>
            </Td>
            <Td>{p.pengambil || "-"}</Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function RiwayatTamu({ tamu, onUpdate, onDelete }) {
  const [editId, setEditId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  if (tamu.length === 0) return <Empty text="Belum ada riwayat kunjungan tamu." />;

  const startEdit = (t) => {
    setEditId(t.id);
    setDraft({ ...t });
  };
  const saveEdit = () => {
    onUpdate(draft);
    setEditId(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {tamu.map((t) => (
        <div key={t.id} style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: 14, background: T.card }}>
          {editId === t.id ? (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={{ fontSize: 10, color: T.muted, display: "block", marginBottom: 4 }}>Tanggal</label>
                  <input type="date" style={inputStyle} value={draft.tanggal} onChange={(e) => setDraft({ ...draft, tanggal: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: T.muted, display: "block", marginBottom: 4 }}>Jam</label>
                  <input type="time" style={inputStyle} value={draft.jam} onChange={(e) => setDraft({ ...draft, jam: e.target.value })} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: 10, color: T.muted, display: "block", marginBottom: 4 }}>Nama tamu</label>
                  <input style={inputStyle} value={draft.namaTamu} onChange={(e) => setDraft({ ...draft, namaTamu: e.target.value })} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: 10, color: T.muted, display: "block", marginBottom: 4 }}>Tujuan</label>
                  <input style={inputStyle} value={draft.tujuan} onChange={(e) => setDraft({ ...draft, tujuan: e.target.value })} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: 10, color: T.muted, display: "block", marginBottom: 4 }}>Pegawai dituju</label>
                  <input style={inputStyle} value={draft.pegawai} onChange={(e) => setDraft({ ...draft, pegawai: e.target.value })} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={saveEdit} style={{ padding: "7px 16px", borderRadius: 7, border: "none", background: T.navy, color: "#fff", fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>Simpan</button>
                <button type="button" onClick={() => setEditId(null)} style={{ padding: "7px 16px", borderRadius: 7, border: `1px solid ${T.border}`, background: T.card, fontSize: 11.5, cursor: "pointer" }}>Batal</button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: T.heading }}>{t.namaTamu}</div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{t.tujuan} &middot; menemui {t.pegawai}</div>
                <div style={{ fontSize: 10.5, color: T.muted, marginTop: 2 }}>{t.tanggal} &middot; {t.jam}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <IconBtn onClick={() => startEdit(t)} title="Edit"><Pencil size={13} /></IconBtn>
                <IconBtn onClick={() => setConfirmId(t.id)} title="Hapus" danger><Trash2 size={13} /></IconBtn>
              </div>
            </div>
          )}
          {confirmId === t.id && (
            <div style={{ marginTop: 10, background: "#FBE4E4", border: "1px solid #E8B4B4", borderRadius: 8, padding: 10 }}>
              <div style={{ fontSize: 11, color: "#7A1F1F", marginBottom: 8 }}>Hapus riwayat kunjungan ini?</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => { onDelete(t.id); setConfirmId(null); }} style={{ flex: 1, padding: 7, borderRadius: 6, border: "none", background: "#C43A2B", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Hapus</button>
                <button type="button" onClick={() => setConfirmId(null)} style={{ flex: 1, padding: 7, borderRadius: 6, border: `1px solid ${T.border}`, background: T.card, fontSize: 11, cursor: "pointer" }}>Batal</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Th({ children }) {
  return <th style={{ textAlign: "left", padding: "8px 10px", color: T.muted, fontWeight: 600, borderBottom: `1px solid ${T.border}`, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.03em" }}>{children}</th>;
}
function Td({ children }) {
  return <td style={{ padding: "9px 10px", borderBottom: `1px solid ${T.border}`, color: T.text }}>{children}</td>;
}
function IconBtn({ children, onClick, title, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${T.border}`, background: T.card, color: danger ? "#C43A2B" : T.muted, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
    >
      {children}
    </button>
  );
}
function Empty({ text }) {
  return <div style={{ fontSize: 12.5, color: T.muted }}>{text}</div>;
}
