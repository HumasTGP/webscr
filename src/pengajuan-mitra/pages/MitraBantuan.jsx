import { useState } from "react";
import { HelpCircle, MessageCircle, Phone, ChevronDown, ChevronUp, BookOpen, CheckCircle2 } from "lucide-react";
import { T, font } from "../../lib/theme";
import { HELP_CONTACT } from "../../lib/data";

const PANDUAN_STEPS = [
  { step: 1, judul: "Login ke Portal Mitra", desc: "Masuk menggunakan username dan password yang telah diberikan oleh admin PLN." },
  { step: 2, judul: "Buat Pengajuan Baru", desc: "Klik menu 'Pengajuan Baru' di sidebar, lalu isi formulir pengajuan kerjasama mitra dengan lengkap." },
  { step: 3, judul: "Kirim Pengajuan", desc: "Setelah semua data terisi, klik tombol 'Kirim Pengajuan'. Pengajuan akan langsung masuk ke antrian review Humas." },
  { step: 4, judul: "Pantau Status", desc: "Gunakan menu 'Tracking Status' untuk memantau perkembangan pengajuan Anda melalui tahapan Humas → Asman → MADM." },
  { step: 5, judul: "Notifikasi Hasil", desc: "Pengajuan yang disetujui atau ditolak akan ditampilkan di Riwayat Pengajuan beserta catatan dari reviewer." },
];

const FAQS = [
  {
    q: "Berapa lama proses review pengajuan mitra?",
    a: "Proses review biasanya memerlukan waktu 5-10 hari kerja, tergantung kelengkapan dokumen dan antrian review di setiap level (Humas, Asman, MADM).",
  },
  {
    q: "Apa yang harus dilakukan jika pengajuan ditolak?",
    a: "Jika pengajuan ditolak, Anda dapat melihat catatan penolakan di detail pengajuan. Anda dipersilakan untuk mengajukan kembali dengan melengkapi kekurangan yang disebutkan.",
  },
  {
    q: "Apakah saya bisa mengubah pengajuan yang sudah dikirim?",
    a: "Pengajuan yang sudah dikirim tidak dapat diubah secara langsung. Jika ada perubahan mendesak, silakan hubungi admin via WhatsApp atau telepon yang tersedia di halaman Bantuan ini.",
  },
  {
    q: "Berapa nilai maksimal pengajuan yang bisa diajukan?",
    a: "Tidak ada batasan nilai maksimal yang ditetapkan secara sistem. Namun, nilai pengajuan yang sangat besar mungkin memerlukan tahapan review tambahan di luar sistem ini.",
  },
];

function FAQItem({ faq }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      border: `1px solid ${T.border}`,
      borderRadius: 10,
      overflow: "hidden",
      marginBottom: 10,
    }}>
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          width: "100%", padding: "14px 18px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          background: open ? T.blueSoft : T.card,
          border: "none", cursor: "pointer",
          fontFamily: font.body,
          textAlign: "left",
          transition: "background .12s ease",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: T.heading }}>{faq.q}</span>
        {open ? <ChevronUp size={16} color={T.muted} /> : <ChevronDown size={16} color={T.muted} />}
      </button>
      {open && (
        <div style={{
          padding: "14px 18px",
          background: T.card,
          borderTop: `1px solid ${T.border}`,
          fontSize: 13, color: T.text, lineHeight: 1.6,
        }}>
          {faq.a}
        </div>
      )}
    </div>
  );
}

export default function MitraBantuan() {
  const waUrl = `https://wa.me/${HELP_CONTACT.waNumber}?text=${encodeURIComponent(HELP_CONTACT.waMessage)}`;

  return (
    <div style={{ fontFamily: font.body, padding: "28px 32px", maxWidth: 820 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4, fontWeight: 700 }}>
          Bantuan & Panduan
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: T.heading, marginBottom: 4 }}>
          Pusat Bantuan Mitra
        </div>
        <div style={{ fontSize: 13, color: T.muted }}>
          Temukan panduan penggunaan, FAQ, dan informasi kontak admin di sini.
        </div>
      </div>

      {/* Panduan Section */}
      <div style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 24,
      }}>
        <div style={{
          padding: "16px 20px",
          borderBottom: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", gap: 8,
          background: T.bg,
        }}>
          <BookOpen size={16} color={T.blue} />
          <span style={{ fontSize: 14, fontWeight: 700, color: T.heading }}>Panduan Penggunaan</span>
        </div>
        <div style={{ padding: "20px" }}>
          {PANDUAN_STEPS.map((s) => (
            <div
              key={s.step}
              style={{
                display: "flex", gap: 14, marginBottom: 16,
                alignItems: "flex-start",
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "#0E4C92", color: "#fff",
                display: "grid", placeItems: "center",
                fontSize: 12, fontWeight: 800,
                flexShrink: 0, marginTop: 1,
              }}>
                {s.step}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.heading, marginBottom: 3 }}>
                  {s.judul}
                </div>
                <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 24,
      }}>
        <div style={{
          padding: "16px 20px",
          borderBottom: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", gap: 8,
          background: T.bg,
        }}>
          <HelpCircle size={16} color={T.blue} />
          <span style={{ fontSize: 14, fontWeight: 700, color: T.heading }}>Pertanyaan Umum (FAQ)</span>
        </div>
        <div style={{ padding: "16px 20px" }}>
          {FAQS.map((faq, i) => (
            <FAQItem key={i} faq={faq} />
          ))}
        </div>
      </div>

      {/* Kontak Admin */}
      <div style={{
        background: "linear-gradient(135deg, #0A1628 0%, #0E4C92 100%)",
        borderRadius: 12,
        padding: "24px 24px",
        color: "#fff",
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
          Hubungi Admin
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 18 }}>
          Jam operasional: {HELP_CONTACT.hours}
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 18px", borderRadius: 8,
              background: "#25D366", color: "#fff",
              textDecoration: "none", fontSize: 13, fontWeight: 700,
              fontFamily: font.body,
            }}
          >
            <MessageCircle size={15} />
            Chat WhatsApp
          </a>
          <a
            href={`tel:${HELP_CONTACT.phone}`}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 18px", borderRadius: 8,
              background: "rgba(255,255,255,0.12)", color: "#fff",
              textDecoration: "none", fontSize: 13, fontWeight: 700,
              fontFamily: font.body, border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <Phone size={15} />
            {HELP_CONTACT.phone}
          </a>
        </div>
      </div>
    </div>
  );
}
