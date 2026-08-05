import { useState } from "react";
import { T } from "../../lib/theme";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import { SHIFTS, SATPAM_SEED } from "../../lib/silapakData";

export function DutyBanner({ duty, onOpen }) {
  const hasDuty = duty && duty.names.length > 0;
  const shiftLabel = SHIFTS.find((s) => s.value === duty?.shift)?.label;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        background: hasDuty ? T.blueSoft : "#FDF3DD",
        border: `1px solid ${hasDuty ? T.blue : "#F0DBA6"}`,
        borderRadius: 10,
        padding: "12px 16px",
        marginBottom: 20,
      }}
    >
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: hasDuty ? T.blue : "#B7791F" }}>
          {hasDuty ? `Shift ${shiftLabel} · ${duty.names.join(", ")}` : "Belum ada satpam bertugas dipilih"}
        </div>
        <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
          {hasDuty
            ? "Ketuk untuk mengganti satpam bertugas atau pindah shift"
            : "Pilih nama terlebih dulu agar tercatat di setiap paket dan kunjungan"}
        </div>
      </div>
      <Button variant="ghost" onClick={onOpen} style={{ fontSize: 12, padding: "8px 14px" }}>
        {hasDuty ? "Ubah" : "Pilih nama"}
      </Button>
    </div>
  );
}

export function DutyPickerModal({ open, onClose, duty, onSave, satpamList, onAddSatpam }) {
  const [shift, setShift] = useState(duty?.shift || "pagi");
  const [checked, setChecked] = useState(duty?.names || []);
  const [newName, setNewName] = useState("");

  const toggle = (name) => {
    setChecked((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const addFreeName = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (!satpamList.includes(trimmed)) onAddSatpam(trimmed);
    if (!checked.includes(trimmed)) setChecked((prev) => [...prev, trimmed]);
    setNewName("");
  };

  const save = () => {
    onSave({ shift, names: checked });
    onClose();
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Satpam bertugas hari ini">
      <p style={{ fontSize: 12, color: T.muted, margin: "0 0 16px" }}>
        Nama yang dicentang akan tercatat otomatis pada paket dan kunjungan yang diproses
        selama shift berlangsung.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {SHIFTS.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setShift(s.value)}
            style={{
              flex: 1,
              textAlign: "center",
              padding: 10,
              borderRadius: 10,
              border: `1px solid ${shift === s.value ? T.navy : T.border}`,
              background: shift === s.value ? T.navy : T.card,
              color: shift === s.value ? "#fff" : T.muted,
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700 }}>{s.label}</div>
            <div style={{ fontSize: 9.5, opacity: 0.8, marginTop: 2 }}>{s.time}</div>
          </button>
        ))}
      </div>

      {satpamList.map((name) => {
        const isChecked = checked.includes(name);
        return (
          <button
            key={name}
            type="button"
            onClick={() => toggle(name)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              border: `1px solid ${isChecked ? T.blue : T.border}`,
              background: isChecked ? T.blueSoft : T.card,
              borderRadius: 10,
              padding: "11px 14px",
              marginBottom: 8,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                border: `1.5px solid ${isChecked ? T.blue : "#B7BFCC"}`,
                background: isChecked ? T.blue : "transparent",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 10,
              }}
            >
              {isChecked ? "✓" : ""}
            </div>
            <span style={{ fontSize: 12, color: T.text }}>{name}</span>
          </button>
        );
      })}

      <div
        style={{
          display: "flex",
          gap: 8,
          border: `1px dashed ${T.border}`,
          borderRadius: 10,
          padding: "8px 10px",
          marginTop: 10,
          alignItems: "center",
        }}
      >
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Ketik nama satpam baru jika belum ada di daftar"
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: 12,
            background: "transparent",
            color: T.text,
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addFreeName();
            }
          }}
        />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addFreeName();
          }}
          disabled={!newName.trim()}
          style={{
            padding: "7px 14px",
            fontSize: 11,
            fontWeight: 600,
            borderRadius: 8,
            border: `1px solid ${T.border}`,
            background: newName.trim() ? T.bg : "transparent",
            color: newName.trim() ? T.text : T.muted,
            cursor: newName.trim() ? "pointer" : "not-allowed",
            flexShrink: 0,
          }}
        >
          Tambah
        </button>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          save();
        }}
        style={{
          width: "100%",
          marginTop: 18,
          padding: "11px",
          borderRadius: 8,
          border: "none",
          background: T.navy,
          color: "#fff",
          fontWeight: 700,
          fontSize: 13.5,
          cursor: "pointer",
        }}
      >
        Simpan satpam bertugas
      </button>
    </Modal>
  );
}

export const defaultSatpamList = SATPAM_SEED;
