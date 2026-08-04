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
      <CtrBold size={11}>{values.judulProgramRKA || "-"}</CtrBold>
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
        Nomor: {values.nomor || "-"}/BAST/KAS/PRIOK/2026
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

export function RabDocPreview({ values }) {
  const items = values.items || [];
  return (
    <div style={pageStyle}>
      <CtrBold size={13}>RENCANA ANGGARAN BIAYA</CtrBold>
      <CtrBold size={11}>PT PLN INDONESIA POWER UBP PRIOK</CtrBold>

      <table style={{ width: "100%", borderCollapse: "collapse", margin: "10px 0 8px" }}>
        <tbody>
          <Row label="ID Number" value={values.idNumber} />
          <Row label="Judul Kegiatan" value={values.judulKegiatan} />
          <Row label="Kategori" value={values.kategori} />
          <Row label="Bidang" value={values.bidang} />
          <Row label="Tanggal RAB" value={values.tanggalRab} />
          <Row label="Vendor" value={values.vendor} />
          <Row label="Procost" value={values.procost} />
          <Row label="Exp. Type" value={values.expType} />
        </tbody>
      </table>

      {items.length > 0 && (
        <>
          <div style={{ fontWeight: 700, fontSize: 10, marginBottom: 4 }}>Uraian RAB</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 9.5 }}>
            <thead>
              <tr style={{ background: "#e8e8e8" }}>
                {["No", "Uraian", "Qty", "Satuan", "Harga/unit", "Total Evaluasi"].map((h) => (
                  <th key={h} style={{ padding: "3px 5px", textAlign: "left", border: "1px solid #ccc" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id || i}>
                  <td style={{ padding: "2px 5px", border: "1px solid #ccc" }}>{i + 1}</td>
                  <td style={{ padding: "2px 5px", border: "1px solid #ccc" }}>{item.uraian || "-"}</td>
                  <td style={{ padding: "2px 5px", border: "1px solid #ccc" }}>{item.qtyEvaluasi || item.qty || "-"}</td>
                  <td style={{ padding: "2px 5px", border: "1px solid #ccc" }}>{item.satuan || "-"}</td>
                  <td style={{ padding: "2px 5px", border: "1px solid #ccc", textAlign: "right" }}>
                    {rupiah(item.hargaEvaluasi || item.harga || 0)}
                  </td>
                  <td style={{ padding: "2px 5px", border: "1px solid #ccc", textAlign: "right" }}>
                    {rupiah(item.totalEvaluasi || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ textAlign: "right", fontWeight: 700, marginTop: 6, fontSize: 10 }}>
            Total Evaluasi: {rupiah(values.totalEvaluasi || 0)}
          </div>
        </>
      )}
    </div>
  );
}
