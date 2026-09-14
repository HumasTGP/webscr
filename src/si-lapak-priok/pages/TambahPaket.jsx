import { useState } from "react";
import { T } from "../../lib/theme";
import { EKSPEDISI_OPT, ASAL_SURAT_OPT, JENIS_OPT, uidSilapak, nowJam, nowTanggal } from "../../lib/siLapakPriokData";

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  border: `1px solid ${T.border}`,
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 12.5,
  color: T.text,
  background: T.card,
  outline: "none",
};
const fieldLabel = { display: "block", fontSize: 11.5, fontWeight: 600, color: T.text, marginBottom: 6 };

function Field({ label, required, hint, full, children }) {
  return (
    <div style={{ gridColumn: full ? "1 / -1" : "auto" }}>
      <label style={fieldLabel}>{label} {required && <span style={{ color: "#D14343" }}>*</span>}</label>
      {children}
      {hint && <div style={{ fontSize: 10.5, color: T.muted, marginTop: 5 }}>{hint}</div>}
    </div>
  );
}

function JenisToggle({ jenis, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
      {JENIS_OPT.map((j) => (
        <button
          key={j}
          type="button"
          onClick={() => onChange(j)}
          style={{
            padding: "8px 20px",
            borderRadius: 8,
            border: `1px solid ${jenis === j ? T.navy : T.border}`,
            background: jenis === j ? T.navy : T.card,
            color: jenis === j ? "#fff" : T.text,
            fontWeight: 700,
            fontSize: 12.5,
            cursor: "pointer",
          }}
        >
          {j}
        </button>
      ))}
    </div>
  );
}

export default function TambahPaket({ duty, onSaved }) {
  const [jenis, setJenis] = useState("Paket");
  const [namaPenerima, setNamaPenerima] = useState("");
  const [ekspedisi, setEkspedisi] = useState("");
  const [noResi, setNoResi] = useState("");
  const [asalSurat, setAsalSurat] = useState("");
  const [noSurat, setNoSurat] = useState("");
  const [perihal, setPerihal] = useState("");
  const [satpam, setSatpam] = useState(duty?.names?.[0] || "");
  const [saved, setSaved] = useState(null);

  const dutyOptions = duty?.names || [];
  const isSurat = jenis === "Surat";

  const resetFields = () => {
    setNamaPenerima("");
    setEkspedisi("");
    setNoResi("");
    setAsalSurat("");
    setNoSurat("");
    setPerihal("");
  };

  const submit = () => {
    if (!namaPenerima.trim()) return;
    if (!isSurat && (!ekspedisi || !noResi.trim())) return;
    if (isSurat && (!asalSurat || !noSurat.trim() || !perihal.trim())) return;

    const entry = {
      id: uidSilapak(isSurat ? "SRT" : "PKT"),
      jenis,
      namaPenerima: namaPenerima.trim(),
      satpam: satpam || "-",
      status: "Belum Diambil",
      diterimaTanggal: nowTanggal(),
      diterimaJam: nowJam(),
      tanggalKey: new Date().toDateString(),
      ...(isSurat
        ? { asalSurat, noSurat: noSurat.trim(), perihal: perihal.trim() }
        : { ekspedisi, noResi: noResi.trim() }),
    };
    onSaved(entry);
    setSaved(entry);
    resetFields();
  };

  if (saved) {
    return (
      <div style={{ maxWidth: 420 }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#E5F6EF", color: "#1D9E75", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: 20 }}>✓</div>
        <div style={{ textAlign: "center", fontSize: 14, fontWeight: 700, color: T.heading, marginBottom: 4 }}>{saved.jenis} berhasil dicatat</div>
        <div style={{ textAlign: "center", fontSize: 11.5, color: T.muted, marginBottom: 18 }}>{saved.id}</div>
        <div style={{ background: T.bg, borderRadius: 10, padding: "12px 14px", marginBottom: 16, fontSize: 12 }}>
          <Row label="Penerima" value={saved.namaPenerima} />
          <Row label={saved.jenis === "Surat" ? "Asal Surat" : "Ekspedisi"} value={saved.jenis === "Surat" ? saved.asalSurat : saved.ekspedisi} />
          <Row label="Status" value={saved.status} />
        </div>
        <button type="button" onClick={() => setSaved(null)} style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${T.border}`, background: T.card, color: T.text, fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
          Tambah {saved.jenis.toLowerCase()} lain
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <JenisToggle jenis={jenis} onChange={(j) => { setJenis(j); resetFields(); }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="Nama penerima" required full hint="Contoh: Budi Santoso, Divisi Umum. Boleh diketik bebas bila belum ada di daftar.">
          <input style={inputStyle} value={namaPenerima} onChange={(e) => setNamaPenerima(e.target.value)} placeholder="Pilih dari daftar atau ketik nama baru" />
        </Field>

        {!isSurat ? (
          <>
            <Field label="Ekspedisi / pengirim" required>
              <select style={inputStyle} value={ekspedisi} onChange={(e) => setEkspedisi(e.target.value)}>
                <option value="">Pilih ekspedisi</option>
                {EKSPEDISI_OPT.map((op) => (<option key={op} value={op}>{op}</option>))}
              </select>
            </Field>

            <Field label="Nomor resi / ID pengiriman" required hint="Contoh: JX0192837465">
              <input style={inputStyle} value={noResi} onChange={(e) => setNoResi(e.target.value)} placeholder="Nomor resi" />
            </Field>
          </>
        ) : (
          <>
            <Field label="Asal surat / pengirim" required>
              <select style={inputStyle} value={asalSurat} onChange={(e) => setAsalSurat(e.target.value)}>
                <option value="">Pilih asal surat</option>
                {ASAL_SURAT_OPT.map((op) => (<option key={op} value={op}>{op}</option>))}
              </select>
            </Field>

            <Field label="Nomor surat" required hint="Contoh: 123/UBP-PRIOK/IX/2026">
              <input style={inputStyle} value={noSurat} onChange={(e) => setNoSurat(e.target.value)} placeholder="Nomor surat" />
            </Field>

            <Field label="Perihal" required full hint="Ringkasan isi/tujuan surat">
              <input style={inputStyle} value={perihal} onChange={(e) => setPerihal(e.target.value)} placeholder="Perihal surat" />
            </Field>
          </>
        )}

        <Field label={`Satpam penerima ${jenis.toLowerCase()}`} full hint={dutyOptions.length ? "Daftar mengikuti satpam yang aktif pada shift berjalan." : "Belum ada satpam bertugas dipilih untuk shift ini."}>
          <select style={inputStyle} value={satpam} onChange={(e) => setSatpam(e.target.value)}>
            <option value="">Pilih satpam</option>
            {dutyOptions.map((n) => (<option key={n} value={n}>{n}</option>))}
          </select>
        </Field>
      </div>

      <div style={{ background: "#FDF3DD", border: "1px solid #F0DBA6", borderRadius: 8, padding: "10px 12px", fontSize: 11, color: "#B7791F", margin: "18px 0" }}>
        Status {jenis.toLowerCase()} otomatis tercatat sebagai belum diambil. Status berubah saat diproses lewat menu Ambil Paket/Surat.
      </div>

      <button type="button" onClick={submit} style={{ padding: "11px 28px", borderRadius: 8, border: "none", background: T.navy, color: "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}>
        Simpan {jenis.toLowerCase()}
      </button>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: T.muted }}>
      <span>{label}</span>
      <span style={{ color: T.text, fontWeight: 600 }}>{value}</span>
    </div>
  );
}
