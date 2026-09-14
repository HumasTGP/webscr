import { ROLES } from "./data";

// Parse string tanggal "YYYY-MM-DD" (dari DatePicker/<input type="date">) sebagai
// tanggal LOKAL, bukan UTC. `new Date("YYYY-MM-DD")` diinterpretasikan browser
// sebagai UTC midnight, yang begitu ditampilkan ulang di zona WIB (+7) bisa mundur
// atau maju sehari. Semua kode yang mengolah tanggal-tanggal semacam ini (RAB, TOR,
// NON PO, dst) sebaiknya pakai helper ini alih-alih `new Date(dateStr)` langsung.
export function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = String(dateStr).split("-").map(Number);
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

let __uidCounter = 0;
export const uid = (prefix) => {
  __uidCounter += 1;
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${__uidCounter}-${rand}`;
};

export const rupiah = (n) => "Rp " + (Number(n) || 0).toLocaleString("id-ID");

const DISPLAY_ROLE = {
  humas: "SAKTI - Humas",
  asman: "SAKTI - Asman",
  madm: "SAKTI - MADM",
  silapak: "Si Lapak Priok",
  mitra: "GANDENG",
  gandeng: "GANDENG",
};

export const roleLabel = (roleValue) =>
  DISPLAY_ROLE[roleValue] || ROLES.find((r) => r.value === roleValue)?.label || roleValue;

export const roleInitials = (roleValue) => {
  if (roleValue === "humas") return "HU";
  if (roleValue === "asman") return "AS";
  if (roleValue === "madm") return "MA";
  if (roleValue === "silapak") return "SL";
  if (roleValue === "mitra" || roleValue === "gandeng") return "GA";
  return roleLabel(roleValue).slice(0, 2).toUpperCase();
};

export function printDocument(title, groups) {
  const win = window.open("", "_blank", "width=850,height=960");
  if (!win) return;
  const section = (g) => `<section style="margin-bottom:18px;">${g.heading ? `<h3 style="font-size:12.5px;text-transform:uppercase;letter-spacing:.5px;color:#036D9A;border-bottom:1px solid #ccc;padding-bottom:4px;margin:0 0 8px;">${g.heading}</h3>` : ""}<table style="width:100%;border-collapse:collapse;font-size:13px;">${g.rows.map((r) => `<tr><td style="padding:4px 8px;color:#555;width:38%;vertical-align:top;">${r.label}</td><td style="padding:4px 8px;color:#111;font-weight:600;vertical-align:top;">${r.value === undefined || r.value === null || r.value === "" ? "-" : String(r.value)}</td></tr>`).join("")}</table></section>`;
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:Arial,Helvetica,sans-serif;padding:32px;color:#111}h1{font-size:18px;margin:0 0 4px}.sub{color:#666;font-size:12px;margin-bottom:22px}</style></head><body><h1>${title}</h1><div class="sub">Dicetak ${new Date().toLocaleString("id-ID")}</div>${groups.map(section).join("")}</body></html>`);
  win.document.close();
  setTimeout(() => win.print(), 150);
}

export function printChecklist({ title = "Checklist Kelengkapan Dokumen", subtitle = "", items = [] }) {
  const win = window.open("", "_blank", "width=850,height=960");
  if (!win) return;
  const rows = items.map((it, i) => `<tr><td style="border:1px solid #333;padding:6px 8px;text-align:center;width:36px;">${i + 1}</td><td style="border:1px solid #333;padding:6px 10px;">${it.nama || "&nbsp;"}</td><td style="border:1px solid #333;padding:6px 8px;text-align:center;width:60px;font-size:16px;">${it.ada ? "☑" : "☐"}</td></tr>`).join("");
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:Arial,Helvetica,sans-serif;padding:32px;color:#111}h1{font-size:16px;margin:0 0 4px;text-align:center;text-transform:uppercase}.sub{text-align:center;color:#555;font-size:12px;margin-bottom:22px}table{width:100%;border-collapse:collapse;font-size:12.5px}th{border:1px solid #333;padding:6px 8px;background:#eee}.foot{display:flex;justify-content:space-between;margin-top:60px;font-size:12px}.sig{text-align:center}.line{border-top:1px solid #333;margin-top:60px;padding-top:4px;width:180px}</style></head><body><h1>${title}</h1><div class="sub">${subtitle || `Dicetak ${new Date().toLocaleString("id-ID")}`}</div><table><thead><tr><th>No</th><th>Nama Dokumen</th><th>Ada</th></tr></thead><tbody>${rows}</tbody></table><div class="foot"><div class="sig">Pembuat<div class="line">(&nbsp;)</div></div><div class="sig">Menyetujui<div class="line">(&nbsp;)</div></div></div></body></html>`);
  win.document.close();
  setTimeout(() => win.print(), 150);
}

const BULAN_NAMES = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
export function bulanFromTanggal(tanggal) {
  const d = parseLocalDate(tanggal);
  if (!d) return "";
  return `${BULAN_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

export function kategoriMediaPrefixesFor(mediaPemberitaan) {
  if (mediaPemberitaan === "Social Media") return ["Media Sosial -"];
  if (mediaPemberitaan === "Media Elektronik") return ["TV -", "Media Elektronik -", "Radio -"];
  if (mediaPemberitaan === "Media Cetak") return ["Media Cetak -"];
  if (mediaPemberitaan === "Media Online") return ["Media Online -"];
  return [];
}

const KATEGORI_MEDIA_SCORE = {
  "TV - Cnbc": 100, "TV - Global Tv": 100, "TV - Indosiar": 100, "TV - Inews": 100,
  "TV - Kompas Tv": 100, "TV - Metro Tv": 100, "TV - Mnc Tv": 100, "TV - Rcti": 100,
  "TV - Sctv": 100, "TV - Sea Today": 100, "TV - Trans 7": 100, "TV - Trans Tv": 100,
  "TV - Tv One": 100, "TV - Local & Lainnya Tv": 10,

  "Radio - Elshinta": 25, "Radio - Gen Fm": 25, "Radio - Iradio": 25, "Radio - Kiss Fm": 25,
  "Radio - Most Fm": 25, "Radio - Prambors Fm": 25, "Radio - Rri Pro 1 Banten": 25,
  "Radio - Rri Pro 1 Jakarta": 25, "Radio - Rri Pro 2 Jakarta": 25, "Radio - Trijaya Fm": 25,
  "Radio - Local & Lainnya Radio": 10,

  "Media Cetak - Bisnis Indonesia": 50, "Media Cetak - Harian Kontan": 50,
  "Media Cetak - Investor Daily": 50, "Media Cetak - Jawapos": 50, "Media Cetak - Kompas": 50,
  "Media Cetak - Kontan Tabloid": 50, "Media Cetak - Koran Sindo": 50,
  "Media Cetak - Koran Tempo": 50, "Media Cetak - Majalah Tempo": 50,
  "Media Cetak - Media Indonesia": 50, "Media Cetak - Rakyat Merdeka": 50,
  "Media Cetak - Local & Lainnya Media Cetak": 5,

  "Media Online - Antaranews.com": 25, "Media Online - Bbc News": 25,
  "Media Online - Berita Satu.com": 25, "Media Online - Bisnis.com": 25,
  "Media Online - Cnbc Indonesia": 25, "Media Online - Cnn Indonesia": 25,
  "Media Online - Detik.com": 25, "Media Online - Idn Times": 25,
  "Media Online - Idxchannel.com": 25, "Media Online - Inews.id": 25,
  "Media Online - Investor.id": 25, "Media Online - Jawapos.com": 25,
  "Media Online - Jpnn.com": 25, "Media Online - Kompas.com": 25,
  "Media Online - Kontan.co.id": 25, "Media Online - Kumparan.com": 25,
  "Media Online - Liputan6.com": 25, "Media Online - Medcom.id": 25,
  "Media Online - Merdeka.com": 25, "Media Online - Okezone": 25,
  "Media Online - Pikiran-Rakyat.com": 25, "Media Online - Republika.co.id": 25,
  "Media Online - Sindonews.com": 25, "Media Online - Suara.com": 25,
  "Media Online - Tempo.co": 25, "Media Online - The Jakarta Post": 25,
  "Media Online - Tirto.id": 25, "Media Online - Tribunnews.com": 25,
  "Media Online - Viva.co.id": 25, "Media Online - Warta Ekonomi": 25,
  "Media Online - Warta Kota": 25, "Media Online - Local & Lainnya Media Online": 1,

  "Media Sosial - Twitter Views/Like <=99": 0, "Media Sosial - Twitter Views/Like >=100": 1,
  "Media Sosial - Twitter Views/Like >=1000": 5, "Media Sosial - Twitter Views/Like >=5000": 10,
  "Media Sosial - Twitter Views/Like >=10000": 15, "Media Sosial - Twitter Views/Like >=50000": 50,
  "Media Sosial - Twitter Views/Like >=100000": 100,

  "Media Sosial - Facebook Views/Like <=99": 0, "Media Sosial - Facebook Views/Like >=100": 1,
  "Media Sosial - Facebook Views/Like >=1000": 5, "Media Sosial - Facebook Views/Like >=5000": 10,
  "Media Sosial - Facebook Views/Like >=10000": 15, "Media Sosial - Facebook Views/Like >=50000": 50,
  "Media Sosial - Facebook Views/Like >=100000": 100,

  "Media Sosial - Threads Views/Like <=99": 0, "Media Sosial - Threads Views/Like >=100": 1,
  "Media Sosial - Threads Views/Like >=1000": 5, "Media Sosial - Threads Views/Like >=5000": 10,
  "Media Sosial - Threads Views/Like >=10000": 15, "Media Sosial - Threads Views/Like >=50000": 50,
  "Media Sosial - Threads Views/Like >=100000": 100,

  "Media Sosial - Instagram Feeds Views/Like <=99": 0, "Media Sosial - Instagram Feeds Views/Like >=100": 5,
  "Media Sosial - Instagram Feeds Views/Like >=1000": 10, "Media Sosial - Instagram Feeds Views/Like >=5000": 15,
  "Media Sosial - Instagram Feeds Views/Like >=10000": 50, "Media Sosial - Instagram Feeds Views/Like >=50000": 100,
  "Media Sosial - Instagram Feeds Views/Like >=100000": 200,

  "Media Sosial - Instagram Reels Views/Like <=99": 0, "Media Sosial - Instagram Reels Views/Like >=100": 5,
  "Media Sosial - Instagram Reels Views/Like >=1000": 15, "Media Sosial - Instagram Reels Views/Like >=5000": 25,
  "Media Sosial - Instagram Reels Views/Like >=10000": 50, "Media Sosial - Instagram Reels Views/Like >=50000": 150,
  "Media Sosial - Instagram Reels Views/Like >=100000": 300,

  "Media Sosial - Tiktok Views/Like <=99": 0, "Media Sosial - Tiktok Views/Like >=100": 5,
  "Media Sosial - Tiktok Views/Like >=1000": 15, "Media Sosial - Tiktok Views/Like >=5000": 25,
  "Media Sosial - Tiktok Views/Like >=10000": 50, "Media Sosial - Tiktok Views/Like >=50000": 150,
  "Media Sosial - Tiktok Views/Like >=100000": 300,

  "Media Sosial - Youtube Short Views/Like <=99": 0, "Media Sosial - Youtube Short Views/Like >=100": 5,
  "Media Sosial - Youtube Short Views/Like >=1000": 15, "Media Sosial - Youtube Short Views/Like >=5000": 20,
  "Media Sosial - Youtube Short Views/Like >=10000": 50, "Media Sosial - Youtube Short Views/Like >=50000": 150,
  "Media Sosial - Youtube Short Views/Like >=100000": 300,

  "Media Sosial - Youtube Video Views/Like <=99": 0, "Media Sosial - Youtube Video Views/Like >=100": 25,
  "Media Sosial - Youtube Video Views/Like >=1000": 50, "Media Sosial - Youtube Video Views/Like >=5000": 75,
  "Media Sosial - Youtube Video Views/Like >=10000": 125, "Media Sosial - Youtube Video Views/Like >=50000": 200,
  "Media Sosial - Youtube Video Views/Like >=100000": 400,

  "Media Sosial - KOL Instagram Views/Like >=5000": 50, "Media Sosial - KOL Instagram Views/Like >=10000": 75,
  "Media Sosial - KOL Instagram Views/Like >=50000": 250, "Media Sosial - KOL Instagram Views/Like >=100000": 500,

  "Media Sosial - KOL Tiktok Views/Like >=5000": 50, "Media Sosial - KOL Tiktok Views/Like >=10000": 75,
  "Media Sosial - KOL Tiktok Views/Like >=50000": 250, "Media Sosial - KOL Tiktok Views/Like >=100000": 500,

  "Media Sosial - Homeless Media Reels Views/Like >=5000": 50, "Media Sosial - Homeless Media Reels Views/Like >=10000": 75,
  "Media Sosial - Homeless Media Reels Views/Like >=50000": 250, "Media Sosial - Homeless Media Reels Views/Like >=100000": 500,

  "Media Sosial - Homeless Media Feeds Views/Like >=5000": 45, "Media Sosial - Homeless Media Feeds Views/Like >=10000": 70,
  "Media Sosial - Homeless Media Feeds Views/Like >=50000": 150, "Media Sosial - Homeless Media Feeds Views/Like >=100000": 300,
};

export function multiplierForKategoriIsu(kategori) {
  if (!kategori) return 1;
  if (kategori.startsWith("B1.")) return 3;
  if (kategori.startsWith("B2.")) return 2;
  if (kategori.startsWith("B3.")) return 1;
  return 1;
}

export function baseScoreForKategoriMedia(kategoriMedia) {
  if (!kategoriMedia) return 0;
  return KATEGORI_MEDIA_SCORE[kategoriMedia] || 0;
}

export function scoreForKategoriMedia(kategoriMedia, kategoriIsu) {
  const base = baseScoreForKategoriMedia(kategoriMedia);
  if (!kategoriIsu) return base;
  return base * multiplierForKategoriIsu(kategoriIsu);
}

export function nextIdFor(prefix, items, idKey = "id") {
  if (!items || items.length === 0) return `${prefix}-001`;
  const last = items[items.length - 1];
  const lastId = String(last?.[idKey] || "");
  const m = lastId.match(/^(.*?)(\d+)$/);
  if (!m) return `${prefix}-001`;
  const stem = m[1];
  const num = parseInt(m[2], 10);
  const width = m[2].length;
  return `${stem}${String(num + 1).padStart(width, "0")}`;
}

// ID murni angka 3 digit (001, 002, ...), tanpa huruf/prefix apapun. Mengambil
// angka di EKOR string field id supaya data lama berformat "PRP-001" dsb tetap
// terhitung benar sebagai 001 (bukan digabung jadi angka besar).
export function nextNumericId(items, idKey = "id") {
  const maxNum = (items || []).reduce((max, it) => {
    const m = String(it?.[idKey] || "").match(/(\d{1,3})$/);
    const n = m ? parseInt(m[1], 10) : NaN;
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  return String(maxNum + 1).padStart(3, "0");
}

const _SATUAN_TB = [
  "", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan",
  "Sepuluh", "Sebelas", "Dua Belas", "Tiga Belas", "Empat Belas", "Lima Belas",
  "Enam Belas", "Tujuh Belas", "Delapan Belas", "Sembilan Belas",
];
function _ratusan(n) {
  if (n < 20) return _SATUAN_TB[n];
  if (n < 100) {
    const t = Math.floor(n / 10), r = n % 10;
    return _SATUAN_TB[t] + " Puluh" + (r ? " " + _SATUAN_TB[r] : "");
  }
  const h = Math.floor(n / 100), r = n % 100;
  const prefix = h === 1 ? "Seratus" : _SATUAN_TB[h] + " Ratus";
  return r ? prefix + " " + _ratusan(r) : prefix;
}
export function terbilang(num) {
  const n = Math.floor(Math.abs(Number(num) || 0));
  if (n === 0) return "Nol Rupiah";
  const parts = [[1e12,"Triliun"],[1e9,"Miliar"],[1e6,"Juta"],[1e3,"Ribu"],[1,""]];
  let result = "", rem = n;
  for (const [base, suffix] of parts) {
    const q = Math.floor(rem / base);
    rem %= base;
    if (!q) continue;
    if (base === 1000 && q === 1) result += "Seribu ";
    else result += _ratusan(q) + (suffix ? " " + suffix : "") + " ";
  }
  return result.trim() + " Rupiah";
}

export function hitungSkorEvaluasi(kategoriList, nilaiMap) {
  const perKategori = kategoriList.map((k) => {
    const nilai = nilaiMap[k.key];
    const totalSkor = nilai ? Number(nilai) * k.bobot : 0;
    return { ...k, nilai: nilai || null, totalSkor };
  });
  const skorAkhir = perKategori.reduce((sum, k) => sum + k.totalSkor, 0) / 3;
  let rekomendasi = "Belum lengkap";
  if (perKategori.every((k) => k.nilai)) {
    if (skorAkhir <= 50) rekomendasi = "Tidak Direkomendasikan";
    else if (skorAkhir <= 75) rekomendasi = "Cukup untuk Direkomendasikan dengan Pertimbangan";
    else rekomendasi = "Direkomendasikan";
  }
  return { perKategori, skorAkhir, rekomendasi };
}
