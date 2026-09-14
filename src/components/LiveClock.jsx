import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { T, font } from "../lib/theme";

export default function LiveClock({ style = {} }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const dateStr = now.toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("id-ID", {
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  });
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 12px", borderRadius: 8,
      background: T.blueSoft, border: `1px solid ${T.border}`,
      fontSize: 12.5, color: T.blue, fontWeight: 600,
      fontFamily: font.mono,
      ...style,
    }}>
      <Clock size={13} />
      {dateStr} • {timeStr} WIB
    </div>
  );
}
