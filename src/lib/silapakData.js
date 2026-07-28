// Data & util khusus modul Si Lapak Priok.
// Modul ini terpisah total dari data.js milik SIKAS (tidak menyentuhnya).

export const SHIFTS = [
  { value: "pagi", label: "Pagi", time: "06.00 - 14.00" },
  { value: "siang", label: "Siang", time: "14.00 - 22.00" },
  { value: "malam", label: "Malam", time: "22.00 - 06.00" },
];

export const SATPAM_SEED = ["Tyo", "Andra", "Rizky", "Bagus"];

export const EKSPEDISI_OPT = [
  "JNE",
  "J&T Express",
  "SiCepat",
  "Shopee Express",
  "Anteraja",
  "Gojek/Grab (instan)",
  "Kurir internal",
  "Lainnya",
];

export const uidSilapak = (prefix) =>
  `${prefix}-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;

export const nowJam = () =>
  new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

export const nowTanggal = () =>
  new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

export const bulanIni = () =>
  new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" });
