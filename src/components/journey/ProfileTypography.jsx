import { useEffect, useRef } from "react";
import { useTilt } from "../../hooks/useInteractive";
import { useScramble } from "../../hooks/useScramble";
import { profile } from "../../data/profile";
import "./ProfileTypography.css";

const ROLE = profile.headline;

export function ProfileName({
  active = true,
  motion = true,
  id,
  className = "",
}) {
  const tilt = useTilt(5);
  return (
    <h1
      id={id}
      className={`profile-name ${className}`}
      data-active={active}
      data-motion={motion}
      aria-label={profile.name}
      {...(motion ? tilt : {})}
    >
      {["Brighty Jiji", "Abraham."].map((line, row) => (
        <span className="name-line" key={line} aria-hidden="true">
          {Array.from(line).map((letter, index) => (
            <span
              key={index}
              className={
                letter === "." ? "name-letter name-period" : "name-letter"
              }
              style={{ "--letter": index + row * 5 }}
            >
              {letter === " " ? "\u00a0" : letter}
            </span>
          ))}
        </span>
      ))}
    </h1>
  );
}

export function ProfileRole({ active = true, motion = true, className = "" }) {
  const [ref, scramble] = useScramble(ROLE, {
    duration: 850,
    disabled: !active || !motion,
  });
  useEffect(() => {
    if (!active || !motion) return;
    const timer = setTimeout(scramble, 420);
    return () => clearTimeout(timer);
  }, [active, motion, scramble]);
  return (
    <p className={className} onMouseEnter={scramble}>
      <span className="profile-readable-text">{ROLE}</span>
      <span ref={ref} aria-hidden="true">
        {ROLE}
      </span>
    </p>
  );
}

export function AnimatedNumber({ value, suffix = "+", active = true, motion = true }) {
  const ref = useRef();
  useEffect(() => {
    if (
      !active ||
      !motion ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      ref.current.textContent = `${value}${suffix}`;
      return;
    }
    let frame;
    const start = performance.now();
    const tick = (time) => {
      const t = Math.min(1, Math.max(0, (time - start - 200) / 1000));
      ref.current.textContent = `${Math.round(value * (1 - (1 - t) ** 3))}${suffix}`;
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, suffix, active, motion]);
  return (
    <span>
      <span className="profile-readable-text">{value}{suffix}</span>
      <span ref={ref} aria-hidden="true">
        {value}{suffix}
      </span>
    </span>
  );
}
