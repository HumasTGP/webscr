import PizZip from "pizzip";
import { saveAs } from "file-saver";

/**
 * Escape text agar aman dimasukkan ke XML Word.
 */
function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Mengganti placeholder di dalam SATU paragraf <w:p>...</w:p>.
 *
 * MASALAH YANG DIPERBAIKI:
 * Word sering memecah satu placeholder seperti "[nama]" jadi beberapa
 * <w:t> terpisah, contoh: <w:t>[na</w:t><w:t>ma]</w:t>.
 * Kalau dicek satu <w:t> per satu, placeholder yang kepecah gini gak
 * akan pernah ketemu utuh, jadi gak pernah diganti, dan hasil akhirnya
 * template kosong / apa adanya.
 *
 * SOLUSI:
 * Gabungkan dulu semua teks dari <w:t> di dalam satu paragraf jadi satu
 * string utuh, baru cari-ganti placeholder di string gabungan itu.
 * Setelah itu, taruh hasilnya di <w:t> pertama, kosongkan sisanya,
 * supaya XML tetap valid.
 */
function replacePlaceholdersInParagraph(paragraphXml, data) {
  const tRegex = /<w:t([^>]*)>([\s\S]*?)<\/w:t>/g;
  const runs = [];
  let match;

  while ((match = tRegex.exec(paragraphXml)) !== null) {
    runs.push({
      fullMatch: match[0],
      attributes: match[1],
      text: match[2],
      index: match.index,
    });
  }

  if (!runs.length) return paragraphXml;

  const combinedText = runs.map((r) => r.text).join("");
  let newCombinedText = combinedText;

  for (const [placeholder, rawValue] of Object.entries(data)) {
    const values = Array.isArray(rawValue) ? rawValue : [rawValue];
    let occurrence = 0;

    const escapedPlaceholder = placeholder.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    // Cari format [placeholder] — kurung tutup dibuat opsional
    // karena ada template yang placeholder-nya gak ditutup "]".
    const normalRegex = new RegExp(`\\[${escapedPlaceholder}\\]?`, "g");

    newCombinedText = newCombinedText.replace(normalRegex, () => {
      const value = values[occurrence] ?? "";
      occurrence++;
      return escapeXml(value);
    });

    if (occurrence === 0 && !placeholder.startsWith("[")) {
      const malformedRegex = new RegExp(escapedPlaceholder, "g");
      newCombinedText = newCombinedText.replace(malformedRegex, () => {
        const value = values[occurrence] ?? "";
        occurrence++;
        return escapeXml(value);
      });
    }
  }

  if (newCombinedText === combinedText) {
    return paragraphXml;
  }

  let rebuiltParagraph = paragraphXml;

  for (let i = runs.length - 1; i >= 0; i--) {
    const run = runs[i];
    const newText = i === 0 ? newCombinedText : "";
    const newRun = `<w:t${run.attributes}>${newText}</w:t>`;

    rebuiltParagraph =
      rebuiltParagraph.slice(0, run.index) +
      newRun +
      rebuiltParagraph.slice(run.index + run.fullMatch.length);
  }

  return rebuiltParagraph;
}

function replacePlaceholders(xml, data) {
  return xml.replace(
    /<w:p\b[^>]*>[\s\S]*?<\/w:p>/g,
    (paragraphXml) => replacePlaceholdersInParagraph(paragraphXml, data)
  );
}

export async function generateDocxFromTemplate(templateUrl, data, outputName) {
  const response = await fetch(templateUrl);

  if (!response.ok) {
    throw new Error(`Template tidak ditemukan: ${templateUrl}`);
  }

  const arrayBuffer = await response.arrayBuffer();

  let zip;

  try {
    zip = new PizZip(arrayBuffer);
  } catch (error) {
    throw new Error("File template bukan DOCX/ZIP yang valid.");
  }

  const xmlFiles = Object.keys(zip.files).filter((name) =>
    /^word\/(document|header\d*|footer\d*)\.xml$/.test(name)
  );

  if (!xmlFiles.length) {
    throw new Error("Struktur dokumen Word tidak ditemukan.");
  }

  xmlFiles.forEach((fileName) => {
    const file = zip.file(fileName);

    if (!file) return;

    const xml = file.asText();

    const updatedXml = replacePlaceholders(xml, data);

    zip.file(fileName, updatedXml);
  });

  const blob = zip.generate({
    type: "blob",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  saveAs(blob, outputName);
}

// =========================================================================
// GENERATE DOCX DENGAN TABEL BARIS DINAMIS (row-cloning)
// =========================================================================
// generateDocxFromTemplate() di atas cuma cari-ganti "[placeholder]" per
// paragraf - dia TIDAK bisa mengulang baris tabel (<w:tr>) sebanyak N kali,
// karena XML baris tabelnya statis, cuma ada 1 di file template.
//
// Fungsi ini dipisah SENGAJA (bukan menimpa generateDocxFromTemplate yang
// sudah dipakai banyak halaman lain) - dipakai khusus untuk kasus dokumen
// yang butuh jumlah baris tabel dinamis, misalnya TTD Serah Terima (jumlah
// baris tanda tangan bisa 1 sampai puluhan, tergantung input user).
//
// CARA PAKAI TEMPLATE-NYA:
// 1. Di Word, bikin tabel dengan 1 baris "contoh" berisi placeholder biasa,
//    misalnya: | [no] | [nama] | [jumlah] |
// 2. Tandai baris itu sebagai baris yang di-loop dengan menaruh marker
//    "[[row]]" di salah satu sel baris tersebut (boleh sel manapun, boleh
//    digabung dengan teks lain di sel yang sama).
// 3. rowsData yang dikirim ke fungsi ini = array of object, tiap object
//    berisi placeholder utk 1 baris (misal { no: "1", nama: "", jumlah: "" }).
// 4. Baris template itu akan di-clone sebanyak rowsData.length, masing2
//    diisi datanya sendiri-sendiri, lalu marker "[[row]]" dihapus otomatis.
//
// Kalau template belum punya marker "[[row]]" sama sekali (atau template-nya
// belum ada), fungsi ini melempar error yang jelas - BUKAN diam-diam gagal.
export async function generateDocxFromTemplateWithRows(
  templateUrl,
  { data = {}, rowsData = [], rowMarker = "[[row]]" } = {},
  outputName
) {
  const response = await fetch(templateUrl);

  if (!response.ok) {
    throw new Error(`Template tidak ditemukan: ${templateUrl}`);
  }

  const arrayBuffer = await response.arrayBuffer();

  let zip;
  try {
    zip = new PizZip(arrayBuffer);
  } catch (error) {
    throw new Error("File template bukan DOCX/ZIP yang valid.");
  }

  const xmlFiles = Object.keys(zip.files).filter((name) =>
    /^word\/(document|header\d*|footer\d*)\.xml$/.test(name)
  );

  if (!xmlFiles.length) {
    throw new Error("Struktur dokumen Word tidak ditemukan.");
  }

  let rowMarkerFound = false;

  xmlFiles.forEach((fileName) => {
    const file = zip.file(fileName);
    if (!file) return;

    let xml = file.asText();

    // Cari <w:tr>...</w:tr> yang mengandung marker baris-loop.
    xml = xml.replace(/<w:tr\b[^>]*>[\s\S]*?<\/w:tr>/g, (trXml) => {
      if (!trXml.includes(rowMarker)) return trXml;
      rowMarkerFound = true;

      if (!rowsData.length) {
        // Gak ada data baris sama sekali - buang baris template + markernya
        // biar gak ada baris kosong aneh nyisa di dokumen hasil.
        return "";
      }

      return rowsData
        .map((rowData) => {
          let rowXml = trXml.replace(
            new RegExp(rowMarker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
            ""
          );
          rowXml = replacePlaceholders(rowXml, rowData);
          return rowXml;
        })
        .join("");
    });

    // Placeholder non-loop (header, judul, total, dst) tetap diganti seperti biasa.
    xml = replacePlaceholders(xml, data);

    zip.file(fileName, xml);
  });

  if (!rowMarkerFound) {
    throw new Error(
      `Template "${templateUrl}" belum punya baris tabel bertanda "${rowMarker}". ` +
      `Tambahkan marker itu di salah satu sel baris yang mau di-loop, lalu coba lagi.`
    );
  }

  const blob = zip.generate({
    type: "blob",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  saveAs(blob, outputName);
}

// generateDocxFromTemplateWithPages() - clone SATU HALAMAN PENUH sebanyak
// jumlah data yang dikirim, dipisah page break otomatis di antaranya. Beda
// dari generateDocxFromTemplateWithRows() yang meng-clone satu BARIS TABEL
// (dipakai kalau 1 dokumen = banyak baris ringkas dalam satu tabel). Fungsi
// ini dipakai kalau 1 dokumen = banyak halaman terpisah, tiap halaman formatnya
// sama tapi datanya beda (misal Tanda Terima: tiap kegiatan dapat halaman
// sendiri dengan tanda tangan penerima yang beda-beda, ditulis tangan).
//
// CARA PAKAI TEMPLATE-NYA:
// 1. Di Word, buat SATU halaman contoh dengan placeholder biasa, misalnya
//    [nama], [jumlah], [tanggalCetak].
// 2. Tandai AWAL halaman dengan menaruh teks "[[page-start]]" di paragraf
//    pertama halaman itu, dan AKHIR halaman dengan "[[page-end]]" di paragraf
//    terakhir (boleh digabung teks lain di paragraf yang sama).
// 3. pagesData yang dikirim ke fungsi ini = array of object, tiap object
//    berisi placeholder untuk 1 halaman (misal { nama: "...", jumlah: "..." }).
// 4. Blok halaman itu (dari [[page-start]] sampai [[page-end]]) di-clone
//    sebanyak pagesData.length, dipisah page break, markernya dihapus otomatis.
export async function generateDocxFromTemplateWithPages(
  templateUrl,
  { data = {}, pagesData = [], startMarker = "[[page-start]]", endMarker = "[[page-end]]" } = {},
  outputName
) {
  const response = await fetch(templateUrl);

  if (!response.ok) {
    throw new Error(`Template tidak ditemukan: ${templateUrl}`);
  }

  const arrayBuffer = await response.arrayBuffer();

  let zip;
  try {
    zip = new PizZip(arrayBuffer);
  } catch (error) {
    throw new Error("File template bukan DOCX/ZIP yang valid.");
  }

  const file = zip.file("word/document.xml");
  if (!file) {
    throw new Error("Struktur dokumen Word tidak ditemukan.");
  }

  let xml = file.asText();

  const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Cari blok dari paragraf berisi startMarker sampai paragraf berisi
  // endMarker (inklusif keduanya) - blok ini yang akan di-clone per halaman.
  const blockRe = new RegExp(
    `(<w:p\\b[^>]*>(?:(?!<\\/w:p>)[\\s\\S])*?${escRe(startMarker)}[\\s\\S]*?<\\/w:p>)([\\s\\S]*?)(<w:p\\b[^>]*>(?:(?!<\\/w:p>)[\\s\\S])*?${escRe(endMarker)}[\\s\\S]*?<\\/w:p>)`
  );

  const match = xml.match(blockRe);
  if (!match) {
    throw new Error(
      `Template "${templateUrl}" belum punya marker "${startMarker}" dan "${endMarker}". ` +
      `Tandai awal dan akhir halaman yang mau di-loop, lalu coba lagi.`
    );
  }

  const fullBlock = match[0];
  const pageBreak = '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';

  const cloned = pagesData.length
    ? pagesData
        .map((pageData, i) => {
          let pageXml = fullBlock
            .replace(new RegExp(escRe(startMarker), "g"), "")
            .replace(new RegExp(escRe(endMarker), "g"), "");
          pageXml = replacePlaceholders(pageXml, { ...data, ...pageData });
          // Page break di ANTARA halaman, bukan sesudah halaman terakhir.
          return i < pagesData.length - 1 ? pageXml + pageBreak : pageXml;
        })
        .join("")
    : "";

  xml = xml.replace(fullBlock, cloned);
  xml = replacePlaceholders(xml, data);

  zip.file("word/document.xml", xml);

  const blob = zip.generate({
    type: "blob",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  saveAs(blob, outputName);
}

// Format tanggal "YYYY-MM-DD" → "31 Agustus 2026"
export function formatTanggalPanjang(isoDate) {
  if (!isoDate) return "";

  const d = new Date(`${isoDate}T00:00:00`);

  if (Number.isNaN(d.getTime())) {
    return isoDate;
  }

  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Hitung "Week ke berapa" dalam bulan berjalan (Senin dianggap awal minggu).
function getWeekOfMonth(date) {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDayWeekday = (firstDayOfMonth.getDay() + 6) % 7; // 0=Senin..6=Minggu
  const adjustedDate = date.getDate() + firstDayWeekday;
  return Math.ceil(adjustedDate / 7);
}

const NAMA_BULAN_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

/**
 * Menghasilkan teks otomatis: "Week 4/Januari/2026"
 * @param {Date} [date] - default: tanggal hari ini
 * @returns {string}
 */
export function formatWeekBulanTahun(date = new Date()) {
  const week = getWeekOfMonth(date);
  const bulan = NAMA_BULAN_ID[date.getMonth()];
  const tahun = date.getFullYear();

  return `Week ${week}/${bulan}/${tahun}`;
}