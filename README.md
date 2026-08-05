# SIKAS — Sistem Informasi Kas

**Portal CSR PLN Indonesia Power UBP Priok**

Aplikasi web internal untuk mengelola seluruh alur kerja program CSR dan TJSL — mulai dari perencanaan anggaran, pelaksanaan kegiatan, pembayaran, hingga pelaporan realisasi. Dibangun sebagai SPA (Single Page Application) berbasis React, berjalan sepenuhnya di sisi klien tanpa memerlukan backend.

---

## Modul Utama

| Modul | Deskripsi | Pengguna |
|---|---|---|
| **SIKAS** | Pengelolaan RAB, TOR, BAST, PI, dokumen pembayaran, laporan, dan approval | Humas / Asman / MADM |
| **Si Lapak Priok** | Manajemen paket/logistik harian, shift satpam, buku tamu, riwayat aktivitas | Operator Lapak |
| **Pengajuan Mitra** | Portal pengajuan proposal mitra eksternal dengan tracking approval multi-level | Mitra |

---

## Teknologi

- **React 18** + Vite
- **lucide-react** — icon library
- **docxtemplater** + **pizzip** — generate dokumen Word (.docx)
- **exceljs** — generate spreadsheet (.xlsx)
- **jspdf** — generate PDF
- **file-saver** — download file di browser

---

## Instalasi & Menjalankan

```bash
# Clone repo
git clone https://github.com/HumasTGP/webscr.git
cd webscr

# Install dependensi
npm install

# Jalankan development server
npm run dev
```

Buka [http://localhost:5173](http://localhost:5173)

```bash
# Build untuk production
npm run build

# Preview hasil build production
npm run preview
```

---

## Akun Login

### SIKAS

| Role | Username | Password | Keterangan |
|---|---|---|---|
| Humas | `1` | `1` | Akses penuh semua dokumen |
| Asman | `2` | `2` | Review & approve paket kas |
| MADM | `3` | `3` | Proses final paket kas |
| Admin | `admin` | `admin` | Manajemen akses pengguna |

### Si Lapak Priok

| Username | Password |
|---|---|
| `satpam` | `satpam` |

### Pengajuan Mitra

| Username | Password |
|---|---|
| `mitra` | `mitra` |

---

## Alur Kerja SIKAS

```
Proposal Masuk (Humas)
       │
       ▼
  RAB & Jenis Paket  ←── Kategori: NON PO / Cash Card / PO
       │                 (ID RAB = primary key seluruh dokumen)
       ▼
      TOR
       │
       ▼
  Pelaksanaan ─── Dokumentasi · Daftar Hadir · Eviden
       │
       ▼
  Pembayaran ──── BAST · BAPP · PI · Checklist · Form Verifikasi · Lampiran
       │
       ▼
  Paket Kas ────► Review Asman ────► Proses MADM
       │
       ▼
    Laporan Realisasi
```

---

## Alur Approval Pengajuan Mitra

```
Mitra → Humas → Asman → MADM → Implementasi
```

Status yang tersedia: *Draft · Menunggu Persetujuan · Diproses Humas · Diproses Asman · Diproses MADM · Disetujui · Ditolak*

---

## Struktur Folder

```
webscr/
├── public/
│   ├── logo.png              ← Logo PLN (letakkan di sini)
│   ├── portal-bg.jpg         ← Foto background portal (opsional)
│   ├── login-bg.jpg          ← Foto background login (opsional)
│   └── templates/            ← Template Word (.docx)
│       ├── Template_TOR.docx
│       ├── Template_BAST.docx
│       └── Template_Pakta_Integritas.docx
│
└── src/
    ├── App.jsx               ← Root aplikasi, routing, state global
    ├── main.jsx
    │
    ├── portal/               ← Gateway portal utama
    │   └── pages/
    │
    ├── sikas/                ← Modul SIKAS
    │   ├── pages/            ← RAB, TOR, BAST, BAPP, PI, Laporan, dst.
    │   ├── components/       ← Sidebar & Topbar SIKAS
    │   ├── asman/pages/      ← Dashboard khusus Asman
    │   └── madm/pages/       ← Dashboard khusus MADM
    │
    ├── silapak-priok/        ← Modul Si Lapak Priok
    │   └── pages/
    │
    ├── pengajuan-mitra/      ← Modul Pengajuan Mitra
    │   ├── components/       ← Sidebar Mitra
    │   └── pages/            ← Login, Dashboard, Tracking, Bantuan
    │
    ├── components/           ← Komponen UI reusable (shared)
    │
    ├── lib/                  ← Utilitas dan data (shared)
    │   ├── data.js           ← MENU, konstanta, seed data
    │   ├── theme.js          ← Sistem warna & font (light/dark)
    │   ├── utils.js          ← Fungsi umum
    │   ├── wizardFields.js   ← Field builder TOR/BAST/PI/Laporan
    │   ├── pdf.js            ← Generator PDF
    │   ├── docxGenerate.js   ← Generator Word
    │   └── xlsxGenerate.js   ← Generator Excel
    │
    ├── assets/               ← Logo SVG tiap modul
    └── styles/global.css
```

---

## Mengganti Aset

| File | Keterangan |
|---|---|
| `public/logo.png` | Logo PLN di sidebar. Format PNG/JPG. Fallback ke SVG jika tidak ada. |
| `public/portal-bg.jpg` | Foto background halaman portal. |
| `public/login-bg.jpg` | Foto background halaman login SIKAS. |
| `src/assets/sikas-logo.svg` | Logo SIKAS di landing page. |
| `src/assets/silapak-logo.svg` | Logo Si Lapak Priok di landing page. |
| `src/assets/mitra-logo.svg` | Logo Pengajuan Mitra di landing page. |

---

## Template Dokumen Word

Letakkan file `.docx` di `public/templates/`. Template menggunakan sintaks **docxtemplater** (`{variabel}`, `{#list}{/list}`).

| File | Digunakan untuk |
|---|---|
| `Template_TOR.docx` | Download TOR |
| `Template_BAST.docx` | Download BAST |
| `Template_Pakta_Integritas.docx` | Download Pakta Integritas |

---

## Catatan Pengembangan

- Data disimpan di React state (in-memory) — tidak ada backend.
- Akun pengguna tersimpan di `localStorage` dengan key `sikas.users.v1`.
- Untuk integrasi backend, ganti fungsi di `src/lib/` dengan API call yang sesuai.
- Tema light/dark tersedia, diatur via ikon di topbar.
