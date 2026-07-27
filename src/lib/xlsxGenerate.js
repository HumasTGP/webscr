import ExcelJS from "exceljs/dist/exceljs.min.js";
import { saveAs } from "file-saver";
import { EVALUASI_NILAI_OPTIONS, evaluasiKategoriFields } from "./wizardFields";

const KATEGORI = evaluasiKategoriFields();

const CATEGORY_ROWS = [13, 15, 17, 19, 21, 23, 25, 27, 29];
const NILAI_COLUMNS = ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O"];

const SHEET_NAME = "Form Eval New";

export async function loadEvaluasiTemplate(templateUrl) {
  const res = await fetch(templateUrl);
  if (!res.ok) throw new Error(`Gagal memuat template: ${templateUrl}`);
  const buffer = await res.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  return workbook;
}

export async function generateEvaluasiXlsx({
  templateUrl = "/templates/Template_Form_Eval.xlsx",
  id,
  pemohon,
  perihal,
  penilai,
  tanggal,
  nilaiMap = {},
  catatan,
  outputName,
}) {
  const workbook = await loadEvaluasiTemplate(templateUrl);
  const sheet = workbook.getWorksheet(SHEET_NAME);
  if (!sheet) {
    throw new Error(`Sheet "${SHEET_NAME}" tidak ditemukan di template.`);
  }

  sheet.getCell("I6").value = id || "";
  sheet.getCell("C7").value = pemohon || "";
  sheet.getCell("C8").value = perihal || "";
  sheet.getCell("Q7").value = penilai || "";
  if (tanggal) {
    sheet.getCell("Q8").value = new Date(`${tanggal}T00:00:00`);
  }

  CATEGORY_ROWS.forEach((row, catIdx) => {
    const chosen = nilaiMap[KATEGORI[catIdx].key];
    NILAI_COLUMNS.forEach((col, colIdx) => {
      const isChosen = chosen === EVALUASI_NILAI_OPTIONS[colIdx];
      sheet.getCell(`${col}${row}`).value = isChosen ? "x" : "";
    });
  });

  sheet.getCell("B33").value = `Catatan Penting / Rekomendasi : ${catatan || ""}`;

  const outBuffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([outBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, outputName || `Form-Evaluasi-${id || "draft"}.xlsx`);
}
