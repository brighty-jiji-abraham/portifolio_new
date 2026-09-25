import { useEffect, useRef } from "react";
import { playTick } from "./useSoundscape";

const clamp = (value) => Math.max(0, Math.min(1, value));
const smooth = (value) => value * value * (3 - 2 * value);
const TITLES = {
  about: "Home planet",
  skills: "Skills",
  projects: "Selected work",
  experience: "The journey",
  contact: "Contact",
};

export function useSectionFlight({ enabled, orbitRef, onStatus }) {
  const controls = useRef(null);
  const visitedRef = useRef(new Set());

  useEffect(() => {
    const root = document.documentElement;
    const sections = [...document.querySelectorAll(".chapter")];
    const entries = sections
      .filter((el) => el.id !== "about")
      .map((el) => ({
        el,
        id: el.id,
        top: 0,
        origin: 0,
        progress: 1,
        armed: null,
        boostAt: -Infinity,
        phase: "",
        caption: el.querySelector(".tow-phase"),
        rockets: [...el.querySelectorAll(".tow-rocket")],
      }));
    const visited = visitedRef.current;
    let height = window.innerHeight;
    let viewportWidth = window.innerWidth;
    let compact = window.innerWidth <= 760;
    let frame = 0;
    let previousTime = 0;
    let statusKey = "";
    let currentId = "about";
    let arrival = null;
    let previousY = window.scrollY;
    let forwardInputAt = -Infinity;
    let touchY = null;
    let destroyed = false;

    root.dataset.cinematics = enabled ? "on" : "off";
    entries.forEach((entry) =>
      entry.rockets.forEach((rocket) => {
        rocket.disabled = !enabled;
      }),
    );

    const schedule = () => {
      if (!frame && !destroyed) frame = requestAnimationFrame(update);
    };
    const measure = () => {
      height = window.innerHeight;
      compact = window.innerWidth <= 760;
      entries.forEach((entry) => {
        // Measure the stationary section, never its animated child.
        entry.top = entry.el.getBoundingClientRect().top + window.scrollY;
        entry.origin =
          entry.top + parseFloat(getComputedStyle(entry.el).paddingTop);
        entry.landingLine = Math.max(
          height * 0.28,
          entry.origin - entry.top + (compact ? 88 : 94) + 10,
        );
        entry.launchLine = Math.max(height * 0.96, entry.landingLine + 120);
        entry.launchY = Math.max(0, entry.origin - entry.launchLine);
        entry.landingY = Math.min(
          document.documentElement.scrollHeight - height,
          Math.max(0, entry.top - (compact ? 88 : 94)),
        );
      });
      schedule();
    };
    const cancelArrival = () => {
      if (arrival) arrival.entry.progress = 1;
      arrival = null;
      forwardInputAt = -Infinity;
      schedule();
    };
    const startArrival = (entry, kind, updateHash = false) => {
      if (!enabled || !entry) return;
      if (arrival) arrival.entry.progress = 1;
      entry.progress = 0;
      entry.armed = false;
      forwardInputAt = -Infinity;
      // Every entrance uses the same camera path, timing, and rocket choreography
      // as Replay. A fast scroll can start further along the camera path without
      // skipping the lift animation or jumping the page backward.
      const from =
        kind === "scroll"
          ? Math.min(entry.landingY, Math.max(entry.launchY, window.scrollY))
          : entry.launchY;
      arrival = {
        entry,
        id: entry.id,
        from,
        to: entry.landingY,
        start: performance.now(),
        kind,
        pathY: entry.launchY,
      };
      currentId = entry.id;
      if (updateHash && window.location.hash !== `#${entry.id}`) {
        window.history.pushState(null, "", `#${entry.id}`);
      }
      window.scrollTo({ top: from, behavior: "instant" });
      previousY = from;
      schedule();
    };
    const onWheel = (event) => {
      if (event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX))
        return;
      if (arrival) {
        if (event.deltaY < 0) cancelArrival();
        else if (event.cancelable) event.preventDefault();
      } else if (event.deltaY > 0) forwardInputAt = performance.now();
    };
    const onTouchStart = (event) => {
      touchY = event.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (event) => {
      if (touchY === null || event.touches.length !== 1) return;
      const nextY = event.touches[0].clientY;
      const delta = touchY - nextY;
      touchY = nextY;
      if (arrival) {
        if (delta < -2) cancelArrival();
        else if (delta > 0 && event.cancelable) event.preventDefault();
      } else if (delta > 2) forwardInputAt = performance.now();
    };
    const onKey = (event) => {
      if (event.key === "Escape") {
        cancelArrival();
        return;
      }
      if (
        event.target.closest?.(
          "input, textarea, select, button, a, [contenteditable='true']",
        )
      )
        return;
      if (
        ["ArrowUp", "PageUp", "Home", "End"].includes(event.key) ||
        (event.key === " " && event.shiftKey)
      ) {
        cancelArrival();
      } else if (["ArrowDown", "PageDown", " "].includes(event.key)) {
        if (arrival) event.preventDefault();
        else forwardInputAt = performance.now();
      }
    };
    const onNavigation = (event) => {
      if (
        !enabled ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link = event.target.closest?.('a[href^="#"]');
      if (!link || (link.target && link.target !== "_self")) return;
      const entry = entries.find(
        (item) => `#${item.id}` === link.getAttribute("href"),
      );
      if (!entry) return;
      event.preventDefault();
      startArrival(entry, "navigation", true);
    };
    const onResize = () => {
      // Mobile browser chrome changes the height while scrolling. Keep the
      // arrival running through that change; an orientation change can stop it.
      if (window.innerWidth !== viewportWidth) cancelArrival();
      viewportWidth = window.innerWidth;
      measure();
      if (arrival) arrival.to = arrival.entry.landingY;
    };
    const boost = (id) => {
      if (!enabled) return;
      const entry = entries.find((item) => item.id === id);
      if (!entry) return;
      entry.boostAt = performance.now();
      orbitRef.current.boost = Math.max(orbitRef.current.boost, 5);
      playTick();
      schedule();
    };
    const onBoost = (event) => boost(event.detail.id);
    const revealFocused = (event) => {
      if (!event.target.matches(":focus-visible")) return;
      const entry = entries.find((item) => item.el.contains(event.target));
      if (!entry) return;
      // Keyboard users can always reach a stable, fully visible control.
      if (arrival?.id === entry.id) cancelArrival();
      entry.progress = 1;
      schedule();
    };

    function update(now) {
      frame = 0;
      const dt = previousTime
        ? Math.min(0.05, (now - previousTime) / 1000)
        : 0.016;
      previousTime = now;
      let y = window.scrollY;
      if (!arrival && enabled && y > previousY && now - forwardInputAt < 650) {
        const next = entries.find(
          (entry) => entry.armed && y >= entry.launchY && y < entry.top + 180,
        );
        if (next) startArrival(next, "scroll");
      }
      if (arrival) {
        const time = clamp((now - arrival.start) / 2100);
        const ease = smooth(time);
        arrival.pathY =
          arrival.entry.launchY + (arrival.to - arrival.entry.launchY) * ease;
        window.scrollTo({
          top: arrival.from + (arrival.to - arrival.from) * ease,
          behavior: "instant",
        });
        if (time === 1) {
          arrival.entry.progress = 1;
          visited.add(arrival.id);
          playTick();
          arrival = null;
        }
      }
      y = window.scrollY;
      let moving = !!arrival;
      let intensity = 0;
      let incoming = null;
      let active = "about";
      let activePhase = "cruising";

      entries.forEach((entry) => {
        if (y + Math.min(180, height * 0.3) >= entry.top) active = entry.id;
        if (entry.armed === null) entry.armed = y < entry.launchY;
        if (y < entry.launchY - 80 && arrival?.id !== entry.id)
          entry.armed = true;
        const raw = clamp(
          (entry.launchLine - (entry.origin - y)) /
            (entry.launchLine - entry.landingLine),
        );
        const hasFocus =
          entry.el.contains(document.activeElement) &&
          document.activeElement.matches(":focus-visible");
        const inArrival = enabled && !hasFocus && arrival?.id === entry.id;
        const target = inArrival
          ? clamp(
              (entry.launchLine - (entry.origin - arrival.pathY)) /
                (entry.launchLine - entry.landingLine),
            )
          : 1;
        if (!inArrival) entry.progress = target;
        else
          entry.progress +=
            (target - entry.progress) * (1 - Math.exp(-16 * dt));
        if (Math.abs(target - entry.progress) < 0.001) entry.progress = target;
        else moving = true;
        const p = entry.progress;
        const lift = smooth(clamp((p - 0.12) / 0.8));
        const dock = smooth(clamp((p - 0.84) / 0.16));
        const boostTime = clamp((now - entry.boostAt) / 1050);
        const thrust = enabled ? Math.sin(boostTime * Math.PI) : 0;
        if (boostTime < 1 && enabled) moving = true;
        const phase =
          !enabled || p >= 0.995
            ? "docked"
            : p <= 0.02
              ? "waiting"
              : p < 0.3
                ? "tethering"
                : p < 0.84
                  ? "lifting"
                  : "docking";
        if (inArrival) {
          const strength = Math.sin(p * Math.PI);
          if (strength > intensity) {
            intensity = strength;
            incoming = entry.id;
            activePhase = phase;
          }
        }
        if (raw >= 0.995 && !visited.has(entry.id)) {
          visited.add(entry.id);
        }
        if (raw >= 0.995 && !inArrival) entry.armed = false;

        const style = entry.el.style;
        style.setProperty("--flight-progress", p.toFixed(4));
        style.setProperty(
          "--payload-y",
          `${((1 - lift) * (compact ? 190 : 290) - thrust * 9).toFixed(2)}px`,
        );
        style.setProperty(
          "--payload-pitch",
          `${(compact ? 0 : (1 - lift) * 3.5).toFixed(2)}deg`,
        );
        style.setProperty("--payload-scale", (0.94 + lift * 0.06).toFixed(4));
        style.setProperty(
          "--tow-gap",
          `${(30 + Math.sin(p * Math.PI) * (compact ? 64 : 100) + thrust * 14).toFixed(2)}px`,
        );
        style.setProperty(
          "--rocket-scale",
          (1 - dock * 0.32 + thrust * 0.08).toFixed(4),
        );
        style.setProperty(
          "--rocket-bank",
          `${((1 - lift) * 19 + dock * 14).toFixed(2)}deg`,
        );
        style.setProperty(
          "--engine-power",
          (0.65 + Math.sin(p * Math.PI) * 0.8 + thrust * 0.85).toFixed(3),
        );
        style.setProperty(
          "--cable-opacity",
          (0.35 + Math.sin(p * Math.PI) * 0.6).toFixed(3),
        );
        entry.el.dataset.boosted = thrust > 0.02 ? "true" : "false";
        if (phase !== entry.phase) {
          entry.phase = phase;
          entry.el.dataset.flightPhase = phase;
          if (entry.caption)
            entry.caption.textContent = {
              waiting: "Awaiting launch",
              tethering: "Tethers locked",
              lifting: "Pulling into orbit",
              docking: "Easy does it…",
              docked: "Docked · tap a rocket",
            }[phase];
        }
      });

      currentId = arrival?.id || incoming || active;
      const boostedEntry = entries.find(
        (entry) => entry.id === (currentId === "about" ? "skills" : currentId),
      );
      const boosted =
        enabled && now - (boostedEntry?.boostAt ?? -Infinity) < 1050;
      root.style.setProperty("--flight-intensity", intensity.toFixed(3));
      const phase = incoming ? activePhase : "cruising";
      const key = `${currentId}:${phase}:${visited.size}:${arrival?.kind || ""}:${boosted}`;
      if (key !== statusKey) {
        statusKey = key;
        onStatus({
          id: currentId,
          title: TITLES[currentId],
          phase,
          visited: [...visited],
          replaying: arrival?.kind === "replay",
          arriving: !!arrival,
          boosted,
        });
      }
      previousY = y;
      if (moving) schedule();
    }

    controls.current = {
      boost: () => boost(currentId === "about" ? "skills" : currentId),
      replay: () => {
        const entry =
          entries.find((item) => item.id === currentId) || entries[0];
        startArrival(entry, "replay");
      },
      next: () => {
        const currentIndex = sections.findIndex((el) => el.id === currentId);
        const next = sections[(currentIndex + 1) % sections.length];
        const entry = entries.find((item) => item.id === next?.id);
        if (enabled && entry) {
          startArrival(entry, "navigation", true);
          return;
        }
        cancelArrival();
        if (next && window.location.hash !== `#${next.id}`) {
          window.history.pushState(null, "", `#${next.id}`);
        }
        next?.scrollIntoView({
          behavior: enabled ? "smooth" : "auto",
          block: "start",
        });
      },
    };

    const observer = new ResizeObserver(measure);
    sections.forEach((section) => observer.observe(section));
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("portfolio-thrust", onBoost);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("pointerdown", cancelArrival, { passive: true });
    window.addEventListener("popstate", cancelArrival);
    window.addEventListener("keydown", onKey);
    document.addEventListener("click", onNavigation);
    document.addEventListener("focusin", revealFocused);
    return () => {
      destroyed = true;
      controls.current = null;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("portfolio-thrust", onBoost);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("pointerdown", cancelArrival);
      window.removeEventListener("popstate", cancelArrival);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onNavigation);
      document.removeEventListener("focusin", revealFocused);
      root.style.setProperty("--flight-intensity", "0");
      delete root.dataset.cinematics;
    };
  }, [enabled, orbitRef, onStatus]);

  return controls;
}
