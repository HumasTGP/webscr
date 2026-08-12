import { useState } from "react";
import SiLapakShell from "./SiLapakShell";
import SiLapakMenu from "./SiLapakMenu";
import TambahPaket from "./TambahPaket";
import DataPaket from "./DataPaket";
import AmbilPaket from "./AmbilPaket";
import BukuTamu from "./BukuTamu";
import Riwayat from "./Riwayat";
import SiLapakBantuan from "./SiLapakBantuan";
import { DutyPickerModal, defaultSatpamList } from "./DutyPicker";
import SiLapakPageHeader from "../components/SiLapakPageHeader";
import "../styles/silapak-pages.css";

const VIEW_META = {
  tambah: { title: "Tambah Paket", description: "Catat paket masuk, penerima, ekspedisi, dan petugas penerima paket." },
  data: { title: "Data Paket", description: "Cari, periksa, edit, dan proses data paket yang sudah tercatat." },
  ambil: { title: "Ambil Paket", description: "Proses serah terima paket dan simpan bukti pengambilan secara terstruktur." },
  tamu: { title: "Buku Tamu", description: "Catat identitas, tujuan, waktu kunjungan, dan pegawai yang dituju." },
  riwayat: { title: "Riwayat", description: "Telusuri riwayat paket dan kunjungan tamu yang pernah dicatat." },
  bantuan: { title: "Bantuan", description: "Panduan penggunaan, pertanyaan umum, dan kontak bantuan Si Lapak Priok." },
};

export default function SiLapakApp({ onLogout }) {
  const [view, setView] = useState("dashboard");
  const [prefillAmbilId, setPrefillAmbilId] = useState(null);
  const [duty, setDuty] = useState(null);
  const [dutyModalOpen, setDutyModalOpen] = useState(false);
  const [satpamList, setSatpamList] = useState(defaultSatpamList);
  const [paket, setPaket] = useState([]);
  const [tamu, setTamu] = useState([]);

  const goto = (v) => setView(v);
  const handleProsesAmbil = (item) => { setPrefillAmbilId(item.id); setView("ambil"); };
  const handleAmbilSaved = ({ id, pengambil, satpamTugas, bulanKeluar, fotoBukti }) => {
    setPaket((prev) => prev.map((p) => p.id === id ? { ...p, status: "Sudah Diambil", pengambil, satpamTugasAmbil: satpamTugas, bulanKeluar, fotoBukti } : p));
    setPrefillAmbilId(null); setView("data");
  };
  const updatePaket = (updated) => setPaket((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  const deletePaket = (id) => setPaket((prev) => prev.filter((p) => p.id !== id));
  const updateTamu = (updated) => setTamu((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  const deleteTamu = (id) => setTamu((prev) => prev.filter((t) => t.id !== id));

  const framed = (key, node, help = false) => {
    const meta = VIEW_META[key];
    return <div className="silapak-view-frame"><SiLapakPageHeader title={meta.title} description={meta.description} onBack={key === "bantuan" ? null : () => setView("dashboard")} /><div className={`silapak-framed-content${help ? " silapak-help-content" : ""}`}>{node}</div></div>;
  };

  return <SiLapakShell active={view} onSelect={goto} onLogout={onLogout}>
    {view === "dashboard" && <SiLapakMenu duty={duty} onOpenDuty={() => setDutyModalOpen(true)} paket={paket} tamu={tamu} />}
    {view === "tambah" && framed("tambah", <TambahPaket duty={duty} onBack={() => setView("dashboard")} onSaved={(entry) => setPaket((prev) => [entry, ...prev])} />)}
    {view === "data" && framed("data", <DataPaket paket={paket} onBack={() => setView("dashboard")} onProsesAmbil={handleProsesAmbil} onUpdate={updatePaket} onDelete={deletePaket} />)}
    {view === "ambil" && framed("ambil", <AmbilPaket paket={paket} prefillId={prefillAmbilId} duty={duty} onBack={() => setView("dashboard")} onSaved={handleAmbilSaved} />)}
    {view === "tamu" && framed("tamu", <BukuTamu onBack={() => setView("dashboard")} onSaved={(entry) => setTamu((prev) => [entry, ...prev])} />)}
    {view === "riwayat" && framed("riwayat", <Riwayat paket={paket} tamu={tamu} onBack={() => setView("dashboard")} onUpdateTamu={updateTamu} onDeleteTamu={deleteTamu} />)}
    {view === "bantuan" && framed("bantuan", <SiLapakBantuan />, true)}
    <DutyPickerModal open={dutyModalOpen} onClose={() => setDutyModalOpen(false)} duty={duty} onSave={setDuty} satpamList={satpamList} onAddSatpam={(name) => setSatpamList((prev) => [...prev, name])} />
  </SiLapakShell>;
}
