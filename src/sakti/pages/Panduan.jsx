import { ArrowRight, ClipboardList, FileSpreadsheet, FileText, Handshake } from "lucide-react";
import { T, font } from "../../lib/theme";
import Card from "../../components/Card";
import PageHeader from "../../components/PageHeader";

// ---------------- pipeline (Proposal → RAB → BAST → Laporan) --------------
function Pipeline({ counts, goto }) {
  const nodes = [
    { key: "proposal-rekap", label: "Proposal", value: counts.proposal, icon: Handshake },
    { key: "rab", label: "RAB", value: counts.rab, icon: FileSpreadsheet },
    { key: "bast", label: "BAST, PI, TOR", value: counts.bastPiTor, icon: ClipboardList },
    { key: "laporan", label: "Laporan", value: counts.laporan, icon: FileText },
  ];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${nodes.length}, minmax(0, 1fr))`,
        gap: 10,
        alignItems: "stretch",
      }}
    >
      {nodes.map((n, i) => {
        const Icon = n.icon;
        return (
          <button
            key={n.key}
            onClick={() => goto?.(n.key)}
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              padding: "16px 10px",
              background: T.bg,
              borderRadius: 10,
              border: `1px solid ${T.border}`,
              cursor: goto ? "pointer" : "default",
              textAlign: "center",
              transition: "background .15s ease, border-color .15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = T.blueSoft;
              e.currentTarget.style.borderColor = T.blue;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = T.bg;
              e.currentTarget.style.borderColor = T.border;
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: T.card,
                color: T.blue,
                display: "grid",
                placeItems: "center",
                border: `1px solid ${T.border}`,
              }}
            >
              <Icon size={15} />
            </div>
            <div style={{ fontSize: 11, color: T.muted, letterSpacing: 0.3 }}>
              {n.label}
            </div>
            {i < nodes.length - 1 && (
              <ArrowRight
                size={14}
                color={T.muted}
                style={{
                  position: "absolute",
                  right: -12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: T.card,
                  padding: 1,
                  borderRadius: 6,
                  zIndex: 1,
                }}
                className="hide-mobile"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

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

export default function Panduan({ data, goto }) {
  const counts = data
    ? {
        proposal: data.proposals?.length || 0,
        rab: data.rab?.length || 0,
        bastPiTor: (data.bast?.length || 0) + (data.pakta?.length || 0) + (data.tor?.length || 0),
        laporan: data.laporan?.length || 0,
      }
    : { proposal: 0, rab: 0, bastPiTor: 0, laporan: 0 };

  return (
    <div>
      <PageHeader
        eyebrow="Bantuan"
        title="Panduan Penggunaan"
        description="Ringkasan alur kerja SAKTI, dari proposal masuk sampai realisasi bantuan tercatat."
      />

      <Card style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <h3
            style={{
              fontFamily: font.display,
              fontSize: 15.5,
              margin: 0,
              color: T.heading,
            }}
          >
            Alur Kerja SAKTI
          </h3>
        </div>
        <Pipeline counts={counts} goto={goto} />
      </Card>

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
