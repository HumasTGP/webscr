import { useState } from "react";
import { HelpCircle, Phone, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { T, font } from "../../lib/theme";
import { HELP_CONTACT } from "../../lib/helpContact";

const PANDUAN_STEPS = [
  { step: 1, judul: "Login ke GANDENG", desc: "Masuk menggunakan username dan password yang telah diberikan oleh admin PLN." },
  { step: 2, judul: "Buat Pengajuan Baru", desc: "Klik menu Pengajuan Baru, lalu isi formulir proposal dengan lengkap." },
  { step: 3, judul: "Kirim Pengajuan", desc: "Pengajuan yang dikirim akan masuk ke antrean pemeriksaan Humas." },
  { step: 4, judul: "Pantau Status", desc: "Gunakan Tracking Status untuk memantau tahapan Humas → ASMAN → MADM." },
  { step: 5, judul: "Lihat Catatan Review", desc: "Keputusan dan catatan reviewer dapat dilihat pada detail serta riwayat pengajuan." },
];

const FAQS = [
  {
    q: "Bagaimana alur review pengajuan GANDENG?",
    a: "Pengajuan masuk ke Humas, kemudian diteruskan ke ASMAN dan MADM sesuai hasil pemeriksaan pada setiap tahap.",
  },
  {
    q: "Apa yang harus dilakukan jika pengajuan dikembalikan atau ditolak?",
    a: "Buka detail pengajuan untuk melihat catatan reviewer. Catatan tersebut menjadi acuan untuk perbaikan atau pengajuan kembali.",
  },
  {
    q: "Apakah pengajuan yang sudah dikirim dapat diubah langsung?",
    a: "Pengajuan yang sudah dikirim tidak diubah langsung agar riwayat review tetap konsisten. Hubungi admin melalui WhatsApp apabila diperlukan tindak lanjut.",
  },
];

function WhatsAppIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20.52 3.48A11.82 11.82 0 0 0 12.1 0C5.56 0 .24 5.32.24 11.86c0 2.09.55 4.13 1.59 5.93L.14 24l6.36-1.67a11.84 11.84 0 0 0 5.6 1.43h.01C18.65 23.76 24 18.44 24 11.9c0-3.18-1.24-6.17-3.48-8.42Zm-8.41 18.28h-.01a9.83 9.83 0 0 1-5.01-1.37l-.36-.21-3.77.99 1.01-3.68-.23-.38a9.86 9.86 0 0 1-1.51-5.25C2.23 6.43 6.66 2 12.1 2c2.64 0 5.12 1.03 6.98 2.9a9.8 9.8 0 0 1 2.9 6.99c0 5.44-4.43 9.87-9.87 9.87Zm5.41-7.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.95 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47a8.93 8.93 0 0 1-1.64-2.04c-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.08-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.19 1.87.12.57-.08 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" fill={color} />
    </svg>
  );
}

function FAQItem({ faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden", marginBottom: 10 }}>
      <button onClick={() => setOpen((p) => !p)} style={{
        width: "100%", padding: "14px 18px", display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: 12, background: open ? T.blueSoft : T.card,
        border: "none", cursor: "pointer", fontFamily: font.body, textAlign: "left",
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: T.heading, lineHeight: 1.5 }}>{faq.q}</span>
        {open ? <ChevronUp size={16} color={T.muted} /> : <ChevronDown size={16} color={T.muted} />}
      </button>
      {open && (
        <div style={{ padding: "14px 18px", background: T.card, borderTop: `1px solid ${T.border}`, fontSize: 13, color: T.text, lineHeight: 1.65, overflowWrap: "anywhere" }}>
          {faq.a}
        </div>
      )}
    </div>
  );
}

export default function MitraBantuan() {
  const waUrl = `https://wa.me/${HELP_CONTACT.waNumber}?text=${encodeURIComponent(HELP_CONTACT.waMessage)}`;

  return (
    <div style={{ fontFamily: font.body, padding: "clamp(18px, 3vw, 28px) clamp(16px, 4vw, 32px)", maxWidth: 820, width: "100%", boxSizing: "border-box" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4, fontWeight: 700 }}>GANDENG</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: T.heading, marginBottom: 5 }}>Pusat Bantuan GANDENG</div>
        <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.6 }}>Panduan penggunaan, FAQ, dan kontak bantuan untuk proses pengajuan proposal.</div>
      </div>

      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 8, background: T.bg }}>
          <BookOpen size={16} color={T.blue} />
          <span style={{ fontSize: 14, fontWeight: 700, color: T.heading }}>Panduan Penggunaan</span>
        </div>
        <div style={{ padding: "20px" }}>
          {PANDUAN_STEPS.map((s) => (
            <div key={s.step} style={{ display: "flex", gap: 14, marginBottom: 16, alignItems: "flex-start" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#0E4C92", color: "#fff", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>{s.step}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.heading, marginBottom: 3, lineHeight: 1.45 }}>{s.judul}</div>
                <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.6, overflowWrap: "anywhere" }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 8, background: T.bg }}>
          <HelpCircle size={16} color={T.blue} />
          <span style={{ fontSize: 14, fontWeight: 700, color: T.heading }}>Pertanyaan Umum (FAQ)</span>
        </div>
        <div style={{ padding: "16px 20px" }}>{FAQS.map((faq, i) => <FAQItem key={i} faq={faq} />)}</div>
      </div>

      <div style={{ background: "linear-gradient(135deg, #0A1628 0%, #0E4C92 100%)", borderRadius: 12, padding: "22px 24px", color: "#fff" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Hubungi Admin</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.68)", marginBottom: 18, lineHeight: 1.5 }}>Jam operasional: {HELP_CONTACT.hours}</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 8,
            background: "#25D366", color: "#fff", textDecoration: "none", fontSize: 13,
            fontWeight: 700, fontFamily: font.body,
          }}>
            <WhatsAppIcon size={16} color="#fff" /> WhatsApp {HELP_CONTACT.phone}
          </a>
          <a href={`tel:${HELP_CONTACT.waNumber}`} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 8,
            background: "rgba(255,255,255,0.12)", color: "#fff", textDecoration: "none",
            fontSize: 13, fontWeight: 700, fontFamily: font.body, border: "1px solid rgba(255,255,255,0.2)",
          }}>
            <Phone size={15} /> Telepon
          </a>
        </div>
      </div>
    </div>
  );
}
