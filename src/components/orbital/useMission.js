import { useCallback, useEffect, useRef, useState } from "react";
import {
  FLIGHT_DURATION,
  RETRIEVAL_DURATION,
  flightPhase,
  retrievalStage,
} from "./mission";

export default function useMission({ active, reducedMotion }) {
  const motion = useRef({ progress: 0, time: 0, retrieval: -1, rotation: 0 });
  const progressElement = useRef(null);
  const [state, setState] = useState({
    mode: "orbit",
    paused: false,
    phase: 0,
    query: 0,
    stage: -1,
    source: null,
  });

  useEffect(() => {
    if (!active || state.paused) return;
    let frame;
    let previous;
    const update = (now) => {
      const dt =
        previous === undefined ? 0 : Math.min((now - previous) / 1000, 1);
      previous = now;
      if (!document.hidden) {
        const current = motion.current;
        if (!reducedMotion) current.time += dt;
        if (state.mode === "flight") {
          current.progress = reducedMotion
            ? 1
            : Math.min(1, current.progress + dt / FLIGHT_DURATION);
          if (progressElement.current)
            progressElement.current.value = current.progress;
          const phase = flightPhase(current.progress);
          if (current.progress === 1) {
            setState((value) => ({ ...value, mode: "lab", phase: 3 }));
          } else if (phase !== state.phase) {
            setState((value) => ({ ...value, phase }));
          }
        }
        if (
          state.mode === "lab" &&
          current.retrieval >= 0 &&
          current.retrieval < 1
        ) {
          current.retrieval = reducedMotion
            ? 1
            : Math.min(1, current.retrieval + dt / RETRIEVAL_DURATION);
          const stage = retrievalStage(current.retrieval);
          if (stage !== state.stage) setState((value) => ({ ...value, stage }));
        }
      }
      frame = requestAnimationFrame(update);
    };
    const resetClock = () => {
      previous = undefined;
    };
    document.addEventListener("visibilitychange", resetClock);
    frame = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", resetClock);
    };
  }, [
    active,
    reducedMotion,
    state.mode,
    state.paused,
    state.phase,
    state.stage,
  ]);

  const launch = useCallback(() => {
    motion.current.progress = reducedMotion ? 1 : 0;
    motion.current.retrieval = -1;
    motion.current.rotation = 0;
    setState((value) => ({
      ...value,
      mode: reducedMotion ? "lab" : "flight",
      paused: false,
      phase: 0,
      stage: -1,
      source: null,
    }));
  }, [reducedMotion]);

  const dock = useCallback(() => {
    motion.current.progress = 1;
    setState((value) => ({ ...value, mode: "lab", paused: false, phase: 3 }));
  }, []);

  const reset = useCallback(() => {
    motion.current.progress = 0;
    motion.current.retrieval = -1;
    motion.current.rotation = 0;
    setState((value) => ({
      ...value,
      mode: "orbit",
      paused: false,
      phase: 0,
      stage: -1,
      source: null,
    }));
  }, []);

  const chooseQuery = useCallback((query) => {
    motion.current.retrieval = -1;
    setState((value) => ({ ...value, query, stage: -1, source: null }));
  }, []);

  const runQuery = useCallback(() => {
    motion.current.retrieval = reducedMotion ? 1 : 0;
    setState((value) => ({
      ...value,
      stage: reducedMotion ? 3 : 0,
      source: null,
      paused: false,
    }));
  }, [reducedMotion]);

  const selectSource = useCallback((source) => {
    setState((value) => ({
      ...value,
      source: value.source === source ? null : source,
    }));
  }, []);

  const togglePause = useCallback(() => {
    setState((value) => ({ ...value, paused: !value.paused }));
  }, []);

  const rotate = useCallback((direction) => {
    motion.current.rotation += direction * 0.3;
    setState((value) => ({ ...value, revision: (value.revision || 0) + 1 }));
  }, []);

  return {
    state,
    motion,
    progressElement,
    launch,
    dock,
    reset,
    chooseQuery,
    runQuery,
    selectSource,
    togglePause,
    rotate,
  };
}
