import { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, HelpCircle, MessageCircle, Phone } from "lucide-react";
import { T, font } from "../../lib/theme";
import { HELP_CONTACT } from "../../lib/helpContact";

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
function WhatsAppIcon({ size=16,color="currentColor" }) { return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path fill={color} d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0C5.6 0 .2 5.3.2 11.9c0 2.1.6 4.1 1.6 5.9L.1 24l6.4-1.7a11.8 11.8 0 0 0 5.6 1.4C18.7 23.8 24 18.4 24 11.9c0-3.2-1.2-6.2-3.5-8.4Zm-8.4 18.3a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.8 1 1-3.7-.2-.4a9.9 9.9 0 1 1 8.4 4.7Zm5.4-7.4c-.3-.2-1.8-.9-2-.9-.3-.1-.5-.2-.7.1-.2.3-.8 1-.9 1.2-.2.2-.4.2-.7.1-.3-.2-1.2-.5-2.4-1.5-.9-.8-1.5-1.8-1.6-2-.2-.3 0-.5.1-.6.1-.2.3-.4.5-.6.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.2-.7-1.6-.9-2.2-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.3Z"/></svg>; }
function FAQItem({ faq }) { const [open,setOpen]=useState(false); return <div style={{border:`1px solid ${T.border}`,borderRadius:11,overflow:"hidden",marginBottom:10,background:T.card}}><button onClick={()=>setOpen((p)=>!p)} style={{width:"100%",padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,background:open?"#F3F7FF":T.card,border:0,cursor:"pointer",textAlign:"left",color:T.heading,fontWeight:700}}><span>{faq.q}</span>{open?<ChevronUp size={16}/>:<ChevronDown size={16}/>}</button>{open&&<div style={{padding:"14px 16px",borderTop:`1px solid ${T.border}`,fontSize:13,color:T.muted,lineHeight:1.65}}>{faq.a}</div>}</div>; }

export default function GandengBantuan() {
  const waUrl=`https://wa.me/${HELP_CONTACT.waNumber}?text=${encodeURIComponent(HELP_CONTACT.waMessage)}`;
  return <div style={{fontFamily:font.body,padding:"clamp(18px,3vw,28px) clamp(16px,4vw,32px)",maxWidth:960,width:"100%",boxSizing:"border-box"}}>
    <div style={{marginBottom:22}}><div style={{fontSize:11,color:"#125AE8",textTransform:"uppercase",letterSpacing:1,fontWeight:800}}>GANDENG</div><div style={{fontSize:24,fontWeight:800,color:T.heading,marginTop:4}}>Pusat Bantuan</div><div style={{fontSize:13,color:T.muted,lineHeight:1.6,marginTop:5,maxWidth:620}}>Panduan penggunaan, pertanyaan umum, dan akses langsung ke admin GANDENG.</div></div>

    <div className="responsive-two-col" style={{display:"grid",gridTemplateColumns:"minmax(0,1.25fr) minmax(280px,.75fr)",gap:18,alignItems:"start"}}>
      <div>
        <section style={section}><Header icon={BookOpen} text="Panduan Penggunaan"/><div>{PANDUAN_STEPS.map((s)=><div key={s.step} style={{display:"flex",gap:14,marginBottom:16,alignItems:"flex-start"}}><div style={{width:30,height:30,borderRadius:"50%",background:"#125AE8",color:"#fff",display:"grid",placeItems:"center",fontWeight:800,fontSize:12,flexShrink:0}}>{s.step}</div><div><div style={{fontSize:13,fontWeight:800,color:T.heading,lineHeight:1.45}}>{s.judul}</div><div style={{fontSize:12.5,color:T.muted,lineHeight:1.6,marginTop:3}}>{s.desc}</div></div></div>)}</div></section>
        <section style={section}><Header icon={HelpCircle} text="Pertanyaan Umum"/>{FAQS.map((faq)=><FAQItem key={faq.q} faq={faq}/>)}</section>
      </div>

      <aside className="gandeng-contact-card" style={{position:"sticky",top:88,background:"linear-gradient(160deg,#0B46C8 0%,#125AE8 58%,#2B72F0 100%)",borderRadius:18,padding:"22px",color:"#fff",boxShadow:"0 16px 38px rgba(18,90,232,.2)"}}>
        <div style={{width:44,height:44,borderRadius:13,display:"grid",placeItems:"center",background:"rgba(255,255,255,.14)",border:"1px solid rgba(255,255,255,.16)",marginBottom:16}}><MessageCircle size={22}/></div>
        <div style={{fontFamily:font.display,fontSize:20,fontWeight:800,lineHeight:1.2}}>Hubungi Admin</div>
        <p style={{fontSize:12.5,lineHeight:1.65,opacity:.85,margin:"8px 0 4px"}}>Butuh bantuan terkait akun, pengajuan, atau status proses? Hubungi admin GANDENG melalui kanal berikut.</p>
        <div style={{fontSize:11.5,opacity:.68,marginBottom:18}}>Jam operasional: {HELP_CONTACT.hours}</div>
        <div style={{display:"grid",gap:9}}>
          <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,minHeight:42,padding:"0 14px",borderRadius:10,background:"#25D366",color:"#fff",fontWeight:800,fontSize:12.5,textDecoration:"none"}}><WhatsAppIcon color="#fff"/>WhatsApp {HELP_CONTACT.phone}</a>
          <a href={`tel:${HELP_CONTACT.waNumber}`} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,minHeight:42,padding:"0 14px",borderRadius:10,border:"1px solid rgba(255,255,255,.28)",background:"rgba(255,255,255,.08)",color:"#fff",fontWeight:700,fontSize:12.5,textDecoration:"none"}}><Phone size={15}/>Telepon</a>
        </div>
      </aside>
    </div>
  </div>;
}
function Header({ icon:Icon,text }) { return <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:16}}><div style={{width:34,height:34,borderRadius:10,background:"#EAF1FF",color:"#125AE8",display:"grid",placeItems:"center"}}><Icon size={17}/></div><b style={{fontSize:14,color:T.heading}}>{text}</b></div>; }
const section={background:T.card,border:`1px solid ${T.border}`,borderRadius:15,padding:"18px 20px",marginBottom:18,boxShadow:"0 4px 14px rgba(29,55,94,.04)"};
