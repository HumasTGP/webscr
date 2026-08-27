import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { T, font } from "../../lib/theme";
import { OPT } from "../../lib/data";
import { nextIdFor, uid } from "../../lib/utils";
import {
  bulanFromTanggal,
  kategoriMediaPrefixesFor,
  scoreForKategoriMedia,
} from "../../lib/utils";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import FlowSteps from "../../components/FlowSteps";
import EmptyState from "../../components/EmptyState";
import FieldInput from "../../components/FieldInput";
import { StatusBadge } from "../../components/Badge";

const SECTION_LABEL = {
  fontFamily: font.mono,
  fontSize: 11.5,
  letterSpacing: 0.6,
  textTransform: "uppercase",
  color: T.blue,
  fontWeight: 700,
};

const FIELD_LABEL = {
  display: "block",
  fontSize: 12.5,
  fontWeight: 600,
  color: T.text,
  marginBottom: 6,
};

function totalScoreOf(record) {
  return (record.publikasi || []).reduce(
    (sum, p) => sum + scoreForKategoriMedia(p.kategoriMedia),
    0
  );
}

function KpiCard({ value, sub }) {
  return (
    <div
      style={{
        background: T.bg,
        border: `1px solid ${T.border}`,
        borderRadius: 10,
        padding: "12px 14px",
      }}
    >
      <div style={{ fontFamily: font.display, fontSize: 20, color: T.heading, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 11.5, color: T.muted, marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function FilterSelect({ value, onChange, options, allLabel }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: "7px 10px",
        borderRadius: 999,
        border: `1px solid ${T.border}`,
        background: T.card,
        color: T.text,
        fontSize: 12.5,
        fontFamily: font.body,
      }}
    >
      <option value="Semua">{allLabel}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

function PublikasiBlock({ index, pub, onChange, onRemove, removable }) {
  const katOptions = useMemo(() => {
    const prefixes = kategoriMediaPrefixesFor(pub.mediaPemberitaan);
    return OPT.komunikasiKategoriMedia.filter((k) =>
      prefixes.some((p) => k.startsWith(p))
    );
  }, [pub.mediaPemberitaan]);

  const score = scoreForKategoriMedia(pub.kategoriMedia);

  const set = (key, val) => {
    const next = { ...pub, [key]: val };
    if (key === "mediaPemberitaan") {
      next.kategoriMedia = "";
      if (val !== "Social Media") next.jenisAkunMedsos = "";
    }
    onChange(next);
  };

  return (
    <Card style={{ marginTop: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <b style={{ fontSize: 13, color: T.heading }}>Publikasi {index + 1}</b>
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              border: "none",
              background: "transparent",
              color: T.danger,
              fontSize: 12,
              cursor: "pointer",
              padding: 0,
            }}
          >
            <Trash2 size={13} /> Hapus
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "14px 16px" }}>
        <div style={{ flex: "1 1 220px", maxWidth: 320 }}>
          <label style={FIELD_LABEL}>Media pemberitaan</label>
          <FieldInput
            field={{ type: "select", label: "media pemberitaan", options: OPT.komunikasiMediaPemberitaan }}
            value={pub.mediaPemberitaan}
            onChange={(v) => set("mediaPemberitaan", v)}
          />
        </div>

        {pub.mediaPemberitaan === "Social Media" && (
          <div style={{ flex: "1 1 220px", maxWidth: 320 }}>
            <label style={FIELD_LABEL}>Jenis akun medsos</label>
            <FieldInput
              field={{ type: "select", label: "jenis akun medsos", options: OPT.komunikasiJenisAkun }}
              value={pub.jenisAkunMedsos}
              onChange={(v) => set("jenisAkunMedsos", v)}
            />
          </div>
        )}

        <div style={{ flex: "1 1 220px", maxWidth: 320 }}>
          <label style={FIELD_LABEL}>Nama media</label>
          <FieldInput
            field={{ placeholder: "cth. @plnip.ubppriok atau nama media" }}
            value={pub.namaMedia}
            onChange={(v) => set("namaMedia", v)}
          />
        </div>

        <div style={{ flex: "1 1 100%" }}>
          <label style={FIELD_LABEL}>Link pemberitaan</label>
          <FieldInput
            field={{ placeholder: "https://…" }}
            value={pub.link}
            onChange={(v) => set("link", v)}
          />
        </div>

        <div style={{ flex: "1 1 220px", maxWidth: 320 }}>
          <label style={FIELD_LABEL}>Kategori media</label>
          <FieldInput
            field={{ type: "select", label: "kategori media", options: katOptions }}
            value={pub.kategoriMedia}
            onChange={(v) => set("kategoriMedia", v)}
          />
        </div>

        <div style={{ flex: "1 1 160px", maxWidth: 200 }}>
          <label style={FIELD_LABEL}>
            Nomor rilis{" "}
            <span style={{ fontWeight: 400, color: T.muted }}>(otomatis lanjut nomor)</span>
          </label>
          <FieldInput
            field={{ type: "number" }}
            value={pub.nomorRilis}
            onChange={(v) => set("nomorRilis", v)}
          />
        </div>

        <div style={{ flex: "1 1 100px", display: "flex", alignItems: "flex-end" }}>
          <span
            style={{
              background: T.blueSoft,
              color: T.blue,
              fontSize: 12,
              fontWeight: 700,
              padding: "6px 12px",
              borderRadius: 999,
            }}
          >
            Score {score}
          </span>
        </div>
      </div>
    </Card>
  );
}

export default function PengelolaanKomunikasi({ list, setList, notify }) {
  const [mode, setMode] = useState("list"); // list | wizard | detail
  const [step, setStep] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [values, setValues] = useState({});
  const [pubs, setPubs] = useState([]);
  const [detailId, setDetailId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [monthlyOpen, setMonthlyOpen] = useState(false);

  const [filters, setFilters] = useState({
    bulan: "Semua",
    kategori: "Semua",
    platform: "Semua",
    status: "Semua",
  });

  const bulanOptions = useMemo(() => {
    const set = new Set(list.map((r) => bulanFromTanggal(r.tanggal)).filter(Boolean));
    return Array.from(set);
  }, [list]);

  const suggestNomorRilis = () => {
    const all = list.flatMap((r) => r.publikasi || []).map((p) => Number(p.nomorRilis) || 0);
    return all.length ? Math.max(...all) + 1 : 1;
  };

  const blankPub = () => ({
    id: uid("PUB"),
    mediaPemberitaan: "Social Media",
    jenisAkunMedsos: "",
    namaMedia: "",
    link: "",
    kategoriMedia: "",
    nomorRilis: suggestNomorRilis(),
  });

  const startAdd = () => {
    setEditingId(null);
    setValues({ id: nextIdFor("KTN", list), tanggal: "", kategori: "", narasumber: "", judul: "", status: "Draft" });
    setPubs([blankPub()]);
    setStep(1);
    setMode("wizard");
  };

  const startEdit = (record) => {
    setEditingId(record.id);
    setValues({ ...record });
    setPubs((record.publikasi || []).map((p) => ({ ...p })));
    setStep(1);
    setMode("wizard");
  };

  const save = () => {
    const record = { ...values, id: values.id || nextIdFor("KTN", list), publikasi: pubs };
    setList((prev) =>
      editingId ? prev.map((r) => (r.id === editingId ? record : r)) : [...prev, record]
    );
    setEditingId(record.id);
    setStep(3);
    notify(
      `Data komunikasi berhasil ${editingId ? "diperbarui" : "disimpan"}!`,
      "success",
      "Pengelolaan Komunikasi"
    );
  };

  const requestDelete = (id) => setDeleteId(id);
  const confirmDelete = () => {
    setList((prev) => prev.filter((r) => r.id !== deleteId));
    if (detailId === deleteId) { setDetailId(null); setMode("list"); }
    notify("Data komunikasi berhasil dihapus.", "success", "Pengelolaan Komunikasi");
    setDeleteId(null);
  };

  const filteredList = useMemo(
    () =>
      list.filter((r) => {
        if (filters.status !== "Semua" && r.status !== filters.status) return false;
        if (filters.kategori !== "Semua" && r.kategori !== filters.kategori) return false;
        if (filters.bulan !== "Semua" && bulanFromTanggal(r.tanggal) !== filters.bulan) return false;
        if (
          filters.platform !== "Semua" &&
          !(r.publikasi || []).some((p) => p.mediaPemberitaan === filters.platform)
        ) return false;
        return true;
      }),
    [list, filters]
  );

  const monthlyStats = useMemo(() => {
    const rows = list;
    const totalKonten = rows.length;
    const pubAll = rows.flatMap((r) => r.publikasi || []);
    const totalPub = pubAll.length;
    const totalScore = rows.reduce((n, r) => n + totalScoreOf(r), 0);

    const tally = (arr) => {
      const m = {};
      arr.forEach((v) => { if (v) m[v] = (m[v] || 0) + 1; });
      return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => k);
    };
    const platformTerbanyak = tally(
      pubAll.map((p) => (p.mediaPemberitaan === "Social Media" ? p.jenisAkunMedsos : p.mediaPemberitaan))
    );
    const kategoriTerbanyak = tally(rows.map((r) => r.kategori));

    return { totalKonten, totalPub, totalScore, platformTerbanyak, kategoriTerbanyak };
  }, [list]);

  const detailRecord = list.find((r) => r.id === detailId);

  // ---------------- DETAIL ----------------
  if (mode === "detail" && detailRecord) {
    return (
      <div>
        <PageHeader
          eyebrow="Humas & Publikasi"
          title={detailRecord.judul || "(tanpa judul)"}
          right={
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="ghost" icon={ArrowLeft} onClick={() => setMode("list")}>
                Kembali ke daftar
              </Button>
              <Button variant="ghost" icon={Pencil} onClick={() => startEdit(detailRecord)}>
                Edit
              </Button>
              <Button variant="danger" icon={Trash2} onClick={() => requestDelete(detailRecord.id)}>
                Hapus
              </Button>
            </div>
          }
        />
        <Card>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 24px", marginBottom: 16 }}>
            {[
              ["Kategori", detailRecord.kategori],
              ["Narasumber", detailRecord.narasumber],
              ["Tanggal", detailRecord.tanggal],
              ["Bulan", bulanFromTanggal(detailRecord.tanggal)],
            ].map(([label, val]) => (
              <div key={label} style={{ flex: "1 1 160px", borderBottom: `1px solid ${T.border}`, paddingBottom: 8 }}>
                <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase" }}>{label}</div>
                <div style={{ fontSize: 13.5, fontWeight: 500, marginTop: 2 }}>{val || "-"}</div>
              </div>
            ))}
          </div>

          <div style={SECTION_LABEL}>Daftar publikasi</div>
          {(detailRecord.publikasi || []).map((p) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: `1px solid ${T.border}`,
                fontSize: 13,
              }}
            >
              <span>
                {p.mediaPemberitaan === "Social Media" ? p.jenisAkunMedsos : p.mediaPemberitaan}
                {p.namaMedia ? ` · ${p.namaMedia}` : ""} · {p.kategoriMedia || "-"} · No. rilis {p.nomorRilis ?? "-"}
              </span>
              <b style={{ color: T.blue }}>{scoreForKategoriMedia(p.kategoriMedia)}</b>
            </div>
          ))}

          <div style={{ marginTop: 16 }}>
            <KpiCard value={totalScoreOf(detailRecord)} sub="total score" />
          </div>
        </Card>

        <DeleteModal open={!!deleteId} onCancel={() => setDeleteId(null)} onConfirm={confirmDelete} />
      </div>
    );
  }

  // ---------------- WIZARD ----------------
  if (mode === "wizard") {
    const stepsLabels = ["Isi Formulir", "Konfirmasi", "Simpan"];
    const totalScore = pubs.reduce((n, p) => n + scoreForKategoriMedia(p.kategoriMedia), 0);

    return (
      <div>
        <PageHeader
          eyebrow={editingId ? "Edit Data" : "Tambah Data"}
          title="Pengelolaan Komunikasi"
          right={
            <Button variant="ghost" icon={ArrowLeft} onClick={() => setMode("list")}>
              Kembali ke daftar
            </Button>
          }
        />
        <FlowSteps steps={stepsLabels} current={step - 1} />

        {step === 1 && (
          <Card>
            <div style={SECTION_LABEL}>Section 1 - informasi konten</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "14px 16px", marginTop: 12 }}>
              <div style={{ flex: "1 1 220px", maxWidth: 320 }}>
                <label style={FIELD_LABEL}>Tanggal</label>
                <FieldInput
                  field={{ type: "date" }}
                  value={values.tanggal}
                  onChange={(v) => setValues({ ...values, tanggal: v })}
                />
              </div>
              <div style={{ flex: "1 1 220px", maxWidth: 320 }}>
                <label style={FIELD_LABEL}>
                  Bulan <span style={{ fontWeight: 400, color: T.muted }}>(otomatis)</span>
                </label>
                <FieldInput field={{ disabled: true }} value={bulanFromTanggal(values.tanggal)} onChange={() => {}} />
              </div>
              <div style={{ flex: "1 1 220px", maxWidth: 320 }}>
                <label style={FIELD_LABEL}>Kategori</label>
                <FieldInput
                  field={{ type: "select", label: "kategori", options: OPT.komunikasiKategori }}
                  value={values.kategori}
                  onChange={(v) => setValues({ ...values, kategori: v })}
                />
              </div>
              <div style={{ flex: "1 1 220px", maxWidth: 320 }}>
                <label style={FIELD_LABEL}>Narasumber</label>
                <FieldInput
                  field={{ type: "select", label: "narasumber", options: OPT.komunikasiNarasumber, allowManual: true }}
                  value={values.narasumber}
                  onChange={(v) => setValues({ ...values, narasumber: v })}
                />
              </div>
              <div style={{ flex: "1 1 100%" }}>
                <label style={FIELD_LABEL}>Judul pemberitaan</label>
                <FieldInput
                  field={{}}
                  value={values.judul}
                  onChange={(v) => setValues({ ...values, judul: v })}
                />
              </div>
              <div style={{ flex: "1 1 100%" }}>
                <label style={FIELD_LABEL}>
                  Lampiran / scan file{" "}
                  <span style={{ fontWeight: 400, color: T.muted }}>(opsional)</span>
                </label>
                <FieldInput
                  field={{ type: "file-upload" }}
                  value={values.lampiran}
                  onChange={(v) => setValues({ ...values, lampiran: v })}
                />
              </div>
              <div style={{ flex: "1 1 220px", maxWidth: 320 }}>
                <label style={FIELD_LABEL}>Status</label>
                <FieldInput
                  field={{ type: "select", label: "status", options: OPT.komunikasiStatus }}
                  value={values.status}
                  onChange={(v) => setValues({ ...values, status: v })}
                />
              </div>
            </div>

            <div style={{ ...SECTION_LABEL, marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Section 2 - publikasi</span>
              <Button variant="ghost" icon={Plus} onClick={() => setPubs([...pubs, blankPub()])}>
                Tambah publikasi
              </Button>
            </div>
            {pubs.map((p, i) => (
              <PublikasiBlock
                key={p.id}
                index={i}
                pub={p}
                removable={pubs.length > 1}
                onChange={(next) => setPubs(pubs.map((x) => (x.id === p.id ? next : x)))}
                onRemove={() => setPubs(pubs.filter((x) => x.id !== p.id))}
              />
            ))}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <Button onClick={() => setStep(2)}>
                Lanjutkan <ArrowRight size={15} />
              </Button>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <h3 style={{ fontFamily: font.display, fontSize: 16, marginBottom: 4 }}>
              Cek dulu sebelum disimpan
            </h3>
            <p style={{ color: T.muted, fontSize: 13, marginBottom: 16 }}>
              Tinjau semua data di bawah ini sebelum disimpan.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 24px", marginBottom: 16 }}>
              {[
                ["Tanggal", values.tanggal],
                ["Bulan", bulanFromTanggal(values.tanggal)],
                ["Kategori", values.kategori],
                ["Narasumber", values.narasumber],
                ["Status", values.status],
              ].map(([label, val]) => (
                <div key={label} style={{ flex: "1 1 160px", borderBottom: `1px solid ${T.border}`, paddingBottom: 8 }}>
                  <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase" }}>{label}</div>
                  <div style={{ fontSize: 13.5, fontWeight: 500, marginTop: 2 }}>{val || "-"}</div>
                </div>
              ))}
              <div style={{ flex: "1 1 100%", borderBottom: `1px solid ${T.border}`, paddingBottom: 8 }}>
                <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase" }}>Judul pemberitaan</div>
                <div style={{ fontSize: 13.5, fontWeight: 500, marginTop: 2 }}>{values.judul || "-"}</div>
              </div>
            </div>

            {pubs.map((p, i) => (
              <Card key={p.id} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: T.blue, fontWeight: 700, marginBottom: 6 }}>
                  Publikasi {i + 1}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px" }}>
                  {[
                    ["Media pemberitaan", p.mediaPemberitaan],
                    p.mediaPemberitaan === "Social Media" ? ["Jenis akun medsos", p.jenisAkunMedsos] : null,
                    ["Nama media", p.namaMedia],
                    ["Link", p.link],
                    ["Kategori media", p.kategoriMedia],
                    ["Nomor rilis", p.nomorRilis],
                  ].filter(Boolean).map(([label, val]) => (
                    <div key={label} style={{ flex: "1 1 160px" }}>
                      <div style={{ fontSize: 10.5, color: T.muted, textTransform: "uppercase" }}>{label}</div>
                      <div style={{ fontSize: 13 }}>{val || "-"}</div>
                    </div>
                  ))}
                  <div style={{ flex: "0 0 auto", alignSelf: "flex-end" }}>
                    <span style={{ background: T.blueSoft, color: T.blue, fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 999 }}>
                      Score {scoreForKategoriMedia(p.kategoriMedia)}
                    </span>
                  </div>
                </div>
              </Card>
            ))}

            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <KpiCard value={pubs.length} sub="jumlah publikasi" />
              <KpiCard value={totalScore} sub="total score" />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Button variant="ghost" icon={ArrowLeft} onClick={() => setStep(1)}>
                Tidak, edit lagi
              </Button>
              <Button onClick={save}>
                Simpan data <ArrowRight size={15} />
              </Button>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card style={{ textAlign: "center", padding: "40px 20px" }}>
            <div
              style={{
                width: 48, height: 48, borderRadius: "50%", background: T.successSoft,
                display: "grid", placeItems: "center", margin: "0 auto 14px",
              }}
            >
              <Check size={24} color={T.success} />
            </div>
            <h3 style={{ fontFamily: font.display, fontSize: 16, marginBottom: 4 }}>
              Data berhasil disimpan
            </h3>
            <p style={{ color: T.muted, fontSize: 13, marginBottom: 20 }}>
              {pubs.length} publikasi · Total score {totalScore}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <Button variant="ghost" onClick={() => setMode("list")}>
                Kembali ke daftar
              </Button>
              <Button onClick={() => { setDetailId(editingId); setMode("detail"); }}>
                Lihat detail
              </Button>
            </div>
          </Card>
        )}

        <DeleteModal open={!!deleteId} onCancel={() => setDeleteId(null)} onConfirm={confirmDelete} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Humas & Publikasi"
        title="Pengelolaan Komunikasi"
        description="Monitoring pemberitaan media terkait PLN IP UBP Priok. Satu konten bisa punya beberapa publikasi di media berbeda. Klik salah satu baris untuk melihat detail atau mengubah data."
        right={<Button icon={Plus} onClick={startAdd}>Tambah Data</Button>}
      />

      <Card style={{ marginBottom: 14 }}>
        <div
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
          onClick={() => setMonthlyOpen((v) => !v)}
        >
          <span style={{ fontSize: 13.5, fontWeight: 600, color: T.heading }}>Ringkasan bulanan</span>
          <ChevronDown size={16} color={T.muted} style={{ transform: monthlyOpen ? "rotate(180deg)" : "none" }} />
        </div>
        {monthlyOpen && (
          <div style={{ marginTop: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 14 }}>
              {[
                { value: monthlyStats.totalKonten, label: "Total Konten", color: T.blue },
                { value: monthlyStats.totalPub, label: "Total Publikasi", color: "#0A7A5A" },
                { value: monthlyStats.totalScore, label: "Total Score", color: "#8B5CF6" },
              ].map((kpi) => (
                <div key={kpi.label} style={{
                  background: T.bg, border: `1px solid ${T.border}`, borderRadius: 10,
                  padding: "16px 18px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: kpi.color, textTransform: "uppercase", letterSpacing: 0.5 }}>{kpi.label}</div>
                  <div style={{ fontFamily: font.display, fontSize: 28, fontWeight: 700, color: T.heading, lineHeight: 1 }}>{kpi.value}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 200px", background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ fontSize: 11, color: T.muted, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Platform terbanyak</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: T.heading }}>{monthlyStats.platformTerbanyak.join(", ") || "-"}</div>
              </div>
              <div style={{ flex: "1 1 200px", background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ fontSize: 11, color: T.muted, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Kategori terbanyak</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: T.heading }}>{monthlyStats.kategoriTerbanyak.join(", ") || "-"}</div>
              </div>
            </div>
          </div>
        )}
      </Card>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        <FilterSelect value={filters.bulan} onChange={(v) => setFilters({ ...filters, bulan: v })} options={bulanOptions} allLabel="Bulan: semua" />
        <FilterSelect value={filters.kategori} onChange={(v) => setFilters({ ...filters, kategori: v })} options={OPT.komunikasiKategori} allLabel="Kategori: semua" />
        <FilterSelect value={filters.platform} onChange={(v) => setFilters({ ...filters, platform: v })} options={OPT.komunikasiMediaPemberitaan} allLabel="Platform: semua" />
        <FilterSelect value={filters.status} onChange={(v) => setFilters({ ...filters, status: v })} options={OPT.komunikasiStatus} allLabel="Status: semua" />
      </div>

      <Card padded={false}>
        {!filteredList.length ? (
          <EmptyState label="Belum ada data yang cocok." />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead>
                <tr>
                  {["Tanggal", "Judul", "Kategori", "Narasumber", "Jml Publikasi", "Score", "Status", ""].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left", padding: "11px 16px", background: T.bg,
                        borderBottom: `1px solid ${T.border}`, color: T.muted,
                        fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredList.map((r, i) => (
                  <tr
                    key={r.id}
                    onClick={() => { setDetailId(r.id); setMode("detail"); }}
                    style={{ cursor: "pointer", background: i % 2 ? T.rowAlt : T.card }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = T.blueSoft)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 ? T.rowAlt : T.card)}
                  >
                    <td style={{ padding: "13px 16px", borderBottom: `1px solid ${T.border}`, whiteSpace: "nowrap" }}>{r.tanggal || "-"}</td>
                    <td style={{ padding: "13px 16px", borderBottom: `1px solid ${T.border}` }}>{r.judul || "(tanpa judul)"}</td>
                    <td style={{ padding: "13px 16px", borderBottom: `1px solid ${T.border}` }}>{r.kategori || "-"}</td>
                    <td style={{ padding: "13px 16px", borderBottom: `1px solid ${T.border}` }}>{r.narasumber || "-"}</td>
                    <td style={{ padding: "13px 16px", borderBottom: `1px solid ${T.border}` }}>{(r.publikasi || []).length}</td>
                    <td style={{ padding: "13px 16px", borderBottom: `1px solid ${T.border}` }}>{totalScoreOf(r)}</td>
                    <td style={{ padding: "13px 16px", borderBottom: `1px solid ${T.border}` }}>
                      <StatusBadge value={r.status} />
                    </td>
                    <td style={{ padding: "13px 16px", borderBottom: `1px solid ${T.border}`, whiteSpace: "nowrap" }}>
                      <span
                        role="button"
                        title="edit"
                        onClick={(e) => { e.stopPropagation(); startEdit(r); }}
                        style={{ marginRight: 12, color: T.muted, cursor: "pointer" }}
                      >
                        <Pencil size={15} />
                      </span>
                      <span
                        role="button"
                        title="hapus"
                        onClick={(e) => { e.stopPropagation(); requestDelete(r.id); }}
                        style={{ color: T.muted, cursor: "pointer" }}
                      >
                        <Trash2 size={15} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <DeleteModal open={!!deleteId} onCancel={() => setDeleteId(null)} onConfirm={confirmDelete} />
    </div>
  );
}

function DeleteModal({ open, onCancel, onConfirm }) {
  return (
    <Modal open={open} onClose={onCancel} title="Hapus Data?" icon={AlertTriangle} tone="danger">
      <p style={{ color: T.muted, fontSize: 13.5, marginBottom: 20, lineHeight: 1.6 }}>
        Data ini akan dihapus permanen dari daftar Pengelolaan Komunikasi.
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <Button variant="ghost" onClick={onCancel}>Batal</Button>
        <Button variant="danger" icon={Trash2} onClick={onConfirm}>Hapus</Button>
      </div>
    </Modal>
  );
}
