import { T, font } from "../../lib/theme";
import SilapakSidebar from "./SilapakSidebar";

export default function SilapakShell({ active, onSelect, onLogout, children }) {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: T.bg,
        fontFamily: font.body,
        color: T.text,
      }}
    >
      <SilapakSidebar active={active} onSelect={onSelect} onLogout={onLogout} />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <div
          key={active}
          style={{
            width: "100%",
            maxWidth: 980,
            margin: "0 auto",
            padding: "28px 24px 60px",
            animation: "fade-in .2s ease",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
