import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  FileText,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import { T, font } from "../../lib/theme";
import { rupiah, terbilang as toTerbilang } from "../../lib/utils";
import {
  generateDocxFromTemplate,
  formatTanggalPanjang,
  formatWeekBulanTahun,
} from "../../lib/docxGenerate";

import Button from "../../components/Button";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import ComboManaged from "../../components/ComboManaged";
import DatePicker from "../../components/DatePicker";
import EmptyState from "../../components/EmptyState";

const DOC_LABELS = {
  verifikasi: "Formulir Verifikasi",
  permintaan: "Permintaan Dana Cash Card",
  pertanggungjawaban: "Pertanggungjawaban Cash Card",
  rencana: "Rencana Permintaan Tunai",
};

const EMPTY_ITEM = {
  uraian: "",
  expType: "",
  tanggalKegiatan: "",
  jumlah: "",
  satuan: "",
  hargaSatuan: "",
};

// Angka terformat Indonesia tanpa "Rp"
const angka = (n) => {
  return (Number(n) || 0).toLocaleString("id-ID");
};

function totalHargaOf(item) {
  return (
    (Number(item.jumlah) || 0) *
    (Number(item.hargaSatuan) || 0)
  );
}

const iconBtnStyle = {
  width: 26,
  height: 26,
  borderRadius: 6,
  border: `1px solid ${T.border}`,
  background: T.card,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: T.muted,
  fontSize: 11,
  marginRight: 3,
};

export default function DetailCCPage({
  ccList,
  setCcList,
  ccItems,
  setCcItems,
  combo,
  setCombo,
  notify,
}) {
  const [selectedCcId, setSelectedCcId] = useState(
    ccList[ccList.length - 1]?.id || ""
  );

  const [stage, setStage] = useState("list");

  const [form1, setForm1] = useState({});

  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [itemForm, setItemForm] = useState(EMPTY_ITEM);
  const [editingItem, setEditingItem] = useState(null);

  const [overviewItem, setOverviewItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [search, setSearch] = useState("");

  const [printDoc, setPrintDoc] = useState(null);

  // =========================================================
  // DATA CASH CARD AKTIF
  // =========================================================

  const selectedCc = ccList.find(
    (r) => r.id === selectedCcId
  );

  const itemsForCc = useMemo(
    () =>
      ccItems.filter(
        (it) => it.ccId === selectedCcId
      ),
    [ccItems, selectedCcId]
  );

  const displayItems = useMemo(() => {
    if (!search) return itemsForCc;

    const q = search.toLowerCase();

    return itemsForCc.filter((it) =>
      (it.uraian || "")
        .toLowerCase()
        .includes(q)
    );
  }, [itemsForCc, search]);

  const totalRealisasi = itemsForCc.reduce(
    (s, it) => s + totalHargaOf(it),
    0
  );

  const saldoKas =
    Number(selectedCc?.saldoKas) || 0;

  const saldoAkhir =
    saldoKas - totalRealisasi;

  // =========================================================
  // COMBO
  // =========================================================

  const setComboOpts = (key, opts) => {
    setCombo((p) => ({
      ...p,
      [key]: opts,
    }));
  };

  // =========================================================
  // FORM 1
  // =========================================================

  const startForm1 = () => {
    if (!selectedCc) {
      return notify(
        "Pilih atau tambah Cash Card dulu di menu Cash Card.",
        "error"
      );
    }

    const year = new Date().getFullYear();

    const now = new Date();

    const bulanIni = now.toLocaleDateString(
      "id-ID",
      {
        month: "long",
      }
    );

    setForm1({
      nomorPengajuan:
        selectedCc.nomorPengajuan ||
        `${selectedCc.id}/CC/CD/PRIOK/${year}`,

      judulPengajuan:
        selectedCc.judulPengajuan ||
        `Pengajuan Dana Cash Card ${
          selectedCc.judulCc || ""
        }`.trim(),

      nomorPermintaanWeek:
        selectedCc.nomorPermintaanWeek ||
        `W1/${bulanIni}/CC/KAS/UBPPRO/${year}`,

      nomorPertanggungjawabanWeek:
        selectedCc.nomorPertanggungjawabanWeek ||
        `W1/${bulanIni}/LPJCC/KAS/UBPRO/${year}`,

      noRekening:
        selectedCc.noRekening || "",
    });

    setStage("form1");
  };

  const saveForm1AndContinue = () => {
    setCcList((prev) =>
      prev.map((r) =>
        r.id === selectedCcId
          ? {
              ...r,
              ...form1,
            }
          : r
      )
    );

    setStage("form2");
  };

  // =========================================================
  // ITEM
  // =========================================================

  const openItemModal = (item = null) => {
    setEditingItem(item);

    setItemForm(
      item
        ? { ...item }
        : { ...EMPTY_ITEM }
    );

    setItemModalOpen(true);
  };

  const setItemField = (key, value) => {
    setItemForm((p) => ({
      ...p,
      [key]: value,
    }));
  };

  const saveItem = () => {
    if (!itemForm.uraian.trim()) {
      return notify(
        "Isi Uraian terlebih dahulu.",
        "error"
      );
    }

    if (editingItem) {
      setCcItems((prev) =>
        prev.map((it) =>
          it.id === editingItem.id
            ? {
                ...it,
                ...itemForm,
              }
            : it
        )
      );

      notify(
        "Item berhasil diperbarui.",
        "success"
      );
    } else {
      const id = `${selectedCcId}-${Date.now().toString(36)}`;

      setCcItems((prev) => [
        ...prev,
        {
          ...itemForm,
          id,
          ccId: selectedCcId,
          tanggal: new Date()
            .toISOString()
            .slice(0, 10),
        },
      ]);

      notify(
        "Item berhasil ditambahkan.",
        "success"
      );
    }

    setItemModalOpen(false);
    setEditingItem(null);
    setItemForm({
      ...EMPTY_ITEM,
    });
  };

  const doDeleteItem = (item) => {
    setCcItems((prev) =>
      prev.filter(
        (it) => it.id !== item.id
      )
    );

    setDeleteConfirm(null);

    notify(
      "Item berhasil dihapus.",
      "success"
    );
  };

  // =========================================================
  // DATA UNTUK TEMPLATE WORD
  // =========================================================

  const buildVerifikasiData = () => {
    return {
      "no ver dari sistem":
        `${selectedCcId}/VER/CD/PRIOK/${new Date().getFullYear()}`,

      "tanggal/bulan/tahun":
        formatTanggalPanjang(
          new Date()
            .toISOString()
            .slice(0, 10)
        ),

      "W/bula/LPJCC/KAS/UBPRO/2026":
        formatWeekBulanTahun(),

      "judul kegitan":
        selectedCc?.judulCc ||
        form1.judulPengajuan ||
        "",

      "dari jumlah biaya":
        angka(totalRealisasi),
    };
  };

  // =========================================================
  // PERMINTAAN DANA CASH CARD
  // =========================================================

  const buildPermintaanData = () => {
    const total =
      saldoKas || totalRealisasi;

    const items = itemsForCc.slice(0, 4);

    return {
      "submissionid/CC/CD/PRIOK/2026":
        form1.nomorPengajuan ||
        selectedCc?.nomorPengajuan ||
        `${selectedCcId}/CC/CD/PRIOK/${new Date().getFullYear()}`,

      "Week/bulan/CC/KAS/UBPPRO/2026":
        formatWeekBulanTahun(),

      "saldo kas":
        angka(total),

      "di baca dalam huruf dari jumlah terbilang":
        toTerbilang(total),

      "tanggal bulan tahun":
        formatTanggalPanjang(
          new Date()
            .toISOString()
            .slice(0, 10)
        ),

      // Baris kiri
      "Exp.type": items.map(
        (item) => item.expType || ""
      ),

      // Baris kanan
      "harga exp.type": items.map(
        (item) =>
          angka(
            totalHargaOf(item)
          )
      ),
    };
  };

  // =========================================================
  // RENCANA PERMINTAAN TUNAI
  // =========================================================

  const buildRencanaData = () => {
    const total =
      saldoKas || totalRealisasi;

    return {
      "submissionid/CC/CD/PRIOK/Tahun":
        form1.nomorPengajuan ||
        selectedCc?.nomorPengajuan ||
        `${selectedCcId}/CC/CD/PRIOK/${new Date().getFullYear()}`,

      "nominal saldo kas":
        angka(total),

      "jumlah terbilang dari total pengajuan":
        toTerbilang(total),

      "tanggal bulan tahun":
        formatTanggalPanjang(
          new Date()
            .toISOString()
            .slice(0, 10)
        ),
    };
  };

  // =========================================================
  // PERTANGGUNGJAWABAN CASH CARD
  // =========================================================

  const buildPertanggungjawabanData = () => {
    const total = totalRealisasi;

    const byExpType = {};

    itemsForCc.forEach((item) => {
      const key =
        item.expType || "-";

      byExpType[key] =
        (byExpType[key] || 0) +
        totalHargaOf(item);
    });

    const topExpType =
      Object.entries(byExpType)
        .sort(
          (a, b) => b[1] - a[1]
        )[0] || ["-", 0];

    const items = itemsForCc.slice(0, 2);

    return {
      "submissionid/VER/CD/PRIOK/Tahun":
        `${selectedCcId}/VER/CD/PRIOK/${new Date().getFullYear()}`,

      "Week/Bulan/LPJCC/KAS/UBPRO/Tahun":
        formatWeekBulanTahun(),

      "Exp.Type": items.map(
        (item) => item.expType || ""
      ),

      "harga  exptype":
        angka(topExpType[1]),

      "Harga keseluruhan":
        angka(total),
    };
  };

  // =========================================================
  // KONFIGURASI TEMPLATE
  // =========================================================

  const DOC_CONFIG = {
    verifikasi: {
      url: "/templates/Template verifikasi cc.docx",
      build: buildVerifikasiData,
    },

    permintaan: {
      url: "/templates/Template Permintaan dana cc.docx",
      build: buildPermintaanData,
    },

    pertanggungjawaban: {
      url: "/templates/Template Pertanggung Jawaban CC .docx",
      build: buildPertanggungjawabanData,
    },

    rencana: {
      url: "/templates/Template Rencana permintaan Tunai CC.docx",
      build: buildRencanaData,
    },
  };

  // =========================================================
  // DOWNLOAD WORD
  // =========================================================

  const openPrintModal = (
    key,
    item = null
  ) => {
    setPrintDoc({
      key,
      item,
    });
  };

  const downloadPrintDoc = async () => {
    if (!printDoc) return;

    const cfg =
      DOC_CONFIG[printDoc.key];

    try {
      await generateDocxFromTemplate(
        cfg.url,
        cfg.build(),
        `${DOC_LABELS[
          printDoc.key
        ].replace(
          /\s+/g,
          "-"
        )}-${selectedCcId}.docx`
      );

      notify(
        `${DOC_LABELS[
          printDoc.key
        ]} (.docx) berhasil diunduh.`,
        "success"
      );

      setPrintDoc(null);
    } catch (e) {
      notify(
        `Gagal membuat ${
          DOC_LABELS[
            printDoc.key
          ]
        }: ${e.message}`,
        "error"
      );
    }
  };

  // =========================================================
  // STYLE
  // =========================================================

  const thStyle = {
    textAlign: "left",
    padding: "8px 10px",
    background: T.bg,
    borderBottom: `1px solid ${T.border}`,
    color: T.muted,
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.3px",
    whiteSpace: "nowrap",
  };

  const tdStyle = {
    padding: "9px 10px",
    borderBottom: `1px solid ${T.border}`,
    fontSize: 12.5,
  };

  const tdCenterStyle = {
    ...tdStyle,
    textAlign: "center",
  };

  const tdNumStyle = {
    ...tdStyle,
    textAlign: "right",
    fontVariantNumeric: "tabular-nums",
  };

  const inputStyle = {
    width: "100%",
    padding: "9px 11px",
    borderRadius: 8,
    border: `1px solid ${T.border}`,
    background: T.inputBg,
    color: T.text,
    fontSize: 13,
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  const inputDisabledStyle = {
    ...inputStyle,
    background: T.bg,
    color: T.muted,
  };

  const labelStyle = {
    display: "block",
    fontSize: 12.5,
    fontWeight: 600,
    color: T.text,
    marginBottom: 6,
  };

  // =========================================================
  // TOMBOL CETAK
  // =========================================================

  const printButtons = (item) => (
    <>
      <button
        type="button"
        title="Cetak Form Verifikasi"
        onClick={() =>
          openPrintModal(
            "verifikasi",
            item
          )
        }
        style={iconBtnStyle}
      >
        📄
      </button>

      <button
        type="button"
        title="Cetak Permintaan CC"
        onClick={() =>
          openPrintModal(
            "permintaan",
            item
          )
        }
        style={iconBtnStyle}
      >
        💳
      </button>

      <button
        type="button"
        title="Cetak Pertanggungjawaban CC"
        onClick={() =>
          openPrintModal(
            "pertanggungjawaban",
            item
          )
        }
        style={iconBtnStyle}
      >
        📋
      </button>

      <button
        type="button"
        title="Cetak Rencana Permintaan Tunai"
        onClick={() =>
          openPrintModal(
            "rencana",
            item
          )
        }
        style={iconBtnStyle}
      >
        💵
      </button>
    </>
  );

  // =========================================================
  // EMPTY CASH CARD
  // =========================================================

  if (!ccList.length) {
    return (
      <div>
        <PageHeader
          eyebrow="Cash Card"
          title="Detail CC"
        />

        <Card>
          <EmptyState
            label="Belum ada Cash Card."
            hint='Tambah Cash Card dulu di menu "Cash Card" sebelum mengisi Detail CC.'
          />
        </Card>
      </div>
    );
  }

  // =========================================================
  // STAGE FORM 1
  // =========================================================

  if (stage === "form1") {
    return (
      <div>
        <PageHeader
          eyebrow="Cash Card"
          title="Detail CC"
          right={
            <Button
              variant="ghost"
              icon={ArrowLeft}
              onClick={() =>
                setStage("list")
              }
            >
              Kembali ke daftar
            </Button>
          }
        />

        <Card>
          <div
            style={{
              fontFamily: font.display,
              fontSize: 13,
              color: T.heading,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            Identitas &amp; Nomor Pengajuan
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, 1fr)",
              gap: "16px 18px",
            }}
          >
            <div>
              <label style={labelStyle}>
                ID{" "}
                <span
                  style={{
                    fontWeight: 400,
                    color: T.muted,
                  }}
                >
                  (otomatis)
                </span>
              </label>

              <input
                value={selectedCcId}
                disabled
                style={
                  inputDisabledStyle
                }
              />
            </div>

            <div>
              <label style={labelStyle}>
                Submission ID{" "}
                <span
                  style={{
                    fontWeight: 400,
                    color: T.muted,
                  }}
                >
                  (otomatis)
                </span>
              </label>

              <input
                value={selectedCcId}
                disabled
                style={
                  inputDisabledStyle
                }
              />
            </div>

            <div>
              <label style={labelStyle}>
                Nomor Pengajuan{" "}
                <span
                  style={{
                    fontWeight: 400,
                    color: T.muted,
                  }}
                >
                  (otomatis)
                </span>
              </label>

              <input
                value={
                  form1.nomorPengajuan ||
                  ""
                }
                disabled
                style={
                  inputDisabledStyle
                }
              />
            </div>

            <div
              style={{
                gridColumn: "1 / -1",
              }}
            >
              <label style={labelStyle}>
                Judul Pengajuan
              </label>

              <input
                value={
                  form1.judulPengajuan ||
                  ""
                }
                onChange={(e) =>
                  setForm1((p) => ({
                    ...p,
                    judulPengajuan:
                      e.target.value,
                  }))
                }
                placeholder="cth. Pengajuan Dana Cash Card Donor Darah PMI"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>
                Nomor Permintaan Week CC{" "}
                <span
                  style={{
                    fontWeight: 400,
                    color: T.muted,
                  }}
                >
                  (otomatis)
                </span>
              </label>

              <input
                value={
                  form1.nomorPermintaanWeek ||
                  ""
                }
                disabled
                style={
                  inputDisabledStyle
                }
              />
            </div>

            <div>
              <label style={labelStyle}>
                Nomor Pertanggungjawaban Week CC{" "}
                <span
                  style={{
                    fontWeight: 400,
                    color: T.muted,
                  }}
                >
                  (otomatis)
                </span>
              </label>

              <input
                value={
                  form1.nomorPertanggungjawabanWeek ||
                  ""
                }
                disabled
                style={
                  inputDisabledStyle
                }
              />
            </div>

            <div>
              <label style={labelStyle}>
                No. Rekening
              </label>

              <input
                value={
                  form1.noRekening ||
                  ""
                }
                onChange={(e) =>
                  setForm1((p) => ({
                    ...p,
                    noRekening:
                      e.target.value,
                  }))
                }
                placeholder="Nomor rekening tujuan"
                style={inputStyle}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 18,
            }}
          >
            <Button
              icon={ArrowRight}
              onClick={
                saveForm1AndContinue
              }
            >
              Lanjutkan ke Item Pengajuan
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // =========================================================
  // STAGE FORM 2
  // =========================================================

  if (stage === "form2") {
    return (
      <div>
        <PageHeader
          eyebrow="Cash Card"
          title="Item Pengajuan"
          right={
            <Button
              variant="ghost"
              icon={ArrowLeft}
              onClick={() =>
                setStage("form1")
              }
            >
              Kembali
            </Button>
          }
        />

        <Card>
          <div
            style={{
              fontFamily: font.display,
              fontSize: 13,
              color: T.heading,
              fontWeight: 700,
              marginBottom: 4,
            }}
          >
            Item Pengajuan{" "}
            <span
              style={{
                fontWeight: 400,
                color: T.muted,
              }}
            >
              - klik "Tambah baris" untuk kegiatan baru
            </span>
          </div>

          <Button
            icon={Plus}
            onClick={() =>
              openItemModal()
            }
            style={{
              marginTop: 10,
              marginBottom: 16,
            }}
          >
            Tambah baris
          </Button>

          {itemsForCc.length === 0 ? (
            <EmptyState
              label="Belum ada baris."
              hint='Klik "Tambah baris" untuk mulai isi Item Pengajuan.'
            />
          ) : (
            <div
              style={{
                overflowX: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse:
                    "collapse",
                  fontSize: 12.5,
                }}
              >
                <thead>
                  <tr>
                    <th style={thStyle}>
                      No
                    </th>
                    <th style={thStyle}>
                      Uraian
                    </th>
                    <th style={thStyle}>
                      Exp Type
                    </th>
                    <th style={thStyle}>
                      Tanggal
                    </th>
                    <th
                      style={{
                        ...thStyle,
                        textAlign:
                          "right",
                      }}
                    >
                      Jumlah
                    </th>
                    <th style={thStyle}>
                      Satuan
                    </th>
                    <th
                      style={{
                        ...thStyle,
                        textAlign:
                          "right",
                      }}
                    >
                      Harga Satuan
                    </th>
                    <th
                      style={{
                        ...thStyle,
                        textAlign:
                          "right",
                      }}
                    >
                      Total Harga
                    </th>
                    <th
                      style={{
                        ...thStyle,
                        textAlign:
                          "center",
                      }}
                    >
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {itemsForCc.map(
                    (item, i) => (
                      <tr
                        key={item.id}
                        style={{
                          background:
                            i % 2 === 1
                              ? T.rowAlt
                              : undefined,
                        }}
                      >
                        <td
                          style={
                            tdStyle
                          }
                        >
                          {i + 1}
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {item.uraian}
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {item.expType ||
                            "-"}
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {item.tanggalKegiatan ||
                            "-"}
                        </td>

                        <td
                          style={
                            tdNumStyle
                          }
                        >
                          {item.jumlah ||
                            "-"}
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {item.satuan ||
                            "-"}
                        </td>

                        <td
                          style={
                            tdNumStyle
                          }
                        >
                          {item.hargaSatuan
                            ? rupiah(
                                item.hargaSatuan
                              )
                            : "-"}
                        </td>

                        <td
                          style={
                            tdNumStyle
                          }
                        >
                          {rupiah(
                            totalHargaOf(
                              item
                            )
                          )}
                        </td>

                        <td
                          style={
                            tdCenterStyle
                          }
                        >
                          <button
                            type="button"
                            title="Edit"
                            onClick={() =>
                              openItemModal(
                                item
                              )
                            }
                            style={
                              iconBtnStyle
                            }
                          >
                            <Pencil
                              size={12}
                            />
                          </button>

                          <button
                            type="button"
                            title="Hapus"
                            onClick={() =>
                              setDeleteConfirm(
                                item
                              )
                            }
                            style={{
                              ...iconBtnStyle,
                              color:
                                T.danger,
                            }}
                          >
                            <Trash2
                              size={12}
                            />
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            marginTop: 18,
          }}
        >
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() =>
              setStage("form1")
            }
          >
            Kembali
          </Button>

          <Button
            icon={ArrowRight}
            onClick={() =>
              setStage("konfirmasi")
            }
          >
            Lanjutkan
          </Button>
        </div>

        {/* Modal Tambah/Edit */}
        <Modal
          open={itemModalOpen}
          onClose={() => {
            setItemModalOpen(false);
            setEditingItem(null);
          }}
          title={
            editingItem
              ? "Edit Item Pengajuan"
              : "Tambah Item Pengajuan"
          }
          width={440}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px 18px",
            }}
          >
            <div
              style={{
                flex: "1 1 100%",
              }}
            >
              <label
                style={labelStyle}
              >
                Uraian
              </label>

              <input
                value={
                  itemForm.uraian
                }
                onChange={(e) =>
                  setItemField(
                    "uraian",
                    e.target.value
                  )
                }
                placeholder="cth. Konsumsi kegiatan pelatihan…"
                style={inputStyle}
              />
            </div>

            <div
              style={{
                flex: "1 1 100%",
              }}
            >
              <ComboManaged
                label="Exp Type"
                value={
                  itemForm.expType
                }
                options={
                  combo.expType
                }
                onChange={(v) =>
                  setItemField(
                    "expType",
                    v
                  )
                }
                onOptions={(opts) =>
                  setComboOpts(
                    "expType",
                    opts
                  )
                }
                placeholder="Pilih Exp Type…"
              />
            </div>

            <div
              style={{
                flex: "1 1 200px",
                maxWidth: 280,
              }}
            >
              <label
                style={labelStyle}
              >
                Tanggal kegiatan
              </label>

              <DatePicker
                value={
                  itemForm.tanggalKegiatan
                }
                onChange={(v) =>
                  setItemField(
                    "tanggalKegiatan",
                    v
                  )
                }
              />
            </div>

            <div
              style={{
                flex: "1 1 200px",
                maxWidth: 280,
              }}
            >
              <label
                style={labelStyle}
              >
                Jumlah
              </label>

              <input
                type="number"
                value={
                  itemForm.jumlah
                }
                onChange={(e) =>
                  setItemField(
                    "jumlah",
                    e.target.value
                  )
                }
                style={inputStyle}
              />
            </div>

            <div
              style={{
                flex: "1 1 200px",
                maxWidth: 280,
              }}
            >
              <ComboManaged
                label="Satuan"
                value={
                  itemForm.satuan
                }
                options={
                  combo.satuan
                }
                onChange={(v) =>
                  setItemField(
                    "satuan",
                    v
                  )
                }
                onOptions={(opts) =>
                  setComboOpts(
                    "satuan",
                    opts
                  )
                }
                placeholder="Pilih satuan…"
              />
            </div>

            <div
              style={{
                flex: "1 1 200px",
                maxWidth: 280,
              }}
            >
              <label
                style={labelStyle}
              >
                Harga satuan
              </label>

              <input
                type="number"
                value={
                  itemForm.hargaSatuan
                }
                onChange={(e) =>
                  setItemField(
                    "hargaSatuan",
                    e.target.value
                  )
                }
                placeholder="Rp"
                style={inputStyle}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent:
                "flex-end",
              gap: 8,
              marginTop: 16,
            }}
          >
            <Button
              variant="ghost"
              onClick={() => {
                setItemModalOpen(false);
                setEditingItem(null);
              }}
            >
              Batal
            </Button>

            <Button
              onClick={saveItem}
            >
              {editingItem
                ? "Simpan"
                : "Tambah"}
            </Button>
          </div>
        </Modal>

        {/* Modal Hapus */}
        {deleteConfirm && (
          <Modal
            open={!!deleteConfirm}
            onClose={() =>
              setDeleteConfirm(null)
            }
            title="Hapus data ini?"
            width={380}
          >
            <p
              style={{
                color: T.muted,
                fontSize: 13.5,
                marginBottom: 18,
                lineHeight: 1.6,
              }}
            >
              Baris{" "}
              <strong>
                {
                  deleteConfirm.uraian
                }
              </strong>{" "}
              akan dihapus permanen dari
              daftar.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent:
                  "flex-end",
                gap: 8,
              }}
            >
              <Button
                variant="ghost"
                onClick={() =>
                  setDeleteConfirm(null)
                }
              >
                Batal
              </Button>

              <Button
                variant="danger"
                icon={Trash2}
                onClick={() =>
                  doDeleteItem(
                    deleteConfirm
                  )
                }
              >
                Hapus
              </Button>
            </div>
          </Modal>
        )}
      </div>
    );
  }

  // =========================================================
  // STAGE KONFIRMASI
  // =========================================================

  if (stage === "konfirmasi") {
    return (
      <div>
        <PageHeader
          eyebrow="Cash Card"
          title="Detail CC"
        />

        <Card>
          <h3
            style={{
              fontFamily: font.display,
              fontSize: 16,
              marginBottom: 4,
            }}
          >
            Datanya udah bener?
          </h3>

          <p
            style={{
              color: T.muted,
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            Cek dulu ringkasan Cash Card,
            lalu bisa lanjut cetak 4 dokumen
            dari kartu "Cetak dokumen".
          </p>

          <div
            style={{
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              padding: "22px 26px",
              background: "#fff",
              maxWidth: 520,
              margin: "0 auto",
            }}
          >
            <div
              style={{
                textAlign: "center",
                fontWeight: 700,
                fontSize: 13.5,
                marginBottom: 2,
                color: T.heading,
                fontFamily: font.display,
              }}
            >
              CASH CARD
            </div>

            <div
              style={{
                textAlign: "center",
                color: T.muted,
                fontSize: 11,
                marginBottom: 16,
              }}
            >
              Submission ID{" "}
              {selectedCcId}
            </div>

            {[
              [
                "Judul CC",
                selectedCc?.judulCc,
              ],
              [
                "Nomor Pengajuan",
                form1.nomorPengajuan,
              ],
              [
                "Total keseluruhan",
                rupiah(
                  totalRealisasi
                ),
              ],
              [
                "Terbilang",
                toTerbilang(
                  totalRealisasi
                ),
              ],
            ].map(([label, val]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  gap: 14,
                  padding: "4px 0",
                  borderBottom: `1px dotted ${T.border}`,
                  fontSize: 12.5,
                }}
              >
                <span
                  style={{
                    color: T.muted,
                  }}
                >
                  {label}
                </span>

                <span
                  style={{
                    textAlign: "right",
                  }}
                >
                  {val || "-"}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              fontFamily: font.display,
              fontSize: 13,
              color: T.heading,
              fontWeight: 700,
              marginTop: 22,
              paddingTop: 18,
              borderTop: `1px solid ${T.border}`,
              marginBottom: 12,
            }}
          >
            Cetak dokumen
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
            }}
          >
            {Object.entries(
              DOC_LABELS
            ).map(([key, label]) => (
              <Button
                key={key}
                style={{
                  flex: "1 1 200px",
                  justifyContent:
                    "center",
                  padding: "14px",
                }}
                onClick={() =>
                  openPrintModal(key)
                }
              >
                {label}
              </Button>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              marginTop: 20,
            }}
          >
            <Button
              variant="ghost"
              icon={ArrowLeft}
              onClick={() =>
                setStage("form2")
              }
            >
              Tidak, edit lagi
            </Button>

            <Button
              onClick={() =>
                setStage("list")
              }
            >
              Ya, simpan
            </Button>
          </div>
        </Card>

        {renderPrintModal()}
      </div>
    );
  }

  // =========================================================
  // MODAL PRINT
  // =========================================================

  function renderPrintModal() {
    if (!printDoc) return null;

    const builtData =
      DOC_CONFIG[
        printDoc.key
      ].build();

    return (
      <Modal
        open={!!printDoc}
        onClose={() =>
          setPrintDoc(null)
        }
        title="Preview Dokumen"
        icon={Eye}
        width={600}
      >
        <p
          style={{
            color: T.muted,
            fontSize: 13,
            marginBottom: 16,
            lineHeight: 1.6,
          }}
        >
          Dokumen{" "}
          <strong>
            {
              DOC_LABELS[
                printDoc.key
              ]
            }
          </strong>{" "}
          akan dibuat dari data Detail CC
          saat ini dan diunduh setelah kamu
          klik tombol download.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent:
              "flex-start",
            gap: "10px 24px",
          }}
        >
          {Object.entries(
            builtData
          ).map(([key, value]) => {
            if (
              key === "items"
            ) {
              return null;
            }

            const displayValue =
              Array.isArray(value)
                ? value.join(
                    " | "
                  )
                : value;

            return (
              <div
                key={key}
                style={{
                  flex: "1 1 200px",
                  maxWidth: 320,
                  borderBottom: `1px solid ${T.border}`,
                  paddingBottom: 8,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: T.muted,
                    textTransform:
                      "uppercase",
                    letterSpacing: 0.4,
                  }}
                >
                  {key}
                </div>

                <div
                  style={{
                    fontSize: 13.5,
                    color: T.text,
                    fontWeight: 500,
                    marginTop: 2,
                  }}
                >
                  {displayValue ||
                    "-"}
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent:
              "flex-end",
            marginTop: 20,
          }}
        >
          <Button
            variant="ghost"
            onClick={() =>
              setPrintDoc(null)
            }
          >
            Batal
          </Button>

          <Button
            icon={FileText}
            onClick={
              downloadPrintDoc
            }
          >
            Download Word (.docx)
          </Button>
        </div>
      </Modal>
    );
  }

  // =========================================================
  // STAGE LIST
  // =========================================================

  return (
    <div>
      <PageHeader
        eyebrow="Cash Card"
        title="Detail CC"
        right={
          <Button
            icon={Plus}
            onClick={startForm1}
          >
            Tambah Penagihan
          </Button>
        }
      />

      <Card
        style={{
          marginBottom: 14,
        }}
      >
        <label style={labelStyle}>
          Cash Card aktif
        </label>

        <select
          value={selectedCcId}
          onChange={(e) =>
            setSelectedCcId(
              e.target.value
            )
          }
          style={{
            ...inputStyle,
            maxWidth: 480,
          }}
        >
          {ccList.map((r) => (
            <option
              key={r.id}
              value={r.id}
            >
              {r.id} -{" "}
              {r.judulCc ||
                "(belum ada judul)"}
            </option>
          ))}
        </select>
      </Card>

      <Card>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              position: "relative",
              flex: "1 1 200px",
              maxWidth: 280,
            }}
          >
            <Search
              size={13}
              style={{
                position:
                  "absolute",
                left: 10,
                top: "50%",
                transform:
                  "translateY(-50%)",
                color: T.muted,
              }}
            />

            <input
              placeholder="Cari uraian…"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding:
                  "8px 10px 8px 30px",
                borderRadius: 8,
                border: `1px solid ${T.border}`,
                background: T.bg,
                fontSize: 12.5,
                boxSizing:
                  "border-box",
                fontFamily: "inherit",
              }}
            />
          </div>
        </div>

        {displayItems.length ===
        0 ? (
          <EmptyState
            label="Belum ada baris penagihan untuk Cash Card ini."
            hint='Klik "Tambah Penagihan" untuk mulai isi Detail CC.'
          />
        ) : (
          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
                fontSize: 12.5,
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>
                    ID (baris)
                  </th>

                  <th style={thStyle}>
                    Tanggal
                  </th>

                  <th style={thStyle}>
                    Uraian
                  </th>

                  <th style={thStyle}>
                    Exp Type
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      textAlign:
                        "right",
                    }}
                  >
                    Jumlah
                  </th>

                  <th style={thStyle}>
                    Satuan
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      textAlign:
                        "right",
                    }}
                  >
                    Harga Satuan
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      textAlign:
                        "right",
                    }}
                  >
                    Total Harga
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      textAlign:
                        "center",
                    }}
                  >
                    Cetak
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      textAlign:
                        "center",
                    }}
                  >
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {displayItems.map(
                  (item, i) => (
                    <tr
                      key={item.id}
                      style={{
                        background:
                          i % 2 === 1
                            ? T.rowAlt
                            : undefined,
                      }}
                    >
                      <td
                        style={
                          tdStyle
                        }
                      >
                        <span
                          style={{
                            display:
                              "inline-flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            width: 22,
                            height: 22,
                            borderRadius: 6,
                            background:
                              T.bg,
                            border: `1px solid ${T.border}`,
                            fontWeight: 700,
                            color:
                              T.muted,
                            fontSize: 11,
                          }}
                        >
                          {i + 1}
                        </span>
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {item.tanggal ||
                          "-"}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {item.uraian}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {item.expType ||
                          "-"}
                      </td>

                      <td
                        style={
                          tdNumStyle
                        }
                      >
                        {item.jumlah ||
                          "-"}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {item.satuan ||
                          "-"}
                      </td>

                      <td
                        style={
                          tdNumStyle
                        }
                      >
                        {item.hargaSatuan
                          ? rupiah(
                              item.hargaSatuan
                            )
                          : "-"}
                      </td>

                      <td
                        style={
                          tdNumStyle
                        }
                      >
                        {rupiah(
                          totalHargaOf(
                            item
                          )
                        )}
                      </td>

                      <td
                        style={
                          tdCenterStyle
                        }
                      >
                        {printButtons(
                          item
                        )}
                      </td>

                      <td
                        style={
                          tdCenterStyle
                        }
                      >
                        <button
                          type="button"
                          title="Lihat"
                          onClick={() =>
                            setOverviewItem(
                              item
                            )
                          }
                          style={
                            iconBtnStyle
                          }
                        >
                          <Eye
                            size={12}
                          />
                        </button>

                        <button
                          type="button"
                          title="Edit"
                          onClick={() =>
                            openItemModal(
                              item
                            )
                          }
                          style={
                            iconBtnStyle
                          }
                        >
                          <Pencil
                            size={12}
                          />
                        </button>

                        <button
                          type="button"
                          title="Hapus"
                          onClick={() =>
                            setDeleteConfirm(
                              item
                            )
                          }
                          style={{
                            ...iconBtnStyle,
                            color:
                              T.danger,
                          }}
                        >
                          <Trash2
                            size={12}
                          />
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: 28,
            flexWrap: "wrap",
            background: T.blueSoft,
            border:
              "1px solid #BFE0EE",
            borderRadius: 10,
            padding: "14px 18px",
            margin: "14px 0 4px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10.5,
                textTransform:
                  "uppercase",
                letterSpacing: 0.4,
                color: T.navy,
                fontWeight: 700,
              }}
            >
              Jumlah baris
            </div>

            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: T.heading,
                marginTop: 2,
              }}
            >
              {itemsForCc.length}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 10.5,
                textTransform:
                  "uppercase",
                letterSpacing: 0.4,
                color: T.navy,
                fontWeight: 700,
              }}
            >
              Total Harga keseluruhan
            </div>

            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: T.heading,
                marginTop: 2,
              }}
            >
              {rupiah(
                totalRealisasi
              )}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 10.5,
                textTransform:
                  "uppercase",
                letterSpacing: 0.4,
                color: T.navy,
                fontWeight: 700,
              }}
            >
              Total Penggunaan Kas Kecil
            </div>

            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: T.heading,
                marginTop: 2,
              }}
            >
              {rupiah(
                totalRealisasi
              )}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 10.5,
                textTransform:
                  "uppercase",
                letterSpacing: 0.4,
                color: T.navy,
                fontWeight: 700,
              }}
            >
              Saldo Akhir
            </div>

            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: T.heading,
                marginTop: 2,
              }}
            >
              {rupiah(
                saldoAkhir
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* =====================================================
          MODAL TAMBAH / EDIT ITEM
          ===================================================== */}

      <Modal
        open={itemModalOpen}
        onClose={() => {
          setItemModalOpen(false);
          setEditingItem(null);
        }}
        title={
          editingItem
            ? "Edit Item Pengajuan"
            : "Tambah Item Pengajuan"
        }
        width={440}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px 18px",
          }}
        >
          <div
            style={{
              flex: "1 1 100%",
            }}
          >
            <label
              style={labelStyle}
            >
              Uraian
            </label>

            <input
              value={
                itemForm.uraian
              }
              onChange={(e) =>
                setItemField(
                  "uraian",
                  e.target.value
                )
              }
              placeholder="cth. Konsumsi kegiatan pelatihan…"
              style={inputStyle}
            />
          </div>

          <div
            style={{
              flex: "1 1 100%",
            }}
          >
            <ComboManaged
              label="Exp Type"
              value={
                itemForm.expType
              }
              options={
                combo.expType
              }
              onChange={(v) =>
                setItemField(
                  "expType",
                  v
                )
              }
              onOptions={(opts) =>
                setComboOpts(
                  "expType",
                  opts
                )
              }
              placeholder="Pilih Exp Type…"
            />
          </div>

          <div
            style={{
              flex: "1 1 200px",
              maxWidth: 280,
            }}
          >
            <label
              style={labelStyle}
            >
              Tanggal kegiatan
            </label>

            <DatePicker
              value={
                itemForm.tanggalKegiatan
              }
              onChange={(v) =>
                setItemField(
                  "tanggalKegiatan",
                  v
                )
              }
            />
          </div>

          <div
            style={{
              flex: "1 1 200px",
              maxWidth: 280,
            }}
          >
            <label
              style={labelStyle}
            >
              Jumlah
            </label>

            <input
              type="number"
              value={
                itemForm.jumlah
              }
              onChange={(e) =>
                setItemField(
                  "jumlah",
                  e.target.value
                )
              }
              style={inputStyle}
            />
          </div>

          <div
            style={{
              flex: "1 1 200px",
              maxWidth: 280,
            }}
          >
            <ComboManaged
              label="Satuan"
              value={
                itemForm.satuan
              }
              options={
                combo.satuan
              }
              onChange={(v) =>
                setItemField(
                  "satuan",
                  v
                )
              }
              onOptions={(opts) =>
                setComboOpts(
                  "satuan",
                  opts
                )
              }
              placeholder="Pilih satuan…"
            />
          </div>

          <div
            style={{
              flex: "1 1 200px",
              maxWidth: 280,
            }}
          >
            <label
              style={labelStyle}
            >
              Harga satuan
            </label>

            <input
              type="number"
              value={
                itemForm.hargaSatuan
              }
              onChange={(e) =>
                setItemField(
                  "hargaSatuan",
                  e.target.value
                )
              }
              placeholder="Rp"
              style={inputStyle}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent:
              "flex-end",
            gap: 8,
            marginTop: 16,
          }}
        >
          <Button
            variant="ghost"
            onClick={() => {
              setItemModalOpen(false);
              setEditingItem(null);
            }}
          >
            Batal
          </Button>

          <Button
            onClick={saveItem}
          >
            {editingItem
              ? "Simpan"
              : "Tambah"}
          </Button>
        </div>
      </Modal>

      {/* =====================================================
          MODAL OVERVIEW
          ===================================================== */}

      {overviewItem && (
        <Modal
          open={!!overviewItem}
          onClose={() =>
            setOverviewItem(null)
          }
          title="Overview Detail CC"
          width={560}
        >
          <div
            style={{
              fontFamily: font.display,
              fontSize: 13,
              color: T.heading,
              fontWeight: 700,
              marginBottom: 10,
            }}
          >
            Baris ini
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px 20px",
              marginBottom: 16,
            }}
          >
            {[
              [
                "Tanggal",
                overviewItem.tanggal,
              ],
              [
                "Submission ID",
                selectedCcId,
              ],
              [
                "Uraian",
                overviewItem.uraian,
              ],
              [
                "Exp Type",
                overviewItem.expType,
              ],
              [
                "Tanggal Kegiatan",
                overviewItem.tanggalKegiatan,
              ],
              [
                "Jumlah",
                overviewItem.jumlah,
              ],
              [
                "Satuan",
                overviewItem.satuan,
              ],
              [
                "Harga Satuan",
                overviewItem.hargaSatuan
                  ? rupiah(
                      overviewItem.hargaSatuan
                    )
                  : "-",
              ],
              [
                "Total Harga (otomatis)",
                rupiah(
                  totalHargaOf(
                    overviewItem
                  )
                ),
              ],
            ].map(
              ([label, val]) => (
                <div
                  key={label}
                  style={{
                    flex: "1 1 200px",
                    maxWidth: 320,
                    borderBottom: `1px solid ${T.border}`,
                    paddingBottom: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: T.muted,
                      textTransform:
                        "uppercase",
                      letterSpacing: 0.4,
                    }}
                  >
                    {label}
                  </div>

                  <div
                    style={{
                      fontSize: 13.5,
                      color: T.text,
                      fontWeight: 500,
                      marginTop: 2,
                    }}
                  >
                    {val || "-"}
                  </div>
                </div>
              )
            )}
          </div>

          <div
            style={{
              fontFamily: font.display,
              fontSize: 13,
              color: T.heading,
              fontWeight: 700,
              marginBottom: 10,
              paddingTop: 16,
              borderTop: `1px solid ${T.border}`,
            }}
          >
            Data Cash Card induk
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px 20px",
              marginBottom: 16,
            }}
          >
            {[
              [
                "Judul Cash Card",
                selectedCc?.judulCc,
              ],
              [
                "Bidang",
                selectedCc?.bidang,
              ],
              [
                "Saldo Kas Kecil",
                saldoKas
                  ? rupiah(
                      saldoKas
                    )
                  : "-",
              ],
              [
                "Total Penggunaan Kas Kecil (otomatis)",
                rupiah(
                  totalRealisasi
                ),
              ],
              [
                "Saldo Akhir (otomatis)",
                rupiah(
                  saldoAkhir
                ),
              ],
              [
                "Procost",
                selectedCc?.procost,
              ],
            ].map(
              ([label, val]) => (
                <div
                  key={label}
                  style={{
                    flex: "1 1 200px",
                    maxWidth: 320,
                    borderBottom: `1px solid ${T.border}`,
                    paddingBottom: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: T.muted,
                      textTransform:
                        "uppercase",
                      letterSpacing: 0.4,
                    }}
                  >
                    {label}
                  </div>

                  <div
                    style={{
                      fontSize: 13.5,
                      color: T.text,
                      fontWeight: 500,
                      marginTop: 2,
                    }}
                  >
                    {val || "-"}
                  </div>
                </div>
              )
            )}
          </div>

          <div
            style={{
              fontFamily: font.display,
              fontSize: 13,
              color: T.heading,
              fontWeight: 700,
              marginBottom: 10,
              paddingTop: 16,
              borderTop: `1px solid ${T.border}`,
            }}
          >
            Nomor &amp; dokumen
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px 20px",
            }}
          >
            {[
              [
                "Nomor Verifikasi",
                `${selectedCcId}/VER/CD/PRIOK/${new Date().getFullYear()}`,
              ],
              [
                "Terbilang Realisasi",
                toTerbilang(
                  totalRealisasi
                ),
              ],
              [
                "Nomor Pengajuan",
                selectedCc?.nomorPengajuan,
              ],
              [
                "Judul Pengajuan",
                selectedCc?.judulPengajuan,
              ],
              [
                "Nomor Permintaan Week CC",
                selectedCc?.nomorPermintaanWeek,
              ],
              [
                "Nomor Pertanggungjawaban Week CC",
                selectedCc?.nomorPertanggungjawabanWeek,
              ],
            ].map(
              ([label, val]) => (
                <div
                  key={label}
                  style={{
                    flex: "1 1 200px",
                    maxWidth: 320,
                    borderBottom: `1px solid ${T.border}`,
                    paddingBottom: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: T.muted,
                      textTransform:
                        "uppercase",
                      letterSpacing: 0.4,
                    }}
                  >
                    {label}
                  </div>

                  <div
                    style={{
                      fontSize: 13.5,
                      color: T.text,
                      fontWeight: 500,
                      marginTop: 2,
                    }}
                  >
                    {val || "-"}
                  </div>
                </div>
              )
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent:
                "flex-end",
              marginTop: 16,
            }}
          >
            <Button
              onClick={() =>
                setOverviewItem(null)
              }
            >
              Tutup
            </Button>
          </div>
        </Modal>
      )}

      {/* =====================================================
          MODAL HAPUS
          ===================================================== */}

      {deleteConfirm && (
        <Modal
          open={!!deleteConfirm}
          onClose={() =>
            setDeleteConfirm(null)
          }
          title="Hapus data ini?"
          width={380}
        >
          <p
            style={{
              color: T.muted,
              fontSize: 13.5,
              marginBottom: 18,
              lineHeight: 1.6,
            }}
          >
            Baris{" "}
            <strong>
              {
                deleteConfirm.uraian
              }
            </strong>{" "}
            akan dihapus permanen dari
            daftar.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent:
                "flex-end",
              gap: 8,
            }}
          >
            <Button
              variant="ghost"
              onClick={() =>
                setDeleteConfirm(null)
              }
            >
              Batal
            </Button>

            <Button
              variant="danger"
              icon={Trash2}
              onClick={() =>
                doDeleteItem(
                  deleteConfirm
                )
              }
            >
              Hapus
            </Button>
          </div>
        </Modal>
      )}

      {renderPrintModal()}
    </div>
  );
}