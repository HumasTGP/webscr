import { useState } from "react";
import { FileText, Plus, Trash2, Save, Printer } from "lucide-react";
import { T, font } from "../../lib/theme";
import { uid, rupiah } from "../../lib/utils";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";

export default function Lampiran1Page({ rab, notify }) {
  const [data, setData] = useState({});
  const [activeRab, setActiveRab] = useState(null);

  const getItems = (rabId) => data[rabId] || [];
  const setItems = (rabId, items) => setData((prev) => ({ ...prev, [rabId]: items }));

  const addItem = () => {
    if (!activeRab) return;
    const items = getItems(activeRab.idNumber);
    setItems(activeRab.idNumber, [...items, {
      id: uid("LP1"),
      uraian: "", volume: "", satuan: "", hargaSatuan: "",
    }]);
  };

  const updateItem = (idx, key, value) => {
    if (!activeRab) return;
    const items = [...getItems(activeRab.idNumber)];
    items[idx] = { ...items[idx], [key]: value };
    setItems(activeRab.idNumber, items);
  };

  const removeItem = (idx) => {
    if (!activeRab) return;
    const items = getItems(activeRab.idNumber).filter((_, i) => i !== idx);
    setItems(activeRab.idNumber, items);
  };

  const handlePrint = () => {
    if (!activeRab) return;
    const items = getItems(activeRab.idNumber);
    const win = window.open("", "_blank", "width=850,height=960");
    if (!win) return;
    const rows = items.map((item, i) => {
      const total = (Number(item.volume) || 0) * (Number(item.hargaSatuan) || 0);
      return `<tr>
        <td style="border:1px solid #333;padding:6px 8px;text-align:center;">${i + 1}</td>
        <td style="border:1px solid #333;padding:6px 10px;">${item.uraian || "-"}</td>
        <td style="border:1px solid #333;padding:6px 8px;text-align:center;">${item.volume || "-"}</td>
        <td style="border:1px solid #333;padding:6px 8px;text-align:center;">${item.satuan || "-"}</td>
        <td style="border:1px solid #333;padding:6px 8px;text-align:right;">${(Number(item.hargaSatuan) || 0).toLocaleString("id-ID")}</td>
        <td style="border:1px solid #333;padding:6px 8px;text-align:right;">${total.toLocaleString("id-ID")}</td>
      </tr>`;
    }).join("");
    const grandTotal = items.reduce((s, item) => s + (Number(item.volume) || 0) * (Number(item.hargaSatuan) || 0), 0);
    win.document.write(`<!doctype html><html><head><meta charset="utf-8" /><title>Lampiran 1 - ${activeRab.idNumber}</title>
      <style>body{font-family:Arial,sans-serif;padding:32px;color:#111;}h1{font-size:16px;margin:0 0 4px;text-align:center;}
      .sub{text-align:center;color:#555;font-size:12px;margin-bottom:22px;}
      table{width:100%;border-collapse:collapse;font-size:12px;}th{border:1px solid #333;padding:6px 8px;background:#EFEFEF;}</style>
    </head><body>
      <h1>LAMPIRAN 1 - RINCIAN PEKERJAAN</h1>
      <div class="sub">${activeRab.idNumber} - ${activeRab.judulKegiatan}</div>
      <table><thead><tr><th>No</th><th>Uraian Pekerjaan</th><th>Vol</th><th>Satuan</th><th>Harga Satuan</th><th>Jumlah</th></tr></thead>
      <tbody>${rows}
      <tr style="font-weight:700;"><td colspan="5" style="border:1px solid #333;padding:6px 10px;text-align:right;">TOTAL</td>
      <td style="border:1px solid #333;padding:6px 8px;text-align:right;">${grandTotal.toLocaleString("id-ID")}</td></tr>
      </tbody></table>
      <script>window.onload=function(){window.print();};</script>
    </body></html>`);
    win.document.close();
  };

  const inputStyle = {
    width: "100%", padding: "8px 10px", borderRadius: 6,
    border: `1px solid ${T.border}`, background: T.inputBg,
    fontSize: 12.5, color: T.text, boxSizing: "border-box",
  };

  return (
    <div>
      <PageHeader
        eyebrow="Pembayaran"
        title="Lampiran 1 - Rincian Pekerjaan"
        description="Detail rincian pekerjaan per kegiatan RAB."
      />

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.heading, marginBottom: 10 }}>Pilih RAB</div>
          {(!rab || rab.length === 0) ? (
            <div style={{ fontSize: 12.5, color: T.muted }}>Belum ada RAB.</div>
          ) : (
            <div style={{ display: "grid", gap: 6 }}>
              {rab.map((r) => (
                <button key={r.idNumber} onClick={() => setActiveRab(r)} style={{
                  padding: "10px 12px", borderRadius: 8, textAlign: "left",
                  border: `1px solid ${activeRab?.idNumber === r.idNumber ? T.blue : T.border}`,
                  background: activeRab?.idNumber === r.idNumber ? T.blueSoft : T.bg,
                  cursor: "pointer", fontSize: 12,
                }}>
                  <div style={{ fontFamily: font.mono, fontWeight: 700, color: T.blue }}>{r.idNumber}</div>
                  <div style={{ fontSize: 11.5, color: T.muted, marginTop: 2 }}>{r.judulKegiatan}</div>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card>
          {!activeRab ? (
            <div style={{ padding: "32px 0", textAlign: "center", color: T.muted, fontSize: 14 }}>
              Pilih RAB di sebelah kiri.
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <div style={{ fontFamily: font.mono, fontSize: 12, fontWeight: 700, color: T.blue }}>{activeRab.idNumber}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.heading }}>{activeRab.judulKegiatan}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={addItem} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 14px", borderRadius: 8, border: "none",
                    background: T.blue, color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600,
                  }}><Plus size={14} /> Tambah Baris</button>
                  <button onClick={handlePrint} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 14px", borderRadius: 8, border: `1px solid ${T.border}`,
                    background: T.card, color: T.heading, cursor: "pointer", fontSize: 12, fontWeight: 600,
                  }}><Printer size={14} /> Cetak</button>
                </div>
              </div>

              {getItems(activeRab.idNumber).length === 0 ? (
                <div style={{ padding: "20px 0", textAlign: "center", color: T.muted, fontSize: 13 }}>
                  Belum ada item. Klik "Tambah Baris" untuk mulai.
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                    <thead>
                      <tr style={{ background: T.bg }}>
                        <th style={{ padding: "8px 10px", textAlign: "left", borderBottom: `1px solid ${T.border}`, width: 36 }}>No</th>
                        <th style={{ padding: "8px 10px", textAlign: "left", borderBottom: `1px solid ${T.border}` }}>Uraian Pekerjaan</th>
                        <th style={{ padding: "8px 10px", textAlign: "center", borderBottom: `1px solid ${T.border}`, width: 70 }}>Vol</th>
                        <th style={{ padding: "8px 10px", textAlign: "center", borderBottom: `1px solid ${T.border}`, width: 80 }}>Satuan</th>
                        <th style={{ padding: "8px 10px", textAlign: "right", borderBottom: `1px solid ${T.border}`, width: 120 }}>Harga Satuan</th>
                        <th style={{ padding: "8px 10px", textAlign: "right", borderBottom: `1px solid ${T.border}`, width: 120 }}>Jumlah</th>
                        <th style={{ padding: "8px 10px", borderBottom: `1px solid ${T.border}`, width: 40 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {getItems(activeRab.idNumber).map((item, i) => {
                        const total = (Number(item.volume) || 0) * (Number(item.hargaSatuan) || 0);
                        return (
                          <tr key={item.id}>
                            <td style={{ padding: "6px 10px", borderBottom: `1px solid ${T.border}` }}>{i + 1}</td>
                            <td style={{ padding: "6px 10px", borderBottom: `1px solid ${T.border}` }}>
                              <input style={inputStyle} value={item.uraian} onChange={(e) => updateItem(i, "uraian", e.target.value)} placeholder="Uraian pekerjaan" />
                            </td>
                            <td style={{ padding: "6px 10px", borderBottom: `1px solid ${T.border}` }}>
                              <input style={{ ...inputStyle, textAlign: "center" }} type="number" value={item.volume} onChange={(e) => updateItem(i, "volume", e.target.value)} />
                            </td>
                            <td style={{ padding: "6px 10px", borderBottom: `1px solid ${T.border}` }}>
                              <input style={{ ...inputStyle, textAlign: "center" }} value={item.satuan} onChange={(e) => updateItem(i, "satuan", e.target.value)} placeholder="Unit" />
                            </td>
                            <td style={{ padding: "6px 10px", borderBottom: `1px solid ${T.border}` }}>
                              <input style={{ ...inputStyle, textAlign: "right" }} type="number" value={item.hargaSatuan} onChange={(e) => updateItem(i, "hargaSatuan", e.target.value)} />
                            </td>
                            <td style={{ padding: "6px 10px", borderBottom: `1px solid ${T.border}`, textAlign: "right", fontWeight: 600 }}>
                              {rupiah(total)}
                            </td>
                            <td style={{ padding: "6px 10px", borderBottom: `1px solid ${T.border}`, textAlign: "center" }}>
                              <button onClick={() => removeItem(i)} title="Hapus" style={{
                                background: "transparent", border: "none", color: T.danger, cursor: "pointer", padding: 2,
                              }}><Trash2 size={14} /></button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {getItems(activeRab.idNumber).length > 0 && (
                <div style={{ textAlign: "right", marginTop: 10, fontWeight: 700, fontSize: 14, color: T.heading }}>
                  Total: {rupiah(getItems(activeRab.idNumber).reduce((s, item) => s + (Number(item.volume) || 0) * (Number(item.hargaSatuan) || 0), 0))}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
