/**
 * BACKEND DATABASE PORTAL DIGITAL CSR PLN IP UBP PRIOK
 * (SAKTI - SI LAPAK PRIOK - SI CEPAT)
 * Versi Engine: 4.1.0 (Row-Oriented & Partisi Normal)
 */

const DB_VERSION = "4.2.0";
const DB_SCHEMA_ID = "csr-db-row-oriented-v4.2";
const ATTACHMENT_FOLDER = "WEB CSR - Lampiran Database";
const DEFAULT_SPREADSHEET_ID = "1m8Xd_eXMzudvDrqfSme8rfIE6RiIA1MRoId9bwZVopg";

// Cache execution scope
let SPREADSHEET_CACHE_ = null;
let SHEET_CACHE_ = null;

// Folder Google Drive untuk Lampiran
const DRIVE_UPLOAD_FOLDERS = {
  rabTor: {
    id: "1Dyhu5qhiEKxsj_oZVJhWMMDGBDkYU9_J",
    url: "https://drive.google.com/drive/folders/1Dyhu5qhiEKxsj_oZVJhWMMDGBDkYU9_J",
  },
  dokumentasi: {
    id: "1Sfc-xGMLW2J_fjIrnpSr1So1bnc9jjwX",
    url: "https://drive.google.com/drive/folders/1Sfc-xGMLW2J_fjIrnpSr1So1bnc9jjwX",
  },
  daftarHadir: {
    id: "1veVXpTBXrZW2PXgab74An5OvcLYCoD3s",
    url: "https://drive.google.com/drive/folders/1veVXpTBXrZW2PXgab74An5OvcLYCoD3s",
  },
  eviden: {
    id: "12tkKcA_A92-nt_CJRlt1NL_mEVjv1QpD",
    url: "https://drive.google.com/drive/folders/12tkKcA_A92-nt_CJRlt1NL_mEVjv1QpD",
  },
  proposalSiCepat: {
    id: "1aTaH0tY7nVr1Qz3jlTGE-apERhf-rYf5",
    url: "https://drive.google.com/drive/folders/1aTaH0tY7nVr1Qz3jlTGE-apERhf-rYf5",
  },
  fotoSiLapak: {
    id: "1E6utgHJnerGeWBBqmxHHyhpW1cfAyd12",
    url: "https://drive.google.com/drive/folders/1E6utgHJnerGeWBBqmxHHyhpW1cfAyd12",
  },
  signature: {
    id: "1OYWn_XQLa7zBZxIpx6irtYBBoIR_G36W",
    url: "https://drive.google.com/drive/folders/1OYWn_XQLa7zBZxIpx6irtYBBoIR_G36W",
  },
};

// Pemetaan Dataset Aplikasi ke Tab Spreadsheet
const DATASETS = {
  users: { sheet: "Users", key: "id" },
  organizations: { sheet: "Organizations", key: "id" },
  vendors: { sheet: "Vendors", key: "id" },
  rab: {
    sheet: "RAB",
    key: "idNumber",
    children: [
      { field: "items", sheet: "RAB_Items", parent: "rabId", key: "id" },
    ],
  },
  tor: { sheet: "TOR", key: "id" },
  bast: {
    sheet: "BAST_NON_PO",
    key: "id",
    partition: {
      field: "kategori",
      sheets: { "NON PO": "BAST_NON_PO", PO: "BAST_PO" },
      fallback: "BAST_Lain",
    },
  },
  pakta: {
    sheet: "Pakta_NON_PO",
    key: "id",
    partition: {
      field: "kategori",
      sheets: { "NON PO": "Pakta_NON_PO", PO: "Pakta_PO" },
      fallback: "Pakta_Lain",
    },
  },
  bapp: {
    sheet: "BAPP_NON_PO",
    key: "id",
    legacySheets: ["BAPP"],
    partition: {
      field: "kategori",
      sheets: { "NON PO": "BAPP_NON_PO", PO: "BAPP_PO" },
      fallback: "BAPP_Lain",
    },
  },
  lmp1List: {
    sheet: "LMP1",
    key: "submissionId",
    children: [
      {
        field: "items",
        sheet: "LMP1_Items",
        parent: "submissionId",
        key: "id",
      },
    ],
  },
  lmp2List: { sheet: "LMP2", key: "submissionId" },
  formVerifList: { sheet: "FormVerifikasi", key: "rabId" },
  dokumentasiDocs: { sheet: "Dokumentasi", key: "id" },
  daftarHadirList: { sheet: "DaftarHadir_Peserta", key: "id" },
  daftarHadirDocs: { sheet: "DaftarHadir_File", key: "id" },
  evidens: { sheet: "Eviden", key: "id" },
  nonpoSubmissions: {
    sheet: "Pengajuan_NON_PO",
    key: "id",
    partition: {
      field: "kategori",
      sheets: { "NON PO": "Pengajuan_NON_PO", PO: "Pengajuan_PO" },
      fallback: "Pengajuan_Lain",
    },
  },
  poDocuments: { sheet: "PO_ERP", key: "_mapKey", objectMap: true },
  laporan: {
    sheet: "Laporan_NON_PO",
    key: "id",
    partition: {
      field: "kategori",
      sheets: { "NON PO": "Laporan_NON_PO", PO: "Laporan_PO" },
      fallback: "Laporan_Lain",
    },
  },
  rka: { sheet: "RKA", key: "id" },
  ccList: { sheet: "CashCard", key: "id" },
  ccItems: { sheet: "CashCard_Items", key: "id" },
  ccBast: { sheet: "CashCard_BAST", key: "id" },
  ccPakta: { sheet: "CashCard_Pakta", key: "id" },
  ccBapp: { sheet: "CashCard_BAPP", key: "id" },
  ccTtd: {
    sheet: "CashCard_TTD",
    key: "id",
    children: [
      {
        field: "kegiatan",
        sheet: "CashCard_TTD_Kegiatan",
        parent: "ttdId",
        key: "id",
      },
    ],
  },
  ccVerifikasi: { sheet: "CashCard_Verifikasi", key: "id" },
  ccPermintaan: { sheet: "CashCard_Permintaan", key: "id" },
  ccRencana: { sheet: "CashCard_Rencana", key: "id" },
  ccPertanggungjawaban: { sheet: "CashCard_Pertanggungjawaban", key: "id" },
  packages: { sheet: "PaketKas", key: "idRab" },
  paymentPackages: { sheet: "Payment", key: "id" },
  proposals: {
    sheet: "Proposal",
    key: "id",
    children: [
      {
        field: "bast",
        sheet: "Proposal_BAST",
        parent: "proposalId",
        singleton: true,
      },
      {
        field: "pakta",
        sheet: "Proposal_PI",
        parent: "proposalId",
        singleton: true,
      },
    ],
  },
  evaluasi: { sheet: "Proposal_Evaluasi", key: "id" },
  konten: {
    sheet: "Konten",
    key: "id",
    children: [
      {
        field: "publikasi",
        sheet: "Konten_Publikasi",
        parent: "kontenId",
        key: "id",
      },
    ],
  },
  mitraList: {
    sheet: "Mitra_Pengajuan",
    key: "id",
    children: [
      { field: "timeline", sheet: "Mitra_Timeline", parent: "mitraId" },
    ],
  },
  history: { sheet: "LogAktivitas", key: "id" },
  nonpoCombo: { sheet: "Master_NON_PO", optionMap: true },
  ccCombo: { sheet: "Master_CashCard", optionMap: true },
  komunikasiNarasumberOptions: { sheet: "Master_Narasumber", scalarList: true },
  silapakPaket: { sheet: "SiLapak_Paket", key: "id" },
  silapakTamu: { sheet: "SiLapak_BukuTamu", key: "id" },
  // Keduanya disimpan pada satu tab fisik agar data duty dan master satpam
  // tidak terpisah. Frontend tetap memakai dua dataset seperti sebelumnya.
  silapakDuty: { sheet: "SiLapak_Duty", singleton: true, sharedSilapak: true },
  silapakSatpam: {
    sheet: "SiLapak_Duty",
    scalarList: true,
    sharedSilapak: true,
  },
};

// Header Awal Setiap Tab Spreadsheet
const SHEET_HEADERS = {
  _DB_Meta: ["key", "value", "updatedAt"],
  Users: [
    "id",
    "username",
    "password",
    "role",
    "nama",
    "isAdmin",
    "active",
    "activeFrom",
    "activeTo",
    "signatureUrl",
    "signatureName",
  ],
  Organizations: ["id", "source_id", "name", "category"],
  Vendors: ["id", "nama", "alamat", "npwp", "kontak"],
  RAB: [
    "idNumber",
    "judulKegiatan",
    "kategori",
    "tanggalRab",
    "tanggalInput",
    "totalPengajuan",
    "totalVendor",
    "totalEvaluasi",
    "totalEvaluasiVendor",
    "pelaksanaanSelesai",
    "dokumenTor__fileName",
    "dokumenTor__url",
    "signatureAsman__signatureUrl",
    "signatureAsman__signatureName",
    "signatureAsman__signedAt",
    "signatureMadm__signatureUrl",
    "signatureMadm__signatureName",
    "signatureMadm__signedAt",
    "reviewCommentAsman",
    "reviewCommentAsmanAt",
    "reviewCommentAsmanBy",
    "reviewCommentMadm",
    "reviewCommentMadmAt",
    "reviewCommentMadmBy",
  ],
  RAB_Items: [
    "rabId",
    "id",
    "uraian",
    "qty",
    "satuan",
    "hargaSatuan",
    "ppn",
    "qtyEvaluasi",
    "hargaSatuanEvaluasi",
    "ppnEvaluasi",
    "keterangan",
    "keteranganPemakaian",
    "basePengajuan",
    "baseVendor",
    "baseEvaluasi",
    "baseEvaluasiVendor",
    "hargaSatuanVendor",
    "hargaSatuanEvaluasiVendor",
    "ppnNilaiPengajuan",
    "ppnNilaiVendor",
    "ppnNilaiEvaluasi",
    "ppnNilaiEvaluasiVendor",
    "totalPengajuan",
    "totalVendor",
    "totalEvaluasi",
    "totalEvaluasiVendor",
    "_order",
  ],
  TOR: [
    "id",
    "judulProgramRKA",
    "judulKegiatan",
    "kategori",
    "latarBelakang",
    "tujuanUmum",
    "tujuanKhusus",
    "sasaran",
    "hariTanggal",
    "tempat",
    "narasumber",
    "tanggalInput",
  ],
  BAST_NON_PO: [
    "id",
    "kategori",
    "nomor",
    "judulBantuan",
    "tanggal",
    "namaPihakKedua",
    "jabatanPihakKedua",
    "instansiPihakKedua",
    "jumlahBantuan",
  ],
  BAST_PO: [
    "id",
    "kategori",
    "nomor",
    "judulBantuan",
    "tanggal",
    "namaPihakKedua",
    "jabatanPihakKedua",
    "instansiPihakKedua",
    "jumlahBantuan",
  ],
  BAST_Lain: [
    "id",
    "kategori",
    "nomor",
    "judulBantuan",
    "tanggal",
    "namaPihakKedua",
    "jabatanPihakKedua",
    "instansiPihakKedua",
    "jumlahBantuan",
  ],
  Pakta_NON_PO: [
    "id",
    "kategori",
    "judulBantuan",
    "tanggalPi",
    "lembagaPenerima",
    "namaPenerima",
    "jabatan",
  ],
  Pakta_PO: [
    "id",
    "kategori",
    "judulBantuan",
    "tanggalPi",
    "lembagaPenerima",
    "namaPenerima",
    "jabatan",
  ],
  Pakta_Lain: [
    "id",
    "kategori",
    "judulBantuan",
    "tanggalPi",
    "lembagaPenerima",
    "namaPenerima",
    "jabatan",
  ],
  BAPP_NON_PO: ["id", "kategori", "tanggal", "judulKegiatan", "status"],
  BAPP_PO: ["id", "kategori", "tanggal", "judulKegiatan", "status"],
  BAPP_Lain: ["id", "kategori", "tanggal", "judulKegiatan", "status"],
  LMP1: [
    "submissionId",
    "pengajuanId",
    "grandTotal",
    "savedAt",
    "form__tanggal",
    "form__namaPengadaan",
    "form__procost",
    "form__expType",
    "form__task",
    "form__expOrg",
    "form__ppn",
    "form__vendor1",
    "form__vendor2",
    "form__vendor3",
  ],
  LMP1_Items: [
    "submissionId",
    "id",
    "uraian",
    "qty",
    "satuan",
    "hargaVendor1",
    "ppn",
    "faktor",
    "base",
    "ppnNilai",
    "total",
    "_order",
  ],
  LMP2: [
    "submissionId",
    "savedAt",
    "form__nilaiPenawaran",
    "form__nilaiNegosiasi",
    "form__tanggalNegosiasi",
    "form__pelaksanaPekerjaan",
    "form__vendor",
    "form__keterangan",
  ],
  FormVerifikasi: [
    "rabId",
    "submissionId",
    "nomorVerifikasi",
    "tanggal",
    "kegiatan",
    "jumlahBiaya",
    "terbilang",
    "kepada",
    "tpb",
    "procost",
    "catatan",
    "savedAt",
  ],
  Dokumentasi: [
    "id",
    "rabId",
    "judulRab",
    "fileId",
    "fileName",
    "fileSize",
    "fileType",
    "url",
    "keterangan",
    "uploadedAt",
  ],
  DaftarHadir_Peserta: ["id", "rabId", "nama", "instansi", "waktu"],
  DaftarHadir_File: [
    "id",
    "rabId",
    "fileId",
    "fileName",
    "fileSize",
    "fileType",
    "url",
  ],
  Eviden: [
    "id",
    "rabId",
    "judulRab",
    "fileId",
    "fileName",
    "fileSize",
    "fileType",
    "url",
    "keterangan",
    "uploadedAt",
  ],
  Pengajuan_NON_PO: [
    "id",
    "kategori",
    "rabId",
    "bidang",
    "tanggalKegiatan",
    "judulKegiatan",
    "program",
    "subprogram",
    "kategoriProgram",
    "createdAt",
  ],
  Pengajuan_PO: [
    "id",
    "kategori",
    "rabId",
    "bidang",
    "tanggalKegiatan",
    "judulKegiatan",
    "program",
    "subprogram",
    "kategoriProgram",
    "createdAt",
  ],
  Pengajuan_Lain: [
    "id",
    "kategori",
    "rabId",
    "bidang",
    "tanggalKegiatan",
    "judulKegiatan",
    "program",
    "subprogram",
    "kategoriProgram",
    "createdAt",
  ],
  PO_ERP: ["_mapKey", "rabId", "idPo", "idBast", "idBapb", "tanggal", "status"],
  Laporan_NON_PO: [
    "id",
    "kategori",
    "procost",
    "expType",
    "judulProgram",
    "programInduk",
    "tpb",
    "lembagaPemohon",
    "namaBarang",
    "jumlahBarang",
    "satuan",
    "kuantifikasiBantuan",
    "satuanKuantifikasi",
    "hargaTotal",
    "jumlahPenerima",
    "satuanPenerima",
    "namaInstansiPenerima",
    "lakiLaki",
    "perempuan",
  ],
  Laporan_PO: [
    "id",
    "kategori",
    "procost",
    "expType",
    "judulProgram",
    "programInduk",
    "tpb",
    "lembagaPemohon",
    "namaBarang",
    "jumlahBarang",
    "satuan",
    "kuantifikasiBantuan",
    "satuanKuantifikasi",
    "hargaTotal",
    "jumlahPenerima",
    "satuanPenerima",
    "namaInstansiPenerima",
    "lakiLaki",
    "perempuan",
  ],
  Laporan_Lain: [
    "id",
    "kategori",
    "procost",
    "expType",
    "judulProgram",
    "programInduk",
    "tpb",
    "lembagaPemohon",
    "namaBarang",
    "jumlahBarang",
    "satuan",
    "kuantifikasiBantuan",
    "satuanKuantifikasi",
    "hargaTotal",
    "jumlahPenerima",
    "satuanPenerima",
    "namaInstansiPenerima",
    "lakiLaki",
    "perempuan",
  ],
  RKA: ["id", "uraian", "kodePC", "jenisKegiatanCsr", "tahun", "jumlahRka"],
  CashCard: [
    "id",
    "rabId",
    "judulCc",
    "tanggal",
    "bidang",
    "saldoKas",
    "procost",
    "createdAt",
  ],
  CashCard_Items: [
    "id",
    "ccId",
    "uraian",
    "expType",
    "tanggalKegiatan",
    "jumlah",
    "satuan",
    "hargaSatuan",
    "createdAt",
    "updatedAt",
    "tanggal",
  ],
  CashCard_BAST: [
    "id",
    "nomor",
    "judulBantuan",
    "tanggal",
    "namaPihakKedua",
    "jabatanPihakKedua",
    "instansiPihakKedua",
    "jumlahBantuan",
  ],
  CashCard_Pakta: [
    "id",
    "judulBantuan",
    "tanggalPi",
    "lembagaPenerima",
    "namaPenerima",
    "jabatan",
    "namaMitra",
  ],
  CashCard_BAPP: ["id", "tanggal", "judulKegiatan", "status", "generatedAt"],
  CashCard_TTD: [
    "id",
    "ccId",
    "judul",
    "tanggal",
    "pihakPertama",
    "pihakKedua",
    "savedAt",
  ],
  CashCard_TTD_Kegiatan: [
    "ttdId",
    "id",
    "nama",
    "keterangan",
    "jumlah",
    "_order",
  ],
  CashCard_Verifikasi: [
    "id",
    "ccId",
    "nomor",
    "tanggal",
    "status",
    "generatedAt",
  ],
  CashCard_Permintaan: [
    "id",
    "ccId",
    "nomor",
    "tanggal",
    "nilai",
    "generatedAt",
  ],
  CashCard_Rencana: ["id", "ccId", "tanggal", "uraian", "nilai", "generatedAt"],
  CashCard_Pertanggungjawaban: [
    "id",
    "ccId",
    "tanggal",
    "uraian",
    "nilai",
    "status",
    "generatedAt",
  ],
  PaketKas: [
    "idRab",
    "judul",
    "kategori",
    "formEvaluasi",
    "status",
    "submittedAt",
    "reviewedAt",
    "reviewedBy",
    "reviewNote",
    "processedAt",
    "processedBy",
    "processNote",
    "rejectedBy",
  ],
  Payment: [
    "id",
    "rabId",
    "kategori",
    "status",
    "submittedAt",
    "reviewedAt",
    "reviewedBy",
    "reviewNote",
    "processedAt",
    "processedBy",
    "processNote",
    "rejectedBy",
  ],
  Proposal: [
    "id",
    "tanggalMasuk",
    "namaLembaga",
    "judulProposal",
    "tanggalKegiatan",
    "lokasiKegiatan",
    "program",
    "penerimaLakiLaki",
    "penerimaPerempuan",
    "namaPenerimaManfaat",
    "nilaiDiajukan",
    "approvedBudget",
    "itemDiminta",
    "jabatanKontak",
    "kontakPIC",
    "fileProposal__fileName",
    "fileProposal__url",
    "statusProposal",
    "catatanInternal",
    "status",
    "createdAt",
    "reviewedBy",
    "reviewedAt",
    "reviewNote",
    "processedBy",
    "processedAt",
    "processNote",
    "rejectedBy",
    "signatureAsman__signatureUrl",
    "signatureAsman__signatureName",
    "signatureAsman__signedAt",
    "signatureMadm__signatureUrl",
    "signatureMadm__signatureName",
    "signatureMadm__signedAt",
  ],
  Proposal_BAST: [
    "proposalId",
    "tanggalBast",
    "namaPihakKedua",
    "jabatanPihakKedua",
    "uraianBantuan",
  ],
  Proposal_PI: ["proposalId", "tanggalPi", "namaPenerima"],
  Proposal_Evaluasi: [
    "id",
    "proposalId",
    "namaLembaga",
    "judulProposal",
    "penilai",
    "tanggalPenilaian",
    "nilai",
    "catatan",
    "skorAkhir",
    "keputusan",
    "status",
    "reviewedBy",
    "reviewedAt",
    "reviewNote",
    "processedBy",
    "processedAt",
    "processNote",
    "rejectedBy",
  ],
  Konten: [
    "id",
    "tanggal",
    "kategori",
    "narasumber",
    "judul",
    "lampiran__fileName",
    "lampiran__url",
    "status",
  ],
  Konten_Publikasi: [
    "kontenId",
    "id",
    "kanal",
    "tanggal",
    "tautan",
    "status",
    "_order",
  ],
  Mitra_Pengajuan: [
    "id",
    "ownerAccountId",
    "ownerEmail",
    "namaLembaga",
    "alamatLembaga",
    "namaPIC",
    "teleponPIC",
    "emailPIC",
    "judulPengajuan",
    "nilaiDiajukan",
    "catatan",
    "proposalFile__fileName",
    "proposalFile__url",
    "status",
    "createdAt",
  ],
  Mitra_Timeline: ["mitraId", "status", "tanggal", "oleh", "catatan", "_order"],
  LogAktivitas: [
    "id",
    "jenis",
    "tanggal",
    "waktu",
    "timestamp",
    "username",
    "role",
  ],
  Master_NON_PO: ["group", "value", "order"],
  Master_CashCard: ["group", "value", "order"],
  Master_Narasumber: ["value", "order"],
  SiLapak_Paket: [
    "id",
    "jenis",
    "namaPenerima",
    "ekspedisi",
    "noResi",
    "asalSurat",
    "noSurat",
    "perihal",
    "satpam",
    "status",
    "diterimaTanggal",
    "diterimaJam",
    "pengambil",
    "satpamTugasAmbil",
    "bulanKeluar",
    "fotoBukti__fileId",
    "fotoBukti__fileName",
    "fotoBukti__fileType",
    "fotoBukti__fileSize",
    "fotoBukti__url",
  ],
  SiLapak_BukuTamu: [
    "id",
    "tanggal",
    "jam",
    "namaTamu",
    "tujuan",
    "pegawai",
    "status",
    "jamKeluar",
  ],
  // Satu tab untuk duty + master satpam.
  // Kolom shift/names dipakai duty; value/order dipakai daftar satpam.
  SiLapak_Duty: ["shift", "names", "submittedAt"],
};

// Field peninggalan data contoh lama yang tidak lagi tersedia pada form frontend.
// Field ini dibuang saat database ditulis ulang agar kolomnya hilang dari tab.
const OMIT_FIELDS_BY_SHEET = {
  Proposal: [
    "sumberPengaju",
    "kontakTelp",
    "kontakEmail",
    "jenisProgram",
    "subprogram",
    "ringkasan",
  ],
  RAB_Items: [
    "volume",
    "jumlah",
    "hargaVendor1",
    "hargaVendor2",
    "hargaVendor3",
    "total",
    "catatan",
  ],
  LMP1_Items: ["hargaSatuan", "hargaVendor2", "hargaVendor3"],
  CashCard_Items: ["qty", "harga"],
  SiLapak_Paket: ["diterimaAt", "tanggalKey", "diambilAt"],
  SiLapak_BukuTamu: ["tanggalKey", "masukAt", "keluarAt"],
};

// Metadata teknis berikut tidak dipakai frontend dan hanya menggandakan
// informasi link/lokasi file pada Spreadsheet.
const OMIT_FIELD_SUFFIXES = ["downloadUrl", "folderKey"];

const META_SHEET = "_DB_Meta";
const CELL_TAG = "~csr3:";
let TABLE_CACHE_ = null;

function fail_(code, message) {
  const error = new Error(message);
  error.code = code;
  throw error;
}

function plain_(value) {
  return (
    value !== null &&
    Object.prototype.toString.call(value) === "[object Object]"
  );
}

function own_(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function clone_(value) {
  return JSON.parse(JSON.stringify(value));
}

function unique_(items) {
  return Array.from(new Set(items));
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function withLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    TABLE_CACHE_ = null;
    return fn();
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json_({
    ok: true,
    service: "WEB CSR DATABASE",
    version: DB_VERSION,
    schemaId: DB_SCHEMA_ID,
  });
}

function doPost(e) {
  const requestId = Utilities.getUuid();
  try {
    const raw = (e && e.postData && e.postData.contents) || "{}";
    let body = {};
    try {
      body = JSON.parse(raw);
    } catch (_) {
      fail_("VALIDATION", "Request body bukan format JSON valid.");
    }
    if (!plain_(body)) fail_("VALIDATION", "Request harus berupa object.");
    let result;
    switch (body.action) {
      case "loadDatabase":
        result = loadDatabase_(body.datasetKeys);
        break;
      case "saveDatabase":
        result = saveDatabase_(body.datasets);
        break;
      case "uploadFile":
        result = uploadFile_(body);
        break;
      case "health":
        result = databaseHealth_(false);
        break;
      default:
        fail_("UNKNOWN_ACTION", "Action '" + body.action + "' tidak dikenal.");
    }
    return json_(Object.assign({ requestId: requestId }, result));
  } catch (error) {
    console.error(
      requestId + ": " + (error.stack || error.message || String(error)),
    );
    return json_({
      ok: false,
      requestId: requestId,
      code: error.code || "SERVER_ERROR",
      error: error.message || String(error),
    });
  }
}

function uploadFile_(body) {
  let base64Data = "";
  let mimeType = String(
    body.mimeType || body.fileType || "application/octet-stream",
  );

  if (body.dataUrl) {
    const match = String(body.dataUrl).match(/^data:([^;]+);base64,(.+)$/);
    if (!match) throw new Error("Format dataUrl file tidak valid.");
    mimeType = match[1];
    base64Data = match[2];
  } else if (body.base64) {
    base64Data = String(body.base64);
  } else {
    throw new Error("File data (dataUrl atau base64) wajib diisi.");
  }

  if (base64Data.length > 14000000)
    throw new Error("File terlalu besar; maksimum ukuran 10 MB.");
  const folderKey = String(body.folderKey || "");
  if (
    folderKey &&
    folderKey !== "default" &&
    !own_(DRIVE_UPLOAD_FOLDERS, folderKey)
  ) {
    throw new Error("folderKey tidak dikenal: " + folderKey);
  }

  const bytes = Utilities.base64Decode(base64Data);
  const safeName = buildUploadFileName_(body, mimeType);
  const file = uploadFolder_(folderKey).createFile(
    Utilities.newBlob(bytes, mimeType, safeName),
  );

  if (
    PropertiesService.getScriptProperties().getProperty(
      "PUBLIC_ATTACHMENTS",
    ) !== "false"
  ) {
    try {
      file.setSharing(
        DriveApp.Access.ANYONE_WITH_LINK,
        DriveApp.Permission.VIEW,
      );
    } catch (_) {}
  }

  return {
    ok: true,
    file: {
      fileId: file.getId(),
      fileName: file.getName(),
      fileType: mimeType,
      fileSize: bytes.length,
      url: "https://drive.google.com/uc?export=view&id=" + file.getId(),
    },
  };
}

function spreadsheet_() {
  if (SPREADSHEET_CACHE_) return SPREADSHEET_CACHE_;
  const id =
    PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID") ||
    DEFAULT_SPREADSHEET_ID;
  SPREADSHEET_CACHE_ = SpreadsheetApp.openById(id);
  return SPREADSHEET_CACHE_;
}

function sheet_(sheetName, createIfMissing) {
  const ss = spreadsheet_();
  if (!SHEET_CACHE_) {
    SHEET_CACHE_ = {};
    ss.getSheets().forEach(function (sheet) {
      SHEET_CACHE_[sheet.getName()] = sheet;
    });
  }
  let sheet = SHEET_CACHE_[sheetName] || null;
  if (!sheet && createIfMissing) {
    sheet = ss.insertSheet(sheetName);
    SHEET_CACHE_[sheetName] = sheet;
  }
  return sheet;
}

function clearSpreadsheetCache_() {
  SPREADSHEET_CACHE_ = null;
  SHEET_CACHE_ = null;
}

function uploadFolder_(folderKey) {
  const config = DRIVE_UPLOAD_FOLDERS[String(folderKey || "")];
  if (config && config.id) {
    try {
      return DriveApp.getFolderById(config.id);
    } catch (_) {
      throw new Error(
        "Folder Drive tidak dapat diakses untuk jenis upload: " + folderKey,
      );
    }
  }
  return attachmentFolder_();
}

function buildUploadFileName_(body, mimeType) {
  // Format standar seluruh upload:
  // ID_JENIS_FILE_JUDUL.ext
  // Contoh: 001_RAB_pembangunan jalan.pdf
  const type = fileNameToken_(body.documentType, "LAMPIRAN");
  const rawTitle = safeFilePart_(body.title, "TANPA JUDUL");
  const rawId =
    body.recordId || body.rabId || body.id || extractUploadId_(rawTitle);
  const id = uploadIdToken_(rawId);
  const title = uploadTitleToken_(rawTitle, id);

  // Nama final selalu mengikuti pola yang sama, tanpa mengubah alur upload.
  return (
    [id, type, title].filter(Boolean).join("_") +
    fileExtension_(body.fileName, mimeType)
  );
}

function extractUploadId_(title) {
  const match = String(title || "")
    .trim()
    .match(/^([^_\s]+)_/);
  return match ? match[1] : "";
}

function uploadIdToken_(value) {
  // ID file harus sama dengan ID yang dikirim frontend.
  // Jangan mengubah RAB-2026-001 menjadi 001 atau memotong bagian ID lainnya.
  const raw = String(value || "").trim();
  if (!raw) return "ID";
  return safeFilePart_(raw, "ID").replace(/\s+/g, "_");
}

function uploadTitleToken_(value, id) {
  let title = safeFilePart_(value, "TANPA JUDUL");
  // Hindari ID muncul dua kali karena beberapa halaman lama memang mengirim
  // title dalam bentuk "ID_Judul".
  if (id && title.toLowerCase().startsWith(String(id).toLowerCase() + "_")) {
    title = title.slice(String(id).length + 1);
  }
  // Jika ID dikirim sebagai RAB-2026-001, buang juga bentuk ID lengkapnya.
  const idMatch = String(value || "").match(/^([^_\s]+)_/);
  if (idMatch && title === String(value || "").trim()) {
    title = title.slice(idMatch[1].length + 1);
  }
  return title || "TANPA JUDUL";
}

function fileNameToken_(value, fallback) {
  const token = safeFilePart_(value, fallback)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  return token || fallback;
}

function safeFilePart_(value, fallback) {
  const clean = String(value || "")
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/[\u0000-\u001F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return (clean || fallback).slice(0, 140);
}

function fileExtension_(fileName, mimeType) {
  const match = String(fileName || "").match(/(\.[A-Za-z0-9]{1,8})$/);
  if (match) return match[1].toLowerCase();
  const byMime = {
    "application/pdf": ".pdf",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      ".docx",
    "application/vnd.ms-excel": ".xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      ".xlsx",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  };
  return byMime[String(mimeType || "").toLowerCase()] || "";
}

function attachmentFolder_() {
  const props = PropertiesService.getScriptProperties();
  const savedId = props.getProperty("ATTACHMENT_FOLDER_ID");
  if (savedId) {
    try {
      return DriveApp.getFolderById(savedId);
    } catch (_) {}
  }
  const folders = DriveApp.getFoldersByName(ATTACHMENT_FOLDER);
  const folder = folders.hasNext()
    ? folders.next()
    : DriveApp.createFolder(ATTACHMENT_FOLDER);
  props.setProperty("ATTACHMENT_FOLDER_ID", folder.getId());
  return folder;
}

function datasetKeys_(requested) {
  if (requested !== undefined && !Array.isArray(requested))
    fail_("VALIDATION", "datasetKeys harus array.");
  const keys = unique_(
    requested && requested.length ? requested : Object.keys(DATASETS),
  );
  keys.forEach(function (key) {
    if (!own_(DATASETS, key))
      fail_("VALIDATION", "Dataset tidak terdaftar: " + key);
  });
  return keys;
}

function namesFor_(spec) {
  return unique_(
    [spec.sheet].concat(
      spec.partition
        ? Object.keys(spec.partition.sheets)
            .map(function (k) {
              return spec.partition.sheets[k];
            })
            .concat(spec.partition.fallback)
        : [],
      (spec.children || []).map(function (c) {
        return c.sheet;
      }),
    ),
  );
}

function allSheetNames_() {
  return unique_(
    Object.keys(DATASETS).reduce(
      function (a, k) {
        return a.concat(namesFor_(DATASETS[k]));
      },
      [META_SHEET],
    ),
  );
}

function initialHeaders_(name) {
  if (own_(SHEET_HEADERS, name)) return SHEET_HEADERS[name].slice();
  for (const key of Object.keys(DATASETS)) {
    const spec = DATASETS[key];
    for (const child of spec.children || [])
      if (child.sheet === name) return [child.parent, "_order"];
    if (namesFor_(spec).indexOf(name) >= 0)
      return spec.optionMap
        ? ["group", "value", "order"]
        : spec.scalarList
          ? ["value", "order"]
          : [spec.key || "value"];
  }
  return ["id"];
}

function databaseHealth_(details) {
  const ss = spreadsheet_();
  const actual = ss.getSheets().map(function (s) {
    return s.getName();
  });
  const missing = allSheetNames_().filter(function (n) {
    return actual.indexOf(n) < 0;
  });
  const result = {
    ok: !missing.length,
    version: DB_VERSION,
    schemaId: DB_SCHEMA_ID,
    datasetCount: Object.keys(DATASETS).length,
    expectedSheetCount: allSheetNames_().length,
    missingSheets: missing,
  };
  if (details) {
    result.spreadsheetId = ss.getId();
    result.spreadsheetName = ss.getName();
  }
  return result;
}

function prefetch_(names) {
  TABLE_CACHE_ = TABLE_CACHE_ || Object.create(null);
  const missing = unique_(names).filter(function (n) {
    return !own_(TABLE_CACHE_, n);
  });
  const available = missing.filter(function (n) {
    return !!sheet_(n, false);
  });
  missing.forEach(function (n) {
    TABLE_CACHE_[n] = [];
  });
  if (!available.length) return;
  available.forEach(function (name) {
    const s = sheet_(name, false);
    TABLE_CACHE_[name] =
      s && s.getLastRow() ? s.getDataRange().getValues() : [];
  });
}

function loadDatabase_(requested) {
  const keys = datasetKeys_(requested);
  if (
    PropertiesService.getScriptProperties().getProperty(
      "DB_WRITE_RECOVERY_REQUIRED",
    )
  ) {
    fail_(
      "RECOVERY_REQUIRED",
      "Penulisan terputus. Periksa inspectRecoveryStatus() sebelum memuat database.",
    );
  }
  const health = databaseHealth_(false);
  if (!health.ok)
    fail_(
      "SETUP_REQUIRED",
      "Jalankan setupDatabase() untuk membuat tab yang belum ada.",
    );
  prefetch_(
    keys.reduce(function (a, k) {
      return a.concat(namesFor_(DATASETS[k]), DATASETS[k].legacySheets || []);
    }, []),
  );
  const datasets = {};
  keys.forEach(function (k) {
    datasets[k] = readDataset_(DATASETS[k]);
  });
  return {
    ok: true,
    version: DB_VERSION,
    schemaId: DB_SCHEMA_ID,
    datasets: datasets,
  };
}

function saveDatabase_(datasets) {
  if (!plain_(datasets) || !Object.keys(datasets).length)
    fail_("VALIDATION", "datasets wajib berupa object yang tidak kosong.");
  const keys = datasetKeys_(Object.keys(datasets));
  const plans = [];
  const sharedKeys = keys.filter(function (k) {
    return DATASETS[k].sharedSilapak;
  });
  const sharedSet = {};
  sharedKeys.forEach(function (k) {
    sharedSet[k] = true;
  });

  // Karena dua dataset berbagi satu tab fisik, gabungkan keduanya menjadi satu
  // plan. Ini mencegah saveDataset("silapakSatpam") menghapus data duty, atau
  // sebaliknya. Dataset yang tidak dikirim tetap diambil dari data yang tersimpan.
  if (sharedKeys.length) {
    prefetch_(["SiLapak_Duty"]);
    const currentRows = readSilapakSharedTable_();
    const currentDuty = readSilapakDutyShared_();
    const currentSatpam = readSilapakSatpamShared_();
    const hasDuty = own_(datasets, "silapakDuty");
    const hasSatpam = own_(datasets, "silapakSatpam");
    const nextDuty = hasDuty ? datasets.silapakDuty : currentDuty;
    const nextSatpam = hasSatpam ? datasets.silapakSatpam : currentSatpam;

    if (hasDuty) {
      normalizeSubmitDatesInDataset_(DATASETS.silapakDuty, nextDuty);
      validateDataset_("silapakDuty", nextDuty);
    }
    if (hasSatpam) {
      validateDataset_("silapakSatpam", nextSatpam);
    }
    plans.push(
      planSilapakShared_(hasDuty ? nextDuty : null, nextSatpam, currentRows),
    );
  }

  keys.forEach(function (k) {
    if (sharedSet[k]) return;
    normalizeSubmitDatesInDataset_(DATASETS[k], datasets[k]);
    validateDataset_(k, datasets[k]);
    Array.prototype.push.apply(plans, planDataset_(DATASETS[k], datasets[k]));
  });
  return withLock_(function () {
    if (!databaseHealth_(false).ok)
      fail_("SETUP_REQUIRED", "Jalankan setupDatabase() dahulu.");
    const stamp = new Date().toISOString();
    commitPlans_(plans);
    return {
      ok: true,
      version: DB_VERSION,
      schemaId: DB_SCHEMA_ID,
      saved: keys,
      savedAt: stamp,
    };
  });
}

function normalizeSubmitDatesInDataset_(spec, value) {
  if (!value || spec.optionMap || spec.scalarList || spec.objectMap) return;
  const normalizeRecord = function (record) {
    if (!record || typeof record !== "object" || Array.isArray(record)) return;
    ["createdAt", "submittedAt"].forEach(function (field) {
      if (record[field]) record[field] = dateOnlyWib_(record[field]);
    });
  };
  if (Array.isArray(value)) value.forEach(normalizeRecord);
  else if (typeof value === "object")
    Object.keys(value).forEach(function (k) {
      normalizeRecord(value[k]);
    });
}

function dateOnlyWib_(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  // Jika sudah tanggal saja, pertahankan.
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const d = new Date(value);
  if (isNaN(d.getTime())) return text;
  return Utilities.formatDate(d, "Asia/Jakarta", "yyyy-MM-dd");
}

function validateValue_(value, path) {
  if (typeof value === "number" && !Number.isFinite(value))
    fail_("VALIDATION", path + ": angka tidak valid.");
  if (typeof value === "string" && /^(data:|blob:)/.test(value))
    fail_("VALIDATION", path + ": upload lampiran ke Drive dahulu.");
  if (value && typeof value === "object") {
    Object.keys(value).forEach(function (k) {
      if (
        ["__proto__", "constructor", "prototype"].indexOf(k) >= 0 ||
        k.startsWith("__proto__") ||
        ["_order", "_mapKey", "_emptyObject"].indexOf(k) >= 0 ||
        k.startsWith("_childState_")
      ) {
        fail_("VALIDATION", path + ": nama field terlarang '" + k + "'");
      }
      validateValue_(value[k], path + "." + k);
    });
  }
}

function validateDataset_(key, value) {
  const spec = DATASETS[key];
  validateValue_(value, key);

  if (spec.optionMap) {
    if (!plain_(value)) fail_("VALIDATION", key + " harus object opsi.");
    Object.keys(value).forEach(function (k) {
      if (
        !Array.isArray(value[k]) ||
        value[k].some(function (v) {
          return typeof v !== "string";
        })
      ) {
        fail_("VALIDATION", key + "." + k + " harus array string.");
      }
    });
    return;
  }
  if (spec.scalarList) {
    if (
      !Array.isArray(value) ||
      value.some(function (v) {
        return typeof v !== "string";
      })
    ) {
      fail_("VALIDATION", key + " harus array string.");
    }
    return;
  }
  if (spec.singleton) {
    if (value !== null && !plain_(value))
      fail_("VALIDATION", key + " harus object atau null.");
    return;
  }
  if (spec.objectMap) {
    if (
      !plain_(value) ||
      Object.keys(value).some(function (k) {
        return !k || !plain_(value[k]);
      })
    ) {
      fail_("VALIDATION", key + " harus map object.");
    }
    return;
  }

  if (!Array.isArray(value))
    fail_("VALIDATION", key + " harus array; request ditolak.");
  const ids = new Set();
  value.forEach(function (row) {
    if (
      !plain_(row) ||
      !["number", "string"].includes(typeof row[spec.key]) ||
      String(row[spec.key]).trim() === ""
    ) {
      fail_("VALIDATION", key + ": " + spec.key + " wajib diisi.");
    }
    const id = String(row[spec.key]);
    if (ids.has(id)) fail_("VALIDATION", key + ": ID duplikat " + id);
    ids.add(id);

    (spec.children || []).forEach(function (c) {
      if (!own_(row, c.field)) return;
      if (
        c.singleton
          ? !plain_(row[c.field]) && row[c.field] !== null
          : !Array.isArray(row[c.field])
      ) {
        fail_(
          "VALIDATION",
          key + "." + c.field + ": bentuk data tidak sesuai.",
        );
      }
      if (
        !c.singleton &&
        row[c.field].some(function (v) {
          return !plain_(v);
        })
      ) {
        fail_("VALIDATION", key + "." + c.field + " harus array object.");
      }
    });
  });
}

function readSilapakSharedTable_() {
  return readTable_("SiLapak_Duty");
}

function readSilapakDutyShared_() {
  const rows = readSilapakSharedTable_();
  const assigned = rows.filter(function (row) {
    return String(row.shift || "").trim() && String(row.names || "").trim();
  });
  if (!assigned.length) return null;

  // Ambil data submit terbaru. submittedAt sengaja berupa tanggal saja.
  const dates = assigned
    .map(function (row) {
      return String(row.submittedAt || "").trim();
    })
    .filter(Boolean);
  const latestDate = dates.length ? dates.sort().slice(-1)[0] : "";
  const latest = assigned.filter(function (row) {
    return !latestDate || String(row.submittedAt || "").trim() === latestDate;
  });
  if (!latest.length) return null;

  // Jika pada tanggal yang sama ada lebih dari satu shift, gunakan shift pada
  // baris assignment terakhir karena sheet ditulis berurutan.
  const latestShift = String(latest[latest.length - 1].shift || "").trim();
  const names = latest
    .filter(function (row) {
      return String(row.shift || "").trim() === latestShift;
    })
    .map(function (row) {
      return String(row.names || "").trim();
    })
    .filter(Boolean);

  return { shift: latestShift || "pagi", names: unique_(names) };
}

function readSilapakSatpamShared_() {
  const rows = readSilapakSharedTable_();
  const names = [];
  rows.forEach(function (row) {
    const name = String(row.names || "").trim();
    if (
      name &&
      !names.some(function (item) {
        return item.toLowerCase() === name.toLowerCase();
      })
    ) {
      names.push(name);
    }
  });
  return names;
}

function planSilapakShared_(duty, satpam, existingRows) {
  const current = Array.isArray(existingRows) ? existingRows : [];
  const today = dateOnlyWib_(new Date());
  const selected =
    duty && Array.isArray(duty.names)
      ? duty.names
          .map(function (n) {
            return String(n || "").trim();
          })
          .filter(Boolean)
      : [];
  const selectedSet = {};
  selected.forEach(function (name) {
    selectedSet[name.toLowerCase()] = true;
  });
  const master = Array.isArray(satpam)
    ? satpam
        .map(function (n) {
          return String(n || "").trim();
        })
        .filter(Boolean)
    : [];

  // Pertahankan data yang sudah ada, lalu sinkronkan master satpam.
  const rows = current
    .map(function (row) {
      return {
        shift: String(row.shift || "").trim(),
        names: String(row.names || "").trim(),
        submittedAt: String(row.submittedAt || "").trim(),
      };
    })
    .filter(function (row) {
      return row.names;
    });

  // Nama yang baru ditambahkan ke master dibuat sebagai baris baru.
  master.forEach(function (name) {
    const exists = rows.some(function (row) {
      return row.names.toLowerCase() === name.toLowerCase();
    });
    if (!exists) rows.push({ shift: "", names: name, submittedAt: today });
  });

  // Saat duty disimpan, setiap nama yang dipilih mendapat shift + tanggal submit.
  if (duty && Array.isArray(duty.names)) {
    selected.forEach(function (name) {
      const index = rows.findIndex(function (row) {
        return row.names.toLowerCase() === name.toLowerCase();
      });
      const normalized = {
        shift: duty.shift || "pagi",
        names: name,
        submittedAt: today,
      };
      if (index >= 0) rows[index] = normalized;
      else rows.push(normalized);
    });
  }

  // Jika satpam hanya dikirim tanpa duty, jangan mengubah shift yang sudah ada.
  // Jika ada nama baru yang sama dengan assignment lama, master tetap sinkron.
  return tablePlan_("SiLapak_Duty", rows);
}

function planDataset_(spec, value) {
  if (spec.partition) {
    const buckets = Object.create(null);
    namesFor_(spec).forEach(function (n) {
      buckets[n] = [];
    });
    value.forEach(function (row, index) {
      buckets[
        spec.partition.sheets[row[spec.partition.field]] ||
          spec.partition.fallback
      ].push(Object.assign({}, row, { _order: index }));
    });
    return Object.keys(buckets)
      .map(function (n) {
        return tablePlan_(n, buckets[n]);
      })
      .concat(
        (spec.legacySheets || []).map(function (n) {
          return Object.assign(tablePlan_(n, []), { optional: true });
        }),
      );
  }
  if (spec.optionMap) {
    const rows = [];
    Object.keys(value).forEach(function (group) {
      if (!value[group].length) rows.push({ group: group, empty: true });
      value[group].forEach(function (v, i) {
        rows.push({ group: group, value: v, order: i });
      });
    });
    return [tablePlan_(spec.sheet, rows)];
  }
  if (spec.scalarList) {
    return [
      tablePlan_(
        spec.sheet,
        value.map(function (v, i) {
          return { value: v, order: i };
        }),
      ),
    ];
  }
  if (spec.singleton) {
    return [
      tablePlan_(
        spec.sheet,
        value === null
          ? []
          : [Object.keys(value).length ? value : { _emptyObject: true }],
      ),
    ];
  }

  const rows = spec.objectMap
    ? Object.keys(value).map(function (k) {
        return Object.assign({}, value[k], { _mapKey: k });
      })
    : value;

  const parents = [],
    childTables = Object.create(null);
  (spec.children || []).forEach(function (c) {
    childTables[c.sheet] = [];
  });

  rows.forEach(function (source) {
    const row = clone_(source);
    (spec.children || []).forEach(function (c) {
      const childValue = row[c.field];
      delete row[c.field];

      if (childValue === null) row["_childState_" + c.field] = "null";
      else if (childValue === undefined)
        row["_childState_" + c.field] = "absent";
      else row["_childState_" + c.field] = "present";

      const items = c.singleton
        ? childValue === null ||
          childValue === undefined ||
          (plain_(childValue) && !Object.keys(childValue).length)
          ? []
          : [childValue]
        : childValue || [];

      items.forEach(function (item, i) {
        childTables[c.sheet].push(
          Object.assign({}, item, { [c.parent]: row[spec.key], _order: i }),
        );
      });
    });
    parents.push(row);
  });

  return [tablePlan_(spec.sheet, parents)].concat(
    (spec.children || []).map(function (c) {
      return tablePlan_(c.sheet, childTables[c.sheet]);
    }),
    (spec.legacySheets || []).map(function (name) {
      return Object.assign(tablePlan_(name, []), { optional: true });
    }),
  );
}

function flatten_(source, prefix, output) {
  output = output || Object.create(null);
  prefix = prefix || "";
  Object.keys(source).forEach(function (k) {
    const path = prefix ? prefix + "__" + k : k,
      value = source[k];
    if (plain_(value) && Object.keys(value).length)
      flatten_(value, path, output);
    else if (!blankCellValue_(value)) output[path] = value;
  });
  return output;
}

function blankCellValue_(value) {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0) ||
    (plain_(value) && Object.keys(value).length === 0)
  );
}

function unflatten_(flat) {
  const result = {};
  Object.keys(flat).forEach(function (path) {
    const parts = path.split("__");
    let cursor = result;
    if (
      parts.some(function (p) {
        return ["__proto__", "constructor", "prototype"].includes(p);
      })
    ) {
      fail_("SCHEMA", "Header tidak aman: " + path);
    }
    parts.forEach(function (part, i) {
      if (i === parts.length - 1) cursor[part] = flat[path];
      else {
        if (!own_(cursor, part)) cursor[part] = {};
        if (!plain_(cursor[part]))
          fail_("SCHEMA", "Header bertabrakan: " + path);
        cursor = cursor[part];
      }
    });
  });
  return result;
}

function encodeCell_(value) {
  if (blankCellValue_(value)) return "";
  let encoded = value;
  if (
    typeof value === "object" ||
    (typeof value === "string" &&
      (value.startsWith("=") ||
        value.startsWith(CELL_TAG) ||
        value.startsWith("'=") ||
        /^[\[{]/.test(value.trim())))
  ) {
    encoded = CELL_TAG + JSON.stringify(value);
  }
  if (typeof encoded === "string" && encoded.length > 49000)
    fail_("VALIDATION", "Nilai melebihi 49.000 karakter per sel.");
  return encoded;
}

function decodeCell_(value) {
  if (Object.prototype.toString.call(value) === "[object Date]")
    return value.toISOString();
  if (typeof value !== "string") return value;
  if (value.startsWith(CELL_TAG)) {
    try {
      return JSON.parse(value.slice(CELL_TAG.length));
    } catch (_) {
      fail_("SCHEMA", "Encoding sel rusak.");
    }
  }
  if (/^[\[{]/.test(value.trim())) {
    try {
      return JSON.parse(value);
    } catch (_) {}
  }
  if (value.startsWith("'=")) return value.slice(1);
  return value;
}

function tablePlan_(name, rows) {
  const flat = rows.map(function (r) {
    return flatten_(r);
  });
  const omitted = OMIT_FIELDS_BY_SHEET[name] || [];
  flat.forEach(function (row) {
    Object.keys(row).forEach(function (key) {
      const omittedBySheet = omitted.some(function (field) {
        return key === field || key.indexOf(field + "__") === 0;
      });
      const omittedBySuffix = OMIT_FIELD_SUFFIXES.some(function (field) {
        return key === field || key.slice(-(field.length + 2)) === "__" + field;
      });
      if (omittedBySheet || omittedBySuffix) delete row[key];
    });
  });
  const dynamicHeaders = unique_(
    flat.reduce(function (a, r) {
      return a.concat(Object.keys(r));
    }, []),
  );
  const headers = unique_(initialHeaders_(name).concat(dynamicHeaders));
  const values = [headers].concat(
    flat.map(function (r) {
      return headers.map(function (h) {
        return encodeCell_(r[h]);
      });
    }),
  );
  return { name: name, values: values };
}

function readTable_(name) {
  prefetch_([name]);
  const values = TABLE_CACHE_[name];
  if (!values || values.length < 2) return [];
  const headers = values[0].map(String);
  if (
    unique_(headers.filter(Boolean)).length !== headers.filter(Boolean).length
  )
    fail_("SCHEMA", "Header duplikat di " + name);
  return values
    .slice(1)
    .filter(function (r) {
      return r.some(function (c) {
        return c !== "" && c !== undefined && c !== null;
      });
    })
    .map(function (r) {
      const record = Object.create(null);
      headers.forEach(function (h, i) {
        if (h && r[i] !== "" && r[i] !== undefined && r[i] !== null)
          record[h] = decodeCell_(r[i]);
      });
      return unflatten_(record);
    });
}

function readDataset_(spec) {
  if (spec.sharedSilapak) {
    return spec.scalarList
      ? readSilapakSatpamShared_()
      : readSilapakDutyShared_();
  }
  if (spec.partition) {
    const all = namesFor_(spec)
      .concat(spec.legacySheets || [])
      .reduce(function (a, n) {
        return a.concat(readTable_(n));
      }, []);
    all.sort(function (a, b) {
      return Number(a._order || 0) - Number(b._order || 0);
    });
    all.forEach(function (r) {
      delete r._order;
    });
    return all;
  }
  if (spec.optionMap) {
    const map = {};
    readTable_(spec.sheet)
      .sort(function (a, b) {
        return (a.order || 0) - (b.order || 0);
      })
      .forEach(function (r) {
        if (["__proto__", "constructor", "prototype"].includes(r.group))
          fail_("SCHEMA", "Grup opsi tidak aman.");
        if (!own_(map, r.group)) map[r.group] = [];
        if (!r.empty) map[r.group].push(r.value);
      });
    return map;
  }
  if (spec.scalarList) {
    return readTable_(spec.sheet)
      .sort(function (a, b) {
        return (a.order || 0) - (b.order || 0);
      })
      .map(function (r) {
        return r.value;
      });
  }
  if (spec.singleton) {
    const value = readTable_(spec.sheet)[0] || null;
    if (value && value._emptyObject) return {};
    return value;
  }

  const rows = [spec.sheet].concat(spec.legacySheets || []).reduce(function (
    all,
    name,
  ) {
    return all.concat(readTable_(name));
  }, []);

  (spec.children || []).forEach(function (c) {
    const byParent = new Map();
    readTable_(c.sheet)
      .sort(function (a, b) {
        return (a._order || 0) - (b._order || 0);
      })
      .forEach(function (item) {
        const id = String(item[c.parent]),
          clean = clone_(item);
        delete clean[c.parent];
        delete clean._order;
        if (!byParent.has(id)) byParent.set(id, []);
        byParent.get(id).push(clean);
      });

    rows.forEach(function (row) {
      const matches = byParent.get(String(row[spec.key])) || [];
      const marker = "_childState_" + c.field;
      const state = row[marker];
      delete row[marker];

      if (state === "absent") {
        delete row[c.field];
        return;
      }
      if (state === "null") {
        row[c.field] = null;
        return;
      }
      if (matches.length) {
        row[c.field] = c.singleton ? matches[0] : matches;
      } else if (!own_(row, c.field)) {
        row[c.field] = c.singleton ? null : [];
      }
    });
  });

  if (spec.objectMap) {
    const map = {};
    rows.forEach(function (r) {
      const key = r._mapKey;
      delete r._mapKey;
      if (key !== undefined) {
        if (["__proto__", "constructor", "prototype"].includes(String(key)))
          fail_("SCHEMA", "Map key tidak aman.");
        map[key] = r;
      }
    });
    return map;
  }

  return rows;
}

function ensureGrid_(sheet, rows, columns) {
  if (rows > sheet.getMaxRows())
    sheet.insertRowsAfter(sheet.getMaxRows(), rows - sheet.getMaxRows());
  if (columns > sheet.getMaxColumns())
    sheet.insertColumnsAfter(
      sheet.getMaxColumns(),
      columns - sheet.getMaxColumns(),
    );
}

function writeNative_(sheet, values) {
  const rows = Math.max(sheet.getLastRow(), values.length, 1);
  const cols = Math.max(sheet.getLastColumn(), values[0].length, 1);
  ensureGrid_(sheet, rows, cols);

  const matrix = Array.from({ length: rows }, function (_, r) {
    return Array.from({ length: cols }, function (_, c) {
      const value = values[r] && values[r][c] !== undefined ? values[r][c] : "";
      return typeof value === "string" && value.startsWith("=")
        ? "'" + value
        : value;
    });
  });

  const range = sheet.getRange(1, 1, rows, cols);
  range.setNumberFormat("@");
  range.setValues(matrix);

  // Hapus kolom fisik yang tidak lagi ada pada schema/record frontend.
  // Ini mencegah kolom lama kosong tetap tertinggal di sisi kanan tab.
  const targetColumns = Math.max(values[0].length, 1);
  if (sheet.getMaxColumns() > targetColumns) {
    sheet.deleteColumns(
      targetColumns + 1,
      sheet.getMaxColumns() - targetColumns,
    );
  }
}

function commitPlans_(plans) {
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty("DB_WRITE_RECOVERY_REQUIRED")) {
    fail_(
      "RECOVERY_REQUIRED",
      "Penulisan sebelumnya terputus. Jalankan inspectRecoveryStatus() dan pulihkan database sebelum simpan lagi.",
    );
  }

  const entries = plans
    .map(function (plan) {
      const sheet = sheet_(plan.name, false);
      if (!sheet && plan.optional) return null;
      if (!sheet) fail_("SETUP_REQUIRED", "Tab belum ada: " + plan.name);
      const range = sheet.getDataRange();
      return {
        sheet: sheet,
        plan: plan,
        values: range.getValues(),
        formulas: range.getFormulas(),
        formats: range.getNumberFormats(),
      };
    })
    .filter(Boolean);

  props.setProperty(
    "DB_WRITE_RECOVERY_REQUIRED",
    JSON.stringify({
      startedAt: new Date().toISOString(),
      sheets: entries.map(function (e) {
        return e.plan.name;
      }),
    }),
  );

  const touched = [];
  try {
    entries.forEach(function (entry) {
      touched.push(entry);
      writeNative_(entry.sheet, entry.plan.values);
    });
    SpreadsheetApp.flush();
    props.deleteProperty("DB_WRITE_RECOVERY_REQUIRED");
  } catch (error) {
    const failures = [];
    touched.reverse().forEach(function (entry) {
      try {
        writeNative_(entry.sheet, entry.values);
        const range = entry.sheet.getRange(
          1,
          1,
          entry.values.length,
          entry.values[0].length,
        );
        range.setNumberFormats(entry.formats);
        entry.formulas.forEach(function (row, r) {
          row.forEach(function (formula, c) {
            if (formula) entry.sheet.getRange(r + 1, c + 1).setFormula(formula);
          });
        });
      } catch (rollbackError) {
        failures.push(entry.plan.name + ": " + rollbackError.message);
      }
    });
    try {
      SpreadsheetApp.flush();
    } catch (e) {
      failures.push(e.message);
    }
    if (!failures.length) props.deleteProperty("DB_WRITE_RECOVERY_REQUIRED");
    TABLE_CACHE_ = null;
    if (failures.length)
      fail_(
        "RECOVERY_REQUIRED",
        "Simpan gagal dan pemulihan belum lengkap: " + failures.join("; "),
      );
    fail_(
      "WRITE_FAILED",
      "Simpan gagal; data sebelumnya sudah dipulihkan: " + error.message,
    );
  }
  TABLE_CACHE_ = null;
}
