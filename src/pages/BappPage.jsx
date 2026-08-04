import GenericWizard from "./GenericWizard";
import { BastDocPreview } from "../components/DocTemplatePreview";

const bappFields = (rabIdOptions) => () => [
  { key: "id", label: "ID RAB", type: "select", options: rabIdOptions, required: true },
  { key: "kategori", label: "Kategori", type: "text", disabled: true, hint: "otomatis dari ID RAB" },
  { key: "nomor", label: "Nomor BAPP", type: "text", required: true },
  { key: "tanggal", label: "Tanggal", type: "date", required: true },
  { key: "perihal", label: "Perihal", type: "text" },
  { key: "peserta", label: "Peserta Rapat", type: "textarea" },
  { key: "hasilPembahasan", label: "Hasil Pembahasan", type: "textarea" },
  { key: "kesimpulan", label: "Kesimpulan", type: "textarea" },
];

export default function BappPage({ rab, list, setList, notify }) {
  const rabIdOptions = rab.map((r) => r.idNumber);
  const autoMap = {
    key: "id",
    source: rab,
    map: (rabRow) => ({
      kategori: rabRow.kategori || "",
    }),
  };

  return (
    <GenericWizard
      title="BAPP"
      eyebrow="Modul BAPP"
      description="Berita Acara Pemeriksaan Pekerjaan. Kategori otomatis mengikuti ID RAB yang dipilih."
      buildFields={bappFields(rabIdOptions)}
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
