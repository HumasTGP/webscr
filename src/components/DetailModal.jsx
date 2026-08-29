import { useEffect, useState } from "react";
import { Check, Download, Eye, FileText } from "lucide-react";
import { T } from "../lib/theme";
import Modal from "./Modal";
import Button from "./Button";

export default function DetailModal({
  open,
  onClose,
  data,
  columns,
  onSave,
  onEdit,
  onDownloadPdf,
  onDownloadDocx,
  startEditing = false,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});

  useEffect(() => {
    if (data) setDraft({ ...data });
    setEditing(startEditing);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (!open || !data) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit Data" : "Detail Data"}
      icon={editing ? FileText : Eye}
      width={560}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "flex-start",
          gap: "10px 20px",
          marginBottom: 20,
        }}
      >
        {columns
          .filter((c) => c.key !== "aksi")
          .map((c) => (
            <div
              key={c.key}
              style={{
                flex: "1 1 200px",
                maxWidth: 320,
                minWidth: 0,
                borderBottom: `1px solid ${T.border}`,
                paddingBottom: 8,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: T.muted,
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                }}
              >
                {c.label}
              </div>
              {editing ? (
                <input
                  value={draft[c.key] ?? ""}
                  onChange={(e) => setDraft({ ...draft, [c.key]: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: `1px solid ${T.border}`,
                    background: T.inputBg,
                    color: T.text,
                    fontSize: 13,
                    marginTop: 4,
                  }}
                />
              ) : (
                <div
                  style={{
                    fontSize: 13.5,
                    color: T.text,
                    fontWeight: 500,
                    marginTop: 2,
                    overflowWrap: "break-word",
                  }}
                >
                  {c.render ? c.render(data) : (data[c.key] ?? "-")}
                </div>
              )}
            </div>
          ))}
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
        {onDownloadDocx && !editing && (
          <Button variant="ghost" icon={Eye} onClick={() => onDownloadDocx(data)}>
            Preview &amp; Unduh
          </Button>
        )}
        {onDownloadPdf && !editing && (
          <Button variant="ghost" icon={Download} onClick={() => onDownloadPdf(data)}>
            Unduh PDF
          </Button>
        )}
        {onEdit && !editing && (
          <Button variant="ghost" onClick={() => onEdit(data)}>
            Edit
          </Button>
        )}
        {!onEdit && onSave && !editing && (
          <Button variant="ghost" onClick={() => setEditing(true)}>
            Edit
          </Button>
        )}
        {editing && (
          <>
            <Button variant="ghost" onClick={() => setEditing(false)}>
              Batal
            </Button>
            <Button
              icon={Check}
              onClick={() => {
                onSave(draft);
                onClose();
              }}
            >
              Simpan
            </Button>
          </>
        )}
        {!editing && <Button onClick={onClose}>Tutup</Button>}
      </div>
    </Modal>
  );
}