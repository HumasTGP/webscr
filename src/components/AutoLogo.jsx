import { useEffect, useState } from "react";
import fallbackLogo from "../assets/pln-priok-logo.svg";

const CANDIDATES = ["/logo.png", "/logo.jpg", "/logo.jpeg"];

let resolvedSrc = null;
let resolvePromise = null;

function resolveLogo() {
  if (resolvedSrc) return Promise.resolve(resolvedSrc);
  if (resolvePromise) return resolvePromise;
  resolvePromise = (async () => {
    for (const src of CANDIDATES) {
      const ok = await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = src;
      });
      if (ok) {
        resolvedSrc = src;
        return src;
      }
    }
    resolvedSrc = fallbackLogo;
    return fallbackLogo;
  })();
  return resolvePromise;
}

export default function AutoLogo({ onAspect, alt = "", style, ...rest }) {
  const [src, setSrc] = useState(resolvedSrc || fallbackLogo);

  useEffect(() => {
    let cancelled = false;
    resolveLogo().then((s) => {
      if (!cancelled) setSrc(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLoad = (e) => {
    const { naturalWidth: w, naturalHeight: h } = e.target;
    if (onAspect && w && h) onAspect(w / h);
  };

  return (
    <img
      {...rest}
      alt={alt}
      src={src}
      onLoad={handleLoad}
      style={style}
    />
  );
}