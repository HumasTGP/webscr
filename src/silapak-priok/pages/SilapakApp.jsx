import { useState } from "react";
import SilapakShell from "./SilapakShell";
import SilapakMenu from "./SilapakMenu";
import TambahPaket from "./TambahPaket";
import DataPaket from "./DataPaket";
import AmbilPaket from "./AmbilPaket";
import BukuTamu from "./BukuTamu";
import Riwayat from "./Riwayat";
import SilapakBantuan from "./SilapakBantuan";
import { DutyPickerModal, defaultSatpamList } from "./DutyPicker";

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

      {view === "bantuan" && <SilapakBantuan />}

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
