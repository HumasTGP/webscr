import { useEffect, useState } from "react";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { T, font } from "../../lib/theme";
import { MENU_TREE } from "../../lib/data";
import SidebarExitButton from "../../components/SidebarExitButton";

function visibleTree(nodes, userRole, isAdmin) {
  return nodes.filter((n) => {
    if (n.roles && !n.roles.includes(userRole)) return false;
    if (n.adminOnly && !isAdmin) return false;
    return true;
  }).map((n) => n.children ? { ...n, children: visibleTree(n.children, userRole, isAdmin) } : n).filter((n) => !n.children || n.children.length > 0);
}
function flattenLeaves(nodes, acc = []) { for (const n of nodes) n.children ? flattenLeaves(n.children, acc) : acc.push(n); return acc; }
function ancestorKeysOf(nodes, activeKey, trail = []) { for (const n of nodes) { if (n.key === activeKey) return trail; if (n.children) { const found = ancestorKeysOf(n.children, activeKey, [...trail, n.key]); if (found) return found; } } return null; }
function containsActive(node, activeKey) { return node.key === activeKey || !!node.children?.some((c) => containsActive(c, activeKey)); }

function RailTooltip({ label, visible }) { if (!visible) return null; return <span style={{ position:"absolute",left:"calc(100% + 10px)",top:"50%",transform:"translateY(-50%)",background:T.heading,color:"#fff",fontSize:12,fontWeight:600,padding:"6px 10px",borderRadius:7,whiteSpace:"nowrap",pointerEvents:"none",zIndex:60,boxShadow:T.shadowMd }}>{label}</span>; }
function LeafButton({ node, depth, active, onSelect }) { const Icon=node.icon; const isActive=active===node.key; return <button onClick={()=>onSelect(node.key)} style={{ width:"100%",display:"flex",alignItems:"center",gap:10,padding:`8.5px 10px 8.5px ${10+depth*14}px`,borderRadius:10,border:"none",cursor:"pointer",background:isActive?T.navy:"transparent",color:isActive?"#fff":T.text,fontWeight:isActive?700:500,fontSize:13.2,fontFamily:font.body,textAlign:"left" }}><Icon size={15} style={{flexShrink:0}}/><span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{node.label}</span></button>; }
function TopGroupHeader({ node, isOpen, isActiveDescendant, onToggle }) { return <button onClick={onToggle} style={{width:"100%",display:"flex",alignItems:"center",gap:6,padding:"6px 8px",border:"none",background:"transparent",cursor:"pointer"}}><span style={{flex:1,textAlign:"left",fontSize:10.5,fontWeight:800,letterSpacing:.8,color:isActiveDescendant?T.blue:"#A9B3B6",textTransform:"uppercase"}}>{node.label}</span><ChevronDown size={13} color={isActiveDescendant?T.blue:"#C2CACC"} style={{transform:isOpen?"rotate(180deg)":"none"}}/></button>; }
function SubGroupToggle({ node, depth, isOpen, isActiveAncestor, onToggle, onSelect, active }) {
  const Icon = node.icon;
  const isActive = node.hasOwnPage && active === node.key;
  const labelClickable = !!node.hasOwnPage;
  return (
    <div style={{
      width: "100%", display: "flex", alignItems: "center", gap: 2,
      borderRadius: 10, background: isActive ? T.navy : "transparent",
    }}>
      <button
        onClick={labelClickable ? () => onSelect(node.key) : onToggle}
        style={{
          flex: 1, display: "flex", alignItems: "center", gap: 10,
          padding: `8.5px 6px 8.5px ${10 + depth * 14}px`, borderRadius: 10,
          border: "none", cursor: "pointer", background: "transparent",
          color: isActive ? "#fff" : isActiveAncestor ? T.blue : T.text,
          fontWeight: isActive || isActiveAncestor ? 700 : 500, fontSize: 13.2, textAlign: "left",
        }}
      >
        <Icon size={15} style={{ flexShrink: 0 }} />
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{node.label}</span>
      </button>
      <button
        onClick={onToggle}
        title={isOpen ? "Tutup submenu" : "Buka submenu"}
        style={{
          flexShrink: 0, width: 26, height: 26, marginRight: 4, borderRadius: 7,
          border: "none", background: "transparent", cursor: "pointer",
          color: isActive ? "#fff" : isActiveAncestor ? T.blue : T.muted,
          display: "grid", placeItems: "center",
        }}
      >
        <ChevronDown size={13} style={{ transform: isOpen ? "rotate(180deg)" : "none" }} />
      </button>
    </div>
  );
}
function NavNode({ node, depth, active, onSelect, openMap, toggleOpen }) { if (!node.children) return <LeafButton node={node} depth={depth} active={active} onSelect={onSelect}/>; const isOpen=!!openMap[node.key]; const activeAncestor=containsActive(node,active); if(depth===0) return <div><TopGroupHeader node={node} isOpen={isOpen} isActiveDescendant={activeAncestor} onToggle={()=>toggleOpen(node.key)}/>{isOpen&&<div style={{display:"flex",flexDirection:"column",gap:2,marginTop:2,marginBottom:8}}>{node.children.map((c)=><NavNode key={c.key} node={c} depth={1} active={active} onSelect={onSelect} openMap={openMap} toggleOpen={toggleOpen}/>)}</div>}</div>; return <div><SubGroupToggle node={node} depth={depth} isOpen={isOpen} isActiveAncestor={activeAncestor} onToggle={()=>toggleOpen(node.key)} onSelect={onSelect} active={active}/>{isOpen&&<div style={{display:"flex",flexDirection:"column",gap:2}}>{node.children.map((c)=><NavNode key={c.key} node={c} depth={depth+1} active={active} onSelect={onSelect} openMap={openMap} toggleOpen={toggleOpen}/>)}</div>}</div>; }

export default function Sidebar({ active, onSelect, user, onLogout, onBackToPortal, collapsed, setCollapsed }) {
  const tree=visibleTree(MENU_TREE,user.role,user.isAdmin); const flatLeaves=flattenLeaves(tree); const [hoveredKey,setHoveredKey]=useState(null);
  const [openMap,setOpenMap]=useState(()=>{const initial={};(ancestorKeysOf(tree,active)||[]).forEach((k)=>initial[k]=true);return initial;});
  useEffect(()=>{const ancestors=ancestorKeysOf(tree,active);if(!ancestors?.length)return;setOpenMap((prev)=>{const next={...prev};let changed=false;ancestors.forEach((k)=>{if(!next[k]){next[k]=true;changed=true;}});return changed?next:prev;});},[active]);
  const toggleOpen=(key)=>setOpenMap((prev)=>({...prev,[key]:!prev[key]}));
  const handleExit=onBackToPortal||onLogout;

  return <div className="system-sidebar-wrap"><div className="system-sidebar" style={{width:collapsed?68:undefined,transition:"width .2s ease"}}>
    {collapsed ? <div style={{display:"flex",flexDirection:"column",alignItems:"center",height:"100%",padding:"14px 0"}}>
      <button onClick={()=>setCollapsed(false)} title="Buka sidebar" style={railButton}><ChevronLeft size={15} style={{transform:"rotate(180deg)"}}/></button>
      <div style={{width:42,height:42,borderRadius:10,background:"#fff",border:`1px solid ${T.border}`,display:"grid",placeItems:"center",marginBottom:12}}><img src="/logo-sakti.png" alt="SAKTI" style={{width:34,height:34,objectFit:"contain"}}/></div>
      <div style={{flex:1,width:"100%",display:"flex",flexDirection:"column",alignItems:"center",gap:5,overflowY:"auto",padding:"0 10px"}}>{flatLeaves.map((m)=>{const Icon=m.icon;const isActive=active===m.key;return <div key={m.key} style={{position:"relative",width:"100%"}}><button onClick={()=>onSelect(m.key)} onMouseEnter={()=>setHoveredKey(m.key)} onMouseLeave={()=>setHoveredKey(null)} style={{width:"100%",aspectRatio:"1",borderRadius:13,border:"none",cursor:"pointer",display:"grid",placeItems:"center",background:isActive?T.navy:"transparent",color:isActive?"#fff":T.muted}}><Icon size={17}/></button><RailTooltip label={m.label} visible={hoveredKey===m.key}/></div>})}</div>
      <SidebarExitButton onClick={handleExit} compact />
    </div> : <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div className="system-brand">
        <button onClick={()=>setCollapsed(true)} title="Tutup sidebar" style={{...railButton,width:28,height:28,marginBottom:0}}><ChevronLeft size={13}/></button>
        <div className="system-brand-logo"><img src="/logo-sakti.png" alt="SAKTI"/></div>
        <div className="system-brand-copy"><div className="system-brand-title">SAKTI</div><div className="system-brand-subtitle">Sistem Aplikasi Keuangan Terintegrasi</div></div>
      </div>
      <div style={{flex:1,overflowY:"auto",overflowX:"hidden",display:"flex",flexDirection:"column",gap:6,padding:"12px 14px"}}>{tree.map((node)=><NavNode key={node.key} node={node} depth={0} active={active} onSelect={onSelect} openMap={openMap} toggleOpen={toggleOpen}/>)}</div>
      <SidebarExitButton onClick={handleExit} />
    </div>}
  </div></div>;
}
const railButton={width:36,height:36,borderRadius:12,border:"1px solid var(--border)",background:"var(--bg)",color:"var(--muted)",cursor:"pointer",display:"grid",placeItems:"center",marginBottom:16,flexShrink:0};
