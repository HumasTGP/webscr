import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { T } from "../../lib/theme";
import { EKSPEDISI_OPT, ASAL_SURAT_OPT } from "../../lib/siLapakPriokData";

const inputStyle = { width:"100%", boxSizing:"border-box", border:`1px solid ${T.border}`, borderRadius:8, padding:"8px 10px", fontSize:12, color:T.text, background:T.card, outline:"none" };

export default function Riwayat({ paket, tamu, onUpdatePaket, onDeletePaket, onUpdateTamu, onDeleteTamu }) {
  const [tab,setTab]=useState("paket");
  const hanyaPaket = paket.filter((p) => p.jenis !== "Surat");
  const hanyaSurat = paket.filter((p) => p.jenis === "Surat");
  return <div>
    <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap"}}>
      <Tab active={tab==="paket"} onClick={()=>setTab("paket")}>Paket ({hanyaPaket.length})</Tab>
      <Tab active={tab==="surat"} onClick={()=>setTab("surat")}>Surat ({hanyaSurat.length})</Tab>
      <Tab active={tab==="tamu"} onClick={()=>setTab("tamu")}>Kunjungan tamu ({tamu.length})</Tab>
    </div>
    {tab==="paket" && <RiwayatPaket data={hanyaPaket} onUpdate={onUpdatePaket} onDelete={onDeletePaket}/>}
    {tab==="surat" && <RiwayatSurat data={hanyaSurat} onUpdate={onUpdatePaket} onDelete={onDeletePaket}/>}
    {tab==="tamu" && <RiwayatTamu tamu={tamu} onUpdate={onUpdateTamu} onDelete={onDeleteTamu}/>}
  </div>;
}

function Tab({active,onClick,children}) { return <button type="button" onClick={onClick} style={{padding:"8px 16px",borderRadius:8,border:`1px solid ${active?T.navy:T.border}`,background:active?T.navy:T.card,color:active?"#fff":T.muted,fontSize:12.5,fontWeight:600,cursor:"pointer"}}>{children}</button>; }

function RiwayatPaket({data, onUpdate, onDelete}) {
  const [editId,setEditId]=useState(null);
  const [draft,setDraft]=useState(null);
  const [confirmId,setConfirmId]=useState(null);
  if(data.length===0) return <Empty text="Belum ada riwayat paket."/>;
  const startEdit=(p)=>{setEditId(p.id);setDraft({...p});};
  const saveEdit=()=>{onUpdate(draft);setEditId(null);};
  return <div style={{overflowX:"auto"}}>
    <table style={{width:"100%",minWidth:760,borderCollapse:"collapse",fontSize:12}}>
      <thead><tr><Th>Diterima</Th><Th>Penerima</Th><Th>Ekspedisi</Th><Th>Resi</Th><Th>Status</Th><Th>Pengambil</Th><Th></Th></tr></thead>
      <tbody>{data.map((p)=>editId===p.id ? (
        <tr key={p.id}><td colSpan={7} style={{padding:"10px",borderBottom:`1px solid ${T.border}`,background:T.bg}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:10}}>
            <div><label style={smallLabel}>Nama penerima</label><input style={inputStyle} value={draft.namaPenerima} onChange={(e)=>setDraft({...draft,namaPenerima:e.target.value})}/></div>
            <div><label style={smallLabel}>Ekspedisi</label><select style={inputStyle} value={draft.ekspedisi} onChange={(e)=>setDraft({...draft,ekspedisi:e.target.value})}>{EKSPEDISI_OPT.map((op)=>(<option key={op} value={op}>{op}</option>))}</select></div>
            <div><label style={smallLabel}>Nomor resi</label><input style={inputStyle} value={draft.noResi} onChange={(e)=>setDraft({...draft,noResi:e.target.value})}/></div>
          </div>
          <div style={{display:"flex",gap:8}}><button type="button" onClick={saveEdit} style={primaryBtn}>Simpan</button><button type="button" onClick={()=>setEditId(null)} style={secondaryBtn}>Batal</button></div>
        </td></tr>
      ) : (
        <tr key={p.id}>
          <Td>{p.diterimaTanggal}, {p.diterimaJam}</Td><Td>{p.namaPenerima}</Td><Td>{p.ekspedisi}</Td><Td>{p.noResi}</Td>
          <Td><span style={{fontSize:9.5,fontWeight:600,padding:"2px 8px",borderRadius:20,background:p.status==="Sudah Diambil"?"#E5F6EF":"#FDF3DD",color:p.status==="Sudah Diambil"?"#1D9E75":"#B7791F"}}>{p.status}</span></Td>
          <Td>{p.pengambil||"-"}</Td>
          <Td>
            <div style={{display:"flex",gap:6}}><IconBtn onClick={()=>startEdit(p)} title="Edit"><Pencil size={13}/></IconBtn><IconBtn onClick={()=>setConfirmId(p.id)} title="Hapus" danger><Trash2 size={13}/></IconBtn></div>
            {confirmId===p.id && <div style={{marginTop:8,background:"#FBE4E4",border:"1px solid #E8B4B4",borderRadius:8,padding:8}}><div style={{fontSize:10.5,color:"#7A1F1F",marginBottom:6}}>Hapus data ini?</div><div style={{display:"flex",gap:6}}><button type="button" onClick={()=>{onDelete(p.id);setConfirmId(null);}} style={{...primaryBtn,background:"#C43A2B",padding:"6px 12px"}}>Hapus</button><button type="button" onClick={()=>setConfirmId(null)} style={{...secondaryBtn,padding:"6px 12px"}}>Batal</button></div></div>}
          </Td>
        </tr>
      ))}</tbody>
    </table>
  </div>;
}

function RiwayatSurat({data, onUpdate, onDelete}) {
  const [editId,setEditId]=useState(null);
  const [draft,setDraft]=useState(null);
  const [confirmId,setConfirmId]=useState(null);
  if(data.length===0) return <Empty text="Belum ada riwayat surat."/>;
  const startEdit=(s)=>{setEditId(s.id);setDraft({...s});};
  const saveEdit=()=>{onUpdate(draft);setEditId(null);};
  return <div style={{overflowX:"auto"}}>
    <table style={{width:"100%",minWidth:800,borderCollapse:"collapse",fontSize:12}}>
      <thead><tr><Th>Diterima</Th><Th>Penerima</Th><Th>Asal Surat</Th><Th>No. Surat</Th><Th>Perihal</Th><Th>Status</Th><Th>Diserahkan ke</Th><Th></Th></tr></thead>
      <tbody>{data.map((s)=>editId===s.id ? (
        <tr key={s.id}><td colSpan={8} style={{padding:"10px",borderBottom:`1px solid ${T.border}`,background:T.bg}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:10}}>
            <div><label style={smallLabel}>Nama penerima</label><input style={inputStyle} value={draft.namaPenerima} onChange={(e)=>setDraft({...draft,namaPenerima:e.target.value})}/></div>
            <div><label style={smallLabel}>Asal surat</label><select style={inputStyle} value={draft.asalSurat} onChange={(e)=>setDraft({...draft,asalSurat:e.target.value})}>{ASAL_SURAT_OPT.map((op)=>(<option key={op} value={op}>{op}</option>))}</select></div>
            <div><label style={smallLabel}>Nomor surat</label><input style={inputStyle} value={draft.noSurat} onChange={(e)=>setDraft({...draft,noSurat:e.target.value})}/></div>
            <div><label style={smallLabel}>Perihal</label><input style={inputStyle} value={draft.perihal} onChange={(e)=>setDraft({...draft,perihal:e.target.value})}/></div>
          </div>
          <div style={{display:"flex",gap:8}}><button type="button" onClick={saveEdit} style={primaryBtn}>Simpan</button><button type="button" onClick={()=>setEditId(null)} style={secondaryBtn}>Batal</button></div>
        </td></tr>
      ) : (
        <tr key={s.id}>
          <Td>{s.diterimaTanggal}, {s.diterimaJam}</Td><Td>{s.namaPenerima}</Td><Td>{s.asalSurat}</Td><Td>{s.noSurat}</Td><Td>{s.perihal}</Td>
          <Td><span style={{fontSize:9.5,fontWeight:600,padding:"2px 8px",borderRadius:20,background:s.status==="Sudah Diambil"?"#E5F6EF":"#FDF3DD",color:s.status==="Sudah Diambil"?"#1D9E75":"#B7791F"}}>{s.status}</span></Td>
          <Td>{s.pengambil||"-"}</Td>
          <Td>
            <div style={{display:"flex",gap:6}}><IconBtn onClick={()=>startEdit(s)} title="Edit"><Pencil size={13}/></IconBtn><IconBtn onClick={()=>setConfirmId(s.id)} title="Hapus" danger><Trash2 size={13}/></IconBtn></div>
            {confirmId===s.id && <div style={{marginTop:8,background:"#FBE4E4",border:"1px solid #E8B4B4",borderRadius:8,padding:8}}><div style={{fontSize:10.5,color:"#7A1F1F",marginBottom:6}}>Hapus data ini?</div><div style={{display:"flex",gap:6}}><button type="button" onClick={()=>{onDelete(s.id);setConfirmId(null);}} style={{...primaryBtn,background:"#C43A2B",padding:"6px 12px"}}>Hapus</button><button type="button" onClick={()=>setConfirmId(null)} style={{...secondaryBtn,padding:"6px 12px"}}>Batal</button></div></div>}
          </Td>
        </tr>
      ))}</tbody>
    </table>
  </div>;
}

function RiwayatTamu({tamu,onUpdate,onDelete}) {
  const [editId,setEditId]=useState(null);
  const [draft,setDraft]=useState(null);
  const [confirmId,setConfirmId]=useState(null);
  if(tamu.length===0) return <Empty text="Belum ada riwayat kunjungan tamu."/>;
  const startEdit=(t)=>{setEditId(t.id);setDraft({...t});};
  const saveEdit=()=>{onUpdate(draft);setEditId(null);};
  return <div style={{display:"flex",flexDirection:"column",gap:10}}>{tamu.map((t)=><div key={t.id} style={{border:`1px solid ${T.border}`,borderRadius:10,padding:14,background:T.card}}>
    {editId===t.id ? <div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
      <div><label style={smallLabel}>Tanggal</label><input type="date" style={inputStyle} value={draft.tanggal} onChange={(e)=>setDraft({...draft,tanggal:e.target.value})}/></div>
      <div><label style={smallLabel}>Jam</label><input type="time" style={inputStyle} value={draft.jam} onChange={(e)=>setDraft({...draft,jam:e.target.value})}/></div>
      <div style={{gridColumn:"1 / -1"}}><label style={smallLabel}>Nama tamu</label><input style={inputStyle} value={draft.namaTamu} onChange={(e)=>setDraft({...draft,namaTamu:e.target.value})}/></div>
      <div style={{gridColumn:"1 / -1"}}><label style={smallLabel}>Tujuan</label><input style={inputStyle} value={draft.tujuan} onChange={(e)=>setDraft({...draft,tujuan:e.target.value})}/></div>
      <div style={{gridColumn:"1 / -1"}}><label style={smallLabel}>Pegawai dituju</label><input style={inputStyle} value={draft.pegawai} onChange={(e)=>setDraft({...draft,pegawai:e.target.value})}/></div>
    </div><div style={{display:"flex",gap:8}}><button type="button" onClick={saveEdit} style={primaryBtn}>Simpan</button><button type="button" onClick={()=>setEditId(null)} style={secondaryBtn}>Batal</button></div></div> : <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}><div style={{minWidth:0}}><div style={{fontSize:12.5,fontWeight:700,color:T.heading}}>{t.namaTamu}</div><div style={{fontSize:11,color:T.muted,marginTop:2,overflowWrap:"anywhere"}}>{t.tujuan} · menemui {t.pegawai}</div><div style={{fontSize:10.5,color:T.muted,marginTop:2}}>{t.tanggal} · {t.jam}</div></div><div style={{display:"flex",gap:6,flexShrink:0}}><IconBtn onClick={()=>startEdit(t)} title="Edit"><Pencil size={13}/></IconBtn><IconBtn onClick={()=>setConfirmId(t.id)} title="Hapus" danger><Trash2 size={13}/></IconBtn></div></div>}
    {confirmId===t.id && <div style={{marginTop:10,background:"#FBE4E4",border:"1px solid #E8B4B4",borderRadius:8,padding:10}}><div style={{fontSize:11,color:"#7A1F1F",marginBottom:8}}>Hapus riwayat kunjungan ini?</div><div style={{display:"flex",gap:8}}><button type="button" onClick={()=>{onDelete(t.id);setConfirmId(null);}} style={{...primaryBtn,background:"#C43A2B"}}>Hapus</button><button type="button" onClick={()=>setConfirmId(null)} style={secondaryBtn}>Batal</button></div></div>}
  </div>)}</div>;
}

const smallLabel={fontSize:10,color:T.muted,display:"block",marginBottom:4};
const primaryBtn={flex:1,padding:"7px 16px",borderRadius:7,border:"none",background:T.navy,color:"#fff",fontSize:11.5,fontWeight:600,cursor:"pointer"};
const secondaryBtn={flex:1,padding:"7px 16px",borderRadius:7,border:`1px solid ${T.border}`,background:T.card,fontSize:11.5,cursor:"pointer"};
function Th({children}){return <th style={{textAlign:"left",padding:"8px 10px",color:T.muted,fontWeight:600,borderBottom:`1px solid ${T.border}`,fontSize:10,textTransform:"uppercase",letterSpacing:".03em"}}>{children}</th>;}
function Td({children}){return <td style={{padding:"9px 10px",borderBottom:`1px solid ${T.border}`,color:T.text}}>{children}</td>;}
function IconBtn({children,onClick,title,danger}){return <button type="button" onClick={onClick} title={title} style={{width:26,height:26,borderRadius:6,border:`1px solid ${T.border}`,background:T.card,color:danger?"#C43A2B":T.muted,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>{children}</button>;}
function Empty({text}){return <div style={{textAlign:"center",padding:"36px 20px",color:T.muted}}><div style={{width:48,height:48,borderRadius:12,background:"#FFF7C2",display:"grid",placeItems:"center",margin:"0 auto 10px"}}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8C7600" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div><div style={{fontSize:12.5}}>{text}</div></div>;}
