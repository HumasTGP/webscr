import { useState } from "react";
import { T, font } from "../../lib/theme";
import { HelpCircle, ChevronDown, ChevronUp, Phone, Mail, MapPin, BookOpen } from "lucide-react";

const STEPS = [
  {
    no: 1,
    title: "Login ke Sistem",
    desc: "Masukkan NIK dan PIN Anda pada halaman login. Pilih modul 'Si Lapak Priok' dari portal utama.",
  },
  {
    no: 2,
    title: "Atur Petugas Jaga",
    desc: "Di dashboard, klik 'Atur Petugas Jaga' untuk menetapkan nama satpam yang bertugas hari ini sebelum mulai mencatat.",
  },
  {
    no: 3,
    title: "Tambah Paket Masuk",
    desc: "Pilih menu 'Tambah Paket', isi data pengirim, penerima, ekspedisi, dan upload foto paket jika ada. Klik Simpan.",
  },
  {
    no: 4,
    title: "Proses Pengambilan Paket",
    desc: "Pada menu 'Data Paket', cari paket yang ingin diambil, klik 'Proses Ambil', isi data pengambil beserta foto bukti pengambilan.",
  },
  {
    no: 5,
    title: "Catat Kunjungan Tamu",
    desc: "Pilih menu 'Buku Tamu', isi identitas tamu, tujuan kunjungan, dan jam masuk. Data tersimpan otomatis.",
  },
  {
    no: 6,
    title: "Lihat Riwayat",
    desc: "Menu 'Riwayat' menampilkan semua catatan paket dan tamu. Gunakan filter untuk mencari data berdasarkan tanggal atau nama.",
  },
];

const FAQ = [
  {
    q: "Bagaimana cara mengubah data paket yang sudah tersimpan?",
    a: "Buka menu 'Data Paket', temukan paket yang ingin diedit, lalu klik ikon pensil (edit) di baris tersebut. Ubah data yang diperlukan kemudian klik Simpan.",
  },
  {
    q: "Apakah data paket tersimpan jika browser ditutup?",
    a: "Data tersimpan di memori sesi saat ini. Pastikan tidak menutup tab sebelum pekerjaan selesai. Untuk penyimpanan permanen, hubungi admin untuk versi dengan database.",
  },
  {
    q: "Bagaimana jika paket sudah diambil tetapi belum diproses di sistem?",
    a: "Gunakan fitur 'Proses Ambil' di menu Data Paket. Isi data pengambil dengan tanggal aktual pengambilan dan lampirkan foto bukti jika tersedia.",
  },
  {
    q: "Bisakah lebih dari satu petugas jaga dicatat dalam satu hari?",
    a: "Ya. Klik 'Atur Petugas Jaga' di dashboard, sistem mendukung pencatatan shift pagi, siang, dan malam dalam satu hari kerja.",
  },
  {
    q: "Apa yang harus dilakukan jika foto paket gagal diupload?",
    a: "Pastikan ukuran file foto tidak melebihi 5 MB dan format file adalah JPG atau PNG. Jika masih gagal, coba refresh halaman dan ulangi proses input.",
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        borderRadius: 10,
        border: `1px solid ${T.border}`,
        marginBottom: 10,
        overflow: "hidden",
        background: T.card,
      }}
    >
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "13px 16px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          color: T.heading,
          fontFamily: font.body,
          fontSize: 13.5,
          fontWeight: 600,
        }}
      >
        <span>{q}</span>
        {open ? <ChevronUp size={16} style={{ flexShrink: 0, color: T.yellow }} /> : <ChevronDown size={16} style={{ flexShrink: 0, color: T.muted }} />}
      </button>
      {open && (
        <div
          style={{
            padding: "0 16px 14px",
            fontSize: 12.5,
            color: T.text,
            lineHeight: 1.65,
            borderTop: `1px solid ${T.border}`,
            paddingTop: 12,
          }}
        >
          {a}
        </div>
      )}
    </div>
  );
}

export default function SilapakBantuan() {
  return (
    <div style={{ maxWidth: 780 }}>
      <h2 style={{ fontSize: 17, fontWeight: 700, color: T.heading, margin: "0 0 4px" }}>Bantuan</h2>
      <p style={{ fontSize: 12, color: T.muted, margin: "0 0 28px" }}>Panduan, FAQ, dan kontak admin Si Lapak Priok</p>

      {/* Panduan Penggunaan */}
      <div
        style={{
          background: T.card,
          borderRadius: 14,
          padding: "20px 22px",
          marginBottom: 20,
          border: `1px solid ${T.border}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: "rgba(255,199,44,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <BookOpen size={17} style={{ color: T.yellow }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.heading }}>Panduan Penggunaan</div>
            <div style={{ fontSize: 10.5, color: T.muted }}>Langkah-langkah menggunakan Si Lapak Priok</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {STEPS.map((s) => (
            <div
              key={s.no}
              style={{
                background: T.bg,
                borderRadius: 10,
                padding: "13px 14px",
                border: `1px solid ${T.border}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: T.yellow,
                    color: "#5A3800",
                    fontSize: 11,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {s.no}
                </div>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: T.heading }}>{s.title}</span>
              </div>
              <p style={{ fontSize: 11.5, color: T.muted, margin: 0, lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div
        style={{
          background: T.card,
          borderRadius: 14,
          padding: "20px 22px",
          marginBottom: 20,
          border: `1px solid ${T.border}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: "rgba(14,76,146,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <HelpCircle size={17} style={{ color: T.blue }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.heading }}>Pertanyaan Umum (FAQ)</div>
            <div style={{ fontSize: 10.5, color: T.muted }}>Klik pertanyaan untuk melihat jawaban</div>
          </div>
        </div>
        {FAQ.map((f, i) => (
          <FaqItem key={i} q={f.q} a={f.a} />
        ))}
      </div>

      {/* Kontak Admin */}
      <div
        style={{
          background: T.card,
          borderRadius: 14,
          padding: "20px 22px",
          border: `1px solid ${T.border}`,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: T.heading, marginBottom: 4 }}>Kontak Admin</div>
        <div style={{ fontSize: 11.5, color: T.muted, marginBottom: 16 }}>
          Hubungi tim admin jika mengalami kendala teknis atau memerlukan bantuan lebih lanjut.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          <ContactCard icon={<Phone size={15} />} label="Telepon" value="+62 21 4393 xxxx" color="#1D9E75" bg="rgba(29,158,117,0.10)" />
          <ContactCard icon={<Mail size={15} />} label="Email" value="admin.silapak@pln.co.id" color={T.blue} bg="rgba(14,76,146,0.10)" />
          <ContactCard icon={<MapPin size={15} />} label="Lokasi" value="Pos Satpam – UBP Priok, Jakarta Utara" color="#7C4FD1" bg="rgba(124,79,209,0.10)" />
        </div>
      </div>
    </div>
  );
}

function ContactCard({ icon, label, value, color, bg }) {
  return (
    <div
      style={{
        background: T.bg,
        borderRadius: 10,
        padding: "13px 14px",
        border: `1px solid ${T.border}`,
        display: "flex",
        alignItems: "flex-start",
        gap: 11,
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 10, color: T.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: 12.5, color: T.text, fontWeight: 500 }}>{value}</div>
      </div>
    </div>
  );
}
