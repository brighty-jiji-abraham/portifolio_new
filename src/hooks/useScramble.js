import { useCallback, useEffect, useRef } from "react";

const CHARS = "<>/{}[]_+*";

export const useScramble = (
  text,
  { duration = 600, disabled = false } = {},
) => {
  const elRef = useRef(null);
  const raf = useRef(0);
  const running = useRef(false);
  const cancel = useCallback(() => {
    cancelAnimationFrame(raf.current);
    running.current = false;
    if (elRef.current) elRef.current.textContent = text;
  }, [text]);
  useEffect(() => {
    cancel();
    return cancel;
  }, [cancel, disabled]);
  const scramble = useCallback(() => {
    if (
      disabled ||
      running.current ||
      !elRef.current ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    running.current = true;
    const start = performance.now();
    const offsets = Array.from(
      text,
      (_, i) => (i / text.length) * 0.55 + Math.random() * 0.18,
    );
    let lastTick = -1;
    const update = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const tick = Math.floor((now - start) / 45);
      if (tick !== lastTick && elRef.current) {
        lastTick = tick;
        elRef.current.textContent = Array.from(text, (char, i) =>
          char === " " || progress >= offsets[i] + 0.23
            ? char
            : progress < offsets[i]
              ? char
              : CHARS[Math.floor(Math.random() * CHARS.length)],
        ).join("");
      }
      if (progress >= 1) cancel();
      else raf.current = requestAnimationFrame(update);
    };
    raf.current = requestAnimationFrame(update);
  }, [text, duration, disabled, cancel]);
  return [elRef, scramble];
};
