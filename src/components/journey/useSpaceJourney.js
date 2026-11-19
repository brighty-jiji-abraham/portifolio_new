import { useCallback, useEffect, useRef, useState } from "react";
import { DESTINATIONS } from "./destinations";

const clamp = (value) => Math.max(0, Math.min(1, value));

export default function useSpaceJourney({ reducedMotion, unavailable }) {
  const journey = useRef({
    progress: 0,
    location: 0,
    phase: 0,
    start: 0,
    end: 1,
    active: true,
    ranges: [],
  });
  const animation = useRef({
    frame: 0,
    elapsed: 0,
    previous: 0,
    from: 0,
    target: "skills",
    duration: 6500,
  });
  const [stage, setStage] = useState("home");
  const [destination, setDestination] = useState("skills");
  const [playback, setPlayback] = useState("idle");
  const [paused, setPaused] = useState(false);

  const measure = useCallback(() => {
    const home = document.getElementById("about");
    journey.current.ranges = DESTINATIONS.map((stop, index) => {
      const section = document.getElementById(stop.id);
      const crossing = document.getElementById("crossing-" + stop.id);
      const end = section
        ? section.getBoundingClientRect().top + window.scrollY
        : 0;
      const start =
        index === 0
          ? Math.max(
              0,
              (home?.offsetHeight || window.innerHeight) - window.innerHeight,
            )
          : crossing
            ? crossing.getBoundingClientRect().top + window.scrollY
            : end;
      return {
        id: stop.id,
        index: index + 1,
        start,
        end,
        bottom: end + (section?.offsetHeight || window.innerHeight),
      };
    });
    journey.current.start = journey.current.ranges[0]?.start || 0;
    journey.current.end = journey.current.ranges[0]?.end || 1;
  }, []);

  const stop = useCallback(() => {
    cancelAnimationFrame(animation.current.frame);
    animation.current.frame = 0;
    setPlayback("idle");
  }, []);

  const arrive = useCallback(
    (id) => {
      stop();
      setPaused(false);
      measure();
      const target = typeof id === "string" ? id : destination;
      if (target === "about") {
        window.scrollTo({ top: 0, behavior: "instant" });
        history.replaceState(history.state, "", "#about");
        const home = document.getElementById("about");
        if (home) home.inert = false;
        document.getElementById("about-title")?.focus({ preventScroll: true });
        return;
      }
      const range = journey.current.ranges.find((entry) => entry.id === target);
      if (!range) return;
      window.scrollTo({ top: range.end, behavior: "instant" });
      history.replaceState(history.state, "", "#" + target);
      document
        .getElementById(target + "-title")
        ?.focus({ preventScroll: true });
    },
    [destination, measure, stop],
  );

  const play = useCallback(() => {
    setPlayback("playing");
    setPaused(false);
    animation.current.previous = 0;
    const step = (now) => {
      const current = animation.current;
      if (current.previous)
        current.elapsed += Math.min(now - current.previous, 250);
      current.previous = now;
      const range = journey.current.ranges.find(
        (entry) => entry.id === current.target,
      );
      if (!range) return stop();
      const t = clamp(current.elapsed / current.duration);
      const eased = t * t * (3 - 2 * t);
      window.scrollTo({
        top: current.from + (range.end - current.from) * eased,
        behavior: "instant",
      });
      if (t < 1) current.frame = requestAnimationFrame(step);
      else arrive(current.target);
    };
    animation.current.frame = requestAnimationFrame(step);
  }, [arrive, stop]);

  const launch = useCallback(
    (id = "skills", replay = false) => {
      stop();
      measure();
      const target = typeof id === "string" ? id : "skills";
      const range = journey.current.ranges.find((entry) => entry.id === target);
      if (!range) return;
      setDestination(target);
      const current = journey.current.location;
      const adjacent =
        current >= range.index - 1.03 && current < range.index - 0.01;
      if (reducedMotion || unavailable || (!replay && !adjacent))
        return arrive(target);
      const from = replay
        ? range.start
        : Math.max(range.start, Math.min(window.scrollY, range.end));
      window.scrollTo({ top: from, behavior: "instant" });
      Object.assign(animation.current, {
        from,
        elapsed: 0,
        target,
        duration: target === "skills" ? 6500 : 5000,
      });
      play();
    },
    [arrive, measure, play, reducedMotion, stop, unavailable],
  );

  const togglePause = useCallback(() => {
    if (playback === "playing") {
      cancelAnimationFrame(animation.current.frame);
      setPlayback("paused");
      setPaused(true);
    } else if (playback === "paused") play();
    else setPaused((value) => !value);
  }, [play, playback]);

  useEffect(() => {
    const currentAnimation = animation.current;
    const update = () => {
      const current = journey.current;
      let location = 0;
      let flight = null;
      let phase = 0;
      let resting = "home";
      for (const range of current.ranges) {
        if (window.scrollY >= range.end - 2) {
          location = range.index;
          resting = range.id;
        } else if (window.scrollY > range.start && range.end > range.start) {
          phase = clamp(
            (window.scrollY - range.start) / (range.end - range.start),
          );
          location =
            range.index -
            1 +
            (reducedMotion || unavailable ? (phase > 0.65 ? 1 : 0) : phase);
          if (phase > 0.025 && phase < 0.98 && !reducedMotion && !unavailable)
            flight = range;
          if (phase >= 0.98) resting = range.id;
          break;
        } else break;
      }
      current.location = location;
      current.progress = Math.min(1, location);
      current.phase = phase;
      current.active =
        window.scrollY < (current.ranges.at(-1)?.bottom || Infinity);
      const next = !current.active ? "after" : flight ? "flight" : resting;
      setStage((previous) => (previous === next ? previous : next));
      if (flight)
        setDestination((previous) =>
          previous === flight.id ? previous : flight.id,
        );
      const home = document.getElementById("about");
      if (home) home.inert = current.progress > 0.15;
      document.documentElement.dataset.journey = next;
      document.documentElement.style.setProperty("--journey-progress", phase);
      document.documentElement.style.setProperty(
        "--home-departure",
        current.progress,
      );
      window.dispatchEvent(new Event("journey-frame"));
    };
    const resize = () => {
      measure();
      update();
    };
    const observer = new ResizeObserver(resize);
    [
      "about",
      ...DESTINATIONS.map((entry) => entry.id),
      ...DESTINATIONS.map((entry) => "crossing-" + entry.id),
    ].forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    const story = document.querySelector(".story");
    if (story) observer.observe(story);
    resize();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", resize);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(currentAnimation.frame);
      delete document.documentElement.dataset.journey;
    };
  }, [measure, reducedMotion, unavailable]);

  useEffect(() => {
    const navigate = (event) => {
      if (journey.current.exploring) return;
      const link = event.target.closest("a[href^='#']");
      if (
        !link ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
      )
        return;
      const id = link.hash.slice(1);
      if (DESTINATIONS.some((entry) => entry.id === id)) {
        event.preventDefault();
        launch(id);
      } else stop();
    };
    const manual = (event) => {
      if (journey.current.exploring) return;
      if (
        event?.type === "touchstart" &&
        event.target.closest("button, a, input, select, summary, textarea")
      )
        return;
      stop();
      if (playback !== "idle") setPaused(false);
    };
    const keys = (event) => {
      if (journey.current.exploring) return;
      if (event.key === "Escape" && (stage === "flight" || playback !== "idle"))
        arrive(playback !== "idle" ? animation.current.target : destination);
      else if (
        ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End"].includes(
          event.key,
        )
      )
        manual();
    };
    const visibility = () => {
      if (document.hidden && playback === "playing") {
        cancelAnimationFrame(animation.current.frame);
        setPlayback("paused");
        setPaused(true);
      }
    };
    document.addEventListener("click", navigate);
    window.addEventListener("wheel", manual, { passive: true });
    window.addEventListener("touchstart", manual, { passive: true });
    window.addEventListener("keydown", keys);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      document.removeEventListener("click", navigate);
      window.removeEventListener("wheel", manual);
      window.removeEventListener("touchstart", manual);
      window.removeEventListener("keydown", keys);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [arrive, destination, launch, playback, stage, stop]);

  return {
    journey,
    stage,
    destination,
    playback,
    paused,
    setPaused,
    launch,
    arrive,
    togglePause,
    stop,
  };
}
