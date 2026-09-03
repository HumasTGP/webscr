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
  autoFromCc,
  bastFields,
  bastCcFields,
  laporanFields,
  paktaFields,
  paktaCcFields,
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
import TORPage from "./sakti/pages/TOR";
import VendorPage from "./sakti/pages/Vendor";
import HistoryPage from "./sakti/pages/History";
import Panduan from "./sakti/pages/Panduan";
import GenericWizard from "./sakti/pages/GenericWizard";
import { BastDocPreview, PaktaDocPreview } from "./components/DocTemplatePreview";
import ProposalRekapPage from "./sakti/pages/ProposalRekap";
import ProposalEvaluasiPage from "./sakti/pages/ProposalEvaluasi";
import PengelolaanKomunikasi from "./sakti/pages/PengelolaanKomunikasi";
import InboxPage from "./sakti/pages/Inbox";
import InboxEvaluasiPage from "./sakti/pages/InboxEvaluasi";
import InboxProposalPage from "./sakti/pages/InboxProposal";
import InboxPembayaranPage from "./sakti/pages/InboxPembayaran";
import AsmanDashboard from "./sakti/asman/pages/AsmanDashboard";
import MADMDashboard from "./sakti/madm/pages/MADMDashboard";
import PaketKasPage from "./sakti/pages/PaketKas";
import ManajemenAksesPage from "./sakti/pages/ManajemenAkses";
import LogAktivitasPage from "./sakti/pages/LogAktivitas";
import GandengDashboardPage from "./gandeng/pages/GandengDashboard";
import GandengTrackingPage from "./gandeng/pages/GandengTracking";
import DokumentasiPage from "./sakti/pages/Dokumentasi";
import DaftarHadirPage from "./sakti/pages/DaftarHadir";
import EvidenPage from "./sakti/pages/Eviden";
import BAPPPage from "./sakti/pages/BAPPPage";
import ChecklistDokumenPage from "./sakti/pages/ChecklistDokumen";
import FormVerifikasiPage from "./sakti/pages/FormVerifikasi";
import Lampiran1Page from "./sakti/pages/Lampiran1";
import Lampiran2Page from "./sakti/pages/Lampiran2";
import NonPoPage, { DEFAULT_COMBO } from "./sakti/pages/NonPoPage";
import CashCardPage, { DEFAULT_CC_COMBO } from "./sakti/pages/CashCard";
import DetailCCPage from "./sakti/pages/DetailCC";
import TtdSerahTerimaPage from "./sakti/pages/TtdSerahTerima";
import PoErpDataPage from "./sakti/pages/PoErpData";
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
    { idRab: "001", judul: "Bantuan Perbaikan Jalan Metro Marina Ancol", kategori: "NON PO",    status: DOC_STATUS.SUBMITTED },
    { idRab: "002", judul: "Fasilitasi Kegiatan Sinergi Kota Hijau",     kategori: "Cash Card", status: DOC_STATUS.APPROVED,  submittedAt: "2026-04-20T09:00:00Z", reviewedAt: "2026-04-21T10:00:00Z", reviewedBy: "asman" },
    { idRab: "003", judul: "Bantuan Rehabilitasi Mangrove Cilincing",    kategori: "NON PO",    status: DOC_STATUS.PROCESSED, submittedAt: "2026-03-15T09:00:00Z", reviewedAt: "2026-03-16T09:00:00Z", reviewedBy: "asman", processedAt: "2026-03-17T14:00:00Z", processedBy: "madm" },
  ];
  const seedSubDoc = (idField, judulField) =>
    PACKAGE_SEED.map((p) => ({
      [idField]: p.idRab,
      [judulField]: p.judul,
      kategori: p.kategori,
    }));
  const [rab, setRab] = useState(() =>
    PACKAGE_SEED.map((p) => ({
      idNumber: p.idRab, judulKegiatan: p.judul, kategori: p.kategori,
      tanggalRab: "2026-04-20", totalEvaluasi: 15000000,
    }))
  );
  const [tor, setTor] = useState(() => seedSubDoc("id", "judulKegiatan"));
  const [bast, setBast] = useState(() => seedSubDoc("id", "judulBantuan"));
  const [pakta, setPakta] = useState(() => seedSubDoc("id", "judulBantuan"));
  const [bapp, setBapp] = useState([]);
  const [lmp1List, setLmp1List] = useState([]);
  const [lmp2List, setLmp2List] = useState([]);
  const [formVerifList, setFormVerifList] = useState([]);
  const [dokumentasiDocs, setDokumentasiDocs] = useState([]);
  const [nonpoSubmissions, setNonpoSubmissions] = useState([]);
  const [nonpoCombo, setNonpoCombo] = useState(DEFAULT_COMBO);
  const [laporan, setLaporan] = useState([]);
  const [rka, setRka] = useState([]);

  // ===== Cash Card (berdiri sendiri, TIDAK terhubung ke RAB) =====
  // ccList  = header Cash Card (Judul CC, Bidang, Saldo Kas, Procost) + field
  //           Detail CC stage 1 (Nomor Pengajuan, Judul Pengajuan, No. Rekening,
  //           dst) - digabung di 1 record karena field2 itu 1:1 per Cash Card.
  // ccItems = baris Item Pengajuan/Penagihan Detail CC (banyak per ccList).
  // ccBast/ccPakta/ccBapp = sama polanya kayak NON PO/PO tapi sumber ID-nya dari
  //           ccList, bukan rab.
  // ccTtd   = TTD Serah Terima - berdiri sendiri, gak terhubung ke Cash Card manapun.
  const [ccList, setCcList] = useState([]);
  const [ccItems, setCcItems] = useState([]);
  const [ccBast, setCcBast] = useState([]);
  const [ccPakta, setCcPakta] = useState([]);
  const [ccBapp, setCcBapp] = useState([]);
  const [ccTtd, setCcTtd] = useState([]);
  const [ccCombo, setCcCombo] = useState(DEFAULT_CC_COMBO);

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
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(USERS_LS_KEY, JSON.stringify(users));
      }
    } catch (_) {}
  }, [users]);
  const authenticate = (role, uname, pw) => authenticateUser(users, role, uname, pw);

  const [packages, setPackages] = useState(() =>
    PACKAGE_SEED.map((p) => ({
      idRab: p.idRab, judul: p.judul, kategori: p.kategori,
      formEvaluasi: true,
      status: p.status,
      submittedAt: p.submittedAt || new Date().toISOString(),
      reviewedAt: p.reviewedAt || "", reviewedBy: p.reviewedBy || "",
      reviewNote: "",
      processedAt: p.processedAt || "", processedBy: p.processedBy || "",
    }))
  );
  const [vendors, setVendors] = useState(() => seed("VND", VENDOR_SEED));
  const [proposals, setProposals] = useState(() => seed("PRP", PROPOSAL_SEED));
  const [konten, setKonten] = useState(() => seed("KTN", KONTEN_SEED));
  const [komunikasiNarasumberOptions, setKomunikasiNarasumberOptions] = useState(OPT.komunikasiNarasumber);
  const [evaluasi, setEvaluasi] = useState([]);
  const [history, setHistory] = useState([]);
  const [mitraList, setMitraList] = useState(() => seed("MTR", MITRA_SEED));

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
        timestamp: now.toISOString(),
        username: user?.username || "-",
        role: user?.role || "-",
      },
      ...prev,
    ]);
  };

  const notify = (message, type = "success", jenis = null) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
    if (type === "success" && jenis) addHistory(jenis);
  };

  const updatePackage = (idRab, patch) => {
    setPackages((prev) => prev.map((p) => (p.idRab === idRab ? { ...p, ...patch } : p)));
  };
  const updateEvaluasi = (id, patch) => {
    setEvaluasi((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };
  const updateProposal = (id, patch) => {
    setProposals((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };
  const [paymentPackages, setPaymentPackages] = useState([]);
  const updatePaymentPackage = (id, patch) => {
    setPaymentPackages((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };
  const upsertPackage = (idRab, patch) => {
    setPackages((prev) => {
      const found = prev.some((p) => p.idRab === idRab);
      if (found) return prev.map((p) => (p.idRab === idRab ? { ...p, ...patch } : p));
      return [...prev, { idRab, ...patch }];
    });
  };

  const rabIdOptions = useMemo(() => rab.map((r) => r.idNumber), [rab]);
  // ID RAB yang sudah punya minimal 1 file dokumentasi terupload — dipakai
  // buat reminder "dokumentasi belum lengkap" di NON PO/PO/CC, bukan syarat wajib.
  const rabIdsWithDokumentasi = useMemo(
    () => new Set(dokumentasiDocs.map((d) => d.rabId)),
    [dokumentasiDocs]
  );

  // Data per kategori — dipakai buat 3 varian menu Pembayaran & Laporan
  // (NON PO / PO / Cash Card) yang masing-masing berdiri sendiri di sidebar.
  // RAB langsung masuk begitu disimpan (gak perlu nunggu ditandai "pelaksanaan
  // selesai" dulu di halaman Dokumentasi) — status dokumentasi cukup jadi
  // pengingat (lihat docByRabId / dokumentasiBelumLengkap), bukan syarat wajib.
  const rabByKategori = useMemo(() => {
    // Terbaru di atas (newest-first) — dipakai konsisten di semua daftar/pemilihan
    // RAB turunan (TOR, BAST, Lampiran 1/2, dst).
    const sorted = [...rab].sort((a, b) => new Date(b.tanggalInput || 0) - new Date(a.tanggalInput || 0));
    return {
      "NON PO": sorted.filter((r) => r.kategori === "NON PO"),
      "PO": sorted.filter((r) => r.kategori === "PO"),
      "Cash Card": sorted.filter((r) => r.kategori === "Cash Card"),
    };
  }, [rab]);
  const rabIdOptionsByKategori = useMemo(() => ({
    "NON PO": rabByKategori["NON PO"].map((r) => r.idNumber),
    "PO": rabByKategori["PO"].map((r) => r.idNumber),
    "Cash Card": rabByKategori["Cash Card"].map((r) => r.idNumber),
  }), [rabByKategori]);

  const handleBackToPortal = () => {
    setUser(null);
    setPortal(null);
  };

  const modules = useMemo(
    () => ({
      dashboard: (
        <Dashboard
          user={user}
          data={{ rab, tor, bast, pakta, laporan, proposals, konten, nonpoSubmissions }}
          packages={packages}
          goto={setActive}
        />
      ),
      "proposal-rekap": (
        <ProposalRekapPage
          proposals={proposals}
          setProposals={setProposals}
          notify={notify}
          comboProgram={nonpoCombo.program}
          setComboProgram={(opts) => setNonpoCombo((prev) => ({ ...prev, program: opts }))}
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
          narasumberOptions={komunikasiNarasumberOptions}
          setNarasumberOptions={setKomunikasiNarasumberOptions}
        />
      ),
      "mitra-overview": (
        <GandengDashboardPage
          mitraList={mitraList}
          user={{ ...user, isAdmin: true }}
          setMitraList={setMitraList}
          notify={notify}
          onGoto={(page) => { if (page === "tracking") setActive("mitra-tracking"); }}
        />
      ),
      "mitra-tracking": <GandengTrackingPage mitraList={mitraList} />,
      rab: <RABPage rab={rab} setRab={setRab} vendors={vendors} notify={notify} user={user} packages={packages} />,
      tor: <TORPage tor={tor} setTor={setTor} rab={rab} notify={notify} />,
      "nonpo-overview": (
        <NonPoPage
          rab={rabByKategori["NON PO"]}
          lmp1={lmp1List}
          lmp2={lmp2List}
          bast={bast.filter((b) => b.kategori === "NON PO")}
          pakta={pakta.filter((p) => p.kategori === "NON PO")}
          bapp={bapp.filter((b) => b.kategori === "NON PO")}
          formVerif={formVerifList}
          notify={notify}
          onNavigate={setActive}
          kategori="NON PO"
          submissions={nonpoSubmissions}
          setSubmissions={setNonpoSubmissions}
          combo={nonpoCombo}
          setCombo={setNonpoCombo}
          rabIdsWithDokumentasi={rabIdsWithDokumentasi}
        />
      ),
      "po-overview": (
        <NonPoPage
          rab={rabByKategori["PO"]}
          lmp1={lmp1List}
          lmp2={lmp2List}
          bast={bast.filter((b) => b.kategori === "PO")}
          pakta={pakta.filter((p) => p.kategori === "PO")}
          bapp={bapp.filter((b) => b.kategori === "PO")}
          formVerif={formVerifList}
          notify={notify}
          onNavigate={setActive}
          kategori="PO"
          submissions={nonpoSubmissions}
          setSubmissions={setNonpoSubmissions}
          combo={nonpoCombo}
          setCombo={setNonpoCombo}
          rabIdsWithDokumentasi={rabIdsWithDokumentasi}
        />
      ),
      // Cash Card berdiri sendiri - TIDAK pakai NonPoPage/rab lagi (beda dari
      // NON PO/PO di atas). Detail CC, BAST-CC, PI-CC, BAPP-CC semua sumber
      // datanya dari ccList, bukan rab.
      "cc-overview": (
        <CashCardPage
          ccList={ccList} setCcList={setCcList}
          ccItems={ccItems}
          ccBast={ccBast} ccPakta={ccPakta} ccBapp={ccBapp}
          combo={ccCombo} setCombo={setCcCombo}
          notify={notify}
          onNavigate={setActive}
        />
      ),
      "detail-cc": (
        <DetailCCPage
          ccList={ccList} setCcList={setCcList}
          ccItems={ccItems} setCcItems={setCcItems}
          combo={ccCombo} setCombo={setCcCombo}
          notify={notify}
        />
      ),
      "ttd-cc": (
        <TtdSerahTerimaPage ccTtd={ccTtd} setCcTtd={setCcTtd} notify={notify} />
      ),
      "laporan-nonpo": (
        <GenericWizard
          title="Laporan - NON PO"
          eyebrow="Modul Laporan"
          description="Laporan realisasi bantuan untuk pengajuan kategori NON PO."
          buildFields={laporanFields(rabIdOptionsByKategori["NON PO"])}
          idPrefix="LAP"
          autoFrom={{ key: "id", source: rab, map: autoFromRab.laporan }}
          list={laporan.filter((l) => l.kategori === "NON PO")}
          setList={setLaporan}
          notify={notify}
          pdfEnabled
          columns={[
            { key: "id", label: "ID Laporan" },
            { key: "namaBarang", label: "Nama Barang" },
            { key: "namaInstansiPenerima", label: "Instansi Penerima" },
          ]}
        />
      ),
      "laporan-po": (
        <GenericWizard
          title="Laporan - PO"
          eyebrow="Modul Laporan"
          description="Laporan realisasi bantuan untuk pengajuan kategori PO."
          buildFields={laporanFields(rabIdOptionsByKategori["PO"])}
          idPrefix="LAP"
          autoFrom={{ key: "id", source: rab, map: autoFromRab.laporan }}
          list={laporan.filter((l) => l.kategori === "PO")}
          setList={setLaporan}
          notify={notify}
          pdfEnabled
          columns={[
            { key: "id", label: "ID Laporan" },
            { key: "namaBarang", label: "Nama Barang" },
            { key: "namaInstansiPenerima", label: "Instansi Penerima" },
          ]}
        />
      ),
      rka: <RKAPage rka={rka} setRka={setRka} notify={notify} />,
      "rekap-anggaran": <RekapAnggaranPage rka={rka} rab={rab} laporan={laporan} />,
      vendor: (
        <VendorPage vendors={vendors} setVendors={setVendors} notify={notify} />
      ),
      inbox: (
        <InboxPage
          user={user}
          packages={packages}
          rab={rab} tor={tor} bast={bast} pakta={pakta}
          onUpdatePackage={updatePackage}
          notify={notify}
        />
      ),
      "inbox-evaluasi": (
        <InboxEvaluasiPage
          user={user}
          evaluasiList={evaluasi}
          onUpdateEvaluasi={updateEvaluasi}
          notify={notify}
        />
      ),
      "inbox-proposal": (
        <InboxProposalPage
          user={user}
          proposals={proposals}
          onUpdateProposal={updateProposal}
          notify={notify}
        />
      ),
      "inbox-pembayaran": (
        <InboxPembayaranPage
          user={user}
          paymentPackages={paymentPackages}
          onUpdatePackage={updatePaymentPackage}
          notify={notify}
        />
      ),
      "asman-dashboard": (
        <AsmanDashboard user={user} packages={packages} evaluasiList={evaluasi} goto={setActive} />
      ),
      "madm-dashboard": (
        <MADMDashboard user={user} packages={packages} evaluasiList={evaluasi} goto={setActive} />
      ),
      "paket-kas": (
        <PaketKasPage
          rab={rab} tor={tor} bast={bast} pakta={pakta}
          packages={packages}
          onUpsertPackage={upsertPackage}
          notify={notify}
          goto={setActive}
        />
      ),
      "user-mgmt": (
        <ManajemenAksesPage
          users={users}
          setUsers={setUsers}
          notify={notify}
        />
      ),
      "log-aktivitas": <LogAktivitasPage history={history} />,
      ...(() => {
        // Cash Card SENGAJA gak ikut loop ini lagi - BAST-CC/PI-CC/BAPP-CC punya
        // route sendiri di bawah (autoFrom dari ccList, bukan rab), karena Cash
        // Card sekarang berdiri sendiri dan gak punya LMP1/LMP2/Form Verifikasi.
        const kategoriList = [
          { suffix: "nonpo", kategori: "NON PO" },
          { suffix: "po", kategori: "PO" },
        ];
        const routes = {};
        kategoriList.forEach(({ suffix, kategori }) => {
          routes[`bast-${suffix}`] = (
            <GenericWizard
              title={`BAST - ${kategori}`}
              eyebrow="Modul BAST"
              description={`Berita Acara Serah Terima untuk pengajuan kategori ${kategori}.`}
              buildFields={bastFields(rabIdOptionsByKategori[kategori])}
              idPrefix="BAST"
              autoFrom={{ key: "id", source: rab, map: autoFromRab.bast }}
              list={bast.filter((b) => b.kategori === kategori)}
              setList={setBast}
              notify={notify}
              pdfEnabled
              docxTemplate={DOCX_TEMPLATES.bast}
              buildDocPreview={(v) => <BastDocPreview values={v} />}
              columns={[
                { key: "id", label: "ID" },
                { key: "nomor", label: "Nomor" },
                { key: "jumlahBantuan", label: "Jumlah Bantuan" },
              ]}
            />
          );
          routes[`pakta-${suffix}`] = (
            <GenericWizard
              title={`Pakta Integritas - ${kategori}`}
              eyebrow="Modul Pakta Integritas"
              description={`Pakta Integritas penerima bantuan untuk pengajuan kategori ${kategori}.`}
              buildFields={paktaFields(rabIdOptionsByKategori[kategori])}
              idPrefix="PI"
              autoFrom={{ key: "id", source: rab, map: autoFromRab.pakta }}
              list={pakta.filter((p) => p.kategori === kategori)}
              setList={setPakta}
              notify={notify}
              pdfEnabled
              docxTemplate={DOCX_TEMPLATES.pakta}
              buildDocPreview={(v) => <PaktaDocPreview values={v} />}
              columns={[
                { key: "id", label: "ID" },
                { key: "namaPenerima", label: "Nama Penerima" },
                { key: "lembagaPenerima", label: "Lembaga" },
              ]}
            />
          );
          routes[`bapp-${suffix}`] = (
            <BAPPPage
              rab={rabByKategori[kategori]}
              list={bapp.filter((b) => b.kategori === kategori)}
              setList={setBapp}
              notify={notify}
            />
          );
          routes[`form-verifikasi-${suffix}`] = (
            <FormVerifikasiPage rab={rabByKategori[kategori]} notify={notify} forms={formVerifList} setForms={setFormVerifList} />
          );
          routes[`lmp1-${suffix}`] = (
            <Lampiran1Page rab={rabByKategori[kategori]} notify={notify} list={lmp1List} setList={setLmp1List} />
          );
          routes[`lmp2-${suffix}`] = (
            <Lampiran2Page rab={rabByKategori[kategori]} notify={notify} list={lmp2List} setList={setLmp2List} lmp1List={lmp1List} />
          );
        });
        return routes;
      })(),
      // PO punya alur beda (lewat ERP) — BAST & BAPB-nya cukup dicatat ID-nya aja,
      // bukan dokumen lengkap kayak NON PO/CC.
      "bast-po": <PoErpDataPage rab={rabByKategori["PO"]} notify={notify} />,
      "bapp-po": <PoErpDataPage rab={rabByKategori["PO"]} notify={notify} />,
      // BAST-CC/PI-CC/BAPP-CC - Cash Card berdiri sendiri, ID-nya dari ccList
      // (bukan rab). Struktur wizard tetap sama polanya dengan NON PO/PO.
      "bast-cc": (
        <GenericWizard
          title="BAST - Cash Card"
          eyebrow="Modul BAST"
          description="Berita Acara Serah Terima untuk pengajuan Cash Card."
          buildFields={bastCcFields(ccList.map((r) => r.id), ccCombo.vendor)}
          idPrefix="BAST"
          autoFrom={{ key: "id", source: ccList, map: autoFromCc.bast }}
          list={ccBast}
          setList={setCcBast}
          notify={notify}
          pdfEnabled
          docxTemplate={DOCX_TEMPLATES.bast}
          buildDocPreview={(v) => <BastDocPreview values={v} />}
          columns={[
            { key: "id", label: "Submission ID" },
            { key: "nomor", label: "Nomor" },
            { key: "jumlahBantuan", label: "Jumlah Bantuan" },
          ]}
        />
      ),
      "pakta-cc": (
        <GenericWizard
          title="PI - Cash Card"
          eyebrow="Modul Pakta Integritas"
          description="Pakta Integritas penerima bantuan untuk pengajuan Cash Card."
          buildFields={paktaCcFields(ccList.map((r) => r.id), ccCombo.vendor)}
          idPrefix="PI"
          autoFrom={{ key: "id", source: ccList, map: autoFromCc.pakta }}
          list={ccPakta}
          setList={setCcPakta}
          notify={notify}
          pdfEnabled
          docxTemplate={DOCX_TEMPLATES.pakta}
          buildDocPreview={(v) => <PaktaDocPreview values={v} />}
          columns={[
            { key: "id", label: "Submission ID" },
            { key: "namaPenerima", label: "Nama Penerima" },
            { key: "namaMitra", label: "Nama Mitra" },
          ]}
        />
      ),
      "bapp-cc": (
        <BAPPPage
          rab={ccList}
          idKey="id"
          idLabel="Submission ID"
          list={ccBapp}
          setList={setCcBapp}
          notify={notify}
        />
      ),
      dokumentasi: <DokumentasiPage rab={rab} setRab={setRab} notify={notify} docs={dokumentasiDocs} setDocs={setDokumentasiDocs} />,
      "daftar-hadir": <DaftarHadirPage rab={rab} notify={notify} />,
      eviden: <EvidenPage rab={rab} notify={notify} />,
      "checklist-dokumen": <ChecklistDokumenPage rab={rab} tor={tor} bast={bast} pakta={pakta} notify={notify} paymentPackages={paymentPackages} setPaymentPackages={setPaymentPackages} />,
      "proposal-evaluasi-pembayaran": (
        <ProposalEvaluasiPage
          proposals={proposals}
          evaluasiList={evaluasi}
          setEvaluasiList={setEvaluasi}
          notify={notify}
        />
      ),
      history: <HistoryPage history={history} />,
      panduan: <Panduan data={{ rab, tor, bast, pakta, laporan, proposals }} goto={setActive} />,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      user,
      rab, tor, bast, pakta, bapp, lmp1List, lmp2List, laporan, vendors, history,
      proposals, konten, komunikasiNarasumberOptions, evaluasi, rabIdOptions, packages, users, rka,
      rabByKategori, rabIdOptionsByKategori, mitraList,
      nonpoSubmissions, formVerifList, nonpoCombo, dokumentasiDocs, rabIdsWithDokumentasi,
      paymentPackages,
      ccList, ccItems, ccBast, ccPakta, ccBapp, ccTtd, ccCombo,
    ]
  );

  if (!portal) {
    return <LandingGateway onSelect={setPortal} />;
  }

  if (portal === "silapak") {
    if (!silapakLoggedIn) {
      return (
        <SiLapakLogin
          authenticate={authenticate}
          onLogin={() => setSilapakLoggedIn(true)}
          onBack={() => setPortal(null)}
        />
      );
    }
    return (
      <SiLapakApp
        onLogout={() => {
          setSilapakLoggedIn(false);
          setPortal(null);
        }}
      />
    );
  }


  if (!user)
    return (
      <LoginScreen
        authenticate={authenticate}
        onBack={() => setPortal(null)}
        onLogin={(u) => {
          setUser(u);
          setActive(u.role === "humas" ? "dashboard" : u.role === "madm" ? "madm-dashboard" : "asman-dashboard");
        }}
      />
    );

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
        onBackToPortal={handleBackToPortal}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        themeMode={themeMode}
        onToggleTheme={() =>
          setThemeMode((m) => (m === "dark" ? "light" : "dark"))
        }
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
