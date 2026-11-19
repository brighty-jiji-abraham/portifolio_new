import { useContext, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils } from "three";
import {
  crossedProjectCue,
  PROJECT_SOUND_CUES,
} from "../../../audio/projectCues";
import { SceneEffectsContext } from "../SceneEffectsContext";

export const smooth = (time, start, end) =>
  MathUtils.smoothstep(time, start, end);
export const mix = MathUtils.lerp;

// Local playback restarts on selection; the shared clock owns pause and motion preferences.
export function useExhibitClock(timeRef, duration, sound) {
  const { playProjectCue, stopProjectSounds } = useContext(SceneEffectsContext);
  const start = useRef(null);
  const clock = useRef(0);
  const previous = useRef(null);
  const cues = Array.isArray(sound) ? sound : PROJECT_SOUND_CUES[sound] || [];
  useEffect(() => () => stopProjectSounds(), [sound, stopProjectSounds]);
  useFrame(() => {
    if (start.current === null) start.current = timeRef.current;
    const elapsed = Math.max(0, timeRef.current - start.current);
    clock.current = elapsed % duration;
    const cue = crossedProjectCue(cues, previous.current, elapsed, duration);
    previous.current = elapsed;
    if (cue) playProjectCue(cue);
  }, -0.25);
  return clock;
}
