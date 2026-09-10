import { createContext, useContext, useId } from "react";
import { T } from "../lib/theme";

// The existing App vendors state remains the only master; IDs/names are unchanged.
export const OrganizationContext = createContext([]);
export default function OrganizationInput({ value, onChange, disabled, style, placeholder = "Cari Vendor / Instansi / Lembaga…" }) {
  const vendors = useContext(OrganizationContext);
  const id = useId();
  return <>
    <input list={id} value={value || ""} onChange={(e) => onChange?.(e.target.value)} disabled={disabled} placeholder={placeholder}
      style={{ width: "100%", minWidth: 0, boxSizing: "border-box", padding: "9px 11px", borderRadius: 7, border: `1px solid ${T.border}`, background: T.inputBg, color: T.text, fontFamily: "inherit", ...style }} />
    <datalist id={id}>{vendors.map((v) => <option key={v.id} value={v.nama}>{v.id}</option>)}</datalist>
  </>;
}
