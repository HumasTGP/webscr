import { useState } from "react";
import SilapakShell from "./silapak/SilapakShell";
import SilapakMenu from "./silapak/SilapakMenu";
import TambahPaket from "./silapak/TambahPaket";
import DataPaket from "./silapak/DataPaket";
import AmbilPaket from "./silapak/AmbilPaket";
import BukuTamu from "./silapak/BukuTamu";
import Riwayat from "./silapak/Riwayat";
import { DutyPickerModal, defaultSatpamList } from "./silapak/DutyPicker";

export default function SilapakApp({ onLogout }) {
  const [view, setView] = useState("dashboard");
  const [prefillAmbilId, setPrefillAmbilId] = useState(null);

  const [duty, setDuty] = useState(null);
  const [dutyModalOpen, setDutyModalOpen] = useState(false);
  const [satpamList, setSatpamList] = useState(defaultSatpamList);

  const [paket, setPaket] = useState([]);
  const [tamu, setTamu] = useState([]);

  const goto = (v) => setView(v);

  const handleProsesAmbil = (item) => {
    setPrefillAmbilId(item.id);
    setView("ambil");
  };

  const handleAmbilSaved = ({ id, pengambil, satpamTugas, bulanKeluar, fotoBukti }) => {
    setPaket((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: "Sudah Diambil", pengambil, satpamTugasAmbil: satpamTugas, bulanKeluar, fotoBukti }
          : p
      )
    );
    setPrefillAmbilId(null);
    setView("data");
  };

  const updatePaket = (updated) => {
    setPaket((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };
  const deletePaket = (id) => {
    setPaket((prev) => prev.filter((p) => p.id !== id));
  };
  const updateTamu = (updated) => {
    setTamu((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };
  const deleteTamu = (id) => {
    setTamu((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <SilapakShell active={view} onSelect={goto} onLogout={onLogout}>
      {view === "dashboard" && (
        <SilapakMenu duty={duty} onOpenDuty={() => setDutyModalOpen(true)} paket={paket} tamu={tamu} />
      )}

      {view === "tambah" && (
        <TambahPaket duty={duty} onBack={() => setView("dashboard")} onSaved={(entry) => setPaket((prev) => [entry, ...prev])} />
      )}

      {view === "data" && (
        <DataPaket paket={paket} onBack={() => setView("dashboard")} onProsesAmbil={handleProsesAmbil} onUpdate={updatePaket} onDelete={deletePaket} />
      )}

      {view === "ambil" && (
        <AmbilPaket paket={paket} prefillId={prefillAmbilId} duty={duty} onBack={() => setView("dashboard")} onSaved={handleAmbilSaved} />
      )}

      {view === "tamu" && (
        <BukuTamu onBack={() => setView("dashboard")} onSaved={(entry) => setTamu((prev) => [entry, ...prev])} />
      )}

      {view === "riwayat" && (
        <Riwayat paket={paket} tamu={tamu} onBack={() => setView("dashboard")} onUpdateTamu={updateTamu} onDeleteTamu={deleteTamu} />
      )}

      <DutyPickerModal
        open={dutyModalOpen}
        onClose={() => setDutyModalOpen(false)}
        duty={duty}
        onSave={setDuty}
        satpamList={satpamList}
        onAddSatpam={(name) => setSatpamList((prev) => [...prev, name])}
      />
    </SilapakShell>
  );
}
