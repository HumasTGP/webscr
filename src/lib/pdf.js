import jsPDF from "jspdf";
import fallbackLogo from "../assets/pln-priok-logo.svg";
import { rupiah } from "./utils";

const PAGE = { w: 210, h: 297 };
const MARGIN = 18;
const LOGO_CANDIDATES = ["/logo.png", "/logo.jpg", "/logo.jpeg"];

let cachedLogoData = null;

async function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function toDataUrl(src) {
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || 512;
  canvas.height = img.naturalHeight || 512;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  return {
    dataUrl: canvas.toDataURL("image/png"),
    aspect: canvas.width / canvas.height,
  };
}

async function resolveLogoData() {
  if (cachedLogoData) return cachedLogoData;
  for (const src of LOGO_CANDIDATES) {
    try {
      cachedLogoData = await toDataUrl(src);
      return cachedLogoData;
    } catch {
      /* try next */
    }
  }
  try {
    cachedLogoData = await toDataUrl(fallbackLogo);
    return cachedLogoData;
  } catch {
    cachedLogoData = null;
    return null;
  }
}

export async function generateSikasPdf({
  title,
  subtitle,
  rows,
  sections,
  table,
  filename,
}) {
  const doc = new jsPDF({ format: "a4", unit: "mm", orientation: "portrait" });

  const logo = await resolveLogoData();
  if (logo) {
    const maxW = 32;
    const maxH = 22;
    let w = maxW;
    let h = maxW / logo.aspect;
    if (h > maxH) {
      h = maxH;
      w = maxH * logo.aspect;
    }
    doc.addImage(logo.dataUrl, "PNG", PAGE.w - MARGIN - w, MARGIN - 4, w, h);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text("PLN INDONESIA POWER · UBP PRIOK", MARGIN, MARGIN);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("SAKTI - Sistem Aplikasi Keuangan Terintegrasi", MARGIN, MARGIN + 4);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20);
  doc.text(title, PAGE.w / 2, MARGIN + 22, { align: "center" });

  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(90);
    doc.text(subtitle, PAGE.w / 2, MARGIN + 28, { align: "center" });
  }

  doc.setDrawColor(200);
  doc.line(MARGIN, MARGIN + 34, PAGE.w - MARGIN, MARGIN + 34);

  let y = MARGIN + 42;

  const drawRow = (label, value) => {
    if (y > PAGE.h - 60) {
      doc.addPage();
      y = MARGIN;
    }
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120);
    doc.text(String(label).toUpperCase(), MARGIN, y);
    doc.setFontSize(10.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20);
    const text = value == null || value === "" ? "-" : String(value);
    const wrapped = doc.splitTextToSize(text, PAGE.w - MARGIN * 2 - 60);
    doc.text(wrapped, MARGIN + 60, y);
    y += Math.max(7, wrapped.length * 5 + 2);
  };

  const drawSectionHeader = (label) => {
    if (y > PAGE.h - 60) {
      doc.addPage();
      y = MARGIN;
    }
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(14, 76, 146);
    doc.text(String(label).toUpperCase(), MARGIN, y);
    doc.setDrawColor(220);
    doc.line(MARGIN, y + 1.5, PAGE.w - MARGIN, y + 1.5);
    y += 8;
  };

  if (sections && sections.length) {
    for (const section of sections) {
      drawSectionHeader(section.label);
      for (const [label, value] of section.items) {
        if (value == null || value === "") continue;
        drawRow(label, Array.isArray(value) ? value.join(", ") : value);
      }
      y += 3;
    }
  } else if (rows && rows.length) {
    for (const [label, value] of rows) {
      if (value == null || value === "") continue;
      drawRow(label, Array.isArray(value) ? value.join(", ") : value);
    }
  }

  if (table && table.length) {
    if (y > PAGE.h - 100) {
      doc.addPage();
      y = MARGIN;
    }
    y += 4;
    drawSectionHeader("Rincian Item");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(120);
    const cols = ["Uraian", "Qty", "Harga Satuan", "Total Pengajuan", "Total Evaluasi"];
    const xs = [MARGIN, 100, 118, 145, 172];
    cols.forEach((c, i) => doc.text(c, xs[i], y));
    y += 4;
    doc.setDrawColor(220);
    doc.line(MARGIN, y, PAGE.w - MARGIN, y);
    y += 3;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20);
    doc.setFontSize(8.5);
    for (const item of table) {
      if (y > PAGE.h - 60) {
        doc.addPage();
        y = MARGIN;
      }
      const uraian = doc.splitTextToSize(String(item.uraian || "-"), 75);
      doc.text(uraian, xs[0], y);
      doc.text(String(item.qty || 0), xs[1], y);
      doc.text(rupiah(item.hargaSatuan || 0), xs[2], y);
      doc.text(rupiah(item.totalPengajuan || 0), xs[3], y);
      doc.text(rupiah(item.totalEvaluasi || 0), xs[4], y);
      y += Math.max(5, uraian.length * 4);
    }
    y += 4;
  }

  const sigY = Math.max(y + 20, PAGE.h - 55);
  const boxW = (PAGE.w - MARGIN * 2 - 20) / 2;

  doc.setDrawColor(180);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);

  const today = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  doc.text(`Jakarta, ${today}`, PAGE.w - MARGIN, sigY - 6, { align: "right" });

  const drawSignatureBlock = (x, label) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50);
    doc.setFontSize(9.5);
    doc.text(label, x, sigY);
    doc.setFont("helvetica", "normal");
    doc.setDrawColor(180);
    doc.line(x, sigY + 24, x + boxW, sigY + 24);
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text("Nama    :", x, sigY + 30);
    doc.text("Jabatan :", x, sigY + 36);
  };

  drawSignatureBlock(MARGIN, "Menyetujui,");
  drawSignatureBlock(MARGIN + boxW + 20, "Mengetahui,");

  doc.setFontSize(7.5);
  doc.setTextColor(140);
  doc.text(
    `Dicetak: ${new Date().toLocaleString("id-ID")} - SAKTI`,
    MARGIN,
    PAGE.h - 8
  );

  doc.save(`${filename}.pdf`);
}

// PDF khusus RAB, layoutnya niru Template_RAB.docx: header ID/Tanggal RAB +
// judul kegiatan, tabel item dengan kolom Usulan & Evaluasi bersebelahan,
// baris ringkasan Jumlah/PPN/Jumlah+PPN per sisi, lalu TTD Menyetujui & Dibuat Oleh.
export async function generateRabPdf({
  idNumber, tanggalRab, judulKegiatan, items = [],
  jumlahPengajuan, ppnPengajuan, totalPengajuan,
  jumlahEvaluasi, ppnEvaluasi, totalEvaluasi,
  sigLeft, sigRight, filename,
}) {
  const doc = new jsPDF({ format: "a4", unit: "mm", orientation: "landscape" });
  const pw = 297, ph = 210, m = 14;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(20);
  doc.text("RENCANA ANGGARAN BIAYA", pw / 2, m + 4, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(90);
  doc.text(judulKegiatan || "-", pw / 2, m + 11, { align: "center" });
  doc.setDrawColor(200);
  doc.line(m, m + 16, pw - m, m + 16);

  let y = m + 24;
  doc.setFontSize(9);
  doc.setTextColor(60);
  doc.setFont("helvetica", "bold");
  doc.text("ID Number:", m, y);
  doc.setFont("helvetica", "normal");
  doc.text(String(idNumber || "-"), m + 24, y);
  doc.setFont("helvetica", "bold");
  doc.text("Tanggal RAB:", m + 90, y);
  doc.setFont("helvetica", "normal");
  doc.text(String(tanggalRab || "-"), m + 118, y);
  y += 8;

  // --- Tabel header (2 baris seperti template: grup Usulan/Evaluasi, lalu sub-kolom)
  const colUraian = m, wUraian = 60;
  const colSatuan = colUraian + wUraian, wSatuan = 18;
  const wQty = 18, wHarga = 32, wJumlah = 32;
  const colUQty = colSatuan + wSatuan;
  const colUHarga = colUQty + wQty;
  const colUJumlah = colUHarga + wHarga;
  const colEQty = colUJumlah + wJumlah;
  const colEHarga = colEQty + wQty;
  const colEJumlah = colEHarga + wHarga;
  const tableRight = colEJumlah + wJumlah;
  const rowH = 7;

  const drawTableHeader = () => {
    doc.setFillColor(230, 236, 245);
    doc.rect(m, y, tableRight - m, rowH * 2, "F");
    doc.setDrawColor(180);
    doc.rect(m, y, tableRight - m, rowH * 2);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30);
    doc.text("URAIAN", colUraian + 2, y + rowH + 4.5);
    doc.text("SATUAN", colSatuan + 2, y + rowH + 4.5);
    doc.text("USULAN", colUQty + (wQty + wHarga + wJumlah) / 2, y + 4.5, { align: "center" });
    doc.text("EVALUASI", colEQty + (wQty + wHarga + wJumlah) / 2, y + 4.5, { align: "center" });
    doc.text("Qty.", colUQty + wQty / 2, y + rowH + 4.5, { align: "center" });
    doc.text("Harga Satuan", colUHarga + wHarga / 2, y + rowH + 4.5, { align: "center" });
    doc.text("Jumlah", colUJumlah + wJumlah / 2, y + rowH + 4.5, { align: "center" });
    doc.text("Qty.", colEQty + wQty / 2, y + rowH + 4.5, { align: "center" });
    doc.text("Harga Satuan", colEHarga + wHarga / 2, y + rowH + 4.5, { align: "center" });
    doc.text("Jumlah", colEJumlah + wJumlah / 2, y + rowH + 4.5, { align: "center" });
    [colSatuan, colUQty, colUHarga, colUJumlah, colEQty, colEHarga, colEJumlah].forEach((x) => doc.line(x, y, x, y + rowH * 2));
    doc.line(m, y + rowH, tableRight, y + rowH);
    y += rowH * 2;
  };
  drawTableHeader();

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(30);
  for (const it of items) {
    if (y > ph - 55) { doc.addPage("a4", "landscape"); y = m; drawTableHeader(); }
    const uraianLines = doc.splitTextToSize(String(it.uraian || "-"), wUraian - 4);
    const lineH = Math.max(rowH, uraianLines.length * 3.6 + 2);
    doc.setDrawColor(210);
    doc.rect(m, y, tableRight - m, lineH);
    [colSatuan, colUQty, colUHarga, colUJumlah, colEQty, colEHarga, colEJumlah].forEach((x) => doc.line(x, y, x, y + lineH));
    doc.text(uraianLines, colUraian + 2, y + 4.5);
    doc.text(String(it.satuan || "-"), colSatuan + 2, y + 4.5);
    doc.text(String(it.qty || "-"), colUQty + wQty / 2, y + 4.5, { align: "center" });
    doc.text(rupiah(it.hargaSatuan || 0), colUHarga + wHarga - 2, y + 4.5, { align: "right" });
    doc.text(rupiah(it.basePengajuan || 0), colUJumlah + wJumlah - 2, y + 4.5, { align: "right" });
    doc.text(String(it.qtyEvaluasi || "-"), colEQty + wQty / 2, y + 4.5, { align: "center" });
    doc.text(rupiah(it.hargaSatuanEvaluasi || 0), colEHarga + wHarga - 2, y + 4.5, { align: "right" });
    doc.text(rupiah(it.baseEvaluasi || 0), colEJumlah + wJumlah - 2, y + 4.5, { align: "right" });
    y += lineH;
  }

  // --- Baris ringkasan: Jumlah / PPN / Jumlah + PPN, per sisi Usulan & Evaluasi
  const summaryRow = (label, valPengajuan, valEvaluasi, bold) => {
    if (y > ph - 45) { doc.addPage("a4", "landscape"); y = m; drawTableHeader(); }
    doc.setDrawColor(210);
    doc.rect(m, y, tableRight - m, rowH);
    [colSatuan, colUQty, colUHarga, colUJumlah, colEQty, colEHarga, colEJumlah].forEach((x) => doc.line(x, y, x, y + rowH));
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(8);
    doc.text(label, colUHarga + wHarga / 2, y + 4.7, { align: "center" });
    doc.text(rupiah(valPengajuan || 0), colUJumlah + wJumlah - 2, y + 4.7, { align: "right" });
    doc.text(label, colEHarga + wHarga / 2, y + 4.7, { align: "center" });
    doc.text(rupiah(valEvaluasi || 0), colEJumlah + wJumlah - 2, y + 4.7, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    y += rowH;
  };
  summaryRow("Jumlah", jumlahPengajuan, jumlahEvaluasi, false);
  summaryRow("PPN", ppnPengajuan, ppnEvaluasi, false);
  summaryRow("Jumlah + PPN", totalPengajuan, totalEvaluasi, true);

  // --- TTD: Menyetujui (kiri, MADM) / Dibuat Oleh (kanan, ASMAN KAS) — susunan
  // persis Template_RAB.docx: label besar, spasi tanda tangan, jabatan, nama.
  // Gak ada garis tanda tangan di template aslinya, jadi di sini juga gak digambar.
  const sigY = Math.max(y + 24, ph - 42);
  const boxW = (pw - m * 2 - 20) / 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(20);
  doc.text("Menyetujui,", m, sigY);
  doc.text("Dibuat Oleh,", m + boxW + 20, sigY);
  doc.setFontSize(9);
  doc.text(sigLeft?.role || "-", m, sigY + 24);
  doc.text(sigRight?.role || "-", m + boxW + 20, sigY + 24);
  doc.text(sigLeft?.nama || "-", m, sigY + 29);
  doc.text(sigRight?.nama || "-", m + boxW + 20, sigY + 29);

  doc.setFontSize(7);
  doc.setTextColor(140);
  doc.text(`Dicetak: ${new Date().toLocaleString("id-ID")} - SAKTI`, m, ph - 8);

  doc.save(`${filename}.pdf`);
}

export function rowsFromFields(fields, values) {
  return fields
    .filter((f) => values[f.key] != null && values[f.key] !== "")
    .map((f) => [f.label, values[f.key]]);
}

const EVAL_NILAI_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3];

// PDF Lembar Evaluasi Bantuan TJSL — layoutnya niru persis Template_Form_Eval.xlsx:
// 12 kolom nilai (0.25 s.d. 3) dikelompokkan 3 grup header (Tidak Signifikan /
// Netral / Signifikan) x 4 kolom masing-masing, tiap kategori 2 baris (baris 1:
// deskripsi anchor tiap grup + kolom N/Bobot/Total Skor, baris 2: baris kosong
// tempat tanda "x" ditaruh persis di kolom nilai yang dipilih), lalu skor akhir,
// keputusan, catatan, dan 3 kolom tanda tangan di bagian bawah — sama seperti
// susunan sheet "Form Eval New" di file Excel aslinya.
export async function generateEvaluasiPdf({
  id, pemohon, perihal, penilai, tanggal,
  perKategori, skorAkhir, keputusan, catatan, filename,
}) {
  const doc = new jsPDF({ format: "a4", unit: "mm", orientation: "landscape" });
  const pw = 297, ph = 210, m = 10;

  const logo = await resolveLogoData();
  if (logo) {
    const maxW = 20, maxH = 12;
    let w = maxW, h = maxW / logo.aspect;
    if (h > maxH) { h = maxH; w = maxH * logo.aspect; }
    doc.addImage(logo.dataUrl, "PNG", m, m - 2, w, h);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12.5);
  doc.setTextColor(20);
  doc.text("LEMBAR EVALUASI BANTUAN TJSL", pw / 2, m + 3, { align: "center" });
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text(`ID Pengajuan: ${id || "-"}`, pw / 2, m + 8, { align: "center" });

  let y = m + 14;
  doc.setFontSize(8);
  const infoRow = (label, value, x) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40);
    doc.text(label, x, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20);
    doc.text(String(value || "-"), x + 22, y, { maxWidth: 110 });
  };
  infoRow("PEMOHON", pemohon, m);
  infoRow("PENILAI", penilai, pw / 2 + 10);
  y += 4.5;
  infoRow("PERIHAL", perihal, m);
  infoRow("TANGGAL", tanggal, pw / 2 + 10);
  y += 5.5;

  // --- Tabel penilaian, kolom persis susunan Excel ---
  const colNo = m, wNo = 7;
  const colKategori = colNo + wNo, wKategori = 42;
  const wGroup = 4 * 9.2; // 4 kolom nilai per grup signifikansi
  const colTS = colKategori + wKategori;      // Tidak Signifikan
  const colNetral = colTS + wGroup;
  const colSig = colNetral + wGroup;
  const colN = colSig + wGroup, wN = 8;
  const colBobot = colN + wN, wBobot = 10;
  const colTotal = colBobot + wBobot, wTotal = 14;
  const tableRight = colTotal + wTotal;
  const wNilai = wGroup / 4;
  const headH = 4.6, descH = 9.2, tickH = 3.2;

  const groupCols = [colTS, colNetral, colSig];
  const groupLabels = ["TIDAK SIGNIFIKAN", "NETRAL", "SIGNIFIKAN"];
  const anchorKeys = ["tidakSignifikan", "netral", "signifikan"];

  const drawHeader = () => {
    doc.setFillColor(224, 231, 242);
    doc.rect(m, y, tableRight - m, headH * 2, "F");
    doc.setDrawColor(170);
    doc.setFontSize(6.3);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30);
    doc.text("NO", colNo + wNo / 2, y + headH + 3.2, { align: "center" });
    doc.text("KATEGORI PENILAIAN", colKategori + 2, y + headH + 3.2);
    groupCols.forEach((gx, gi) => {
      doc.text(groupLabels[gi], gx + wGroup / 2, y + 3.2, { align: "center" });
      for (let c = 0; c < 4; c++) {
        const val = EVAL_NILAI_OPTIONS[gi * 4 + c];
        doc.text(String(val), gx + c * wNilai + wNilai / 2, y + headH + 3.2, { align: "center" });
      }
    });
    doc.text("N", colN + wN / 2, y + headH + 3.2, { align: "center" });
    doc.text("BOBOT", colBobot + wBobot / 2, y + headH + 3.2, { align: "center" });
    doc.text("TOTAL SKOR", colTotal + wTotal / 2, y + 3.2, { align: "center" });
    doc.setFontSize(5);
    doc.setFont("helvetica", "normal");
    doc.text("(NILAIxBOBOT)/3", colTotal + wTotal / 2, y + headH + 3.2, { align: "center" });

    doc.rect(m, y, tableRight - m, headH * 2);
    doc.line(colKategori, y, colKategori, y + headH * 2);
    doc.line(colN, y, colN, y + headH * 2);
    doc.line(colBobot, y, colBobot, y + headH * 2);
    doc.line(colTotal, y, colTotal, y + headH * 2);
    groupCols.forEach((gx) => {
      doc.line(gx, y, gx, y + headH * 2);
      for (let c = 1; c < 4; c++) doc.line(gx + c * wNilai, y + headH, gx + c * wNilai, y + headH * 2);
    });
    doc.line(m, y + headH, colKategori, y + headH);
    y += headH * 2;
  };
  drawHeader();

  doc.setFont("helvetica", "normal");
  (perKategori || []).forEach((k, i) => {
    const rowH = descH + tickH;
    if (y + rowH > ph - 40) { doc.addPage("a4", "landscape"); y = m; drawHeader(); }

    const rowTop = y;
    doc.setDrawColor(190);
    // Baris deskripsi (anchor teks tiap grup) — digabung 4 kolom per grup
    doc.rect(colNo, rowTop, tableRight - colNo, descH);
    doc.line(colKategori, rowTop, colKategori, rowTop + descH);
    groupCols.forEach((gx) => doc.line(gx, rowTop, gx, rowTop + descH));
    doc.line(colN, rowTop, colN, rowTop + descH);
    doc.line(colBobot, rowTop, colBobot, rowTop + descH);
    doc.line(colTotal, rowTop, colTotal, rowTop + descH);

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30);
    doc.text(String(i + 1), colNo + wNo / 2, rowTop + 5, { align: "center" });
    const labelLines = doc.splitTextToSize(k.label, wKategori - 3);
    doc.text(labelLines.slice(0, 4), colKategori + 1.5, rowTop + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.6);
    doc.setTextColor(60);
    anchorKeys.forEach((ak, gi) => {
      const gx = groupCols[gi];
      const text = k.anchors?.[ak] || "";
      const lines = doc.splitTextToSize(text, wGroup - 3);
      doc.text(lines.slice(0, 6), gx + wGroup / 2, rowTop + 4.5, { align: "center" });
    });

    doc.setFontSize(7);
    doc.setTextColor(30);
    doc.text(k.nilai ? String(k.nilai) : "0", colN + wN / 2, rowTop + descH / 2 + 1.5, { align: "center" });
    doc.text(String(k.bobot), colBobot + wBobot / 2, rowTop + descH / 2 + 1.5, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.text(k.nilai ? k.totalSkor.toFixed(2) : "0", colTotal + wTotal / 2, rowTop + descH / 2 + 1.5, { align: "center" });
    doc.setFont("helvetica", "normal");

    // Baris tanda "x" — kotak kosong di semua 12 kolom nilai, kecuali kolom yang
    // dipilih user, sama seperti checkbox grid di Excel.
    const tickTop = rowTop + descH;
    doc.rect(colNo, tickTop, tableRight - colNo, tickH);
    doc.line(colKategori, tickTop, colKategori, tickTop + tickH);
    groupCols.forEach((gx) => {
      doc.line(gx, tickTop, gx, tickTop + tickH);
      for (let c = 1; c < 4; c++) doc.line(gx + c * wNilai, tickTop, gx + c * wNilai, tickTop + tickH);
    });
    doc.line(colN, tickTop, colN, tickTop + tickH);
    doc.line(colBobot, tickTop, colBobot, tickTop + tickH);
    doc.line(colTotal, tickTop, colTotal, tickTop + tickH);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    groupCols.forEach((gx, gi) => {
      for (let c = 0; c < 4; c++) {
        const val = EVAL_NILAI_OPTIONS[gi * 4 + c];
        if (k.nilai === val) {
          doc.text("x", gx + c * wNilai + wNilai / 2, tickTop + tickH - 1, { align: "center" });
        }
      }
    });
    doc.setFont("helvetica", "normal");

    y = tickTop + tickH;
  });

  // --- Skor Akhir (baris terakhir tabel, sama seperti Excel) ---
  if (y + 6 > ph - 40) { doc.addPage("a4", "landscape"); y = m; }
  doc.setDrawColor(170);
  doc.setFillColor(240, 242, 247);
  doc.rect(m, y, tableRight - m, 6, "F");
  doc.rect(m, y, tableRight - m, 6);
  doc.line(colBobot, y, colBobot, y + 6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(20);
  doc.text("Skor Akhir", colSig + wGroup - 4, y + 4.2, { align: "right" });
  doc.text((skorAkhir || 0).toFixed(2), colTotal + wTotal / 2, y + 4.2, { align: "center" });
  y += 10;

  // --- Keterangan ambang skor (sama seperti footnote di Excel) ---
  doc.setFont("helvetica", "italic");
  doc.setFontSize(6.5);
  doc.setTextColor(90);
  doc.text(
    "ket : 0 - 50 = tidak direkomendasikan, 51 - 75 = Cukup untuk direkomendasikan dengan pertimbangan, 76 - 100 = Direkomendasikan",
    m, y
  );
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(20);
  doc.text(`Keputusan: ${keputusan || "-"}`, m, y);
  y += 7;

  if (catatan) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(40);
    doc.text("Catatan Penting / Rekomendasi:", m, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(30);
    const wrapped = doc.splitTextToSize(catatan, pw - m * 2);
    doc.text(wrapped, m, y);
    y += wrapped.length * 4 + 4;
  }

  // --- Kolom tanda tangan 3 kolom, sama seperti Excel: Dievaluasi Oleh /
  // Diperiksa/verifikasi oleh / Diputuskan oleh — dengan role & nama baku. ---
  const sigY = Math.max(y + 8, ph - 40);
  const colW = (pw - m * 2) / 3;
  const sigCols = [
    { label: "Dievaluasi Oleh :", role: "Officer Community Development", nama: "Wahyu Andrias" },
    { label: "Diperiksa/verifikasi oleh:", role: "Assistant Manager KAS", nama: "Astri Oktavina" },
    { label: "Diputuskan oleh:", role: "Administration Manager", nama: "Donny Ureansyah" },
  ];
  sigCols.forEach((c, i) => {
    const x = m + i * colW;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(30);
    doc.text(c.label, x, sigY);
    doc.setDrawColor(180);
    doc.line(x, sigY + 16, x + colW - 8, sigY + 16);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(c.role, x, sigY + 20);
    doc.setFont("helvetica", "bold");
    doc.text(c.nama, x, sigY + 24);
    doc.setFont("helvetica", "normal");
  });

  doc.setFontSize(6.5);
  doc.setTextColor(150);
  doc.text(`Dicetak: ${new Date().toLocaleString("id-ID")} - SAKTI`, pw - m, ph - 4, { align: "right" });

  doc.save(`${filename}.pdf`);
}