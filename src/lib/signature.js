/**
 * lib/signature.js
 *
 * Helper terpusat untuk fitur tanda tangan digital (RAB & Proposal).
 * Prinsip: user (Asman/MADM) upload gambar tanda tangan SEKALI ke profil
 * mereka (field signatureUrl di objek user), lalu setiap kali menandatangani
 * sebuah dokumen, gambar itu ditempelkan otomatis - bukan digambar ulang.
 */

/** Ubah File jadi data URL (base64) buat disimpan di state/localStorage. */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.readAsDataURL(file);
  });
}

/** True kalau user itu sudah punya tanda tangan tersimpan di profilnya. */
export function hasSavedSignature(user) {
  return Boolean(user && user.signatureUrl);
}

/**
 * Buat objek tanda tangan yang ditempelkan ke sebuah dokumen (RAB/Proposal).
 * Dipanggil saat user klik tombol "Tanda tangan" - mengambil gambar & nama
 * dari profil user yang sedang login, bukan input baru.
 */
export function buildSignatureStamp(user) {
  if (!hasSavedSignature(user)) return null;
  return {
    signatureUrl: user.signatureUrl,
    signatureName: user.signatureName || user.nama || user.username || "",
    signedAt: new Date().toISOString(),
  };
}

/** Format tanggal+jam Indonesia singkat untuk ditampilkan di bawah tanda tangan. */
export function formatSignedAt(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString("id-ID", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    }).replace(".", ":") + " WIB";
  } catch (_) {
    return "";
  }
}
