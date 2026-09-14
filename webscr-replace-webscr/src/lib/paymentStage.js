/**
 * Tahap pembayaran terpusat.
 *
 * RAB overview masih boleh memakai approval digital RAB (TTD Asman/MADM).
 * Halaman operasional/tracking NON PO, PO, dan Cash Card memanggil helper ini
 * dengan `paymentTrackingOnly: true`, sehingga tahap pembayaran TIDAK menunggu
 * TTD digital RAB. Setelah dokumen pembayaran lengkap, proses akhir dibaca dari
 * Tracking Dokumen Selesai: Officer Comdev -> Asman -> Akutansi -> Keuangan -> Scan.
 */

function recordTime(record) {
  if (!record) return null;
  return (
    record.createdAt ||
    record.tanggalInput ||
    record.savedAt ||
    record.generatedAt ||
    record.updatedAt ||
    null
  );
}

function findPaymentRecord(r, { nonPoList = [], ccList = [], poDocuments = {} }) {
  if (r.kategori === "Cash Card") {
    return ccList.find((c) => c.rabId === r.idNumber) || null;
  }
  if (r.kategori === "PO") {
    const master = nonPoList.find(
      (n) => n.rabId === r.idNumber && (!n.kategori || n.kategori === "PO")
    ) || null;
    const erp = poDocuments[r.idNumber] || null;
    const hasErp = !!(erp && (erp.nomorPR || erp.nomorPO || erp.idBast || erp.idBapb));
    if (!master && !hasErp) return null;
    return { ...(master || {}), ...(erp || {}), _masterId: master?.id || null, _masterCreatedAt: master?.createdAt || null };
  }
  return nonPoList.find((n) => n.rabId === r.idNumber) || null;
}

function matchesRab(record, rabId, idKey = "id") {
  return (record?.[idKey] || record?.submissionId || record?.id) === rabId;
}

function matchedRecord(list, rabId, idKey = "id") {
  return (list || []).find((d) => matchesRab(d, rabId, idKey)) || null;
}

function nonPoDocProgress(rabId, { lmp1 = [], lmp2 = [], formVerif = [], bast = [], pakta = [], bapp = [] }) {
  const defs = [
    ["LMP1", matchedRecord(lmp1, rabId, "submissionId")],
    ["LMP2", matchedRecord(lmp2, rabId, "submissionId")],
    ["Verif", matchedRecord(formVerif, rabId, "submissionId")],
    ["BAST", matchedRecord(bast, rabId, "id")],
    ["PI", matchedRecord(pakta, rabId, "id")],
    ["BAPP", matchedRecord(bapp, rabId, "id")],
  ];
  const items = defs.map(([key, rec]) => ({ key, done: !!rec, at: recordTime(rec) }));
  return { items, complete: items.every((i) => i.done) };
}

function ccRecord(list, ccId) {
  return (list || []).find((d) => d?.id === ccId || d?.ccId === ccId) || null;
}

function itemTimestamp(items) {
  const candidates = (items || [])
    .map((d) => recordTime(d))
    .filter(Boolean)
    .map((value) => ({ value, time: new Date(value).getTime() }))
    .filter((x) => !Number.isNaN(x.time))
    .sort((a, b) => a.time - b.time);
  return candidates[0]?.value || null;
}

function ccDocProgress(ccId, {
  ccItems = [], ccVerifikasi = [], ccPermintaan = [], ccRencana = [],
  ccBast = [], ccPakta = [], ccTtd = [], ccBapp = [], ccPertanggungjawaban = [],
}) {
  const itemRows = (ccItems || []).filter((d) => d?.ccId === ccId);
  const defs = [
    { key: "Detail/Item", rec: itemRows[0] || null, at: itemTimestamp(itemRows) },
    { key: "Verifikasi", rec: ccRecord(ccVerifikasi, ccId) },
    { key: "Permintaan Dana", rec: ccRecord(ccPermintaan, ccId) },
    { key: "Rencana Tunai", rec: ccRecord(ccRencana, ccId) },
    { key: "BAST", rec: ccRecord(ccBast, ccId) },
    { key: "PI", rec: ccRecord(ccPakta, ccId) },
    { key: "TTD Serah Terima", rec: ccRecord(ccTtd, ccId) },
    { key: "BAPP", rec: ccRecord(ccBapp, ccId) },
    { key: "Pertanggungjawaban", rec: ccRecord(ccPertanggungjawaban, ccId) },
  ];
  const items = defs.map(({ key, rec, at }) => ({ key, done: !!rec, at: at || recordTime(rec) }));
  return { items, complete: items.every((i) => i.done) };
}

function poDocProgress(rec) {
  if (!rec) return { items: [], complete: false, nextLabel: "Menunggu Nomor PR" };
  const items = [
    { key: "Nomor PR", done: !!rec.nomorPR, at: rec.nomorPRAt || null },
    { key: "Nomor PO", done: !!rec.nomorPO, at: rec.nomorPOAt || null },
    { key: "BAST ERP", done: !!rec.idBast, at: rec.idBastAt || null },
    { key: "BAPB ERP", done: !!rec.idBapb, at: rec.idBapbAt || null },
  ];
  let nextLabel = null;
  if (!rec.nomorPR) nextLabel = "Menunggu Nomor PR";
  else if (!rec.nomorPO) nextLabel = "Menunggu Nomor PO";
  else if (!rec.idBast || !rec.idBapb) nextLabel = "Menunggu BAST/BAPB";
  return { items, complete: items.every((i) => i.done), nextLabel };
}

function finalTrackingStage(pkg, progress, paymentId) {
  if (!pkg?.ttdOfficerComdev) {
    return { label: "Menunggu TTD Officer Comdev", docProgress: progress.items, paymentId };
  }
  if (!pkg?.ttdAsman) {
    return { label: "Menunggu TTD Asman Dokumen", docProgress: progress.items, paymentId };
  }
  if (!pkg?.diAkutansi) {
    return { label: "Menunggu Akutansi", docProgress: progress.items, paymentId };
  }
  if (!pkg?.diKeuangan) {
    return { label: "Menunggu Keuangan", docProgress: progress.items, paymentId };
  }
  if (!pkg?.scanUrl) {
    return { label: "Menunggu Scan Dokumen", docProgress: progress.items, paymentId };
  }
  return { label: "Selesai", docProgress: progress.items, paymentId };
}

/**
 * Hasil: { label, docProgress, paymentId }
 *
 * `paymentTrackingOnly: true` dipakai di NON PO/PO/CC. Mode ini sengaja tidak
 * membaca signature RAB Asman/MADM karena tracking pembayaran dimulai dari
 * master pembayaran dan aktivitas dokumennya.
 */
export function getPaymentStage(r, data = {}) {
  const {
    nonPoList = [], ccList = [], poDocuments = {},
    lmp1 = [], lmp2 = [], formVerif = [], bast = [], pakta = [], bapp = [],
    ccItems = [], ccVerifikasi = [], ccPermintaan = [], ccRencana = [],
    ccBast = [], ccPakta = [], ccTtd = [], ccBapp = [], ccPertanggungjawaban = [],
    paymentPackages = [], paymentTrackingOnly = false,
  } = data;

  // Hanya overview RAB yang mempertahankan tahap approval digital RAB.
  if (!paymentTrackingOnly) {
    if (!r.signatureAsman) {
      return { label: "Menunggu TTD Asman", docProgress: [], paymentId: null };
    }
    if (!r.signatureMadm) {
      return { label: "Menunggu TTD MADM", docProgress: [], paymentId: null };
    }
  }

  const kategori = r.kategori === "Cash Card" ? "Cash Card" : r.kategori === "PO" ? "PO" : "NON PO";
  const record = findPaymentRecord(r, { nonPoList, ccList, poDocuments });

  if (!record) {
    return { label: `Siap Dibuat ${kategori}`, docProgress: [], paymentId: null };
  }

  const paymentId = kategori === "PO"
    ? (record.nomorPO || record.nomorPR || record._masterId || record.id || null)
    : record.id;

  let progress;
  if (kategori === "Cash Card") {
    progress = ccDocProgress(record.id, {
      ccItems, ccVerifikasi, ccPermintaan, ccRencana, ccBast, ccPakta,
      ccTtd, ccBapp, ccPertanggungjawaban,
    });
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

  const pkg = paymentPackages.find((p) => p.idRab === r.idNumber);
  return finalTrackingStage(pkg, progress, paymentId);
}
