import { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { T, font } from "../../lib/theme";
import PageHeader from "../../components/PageHeader";

const PANDUAN_STEPS = [
  { step: 1, judul: "Daftar Akun GANDENG", desc: "Daftar menggunakan email perusahaan/lembaga, lalu buat username dan password sendiri." },
  { step: 2, judul: "Login ke GANDENG", desc: "Masuk menggunakan username atau email beserta password yang sudah dibuat saat registrasi." },
  { step: 3, judul: "Buat Pengajuan Baru", desc: "Klik Pengajuan Baru dan isi proposal. Nama perusahaan/lembaga mengikuti akun yang sedang login." },
  { step: 4, judul: "Pantau Status", desc: "Gunakan Tracking Status untuk memantau tahapan Humas → ASMAN → MADM." },
  { step: 5, judul: "Reset Akun jika Lupa Password", desc: "Gunakan menu Lupa Password pada halaman login untuk membuat tautan reset dan menetapkan username/password baru." },
];
const FAQS = [
  { q: "Apakah akun lain dapat melihat pengajuan perusahaan saya?", a: "Tidak. Pengajuan GANDENG ditampilkan berdasarkan akun perusahaan/lembaga yang sedang login." },
  { q: "Bagaimana alur review pengajuan GANDENG?", a: "Pengajuan masuk ke Humas, kemudian diteruskan ke ASMAN dan MADM sesuai hasil pemeriksaan setiap tahap." },
  { q: "Apa yang harus dilakukan jika pengajuan dikembalikan atau ditolak?", a: "Buka detail pengajuan untuk melihat status dan riwayat proses sebagai acuan tindak lanjut." },
  { q: "Bagaimana jika lupa password?", a: "Masukkan email terdaftar pada fitur Lupa Password. Sistem akan membuat tautan reset untuk membuat username dan password baru." },
];

function FAQItem({ faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{border:`1px solid ${T.border}`,borderRadius:11,overflow:"hidden",marginBottom:10,background:T.card}}>
      <button onClick={() => setOpen((p) => !p)} style={{width:"100%",padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,background:open?"#F3F7FF":T.card,border:0,cursor:"pointer",textAlign:"left",color:T.heading,fontWeight:700}}>
        <span>{faq.q}</span>{open ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
      </button>
      {open && <div style={{padding:"14px 16px",borderTop:`1px solid ${T.border}`,fontSize:13,color:T.muted,lineHeight:1.65}}>{faq.a}</div>}
    </div>
  );
}

function SectionHeader({ icon: Icon, text }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:16}}>
      <div style={{width:34,height:34,borderRadius:10,background:"#EAF1FF",color:"#125AE8",display:"grid",placeItems:"center"}}><Icon size={17}/></div>
      <b style={{fontSize:14,color:T.heading}}>{text}</b>
    </div>
  );
}

export default function GandengBantuan() {
  return (
    <div style={{fontFamily:font.body,padding:"clamp(18px,3vw,28px) clamp(16px,4vw,32px)",maxWidth:980,width:"100%",boxSizing:"border-box"}}>

      <PageHeader
        eyebrow="GANDENG"
        title="Pusat Bantuan"
        description="Panduan penggunaan, pertanyaan umum, dan akses langsung ke admin GANDENG."
      />

      {/* Two-column: Panduan (left) | FAQ (right) */}
      <div className="responsive-two-col" style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)",gap:18,alignItems:"start"}}>

        <section style={section}>
          <SectionHeader icon={BookOpen} text="Panduan Penggunaan"/>
          {PANDUAN_STEPS.map((s) => (
            <div key={s.step} style={{display:"flex",gap:14,marginBottom:16,alignItems:"flex-start"}}>
              <div style={{width:30,height:30,borderRadius:"50%",background:"#125AE8",color:"#fff",display:"grid",placeItems:"center",fontWeight:800,fontSize:12,flexShrink:0}}>{s.step}</div>
              <div>
                <div style={{fontSize:13,fontWeight:800,color:T.heading,lineHeight:1.45}}>{s.judul}</div>
                <div style={{fontSize:12.5,color:T.muted,lineHeight:1.6,marginTop:3}}>{s.desc}</div>
              </div>
            </div>
          ))}
        </section>

        <section style={section}>
          <SectionHeader icon={HelpCircle} text="Pertanyaan Umum"/>
          {FAQS.map((faq) => <FAQItem key={faq.q} faq={faq}/>)}
        </section>
      </div>
    </div>
  );
}

const section = {background:T.card,border:`1px solid ${T.border}`,borderRadius:15,padding:"18px 20px",boxShadow:"0 4px 14px rgba(29,55,94,.04)"};
