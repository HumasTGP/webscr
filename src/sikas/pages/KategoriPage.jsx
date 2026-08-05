import { useState } from "react";
import { Tags } from "lucide-react";
import { T, font } from "../../lib/theme";
import { OPT } from "../../lib/data";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";

const PILL_COLOR = {
  "NON PO":    { bg: "#DEEBFA", color: "#0E4C92" },
  "Cash Card": { bg: "#FFF4D0", color: "#8A6D00" },
  "PO":        { bg: "#EBE2FF", color: "#3F1D9B" },
};

export default function KategoriPage({ rab, setRab, notify }) {
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState("");

  const startEdit = (row) => {
    setEditing(row.idNumber);
    setDraft(row.kategori || "");
  };

  const saveEdit = (idNumber) => {
    if (!draft) return notify("Pilih kategori terlebih dahulu.", "error");
    setRab((prev) =>
      prev.map((r) => r.idNumber === idNumber ? { ...r, kategori: draft } : r)
    );
    setEditing(null);
    notify(`Kategori ${idNumber} diperbarui ke ${draft}.`, "success", "Kategori");
  };

  const cancelEdit = () => setEditing(null);

  if (rab.length === 0) {
    return (
      <div style={{ padding: 32, fontFamily: font.body, color: T.text }}>
        <PageHeader title="Kategori" eyebrow="Perencanaan" icon={<Tags size={20} />} />
        <Card style={{ marginTop: 24, textAlign: "center", padding: "48px 24px", color: T.textMuted, fontSize: 14 }}>
          Belum ada data RAB. Buat RAB terlebih dahulu untuk mengatur kategori.
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 32, fontFamily: font.body, color: T.text, maxWidth: 860 }}>
      <PageHeader
        title="Kategori"
        eyebrow="Perencanaan"
        icon={<Tags size={20} />}
        description="Tetapkan jenis paket (NON PO / Cash Card / PO) untuk setiap ID RAB. Kategori yang dipilih akan digunakan otomatis oleh seluruh dokumen turunan."
      />

      <Card style={{ marginTop: 24, padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, fontFamily: font.body }}>
          <thead>
            <tr style={{ background: T.bgAlt, borderBottom: `1px solid ${T.border}` }}>
              <th style={{ padding: "12px 18px", textAlign: "left", fontWeight: 700, color: T.textMuted, fontSize: 11.5, letterSpacing: 0.5 }}>
                ID RAB
              </th>
              <th style={{ padding: "12px 18px", textAlign: "left", fontWeight: 700, color: T.textMuted, fontSize: 11.5, letterSpacing: 0.5 }}>
                JUDUL KEGIATAN
              </th>
              <th style={{ padding: "12px 18px", textAlign: "center", fontWeight: 700, color: T.textMuted, fontSize: 11.5, letterSpacing: 0.5 }}>
                KATEGORI
              </th>
              <th style={{ padding: "12px 18px", textAlign: "center", fontWeight: 700, color: T.textMuted, fontSize: 11.5, letterSpacing: 0.5 }}>
                AKSI
              </th>
            </tr>
          </thead>
          <tbody>
            {rab.map((row, idx) => {
              const isEditing = editing === row.idNumber;
              const pill = PILL_COLOR[row.kategori] || { bg: T.bgAlt, color: T.textMuted };
              return (
                <tr
                  key={row.idNumber}
                  style={{
                    borderBottom: idx < rab.length - 1 ? `1px solid ${T.border}` : "none",
                    background: isEditing ? T.blueSoft : "transparent",
                    transition: "background 0.15s",
                  }}
                >
                  <td style={{ padding: "14px 18px", fontWeight: 700, color: T.blue, fontFamily: font.mono, fontSize: 13 }}>
                    {row.idNumber || "-"}
                  </td>
                  <td style={{ padding: "14px 18px", color: T.text, maxWidth: 320 }}>
                    {row.judulKegiatan || "-"}
                  </td>
                  <td style={{ padding: "14px 18px", textAlign: "center" }}>
                    {isEditing ? (
                      <select
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        autoFocus
                        style={{
                          padding: "6px 12px", borderRadius: 8, fontSize: 13,
                          border: `1.5px solid ${T.blue}`, background: T.bg,
                          color: T.text, fontFamily: font.body, cursor: "pointer",
                          outline: "none",
                        }}
                      >
                        <option value="">-- Pilih --</option>
                        {OPT.kategori.map((k) => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                    ) : (
                      <span style={{
                        display: "inline-block",
                        padding: "4px 14px", borderRadius: 999,
                        background: pill.bg, color: pill.color,
                        fontSize: 12, fontWeight: 700, letterSpacing: 0.3,
                      }}>
                        {row.kategori || "Belum diatur"}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "14px 18px", textAlign: "center" }}>
                    {isEditing ? (
                      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                        <button
                          onClick={() => saveEdit(row.idNumber)}
                          style={{
                            padding: "6px 16px", borderRadius: 8, border: "none",
                            background: T.blue, color: "#fff",
                            fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                            fontFamily: font.body,
                          }}
                        >
                          Simpan
                        </button>
                        <button
                          onClick={cancelEdit}
                          style={{
                            padding: "6px 14px", borderRadius: 8,
                            border: `1px solid ${T.border}`, background: "transparent",
                            color: T.textMuted, fontSize: 12.5, cursor: "pointer",
                            fontFamily: font.body,
                          }}
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(row)}
                        style={{
                          padding: "6px 16px", borderRadius: 8,
                          border: `1px solid ${T.border}`, background: "transparent",
                          color: T.textMuted, fontSize: 12.5, cursor: "pointer",
                          fontFamily: font.body, transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = T.blueSoft;
                          e.currentTarget.style.color = T.blue;
                          e.currentTarget.style.borderColor = T.blue;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = T.textMuted;
                          e.currentTarget.style.borderColor = T.border;
                        }}
                      >
                        Ubah
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
