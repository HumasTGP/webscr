import { useMemo, useState } from "react";
import { ChevronRight, Phone } from "lucide-react";
import { T } from "../../lib/theme";
import { HELP_CONTACT } from "../../lib/helpContact";
import GandengSidebar from "../components/GandengSidebar";
import GandengDashboard from "./GandengDashboard";
import GandengTracking from "./GandengTracking";
import GandengBantuan from "./GandengBantuan";
import PengajuanGandengPage from "./PengajuanGandeng";
import GandengAccountManagement from "./GandengAccountManagement";
import "../styles/gandeng-responsive.css";

function WhatsAppIcon({ size = 14, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path fill={color} d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0C5.6 0 .2 5.3.2 11.9c0 2.1.6 4.1 1.6 5.9L.1 24l6.4-1.7a11.8 11.8 0 0 0 5.6 1.4C18.7 23.8 24 18.4 24 11.9c0-3.2-1.2-6.2-3.5-8.4Zm-8.4 18.3a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.8 1 1-3.7-.2-.4a9.9 9.9 0 1 1 8.4 4.7Zm5.4-7.4c-.3-.2-1.8-.9-2-.9-.3-.1-.5-.2-.7.1-.2.3-.8 1-.9 1.2-.2.2-.4.2-.7.1-.3-.2-1.2-.5-2.4-1.5-.9-.8-1.5-1.8-1.6-2-.2-.3 0-.5.1-.6.1-.2.3-.4.5-.6.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.2-.7-1.6-.9-2.2-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.3Z"/></svg>;
}

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

  const waUrl = `https://wa.me/${HELP_CONTACT.waNumber}?text=${encodeURIComponent(HELP_CONTACT.waMessage)}`;

  return (
    <div className="gandeng-shell" style={{ "--blue":"#125AE8", "--navy":"#0B46C8", "--blue-soft":"#EAF1FF", "--danger":"#E53935", "--danger-soft":"#FDECEC" }}>
      <header className="app-topbar gandeng-topbar" style={{ position:"sticky",top:0,zIndex:30,background:T.topbarBg,backdropFilter:"blur(8px)",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,minHeight:58,flexShrink:0 }}>
        <div style={{display:"flex",alignItems:"center",gap:6,minWidth:0,flex:1}}>
          <span className="hide-mobile" style={{fontSize:12.5,fontWeight:800,color:"#125AE8",whiteSpace:"nowrap"}}>GANDENG</span>
          <ChevronRight size={13} color={T.muted} className="hide-mobile" />
          <span style={{fontSize:13,fontWeight:800,color:T.heading,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{activeLabel}</span>
        </div>

        {/* Admin contact — hanya tampil di halaman Bantuan */}
        {active === "bantuan" && (
          <div className="gandeng-admin-contact hide-mobile" style={{display:"flex",alignItems:"center",gap:6,padding:"5px 6px 5px 10px",background:"#EAF1FF",borderRadius:10,border:"1px solid #C7DAFF",flexShrink:0}}>
            <WhatsAppIcon size={13} color="#125AE8"/>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{fontSize:12,fontWeight:800,color:"#125AE8",textDecoration:"none",whiteSpace:"nowrap"}}>{HELP_CONTACT.phone}</a>
            <div style={{width:1,height:16,background:"#C7DAFF",margin:"0 2px"}}/>
            <a href={`tel:${HELP_CONTACT.waNumber}`} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 8px",borderRadius:7,background:"#125AE8",color:"#fff",fontSize:11.5,fontWeight:700,textDecoration:"none",whiteSpace:"nowrap"}}>
              <Phone size={11}/>Telepon
            </a>
          </div>
        )}

        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <div style={{width:30,height:30,borderRadius:"50%",background:"#125AE8",color:"#fff",display:"grid",placeItems:"center",fontWeight:800,fontSize:12,flexShrink:0}}>
            {identityTitle.charAt(0).toUpperCase()}
          </div>
          <span className="hide-mobile" style={{fontSize:12.5,fontWeight:700,color:T.text,maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{identityTitle}</span>
        </div>
      </header>
      <div className="gandeng-shell-body">
        <GandengSidebar active={active} onSelect={setActive} onLogout={onBackToPortal} user={user} />
        <div className="gandeng-main">
          <div key={active} style={{ animation: "fade-in .2s ease" }}>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
