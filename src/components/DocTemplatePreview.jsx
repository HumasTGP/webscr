import { rupiah } from "../lib/utils";

const splitLines = (s) =>
  String(s || "").split(/\r?\n/).map((x) => x.trim()).filter(Boolean);

const pageStyle = {
  background: "#fff",
  color: "#111",
  fontFamily: "'Times New Roman', Times, serif",
  fontSize: 11,
  lineHeight: 1.55,
  padding: "22px 26px",
  border: "1px solid #ccc",
  borderRadius: 4,
  maxHeight: 420,
  overflowY: "auto",
};

const CtrBold = ({ size = 12, children }) => (
  <div style={{ textAlign: "center", fontWeight: 700, fontSize: size, marginBottom: 3 }}>
    {children}
  </div>
);

const SecTitle = ({ children }) => (
  <div style={{
    fontWeight: 700, fontSize: 10.5, textAlign: "center",
    textDecoration: "underline", textTransform: "uppercase",
    marginTop: 12, marginBottom: 5,
  }}>
    {children}
  </div>
);

const Row = ({ label, value, w = 130 }) => (
  <tr>
    <td style={{ width: w, paddingBottom: 2, color: "#444", fontSize: 10, verticalAlign: "top" }}>{label}</td>
    <td style={{ paddingBottom: 2, fontSize: 10, verticalAlign: "top" }}>: {value || "-"}</td>
  </tr>
);

export function TorDocPreview({ values }) {
  const tujuanKhusus = splitLines(values.tujuanKhusus);
  const sasaran = splitLines(values.sasaran);
  const latar = splitLines(values.latarBelakang);

  return (
    <div style={pageStyle}>
      <CtrBold size={13}>RINGKASAN KEGIATAN</CtrBold>
      <CtrBold size={11}>{values.judulKegiatan || "-"}</CtrBold>

      <SecTitle>Latar Belakang</SecTitle>
      {latar.length
        ? latar.map((l, i) => (
            <p key={i} style={{ textAlign: "justify", margin: "0 0 4px" }}>{l}</p>
          ))
        : <p style={{ color: "#aaa", margin: 0 }}>-</p>}

      <SecTitle>Tujuan</SecTitle>
      <div style={{ marginBottom: 4 }}>
        <div style={{ fontWeight: 600, marginBottom: 2 }}>a. Tujuan Umum</div>
        <p style={{ textAlign: "justify", margin: "0 0 6px", paddingLeft: 12 }}>
          {values.tujuanUmum || "-"}
        </p>
        <div style={{ fontWeight: 600, marginBottom: 2 }}>b. Tujuan Khusus</div>
        {tujuanKhusus.length ? (
          <ul style={{ margin: "0 0 0 4px", paddingLeft: 24 }}>
            {tujuanKhusus.map((t, i) => (
              <li key={i} style={{ marginBottom: 2 }}>{t}</li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "#aaa", margin: 0, paddingLeft: 12 }}>-</p>
        )}
      </div>

      <SecTitle>Sasaran</SecTitle>
      {sasaran.length ? (
        <ul style={{ margin: "0 0 0 4px", paddingLeft: 24 }}>
          {sasaran.map((s, i) => <li key={i} style={{ marginBottom: 2 }}>{s}</li>)}
        </ul>
      ) : (
        <p style={{ color: "#aaa", margin: 0 }}>-</p>
      )}

      <SecTitle>Rencana Kegiatan</SecTitle>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <Row label="a. Hari/Tanggal" value={values.hariTanggal} />
          <Row label="b. Tempat" value={values.tempat} />
          <Row label="c. Narasumber" value={values.narasumber} />
        </tbody>
      </table>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 26 }}>
        <tbody>
          <tr>
            <td style={{ width: "50%", textAlign: "center", fontSize: 10.5, paddingBottom: 2 }}>Pembuat</td>
            <td style={{ width: "50%", textAlign: "center", fontSize: 10.5, paddingBottom: 2 }}>Menyetujui</td>
          </tr>
          <tr>
            <td style={{ textAlign: "center", fontSize: 10.5, paddingBottom: 46 }}>Officer Community Development</td>
            <td style={{ textAlign: "center", fontSize: 10.5, paddingBottom: 46 }}>Assistant Manager KAS</td>
          </tr>
          <tr>
            <td style={{ textAlign: "center", fontSize: 10.5 }}>Wahyu Andrias</td>
            <td style={{ textAlign: "center", fontSize: 10.5 }}>Astri Oktavina</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function BastDocPreview({ values }) {
  return (
    <div style={pageStyle}>
      <CtrBold size={13}>BERITA ACARA SERAH TERIMA</CtrBold>
      <div style={{ textAlign: "center", fontSize: 10, marginBottom: 10 }}>
        Nomor: {values.nomor || "-"}
      </div>

      <CtrBold size={11}>Tentang</CtrBold>
      <CtrBold size={11}>{values.judulBantuan || "-"}</CtrBold>

      <p style={{ margin: "10px 0 4px" }}>
        Pada hari ini : Jakarta, <b>{values.tanggal || "-"}</b>
      </p>
      <p style={{ margin: "4px 0" }}>Dengan ini kami,</p>
      <p style={{ margin: "4px 0 4px 16px" }}>
        <b>Astri Oktavina</b> : Selaku Assistant Manager KAS PT PLN INDONESIA POWER UBP PRIOK.
        Selanjutnya disebut: Pihak Pertama.
      </p>
      <p style={{ margin: "4px 0 4px 16px" }}>
        <b>{values.namaPihakKedua || "-"}</b> : Selaku {values.jabatanPihakKedua || "-"} yang
        berkedudukan di {values.instansiPihakKedua || "-"}. Selanjutnya disebut: Pihak Kedua.
      </p>
      <p style={{ margin: "8px 0 4px", textAlign: "justify" }}>
        Pihak Pertama memberikan bantuan <b>{values.judulBantuan || "-"}</b> berupa fasilitasi
        kegiatan sebagai bentuk dukungan program sosial perusahaan.
      </p>
      <p style={{ margin: "4px 0 12px", textAlign: "justify" }}>
        Pihak Kedua sepenuhnya bertanggung jawab untuk melaksanakan kegiatan sebagaimana yang
        diusulkan kepada Pihak Pertama sesuai dengan tujuan pemberian bantuan.
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
        <div style={{ textAlign: "center" }}>
          <div>PT PLN INDONESIA POWER UBP PRIOK</div>
          <div>Assistant Manager KAS</div>
          <div style={{ height: 30 }} />
          <div><b>Astri Oktavina</b></div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div>MITRA BINAAN {values.instansiPihakKedua || "-"}</div>
          <div>{values.jabatanPihakKedua || "-"}</div>
          <div style={{ height: 30 }} />
          <div><b>{values.namaPihakKedua || "-"}</b></div>
        </div>
      </div>
    </div>
  );
}

export function PaktaDocPreview({ values }) {
  return (
    <div style={pageStyle}>
      <CtrBold size={13}>PAKTA INTEGRITAS</CtrBold>
      <CtrBold size={11}>MITRA PT PLN INDONESIA POWER</CtrBold>

      <p style={{ margin: "10px 0 4px", textAlign: "justify" }}>
        Dengan Rahmat Tuhan Yang Maha Kuasa.
      </p>
      <p style={{ margin: "4px 0 6px", textAlign: "justify" }}>
        Kami yang bertandatangan dibawah ini menyatakan bahwa kami sebagai Mitra PT PLN Indonesia
        Power UBP Priok pada kegiatan <b>{values.judulKegiatan || "-"}</b>, akan:
      </p>
      <ol style={{ margin: "0 0 8px", paddingLeft: 20, fontSize: 10 }}>
        <li style={{ marginBottom: 2 }}>
          Berperan secara pro aktif dalam upaya pencegahan dan pemberantasan Korupsi, Kolusi dan
          Nepotisme serta tidak melibatkan diri dalam perbuatan tercela.
        </li>
        <li style={{ marginBottom: 2 }}>
          Turut serta mendukung dan melaksanakan Prinsip 4 NO's yang berlaku di PT PLN Indonesia Power.
        </li>
        <li style={{ marginBottom: 2 }}>Bersikap jujur, objektif, transparan dan akuntabel.</li>
        <li style={{ marginBottom: 2 }}>
          Menghindari konflik kepentingan dalam menjalankan kewajiban dan tanggung jawab kami.
        </li>
        <li style={{ marginBottom: 2 }}>
          Siap memberikan informasi apabila mengetahui adanya indikasi perbuatan curang maupun KKN.
        </li>
        <li style={{ marginBottom: 2 }}>
          Mendukung penerapan SNI ISO 37001:2016 Sistem Manajemen Anti Penyuapan (SMAP) di PT PLN Indonesia Power.
        </li>
      </ol>
      <p style={{ textAlign: "justify", margin: "4px 0 14px" }}>
        Demikian Pernyataan ini kami buat sebagai bentuk integritas selaku Mitra PT PLN Indonesia
        Power UBP PRIOK.
      </p>
      <div style={{ textAlign: "center" }}>
        <div>Jakarta, {values.tanggalPi || "-"}</div>
        <div style={{ marginTop: 4, marginBottom: 30 }}>PENERIMA DANA FASILITAS</div>
        <div style={{ fontWeight: 700 }}>{values.namaPenerima || "-"}</div>
      </div>
    </div>
  );
}

// Preview RAB mengikuti susunan Template_RAB.docx persis: header ID/Tanggal/
// Judul, tabel item dengan kolom Usulan & Evaluasi berdampingan (Qty/Harga
// Satuan/Jumlah tiap sisi), baris ringkasan Jumlah/PPN/Jumlah+PPN per sisi,
// lalu TTD Menyetujui (MADM) & Dibuat Oleh (ASMAN KAS). Field-field di sini
// SENGAJA mengikuti nama asli dari state RAB.jsx (hargaSatuanVendor,
// totalVendor, dst - hasil hitungan itemTotals()), bukan nama generik,
// supaya preview = persis apa yang bakal ada di file yang diunduh.
export function RabDocPreview({ values, madm, asmanKas }) {
  const items = values.items || [];
  const totalVendor = values.totalVendor ?? items.reduce((s, r) => s + (r.totalVendor || 0), 0);
  const totalEvaluasiVendor = values.totalEvaluasiVendor ?? items.reduce((s, r) => s + (r.totalEvaluasiVendor || 0), 0);
  const jumlahVendor = items.reduce((s, r) => s + (r.baseVendor || 0), 0);
  const jumlahEvaluasiVendor = items.reduce((s, r) => s + (r.baseEvaluasiVendor || 0), 0);
  const ppnVendor = items.reduce((s, r) => s + (r.ppnNilaiVendor || 0), 0);
  const ppnEvaluasiVendor = items.reduce((s, r) => s + (r.ppnNilaiEvaluasiVendor || 0), 0);

  return (
    <div style={pageStyle}>
      <CtrBold size={13}>RENCANA ANGGARAN BIAYA</CtrBold>
      <CtrBold size={11}>{values.judulKegiatan || "-"}</CtrBold>

      <table style={{ width: "100%", borderCollapse: "collapse", margin: "10px 0 8px" }}>
        <tbody>
          <Row label="ID Number" value={values.idNumber} />
          <Row label="Tanggal RAB" value={values.tanggalRab} />
        </tbody>
      </table>

      {items.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 9 }}>
          <thead>
            <tr style={{ background: "#e8e8e8" }}>
              <th rowSpan={2} style={thTd}>Uraian</th>
              <th rowSpan={2} style={thTd}>Satuan</th>
              <th colSpan={3} style={thTd}>Usulan</th>
              <th colSpan={3} style={thTd}>Evaluasi</th>
            </tr>
            <tr style={{ background: "#e8e8e8" }}>
              <th style={thTd}>Qty</th>
              <th style={thTd}>Harga Satuan</th>
              <th style={thTd}>Jumlah</th>
              <th style={thTd}>Qty</th>
              <th style={thTd}>Harga Satuan</th>
              <th style={thTd}>Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.id || i}>
                <td style={thTd}>{item.uraian || "-"}</td>
                <td style={thTd}>{item.satuan || "-"}</td>
                <td style={thTd}>{item.qty || "-"}</td>
                <td style={{ ...thTd, textAlign: "right" }}>{rupiah(item.hargaSatuanVendor || 0)}</td>
                <td style={{ ...thTd, textAlign: "right", fontWeight: 700 }}>{rupiah(item.totalVendor || 0)}</td>
                <td style={thTd}>{item.qtyEvaluasi || "-"}</td>
                <td style={{ ...thTd, textAlign: "right" }}>{rupiah(item.hargaSatuanEvaluasiVendor || 0)}</td>
                <td style={{ ...thTd, textAlign: "right", fontWeight: 700 }}>{rupiah(item.totalEvaluasiVendor || 0)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            {[
              { label: "Jumlah", u: jumlahVendor, e: jumlahEvaluasiVendor },
              { label: "PPN", u: ppnVendor, e: ppnEvaluasiVendor },
              { label: "Jumlah + PPN", u: totalVendor, e: totalEvaluasiVendor, bold: true },
            ].map((row) => (
              <tr key={row.label} style={{ background: "#f3f3f3" }}>
                <td style={thTd} colSpan={3}></td>
                <td style={{ ...thTd, textAlign: "center", fontWeight: 700 }}>{row.label}</td>
                <td style={{ ...thTd, textAlign: "right", fontWeight: row.bold ? 700 : 600 }}>{rupiah(row.u)}</td>
                <td style={thTd} colSpan={2}></td>
                <td style={{ ...thTd, textAlign: "right", fontWeight: row.bold ? 700 : 600 }}>{rupiah(row.e)}</td>
              </tr>
            ))}
          </tfoot>
        </table>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 26 }}>
        <tbody>
          <tr>
            <td style={{ width: "50%", textAlign: "center", fontSize: 10.5, paddingBottom: 2 }}>Menyetujui,</td>
            <td style={{ width: "50%", textAlign: "center", fontSize: 10.5, paddingBottom: 2 }}>Dibuat Oleh,</td>
          </tr>
          <tr>
            <td style={{ textAlign: "center", fontSize: 10.5, paddingBottom: 46 }} />
            <td style={{ textAlign: "center", fontSize: 10.5, paddingBottom: 46 }} />
          </tr>
          <tr>
            <td style={{ textAlign: "center", fontSize: 10.5, fontWeight: 700 }}>{madm?.role || "MADM"}</td>
            <td style={{ textAlign: "center", fontSize: 10.5, fontWeight: 700 }}>{asmanKas?.role || "ASMAN KAS"}</td>
          </tr>
          <tr>
            <td style={{ textAlign: "center", fontSize: 10.5, fontWeight: 700 }}>{madm?.nama || "-"}</td>
            <td style={{ textAlign: "center", fontSize: 10.5, fontWeight: 700 }}>{asmanKas?.nama || "-"}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const thTd = { padding: "2px 5px", border: "1px solid #ccc" };

// ===================== Preview dokumen Cash Card (Detail CC) =====================
// Keempat komponen di bawah mengikuti susunan asli 4 template docx CC:
// Template verifikasi cc.docx, Template Permintaan dana cc.docx,
// Template Rencana permintaan Tunai CC.docx, Template Pertanggung Jawaban CC.docx.
// Props-nya dibuat eksplisit (bukan langsung pakai object hasil build*Data() di
// DetailCC.jsx yang key-nya string bebas seperti "no ver dari sistem") biar
// komponen preview ini gampang dibaca & dipakai ulang.

export function CcVerifikasiPreview({ nomorVerifikasi, tanggal, nomorLpj, judulKegiatan, jumlahBiaya, asmanKas }) {
  return (
    <div style={pageStyle}>
      <CtrBold size={13}>FORMULIR VERIFIKASI</CtrBold>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, margin: "8px 0" }}>
        <span>Nomor Verifikasi: {nomorVerifikasi || "-"}</span>
        <span>Jakarta, {tanggal || "-"}</span>
      </div>
      <div style={{ fontSize: 10, marginBottom: 8 }}>Nomor LPJ: {nomorLpj || "-"}</div>
      <p style={{ margin: "6px 0" }}>Perihal: Penyelesaian Pembayaran</p>
      <p style={{ margin: "6px 0" }}>Kepada Yth: Manager Administrasi UBP Priok</p>
      <p style={{ margin: "10px 0 4px" }}>Bersama ini kami sampaikan berkas/dokumen pengeluaran atas:</p>
      <table style={{ width: "100%", borderCollapse: "collapse", margin: "4px 0 12px" }}>
        <tbody>
          <Row label="Kegiatan" value={judulKegiatan} />
          <Row label="Jumlah Biaya" value={jumlahBiaya != null ? rupiah(jumlahBiaya) : "-"} />
        </tbody>
      </table>
      <p style={{ margin: "4px 0", textAlign: "justify" }}>
        Berkas tersebut telah kami lakukan pemeriksaan/pengecekan dan kami anggap lengkap (sah) sesuai
        dengan realisasinya. Maka dengan ini kami mohon diselesaikan pembayarannya.
      </p>
      <p style={{ margin: "4px 0 16px" }}>Terlampir: Rencana Anggaran Biaya (RAB/RPP/RPB), Pengalokasian Anggaran (PA).</p>
      <div style={{ textAlign: "center" }}>
        <div>{asmanKas?.role || "ASSISTANT MANAGER KEAMANAN & HUMAS"}</div>
        <div style={{ height: 30 }} />
        <div style={{ fontWeight: 700 }}>{asmanKas?.nama || "-"}</div>
      </div>
    </div>
  );
}

export function CcPermintaanPreview({ nomorPengajuan, nomorWeek, saldoKas, terbilang, tanggal, items = [], totalPengajuan, asmanKas, madm }) {
  return (
    <div style={pageStyle}>
      <CtrBold size={13}>PERMINTAAN DANA CASH CARD</CtrBold>
      <table style={{ width: "100%", borderCollapse: "collapse", margin: "8px 0" }}>
        <tbody>
          <Row label="Nomor Pengajuan" value={nomorPengajuan} />
          <Row label="Nomor Week" value={nomorWeek} />
        </tbody>
      </table>
      <p style={{ margin: "6px 0" }}>
        Yang bertanda tangan dibawah ini, Nama: <b>{asmanKas?.nama || "-"}</b>, Jabatan: {asmanKas?.role || "Assistant Manager Keamanan & Humas"},
        dengan ini mengajukan permohonan Cash Card sebesar:
      </p>
      <table style={{ width: "100%", borderCollapse: "collapse", margin: "4px 0 10px" }}>
        <tbody>
          <Row label="Jumlah Biaya" value={saldoKas != null ? rupiah(saldoKas) : "-"} />
          <Row label="Terbilang" value={terbilang} full />
        </tbody>
      </table>
      <div style={{ fontWeight: 700, fontSize: 10, marginBottom: 4 }}>Uraian Rencana Biaya</div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
        <thead>
          <tr style={{ background: "#e8e8e8" }}>
            <th style={thTd}>No</th>
            <th style={thTd}>Exp. Type</th>
            <th style={thTd}>Harga</th>
          </tr>
        </thead>
        <tbody>
          {(items.length ? items : [{}, {}, {}, {}]).slice(0, 4).map((it, i) => (
            <tr key={i}>
              <td style={thTd}>{i + 1}</td>
              <td style={thTd}>{it.expType || "-"}</td>
              <td style={{ ...thTd, textAlign: "right" }}>{it.harga != null ? rupiah(it.harga) : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ textAlign: "right", fontWeight: 700, margin: "6px 0 16px" }}>
        Total Pengajuan: {totalPengajuan != null ? rupiah(totalPengajuan) : "-"}
      </div>
      <div style={{ textAlign: "right", fontSize: 10, marginBottom: 12 }}>Jakarta, {tanggal || "-"}</div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, textAlign: "center" }}>
        <div>
          <div>Pemohon Cash Card</div>
          <div>Cash Card User</div>
          <div style={{ height: 30 }} />
          <div style={{ fontWeight: 700 }}>Dina Mardiana</div>
        </div>
        <div>
          <div>{asmanKas?.role || "Assistant Manager Keamanan & Humas"}</div>
          <div>Asman KEP / Cash Card Controller</div>
          <div style={{ height: 30 }} />
          <div style={{ fontWeight: 700 }}>{asmanKas?.nama || "-"}</div>
        </div>
        <div>
          <div>Manager Administrasi</div>
          <div style={{ height: 30 }} />
          <div style={{ fontWeight: 700 }}>{madm?.nama || "-"}</div>
        </div>
      </div>
    </div>
  );
}

export function CcRencanaPreview({ nomorPengajuan, bidang, uraian, nominalSaldoKas, terbilang, tanggal, asmanKas }) {
  return (
    <div style={pageStyle}>
      <CtrBold size={13}>RENCANA PERMINTAAN TUNAI</CtrBold>
      <div style={{ fontSize: 10, margin: "8px 0" }}>Nomor Pengajuan: {nomorPengajuan || "-"}</div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10, marginBottom: 10 }}>
        <thead>
          <tr style={{ background: "#e8e8e8" }}>
            <th style={thTd}>No</th>
            <th style={thTd}>Bidang</th>
            <th style={thTd}>Uraian</th>
            <th style={thTd}>Total Pengajuan</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={thTd}>1</td>
            <td style={thTd}>{bidang || "-"}</td>
            <td style={thTd}>{uraian || "-"}</td>
            <td style={{ ...thTd, textAlign: "right" }}>{nominalSaldoKas != null ? rupiah(nominalSaldoKas) : "-"}</td>
          </tr>
        </tbody>
      </table>
      <div style={{ margin: "6px 0 16px" }}>Terbilang: {terbilang || "-"}</div>
      <div style={{ textAlign: "right", fontSize: 10, marginBottom: 12 }}>Jakarta, {tanggal || "-"}</div>
      <div style={{ textAlign: "center" }}>
        <div>Yang Membuat &amp; Mengetahui,</div>
        <div>{asmanKas?.role || "Assistant Manager Keamanan & Humas"}</div>
        <div style={{ height: 30 }} />
        <div style={{ fontWeight: 700 }}>{asmanKas?.nama || "-"}</div>
      </div>
    </div>
  );
}

export function CcPertanggungjawabanPreview({ nomorVerifikasi, nomorWeek, items = [], totalPengajuan, madm, asmanKas }) {
  return (
    <div style={pageStyle}>
      <CtrBold size={13}>PERTANGGUNGJAWABAN CASH CARD</CtrBold>
      <table style={{ width: "100%", borderCollapse: "collapse", margin: "8px 0 10px" }}>
        <tbody>
          <Row label="Nomor Verifikasi" value={nomorVerifikasi} />
          <Row label="Nomor Week" value={nomorWeek} />
        </tbody>
      </table>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
        <thead>
          <tr style={{ background: "#e8e8e8" }}>
            <th style={thTd}>No</th>
            <th style={thTd}>Exp. Type</th>
            <th style={thTd}>Harga</th>
          </tr>
        </thead>
        <tbody>
          {(items.length ? items : [{}, {}]).slice(0, 2).map((it, i) => (
            <tr key={i}>
              <td style={thTd}>{i + 1}</td>
              <td style={thTd}>{it.expType || "-"}</td>
              <td style={{ ...thTd, textAlign: "right" }}>{it.harga != null ? rupiah(it.harga) : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ textAlign: "right", fontWeight: 700, margin: "6px 0 18px" }}>
        Total Pengajuan: {totalPengajuan != null ? rupiah(totalPengajuan) : "-"}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, textAlign: "center" }}>
        <div>
          <div>Manager Administrasi</div>
          <div style={{ height: 30 }} />
          <div style={{ fontWeight: 700 }}>{madm?.nama || "-"}</div>
        </div>
        <div>
          <div>{asmanKas?.role || "Assistant Manager Keamanan & Humas"}</div>
          <div style={{ height: 30 }} />
          <div style={{ fontWeight: 700 }}>{asmanKas?.nama || "-"}</div>
        </div>
      </div>
    </div>
  );
}

// ===================== Preview Form Verifikasi (RAB) =====================
// Mengikuti susunan Template_Verifikasi.docx: nomor verifikasi, tanggal,
// perihal baku, kegiatan, jumlah biaya + terbilang, kepada, TTD Asman KAS.
export function FormVerifikasiPreview({ nomorVerifikasi, tanggal, kegiatan, jumlahBiaya, terbilang, kepada, asmanKas }) {
  return (
    <div style={pageStyle}>
      <CtrBold size={13}>FORMULIR VERIFIKASI</CtrBold>
      <table style={{ width: "100%", borderCollapse: "collapse", margin: "10px 0 8px" }}>
        <tbody>
          <Row label="Nomor Verifikasi" value={nomorVerifikasi} />
          <Row label="Lampiran" value="1 (Satu) berkas" />
          <Row label="Tanggal" value={tanggal} />
          <Row label="Perihal" value="Penyelesaian Pembayaran" />
        </tbody>
      </table>
      <p style={{ margin: "8px 0 4px" }}>Kepada Yth: Manager Administrasi UBP Priok</p>
      <p style={{ margin: "8px 0 4px" }}>Bersama ini kami sampaikan berkas/dokumen pengeluaran atas:</p>
      <table style={{ width: "100%", borderCollapse: "collapse", margin: "4px 0 10px" }}>
        <tbody>
          <Row label="Kegiatan" value={kegiatan} full />
          <Row label="Jumlah Biaya" value={jumlahBiaya != null ? rupiah(jumlahBiaya) : "-"} />
          <Row label="Terbilang" value={terbilang} full />
        </tbody>
      </table>
      <p style={{ margin: "4px 0", textAlign: "justify" }}>
        Berkas tersebut telah kami lakukan pemeriksaan / pengecekan dan kami anggap lengkap (sah) sesuai
        dengan realisasinya. Maka dengan ini kami mohon diselesaikan pembayarannya:
      </p>
      <p style={{ margin: "4px 0 16px" }}>Kepada: {kepada || "-"}</p>
      <div style={{ textAlign: "center" }}>
        <div>{asmanKas?.role || "ASSISTANT MANAGER KEAMANAN & HUMAS"}</div>
        <div style={{ height: 30 }} />
        <div style={{ fontWeight: 700 }}>{asmanKas?.nama || "-"}</div>
      </div>
    </div>
  );
}

// ===================== Preview Lampiran 1 (Formulir Pengadaan Langsung) =====================
// Mengikuti susunan Template_Lampiran_1.docx: submission ID, tanggal, nama
// pengadaan, procost/expType/task/expOrg, tabel RAB & Ruang Lingkup Pengadaan
// (harga per vendor), grand total, lalu preferensi vendor 1/2/3.
export function Lampiran1Preview({ submissionId, tanggal, namaPengadaan, procost, expType, task, expOrg, items = [], grandTotal, vendor1, vendor2, vendor3 }) {
  return (
    <div style={pageStyle}>
      <CtrBold size={12}>Formulir Pengadaan Langsung-Invoice Non PO</CtrBold>
      <div style={{ textAlign: "center", fontSize: 9.5, color: "#555", marginBottom: 8 }}>(Lamp 1: IPM.TGP.10.08)</div>
      <table style={{ width: "100%", borderCollapse: "collapse", margin: "6px 0 8px" }}>
        <tbody>
          <Row label="Submission ID" value={submissionId} />
          <Row label="Tanggal" value={tanggal} />
          <Row label="Nama Pengadaan" value={namaPengadaan} full />
          <Row label="Procost" value={procost} />
          <Row label="Exp. Type" value={expType} />
          <Row label="Task" value={task} />
          <Row label="Exp. Org" value={expOrg} />
        </tbody>
      </table>

      <div style={{ fontWeight: 700, fontSize: 10, marginBottom: 4 }}>RAB dan Ruang Lingkup Pengadaan</div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 9 }}>
        <thead>
          <tr style={{ background: "#e8e8e8" }}>
            <th style={thTd}>Uraian</th>
            <th style={thTd}>Jumlah</th>
            <th style={thTd}>Satuan</th>
            <th style={thTd}>Harga Vendor 1 + PPN</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={i}>
              <td style={thTd}>{it.uraian || "-"}</td>
              <td style={{ ...thTd, textAlign: "right" }}>{it.qty || "-"}</td>
              <td style={thTd}>{it.satuan || "-"}</td>
              <td style={{ ...thTd, textAlign: "right" }}>{it.hargaVendor1 != null ? rupiah(it.hargaVendor1) : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ textAlign: "right", fontWeight: 700, margin: "6px 0 14px" }}>
        Grand Total: {grandTotal != null ? rupiah(grandTotal) : "-"}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 12 }}>
        <tbody>
          <Row label="Preferensi Vendor 1" value={vendor1} />
          <Row label="Preferensi Vendor 2" value={vendor2} />
          <Row label="Preferensi Vendor 3" value={vendor3} />
        </tbody>
      </table>
    </div>
  );
}

// ===================== Preview Lampiran 2 (Berita Acara Negosiasi) =====================
// Template_Lampiran_2.docx sebenarnya berisi 3 dokumen berurutan (Berita Acara
// Negosiasi, SPK/SPB, BAST) dalam 1 file, tapi form Lampiran2.jsx cuma ngisi
// field-field di bagian Berita Acara Negosiasi (bagian paling atas) - jadi
// preview ini juga cuma nampilin bagian itu, biar preview = data yang
// benar-benar bisa diedit dari form.
export function Lampiran2Preview({ namaPengadaan, nilaiPenawaran, nilaiNegosiasi, tanggalNegosiasi, pelaksanaPekerjaan, keterangan }) {
  return (
    <div style={pageStyle}>
      <CtrBold size={12}>Berita Acara Negosiasi</CtrBold>
      <div style={{ textAlign: "center", fontSize: 9.5, color: "#555", marginBottom: 8 }}>(Lampiran 2 : IPM.TGP.10.08)</div>
      <p style={{ margin: "8px 0" }}>Telah dilakukan negosiasi harga terkait pengadaan:</p>
      <table style={{ width: "100%", borderCollapse: "collapse", margin: "4px 0 10px" }}>
        <tbody>
          <Row label="Nama Pengadaan" value={namaPengadaan} full />
          <Row label="Nilai Penawaran" value={nilaiPenawaran != null && nilaiPenawaran !== "" ? rupiah(nilaiPenawaran) : "-"} />
          <Row label="Nilai Negosiasi" value={nilaiNegosiasi != null && nilaiNegosiasi !== "" ? rupiah(nilaiNegosiasi) : "-"} />
          <Row label="Tanggal" value={tanggalNegosiasi} />
          <Row label="Pelaksana Pekerjaan" value={pelaksanaPekerjaan} />
          <Row label="Keterangan" value={keterangan} full />
        </tbody>
      </table>
      <p style={{ margin: "8px 0", textAlign: "justify" }}>
        Pengadaan ini telah disepakati oleh kedua belah PIHAK dan dilanjutkan dengan persetujuan pada
        Surat Perintah Kerja (SPK).
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, fontSize: 10 }}>
        <div style={{ textAlign: "center" }}>
          <div>Paraf ..........................</div>
          <div style={{ marginTop: 4 }}>(Pelaksana Pekerjaan)</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div>Paraf ..........................</div>
          <div style={{ marginTop: 4 }}>(PT PLN Indonesia Power UBP Priok)</div>
        </div>
      </div>
    </div>
  );
}
