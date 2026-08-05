# SIKAS - Sistem Informasi Kas

**Portal CSR PLN Indonesia Power UBP Priok**

Aplikasi web internal untuk mengelola seluruh alur kerja program CSR dan TJSL, mulai dari perencanaan anggaran, pelaksanaan kegiatan, pembayaran, hingga pelaporan realisasi. Dibangun sebagai SPA (Single Page Application) berbasis React, berjalan sepenuhnya di sisi klien tanpa memerlukan backend.

## Modul Utama

| Modul | Deskripsi | Pengguna |
|---|---|---|
| **SIKAS** | Pengelolaan RAB, Kategori, TOR, BAST, BAPP, PI, dokumen pembayaran, laporan, dan approval | Humas / Asman / MADM |
| **Si Lapak Priok** | Manajemen paket/logistik harian, shift satpam, buku tamu, riwayat aktivitas | Operator Lapak |
| **Pengajuan Mitra** | Portal pengajuan proposal mitra eksternal dengan tracking approval multi-level | Mitra |

## Teknologi

- **React 18** + Vite
- **lucide-react** - icon library
- **docxtemplater** + **pizzip** - generate dokumen Word (.docx)
- **exceljs** - generate spreadsheet (.xlsx)
- **jspdf** - generate PDF
- **file-saver** - download file di browser

## Instalasi & Menjalankan

```bash
# Clone repo (pertama kali)
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

## Git - Sinkronisasi dengan GitHub

### Mengambil update terbaru dari GitHub (Pull)

Lakukan ini setiap kali ingin mendapatkan perubahan terbaru sebelum mulai bekerja:

```bash
# Pastikan kamu berada di branch main
git checkout main

# Ambil dan terapkan perubahan terbaru dari GitHub
git pull origin main
```

Setelah pull, jalankan ulang:

```bash
npm install   # jika ada dependensi baru
npm run dev   # jalankan kembali dev server
```

### Menyimpan & mengirim perubahan ke GitHub (Push)

Gunakan alur berikut setiap kali selesai membuat perubahan:

```bash
# 1. Cek file mana yang berubah
git status

# 2. Tambahkan file yang ingin disimpan
#    Untuk semua file yang berubah:
git add .

#    Atau pilih file tertentu saja:
git add src/sikas/pages/Rab.jsx

# 3. Buat commit dengan pesan yang jelas
git commit -m "feat: deskripsi singkat perubahan yang dilakukan"

# 4. Kirim ke GitHub
git push origin main
```

### Contoh pesan commit yang baik

```bash
git commit -m "feat: tambah halaman laporan bulanan"
git commit -m "fix: perbaiki bug kategori tidak tersimpan"
git commit -m "update: perbarui template BAST"
git commit -m "docs: perbarui README"
```

### Cek riwayat perubahan

```bash
# Lihat log commit terbaru
git log --oneline -10

# Lihat siapa yang mengubah file tertentu
git log --oneline src/App.jsx
```

### Jika ada konflik saat pull

```bash
# Simpan perubahan lokal sementara
git stash

# Ambil update terbaru
git pull origin main

# Kembalikan perubahan lokal
git stash pop
```

## Akun Login

Seluruh akun dikelola melalui menu **Manajemen Akses** (role Humas, login dengan username `admin` / password `admin`).

### SIKAS

| Role | Username Default | Password Default |
|---|---|---|
| Humas | `1` | `1` |
| Asman | `2` | `2` |
| MADM | `3` | `3` |

### Si Lapak Priok

| Username Default | Password Default |
|---|---|
| `satpam.priok` | `lapakpriok26` |

### Pengajuan Mitra

| Username Default | Password Default |
|---|---|
| `admin` | `admin123` |

> Akun-akun di atas adalah nilai awal (seed). Semua dapat diubah, ditambah, atau dihapus melalui **Manajemen Akses**.

## Alur Kerja SIKAS

```
Proposal Masuk (Humas)
       |
       v
  RAB & Jenis Paket
       |
       v
  Kategori (NON PO / Cash Card / PO)
       |
       v
      TOR
       |
       v
  Pelaksanaan --- Dokumentasi · Daftar Hadir · Eviden
       |
       v
  Pembayaran  --- BAST · BAPP · PI · Checklist · Form Verifikasi · Lampiran
       |
       v
  Paket Kas ---> Review Asman ---> Proses MADM
       |
       v
    Laporan Realisasi
```

## Alur Approval Pengajuan Mitra

```
Mitra -> Humas -> Asman -> MADM -> Implementasi
```

Status yang tersedia: *Draft · Menunggu Persetujuan · Diproses Humas · Diproses Asman · Diproses MADM · Disetujui · Ditolak*

## Struktur Folder

```
webscr/
├── public/
│   ├── logo.png              <- Logo PLN (letakkan di sini)
│   ├── portal-bg.jpg         <- Foto background portal (opsional)
│   ├── login-bg.jpg          <- Foto background login (opsional)
│   └── templates/            <- Template Word (.docx)
│       ├── Template_TOR.docx
│       ├── Template_BAST.docx
│       └── Template_Pakta_Integritas.docx
│
└── src/
    ├── App.jsx               <- Root aplikasi, routing, state global
    ├── main.jsx
    │
    ├── portal/               <- Gateway portal utama
    │   └── pages/
    │
    ├── sikas/                <- Modul SIKAS
    │   ├── pages/            <- RAB, Kategori, TOR, BAST, BAPP, PI, Laporan, dst.
    │   ├── components/       <- Sidebar & Topbar SIKAS
    │   ├── asman/pages/      <- Dashboard khusus Asman
    │   └── madm/pages/       <- Dashboard khusus MADM
    │
    ├── silapak-priok/        <- Modul Si Lapak Priok
    │   └── pages/
    │
    ├── pengajuan-mitra/      <- Modul Pengajuan Mitra
    │   ├── components/       <- Sidebar Mitra
    │   └── pages/            <- Login, Dashboard, Tracking, Bantuan
    │
    ├── components/           <- Komponen UI reusable (shared)
    │
    ├── lib/                  <- Utilitas dan data (shared)
    │   ├── data.js           <- MENU, ROLES, DEFAULT_USERS, konstanta, seed data
    │   ├── theme.js          <- Sistem warna & font (light/dark)
    │   ├── utils.js          <- Fungsi umum
    │   ├── wizardFields.js   <- Field builder TOR/BAST/PI/Laporan
    │   ├── pdf.js            <- Generator PDF
    │   ├── docxGenerate.js   <- Generator Word
    │   └── xlsxGenerate.js   <- Generator Excel
    │
    ├── assets/               <- Logo SVG tiap modul
    └── styles/global.css
```

## Mengganti Aset

### Background Halaman Login

Setiap halaman login membaca background dari file di folder `public/`. Cukup letakkan file gambar dengan nama yang sesuai, background akan otomatis terpasang. Jika file tidak ada, halaman menggunakan gradient default.

| File di `public/` | Digunakan oleh |
|---|---|
| `portal-bg.jpg` / `portal-bg.png` | Portal Utama (halaman selamat datang) |
| `sikas-bg.jpg` / `sikas-bg.png` | Login SIKAS |
| `silapak-bg.jpg` / `silapak-bg.png` | Login Si Lapak Priok |
| `mitra-bg.jpg` / `mitra-bg.png` | Login Pengajuan Mitra |

Tips: gunakan foto beresolusi minimal 1920x1080px, format JPG dengan kualitas 80% agar file tidak terlalu besar.

### Aset Lainnya

| File | Keterangan |
|---|---|
| `public/logo.png` | Logo PLN di sidebar. Format PNG/JPG. Fallback ke SVG jika tidak ada. |
| `src/assets/sikas-logo.svg` | Logo SIKAS di landing page. |
| `src/assets/silapak-logo.svg` | Logo Si Lapak Priok di landing page. |
| `src/assets/mitra-logo.svg` | Logo Pengajuan Mitra di landing page. |

## Template Dokumen Word

Letakkan file `.docx` di `public/templates/`. Template menggunakan sintaks **docxtemplater** (`{variabel}`, `{#list}{/list}`).

| File | Digunakan untuk |
|---|---|
| `Template_TOR.docx` | Download TOR |
| `Template_BAST.docx` | Download BAST |
| `Template_Pakta_Integritas.docx` | Download Pakta Integritas |

## Catatan Pengembangan

- Data disimpan di React state (in-memory) - tidak ada backend.
- Akun pengguna tersimpan di `localStorage` dengan key `sikas.users.v1`.
- Untuk integrasi backend, ganti fungsi di `src/lib/` dengan API call yang sesuai.
- Tema light/dark tersedia, diatur via ikon di topbar.
