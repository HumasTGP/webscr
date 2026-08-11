// ============================================================
// DATA TIM — PLN Indonesia Power UBP Priok
//
// Cara mengubah data tim:
//   - name   : Ganti string nama lengkap anggota tim
//   - role   : Ganti jabatan atau peran anggota
//   - photo  : Letakkan foto di folder /public/team/, lalu isi
//              path-nya. Contoh: "/team/nama-file.jpg"
//              Biarkan null jika belum ada foto (tampil avatar)
//   - instagram : Isi URL Instagram. Contoh:
//              "https://www.instagram.com/username/"
//              Isi "#" jika belum ada
//   - linkedin  : Isi URL LinkedIn. Contoh:
//              "https://www.linkedin.com/in/username/"
//              Isi "#" atau hapus jika tidak digunakan
// ============================================================

export const TEAM = [
  {
    id: 1,
    name:      "Nama Anggota 1",   // <-- Ganti nama di sini
    role:      "Jabatan / Peran",  // <-- Ganti jabatan di sini
    photo:     null,               // <-- Ganti path foto di sini
    instagram: "#",                // <-- Isi link Instagram di sini
    linkedin:  "#",                // <-- Isi link LinkedIn di sini
  },
  {
    id: 2,
    name:      "Nama Anggota 2",
    role:      "Jabatan / Peran",
    photo:     null,
    instagram: "#",
    linkedin:  "#",
  },
  {
    id: 3,
    name:      "Nama Anggota 3",
    role:      "Jabatan / Peran",
    photo:     null,
    instagram: "#",
    linkedin:  "#",
  },
];
