import { T, font } from "../lib/theme";
import Card from "../components/Card";
import PageHeader from "../components/PageHeader";

const SECTIONS = [
  {
    title: "Humas & Publikasi",
    steps: [
      [
        "Catat proposal masuk",
        "Setiap proposal dari yayasan, sekolah, komunitas, atau instansi dicatat di modul Proposal Stakeholder — beserta status Baru Masuk / Ditinjau / Disetujui / Ditolak.",
      ],
      [
        "Monitoring pemberitaan (Pengelolaan Komunikasi)",
        "Modul Pengelolaan Komunikasi mencatat satu konten (Kategori, Narasumber, Judul Pemberitaan) beserta semua publikasinya di media berbeda (TV, Radio, Media Cetak, Media Online, Media Sosial) — tiap publikasi punya Kategori Media dan Score sendiri. Status konten: Draft → Terbit.",
      ],
      [
        "Ringkasan bulanan",
        "Di halaman utama Pengelolaan Komunikasi ada panel Ringkasan Bulanan (bisa dibuka/tutup) yang menampilkan total konten, publikasi, score, serta platform dan kategori terbanyak per bulan.",
      ],
    ],
  },
  {
    title: "Administrasi Kas",
    steps: [
      [
        "Buat RAB",
        "Input uraian per item lalu lengkapi data induk RAB (kategori, bidang, program, vendor). RAB ini akan dirujuk oleh TOR, BAST, Pakta, dan Laporan.",
      ],
      [
        "Susun TOR",
        "Pilih ID RAB — judul kegiatan otomatis terisi. Lengkapi tujuan & rencana kegiatan.",
      ],
      [
        "Terbitkan BAST",
        "Pilih Non PO / Cash Card, pilih ID RAB — jumlah bantuan otomatis dari total evaluasi RAB.",
      ],
      [
        "Pakta Integritas",
        "Pilih Non PO / CC, pilih ID RAB, lengkapi data lembaga & penerima.",
      ],
      [
        "Laporan realisasi",
        "Pilih Laporan CC / NON PO, konfirmasi pilihan, lengkapi data realisasi bantuan.",
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
        "Setiap penyimpanan otomatis tercatat sebagai riwayat, lengkap dengan tanggal & waktu submit — audit trail tanpa perlu input manual.",
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
        description="Ringkasan alur kerja SIKAS — dari proposal masuk sampai realisasi bantuan tercatat."
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
              // Numbering reset per section — tiap section mulai dari 1
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