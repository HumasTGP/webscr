import { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, HelpCircle, MapPin } from "lucide-react";
import { T, font } from "../../lib/theme";
import { HELP_CONTACT } from "../../lib/helpContact";
import PageHeader from "../../components/PageHeader";

const PANDUAN_STEPS = [
  [1, "Daftar Akun GANDENG", "Daftar menggunakan email perusahaan/lembaga, lalu buat username dan password sendiri."],
  [2, "Login ke GANDENG", "Masuk menggunakan username atau email beserta password yang sudah dibuat saat registrasi."],
  [3, "Buat Pengajuan Baru", "Klik Pengajuan Baru dan isi proposal. Nama perusahaan/lembaga mengikuti akun yang sedang login."],
  [4, "Pantau Status", "Gunakan Tracking Status untuk memantau tahapan Humas → ASMAN → MADM."],
  [5, "Reset Akun jika Lupa Password", "Gunakan menu Lupa Password pada halaman login untuk membuat tautan reset dan menetapkan username/password baru."],
];
const FAQS = [
  ["Apakah akun lain dapat melihat pengajuan perusahaan saya?", "Tidak. Pengajuan GANDENG ditampilkan berdasarkan akun perusahaan/lembaga yang sedang login."],
  ["Bagaimana alur review pengajuan GANDENG?", "Pengajuan masuk ke Humas, kemudian diteruskan ke ASMAN dan MADM sesuai hasil pemeriksaan setiap tahap."],
  ["Apa yang harus dilakukan jika pengajuan dikembalikan atau ditolak?", "Buka detail pengajuan untuk melihat status dan riwayat proses sebagai acuan tindak lanjut."],
  ["Bagaimana jika lupa password?", "Masukkan email terdaftar pada fitur Lupa Password. Sistem akan membuat tautan reset untuk membuat username dan password baru."],
];

function WA({size=17,color="currentColor"}){return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path fill={color} d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0C5.6 0 .2 5.3.2 11.9c0 2.1.6 4.1 1.6 5.9L.1 24l6.4-1.7a11.8 11.8 0 0 0 5.6 1.4C18.7 23.8 24 18.4 24 11.9c0-3.2-1.2-6.2-3.5-8.4Zm-8.4 18.3a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.8 1 1-3.7-.2-.4a9.9 9.9 0 1 1 8.4 4.7Zm5.4-7.4c-.3-.2-1.8-.9-2-.9-.3-.1-.5-.2-.7.1-.2.3-.8 1-.9 1.2-.2.2-.4.2-.7.1-.3-.2-1.2-.5-2.4-1.5-.9-.8-1.5-1.8-1.6-2-.2-.3 0-.5.1-.6.1-.2.3-.4.5-.6.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.2-.7-1.6-.9-2.2-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.3Z"/></svg>}

function SectionTitle({icon:Icon,text}){return <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><div style={{width:32,height:32,borderRadius:9,background:"#EAF1FF",display:"grid",placeItems:"center",color:"#125AE8"}}><Icon size={16}/></div><b style={{fontSize:14,color:T.heading}}>{text}</b></div>}

function FAQItem({q,a}){const[open,setOpen]=useState(false);return <div style={{border:`1px solid ${T.border}`,borderRadius:10,overflow:"hidden",marginBottom:9}}><button onClick={()=>setOpen(p=>!p)} style={{width:"100%",padding:"13px 15px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,background:open?"#EAF1FF":T.card,border:0,color:T.heading,textAlign:"left",fontWeight:700,cursor:"pointer"}}><span>{q}</span>{open?<ChevronUp size={15}/>:<ChevronDown size={15}/>}</button>{open&&<div style={{padding:"12px 15px",borderTop:`1px solid ${T.border}`,fontSize:12.5,color:T.muted,lineHeight:1.6}}>{a}</div>}</div>}

export default function GandengBantuan() {
  const wa = `https://wa.me/${HELP_CONTACT.waNumber}?text=${encodeURIComponent(HELP_CONTACT.waMessage)}`;
  return (
    <div style={{fontFamily:font.body,padding:"clamp(18px,3vw,28px) clamp(16px,4vw,32px)",maxWidth:820,width:"100%",boxSizing:"border-box"}}>
      <PageHeader title="Pusat Bantuan" description="Panduan penggunaan, pertanyaan umum, dan akses langsung ke admin GANDENG." />

      <section style={section}>
        <SectionTitle icon={BookOpen} text="Panduan Penggunaan"/>
        <div className="responsive-card-grid" style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:10}}>
          {PANDUAN_STEPS.map(([no,judul,desc])=>(
            <div key={no} style={{padding:12,borderRadius:10,border:`1px solid ${T.border}`,background:T.bg}}>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
                <span style={{width:24,height:24,borderRadius:"50%",display:"grid",placeItems:"center",background:"#125AE8",color:"#fff",fontWeight:800,fontSize:11,flexShrink:0}}>{no}</span>
                <b style={{fontSize:12.5,color:T.heading}}>{judul}</b>
              </div>
              <div style={{fontSize:11.5,color:T.muted,lineHeight:1.55}}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={section}>
        <SectionTitle icon={HelpCircle} text="Pertanyaan Umum"/>
        {FAQS.map(([q,a])=><FAQItem key={q} q={q} a={a}/>)}
      </section>

      <section style={section}>
        <div style={{fontSize:14,fontWeight:800,color:T.heading,marginBottom:5}}>Kontak Admin</div>
        <div style={{fontSize:12,color:T.muted,marginBottom:14}}>Jam operasional: {HELP_CONTACT.hours}</div>
        <div className="responsive-card-grid" style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:10}}>
          <a href={wa} target="_blank" rel="noopener noreferrer" style={{...contact,textDecoration:"none"}}>
            <span style={{width:34,height:34,borderRadius:"50%",background:"#25D366",display:"grid",placeItems:"center",color:"#fff",flexShrink:0}}><WA color="#fff"/></span>
            <div><div style={{fontSize:11,color:T.muted}}>WhatsApp</div><div style={{fontSize:13,fontWeight:800,color:T.heading}}>{HELP_CONTACT.phone}</div></div>
          </a>
          <div style={contact}>
            <span style={{width:34,height:34,borderRadius:8,background:"#EAF1FF",display:"grid",placeItems:"center",color:"#125AE8",flexShrink:0}}><MapPin size={16}/></span>
            <div><div style={{fontSize:11,color:T.muted}}>Lokasi</div><div style={{fontSize:12,fontWeight:700,color:T.heading}}>PT. PLN Indonesia Power UBP Priok</div></div>
          </div>
        </div>
      </section>
    </div>
  );
}

const section = {background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"18px 20px",marginBottom:18};
const contact = {display:"flex",alignItems:"center",gap:10,padding:"12px 13px",borderRadius:10,border:`1px solid ${T.border}`,background:T.bg,minWidth:0};
