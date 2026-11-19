import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils } from "three";

export const smooth = (time, start, end) => MathUtils.smoothstep(time, start, end);
export const mix = MathUtils.lerp;

// Local playback restarts on selection; the shared clock owns pause and motion preferences.
export function useExhibitClock(timeRef, duration) {
  const start = useRef(null);
  const clock = useRef(0);
  useFrame(() => {
    if (start.current === null) start.current = timeRef.current;
    clock.current = Math.max(0, timeRef.current - start.current) % duration;
  }, -0.25);
  return clock;
}
