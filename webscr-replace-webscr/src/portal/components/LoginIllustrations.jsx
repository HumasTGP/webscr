/**
 * Ilustrasi SVG untuk panel putih masing-masing login.
 * Semua menggunakan konsep cloud + padlock (referensi desain).
 * Dibedakan hanya warna aksen per sistem.
 */

/* ─── SAKTI PLN — aksen biru ─── */
export function SikasIllustration() {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: 140, height: 140 }}
      aria-hidden="true"
    >
      {/* Lingkaran latar */}
      <circle cx="80" cy="80" r="70" fill="#EFF6FF" />
      <circle cx="80" cy="80" r="54" fill="#DBEAFE" />

      {/* Awan */}
      <ellipse cx="80" cy="72" rx="34" ry="22" fill="#93C5FD" />
      <circle cx="55" cy="78" r="17" fill="#93C5FD" />
      <circle cx="106" cy="78" r="20" fill="#93C5FD" />

      {/* Tubuh gembok */}
      <rect x="56" y="78" width="48" height="42" rx="9" fill="#60A5FA" />

      {/* Gagang gembok */}
      <path
        d="M67 78 V65 Q80 52 93 65 V78"
        stroke="#60A5FA"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />

      {/* Lingkaran dalam gembok */}
      <circle cx="80" cy="100" r="10" fill="white" opacity="0.45" />

      {/* Centang */}
      <polyline
        points="74,100 79,106 87,93"
        stroke="white"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── Si Lapak Priok — aksen teal/cyan ─── */
export function SilapakIllustration() {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: 140, height: 140 }}
      aria-hidden="true"
    >
      {/* Lingkaran latar */}
      <circle cx="80" cy="80" r="70" fill="#F0FDFA" />
      <circle cx="80" cy="80" r="54" fill="#CCFBF1" />

      {/* Awan */}
      <ellipse cx="80" cy="72" rx="34" ry="22" fill="#5EEAD4" />
      <circle cx="55" cy="78" r="17" fill="#5EEAD4" />
      <circle cx="106" cy="78" r="20" fill="#5EEAD4" />

      {/* Tubuh gembok */}
      <rect x="56" y="78" width="48" height="42" rx="9" fill="#2DD4BF" />

      {/* Gagang gembok */}
      <path
        d="M67 78 V65 Q80 52 93 65 V78"
        stroke="#2DD4BF"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />

      {/* Lingkaran dalam gembok */}
      <circle cx="80" cy="100" r="10" fill="white" opacity="0.45" />

      {/* Centang */}
      <polyline
        points="74,100 79,106 87,93"
        stroke="white"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── Pengajuan Mitra — aksen ungu/indigo ─── */
export function MitraIllustration() {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: 140, height: 140 }}
      aria-hidden="true"
    >
      {/* Lingkaran latar */}
      <circle cx="80" cy="80" r="70" fill="#F5F3FF" />
      <circle cx="80" cy="80" r="54" fill="#EDE9FE" />

      {/* Awan */}
      <ellipse cx="80" cy="72" rx="34" ry="22" fill="#A78BFA" />
      <circle cx="55" cy="78" r="17" fill="#A78BFA" />
      <circle cx="106" cy="78" r="20" fill="#A78BFA" />

      {/* Tubuh gembok */}
      <rect x="56" y="78" width="48" height="42" rx="9" fill="#7C3AED" />

      {/* Gagang gembok */}
      <path
        d="M67 78 V65 Q80 52 93 65 V78"
        stroke="#7C3AED"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />

      {/* Lingkaran dalam gembok */}
      <circle cx="80" cy="100" r="10" fill="white" opacity="0.45" />

      {/* Centang */}
      <polyline
        points="74,100 79,106 87,93"
        stroke="white"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
