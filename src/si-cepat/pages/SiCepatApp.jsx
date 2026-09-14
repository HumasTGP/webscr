import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { T } from "../../lib/theme";
import SiCepatSidebar from "../components/SiCepatSidebar";
import SiCepatDashboard from "./SiCepatDashboard";
import SiCepatTracking from "./SiCepatTracking";
import SiCepatBantuan from "./SiCepatBantuan";
import SiCepatAccountManagement from "./SiCepatAccountManagement";
import "../styles/sicepat-responsive.css";

export default function SiCepatApp({ mitraList, setMitraList, notify, onBackToPortal, user }) {
  const [active, setActive] = useState(user?.isAdmin ? "account-management" : "dashboard");

  const accountList = useMemo(() => {
    if (user?.isAdmin) return mitraList;
    return (mitraList || []).filter((m) =>
      m.ownerAccountId === user?.id ||
      (!m.ownerAccountId && user?.organization && String(m.namaLembaga || "").trim().toLowerCase() === String(user.organization).trim().toLowerCase())
    );
  }, [mitraList, user]);

  const renderContent = () => {
    switch (active) {
      case "account-management":
        return user?.isAdmin ? <SiCepatAccountManagement notify={notify} /> : <SiCepatDashboard mitraList={accountList} user={user} setMitraList={setMitraList} notify={notify} onGoto={setActive} />;
      case "dashboard": return <SiCepatDashboard mitraList={accountList} user={user} setMitraList={setMitraList} notify={notify} onGoto={setActive} />;
      case "tracking": return <SiCepatTracking mitraList={accountList} />;
      case "bantuan": return <SiCepatBantuan />;
      default: return <SiCepatDashboard mitraList={accountList} user={user} setMitraList={setMitraList} notify={notify} onGoto={setActive} />;
    }
  };

  const activeLabel = { dashboard:"Dashboard", tracking:"Tracking Status Proposal", bantuan:"Bantuan", "account-management":"Manajemen Akun" }[active] || "Dashboard";
  const identityTitle = user?.isAdmin ? "Administrator Si Cepat" : (user?.organization || user?.username || "Pengguna Si Cepat");

  return (
    <div className="sicepat-shell" style={{ "--blue":"#CF0000", "--navy":"#A80000", "--blue-soft":"#FDEAEA", "--danger":"#CF0000", "--danger-soft":"#FDEAEA" }}>
      <header className="app-topbar sicepat-topbar" style={{ position:"sticky",top:0,zIndex:30,background:T.topbarBg,backdropFilter:"blur(8px)",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,minHeight:58,flexShrink:0 }}>
        <div style={{display:"flex",alignItems:"center",gap:6,minWidth:0,flex:1}}>
          <span className="hide-mobile" style={{fontSize:12.5,fontWeight:800,color:"#CF0000",whiteSpace:"nowrap"}}>SI CEPAT</span>
          <ChevronRight size={13} color={T.muted} className="hide-mobile" />
          <span style={{fontSize:13,fontWeight:800,color:T.heading,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{activeLabel}</span>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <div style={{width:30,height:30,borderRadius:"50%",background:"#CF0000",color:"#fff",display:"grid",placeItems:"center",fontWeight:800,fontSize:12,flexShrink:0}}>
            {identityTitle.charAt(0).toUpperCase()}
          </div>
          <span className="hide-mobile" style={{fontSize:12.5,fontWeight:700,color:T.text,maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{identityTitle}</span>
        </div>
      </header>
      <div className="sicepat-shell-body">
        <SiCepatSidebar active={active} onSelect={setActive} onLogout={onBackToPortal} user={user} />
        <div className="sicepat-main">
          <div key={active} style={{ animation: "fade-in .2s ease" }}>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
