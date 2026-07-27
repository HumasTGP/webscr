import { useEffect, useState } from "react";

const MAX_PARTNERS = 6;
const EXTS = ["png", "jpg", "jpeg"];

let cachedList = null;
let cachePromise = null;

function fileExists(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

function loadPartners() {
  if (cachedList) return Promise.resolve(cachedList);
  if (cachePromise) return cachePromise;
  cachePromise = (async () => {
    const found = [];
    for (let i = 1; i <= MAX_PARTNERS; i++) {
      for (const ext of EXTS) {
        const src = `/partner-${i}.${ext}`;
        if (await fileExists(src)) {
          found.push(src);
          break;
        }
      }
    }
    cachedList = found;
    return found;
  })();
  return cachePromise;
}

export default function PartnerLogos() {
  const [logos, setLogos] = useState(cachedList || []);
  useEffect(() => {
    let cancelled = false;
    loadPartners().then((list) => {
      if (!cancelled) setLogos(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  if (!logos.length) return null;
  return (
    <>
      {logos.map((src) => (
        <span key={src} style={{ display: "contents" }}>
          <div className="powered-by-divider" />
          <div className="powered-by-logo-box">
            <img src={src} alt="" />
          </div>
        </span>
      ))}
    </>
  );
}
