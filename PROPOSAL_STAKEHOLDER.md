# Proposal Stakeholder — v2 (revisi + docx auto-fill)

This revision layers on top of the first Proposal Stakeholder delivery,
per the marked-up PDF revision and the BAST/PI Word templates you sent.
Sidebar layout, Administrasi Kas, and every other module are untouched.

## 1. What changed this round

**Form (Rekap Pengajuan Proposal → Tambah Proposal)**
- All labels now in Bahasa Indonesia, matching your itemized a–p list.
- Removed "Sumber Pengaju" entirely.
- ID Pengajuan Proposal no longer shows the "(otomatis...)" hint text, and
  sits left-aligned next to Tanggal Masuk (both single-line labels now, so
  they stay vertically aligned).
- The whole form is left-aligned instead of centered — via a new optional
  `align="left"` prop on the shared `FormGrid` component (defaults to
  `"center"`, so every other wizard — RAB/TOR/BAST/Laporan/Konten — is
  unaffected).
- Program dropdown: Indonesian-only options (Pelayanan Masyarakat /
  Pemberdayaan Masyarakat / Pembinaan Hubungan Masyarakat).
- Upload fields (File Proposal, Dokumentasi Kegiatan) are now a **real**
  file picker — any file type, 10MB max, shows filename + size, removable.
  Implemented as a new field type `"file-upload"` in `FieldInput.jsx` —
  purely additive; the old `"file"` type used elsewhere (e.g. Laporan's
  Evidence Foto) is untouched.

**Wizard is now 5 steps**, per your note:
`Isi Formulir (Proposal) → Isi BAST → Isi PI → Konfirmasi → Simpan`.
BAST and PI data are collected right after the Proposal form, all three
saved together under the same Proposal ID.

**Row actions simplified to 4 icons** (down from 8):
- 👁 **View** — one scrollable overview: Proposal, then BAST, then PI.
- ✏️ **Edit** — opens "Ingin edit dokumen apa? Proposal / BAST / PI", then
  opens that document's own edit form.
- 🗑 **Delete** — unchanged, confirms first.
- 🖨 **Print** — one icon, opens a chooser: Print Proposal (preview) /
  Download BAST (.docx) / Download PI (.docx) / Print Semua (gabungan
  preview).

## 2. Real .docx auto-fill (BAST & PI)

Your `Template_BA.docx` and `Template_PI.docx` are now used as-is — I
replaced the sample values inside them with `{tag}` placeholders (docx XML
edited directly, validated afterward) and placed the patched files at:

```
public/templates/Template_BA.docx
public/templates/Template_PI.docx
```

New dependencies: `docxtemplater`, `pizzip`, `file-saver` (added to
`package.json`). New utility `src/lib/docxGenerate.js`:

```js
generateDocxFromTemplate(templateUrl, data, outputFilename)
```
fetches the template, fills it with `data`, and triggers a download —
entirely client-side, no backend needed.

**Tags used in Template_BA.docx:** `tanggalBast`, `namaPihakPertama`,
`jabatanPihakPertama`, `namaPihakKedua`, `jabatanPihakKedua`,
`uraianBantuan`, `namaLembaga`.

**Tags used in Template_PI.docx:** `tanggalPi`, `namaLembaga`,
`namaPenerima`, `judulProposal`.

`namaLembaga` and `judulProposal` are pulled automatically from the
Proposal record — you only fill in BAST/PI-specific fields in steps 2 & 3
of the wizard.

I test-rendered both templates with sample data end-to-end (Node +
docxtemplater) and confirmed the output reads correctly — see the "Download
BAST/PI (.docx)" option in the Print chooser.

## 3. Cetak Form Evaluasi

Now maps data from **Proposal + BAST + PI** together (per your note that
the evaluation form draws from all three). The Excel template you
mentioned didn't come through in the upload — only `Revisi.pdf`,
`Template_BA.docx`, and `Template_PI.docx` arrived. Once you resend the
Excel template, I'll wire the same auto-fill pattern (this time via
SheetJS/xlsx instead of docxtemplater) into this page.

## 4. Files touched this round

- `src/lib/data.js` — `programHumas` options → Indonesian-only
- `src/lib/wizardFields.js` — `proposalFields()` rewritten (Indonesian
  labels, drop Sumber Pengaju, real uploads); added `proposalAdminFields()`,
  `bastStepFields()`, `paktaStepFields()`
- `src/lib/utils.js` — unchanged this round (still has `printDocument`)
- `src/lib/docxGenerate.js` — **new**: docx auto-fill + download
- `src/components/FormGrid.jsx` — added optional `align` prop
- `src/components/FieldInput.jsx` — added new `"file-upload"` type
  (real picker, 10MB limit)
- `src/pages/ProposalRekap.jsx` — rewritten: 5-step wizard, 4 action
  icons, overview/edit-chooser/print-chooser modals, docx downloads
- `src/pages/ProposalEvaluasi.jsx` — rewritten: maps Proposal + BAST + PI
- `public/templates/Template_BA.docx`, `Template_PI.docx` — your templates,
  patched with `{tag}` placeholders

## 5. Form Evaluasi interaktif (v3)

`Cetak Form Evaluasi` sekarang bukan cuma preview data — halaman ini
mereplikasi rubrik penilaian berbobot dari `Template_Form_Eval.xlsx`
(sheet "Form Eval New", Lampiran 1 Petunjuk Teknis 0023.E/DIR/2025):

- 9 kategori penilaian (Lokasi Kegiatan, Jenis Program, Lembaga Pemohon,
  Kualifikasi Lembaga, Penerima Manfaat Kegiatan, Jumlah Penerima Manfaat,
  Partisipasi Bantuan, Nilai Manfaat, Publikasi), masing-masing dengan 3
  teks anchor (Tidak Signifikan/Netral/Signifikan) dan Bobot tetap
  (15/20/10/5/15/5/5/15/10 — total 100).
- Pegawai memilih Nilai (0.25–3.00, 12 pilihan) per kategori langsung di
  halaman ini — bukan di Excel.
- Rumus dihitung live, **persis** sama seperti formula asli di file Excel
  (dicek langsung dari cell formula, bukan cuma nilai tampilan):
  - Total Skor per kategori = `Nilai × Bobot` (kolom R, TIDAK dibagi 3)
  - Skor Akhir = `SUM(semua Total Skor) / 3` (kolom Q30)
  - Rekomendasi: 0–50 Tidak Direkomendasikan · 51–75 Cukup dengan
    Pertimbangan · 76–100 Direkomendasikan
- ID Pengajuan, Pemohon, dan Perihal otomatis terisi dari Proposal yang
  dipilih (menggantikan `VLOOKUP`/`QUERY` di Excel).
- Field lain (Penilai, Tanggal, Catatan Rekomendasi, 3 kolom
  persetujuan/tanda tangan, Keputusan) langsung bisa diedit di halaman.
- Tombol "Print Evaluation Form" mencetak semua data di atas (identitas +
  skor per kategori + Skor Akhir + rekomendasi + persetujuan).

New exports: `evaluasiKategoriFields()` dan `EVALUASI_NILAI_OPTIONS` di
`src/lib/wizardFields.js`; `hitungSkorEvaluasi()` di `src/lib/utils.js`.

## 6. Form Evaluasi → tulis langsung ke Template_Form_Eval.xlsx asli (v4)

Ganti pendekatan dari v3: bukan lagi rubrik custom yang di-print sebagai
HTML, tapi menulis LANGSUNG ke `public/templates/Template_Form_Eval.xlsx`
(sheet "Form Eval New") pakai `exceljs` — dan HANYA sel-sel berikut yang
disentuh:

| Sel | Isi |
|---|---|
| I6 | ID Pengajuan (otomatis dari proposal) |
| C7 | Pemohon (otomatis dari Nama Instansi) |
| C8 | Perihal (otomatis dari Judul Proposal/Kegiatan) |
| Q7 | Penilai (input pegawai) |
| Q8 | Tanggal (input pegawai) |
| D13..O29 | Tanda "x" pada Nilai (0.25–3.00) yang dipilih per kategori |
| B33 | Catatan Penting / Rekomendasi |

Semua formula (`SUMIF` Total Skor, `SUM(...)/3` Skor Akhir, `IF(...)`
keputusan otomatis) dan seluruh blok tanda tangan (Officer Community
Development / Assistant Manager KAS / Administration Manager) **tidak
disentuh sama sekali** — persis sesuai template asli begitu dibuka di
Excel.

Sudah divalidasi end-to-end: ditulis pakai ExcelJS → direkalkulasi pakai
LibreOffice headless (`recalc.py`) → hasil Skor Akhir & keputusan (`L37`)
dicek cocok 100% dengan formula asli filenya (bukan cuma nilai tampilan).

Halaman `Cetak Form Evaluasi` sekarang tampil sebagai grid bergaris ala
spreadsheet (bukan form biasa) — pegawai isi Nilai per kategori + Penilai/
Tanggal/Catatan, skor kehitung live di layar (pakai logika JS yang sama
persis dengan formula Excel-nya), lalu tombol **"Simpan sebagai Excel
(.xlsx)"** men-download file asli yang sudah terisi.

New file: `src/lib/xlsxGenerate.js`. New dependency: `exceljs`.
