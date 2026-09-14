import React from "react";
import { Check, ChevronRight } from "lucide-react";
import { T, font } from "../lib/theme";

export default function FlowSteps({ steps, current }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        marginBottom: 24,
        flexWrap: "nowrap",
        overflowX: "auto",
        paddingBottom: 4,
      }}
    >
      {steps.map((s, i) => {
        const active = i === current;
        const done = i < current;
        return (
          <React.Fragment key={s}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 12px",
                borderRadius: 999,
                background: active ? T.navy : done ? T.blueSoft : T.bg,
                color: active ? "#fff" : done ? T.blue : T.muted,
                border: `1px solid ${active ? T.navy : T.border}`,
                fontSize: 12.5,
                fontWeight: 600,
                fontFamily: font.body,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: active ? T.yellow : done ? T.blue : T.border,
                  color: active ? T.navyDeep : "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 10,
                  fontFamily: font.mono,
                }}
              >
                {done ? <Check size={11} /> : i + 1}
              </span>
              {s}
            </div>
            {i < steps.length - 1 && <ChevronRight size={14} color={T.border} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}