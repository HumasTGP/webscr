import { useRef, useState } from "react";
import { Calendar, Check, FileText, Trash2, Upload, X } from "lucide-react";
import { T, font } from "../lib/theme";

const baseInput = (disabled) => ({
  width: "100%",
  padding: "9px 11px",
  borderRadius: 7,
  border: `1px solid ${T.border}`,
  background: disabled ? T.bg : T.inputBg,
  color: disabled ? T.muted : T.text,
  fontFamily: font.body,
  fontSize: 13.5,
  outline: "none",
});

export default function FieldInput({ field, value, onChange }) {
  const commonStyle = baseInput(field.disabled);
  const disabled = field.disabled;

  if (field.type === "select") {
    const inManualMode = field.allowManual && value === "__manual__";
    const typedOutside =
      field.allowManual &&
      value &&
      value !== "__manual__" &&
      !(field.options || []).includes(value);

    if (inManualMode || typedOutside) {
      return (
        <div style={{ display: "flex", gap: 6 }}>
          <input
            type="text"
            autoFocus
            disabled={disabled}
            style={commonStyle}
            value={value === "__manual__" ? "" : value}
            placeholder={field.placeholder || `Ketik ${field.label.toLowerCase()} manual…`}
            onChange={(e) => onChange(e.target.value || "__manual__")}
          />
          <button
            type="button"
            title="Kembali ke pilihan"
            onClick={() => onChange("")}
            style={{
              flexShrink: 0,
              width: 38,
              borderRadius: 7,
              border: `1px solid ${T.border}`,
              background: T.bg,
              color: T.muted,
              cursor: "pointer",
            }}
          >
            <X size={14} />
          </button>
        </div>
      );
    }

    return (
      <select
        disabled={disabled}
        style={commonStyle}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Pilih {field.label.toLowerCase()}…</option>
        {(field.options || []).map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
        {field.allowManual && <option value="__manual__">✎ Isi manual…</option>}
      </select>
    );
  }

  if (field.type === "textarea") {
    return (
      <textarea
        disabled={disabled}
        style={commonStyle}
        rows={3}
        value={value ?? ""}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  if (field.type === "file-upload") {
    return (
      <RealFileUpload
        field={field}
        value={value}
        onChange={onChange}
        disabled={disabled}
        commonStyle={commonStyle}
      />
    );
  }

  if (field.type === "file") {
    return (
      <div
        role="button"
        tabIndex={0}
        style={{
          ...commonStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: T.muted,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
        onClick={() => !disabled && onChange(value ? "" : "evidence-foto.pdf")}
      >
        <span>{value || "Klik untuk pilih file (PDF, maks 2 MB)"}</span>
        <FileText size={15} />
      </div>
    );
  }

  if (field.type === "checkgroup") {
    const selected = Array.isArray(value)
      ? value
      : value
      ? String(value).split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    const toggle = (opt) => {
      if (disabled) return;
      const next = selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt];
      onChange(next);
    };
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {(field.options || []).map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              type="button"
              key={opt}
              onClick={() => toggle(opt)}
              disabled={disabled}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 999,
                border: `1px solid ${active ? T.navy : T.border}`,
                background: active ? T.navy : T.card,
                color: active ? "#fff" : T.text,
                fontSize: 12.5,
                fontFamily: font.body,
                fontWeight: active ? 700 : 500,
                cursor: disabled ? "not-allowed" : "pointer",
              }}
            >
              {active && <Check size={12} />}
              {opt}
            </button>
          );
        })}
      </div>
    );
  }

  if (field.type === "date") {
    const openPicker = (e) => {
      if (!disabled && typeof e.currentTarget.showPicker === "function") {
        try {
          e.currentTarget.showPicker();
        } catch {

        }
      }
    };
    return (
      <div style={{ position: "relative" }}>
        <input
          disabled={disabled}
          type="date"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          onClick={openPicker}
          onFocus={openPicker}
          style={{
            ...commonStyle,
            paddingRight: 36,
            cursor: disabled ? "not-allowed" : "pointer",
            colorScheme: "light dark",
          }}
        />
        <Calendar
          size={15}
          color={disabled ? T.muted : T.blue}
          style={{
            position: "absolute",
            right: 11,
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
          }}
        />
      </div>
    );
  }

  return (
    <input
      disabled={disabled}
      style={commonStyle}
      type={field.type || "text"}
      value={value ?? ""}
      placeholder={field.placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_UPLOAD_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALLOWED_UPLOAD_EXT = [".pdf", ".doc", ".docx"];

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function RealFileUpload({ field, value, onChange, disabled, commonStyle }) {
  const inputRef = useRef(null);
  const [error, setError] = useState("");

  const pick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleFile = (file) => {
    if (!file) return;
    const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
    const typeOk = ALLOWED_UPLOAD_TYPES.includes(file.type) || ALLOWED_UPLOAD_EXT.includes(ext);
    if (!typeOk) {
      setError("Format file harus PDF atau Word (.pdf, .doc, .docx).");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError("Ukuran file melebihi 5MB.");
      return;
    }
    setError("");
    onChange(file);
  };

  const clear = (e) => {
    e.stopPropagation();
    setError("");
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={pick}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && pick()}
        style={{
          ...commonStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: value ? T.text : T.muted,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {value
            ? `${value.name} · ${formatBytes(value.size)}`
            : field.placeholder || "Klik untuk pilih file PDF/Word (maks 5MB)"}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {value && !disabled && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Hapus file"
              title="Hapus file"
              onClick={clear}
              onKeyDown={(e) => e.key === "Enter" && clear(e)}
              style={{ display: "flex", color: T.muted }}
            >
              <Trash2 size={14} />
            </span>
          )}
          <Upload size={15} />
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_UPLOAD_EXT.join(",")}
        disabled={disabled}
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error && (
        <div style={{ color: T.danger, fontSize: 11.5, marginTop: 4 }}>{error}</div>
      )}
    </div>
  );
}
