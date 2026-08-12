# Portal Digital PLN Indonesia Power UBP Priok

Portal web terpadu untuk **SAKTI**, **Si Lapak Priok**, dan **GANDENG** di PLN Indonesia Power UBP Priok.

## Sistem

| Sistem | Pengguna | Fungsi utama |
|---|---|---|
| **SAKTI** | Humas, Asman, MADM | Proposal, evaluasi, RAB, TOR, pelaksanaan, pembayaran, dokumen, rekap anggaran, inbox review, dan administrasi. |
| **Si Lapak Priok** | Petugas/operator | Paket masuk/keluar, pengambilan paket, buku tamu, petugas jaga, riwayat, dan bantuan. |
| **GANDENG** | Perusahaan/lembaga dan admin GANDENG | Registrasi akun, pengajuan proposal, riwayat, tracking Humas → Asman → MADM, bantuan, dan isolasi data per akun. |

## Struktur Source

```text
src/
├── portal/             # Portal utama dan login bersama
├── sakti/              # SAKTI - Humas, Asman, MADM
├── si-lapak-priok/     # Si Lapak Priok
├── gandeng/            # GANDENG
├── components/         # Komponen bersama
├── lib/                # Data, helper, generator dokumen
└── styles/             # Styling global dan responsif
```

## Tema

- **SAKTI:** `#036D9A`
- **Si Lapak Priok:** `#FDEA6F`
- **GANDENG:** `#CF0000`

## Menjalankan Project

### Pertama kali clone repository

```bash
git clone https://github.com/HumasTGP/webscr.git
cd webscr
npm install
npm run dev
```

Buka alamat localhost yang ditampilkan Vite, biasanya `http://localhost:5173`.

### Menjalankan project yang sudah pernah di-clone

```bash
cd webscr
npm install
npm run dev
```

## GitHub Workflow

### Pull — mengambil versi terbaru dari GitHub

Sebelum mulai mengubah code, biasakan melakukan pull dari `main`.

```bash
git checkout main
git pull origin main
npm install
npm run dev
```

Untuk memastikan posisi branch dan perubahan lokal:

```bash
git status
git branch
```

### Push — mengirim perubahan ke GitHub

Setelah perubahan selesai dan sudah dites:

```bash
git status
git add .
git commit -m "Jelaskan perubahan yang dilakukan"
git push origin main
```

Contoh:

```bash
git add .
git commit -m "Perbaiki tampilan login SAKTI"
git push origin main
```

Jika bekerja menggunakan branch terpisah:

```bash
git checkout -b nama-branch
git add .
git commit -m "Jelaskan perubahan"
git push -u origin nama-branch
```

Setelah itu buat Pull Request ke `main` dari GitHub.

## Production Build / Cek Error

Sebelum push perubahan besar, jalankan:

```bash
npm run build
```

Jika build berhasil, Vite akan menghasilkan folder `dist/`. Jika gagal, baca pesan error paling bawah karena biasanya berisi nama file dan baris yang bermasalah.

## Troubleshooting

### `git` is not recognized / command not found

Git belum terpasang atau belum masuk PATH.

Cek:

```bash
git --version
```

Setelah Git terpasang, tutup lalu buka kembali VS Code/PowerShell.

### `npm` is not recognized

Node.js belum terpasang atau PATH belum terbaca.

Cek:

```bash
node --version
npm --version
```

Setelah install Node.js, restart terminal/VS Code.

### Error setelah pull karena dependency berubah

Jalankan:

```bash
npm install
npm run dev
```

Jika masih bermasalah:

**Windows PowerShell:**

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
npm run dev
```

> Jangan hapus `package-lock.json` sebagai langkah pertama. Gunakan langkah ini hanya jika dependency lokal benar-benar rusak.

### Port Vite sudah dipakai

Contoh error: `Port 5173 is already in use`.

Jalankan Vite di port lain:

```bash
npm run dev -- --port 5174
```

### Pull gagal karena ada perubahan lokal

Cek dulu:

```bash
git status
```

Jika perubahan lokal ingin disimpan:

```bash
git add .
git commit -m "Simpan perubahan lokal"
git pull origin main
```

Jika hanya ingin menyimpan sementara:

```bash
git stash
git pull origin main
git stash pop
```

### Merge conflict setelah pull

Cari file yang ditandai Git:

```bash
git status
```

Di dalam file biasanya muncul marker:

```text
<<<<<<< HEAD
kode lokal
=======
kode dari GitHub
>>>>>>> main
```

Pilih/gabungkan code yang benar, hapus marker tersebut, lalu:

```bash
git add .
git commit -m "Resolve merge conflict"
git push origin main
```

### Salah branch atau ingin kembali ke `main`

```bash
git status
git checkout main
git pull origin main
```

### Local project berantakan dan ingin kembali sama persis dengan GitHub

> **PERINGATAN:** perintah ini menghapus seluruh perubahan lokal yang belum di-commit.

```bash
git fetch origin
git checkout main
git reset --hard origin/main
```

Jika ada file/folder baru yang tidak tercatat Git dan juga ingin dibersihkan:

```bash
git clean -fd
```

Gunakan `git clean -fd` dengan hati-hati karena file lokal yang belum dilacak Git akan dihapus.

### Push ditolak karena remote lebih baru

Contoh: `rejected (fetch first)` atau `non-fast-forward`.

```bash
git pull --rebase origin main
git push origin main
```

Jika muncul conflict saat rebase, selesaikan conflict terlebih dahulu, lalu:

```bash
git add .
git rebase --continue
git push origin main
```

### Cek perubahan sebelum commit

```bash
git status
git diff
```

Untuk melihat commit terakhir:

```bash
git log --oneline -10
```

### Membatalkan perubahan pada satu file sebelum commit

```bash
git restore path/nama-file.jsx
```

Contoh:

```bash
git restore src/App.jsx
```

### Build gagal karena import/file tidak ditemukan

Contoh error:

```text
Could not resolve "./NamaFile"
```

Cek bahwa:

1. Nama file benar.
2. Huruf besar/kecil nama file sama persis dengan import.
3. Path relatif (`./` atau `../`) benar.
4. File memang sudah ikut di-commit ke GitHub.

Kemudian jalankan kembali:

```bash
npm run build
```

## Git Command Cepat

Alur kerja harian yang aman:

```bash
git checkout main
git pull origin main
npm install
npm run dev

# setelah selesai mengubah code
npm run build
git status
git add .
git commit -m "Deskripsi perubahan"
git push origin main
```

## Catatan Arsitektur

Authentication dan business flow existing dipertahankan. Manajemen akses SAKTI + Si Lapak Priok tetap terpisah dari Manajemen Akun GANDENG. Data GANDENG tetap difilter berdasarkan akun/perusahaan yang login.

**PLN Indonesia Power UBP Priok**
