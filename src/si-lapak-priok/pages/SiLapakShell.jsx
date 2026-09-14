import { ChevronRight } from "lucide-react";
import { T, font } from "../../lib/theme";
import SiLapakSidebar from "./SiLapakSidebar";

const LABELS = {
  dashboard: "Dashboard",
  tambah: "Tambah Paket",
  data: "Data Paket",
  ambil: "Ambil Paket",
  tamu: "Buku Tamu",
  riwayat: "Riwayat",
  bantuan: "Bantuan",
};

export default function SiLapakShell({ active, onSelect, onLogout, children }) {
  const activeLabel = LABELS[active] || "Dashboard";
  return (
    <div className="system-page-shell" style={{ "--blue":"#B79A00", "--navy":"#8C7600", "--blue-soft":"#FFF9D5", "--brand-yellow":"#FDEA6F" }}>
      <SiLapakSidebar active={active} onSelect={onSelect} onLogout={onLogout} />
      <div className="system-main">
        <div className="app-topbar" style={{ position:"sticky",top:0,zIndex:20,background:T.topbarBg,backdropFilter:"blur(8px)",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,minHeight:58,flexShrink:0 }}>
          <div style={{display:"flex",alignItems:"center",gap:6,fontSize:13,color:T.muted,minWidth:0}}><span className="hide-mobile">Si Lapak Priok</span><ChevronRight size={13} className="hide-mobile"/><span style={{color:T.heading,fontWeight:800,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{activeLabel}</span></div>
          <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}><div style={{width:30,height:30,borderRadius:"50%",background:"#8C7600",color:"#fff",display:"grid",placeItems:"center",fontSize:10.5,fontFamily:font.display,fontWeight:800}}>SL</div><span className="hide-mobile" style={{fontSize:12.5,fontWeight:700,color:T.text}}>Si Lapak Priok</span></div>
        </div>
        <div className="system-body" key={active} style={{animation:"fade-in .2s ease"}}>{children}</div>
      </div>
    </div>
  );
}
