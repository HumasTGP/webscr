# Pembaruan Database dan Upload File

Spreadsheet aktif:

`1m8Xd_eXMzudvDrqfSme8rfIE6RiIA1MRoId9bwZVopg`

## 1. Perbarui Apps Script

Salin isi terbaru berikut ke project Apps Script yang menghasilkan URL Web App `/exec`:

- `apps-script/Code.gs`
- `apps-script/Setup.gs`

Simpan, kemudian buat deployment Web App versi baru dengan pengaturan:

- Execute as: **Me**
- Who has access: **Anyone**

Jika URL deployment berubah, ganti `API_URL` pada `src/lib/api.js`.

## 2. Gunakan Spreadsheet lama yang masih kosong

Jalankan fungsi berikut satu kali dari editor Apps Script:

1. `gunakanSpreadsheetLama`
2. Jika masih terdapat data contoh dari versi sebelumnya, jalankan `kosongkanDataTransaksi`
3. Jalankan `rapikanKolomDatabase` untuk menghapus kolom duplikat/lama
4. `testDatabaseConnection`

Fungsi tersebut tetap memakai Spreadsheet dengan ID di atas. Tidak ada
Spreadsheet baru yang dibuat dan tidak ada data contoh yang dimasukkan.
`kosongkanDataTransaksi` membuat backup otomatis, lalu menghapus seluruh data
transaksi dan nama satpam contoh. Akun login, organisasi, serta pilihan master
SAKTI tetap dipertahankan. Fungsi ini hanya dijalankan sekali sebelum database
dipakai untuk data riil.

`hapusDataContoh` tetap tersedia untuk pembersihan selektif berdasarkan nama
contoh. Gunakan `kosongkanDataTransaksi` jika database memang seharusnya bersih.

`rapikanKolomDatabase` tidak menghapus record pengguna. Fungsi ini membuat
backup, mempertahankan data yang masih dipakai frontend, menghapus kolom link
ganda (`downloadUrl`), metadata lokasi file, timestamp SI LAPAK yang berulang,
serta kolom item RAB/LMP/Cash Card peninggalan versi lama.

## 3. Perbaikan yang diterapkan

- Nilai kosong ditulis sebagai sel kosong, bukan `~csr3:""`, `~csr3:null`, atau `~csr3:{}`.
- Frontend tidak lagi memiliki RAB, proposal, vendor, konten, atau mitra demo.
- Kolom lama yang tidak lagi dipakai form Proposal dihapus saat cleanup.
- Kolom fisik berlebih di sisi kanan setiap tab dihapus.
- File proposal/lampiran diunggah ke Google Drive terlebih dahulu.
- Nama file, URL lihat, dan URL unduh disimpan ke Spreadsheet.
- Notifikasi SI LAPAK dihitung langsung dari status paket, surat, tamu, dan
  petugas. Notifikasi tidak disimpan sebagai data tambahan di Spreadsheet.
- Paket/surat berstatus `Belum Diambil` memunculkan pengingat sampai serah
  terima selesai.
- Kunjungan berstatus `Sedang Berkunjung` memunculkan pengingat sampai waktu
  keluar dicatat.

## 4. Menjalankan frontend

ZIP ini tidak menyertakan `node_modules`. Jalankan:

```powershell
npm install
npm run dev
```
