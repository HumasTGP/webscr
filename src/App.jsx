import { useEffect, useMemo, useState } from "react";
import { T, font, setTheme } from "./lib/theme";
import {
  KONTEN_SEED,
  MENU,
  OPT,
  PROPOSAL_SEED,
  VENDOR_SEED,
} from "./lib/data";
import { uid } from "./lib/utils";
import { formatTanggalPanjang } from "./lib/docxGenerate";
import {
  autoFromRab,
  bastFields,
  laporanFields,
  paktaFields,
  torFields,
} from "./lib/wizardFields";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import HelpModal from "./components/HelpModal";
import Toast from "./components/Toast";

import LandingGateway from "./pages/LandingGateway";
import SilapakLogin from "./pages/SilapakLogin";
import SilapakApp from "./pages/SilapakApp";
import LoginScreen from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RabPage from "./pages/Rab";
import VendorPage from "./pages/Vendor";
import HistoryPage from "./pages/History";
import Panduan from "./pages/Panduan";
import GenericWizard from "./pages/GenericWizard";
import { TorDocPreview, BastDocPreview, PaktaDocPreview } from "./components/DocTemplatePreview";
import ProposalRekapPage from "./pages/ProposalRekap";
import ProposalEvaluasiPage from "./pages/ProposalEvaluasi";
import PengelolaanKomunikasi from "./pages/PengelolaanKomunikasi";

const seed = (prefix, rows) =>
  rows.map((v, i) => ({
    ...v,
    id: `${prefix}-${String(i + 1).padStart(3, "0")}`,
  }));

// Pisah textarea multi-baris jadi array butir (untuk list TUJUAN/SASARAN di TOR).
const splitLines = (s) =>
  String(s || "")
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);

// Tanggal "YYYY-MM-DD" -> "Selasa, 20 April 2026" (dengan nama hari).
const tanggalDenganHari = (iso) => {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// Mapping data wizard -> placeholder di masing-masing template .docx.
const DOCX_TEMPLATES = {
  tor: {
    url: "/templates/Template_TOR.docx",
    buildData: (r) => ({
      judulProgramRKA: r.judulProgramRKA || "",
      judulKegiatan: r.judulKegiatan || "",
      latarBelakang: r.latarBelakang || "",
      tujuanUmum: r.tujuanUmum || "",
      tujuanKhususList: splitLines(r.tujuanKhusus),
      sasaranList: splitLines(r.sasaran),
      hariTanggal: tanggalDenganHari(r.hariTanggal) || r.hariTanggal || "",
      tempat: r.tempat || "",
      narasumber: r.narasumber || "-",
    }),
  },
  bast: {
    url: "/templates/Template_BAST.docx",
    buildData: (r) => ({
      nomor: r.nomor || "",
      judulBantuan: r.judulBantuan || "",
      tanggal: formatTanggalPanjang(r.tanggal) || r.tanggal || "",
      namaPihakKedua: r.namaPihakKedua || "",
      jabatanPihakKedua: r.jabatanPihakKedua || "",
      instansiPihakKedua: r.instansiPihakKedua || "",
    }),
  },
  pakta: {
    url: "/templates/Template_Pakta_Integritas.docx",
    buildData: (r) => ({
      judulKegiatan: r.judulBantuan || "",
      tanggalPi: formatTanggalPanjang(r.tanggalPi) || r.tanggalPi || "",
      namaPenerima: r.namaPenerima || "",
    }),
  },
};

export default function App() {
  // Lapisan gateway paling luar: null = belum memilih layanan,
  // "sikas" = alur SIKAS existing di bawah ini (tidak diubah),
  // "silapak" = modul Si Lapak Priok yang baru, sepenuhnya terpisah.
  const [portal, setPortal] = useState(null);
  const [silapakLoggedIn, setSilapakLoggedIn] = useState(false);

  const [user, setUser] = useState(null);
  const [active, setActive] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [toast, setToast] = useState(null);
  const [helpOpen, setHelpOpen] = useState(false);

  const [themeMode, setThemeMode] = useState("light");
  useEffect(() => setTheme(themeMode), [themeMode]);

  useEffect(() => {
    const applyResponsive = () => setCollapsed(window.innerWidth < 860);
    applyResponsive();
    window.addEventListener("resize", applyResponsive);
    return () => window.removeEventListener("resize", applyResponsive);
  }, []);

  const [rab, setRab] = useState([]);
  const [tor, setTor] = useState([]);
  const [bast, setBast] = useState([]);
  const [pakta, setPakta] = useState([]);
  const [laporan, setLaporan] = useState([]);
  const [vendors, setVendors] = useState(() => seed("VND", VENDOR_SEED));
  const [proposals, setProposals] = useState(() => seed("PRP", PROPOSAL_SEED));
  const [konten, setKonten] = useState(() => seed("KTN", KONTEN_SEED));
  const [evaluasi, setEvaluasi] = useState([]);
  const [history, setHistory] = useState([]);

  const addHistory = (jenis) => {
    const now = new Date();
    setHistory((prev) => [
      {
        id: uid("HIS"),
        jenis,
        tanggal: now.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
        waktu: now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      },
      ...prev,
    ]);
  };

  const notify = (message, type = "success", jenis = null) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
    if (type === "success" && jenis) addHistory(jenis);
  };

  const rabIdOptions = useMemo(() => rab.map((r) => r.idNumber), [rab]);

  const modules = useMemo(
    () => ({
      dashboard: (
        <Dashboard
          user={user}
          data={{ rab, tor, bast, laporan, proposals, konten }}
          goto={setActive}
        />
      ),
      "proposal-rekap": (
        <ProposalRekapPage
          proposals={proposals}
          setProposals={setProposals}
          notify={notify}
        />
      ),
      "proposal-evaluasi": (
        <ProposalEvaluasiPage
          proposals={proposals}
          evaluasiList={evaluasi}
          setEvaluasiList={setEvaluasi}
          notify={notify}
        />
      ),
      konten: (
        <PengelolaanKomunikasi
          list={konten}
          setList={setKonten}
          notify={notify}
        />
      ),
      rab: <RabPage rab={rab} setRab={setRab} vendors={vendors} notify={notify} />,
      tor: (
        <GenericWizard
          title="TOR"
          eyebrow="Modul TOR"
          description="Term of Reference kegiatan, dirujuk dari ID RAB."
          buildFields={torFields(rabIdOptions)}
          idPrefix="TOR"
          autoFrom={{ key: "id", source: rab, map: autoFromRab.tor }}
          list={tor}
          setList={setTor}
          notify={notify}
          pdfEnabled
          docxTemplate={DOCX_TEMPLATES.tor}
          buildDocPreview={(v) => <TorDocPreview values={v} />}
          columns={[
            { key: "id", label: "ID TOR" },
            { key: "kategori", label: "Kategori" },
            { key: "judulKegiatan", label: "Judul Kegiatan" },
            { key: "tempat", label: "Tempat" },
            { key: "hariTanggal", label: "Tanggal" },
          ]}
        />
      ),
      bast: (
        <GenericWizard
          title="BAST"
          eyebrow="Modul BAST"
          description="Berita Acara Serah Terima. Kategori (NON PO / Cash Card) otomatis mengikuti ID RAB yang dipilih."
          buildFields={bastFields(rabIdOptions)}
          idPrefix="BAST"
          autoFrom={{ key: "id", source: rab, map: autoFromRab.bast }}
          list={bast}
          setList={setBast}
          notify={notify}
          pdfEnabled
          docxTemplate={DOCX_TEMPLATES.bast}
          buildDocPreview={(v) => <BastDocPreview values={v} />}
          columns={[
            { key: "id", label: "ID" },
            { key: "kategori", label: "Kategori" },
            { key: "nomor", label: "Nomor" },
            { key: "jumlahBantuan", label: "Jumlah Bantuan" },
          ]}
        />
      ),
      pakta: (
        <GenericWizard
          title="Pakta Integritas"
          eyebrow="Modul Pakta Integritas"
          description="Pakta Integritas penerima bantuan. Kategori (NON PO / Cash Card) otomatis mengikuti ID RAB yang dipilih."
          buildFields={paktaFields(rabIdOptions)}
          idPrefix="PI"
          autoFrom={{ key: "id", source: rab, map: autoFromRab.pakta }}
          list={pakta}
          setList={setPakta}
          notify={notify}
          pdfEnabled
          docxTemplate={DOCX_TEMPLATES.pakta}
          buildDocPreview={(v) => <PaktaDocPreview values={v} />}
          columns={[
            { key: "id", label: "ID" },
            { key: "kategori", label: "Kategori" },
            { key: "namaPenerima", label: "Nama Penerima" },
            { key: "lembagaPenerima", label: "Lembaga" },
          ]}
        />
      ),
      laporan: (
        <GenericWizard
          title="Laporan"
          eyebrow="Modul Laporan"
          description="Laporan realisasi bantuan, CC atau NON PO."
          opsiOptions={["Laporan CC", "Laporan NON PO"]}
          opsiLabel="Opsi: Laporan CC / Laporan NON PO"
          confirmOpsi
          buildFields={laporanFields(rabIdOptions)}
          idPrefix="LAP"
          autoFrom={{ key: "id", source: rab, map: autoFromRab.laporan }}
          list={laporan}
          setList={setLaporan}
          notify={notify}
          pdfEnabled
          columns={[
            { key: "id", label: "ID Laporan" },
            { key: "opsi", label: "Jenis" },
            { key: "namaBarang", label: "Nama Barang" },
            { key: "namaInstansiPenerima", label: "Instansi Penerima" },
          ]}
        />
      ),
      vendor: (
        <VendorPage vendors={vendors} setVendors={setVendors} notify={notify} />
      ),
      history: <HistoryPage history={history} />,
      panduan: <Panduan />,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      user,
      rab, tor, bast, pakta, laporan, vendors, history,
      proposals, konten, evaluasi, rabIdOptions,
    ]
  );

  // Gate 1: pilih layanan (tidak menyentuh apa pun di bawahnya).
  if (!portal) {
    return <LandingGateway onSelect={setPortal} />;
  }

  // Gate 2a: modul Si Lapak Priok, sepenuhnya terpisah dari SIKAS.
  if (portal === "silapak") {
    if (!silapakLoggedIn) {
      return (
        <SilapakLogin
          onLogin={() => setSilapakLoggedIn(true)}
          onBack={() => setPortal(null)}
        />
      );
    }
    return (
      <SilapakApp
        onLogout={() => {
          setSilapakLoggedIn(false);
          setPortal(null);
        }}
      />
    );
  }

  // Gate 2b: SIKAS existing, tidak diubah sama sekali.
  if (!user) return <LoginScreen onLogin={setUser} />;

  const activeLabel = MENU.find((m) => m.key === active)?.label || "";

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: T.bg,
        fontFamily: font.body,
        color: T.text,
      }}
    >
      <Sidebar
        active={active}
        onSelect={setActive}
        user={user}
        onLogout={() => setUser(null)}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        <Topbar
          activeLabel={activeLabel}
          user={user}
          onHelpClick={() => setHelpOpen(true)}
          themeMode={themeMode}
          onToggleTheme={() =>
            setThemeMode((m) => (m === "dark" ? "light" : "dark"))
          }
        />
        <div
          key={active}
          className="app-content"
          style={{
            width: "100%",
            maxWidth: 1240,
            margin: "0 auto",
            animation: "fade-in .2s ease",
          }}
        >
          {modules[active]}
        </div>
      </div>
      <Toast toast={toast} />
      <HelpModal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        onGotoPanduan={() => setActive("panduan")}
      />
    </div>
  );
}