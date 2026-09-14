import { createContext, useContext, useId } from "react";
import organizationMaster from "../lib/organizationMaster.json";
import { T } from "../lib/theme";

export const OrganizationContext = createContext({ entities: organizationMaster, addEntity: null });
export default function OrganizationInput({ value, onChange, disabled, readOnly, required, style, placeholder = "Cari Vendor / Instansi / Lembaga…" }) {
  const { entities, addEntity } = useContext(OrganizationContext);
  const id = useId();
  return <>
    <input list={id} value={value || ""} onChange={(e) => onChange?.(e.target.value)} disabled={disabled} readOnly={readOnly} required={required} placeholder={placeholder}
      style={{ width: "100%", minWidth: 0, boxSizing: "border-box", padding: "9px 11px", borderRadius: 7, border: `1px solid ${T.border}`, background: T.inputBg, color: T.text, fontFamily: "inherit", ...style }} />
    <datalist id={id}>{entities.map((entity) => <option key={entity.id} value={entity.name ?? entity.nama}>{entity.source_id ?? entity.id}</option>)}</datalist>
    {!disabled && !readOnly && addEntity && value?.trim() && !entities.some(e => (e.name ?? e.nama) === value) && <button type="button" onClick={() => addEntity(value)} style={{ marginTop: 4, color: T.blue, background: "transparent", border: 0, cursor: "pointer", fontSize: 12 }}>Tambah ke master organisasi</button>}
  </>;
}
