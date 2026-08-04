import { T, font } from "../lib/theme";
import Card from "../components/Card";
import PageHeader from "../components/PageHeader";

const SECTIONS = [
  {
    title: "Humas & Publikasi",
    steps: [
      [
        "Catat proposal masuk",
        "Setiap proposal dari yayasan, sekolah, komunitas, atau instansi dicatat di modul Proposal Stakeholder, beserta status Baru Masuk / Ditinjau / Disetujui / Ditolak.",
      ],
      [
        "Monitoring pemberitaan (Pengelolaan Komunikasi)",
        "Modul Pengelolaan Komunikasi mencatat satu konten (Kategori, Narasumber, Judul Pemberitaan) beserta semua publikasinya di media berbeda (TV, Radio, Media Cetak, Media Online, Media Sosial). Tiap publikasi punya Kategori Media dan Score sendiri. Status konten: Draft, kemudian Terbit.",
      ],
      [
        "Ringkasan bulanan",
        "Di halaman utama Pengelolaan Komunikasi ada panel Ringkasan Bulanan (bisa dibuka/tutup) yang menampilkan total konten, publikasi, score, serta platform dan kategori terbanyak per bulan.",
      ],
    ],
  },
  {
    title: "Perencanaan",
    steps: [
      [
        "Buat RAB",
        "Input uraian per item lalu lengkapi data induk RAB (kategori, bidang, program, vendor). RAB ini akan dirujuk oleh TOR, BAST, PI, dan Laporan.",
      ],
      [
        "Susun TOR",
        "Pilih ID RAB, judul kegiatan otomatis terisi. Lengkapi tujuan dan rencana kegiatan.",
      ],
    ],
  },
  {
    title: "Pelaksanaan",
    steps: [
      [
        "Dokumentasi",
        "Unggah dokumentasi kegiatan berdasarkan RAB terkait. Semua file tersimpan sebagai lampiran kegiatan.",
      ],
      [
        "Daftar Hadir",
        "Kelola daftar hadir peserta kegiatan. Bisa dicetak langsung dari aplikasi.",
      ],
      [
        "Eviden Lainnya",
        "Unggah eviden pendukung kegiatan seperti foto, surat, atau dokumen tambahan.",
      ],
    ],
  },
  {
    title: "Pembayaran",
    steps: [
      [
        "Terbitkan BAST",
        "Pilih Non PO / Cash Card, pilih ID RAB. Jumlah bantuan otomatis dari total evaluasi RAB.",
      ],
      [
        "BAPP",
        "Berita Acara Pemeriksaan Pekerjaan, dirujuk dari ID RAB.",
      ],
      [
        "Pakta Integritas (PI)",
        "Pilih Non PO / CC, pilih ID RAB, lengkapi data lembaga dan penerima.",
      ],
      [
        "Checklist dan Lampiran",
        "Periksa kelengkapan dokumen melalui Checklist Dokumen, Form Verifikasi, Lampiran 1 (Rincian Pekerjaan), dan Lampiran 2 (Checklist Internal).",
      ],
    ],
  },
  {
    title: "Data Pendukung",
    steps: [
      [
        "Kelola Vendor",
        "Tambahkan vendor baru agar tersedia sebagai pilihan pada formulir RAB.",
      ],
      [
        "History",
        "Setiap penyimpanan otomatis tercatat sebagai riwayat, lengkap dengan tanggal dan waktu submit (audit trail tanpa perlu input manual).",
      ],
      [
        "Laporan Realisasi",
        "Pilih Laporan CC / NON PO, konfirmasi pilihan, lengkapi data realisasi bantuan.",
      ],
    ],
  },
];

function StepRow({ n, title, description, last }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        padding: "14px 0",
        borderBottom: last ? "none" : `1px solid ${T.border}`,
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          background: T.navy,
          color: T.yellow,
          display: "grid",
          placeItems: "center",
          fontFamily: font.mono,
          fontSize: 13,
          flexShrink: 0,
        }}
      >
        {n}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14.5, color: T.heading }}>{title}</div>
        <div style={{ fontSize: 13, color: T.muted, marginTop: 3, lineHeight: 1.55 }}>
          {description}
        </div>
      </div>
    </div>
  );
}

export default function Panduan() {
  return (
    <div>
      <PageHeader
        eyebrow="Bantuan"
        title="Panduan Penggunaan"
        description="Ringkasan alur kerja SIREMON, dari proposal masuk sampai realisasi bantuan tercatat."
      />

      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        }}
      >
        {SECTIONS.map((section) => (
          <Card key={section.title}>
            <h3
              style={{
                fontFamily: font.display,
                fontSize: 15.5,
                margin: "0 0 6px",
                color: T.heading,
              }}
            >
              {section.title}
            </h3>
            <div style={{ height: 2, width: 26, background: T.yellow, borderRadius: 1, marginBottom: 8 }} />
            {section.steps.map(([t, d], i) => (
              <StepRow
                key={t}
                n={i + 1}
                title={t}
                description={d}
                last={i === section.steps.length - 1}
              />
            ))}
          </Card>
        ))}
      </div>
    </div>
  );
}
