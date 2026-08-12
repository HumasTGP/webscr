import { useEffect, useMemo, useState } from "react";
import { T, font, setTheme } from "./lib/theme";
import {
  KONTEN_SEED,
  MENU,
  OPT,
  PROPOSAL_SEED,
  VENDOR_SEED,
  MITRA_SEED,
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

import Sidebar from "./sakti/components/Sidebar";
import Topbar from "./sakti/components/Topbar";
import HelpModal from "./components/HelpModal";
import Toast from "./components/Toast";

import LandingGateway from "./portal/pages/LandingGateway";
import SiLapakLogin from "./si-lapak-priok/pages/SiLapakLogin";
import SiLapakApp from "./si-lapak-priok/pages/SiLapakApp";
import LoginScreen from "./sakti/pages/Login";
import Dashboard from "./sakti/pages/Dashboard";
import RABPage from "./sakti/pages/RAB";
import VendorPage from "./sakti/pages/Vendor";
import HistoryPage from "./sakti/pages/History";
import Panduan from "./sakti/pages/Panduan";
import GenericWizard from "./sakti/pages/GenericWizard";
import { TorDocPreview, BastDocPreview, PaktaDocPreview } from "./components/DocTemplatePreview";
import ProposalRekapPage from "./sakti/pages/ProposalRekap";
import ProposalEvaluasiPage from "./sakti/pages/ProposalEvaluasi";
import PengelolaanKomunikasi from "./sakti/pages/PengelolaanKomunikasi";
import InboxPage from "./sakti/pages/Inbox";
import InboxEvaluasiPage from "./sakti/pages/InboxEvaluasi";
import AsmanDashboard from "./sakti/asman/pages/AsmanDashboard";
import MADMDashboard from "./sakti/madm/pages/MADMDashboard";
import PaketKasPage from "./sakti/pages/PaketKas";
import ManajemenAksesPage from "./sakti/pages/ManajemenAkses";
import PengajuanGandengPage from "./gandeng/pages/PengajuanGandeng";
import GandengLogin from "./gandeng/pages/GandengLogin";
import GandengApp from "./gandeng/pages/GandengApp";
import DokumentasiPage from "./sakti/pages/Dokumentasi";
import DaftarHadirPage from "./sakti/pages/DaftarHadir";
import EvidenPage from "./sakti/pages/Eviden";
import BAPPPage from "./sakti/pages/BAPPPage";
import ChecklistDokumenPage from "./sakti/pages/ChecklistDokumen";
import FormVerifikasiPage from "./sakti/pages/FormVerifikasi";
import Lampiran1Page from "./sakti/pages/Lampiran1";
import Lampiran2Page from "./sakti/pages/Lampiran2";
import RKAPage from "./sakti/pages/RKAPage";
import RekapAnggaranPage from "./sakti/pages/RekapAnggaranPage";
import { DEFAULT_USERS, DOC_STATUS, authenticateUser } from "./lib/data";

const seed = (prefix, rows) =>
  rows.map((v, i) => ({
    ...v,
    id: `${prefix}-${String(i + 1).padStart(3, "0")}`,
  }));

const splitLines = (s) =>
  String(s || "")
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);

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
  const [portal, setPortal] = useState(null);
  const [silapakLoggedIn, setSilapakLoggedIn] = useState(false);
  const [mitraLoggedIn, setMitraLoggedIn] = useState(false);
  const [mitraUser, setMitraUser] = useState(null);

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

  const PACKAGE_SEED = [
    { idRab: "RAB-2026-001", judul: "Bantuan Perbaikan Jalan Metro Marina Ancol", kategori: "NON PO", status: DOC_STATUS.SUBMITTED },
    { idRab: "RAB-2026-002", judul: "Fasilitasi Kegiatan Sinergi Kota Hijau", kategori: "Cash Card", status: DOC_STATUS.APPROVED, submittedAt: "2026-04-20T09:00:00Z", reviewedAt: "2026-04-21T10:00:00Z", reviewedBy: "asman" },
    { idRab: "RAB-2026-003", judul: "Bantuan Rehabilitasi Mangrove Cilincing", kategori: "NON PO", status: DOC_STATUS.PROCESSED, submittedAt: "2026-03-15T09:00:00Z", reviewedAt: "2026-03-16T09:00:00Z", reviewedBy: "asman", processedAt: "2026-03-17T14:00:00Z", processedBy: "madm" },
  ];
  const seedSubDoc = (idField, judulField) => PACKAGE_SEED.map((p) => ({ [idField]: p.idRab, [judulField]: p.judul, kategori: p.kategori }));
  const [rab, setRab] = useState(() => PACKAGE_SEED.map((p) => ({ idNumber: p.idRab, judulKegiatan: p.judul, kategori: p.kategori, tanggalRab: "2026-04-20", totalEvaluasi: 15000000 })));
  const [tor, setTor] = useState(() => seedSubDoc("id", "judulKegiatan"));
  const [bast, setBast] = useState(() => seedSubDoc("id", "judulBantuan"));
  const [pakta, setPakta] = useState(() => seedSubDoc("id", "judulBantuan"));
  const [bapp, setBapp] = useState([]);
  const [laporan, setLaporan] = useState([]);
  const [rka, setRka] = useState([]);

  const USERS_LS_KEY = "sikas.users.v1";
  const [users, setUsers] = useState(() => {
    try {
      const raw = typeof window !== "undefined" && window.localStorage.getItem(USERS_LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return DEFAULT_USERS;
  });
  useEffect(() => {
    try { if (typeof window !== "undefined") window.localStorage.setItem(USERS_LS_KEY, JSON.stringify(users)); } catch (_) {}
  }, [users]);
  const authenticate = (role, uname, pw) => authenticateUser(users, role, uname, pw);

  const [packages, setPackages] = useState(() => PACKAGE_SEED.map((p) => ({ idRab: p.idRab, judul: p.judul, kategori: p.kategori, formEvaluasi: true, status: p.status, submittedAt: p.submittedAt || new Date().toISOString(), reviewedAt: p.reviewedAt || "", reviewedBy: p.reviewedBy || "", reviewNote: "", processedAt: p.processedAt || "", processedBy: p.processedBy || "" })));
  const [vendors, setVendors] = useState(() => seed("VND", VENDOR_SEED));
  const [proposals, setProposals] = useState(() => seed("PRP", PROPOSAL_SEED));
  const [konten, setKonten] = useState(() => seed("KTN", KONTEN_SEED));
  const [evaluasi, setEvaluasi] = useState([]);
  const [history, setHistory] = useState([]);
  const [mitraList, setMitraList] = useState(() => seed("MTR", MITRA_SEED));

  const addHistory = (jenis) => {
    const now = new Date();
    setHistory((prev) => [{ id: uid("HIS"), jenis, tanggal: now.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }), waktu: now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) }, ...prev]);
  };
  const notify = (message, type = "success", jenis = null) => { setToast({ message, type }); setTimeout(() => setToast(null), 3200); if (type === "success" && jenis) addHistory(jenis); };
  const updatePackage = (idRab, patch) => setPackages((prev) => prev.map((p) => (p.idRab === idRab ? { ...p, ...patch } : p)));
  const updateEvaluasi = (id, patch) => setEvaluasi((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  const upsertPackage = (idRab, patch) => setPackages((prev) => prev.some((p) => p.idRab === idRab) ? prev.map((p) => (p.idRab === idRab ? { ...p, ...patch } : p)) : [...prev, { idRab, ...patch }]);
  const rabIdOptions = useMemo(() => rab.map((r) => r.idNumber), [rab]);
  const rabByKategori = useMemo(() => ({ "NON PO": rab.filter((r) => r.kategori === "NON PO"), "PO": rab.filter((r) => r.kategori === "PO"), "Cash Card": rab.filter((r) => r.kategori === "Cash Card") }), [rab]);
  const rabIdOptionsByKategori = useMemo(() => ({ "NON PO": rabByKategori["NON PO"].map((r) => r.idNumber), "PO": rabByKategori["PO"].map((r) => r.idNumber), "Cash Card": rabByKategori["Cash Card"].map((r) => r.idNumber) }), [rabByKategori]);

  const handleBackToPortal = () => { setUser(null); setPortal(null); };

  const modules = useMemo(() => ({
    dashboard: <Dashboard user={user} data={{ rab, tor, bast, pakta, laporan, proposals, konten }} goto={setActive} />,
    "proposal-rekap": <ProposalRekapPage proposals={proposals} setProposals={setProposals} notify={notify} />,
    "proposal-evaluasi": <ProposalEvaluasiPage proposals={proposals} evaluasiList={evaluasi} setEvaluasiList={setEvaluasi} notify={notify} />,
    konten: <PengelolaanKomunikasi list={konten} setList={setKonten} notify={notify} />,
    rab: <RABPage rab={rab} setRab={setRab} vendors={vendors} notify={notify} />,
    "kategori-npo": <RABPage rab={rab} setRab={setRab} vendors={vendors} notify={notify} defaultKategori="NON PO" />,
    "kategori-po": <RABPage rab={rab} setRab={setRab} vendors={vendors} notify={notify} defaultKategori="PO" />,
    "kategori-cc": <RABPage rab={rab} setRab={setRab} vendors={vendors} notify={notify} defaultKategori="Cash Card" />,
    tor: <GenericWizard title="TOR" eyebrow="Modul TOR" description="Term of Reference kegiatan, dirujuk dari ID RAB." buildFields={torFields(rabIdOptions)} idPrefix="TOR" autoFrom={{ key: "id", source: rab, map: autoFromRab.tor }} list={tor} setList={setTor} notify={notify} pdfEnabled docxTemplate={DOCX_TEMPLATES.tor} />,
    bast: <GenericWizard title="BAST" eyebrow="Modul BAST" description="Berita Acara Serah Terima kegiatan." buildFields={bastFields(rabIdOptions)} idPrefix="BAST" autoFrom={{ key: "id", source: rab, map: autoFromRab.bast }} list={bast} setList={setBast} notify={notify} pdfEnabled docxTemplate={DOCX_TEMPLATES.bast} DocPreview={BastDocPreview} />,
    pakta: <GenericWizard title="Pakta Integritas" eyebrow="Modul Pakta Integritas" description="Dokumen pakta integritas kegiatan." buildFields={paktaFields(rabIdOptions)} idPrefix="PI" autoFrom={{ key: "id", source: rab, map: autoFromRab.pakta }} list={pakta} setList={setPakta} notify={notify} pdfEnabled docxTemplate={DOCX_TEMPLATES.pakta} DocPreview={PaktaDocPreview} />,
    bapp: <BAPPPage rab={rab} list={bapp} setList={setBapp} notify={notify} />,
    laporan: <GenericWizard title="Laporan" eyebrow="Modul Laporan" description="Laporan pelaksanaan kegiatan." buildFields={laporanFields(rabIdOptions)} idPrefix="LAP" list={laporan} setList={setLaporan} notify={notify} />,
    vendor: <VendorPage vendors={vendors} setVendors={setVendors} notify={notify} />,
    history: <HistoryPage history={history} />,
    panduan: <Panduan />,
    "proposal-inbox": <InboxPage proposals={proposals} setProposals={setProposals} user={user} notify={notify} />,
    "inbox-evaluasi": <InboxEvaluasiPage packages={packages} updatePackage={updatePackage} evaluasi={evaluasi} updateEvaluasi={updateEvaluasi} user={user} notify={notify} />,
    "asman-dashboard": <AsmanDashboard packages={packages} proposals={proposals} />,
    "madm-dashboard": <MADMDashboard packages={packages} proposals={proposals} />,
    "paket-kas": <PaketKasPage packages={packages} updatePackage={updatePackage} upsertPackage={upsertPackage} notify={notify} />,
    "manajemen-akses": <ManajemenAksesPage users={users} setUsers={setUsers} notify={notify} />,
    dokumentasi: <DokumentasiPage rab={rab} notify={notify} />,
    "daftar-hadir": <DaftarHadirPage rab={rab} notify={notify} />,
    eviden: <EvidenPage rab={rab} notify={notify} />,
    checklist: <ChecklistDokumenPage rab={rab} notify={notify} />,
    verifikasi: <FormVerifikasiPage rab={rab} notify={notify} />,
    "lampiran-1": <Lampiran1Page rab={rab} notify={notify} />,
    "lampiran-2": <Lampiran2Page rab={rab} notify={notify} />,
    rka: <RKAPage rka={rka} setRka={setRka} notify={notify} />,
    "rekap-anggaran": <RekapAnggaranPage rab={rab} />,
  }), [user, rab, tor, bast, pakta, bapp, laporan, vendors, history, proposals, konten, evaluasi, rabIdOptions, packages, users, rka, rabByKategori, rabIdOptionsByKategori]);

  if (!portal) return <LandingGateway onSelect={setPortal} />;
  if (portal === "silapak") {
    if (!silapakLoggedIn) return <SiLapakLogin authenticate={authenticate} onLogin={() => setSilapakLoggedIn(true)} onBack={() => setPortal(null)} />;
    return <SiLapakApp onLogout={() => { setSilapakLoggedIn(false); setPortal(null); }} />;
  }
  if (portal === "mitra") {
    if (!mitraLoggedIn) return <GandengLogin authenticate={authenticate} onLogin={(u) => { setMitraUser(u); setMitraLoggedIn(true); }} onBack={() => setPortal(null)} />;
    return <><GandengApp mitraList={mitraList} setMitraList={setMitraList} notify={notify} user={mitraUser} onLogout={() => { setMitraLoggedIn(false); setMitraUser(null); setPortal(null); }} /><Toast toast={toast} /></>;
  }
  if (!user) return <LoginScreen authenticate={authenticate} onBack={() => setPortal(null)} onLogin={(u) => { setUser(u); setActive(u.role === "humas" ? "dashboard" : u.role === "madm" ? "madm-dashboard" : "asman-dashboard"); }} />;

  const activeLabel = MENU.find((m) => m.key === active)?.label || "";
  return <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:T.bg, fontFamily:font.body, color:T.text }}>
    <Sidebar active={active} onSelect={setActive} user={user} onLogout={() => setUser(null)} onBackToPortal={handleBackToPortal} collapsed={collapsed} setCollapsed={setCollapsed} themeMode={themeMode} onToggleTheme={() => setThemeMode((m) => (m === "dark" ? "light" : "dark"))} />
    <div style={{ flex:1, minWidth:0, height:"100vh", display:"flex", flexDirection:"column", overflowY:"auto" }}>
      <Topbar activeLabel={activeLabel} user={user} onHelpClick={() => setHelpOpen(true)} themeMode={themeMode} onToggleTheme={() => setThemeMode((m) => (m === "dark" ? "light" : "dark"))} />
      <div key={active} className="app-content" style={{ width:"100%", maxWidth:1240, margin:"0 auto", animation:"fade-in .2s ease" }}>{modules[active]}</div>
    </div>
    <Toast toast={toast} />
    <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} onGotoPanduan={() => setActive("panduan")} />
  </div>;
}
