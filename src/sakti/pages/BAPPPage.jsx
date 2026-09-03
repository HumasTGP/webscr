import GenericWizard from "./GenericWizard";

const bappFields = (rabIdOptions, idLabel = "ID RAB") => () => [
  { key: "id", label: idLabel, type: "select", options: rabIdOptions, required: true },
  { key: "kategori", label: "Kategori", type: "text", disabled: true, hint: "otomatis dari ID yang dipilih" },
  { key: "nomor", label: "Nomor BAPP", type: "text", required: true },
  { key: "tanggal", label: "Tanggal", type: "date", required: true },
  { key: "perihal", label: "Perihal", type: "text" },
  { key: "peserta", label: "Peserta Rapat", type: "textarea" },
  { key: "hasilPembahasan", label: "Hasil Pembahasan", type: "textarea" },
  { key: "kesimpulan", label: "Kesimpulan", type: "textarea" },
];

// idKey: nama field di `rab` yang dipakai sebagai ID (RAB pakai "idNumber",
// Cash Card berdiri sendiri pakai "id" - lihat App.jsx route bapp-cc).
export default function BAPPPage({ rab, list, setList, notify, idKey = "idNumber", idLabel = "ID RAB" }) {
  const rabIdOptions = rab.map((r) => r[idKey]);
  const autoMap = {
    key: "id",
    source: idKey === "id" ? rab : rab.map((r) => ({ ...r, idNumber: r[idKey] })),
    map: (rabRow) => ({
      kategori: rabRow.kategori || "",
    }),
  };

  return (
    <GenericWizard
      title="BAPP"
      eyebrow="Modul BAPP"
      description="Berita Acara Pemeriksaan Pekerjaan. Kategori otomatis mengikuti ID yang dipilih."
      buildFields={bappFields(rabIdOptions, idLabel)}
      idPrefix="BAPP"
      autoFrom={autoMap}
      list={list}
      setList={setList}
      notify={notify}
      pdfEnabled
      columns={[
        { key: "id", label: "ID" },
        { key: "kategori", label: "Kategori" },
        { key: "nomor", label: "Nomor" },
        { key: "tanggal", label: "Tanggal" },
        { key: "perihal", label: "Perihal" },
      ]}
    />
  );
}
