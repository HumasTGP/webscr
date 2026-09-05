import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { T } from "../../lib/theme";
import { bulanIni, JENIS_OPT } from "../../lib/siLapakPriokData";

const MAX_SIZE = 5 * 1024 * 1024;
const inputStyle = { width:"100%", boxSizing:"border-box", border:`1px solid ${T.border}`, borderRadius:8, padding:"10px 12px", fontSize:12.5, color:T.text, background:T.card, outline:"none" };
const fieldLabel = { display:"block", fontSize:11.5, fontWeight:600, color:T.text, marginBottom:6 };

export default function AmbilPaket({ paket, prefillId, duty, onSaved }) {
  const [jenisFilter, setJenisFilter] = useState("Semua");
  const belumDiambilSemua = paket.filter((p) => p.status === "Belum Diambil");
  const belumDiambil = belumDiambilSemua.filter((p) => jenisFilter === "Semua" || p.jenis === jenisFilter);
  const [selectedId, setSelectedId] = useState(prefillId || belumDiambil[0]?.id || "");
  const [pengambil, setPengambil] = useState("");
  const [satpamTugas, setSatpamTugas] = useState(duty?.names?.[0] || "");
  const [foto, setFoto] = useState(null);
  const [fotoError, setFotoError] = useState("");
  const fileRef = useRef(null);

  const selectedItem = belumDiambilSemua.find((p) => p.id === selectedId);
  const jenisTerpilih = selectedItem?.jenis || "Paket";

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setFotoError("File harus berupa gambar.");
    if (file.size > MAX_SIZE) return setFotoError("Ukuran file maksimal 5 MB.");
    setFotoError("");
    const reader = new FileReader();
    reader.onload = () => setFoto({ name: file.name, dataUrl: reader.result });
    reader.readAsDataURL(file);
  };

  const submit = () => {
    if (!selectedId || !pengambil.trim() || !foto) return;
    onSaved({ id:selectedId, pengambil:pengambil.trim(), satpamTugas:satpamTugas || "-", bulanKeluar:bulanIni(), fotoBukti:foto });
  };

  return <div style={{ maxWidth:460 }}>
    <div style={{ marginBottom: 16 }}>
      <label style={fieldLabel}>Filter jenis</label>
      <select style={inputStyle} value={jenisFilter} onChange={(e) => { setJenisFilter(e.target.value); setSelectedId(""); }}>
        <option value="Semua">Semua jenis</option>
        {JENIS_OPT.map((j) => (<option key={j} value={j}>{j}</option>))}
      </select>
    </div>
    {belumDiambil.length === 0 ? <div style={{fontSize:12.5,color:T.muted}}>Tidak ada paket/surat yang menunggu diambil.</div> : <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div><label style={fieldLabel}>Nomor resi / nomor surat <span style={{color:"#D14343"}}>*</span></label><select style={inputStyle} value={selectedId} onChange={(e)=>setSelectedId(e.target.value)}>{belumDiambil.map((p)=><option key={p.id} value={p.id}>[{p.jenis}] {p.jenis === "Surat" ? p.noSurat : p.noResi} · {p.namaPenerima}</option>)}</select></div>
      <div><label style={fieldLabel}>{jenisTerpilih === "Surat" ? "Penerima surat" : "Pengambil paket"} <span style={{color:"#D14343"}}>*</span></label><input style={inputStyle} value={pengambil} onChange={(e)=>setPengambil(e.target.value)} placeholder="Nama orang yang mengambil" /></div>
      <div><label style={fieldLabel}>Satpam yang bertugas</label><select style={inputStyle} value={satpamTugas} onChange={(e)=>setSatpamTugas(e.target.value)}><option value="">Pilih satpam</option>{(duty?.names || []).map((n)=><option key={n} value={n}>{n}</option>)}</select></div>
      <div>
        <label style={fieldLabel}>Foto bukti serah terima <span style={{color:"#D14343"}}>*</span></label>
        <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={(e)=>handleFile(e.target.files?.[0])}/>
        {!foto ? <button type="button" onClick={()=>fileRef.current?.click()} style={{width:"100%",border:`1px dashed ${T.border}`,borderRadius:8,padding:"22px 12px",background:T.bg,color:T.muted,fontSize:12,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:6}}><Upload size={18}/>Ketuk untuk unggah foto (maks. 5 MB)</button> : <div style={{position:"relative",display:"inline-block"}}><img src={foto.dataUrl} alt="Bukti serah terima" style={{maxWidth:"100%",maxHeight:200,borderRadius:8,border:`1px solid ${T.border}`,display:"block"}}/><button type="button" onClick={()=>setFoto(null)} aria-label="Hapus foto" style={{position:"absolute",top:6,right:6,width:24,height:24,borderRadius:"50%",border:"none",background:"rgba(0,0,0,.55)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><X size={13}/></button></div>}
        {fotoError && <div style={{fontSize:10.5,color:"#D14343",marginTop:5}}>{fotoError}</div>}
        <div style={{fontSize:10.5,color:T.muted,marginTop:5}}>Format gambar (JPG/PNG), ukuran maksimal 5 MB.</div>
      </div>
      <div style={{background:"#FDF3DD",border:"1px solid #F0DBA6",borderRadius:8,padding:"10px 12px",fontSize:11,color:"#B7791F"}}>Nomor pengambilan dan bulan keluar tercatat otomatis, sama seperti sistem sebelumnya.</div>
      <button type="button" onClick={submit} disabled={!selectedId || !pengambil.trim() || !foto} style={{width:"100%",padding:12,borderRadius:8,border:"none",background:(!selectedId || !pengambil.trim() || !foto) ? T.border : T.navy,color:"#fff",fontWeight:700,fontSize:13.5,cursor:(!selectedId || !pengambil.trim() || !foto) ? "not-allowed" : "pointer"}}>Konfirmasi serah terima</button>
    </div>}
  </div>;
}
