import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import FileSaver from "file-saver";
const saveAs = FileSaver.saveAs || FileSaver;

export async function generateDocxFromTemplate(templateUrl, data, outputName) {
  const res = await fetch(templateUrl);
  if (!res.ok) {
    throw new Error(`Gagal memuat template: ${templateUrl}`);
  }
  const arrayBuffer = await res.arrayBuffer();

  const zip = new PizZip(arrayBuffer);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    nullGetter: () => "",
  });

  doc.render(data);

  const blob = doc.getZip().generate({
    type: "blob",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  saveAs(blob, outputName);
}

// Format tanggal "YYYY-MM-DD" (dari <input type="date">) jadi "16 April 2026".
export function formatTanggalPanjang(isoDate) {
  if (!isoDate) return "";
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}