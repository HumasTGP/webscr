import { useState } from "react";
import { User } from "lucide-react";
import { T, font } from "../../lib/theme";

// Popup wajib diisi setelah login berhasil (akses humas sekarang 1 akun
// bersama) - user mengetik nama aslinya sendiri, supaya Log Aktivitas bisa
// menampilkan siapa yang benar-benar sedang login dan melakukan input,
// bukan cuma username akun bersama yang generik.
//
// SENGAJA tidak pakai komponen Modal.jsx yang bisa ditutup dengan klik di
// luar / tombol X - popup ini wajib diisi dulu sebelum bisa lanjut, tidak
// ada cara untuk melewatinya.
export default function NamaPenggunaModal({ open, onSubmit }) {
  const [nama, setNama] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const submit = (e) => {
    e.preventDefault();
    const trimmed = nama.trim();
    if (!trimmed) {
      setError("Nama wajib diisi.");
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(7,27,54,0.55)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 400,
        padding: 20,
      }}
    >
      <form
        onSubmit={submit}
        style={{
          background: T.card,
          borderRadius: 16,
          width: 420,
          maxWidth: "100%",
          boxShadow: T.shadowLg,
          padding: "28px 26px",
        }}
      >
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: "50%",
            background: T.blueSoft,
            color: T.blue,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 14,
          }}
        >
          <User size={22} />
        </div>
        <div style={{ fontFamily: font.display, fontSize: 17, fontWeight: 700, color: T.heading, marginBottom: 6 }}>
          Siapa yang sedang login?
        </div>
        <div style={{ fontSize: 12.5, color: T.muted, marginBottom: 18, lineHeight: 1.55 }}>
          Akun ini digunakan bersama. Masukkan nama Anda supaya aktivitas yang Anda lakukan
          tercatat dengan nama Anda di Log Aktivitas.
        </div>

        <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: T.text, marginBottom: 6 }}>
          Nama lengkap <span style={{ color: "#D14343" }}>*</span>
        </label>
        <input
          autoFocus
          value={nama}
          onChange={(e) => { setNama(e.target.value); if (error) setError(""); }}
          placeholder="Contoh: Budi Santoso"
          style={{
            width: "100%",
            boxSizing: "border-box",
            border: `1px solid ${error ? "#D14343" : T.border}`,
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: 13,
            color: T.text,
            background: T.bg,
            outline: "none",
            marginBottom: error ? 6 : 18,
          }}
        />
        {error && <div style={{ fontSize: 11, color: "#D14343", marginBottom: 12 }}>{error}</div>}

        <button
          type="submit"
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            border: "none",
            background: T.navy,
            color: "#fff",
            fontWeight: 700,
            fontSize: 13.5,
            cursor: "pointer",
          }}
        >
          Lanjutkan
        </button>
      </form>
    </div>
  );
}
