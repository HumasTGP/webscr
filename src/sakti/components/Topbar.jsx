import { ChevronRight, HelpCircle, Moon, Sun } from "lucide-react";
import { T, font } from "../../lib/theme";

export default function Topbar({ activeLabel, user, onHelpClick, themeMode, onToggleTheme }) {
  return <div className="app-topbar" style={{ position:"sticky",top:0,zIndex:50,background:T.topbarBg,backdropFilter:"blur(8px)",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,minHeight:58 }}>
    <div style={{display:"flex",alignItems:"center",gap:6,fontSize:13,color:T.muted,fontFamily:font.body,minWidth:0}}><span className="hide-mobile">SAKTI</span><ChevronRight size={13} className="hide-mobile"/><span style={{color:T.heading,fontWeight:800,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{activeLabel}</span></div>
    <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
      <button onClick={onHelpClick} title="Bantuan" style={iconTextBtn}><HelpCircle size={16}/><span className="hide-mobile">Bantuan</span></button>
      {onToggleTheme&&<button onClick={onToggleTheme} title={themeMode==="dark"?"Mode Terang":"Mode Gelap"} aria-label={themeMode==="dark"?"Aktifkan mode terang":"Aktifkan mode gelap"} style={roundBtn}>{themeMode==="dark"?<Sun size={16}/>:<Moon size={16}/>}</button>}
    </div>
  </div>;
}
const iconTextBtn={display:"flex",alignItems:"center",gap:6,background:"transparent",border:0,color:T.muted,cursor:"pointer",fontSize:13,padding:5};
const roundBtn={width:32,height:32,borderRadius:9,border:"1px solid var(--border)",background:"var(--card)",color:"var(--blue)",cursor:"pointer",display:"grid",placeItems:"center"};
