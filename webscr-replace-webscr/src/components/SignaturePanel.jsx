import { Check } from "lucide-react";
import { T, font } from "../lib/theme";
import Button from "./Button";
import { formatSignedAt } from "../lib/signature";

/**
 * Panel "Section 2" - tanda tangan pengesahan, dipakai di ReviewModal RAB dan
 * Proposal. Dua slot berdampingan (Asman, MADM), masing-masing menampilkan
 * gambar tanda tangan besar kalau sudah TTD, atau tombol TTD kalau gilirannya
 * user yang sedang login.
 *
 * Props:
 *  - asman/madm: null (belum TTD) atau { signatureUrl, signatureName, signedAt }
 *  - canSignAsman/canSignMadm: boolean, true kalau tombol TTD harus tampil
 *  - onSignAsman/onSignMadm: handler saat tombol TTD diklik
 *  - note: opsional, catatan tertulis (dipakai untuk RAB - "Catatan Asman")
 */
export default function SignaturePanel({
  asman, madm, canSignAsman, canSignMadm, onSignAsman, onSignMadm, note, noteLabel = "Catatan Asman",
}) {
  return (
    <div style={{ marginTop: 4 }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: T.blue, textTransform: "uppercase",
        letterSpacing: 0.4, margin: "10px 0 10px", textAlign: "center",
      }}>
        Tanda tangan pengesahan
      </div>

      {note && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 6, color: T.text }}>{noteLabel}</div>
          <div style={{
            border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px",
            fontSize: 12.5, color: T.text, background: T.bg,
          }}>
            {note}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        <SignatureSlot label="Asman" stamp={asman} canSign={canSignAsman} onSign={onSignAsman} />
        <SignatureSlot label="MADM" stamp={madm} canSign={canSignMadm} onSign={onSignMadm} />
      </div>
    </div>
  );
}

function SignatureSlot({ label, stamp, canSign, onSign }) {
  return (
    <div style={{ flex: "1 1 220px", minWidth: 220 }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: T.text }}>{label}</div>
      {stamp ? (
        <>
          <div style={{
            width: "100%", maxWidth: 220, height: 84, border: `1.5px solid ${T.border}`,
            borderRadius: 10, background: "#fff", display: "flex", alignItems: "center",
            justifyContent: "center", overflow: "hidden", padding: 6,
          }}>
            {stamp.signatureUrl ? (
              <img
                src={stamp.signatureUrl}
                alt={`Tanda tangan ${stamp.signatureName || label}`}
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
              />
            ) : (
              // Fallback kalau signatureUrl kosong (belum pernah upload gambar) -
              // tetap tampilkan nama biar tidak kosong melompong.
              <span style={{ fontFamily: font.display, fontStyle: "italic", fontWeight: 600, fontSize: 20, color: T.blue }}>
                {stamp.signatureName || label}
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginTop: 6 }}>
            {stamp.signatureName || label}
          </div>
          <div style={{ fontSize: 11.5, color: T.muted, marginTop: 1 }}>
            Ditandatangani {formatSignedAt(stamp.signedAt)}
          </div>
        </>
      ) : canSign ? (
        <Button icon={Check} onClick={onSign}>Tanda tangan</Button>
      ) : (
        <div style={{
          width: "100%", maxWidth: 220, height: 84, border: `1.5px dashed ${T.border}`,
          borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, color: T.muted, textAlign: "center", padding: "0 12px",
        }}>
          Belum ditandatangani
        </div>
      )}
    </div>
  );
}
