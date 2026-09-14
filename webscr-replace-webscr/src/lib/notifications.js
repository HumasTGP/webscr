/**
 * lib/notifications.js
 *
 * Notifikasi TIDAK disimpan sebagai daftar statis - selalu DIHITUNG ULANG
 * dari data RAB & submission Non PO/CC yang ada, setiap kali komponen render.
 * Ini supaya notifikasi selalu akurat mengikuti data terkini, tanpa perlu
 * sinkronisasi manual antara "notifikasi" dan "RAB yang sebenarnya".
 *
 * Tiga jenis notifikasi:
 *  1. "sign"   - RAB menunggu tanda tangan user yang login (Asman/MADM,
 *                sesuai giliran masing-masing)
 *  2. "payment"- RAB sudah TTD lengkap (Asman+MADM), tapi BELUM ada entry
 *                pembayaran (Non PO/CC) untuk RAB itu. Ditujukan ke Humas,
 *                Asman, DAN MADM sekaligus.
 *  3. "signed" - riwayat: RAB yang barusan selesai TTD lengkap (informasi,
 *                bukan tugas) - cuma muncul di halaman riwayat, tidak di pop-up
 */

/** RAB mana saja yang menunggu tanda tangan `role` yang sedang login. */
function pendingSignRab(rab, role) {
  if (role === "asman") {
    return rab.filter((r) => !r.signatureAsman);
  }
  if (role === "madm") {
    return rab.filter((r) => r.signatureAsman && !r.signatureMadm);
  }
  return [];
}

/** True kalau RAB `r` sudah TTD lengkap (Asman & MADM keduanya). */
function isFullySigned(r) {
  return Boolean(r.signatureAsman && r.signatureMadm);
}

/**
 * True kalau RAB `r` SUDAH punya entry pembayaran (Non PO atau Cash Card).
 * `nonPoList`/`ccList` = array submission, masing-masing punya field rabId.
 */
function hasPayment(r, nonPoList, ccList) {
  const id = r.idNumber;
  return (
    (nonPoList || []).some((x) => x.rabId === id) ||
    (ccList || []).some((x) => x.rabId === id)
  );
}

/**
 * RAB yang sudah TTD lengkap tapi belum ada pembayarannya - target notifikasi
 * ini SELALU Humas + Asman + MADM sekaligus (bukan cuma satu role).
 */
function pendingPaymentRab(rab, nonPoList, ccList) {
  return rab.filter((r) => isFullySigned(r) && !hasPayment(r, nonPoList, ccList));
}

/**
 * Bangun daftar notifikasi AKTIF (yang masih perlu ditindaklanjuti) untuk
 * user yang sedang login. Dipakai baik untuk pop-up maupun badge lonceng.
 */
export function buildActiveNotifications({ user, rab = [], nonPoList = [], ccList = [] }) {
  if (!user) return [];
  const items = [];

  if (user.role === "asman" || user.role === "madm") {
    pendingSignRab(rab, user.role).forEach((r) => {
      items.push({
        id: `sign-${r.idNumber}`,
        type: "sign",
        title: `${r.idNumber}, tanda tangan`,
        subtitle: r.judulKegiatan || "",
        target: { page: "rab", idNumber: r.idNumber },
      });
    });
  }

  if (["humas", "asman", "madm"].includes(user.role)) {
    pendingPaymentRab(rab, nonPoList, ccList).forEach((r) => {
      const kategori = r.kategori === "Cash Card" ? "Cash Card" : "Non PO";
      items.push({
        id: `payment-${r.idNumber}`,
        type: "payment",
        title: `${r.idNumber}, buat pembayaran ${kategori}`,
        subtitle: r.judulKegiatan || "",
        target: { page: kategori === "Cash Card" ? "cc-overview" : "nonpo", idNumber: r.idNumber },
      });
    });
  }

  return items;
}

/**
 * Riwayat lengkap untuk halaman Notifikasi (bukan cuma yang aktif) - tetap
 * dihitung dari data yang sama, ditambah entri "sudah selesai" biar user bisa
 * lihat histori, bukan cuma tugas yang belum kelar.
 */
export function buildNotificationHistory({ user, rab = [], nonPoList = [], ccList = [] }) {
  const active = buildActiveNotifications({ user, rab, nonPoList, ccList });
  const done = [];

  if (user && ["humas", "asman", "madm"].includes(user.role)) {
    rab.filter(isFullySigned).forEach((r) => {
      done.push({
        id: `signed-${r.idNumber}`,
        type: "signed",
        title: `${r.idNumber} sudah ditandatangani lengkap`,
        subtitle: "Asman dan MADM selesai",
        target: { page: "rab", idNumber: r.idNumber },
        signedAt: r.signatureMadm?.signedAt,
      });
    });
  }

  return [...active, ...done];
}
