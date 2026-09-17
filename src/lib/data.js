import {
  LayoutDashboard,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  ClipboardList,
  Building2,
  HelpCircle,
  Clock,
  Handshake,
  Megaphone,
  Inbox,
  FolderCheck,
  UserCog,
  Camera,
  Users,
  FileCheck,
  CheckSquare,
  FilePlus,
  FileSearch,
  Paperclip,
  Tags,
  BarChart3,
  Wallet,
} from "lucide-react";

export const OPT = {
  kategori: ["NON PO", "Cash Card", "PO"],
  jenisKegiatanCsr: [
    "Bakti Pelayanan Masyarakat",
    "Bakti Pemberdayaan Masyarakat",
    "Bakti Pembinaan Hubungan",
  ],
  bidang: ["Niaga", "Keuangan", "SDM & Umum", "Perencanaan", "K3L"],
  jenisProgram: ["CSR", "Bina Lingkungan", "Sponsorship", "Donasi"],
  subprogram: [
    "Pendidikan",
    "Kesehatan",
    "Infrastruktur",
    "Bencana Alam",
    "Lingkungan Hidup",
  ],
  kategoriProgram: ["Rutin", "Non Rutin", "Prioritas"],
  procost: ["26-1501-PPA-OP-LUO-8C-01", "26-1501-PPA-OP-ADM-7Q-01"],
  task: ["Task-A", "Task-B", "Task-C"],
  // TPB = Tujuan Pembangunan Berkelanjutan (SDG), dipakai di Form Verifikasi
  // buat nentuin item pekerjaan itu masuk TPB yang mana.
  expType: [
    "72-LOTJSL-TPB1-TanpaKemiskinan",
    "72-LOTJSL-TPB2-TanpaKelaparan",
    "72-LOTJSL-TPB3-Khidupn&Sejhtra",
    "72-LOTJSL-TPB4-PndidknBrkualts",
    "72-LOTJSL-TPB5-KsetaraanGender",
    "72-LOTJSL-TPB6-AirBersih&Layak",
    "72-LOTJSL-TPB7-EnrgBrshTrjgkau",
    "72-LOTJSL-TPB8-PekLykPertmbEko",
    "72-LOTJSL-TPB9-IndustInovInfra",
    "72-LOTJSL-TPB10-BerkrgKsnjangn",
    "72-LOTJSL-TPB11-Kota&KomLanjut",
    "72-LOTJSL-TPB12-KonsProdTjgjwb",
    "72-LOTJSL-TPB13-PenPrubhnIklim",
    "72-LOTJSL-TPB14-EkosistemLaut",
    "72-LOTJSL-TPB15-EkosistmDaratn",
    "72-LOTJSL-TPB16-PrdamaiAdilLmbg",
    "72-LOTJSL-TPB17-KmitraanTujuan",
  ],
  expOrg: ["Kantor Pusat", "Unit Induk", "Unit Pelaksana"],
  satuan: ["Unit", "Paket", "Buah", "Set", "Lembar"],
  ppn: ["0%", "11%"],
  satuanPenerima: ["Orang", "KK"],
  ringLokasi: ["Ring 1", "Ring 2", "Ring 3", "Ring 4"],
  provinsi: ["31 - DKI Jakarta", "32 - Jawa Barat", "36 - Banten"],
  kabkota: ["3171 - Jakarta Pusat", "3204 - Bandung", "3671 - Tangerang"],
  realisasi: [
    "1 - Triwulan I",
    "2 - Triwulan II",
    "3 - Triwulan III",
    "4 - Triwulan IV",
  ],
  programInduk: ["TJSL PLN Peduli", "TJSL PLN Pintar", "TJSL PLN Bersih"],
  tpb: [
    "TPB 1 - Tanpa Kemiskinan",
    "TPB 3 - Kehidupan Sehat",
    "TPB 4 - Pendidikan Berkualitas",
  ],
  judulProgramRKA: [
    "RKA Bina Lingkungan 2026",
    "RKA CSR Pendidikan 2026",
    "RKA Tanggap Bencana 2026",
  ],
  bulan: [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ],
  unit: ["UBP Priok"],

  statusProposal: ["Baru Masuk", "Ditinjau", "Disetujui", "Ditolak"],
  sumberPengaju: [
    "Yayasan/LSM",
    "Komunitas Warga",
    "Sekolah/Pesantren",
    "Instansi Pemerintah",
    "Perusahaan",
    "Perorangan",
  ],

  programHumas: [
    "Pelayanan Masyarakat",
    "Pemberdayaan Masyarakat",
    "Pembinaan Hubungan Masyarakat",
  ],

  komunikasiKategori: [
    "B1. Grand Theme",
    "B2. Operational Issue",
    "B3. Addition Issue",
  ],
  komunikasiNarasumber: [
    "Buyung Arianto",
    "Guntur Syachrir",
    "Sigid Endro Winarno",
    "Donny Ureansyah",
    "Astri Oktavina",
  ],
  
  komunikasiMediaPemberitaan: [
    "Social Media",
    "Media Elektronik",
    "Media Cetak",
    "Media Online",
  ],
  komunikasiJenisAkun: [
    "Twitter Korporat",
    "Facebook Korporat",
    "Instagram Korporat",
    "TikTok Korporat",
    "Youtube Korporat",
  ],

  // Sumber skor: NAMA_UNIT_SKORING_AGSET_AGUSTUS_2026.xlsx (sheet TEMP).
  // Skor dasar tiap opsi ada di scoreForKategoriMedia() (src/lib/utils.js) —
  // daftar di bawah ini HANYA daftar pilihan dropdown, bukan sumber skor.
  komunikasiKategoriMedia: [
    // Media Elektronik - TV (score 100, kecuali Local & Lainnya = 10)
    "TV - Cnbc", "TV - Global Tv", "TV - Indosiar", "TV - Inews", "TV - Kompas Tv",
    "TV - Metro Tv", "TV - Mnc Tv", "TV - Rcti", "TV - Sctv", "TV - Sea Today",
    "TV - Trans 7", "TV - Trans Tv", "TV - Tv One", "TV - Local & Lainnya Tv",
    // Media Elektronik - Radio (score 25, kecuali Local & Lainnya = 10)
    "Radio - Elshinta", "Radio - Gen Fm", "Radio - Iradio", "Radio - Kiss Fm",
    "Radio - Most Fm", "Radio - Prambors Fm", "Radio - Rri Pro 1 Banten",
    "Radio - Rri Pro 1 Jakarta", "Radio - Rri Pro 2 Jakarta", "Radio - Trijaya Fm",
    "Radio - Local & Lainnya Radio",
    // Media Cetak (score 50, kecuali Local & Lainnya = 5)
    "Media Cetak - Bisnis Indonesia", "Media Cetak - Harian Kontan", "Media Cetak - Investor Daily",
    "Media Cetak - Jawapos", "Media Cetak - Kompas", "Media Cetak - Kontan Tabloid",
    "Media Cetak - Koran Sindo", "Media Cetak - Koran Tempo", "Media Cetak - Majalah Tempo",
    "Media Cetak - Media Indonesia", "Media Cetak - Rakyat Merdeka",
    "Media Cetak - Local & Lainnya Media Cetak",
    // Media Online (score 25, kecuali Local & Lainnya = 1)
    "Media Online - Antaranews.com", "Media Online - Bbc News", "Media Online - Berita Satu.com",
    "Media Online - Bisnis.com", "Media Online - Cnbc Indonesia", "Media Online - Cnn Indonesia",
    "Media Online - Detik.com", "Media Online - Idn Times", "Media Online - Idxchannel.com",
    "Media Online - Inews.id", "Media Online - Investor.id", "Media Online - Jawapos.com",
    "Media Online - Jpnn.com", "Media Online - Kompas.com", "Media Online - Kontan.co.id",
    "Media Online - Kumparan.com", "Media Online - Liputan6.com", "Media Online - Medcom.id",
    "Media Online - Merdeka.com", "Media Online - Okezone", "Media Online - Pikiran-Rakyat.com",
    "Media Online - Republika.co.id", "Media Online - Sindonews.com", "Media Online - Suara.com",
    "Media Online - Tempo.co", "Media Online - The Jakarta Post", "Media Online - Tirto.id",
    "Media Online - Tribunnews.com", "Media Online - Viva.co.id", "Media Online - Warta Ekonomi",
    "Media Online - Warta Kota", "Media Online - Local & Lainnya Media Online",
    // Media Sosial - Twitter (berdasarkan Views/Like)
    "Media Sosial - Twitter Views/Like <=99", "Media Sosial - Twitter Views/Like >=100",
    "Media Sosial - Twitter Views/Like >=1000", "Media Sosial - Twitter Views/Like >=5000",
    "Media Sosial - Twitter Views/Like >=10000", "Media Sosial - Twitter Views/Like >=50000",
    "Media Sosial - Twitter Views/Like >=100000",
    // Media Sosial - Facebook
    "Media Sosial - Facebook Views/Like <=99", "Media Sosial - Facebook Views/Like >=100",
    "Media Sosial - Facebook Views/Like >=1000", "Media Sosial - Facebook Views/Like >=5000",
    "Media Sosial - Facebook Views/Like >=10000", "Media Sosial - Facebook Views/Like >=50000",
    "Media Sosial - Facebook Views/Like >=100000",
    // Media Sosial - Threads
    "Media Sosial - Threads Views/Like <=99", "Media Sosial - Threads Views/Like >=100",
    "Media Sosial - Threads Views/Like >=1000", "Media Sosial - Threads Views/Like >=5000",
    "Media Sosial - Threads Views/Like >=10000", "Media Sosial - Threads Views/Like >=50000",
    "Media Sosial - Threads Views/Like >=100000",
    // Media Sosial - Instagram Feeds
    "Media Sosial - Instagram Feeds Views/Like <=99", "Media Sosial - Instagram Feeds Views/Like >=100",
    "Media Sosial - Instagram Feeds Views/Like >=1000", "Media Sosial - Instagram Feeds Views/Like >=5000",
    "Media Sosial - Instagram Feeds Views/Like >=10000", "Media Sosial - Instagram Feeds Views/Like >=50000",
    "Media Sosial - Instagram Feeds Views/Like >=100000",
    // Media Sosial - Instagram Reels
    "Media Sosial - Instagram Reels Views/Like <=99", "Media Sosial - Instagram Reels Views/Like >=100",
    "Media Sosial - Instagram Reels Views/Like >=1000", "Media Sosial - Instagram Reels Views/Like >=5000",
    "Media Sosial - Instagram Reels Views/Like >=10000", "Media Sosial - Instagram Reels Views/Like >=50000",
    "Media Sosial - Instagram Reels Views/Like >=100000",
    // Media Sosial - TikTok
    "Media Sosial - Tiktok Views/Like <=99", "Media Sosial - Tiktok Views/Like >=100",
    "Media Sosial - Tiktok Views/Like >=1000", "Media Sosial - Tiktok Views/Like >=5000",
    "Media Sosial - Tiktok Views/Like >=10000", "Media Sosial - Tiktok Views/Like >=50000",
    "Media Sosial - Tiktok Views/Like >=100000",
    // Media Sosial - Youtube Short
    "Media Sosial - Youtube Short Views/Like <=99", "Media Sosial - Youtube Short Views/Like >=100",
    "Media Sosial - Youtube Short Views/Like >=1000", "Media Sosial - Youtube Short Views/Like >=5000",
    "Media Sosial - Youtube Short Views/Like >=10000", "Media Sosial - Youtube Short Views/Like >=50000",
    "Media Sosial - Youtube Short Views/Like >=100000",
    // Media Sosial - Youtube Video
    "Media Sosial - Youtube Video Views/Like <=99", "Media Sosial - Youtube Video Views/Like >=100",
    "Media Sosial - Youtube Video Views/Like >=1000", "Media Sosial - Youtube Video Views/Like >=5000",
    "Media Sosial - Youtube Video Views/Like >=10000", "Media Sosial - Youtube Video Views/Like >=50000",
    "Media Sosial - Youtube Video Views/Like >=100000",
    // Media Sosial - KOL Instagram (mulai 5000)
    "Media Sosial - KOL Instagram Views/Like >=5000", "Media Sosial - KOL Instagram Views/Like >=10000",
    "Media Sosial - KOL Instagram Views/Like >=50000", "Media Sosial - KOL Instagram Views/Like >=100000",
    // Media Sosial - KOL Tiktok (mulai 5000)
    "Media Sosial - KOL Tiktok Views/Like >=5000", "Media Sosial - KOL Tiktok Views/Like >=10000",
    "Media Sosial - KOL Tiktok Views/Like >=50000", "Media Sosial - KOL Tiktok Views/Like >=100000",
    // Media Sosial - Homeless Media Reels (mulai 5000)
    "Media Sosial - Homeless Media Reels Views/Like >=5000", "Media Sosial - Homeless Media Reels Views/Like >=10000",
    "Media Sosial - Homeless Media Reels Views/Like >=50000", "Media Sosial - Homeless Media Reels Views/Like >=100000",
    // Media Sosial - Homeless Media Feeds (mulai 5000)
    "Media Sosial - Homeless Media Feeds Views/Like >=5000", "Media Sosial - Homeless Media Feeds Views/Like >=10000",
    "Media Sosial - Homeless Media Feeds Views/Like >=50000", "Media Sosial - Homeless Media Feeds Views/Like >=100000",
  ],
  komunikasiStatus: ["Draft", "Terbit"],
};

export const ROLES = [
  { value: "humas",   label: "Humas" },
  { value: "asman",   label: "Asman" },
  { value: "madm",    label: "MADM" },
  { value: "mitra",   label: "Mitra" },
  { value: "silapak", label: "Si Lapak" },
];

// Akun admin khusus untuk membuka menu "Manajemen Akses" di role Humas.
// TIDAK muncul di daftar user biasa dan tidak bisa diubah lewat halaman admin.
export const ADMIN_CREDENTIALS = {
  role: "humas", username: "admin", password: "admin",
};

// Seed 3 user default sesuai kebutuhan demo. Nanti disimpan di state supaya
// bisa ditambah/edit/dihapus via halaman "Manajemen Akses".
export const DEFAULT_USERS = [
  { id: "u-humas-1", role: "humas", username: "pkl humas", password: "humaspkl26", activeFrom: "2026-01-01", activeTo: "2026-12-31" },
  // signatureUrl & signatureName: dipakai untuk tanda tangan digital RAB/Proposal.
  // Diisi user sendiri lewat halaman pengaturan profil (upload sekali), lalu
  // dipakai berkali-kali tiap kali menandatangani dokumen (lihat lib/signature.js).
  { id: "u-asman-1", role: "asman", username: "2",     password: "2",        activeFrom: "2026-01-01", activeTo: "2026-12-31", nama: "Astri Oktavina", signatureUrl: "/signatures/ttd_asman.png", signatureName: "Astri Oktavina" },
  { id: "u-madm-1",  role: "madm",  username: "3",     password: "3",        activeFrom: "2026-01-01", activeTo: "2026-12-31", nama: "Donny Ureansyah", signatureUrl: "/signatures/ttd_madm.png", signatureName: "Donny Ureansyah" },
  { id: "u-mitra-admin",   role: "mitra",   username: "admin",        password: "admin123",    activeFrom: "2026-01-01", activeTo: "2026-12-31" },
  { id: "u-silapak-1",    role: "silapak", username: "satpam.priok", password: "lapakpriok26", activeFrom: "2026-01-01", activeTo: "2026-12-31" },
];

// Format Date → "YYYY-MM-DD" pakai timezone lokal (bukan UTC).
// Penting: toISOString() berbasis UTC bisa geser 1 hari di WIB (UTC+7).
export function localDateStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Cek apakah user masih dalam rentang tanggal aktif (inclusive).
export function isUserActive(user, today = new Date()) {
  if (!user) return false;
  const t = localDateStr(today);
  if (user.activeFrom && t < user.activeFrom) return false;
  if (user.activeTo && t > user.activeTo) return false;
  return true;
}

// Coba autentikasi (username + password + role) terhadap daftar users.
// Return: { ok, user? , reason? } - reason: "wrong" | "inactive".
export function authenticateUser(users, role, username, password) {
  const match = users.find(
    (u) => u.role === role && u.username === username && u.password === password
  );
  if (!match) return { ok: false, reason: "wrong" };
  if (!isUserActive(match)) return { ok: false, reason: "inactive" };
  return { ok: true, user: match };
}

// Backward compat: beberapa file lama mungkin masih import CREDENTIALS.
export const CREDENTIALS = Object.fromEntries(
  DEFAULT_USERS.map((u) => [u.role, { username: u.username, password: u.password }])
);

// Status lifecycle sebuah paket kas.
export const DOC_STATUS = {
  DRAFT: "draft", SUBMITTED: "submitted", IN_REVIEW: "in_review",
  APPROVED: "approved", REJECTED: "rejected", PROCESSED: "processed",
};

export const STATUS_META = {
  draft:      { label: "Draft",              color: "#94A3B8", bg: "#F1F5F9" },
  submitted:  { label: "Dokumen Baru Masuk", color: "#0E4C92", bg: "#DEEBFA" },
  in_review:  { label: "Belum Dicek",        color: "#8A6D00", bg: "#FFF4D0" },
  approved:   { label: "Disetujui",          color: "#1E7F3E", bg: "#DEF6E5" },
  rejected:   { label: "Ditolak",            color: "#B01818", bg: "#FCE1E1" },
  processed:  { label: "Telah Diproses",     color: "#3F1D9B", bg: "#EBE2FF" },
};

// Sub-dokumen wajib di setiap paket kas (dikelompokkan per ID RAB).
export const SUB_DOCS = [
  { key: "rab",   label: "RAB",              matchKey: "idNumber", required: true },
  { key: "tor",   label: "TOR",              matchKey: "id",       required: true },
  { key: "bast",  label: "BAST",             matchKey: "id",       required: true },
  { key: "pakta", label: "Pakta Integritas", matchKey: "id",       required: true },
];

// Fallback kalau belum ada akun Asman/MADM sama sekali di database (mis.
// database kosong / baru pertama kali load). getPenandaTangan() di bawah
// ini yang dipakai di komponen-komponen dokumen, BUKAN konstanta ini
// langsung - supaya nama penanda tangan otomatis ikut akun yang aktif.
export const PENANDA_TANGAN = {
  madm: { role: "MADM", nama: "Donny Ureansyah" },
  asmanKas: { role: "ASMAN KAS", nama: "Astri Oktavina" },
};

// Cari akun Asman/MADM yang sedang aktif dari daftar user (lihat
// DEFAULT_USERS / ManajemenAkses.jsx) supaya nama penanda tangan di semua
// dokumen (RAB, Form Verifikasi, Cash Card dsb) otomatis mengikuti siapa
// yang login dengan role tsb, bukan nama yang di-hardcode. Kalau ada lebih
// dari satu akun per role, ambil yang statusnya aktif berdasarkan
// activeFrom/activeTo hari ini; kalau tidak ada yang aktif, ambil akun
// pertama dengan role itu sebagai fallback; kalau role itu tidak punya akun
// sama sekali, pakai PENANDA_TANGAN statis di atas.
export function getPenandaTangan(users = []) {
  const today = localDateStr();
  const isActiveToday = (u) => {
    if (!u) return false;
    if (u.activeFrom && u.activeFrom > today) return false;
    if (u.activeTo && u.activeTo < today) return false;
    return true;
  };
  const pick = (role, roleLabelText, fallback) => {
    const candidates = (users || []).filter((u) => u?.role === role);
    const chosen = candidates.find(isActiveToday) || candidates[0];
    if (!chosen) return fallback;
    return {
      role: roleLabelText,
      nama: chosen.nama || chosen.signatureName || fallback.nama,
    };
  };
  return {
    madm: pick("madm", "MADM", PENANDA_TANGAN.madm),
    asmanKas: pick("asman", "ASMAN KAS", PENANDA_TANGAN.asmanKas),
  };
}

export const HELP_CONTACT = {
  phone: "+62 831-9904-4249",
  waNumber: "6283199044249",
  waMessage: "Halo! Saya mengalami problem",
  hours: "Senin-Jumat, 08.00-16.00 WIB",
};

// Struktur sidebar baru — mendukung nesting sampai 3 level (mis. Pembayaran > NON PO > LMP 1).
// Setiap node TANPA `children` = halaman yang bisa diklik (leaf).
// Setiap node DENGAN `children` = grup yang bisa dibuka/ditutup (gak punya halaman sendiri).
export const MENU_TREE = [
  { key: "user-mgmt",      label: "Manajemen Akses",  icon: UserCog,      roles: ["humas"], adminOnly: true },
  { key: "log-aktivitas", label: "Log Aktivitas",    icon: ClipboardList, roles: ["humas"], adminOnly: true },

  { key: "dashboard",       label: "Dashboard", icon: LayoutDashboard, roles: ["humas"] },
  { key: "asman-dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["asman"] },
  { key: "madm-dashboard",  label: "Dashboard", icon: LayoutDashboard, roles: ["madm"] },
  // "Inbox Paket Kas" DIHAPUS dari sidebar - Paket Kas sekarang murni tracking
  // (tidak ada lagi approve/reject, lihat PaketKas.jsx), jadi Inbox.jsx yang
  // mengandalkan status SUBMITTED/APPROVED/REJECTED tidak relevan lagi. Untuk
  // Asman, tracking pembayaran digantikan menu "Tracking Pembayaran" baru
  // (grp-tracking-pembayaran) yang lebih tepat sasaran. Inbox.jsx sendiri
  // TIDAK dihapus filenya, cuma sudah tidak direferensikan di sidebar.
  { key: "inbox-evaluasi",  label: "Inbox Form Evaluasi", icon: FileSearch, roles: ["asman", "madm"] },
  { key: "inbox-proposal",  label: "Inbox Proposal",      icon: Handshake,  roles: ["asman", "madm"] },
  { key: "inbox-pembayaran", label: "Inbox Pembayaran",   icon: Wallet,     roles: ["asman", "madm"] },

  {
    key: "grp-proposal", label: "Publikasi Konten", icon: Megaphone, roles: ["humas"],
    children: [
      { key: "konten", label: "Pengelolaan Komunikasi", icon: Megaphone },
    ],
  },

  {
    key: "grp-mitra", label: "Si Cepat", icon: Building2, roles: ["humas"],
    children: [
      { key: "proposal-rekap",    label: "Rekap Pengajuan Proposal", icon: Handshake },
      { key: "proposal-evaluasi", label: "Form Evaluasi",            icon: FileText },
      { key: "mitra-overview",    label: "Dashboard Mitra",          icon: LayoutDashboard },
      { key: "mitra-tracking",    label: "Tracking Proposal",        icon: Clock },
    ],
  },

  {
    key: "grp-perencanaan", label: "Perencanaan & Anggaran", icon: FileSpreadsheet, roles: ["humas"],
    children: [
      { key: "rab", label: "RAB", icon: FileSpreadsheet },
      { key: "tor", label: "TOR", icon: FileText },
    ],
  },

  {
    key: "grp-pelaksanaan", label: "Pelaksanaan", icon: Camera, roles: ["humas"],
    children: [
      { key: "dokumentasi",  label: "Dokumentasi",  icon: Camera },
      { key: "daftar-hadir", label: "Daftar Hadir", icon: Users },
    ],
  },

  {
    key: "grp-pembayaran", label: "Pembayaran", icon: ClipboardList, roles: ["humas"],
    children: [
      {
        key: "nonpo-overview", hasOwnPage: true, label: "NON PO", icon: FileText,
        children: [
          { key: "lmp1-nonpo",            label: "LMP 1",           icon: FileText },
          { key: "lmp2-nonpo",            label: "LMP 2",           icon: FileText },
          { key: "form-verifikasi-nonpo", label: "Form Verifikasi", icon: FilePlus },
          { key: "bast-nonpo",            label: "BAST",            icon: ClipboardList },
          { key: "pakta-nonpo",           label: "PI",              icon: ShieldCheck },
          { key: "bapp-nonpo",            label: "BAPP",            icon: FileCheck },
        ],
      },
      {
        key: "po-overview", hasOwnPage: true, label: "PO", icon: FileText,
        children: [
          { key: "lmp1-po",            label: "LMP 1",           icon: FileText },
          { key: "lmp2-po",            label: "LMP 2",           icon: FileText },
          { key: "form-verifikasi-po", label: "Form Verifikasi", icon: FilePlus },
          { key: "bast-po",            label: "BAST",            icon: ClipboardList },
          { key: "pakta-po",           label: "PI",              icon: ShieldCheck },
          { key: "bapp-po",            label: "BAPP",            icon: FileCheck },
        ],
      },
      {
        // Cash Card sekarang dipilih dari RAB (sama seperti NON PO/PO di atas) -
        // ccList punya field rabId. Submenu-nya beda: Detail CC (item baris + 4
        // dokumen cetak) gantiin LMP1/LMP2/Form Verifikasi, plus TTD Serah Terima
        // yang gak ada padanannya di NON PO/PO.
        key: "cc-overview", hasOwnPage: true, label: "Cash Card", icon: FileText,
        children: [
          { key: "detail-cc", label: "Detail CC",        icon: FileText },
          { key: "bast-cc",   label: "BAST",              icon: ClipboardList },
          { key: "pakta-cc",  label: "PI",                icon: ShieldCheck },
          { key: "ttd-cc",    label: "TTD Serah Terima",  icon: FilePlus },
          { key: "bapp-cc",   label: "BAPP",              icon: FileCheck },
        ],
      },
      { key: "checklist-dokumen", label: "Tracking Dokumen Selesai", icon: CheckSquare },
    ],
  },

  {
    key: "grp-rka", label: "Rekapitulasi Realisasi Anggaran", icon: BarChart3, roles: ["humas"],
    children: [
      { key: "rka",            label: "RKA",            icon: BarChart3 },
      { key: "rekap-anggaran", label: "Rekap Anggaran", icon: BarChart3 },
    ],
  },

  {
    key: "grp-administrasi", label: "Administrasi", icon: FolderCheck, roles: ["humas"],
    children: [
      { key: "paket-kas", label: "Tracking Kelengkapan Dokumen", icon: FolderCheck },
      {
        // Laporan CC dihapus dari sini - modul Laporan ini sumbernya dari RAB
        // (rabIdOptionsByKategori), sedangkan Cash Card sekarang berdiri sendiri,
        // gak connect ke RAB lagi. Rekap realisasi Cash Card ada di Pertanggungjawaban
        // CC (dicetak per baris Detail CC), bukan di modul Laporan generik ini.
        key: "grp-laporan", label: "Laporan", icon: FileText,
        children: [
          { key: "laporan-nonpo", label: "NON PO", icon: FileText },
          { key: "laporan-po",    label: "PO",      icon: FileText },
        ],
      },
      { key: "vendor", label: "Vendor", icon: Building2 },
    ],
  },

  // Menu khusus Asman: tracking read-only untuk semua pembayaran (PO, Non PO,
  // Cash Card). Beda dari grp-pembayaran di atas (yang khusus Humas, bisa
  // tambah/edit/hapus) - ini cuma untuk LIHAT progres dokumen, tidak ada
  // tombol aksi apapun. Datanya sama persis, cuma halamannya route terpisah
  // supaya bisa dibatasi role tanpa bentrok sama menu Humas.
  {
    key: "grp-tracking-pembayaran", label: "Tracking Pembayaran", icon: ClipboardList, roles: ["asman", "madm"],
    children: [
      { key: "tracking-nonpo", label: "NON PO",    icon: FileText },
      { key: "tracking-po",    label: "PO",         icon: FileText },
      { key: "tracking-cc",    label: "Cash Card",  icon: FileText },
      { key: "checklist-dokumen", label: "Tracking Dokumen Selesai", icon: CheckSquare, roles: ["asman"] },
    ],
  },

  {
    key: "grp-history", label: "History & Guide", icon: Clock,
    children: [
      { key: "history", label: "History", icon: Clock },
      { key: "panduan", label: "Panduan", icon: HelpCircle },
      { key: "notifikasi", label: "Notifikasi", icon: FileCheck },
      // Halaman upload tanda tangan digital - dipakai Asman & MADM untuk
      // simpan gambar tanda tangan mereka sekali, dipakai berkali-kali saat
      // TTD RAB/Proposal (lihat lib/signature.js).
      { key: "pengaturan-profil", label: "Pengaturan Profil", icon: UserCog },
    ],
  },
];

// Diturunkan otomatis dari MENU_TREE — dipakai di tempat-tempat yang butuh daftar
// datar semua halaman (mis. lookup judul halaman aktif untuk breadcrumb Topbar).
// Cukup ubah MENU_TREE di atas; MENU akan selalu ikut sinkron.
function flattenMenuTree(nodes, acc = []) {
  for (const node of nodes) {
    if (node.hasOwnPage) acc.push(node);
    if (node.children) {
      flattenMenuTree(node.children, acc);
    } else if (!node.hasOwnPage) {
      acc.push(node);
    }
  }
  return acc;
}
export const MENU = flattenMenuTree(MENU_TREE);

export const MITRA_STATUS = {
  MENUNGGU_HUMAS: "menunggu_humas",
  DIPROSES_HUMAS: "diproses_humas",
  DITOLAK_HUMAS: "ditolak_humas",
  MENUNGGU_ASMAN: "menunggu_asman",
  DIPROSES_ASMAN: "diproses_asman",
  DITOLAK_ASMAN: "ditolak_asman",
  MENUNGGU_MADM: "menunggu_madm",
  DIPROSES_MADM: "diproses_madm",
  DITOLAK_MADM: "ditolak_madm",
  DISETUJUI: "disetujui",
};

export const MITRA_STATUS_META = {
  menunggu_humas: { label: "Menunggu Proses",     color: "#8A6D00", bg: "#FFF4D0", step: 1 },
  diproses_humas: { label: "Diproses oleh Humas", color: "#0E4C92", bg: "#DEEBFA", step: 1 },
  ditolak_humas:  { label: "Ditolak",             color: "#B01818", bg: "#FCE1E1", step: 1 },
  menunggu_asman: { label: "Menunggu Proses",     color: "#8A6D00", bg: "#FFF4D0", step: 2 },
  diproses_asman: { label: "Diproses oleh Asman", color: "#0E4C92", bg: "#DEEBFA", step: 2 },
  ditolak_asman:  { label: "Ditolak",             color: "#B01818", bg: "#FCE1E1", step: 2 },
  menunggu_madm:  { label: "Menunggu Proses",     color: "#8A6D00", bg: "#FFF4D0", step: 3 },
  diproses_madm:  { label: "Diproses oleh MADM",  color: "#0E4C92", bg: "#DEEBFA", step: 3 },
  ditolak_madm:   { label: "Ditolak",             color: "#B01818", bg: "#FCE1E1", step: 3 },
  disetujui:      { label: "Disetujui",           color: "#1E7F3E", bg: "#DEF6E5", step: 4 },
};
