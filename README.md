# SIKAS PLN

Sistem Informasi Administrasi Kas untuk PLN Indonesia Power UBP Priok.
Mengelola alur RAB → TOR → BAST → Pakta Integritas → Laporan realisasi
bantuuan, ditambah master data Vendor dan riwayat pekerjaan.

## Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:5173.

## Login

Belum terhubung ke backend — cukup pilih peran (Humas / Asman / MADM),
isi username & password apa pun, lalu **Masuk**.

## Struktur

```
src/
  App.jsx            router modul + state global
  main.jsx
  lib/               data referensi, utilitas, tema
  components/        UI reusable (Button, Card, Modal, DataTable, dst)
  pages/             satu file per halaman/modul
  styles/global.css  reset + variabel warna + kelas responsif
```

## Ganti aset

- `public/logo.png` — **logo PLN utama** yang otomatis dipakai di sidebar,
  Welcome card di login, dan strip Powered by. Cukup drop satu file
  dengan nama `logo.png` (atau `.jpg` / `.jpeg`) — resolusi & aspect ratio
  bebas, otomatis di-fit oleh code. Kalau file ini tidak ada, dipakai
  SVG placeholder di `src/assets/pln-priok-logo.svg`.
- `public/login-bg.jpg` — foto background halaman login (opsional). Kalau
  ada, otomatis dipakai. Kalau tidak ada, halaman login memakai gradient
  ambient PLN. Nama file yang dicoba: `login-bg.jpg` → `.jpeg` → `.png`.
- `src/assets/pln-priok-logo.svg` — SVG placeholder — fallback kalau
  `public/logo.png` tidak ada.
