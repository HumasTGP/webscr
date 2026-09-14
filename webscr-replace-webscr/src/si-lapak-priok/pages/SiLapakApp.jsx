import { useEffect, useMemo, useRef, useState } from "react";
import SiLapakShell from "./SiLapakShell";
import SiLapakMenu from "./SiLapakMenu";
import TambahPaket from "./TambahPaket";
import DataPaket from "./DataPaket";
import AmbilPaket from "./AmbilPaket";
import BukuTamu from "./BukuTamu";
import Riwayat from "./Riwayat";
import SiLapakBantuan from "./SiLapakBantuan";
import SiLapakNotifikasi from "./SiLapakNotifikasi";
import { DutyPickerModal } from "./DutyPicker";
import SiLapakPageHeader from "../components/SiLapakPageHeader";
import NotificationPopup from "../../components/NotificationPopup";
import useNotificationSound from "../../lib/useNotificationSound";
import { buildSiLapakActiveNotifications, buildSiLapakNotificationHistory } from "../../lib/siLapakNotifications";
import "../styles/silapak-pages.css";

const VIEW_META = {
  tambah: { title: "Tambah Paket/Surat", description: "Catat paket atau surat masuk, penerima, dan petugas penerima." },
  data: { title: "Data Paket/Surat", description: "Cari, filter, periksa, edit, dan proses data paket atau surat yang sudah tercatat." },
  ambil: { title: "Ambil Paket/Surat", description: "Proses serah terima paket atau surat dan simpan bukti pengambilan secara terstruktur." },
  tamu: { title: "Buku Tamu", description: "Catat identitas, tujuan, waktu kunjungan, dan pegawai yang dituju." },
  notifikasi: { title: "Notifikasi", description: "Tindakan yang masih menunggu dan riwayat layanan yang telah diselesaikan." },
  riwayat: { title: "Riwayat", description: "Telusuri riwayat paket, surat, dan kunjungan tamu yang pernah dicatat." },
  bantuan: { title: "Bantuan", description: "Panduan penggunaan, pertanyaan umum, dan kontak bantuan Si Lapak Priok." },
};

export default function SiLapakApp({
  onLogout,
  paket,
  setPaket,
  tamu,
  setTamu,
  duty,
  setDuty,
  satpamList,
  setSatpamList,
  onAddSatpam,
}) {
  const [view, setView] = useState("dashboard");
  const [prefillAmbilId, setPrefillAmbilId] = useState(null);
  const [dutyModalOpen, setDutyModalOpen] = useState(false);
  const [notifPopupOpen, setNotifPopupOpen] = useState(false);
  const [notifDismissed, setNotifDismissed] = useState(false);
  const autoPopupShownRef = useRef(false);

  const activeNotifications = useMemo(
    () => buildSiLapakActiveNotifications({ paket, tamu, duty }),
    [paket, tamu, duty]
  );
  const notificationHistory = useMemo(
    () => buildSiLapakNotificationHistory({ paket, tamu, duty }),
    [paket, tamu, duty]
  );
  useNotificationSound({ id: "silapak", role: "silapak" }, activeNotifications);

  useEffect(() => {
    if (activeNotifications.length > 0 && !notifDismissed && !autoPopupShownRef.current) {
      autoPopupShownRef.current = true;
      setNotifPopupOpen(true);
    }
  }, [activeNotifications.length, notifDismissed]);

  const goto = (v) => setView(v);
  const handleProsesAmbil = (item) => { setPrefillAmbilId(item.id); setView("ambil"); };
  const handleAmbilSaved = ({ id, pengambil, satpamTugas, bulanKeluar, fotoBukti }) => {
    setPaket((prev) => prev.map((p) => p.id === id ? { ...p, status: "Sudah Diambil", pengambil, satpamTugasAmbil: satpamTugas, bulanKeluar, fotoBukti } : p));
    setPrefillAmbilId(null);
    setView("data");
  };
  const updatePaket = (updated) => setPaket((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  const deletePaket = (id) => setPaket((prev) => prev.filter((p) => p.id !== id));
  const updateTamu = (updated) => setTamu((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  const deleteTamu = (id) => setTamu((prev) => prev.filter((t) => t.id !== id));
  const checkoutTamu = (id) => {
    const now = new Date();
    const jamKeluar = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
    setTamu((prev) => prev.map((t) => t.id === id ? { ...t, status: "Selesai", jamKeluar } : t));
  };

  const openNotificationTarget = (item) => {
    setNotifPopupOpen(false);
    const target = item?.target;
    if (!target?.page) return;
    if (target.action === "open-duty") {
      setView("dashboard");
      setDutyModalOpen(true);
      return;
    }
    if (target.page === "ambil" && target.recordId) setPrefillAmbilId(target.recordId);
    setView(target.page);
  };

  const framed = (key, node, help = false) => {
    const meta = VIEW_META[key];
    return <div className="silapak-view-frame"><SiLapakPageHeader title={meta.title} description={meta.description} /><div className={`silapak-framed-content${help ? " silapak-help-content" : ""}`}>{node}</div></div>;
  };

  return <SiLapakShell active={view} onSelect={goto} onLogout={onLogout} notificationItems={activeNotifications} onOpenNotification={openNotificationTarget}>
    {view === "dashboard" && <SiLapakMenu duty={duty} onOpenDuty={() => setDutyModalOpen(true)} paket={paket} tamu={tamu} />}
    {view === "tambah" && framed("tambah", <TambahPaket duty={duty} onSaved={(entry) => setPaket((prev) => [entry, ...prev])} />)}
    {view === "data" && framed("data", <DataPaket paket={paket} onProsesAmbil={handleProsesAmbil} onUpdate={updatePaket} onDelete={deletePaket} />)}
    {view === "ambil" && framed("ambil", <AmbilPaket key={prefillAmbilId || "ambil"} paket={paket} prefillId={prefillAmbilId} duty={duty} onSaved={handleAmbilSaved} />)}
    {view === "tamu" && framed("tamu", <BukuTamu tamu={tamu} onSaved={(entry) => setTamu((prev) => [entry, ...prev])} onCheckout={checkoutTamu} />)}
    {view === "notifikasi" && framed("notifikasi", <SiLapakNotifikasi items={notificationHistory} onOpenItem={openNotificationTarget} />)}
    {view === "riwayat" && framed("riwayat", <Riwayat paket={paket} tamu={tamu} onUpdatePaket={updatePaket} onDeletePaket={deletePaket} onUpdateTamu={updateTamu} onDeleteTamu={deleteTamu} />)}
    {view === "bantuan" && framed("bantuan", <SiLapakBantuan />, true)}
    <DutyPickerModal
      open={dutyModalOpen}
      onClose={() => setDutyModalOpen(false)}
      duty={duty}
      onSave={setDuty}
      satpamList={satpamList}
      onAddSatpam={onAddSatpam || ((name) => setSatpamList((prev) => [...prev, name]))}
    />
    <NotificationPopup
      open={notifPopupOpen}
      items={activeNotifications}
      onClose={() => { setNotifPopupOpen(false); setNotifDismissed(true); }}
      onOpenItem={openNotificationTarget}
    />
  </SiLapakShell>;
}
