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

## Development
```bash
npm ci
npm run dev
```

## Production Build
```bash
npm run build
```

Authentication dan business flow existing dipertahankan. Manajemen akses SAKTI + Si Lapak Priok tetap terpisah dari Manajemen Akun GANDENG. Data GANDENG tetap difilter berdasarkan akun/perusahaan yang login.

**PLN Indonesia Power UBP Priok**
