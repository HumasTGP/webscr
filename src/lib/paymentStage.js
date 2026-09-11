/**
 * lib/paymentStage.js
 *
 * getPaymentStage() - helper TERPUSAT untuk menghitung "Tahap Saat Ini" sebuah
 * RAB, dari mulai dibuat sampai selesai dibayar. SEMUA nilai dihitung dari
 * data yang sudah ada (signature RAB, master pembayaran per kategori, status
 * dokumen turunan, checkbox Akutansi/Keuangan, scan) - TIDAK ADA input manual
 * baru, tidak ada dropdown status yang bisa diubah user secara langsung.
 *
 * Alur umum (poin 3 di requirement):
 *  1. RAB Dibuat
 *  2. Menunggu TTD Asman
 *  3. Menunggu TTD MADM
 *  4. RAB Disetujui
 *  5. Siap Diproses sesuai kategori (Siap Dibuat NON PO/PO/Cash Card)
 *  6. Master pembayaran sudah dibuat (Dokumen Diproses)
 *  7. Dokumen Lengkap
 *  8. Sudah di Akutansi
 *  9. Sudah di Keuangan
 * 10. Menunggu Scan Dokumen
 * 11. Selesai
 *
 * PO tidak dipaksa sama dengan NON PO - pakai milestone ERP existing sendiri
 * (Nomor PR -> Nomor PO -> BAST/BAPB), sesuai requirement bagian 6.
 */

/** Cari master pembayaran (Non PO/PO/CC) yang terhubung ke RAB `r`. */
function findPaymentRecord(r, { nonPoList = [], ccList = [], poDocuments = {} }) {
  if (r.kategori === "Cash Card") {
    return ccList.find((c) => c.rabId === r.idNumber) || null;
  }
  if (r.kategori === "PO") {
    // Master PO dibuat dari submissions (NonPoPage kategori PO), sedangkan
    // milestone ERP disimpan terpisah di poDocuments. Gabungkan keduanya agar
    // setelah master PO dibuat tahap langsung menjadi "Menunggu Nomor PR",
    // bukan kembali dianggap "Siap Dibuat PO".
    const master = nonPoList.find((n) => n.rabId === r.idNumber && (!n.kategori || n.kategori === "PO")) || null;
    const erp = poDocuments[r.idNumber] || null;
    const hasErp = !!(erp && (erp.nomorPR || erp.nomorPO || erp.idBast || erp.idBapb));
    if (!master && !hasErp) return null;
    return { ...(master || {}), ...(erp || {}), _masterId: master?.id || null };
  }
  return nonPoList.find((n) => n.rabId === r.idNumber) || null;
}

/** Cocokkan satu record dengan rabId - fallback berantai persis seperti
 * docStatus() di NonPoPage.jsx, karena LMP1/LMP2/Verif pakai key
 * submissionId sedangkan BAST/PI/BAPP pakai key id. */
function matchesRab(record, rabId, idKey = "id") {
  return (record[idKey] || record.submissionId || record.id) === rabId;
}

/** Progress dokumen turunan NON PO - dipetakan dari 6 dokumen existing. */
function nonPoDocProgress(rabId, { lmp1 = [], lmp2 = [], formVerif = [], bast = [], pakta = [], bapp = [] }) {
  const items = [
    { key: "LMP1", done: lmp1.some((d) => matchesRab(d, rabId, "submissionId")) },
    { key: "LMP2", done: lmp2.some((d) => matchesRab(d, rabId, "submissionId")) },
    { key: "Verif", done: formVerif.some((d) => matchesRab(d, rabId, "submissionId")) },
    { key: "BAST", done: bast.some((d) => matchesRab(d, rabId, "id")) },
    { key: "PI", done: pakta.some((d) => matchesRab(d, rabId, "id")) },
    { key: "BAPP", done: bapp.some((d) => matchesRab(d, rabId, "id")) },
  ];
  return { items, complete: items.every((i) => i.done) };
}

/** Progress dokumen turunan Cash Card - dipetakan dari 9 dokumen existing. */
function ccDocProgress(ccId, { ccItems = [], ccVerifikasi = [], ccPermintaan = [], ccRencana = [], ccBast = [], ccPakta = [], ccTtd = [], ccBapp = [], ccPertanggungjawaban = [] }) {
  const items = [
    { key: "Item", done: ccItems.some((d) => d.ccId === ccId) },
    { key: "Verifikasi", done: ccVerifikasi.some((d) => d.id === ccId) },
    { key: "Permintaan Dana", done: ccPermintaan.some((d) => d.id === ccId) },
    { key: "Rencana Tunai", done: ccRencana.some((d) => d.id === ccId) },
    { key: "BAST", done: ccBast.some((d) => d.id === ccId) },
    { key: "PI", done: ccPakta.some((d) => d.id === ccId) },
    { key: "TTD Serah Terima", done: ccTtd.some((d) => d.id === ccId || d.ccId === ccId) },
    { key: "BAPP", done: ccBapp.some((d) => d.id === ccId) },
    { key: "Pertanggungjawaban", done: ccPertanggungjawaban.some((d) => d.id === ccId) },
  ];
  return { items, complete: items.every((i) => i.done) };
}

/** Progress milestone PO - beda struktur, ikut data ERP existing sendiri. */
function poDocProgress(rec) {
  if (!rec) return { items: [], complete: false, nextLabel: "Menunggu Nomor PR" };
  const items = [
    { key: "Nomor PR", done: !!rec.nomorPR },
    { key: "Nomor PO", done: !!rec.nomorPO },
    { key: "BAST", done: !!rec.idBast },
    { key: "BAPB", done: !!rec.idBapb },
  ];
  let nextLabel = null;
  if (!rec.nomorPR) nextLabel = "Menunggu Nomor PR";
  else if (!rec.nomorPO) nextLabel = "Menunggu Nomor PO";
  else if (!rec.idBast || !rec.idBapb) nextLabel = "Menunggu BAST/BAPB";
  return { items, complete: items.every((i) => i.done), nextLabel };
}

/**
 * Hasil utama: { label, docProgress, paymentId }
 *   label       - teks Tahap Saat Ini yang ditampilkan
 *   docProgress - array {key, done} dokumen turunan (buat ditampilkan sebagai
 *                 checklist ✓/—, kosong untuk tahap sebelum master dibuat)
 *   paymentId   - ID master pembayaran kalau sudah ada, null kalau belum
 */
export function getPaymentStage(r, data) {
  const {
    nonPoList = [], ccList = [], poDocuments = {},
    lmp1 = [], lmp2 = [], formVerif = [], bast = [], pakta = [], bapp = [],
    ccItems = [], ccVerifikasi = [], ccPermintaan = [], ccRencana = [],
    ccBast = [], ccPakta = [], ccTtd = [], ccBapp = [], ccPertanggungjawaban = [],
    paymentPackages = [],
  } = data;

  // 1-4: tahap TTD RAB, sebelum ada master pembayaran sama sekali.
  if (!r.signatureAsman) {
    return { label: "Menunggu TTD Asman", docProgress: [], paymentId: null };
  }
  if (!r.signatureMadm) {
    return { label: "Menunggu TTD MADM", docProgress: [], paymentId: null };
  }

  const kategori = r.kategori === "Cash Card" ? "Cash Card" : r.kategori === "PO" ? "PO" : "NON PO";
  const record = findPaymentRecord(r, { nonPoList, ccList, poDocuments });

  // 5: TTD lengkap, tapi master pembayaran belum dibuat sama sekali.
  if (!record) {
    return { label: `Siap Dibuat ${kategori}`, docProgress: [], paymentId: null };
  }

  const paymentId = kategori === "PO"
    ? (record.nomorPO || record.nomorPR || record._masterId || record.id || null)
    : record.id;

  // 6-7: master sudah ada, cek kelengkapan dokumen turunan sesuai kategori.
  let progress;
  if (kategori === "Cash Card") {
    progress = ccDocProgress(record.id, { ccItems, ccVerifikasi, ccPermintaan, ccRencana, ccBast, ccPakta, ccTtd, ccBapp, ccPertanggungjawaban });
  } else if (kategori === "PO") {
    progress = poDocProgress(record);
  } else {
    progress = nonPoDocProgress(r.idNumber, { lmp1, lmp2, formVerif, bast, pakta, bapp });
  }

  if (!progress.complete) {
    return {
      label: kategori === "PO" ? progress.nextLabel : "Dokumen Diproses",
      docProgress: progress.items,
      paymentId,
    };
  }

  // 8-11: dokumen lengkap, lanjut baca Tracking Dokumen Selesai (checkbox
  // Akutansi/Keuangan + scan, semua sudah ada di paymentPackages).
  const pkg = paymentPackages.find((p) => p.idRab === r.idNumber);
  if (!pkg?.diAkutansi) {
    return { label: "Dokumen Lengkap", docProgress: progress.items, paymentId };
  }
  if (!pkg?.diKeuangan) {
    return { label: "Sudah di Akutansi", docProgress: progress.items, paymentId };
  }
  if (!pkg?.scanUrl) {
    return { label: "Menunggu Scan Dokumen", docProgress: progress.items, paymentId };
  }
  return { label: "Selesai", docProgress: progress.items, paymentId };
}
