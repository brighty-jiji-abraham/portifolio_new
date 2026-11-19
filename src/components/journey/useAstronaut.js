import { useCallback, useEffect, useRef, useState } from "react";
import { UNIVERSE_STOPS } from "./destinations";

function destinationFromURL() {
  const id = window.location.hash.slice(1);
  return UNIVERSE_STOPS.some((stop) => stop.id === id) ? id : "about";
}

export default function useAstronaut() {
  const [initial] = useState(destinationFromURL);
  const [enabled, setEnabled] = useState(true);
  const [inspection, setInspection] = useState(initial);
  const initialControl = {
    enabled: true,
    session: 1,
    start: initial,
    reading: initial,
    keys: new Set(),
    lookX: 0,
    lookY: 0,
    command: null,
    dragged: false,
    report: null,
  };
  const flight = useRef(initialControl);
  const journey = useRef({
    exploring: true,
    explorer: initialControl,
    active: true,
    progress: 0,
    location: 0,
  });
  const showInformation = useCallback((id) => {
    flight.current.reading = id;
    flight.current.keys.clear();
    setInspection(id);
  }, []);
  const dismissInformation = useCallback((options) => {
    flight.current.reading = null;
    if (!options?.preserveKeys) flight.current.keys.clear();
    setInspection(null);
    requestAnimationFrame(() =>
      document.querySelector(".flight-brake")?.focus({ preventScroll: true }),
    );
  }, []);
  const inspect = useCallback((id, reframe = false, updateHistory = true) => {
    if (!UNIVERSE_STOPS.some((stop) => stop.id === id)) return;
    if (flight.current.reading === id && !reframe) return;
    flight.current.reading = null;
    flight.current.keys.clear();
    flight.current.command = { id, inspect: true };
    setInspection(null);
    if (updateHistory && location.hash !== "#" + id)
      history.pushState(null, "", "#" + id);
  }, []);
  useEffect(() => {
    flight.current.onInspect = showInformation;
    flight.current.dismissInformation = dismissInformation;
  }, [showInformation, dismissInformation]);
  const enter = useCallback(() => {
    const id = destinationFromURL();
    Object.assign(flight.current, {
      enabled: true,
      session: flight.current.session + 1,
      start: id,
      command: null,
      lookX: 0,
      lookY: 0,
      dragged: false,
    });
    journey.current.exploring = true;
    flight.current.keys.clear();
    window.scrollTo({ top: 0, behavior: "instant" });
    showInformation(id);
    setEnabled(true);
  }, [showInformation]);
  const exit = useCallback(() => {
    flight.current.enabled = false;
    flight.current.reading = null;
    flight.current.command = null;
    flight.current.keys.clear();
    journey.current.exploring = false;
    setInspection(null);
    setEnabled(false);
  }, []);
  const stopFlight = useCallback(() => {
    flight.current.keys.clear();
    flight.current.lookX = 0;
    flight.current.lookY = 0;
    flight.current.command = { id: "stop" };
  }, []);
  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    const restoration = history.scrollRestoration;
    history.scrollRestoration = "manual";
    root.dataset.exploring = "true";
    window.scrollTo({ top: 0, behavior: "instant" });
    const clear = () => {
      flight.current.keys.clear();
      flight.current.lookX = 0;
      flight.current.lookY = 0;
    };
    const keydown = (event) => {
      if (event.key === "Escape") {
        if (event.target.closest(".universe-options[open]")) return;
        event.preventDefault();
        clear();
        if (flight.current.reading) dismissInformation();
        else flight.current.command = { id: "stop" };
        return;
      }
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (
        event.target.closest(
          ".spatial-panel, .universe-options, input, textarea, select, [contenteditable='true']",
        )
      )
        return;
      if (
        [
          "KeyW",
          "KeyA",
          "KeyS",
          "KeyD",
          "KeyQ",
          "KeyE",
          "ShiftLeft",
          "ShiftRight",
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
        ].includes(event.code)
      ) {
        event.preventDefault();
        flight.current.keys.add(event.code);
      }
    };
    const keyup = (event) => flight.current.keys.delete(event.code);
    const historyChange = () => inspect(destinationFromURL(), true, false);
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    window.addEventListener("blur", clear);
    window.addEventListener("popstate", historyChange);
    window.addEventListener("hashchange", historyChange);
    document.addEventListener("visibilitychange", clear);
    return () => {
      delete root.dataset.exploring;
      history.scrollRestoration = restoration;
      clear();
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
      window.removeEventListener("blur", clear);
      window.removeEventListener("popstate", historyChange);
      window.removeEventListener("hashchange", historyChange);
      document.removeEventListener("visibilitychange", clear);
    };
  }, [enabled, inspect, dismissInformation]);
  return {
    enabled,
    enter,
    exit,
    flight,
    journey,
    inspection,
    inspect,
    dismissInformation,
    stopFlight,
  };
}
