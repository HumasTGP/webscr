import { useState } from "react";
import { T, font } from "../../lib/theme";
import MitraSidebar from "../components/MitraSidebar";
import MitraDashboard from "./MitraDashboard";
import MitraTracking from "./MitraTracking";
import MitraBantuan from "./MitraBantuan";
import PengajuanMitraPage from "./PengajuanMitra";

export default function MitraApp({ mitraList, setMitraList, notify, onBackToPortal, user, onLogout }) {
  const [active, setActive] = useState("dashboard");

  const renderContent = () => {
    switch (active) {
      case "dashboard":
        return <MitraDashboard mitraList={mitraList} user={user} onGoto={setActive} />;
      case "pengajuan-baru":
      case "riwayat":
        return (
          <div style={{ padding: "clamp(18px, 3vw, 28px) clamp(16px, 4vw, 32px)" }}>
            <PengajuanMitraPage
              mitraList={mitraList}
              setMitraList={setMitraList}
              user={user}
              notify={notify}
              onBackToPortal={null}
            />
          </div>
        );
      case "tracking":
        return <MitraTracking mitraList={mitraList} />;
      case "bantuan":
        return <MitraBantuan />;
      default:
        return <MitraDashboard mitraList={mitraList} user={user} onGoto={setActive} />;
    }
  };

  const activeLabel = {
    dashboard: "Dashboard",
    "pengajuan-baru": "Pengajuan Baru",
    riwayat: "Riwayat Pengajuan",
    tracking: "Tracking Status",
    bantuan: "Bantuan",
  }[active] || "Dashboard";

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      overflow: "hidden",
      background: T.bg,
      fontFamily: font.body,
      color: T.text,
    }}>
      <MitraSidebar
        active={active}
        onSelect={setActive}
        onLogout={onLogout}
        onBackToPortal={onBackToPortal}
      />

      <div style={{
        flex: 1,
        minWidth: 0,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}>
        <div style={{
          position: "sticky", top: 0, zIndex: 10,
          background: T.topbarBg,
          backdropFilter: "blur(6px)",
          borderBottom: `1px solid ${T.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          minHeight: 54,
          padding: "0 clamp(14px, 3vw, 28px)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
            <span style={{ fontSize: 13, color: T.muted, whiteSpace: "nowrap" }}>GANDENG</span>
            <span style={{ fontSize: 13, color: T.muted }}>›</span>
            <span style={{
              fontSize: 13,
              fontWeight: 700,
              color: T.heading,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {activeLabel}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "#0E4C92",
              display: "grid", placeItems: "center",
            }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>
                {(user?.name || "G").charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="hide-mobile">
              <div style={{ fontSize: 13, fontWeight: 600, color: T.heading, lineHeight: 1.2 }}>
                {user?.name || "Pengguna GANDENG"}
              </div>
              <div style={{ fontSize: 11, color: T.muted }}>GANDENG</div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 0 }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
