import { useEffect, useRef } from "react";

export function unseenNotificationIds(items, seen) {
  return items.filter(item => !seen.has(item.id)).map(item => item.id);
}
export default function useNotificationSound(user, items) {
  const seenByUser = useRef(new Map());
  const audio = useRef(null);
  useEffect(() => {
    const unlock = () => {
      try {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) return;
        audio.current ||= new Audio();
        audio.current.resume().catch(() => {});
      } catch { /* Browser may block audio; visual notifications remain available. */ }
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      audio.current?.close().catch(() => {});
      audio.current = null;
    };
  }, []);
  useEffect(() => {
    if (!user) return;
    const key = `${user.id || user.username}:${user.role}`;
    if (!seenByUser.current.has(key)) {
      seenByUser.current.set(key, new Set(items.map(item => item.id)));
      return; // Initial backlog is not a new notification.
    }
    const seen = seenByUser.current.get(key);
    const fresh = unseenNotificationIds(items, seen);
    fresh.forEach(id => seen.add(id));
    const context = audio.current;
    if (!fresh.length || context?.state !== "running") return;
    try {
      fresh.forEach((id, index) => {
        const oscillator = context.createOscillator(), gain = context.createGain();
        const start = context.currentTime + index * 0.25;
        oscillator.frequency.value = 740;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.07, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
        oscillator.connect(gain); gain.connect(context.destination);
        oscillator.start(start); oscillator.stop(start + 0.2);
        oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      });
    } catch { /* Keep the existing visual/deep-link behavior when audio fails. */ }
  }, [user?.id, user?.username, user?.role, items]);
}
