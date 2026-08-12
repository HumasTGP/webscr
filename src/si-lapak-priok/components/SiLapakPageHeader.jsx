import { ArrowLeft } from "lucide-react";
import { T, font } from "../../lib/theme";

export default function SiLapakPageHeader({ title, description, onBack }) {
  return <div style={{marginBottom:22,paddingBottom:17,borderBottom:`1px solid ${T.border}`}}>
    {onBack && <button type="button" onClick={onBack} style={{display:"inline-flex",alignItems:"center",gap:6,border:0,background:"transparent",padding:0,marginBottom:12,color:T.muted,fontSize:11.5,fontWeight:600,cursor:"pointer"}}><ArrowLeft size={14}/> Kembali</button>}
    <div style={{display:"flex",gap:13,alignItems:"stretch",minWidth:0}}>
      <div style={{width:4,borderRadius:99,background:"#C9A91E",flexShrink:0}}/>
      <div style={{minWidth:0}}>
        <h1 style={{fontFamily:font.display,fontSize:"clamp(20px,2.2vw,24px)",lineHeight:1.2,margin:0,color:T.heading,overflowWrap:"anywhere"}}>{title}</h1>
        {description && <p style={{margin:"5px 0 0",color:T.muted,fontSize:12.5,lineHeight:1.55,maxWidth:720,overflowWrap:"anywhere"}}>{description}</p>}
      </div>
    </div>
  </div>;
}
