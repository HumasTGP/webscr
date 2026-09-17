// URL Apps Script diambil dari environment variable VITE_API_URL (di-set di
// Vercel Project Settings > Environment Variables) supaya bisa diganti tanpa
// ubah kode - misal saat deploy ulang Apps Script dan dapat URL /exec baru.
// Fallback ke URL lama dipakai kalau env var belum di-set sama sekali (mis.
// waktu dev lokal tanpa file .env), supaya app tetap jalan.
const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://script.google.com/macros/s/AKfycbwqyf3VLrSlapQ9OUj1_DK32aiqcIV6goaGU8dor_gV9-QJxpwRHBAbpkN8OtfJsiC-/exec";

async function parseResponse(response) {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: gagal menghubungi server`);
  }

  const result = await response.json();
  if (!result?.ok) {
    throw new Error(result?.error || "Terjadi kesalahan pada server");
  }
  return result;
}

async function requestApi(action, payload = {}) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, ...payload }),
  });
  return parseResponse(response);
}

export async function checkApi() {
  return parseResponse(await fetch(API_URL));
}

export async function loadDatabase(datasetKeys) {
  return requestApi("loadDatabase", {
    ...(Array.isArray(datasetKeys) && datasetKeys.length ? { datasetKeys } : {}),
  });
}

export async function saveDatabase(datasets) {
  if (!datasets || Array.isArray(datasets) || typeof datasets !== "object" || !Object.keys(datasets).length) {
    throw new Error("Dataset yang akan disimpan tidak valid.");
  }
  return requestApi("saveDatabase", { datasets });
}

export async function saveDataset(name, data) {
  return saveDatabase({ [name]: data });
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error("File gagal dibaca."));
    reader.readAsDataURL(file);
  });
}

export async function uploadFile(file, folderKey = "default", metadata = {}) {
  if (!file) throw new Error("File wajib dipilih.");
  const dataUrl = await fileToDataUrl(file);
  return requestApi("uploadFile", {
    folderKey,
    dataUrl,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    ...metadata,
  });
}

export { API_URL };
