import { useState } from "react";
import { Building2, Check, Plus } from "lucide-react";
import { T } from "../../lib/theme";
import { uid } from "../../lib/utils";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import DetailModal from "../../components/DetailModal";

const inputStyle = {
  width: "100%",
  padding: "9px 10px",
  borderRadius: 7,
  border: `1px solid ${T.border}`,
  background: T.inputBg,
  color: T.text,
  fontSize: 13,
};

const COLUMNS = [
  { key: "nama", label: "Nama Vendor" },
  { key: "alamat", label: "Alamat Vendor" },
];

export default function VendorPage({ vendors, setVendors, notify }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ nama: "", alamat: "" });
  const [detailRow, setDetailRow] = useState(null);

  const save = () => {
    if (!form.nama.trim()) return notify("Nama vendor wajib diisi.", "error");
    setVendors((prev) => [...prev, { id: uid("VND"), ...form }]);
    setForm({ nama: "", alamat: "" });
    setAdding(false);
    notify("Vendor berhasil ditambahkan!", "success", "Vendor");
  };

  return (
    <div>
      <PageHeader
        eyebrow="Master Data"
        title="Vendor"
        description="Daftar vendor yang digunakan pada formulir RAB. Klik salah satu baris untuk melihat detail atau mengubah data."
        right={
          <Button icon={Plus} onClick={() => setAdding(true)}>
            Tambah Vendor
          </Button>
        }
      />

      <Modal
        open={adding}
        onClose={() => setAdding(false)}
        title="Tambah Vendor"
        icon={Building2}
      >
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 5 }}>
            Nama Vendor
          </label>
          <input
            style={inputStyle}
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            placeholder="cth. CV Cahaya Abadi"
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 5 }}>
            Alamat Vendor
          </label>
          <input
            style={inputStyle}
            value={form.alamat}
            onChange={(e) => setForm({ ...form, alamat: e.target.value })}
            placeholder="cth. Jl. Yos Sudarso No.12, Jakarta Utara"
          />
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button variant="ghost" onClick={() => setAdding(false)}>
            Batal
          </Button>
          <Button icon={Check} onClick={save}>
            Simpan Vendor
          </Button>
        </div>
      </Modal>

      <Card padded={false}>
        <DataTable
          rows={vendors}
          emptyLabel="Belum ada vendor terdaftar."
          columns={COLUMNS}
          onRowClick={setDetailRow}
        />
      </Card>

      <DetailModal
        open={!!detailRow}
        onClose={() => setDetailRow(null)}
        data={detailRow}
        columns={COLUMNS}
        onSave={(draft) => {
          setVendors((prev) =>
            prev.map((v) => (v === detailRow ? { ...v, ...draft } : v))
          );
          notify("Data vendor berhasil diperbarui!");
        }}
      />
    </div>
  );
}
