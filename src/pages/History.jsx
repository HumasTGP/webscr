import { useState } from "react";
import Badge from "../components/Badge";
import Card from "../components/Card";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import DetailModal from "../components/DetailModal";

const COLUMNS = [
  { key: "jenis", label: "Jenis Pekerjaan", render: (r) => <Badge tone="blue">{r.jenis}</Badge> },
  { key: "tanggal", label: "Tanggal Pengerjaan" },
  { key: "waktu", label: "Waktu Submit" },
];

export default function HistoryPage({ history }) {
  const [detailRow, setDetailRow] = useState(null);

  return (
    <div>
      <PageHeader
        eyebrow="Riwayat"
        title="History Pekerjaan"
        description="Catatan otomatis setiap kali data berhasil disimpan dari modul manapun. Klik baris untuk melihat detail."
      />

      <Card padded={false}>
        <DataTable
          rows={history}
          emptyLabel="Belum ada riwayat pekerjaan. Simpan data dari modul manapun dan riwayatnya muncul di sini secara otomatis."
          searchPlaceholder="Cari riwayat…"
          columns={COLUMNS}
          onRowClick={setDetailRow}
        />
      </Card>

      <DetailModal
        open={!!detailRow}
        onClose={() => setDetailRow(null)}
        data={detailRow}
        columns={COLUMNS}
      />
    </div>
  );
}
