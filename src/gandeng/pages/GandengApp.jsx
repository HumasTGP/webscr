import { useMemo, useState } from "react";
import { T, font } from "../../lib/theme";
import GandengSidebar from "../components/GandengSidebar";
import GandengDashboard from "./GandengDashboard";
import GandengTracking from "./GandengTracking";
import GandengBantuan from "./GandengBantuan";
import PengajuanGandengPage from "./PengajuanGandeng";
import GandengAccountManagement from "./GandengAccountManagement";

export default function GandengApp({ mitraList, setMitraList, notify, onBackToPortal, user, onLogout }) {
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

  const activeLabel = { dashboard:"Dashboard", "pengajuan-baru":"Pengajuan Baru", riwayat:"Riwayat Pengajuan", tracking:"Tracking Status", bantuan:"Bantuan", "account-management":"Manajemen Akun GANDENG" }[active] || "Dashboard";

  return <div style={{
    "--blue":"#CF0000", "--navy":"#A90000", "--blue-soft":"#FDEAEA", "--danger":"#CF0000", "--danger-soft":"#FDEAEA",
    display:"flex", minHeight:"100vh", overflow:"hidden", background:T.bg, fontFamily:font.body, color:T.text,
  }}>
    <GandengSidebar active={active} onSelect={setActive} onLogout={onLogout} onBackToPortal={onBackToPortal} user={user} />
    <div style={{ flex:1, minWidth:0, height:"100vh", display:"flex", flexDirection:"column", overflowY:"auto" }}>
      <div className="app-topbar" style={{ position:"sticky",top:0,zIndex:10,background:T.topbarBg,backdropFilter:"blur(8px)",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,minHeight:58,flexShrink:0 }}>
        <div style={{display:"flex",alignItems:"center",gap:6,minWidth:0}}><span style={{fontSize:12.5,color:T.muted,whiteSpace:"nowrap"}}>GANDENG</span><span style={{color:T.muted}}>›</span><span style={{fontSize:12.5,fontWeight:800,color:T.heading,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{activeLabel}</span></div>
        <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}><div style={{width:32,height:32,borderRadius:"50%",background:T.navy,display:"grid",placeItems:"center",color:"#fff",fontWeight:800,flexShrink:0}}>{(user?.organization||user?.username||"G").charAt(0).toUpperCase()}</div><div className="hide-mobile" style={{minWidth:0}}><div style={{fontSize:12.5,fontWeight:800,color:T.heading,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:240}}>{user?.organization || user?.username || "Pengguna GANDENG"}</div><div style={{fontSize:10.5,color:T.muted}}>{user?.isAdmin ? "Administrator GANDENG" : user?.email || "Akun GANDENG"}</div></div></div>
      </div>
      <div style={{flex:1,minHeight:0}}>{renderContent()}</div>
    </div>
  </div>;
}
