import { ROLES } from "./data";

let __uidCounter = 0;
export const uid = (prefix) => {
  __uidCounter += 1;
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${__uidCounter}-${rand}`;
};

export const rupiah = (n) => "Rp " + (Number(n) || 0).toLocaleString("id-ID");

export const roleInitials = (roleValue) =>
  (ROLES.find((r) => r.value === roleValue)?.label || "??")
    .slice(0, 2)
    .toUpperCase();

export const roleLabel = (roleValue) =>
  ROLES.find((r) => r.value === roleValue)?.label || roleValue;

export function printDocument(title, groups) {
  const win = window.open("", "_blank", "width=850,height=960");
  if (!win) return;

  const section = (g) => `
    <section style="margin-bottom:18px;">
      ${
        g.heading
          ? `<h3 style="font-size:12.5px;text-transform:uppercase;letter-spacing:.5px;color:#0A2A50;border-bottom:1px solid #ccc;padding-bottom:4px;margin:0 0 8px;">${g.heading}</h3>`
          : ""
      }
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        ${g.rows
          .map(
            (r) => `
          <tr>
            <td style="padding:4px 8px;color:#555;width:38%;vertical-align:top;">${r.label}</td>
            <td style="padding:4px 8px;color:#111;font-weight:600;vertical-align:top;">${
              r.value === undefined || r.value === null || r.value === ""
                ? "—"
                : String(r.value)
            }</td>
          </tr>`
          )
          .join("")}
      </table>
    </section>`;

  win.document.write(`<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          body { font-family: Arial, Helvetica, sans-serif; padding: 32px; color: #111; }
          h1 { font-size: 18px; margin: 0 0 4px; }
          .sub { color: #666; font-size: 12px; margin-bottom: 22px; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="sub">Dicetak ${new Date().toLocaleString("id-ID")}</div>
        ${groups.map(section).join("")}
        <script>window.onload = function () { window.print(); };</script>
      </body>
    </html>`);
  win.document.close();
}

export function printChecklist({ title = "Checklist Kelengkapan Dokumen", subtitle = "", items = [] }) {
  const win = window.open("", "_blank", "width=850,height=960");
  if (!win) return;
  const row = (no, nama, ada) => `
    <tr>
      <td style="border:1px solid #333;padding:6px 8px;text-align:center;width:36px;">${no}</td>
      <td style="border:1px solid #333;padding:6px 10px;">${nama || "&nbsp;"}</td>
      <td style="border:1px solid #333;padding:6px 8px;text-align:center;width:60px;font-family:'Segoe UI Symbol','Arial';font-size:16px;">${ada ? "☑" : "☐"}</td>
    </tr>`;
  const rows = items.map((it, i) => row(i + 1, it.nama, !!it.ada)).join("");
  win.document.write(`<!doctype html>
    <html><head><meta charset="utf-8" /><title>${title}</title>
      <style>
        body { font-family: Arial, Helvetica, sans-serif; padding: 32px; color: #111; }
        h1 { font-size: 16px; margin: 0 0 4px; text-align:center; text-transform:uppercase; letter-spacing:.5px; }
        .sub { text-align:center; color:#555; font-size:12px; margin-bottom:22px; }
        table { width:100%; border-collapse:collapse; font-size:12.5px; }
        th { border:1px solid #333; padding:6px 8px; background:#EFEFEF; text-align:center; }
        .foot { display:flex; justify-content:space-between; margin-top:60px; font-size:12px; }
        .sig { text-align:center; }
        .sig .line { border-top:1px solid #333; margin-top:60px; padding-top:4px; width:180px; margin-left:auto; margin-right:auto; }
      </style>
    </head><body>
      <h1>${title}</h1>
      <div class="sub">${subtitle || `Dicetak ${new Date().toLocaleString("id-ID")}`}</div>
      <table>
        <thead>
          <tr><th>No</th><th style="text-align:left;">Nama Dokumen</th><th>Ada</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="foot">
        <div class="sig"><div>Pembuat</div><div class="line">(&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)</div></div>
        <div class="sig"><div>Menyetujui</div><div class="line">(&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)</div></div>
      </div>
      <script>window.onload = function () { window.print(); };</script>
    </body></html>`);
  win.document.close();
}

const BULAN_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export function bulanFromTanggal(tanggal) {
  if (!tanggal) return "";
  const d = new Date(tanggal);
  if (Number.isNaN(d.getTime())) return "";
  return `${BULAN_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

export function kategoriMediaPrefixesFor(mediaPemberitaan) {
  if (mediaPemberitaan === "Social Media") return ["Media Sosial -"];
  if (mediaPemberitaan === "Media Elektronik") {
    return ["TV -", "Media Elektronik -", "Radio -"];
  }
  if (mediaPemberitaan === "Media Cetak") return ["Media Cetak -"];
  if (mediaPemberitaan === "Media Online") return ["Media Online -"];
  return [];
}

export function scoreForKategoriMedia(kategoriMedia) {
  if (!kategoriMedia) return 0;
  if (kategoriMedia.startsWith("TV -")) return 20;
  if (kategoriMedia.startsWith("Media Cetak -")) return 15;
  if (kategoriMedia.startsWith("Media Elektronik -")) return 15;
  if (kategoriMedia.startsWith("Radio -")) return 10;
  if (kategoriMedia.startsWith("Media Online -")) return 10;
  if (kategoriMedia.startsWith("Media Sosial -")) {
    if (kategoriMedia.includes("Trending > 10000")) return 20;
    if (kategoriMedia.includes("Trending 1000-10000")) return 15;
    if (kategoriMedia.includes("> 5000")) return 15;
    if (kategoriMedia.includes("1000-5000")) return 10;
    if (kategoriMedia.includes("< 1000")) return 5;
  }
  return 0;
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
