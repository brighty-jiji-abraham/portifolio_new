import { useEffect, useRef, useState } from "react";
import "./ButtonEffects.css";

const CONTROLS = ".story button, .story a.btn, .app-header .theme-toggle";

export default function ButtonEffects({ reducedMotion, orbitRef }) {
  return reducedMotion ? null : <AnimatedButtonEffects orbitRef={orbitRef} />;
}

function AnimatedButtonEffects({ orbitRef }) {
  const [burst, setBurst] = useState(null);
  const sequence = useRef(0);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let active = null;
    let frame = 0;
    let pointer = { x: 0, y: 0 };
    const reset = () => {
      if (!active) return;
      active.style.removeProperty("--button-rx");
      active.style.removeProperty("--button-ry");
      active = null;
    };
    const update = () => {
      frame = 0;
      if (!active) return;
      const rect = active.getBoundingClientRect();
      const x = Math.max(
        -0.5,
        Math.min(0.5, (pointer.x - rect.left) / rect.width - 0.5),
      );
      const y = Math.max(
        -0.5,
        Math.min(0.5, (pointer.y - rect.top) / rect.height - 0.5),
      );
      active.style.setProperty("--button-rx", `${-y * 12}deg`);
      active.style.setProperty("--button-ry", `${x * 12}deg`);
      active.style.setProperty("--button-light-x", `${(x + 0.5) * 100}%`);
      active.style.setProperty("--button-light-y", `${(y + 0.5) * 100}%`);
    };
    const onMove = (event) => {
      if (!finePointer.matches) return;
      const control = event.target.closest?.(CONTROLS);
      if (control?.disabled) return;
      if (control !== active) reset();
      active = control;
      pointer = { x: event.clientX, y: event.clientY };
      if (active && !frame) frame = requestAnimationFrame(update);
    };
    const onOut = (event) => {
      if (active && !active.contains(event.relatedTarget)) reset();
    };
    const onClick = (event) => {
      const control = event.target.closest?.(CONTROLS);
      if (!control || control.disabled) return;
      const rect = control.getBoundingClientRect();
      setBurst({
        id: ++sequence.current,
        x: event.detail ? event.clientX : rect.left + rect.width / 2,
        y: event.detail ? event.clientY : rect.top + rect.height / 2,
      });
      orbitRef.current.boost = Math.max(orbitRef.current.boost, 2.5);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onOut);
    // Capture the control before its action replaces an icon or filters a card.
    document.addEventListener("click", onClick, true);
    window.addEventListener("blur", reset);
    return () => {
      cancelAnimationFrame(frame);
      reset();
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onOut);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("blur", reset);
    };
  }, [orbitRef]);

  if (!burst) return null;
  return (
    <div
      key={burst.id}
      className="button-space-burst"
      aria-hidden="true"
      style={{ left: burst.x, top: burst.y }}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) setBurst(null);
      }}
    >
      <span className="button-shockwave" />
      {[0, 1, 2, 3, 4].map((index) => (
        <span
          key={index}
          className="button-asteroid"
          style={{
            "--debris-angle": `${index * 72 + 15}deg`,
            "--debris-distance": `${36 + (index % 3) * 15}px`,
          }}
        />
      ))}
      <svg className="button-launch-rocket" viewBox="0 0 28 42" fill="none">
        <path
          d="M9 22 L2 29 V34 L11 29 M19 22 L26 29 V34 L17 29"
          fill="#d28a5d"
        />
        <path d="M8 28 V15 Q8 7 14 2 Q20 7 20 15 V28 Z" fill="#e4edf0" />
        <path d="M9 10 Q11 5 14 2 Q17 5 19 10 Z" fill="#e1a775" />
        <circle cx="14" cy="17" r="3.5" fill="#69cde1" stroke="#536e79" />
        <path d="M10 30 Q10 37 14 42 Q18 37 18 30" fill="#ffc873" />
        <path d="M12 30 L14 37 L16 30" fill="#fff5d6" />
      </svg>
    </div>
  );
}
