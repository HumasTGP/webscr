import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { T } from "../../lib/theme";
import GandengSidebar from "../components/GandengSidebar";
import GandengDashboard from "./GandengDashboard";
import GandengTracking from "./GandengTracking";
import GandengBantuan from "./GandengBantuan";
import PengajuanGandengPage from "./PengajuanGandeng";
import GandengAccountManagement from "./GandengAccountManagement";
import "../styles/gandeng-responsive.css";

export default function GandengApp({ mitraList, setMitraList, notify, onBackToPortal, user }) {
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
        return user?.isAdmin ? <GandengAccountManagement notify={notify} /> : <GandengDashboard mitraList={accountList} user={user} onGoto={setActive} />;
      case "dashboard": return <GandengDashboard mitraList={accountList} user={user} onGoto={setActive} />;
      case "pengajuan-baru":
      case "riwayat":
        return <div style={{ padding: "clamp(18px,3vw,28px) clamp(16px,4vw,32px)" }}><PengajuanGandengPage mitraList={accountList} setMitraList={setMitraList} user={user} notify={notify} onBackToPortal={null} /></div>;
      case "tracking": return <GandengTracking mitraList={accountList} />;
      case "bantuan": return <GandengBantuan />;
      default: return <GandengDashboard mitraList={accountList} user={user} onGoto={setActive} />;
    }
  };

  const activeLabel = { dashboard:"Dashboard", "pengajuan-baru":"Pengajuan Baru", riwayat:"Riwayat Pengajuan", tracking:"Tracking Status", bantuan:"Bantuan", "account-management":"Manajemen Akun" }[active] || "Dashboard";
  const identityTitle = user?.isAdmin ? "Administrator GANDENG" : (user?.organization || user?.username || "Pengguna GANDENG");
  const identitySub = user?.isAdmin ? "Administrator" : (user?.email || "Akun GANDENG");

  return (
    <div className="gandeng-shell" style={{ "--blue":"#125AE8", "--navy":"#0B46C8", "--blue-soft":"#EAF1FF", "--danger":"#E53935", "--danger-soft":"#FDECEC" }}>
      <header className="app-topbar gandeng-topbar" style={{ position:"sticky",top:0,zIndex:30,background:T.topbarBg,backdropFilter:"blur(8px)",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,minHeight:58,flexShrink:0 }}>
        <div className="gandeng-topbar-left" style={{display:"flex",alignItems:"center",gap:9,minWidth:0}}>
          <span className="gandeng-product-chip">GANDENG</span>
          <ChevronRight size={14} color={T.muted} className="hide-mobile" />
          <span className="gandeng-active-label" style={{fontSize:13,fontWeight:800,color:T.heading,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{activeLabel}</span>
        </div>
        <div className="gandeng-user-card" style={{display:"flex",alignItems:"center",gap:10,minWidth:0,maxWidth:"min(360px,48vw)"}}>
          <div className="gandeng-user-avatar">{identityTitle.charAt(0).toUpperCase()}</div>
          <div className="gandeng-topbar-identity" style={{minWidth:0,flex:1}}>
            <div style={{fontSize:12.5,fontWeight:800,color:T.heading,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{identityTitle}</div>
            <div style={{fontSize:10.5,color:T.muted,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{identitySub}</div>
          </div>
        </div>
      </header>
      <div className="gandeng-shell-body">
        <GandengSidebar active={active} onSelect={setActive} onLogout={onBackToPortal} user={user} />
        <div className="gandeng-main">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
