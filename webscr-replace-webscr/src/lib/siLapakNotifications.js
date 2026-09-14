/**
 * Notifikasi SI LAPAK selalu dihitung dari data operasional terkini.
 * Tidak ada record notifikasi yang disimpan ke Spreadsheet, sehingga badge
 * otomatis hilang saat tindakan yang diminta sudah diselesaikan.
 */

const isWaitingPickup = (item) => item?.status === "Belum Diambil";
const isActiveGuest = (guest) => guest?.status === "Sedang Berkunjung";

const packageCode = (item) =>
  item?.jenis === "Surat" ? item.noSurat : item.noResi;

export function buildSiLapakActiveNotifications({ paket = [], tamu = [], duty = null }) {
  const items = [];

  if (!duty?.names?.length) {
    items.push({
      id: "silapak-duty-unset",
      type: "duty",
      title: "Pilih satpam yang sedang bertugas",
      subtitle: "Petugas dan shift perlu ditetapkan sebelum pencatatan layanan.",
      target: { page: "dashboard", action: "open-duty" },
    });
  }

  paket.filter(isWaitingPickup).forEach((item) => {
    const jenis = item.jenis === "Surat" ? "Surat" : "Paket";
    items.push({
      id: `silapak-pickup-${item.id}`,
      type: item.jenis === "Surat" ? "letter" : "package",
      title: `${jenis} untuk ${item.namaPenerima || "penerima"} belum diterima`,
      subtitle: `${packageCode(item) || item.id} · masuk ${item.diterimaTanggal || "-"}, ${item.diterimaJam || "-"}`,
      target: { page: "ambil", recordId: item.id },
    });
  });

  tamu.filter(isActiveGuest).forEach((guest) => {
    items.push({
      id: `silapak-guest-${guest.id}`,
      type: "guest",
      title: `${guest.namaTamu || "Tamu"} belum dicatat keluar`,
      subtitle: `Menemui ${guest.pegawai || "-"} · masuk pukul ${guest.jam || "-"}`,
      target: { page: "tamu", recordId: guest.id },
    });
  });

  return items;
}

export function buildSiLapakNotificationHistory({ paket = [], tamu = [], duty = null }) {
  const active = buildSiLapakActiveNotifications({ paket, tamu, duty });
  const completed = [];

  paket.filter((item) => item?.status === "Sudah Diambil").forEach((item) => {
    const jenis = item.jenis === "Surat" ? "Surat" : "Paket";
    completed.push({
      id: `silapak-done-${item.id}`,
      type: "done",
      title: `${jenis} untuk ${item.namaPenerima || "penerima"} sudah diserahkan`,
      subtitle: `${packageCode(item) || item.id} · diterima oleh ${item.pengambil || "-"}`,
      target: { page: "riwayat", recordId: item.id },
    });
  });

  tamu.filter((guest) => guest?.status === "Selesai").forEach((guest) => {
    completed.push({
      id: `silapak-guest-done-${guest.id}`,
      type: "done",
      title: `Kunjungan ${guest.namaTamu || "tamu"} selesai`,
      subtitle: `Keluar pukul ${guest.jamKeluar || "-"}`,
      target: { page: "riwayat", recordId: guest.id },
    });
  });

  return [...active, ...completed];
}
