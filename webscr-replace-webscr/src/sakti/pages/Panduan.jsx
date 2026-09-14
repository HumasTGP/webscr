import { ArrowRight, ClipboardList, FileSpreadsheet, FileText, Handshake, ShieldCheck, FilePlus, Wallet } from "lucide-react";
import { T, font } from "../../lib/theme";
import Card from "../../components/Card";
import PageHeader from "../../components/PageHeader";

// ---------------- pipeline generik (dipakai utk 4 alur di bawah) --------------
// Beda dari versi lama: node-nya dibungkus flex-wrap (bukan grid kaku), biar
// pipeline yang panjang (misal Alur NON PO, 10 step) bisa turun ke baris
// berikutnya dengan wajar di layar sempit, sementara pipeline pendek (Alur
// Proposal, 4 step) tetap sejajar 1 baris di layar biasa.
function Pipeline({ nodes, goto }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "stretch", gap: "10px 4px" }}>
      {nodes.map((n, i) => {
        const Icon = n.icon || FileText;
        return (
          <div key={`${n.key}-${i}`} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button
              onClick={() => n.key && goto?.(n.key)}
              title={n.hint || n.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                width: 108,
                padding: "14px 8px",
                background: T.bg,
                borderRadius: 10,
                border: `1px solid ${T.border}`,
                cursor: n.key && goto ? "pointer" : "default",
                textAlign: "center",
                transition: "background .15s ease, border-color .15s ease",
              }}
              onMouseEnter={(e) => {
                if (!n.key) return;
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
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: T.card,
                  color: T.blue,
                  display: "grid",
                  placeItems: "center",
                  border: `1px solid ${T.border}`,
                  flexShrink: 0,
                }}
              >
                <Icon size={14} />
              </div>
              <div style={{ fontSize: 10.5, color: T.muted, letterSpacing: 0.2, lineHeight: 1.3 }}>
                {n.label}
              </div>
            </button>
            {i < nodes.length - 1 && (
              <ArrowRight size={13} color={T.muted} style={{ flexShrink: 0 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------- 4 alur kerja SAKTI ----------------
// Key di tiap node = key routing (goto/setActive) yang sama dengan MENU_TREE
// di lib/data.js. Node tanpa key (kalau ada) berarti bukan halaman tersendiri,
// cuma penanda tahapan di alur.
const ALUR_PROPOSAL = [
  { key: "proposal-rekap", label: "Pengajuan & Rekap Proposal", icon: Handshake },
  { key: "proposal-evaluasi", label: "Form Evaluasi", icon: FileText },
  { key: "rab", label: "RAB", icon: FileSpreadsheet },
];

const ALUR_RAB = [
  { key: "rab", label: "RAB", icon: FileSpreadsheet },
  { key: "tor", label: "TOR", icon: FileText },
  { key: "bast-nonpo", label: "BA (BAST)", icon: ClipboardList },
  { key: "pakta-nonpo", label: "PI", icon: ShieldCheck },
  { key: "nonpo-overview", label: "NON PO", icon: FileText },
  { key: "po-overview", label: "PO", icon: FileText },
  { key: "cc-overview", label: "Cash Card", icon: Wallet },
];

const ALUR_NONPO = [
  { key: "nonpo-overview", label: "Create ID", icon: FileText },
  { key: "lmp1-nonpo", label: "Lamp 1 (+Procost)", icon: FileText },
  { key: "lmp2-nonpo", label: "Lamp 2", icon: FileText },
  { key: "laporan-nonpo", label: "Report NON PO", icon: FileSpreadsheet },
  { key: "form-verifikasi-nonpo", label: "Form Eval", icon: FilePlus },
  { key: "lmp1-nonpo", label: "Lamp 1", icon: FileText },
  { key: "lmp2-nonpo", label: "Lamp 2", icon: FileText },
  { key: "bast-nonpo", label: "BA (BAST)", icon: ClipboardList },
  { key: "pakta-nonpo", label: "PI", icon: ShieldCheck },
  { key: "tor", label: "TOR", icon: FileText },
];

const ALUR_CC = [
  { key: "cc-overview", label: "Cash Card", icon: Wallet },
  { key: "detail-cc", label: "Report CC", hint: "Pertanggungjawaban Cash Card, dicetak dari Detail CC", icon: FileSpreadsheet },
  { key: "detail-cc", label: "Form Eval", hint: "Formulir Verifikasi, dicetak dari Detail CC", icon: FilePlus },
  { key: "detail-cc", label: "Permintaan CC", hint: "Permintaan Dana Cash Card, dicetak dari Detail CC", icon: FileText },
  { key: "detail-cc", label: "LPJ CC", hint: "Rencana Permintaan Tunai, dicetak dari Detail CC", icon: FileText },
  { key: "bast-cc", label: "BA (BAST)", icon: ClipboardList },
  { key: "pakta-cc", label: "PI", icon: ShieldCheck },
  { key: "tor", label: "TOR", icon: FileText },
];

const ALUR_LIST = [
  { title: "Alur Proposal", nodes: ALUR_PROPOSAL },
  { title: "Alur RAB", nodes: ALUR_RAB },
  { title: "Alur NON PO", nodes: ALUR_NONPO },
  { title: "Alur CC", nodes: ALUR_CC },
];

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
  return (
    <div>
      <PageHeader
        eyebrow="Bantuan"
        title="Panduan Penggunaan"
        description="Ringkasan alur kerja SAKTI, dari proposal masuk sampai realisasi bantuan tercatat."
      />

      <div style={{ display: "grid", gap: 16, marginBottom: 20 }}>
        {ALUR_LIST.map((alur) => (
          <Card key={alur.title}>
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
                {alur.title}
              </h3>
            </div>
            <Pipeline nodes={alur.nodes} goto={goto} />
          </Card>
        ))}
      </div>

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
