import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";
import { assessFrame, createFrameAssessment } from "./qualityPolicy";

export default function AdaptiveQuality({ level, automatic, enabled, onLevel }) {
  const sample = useRef(createFrameAssessment());
  useFrame((_, delta) => {
    const canMeasure = automatic && enabled && (typeof document === "undefined" || !document.hidden) && !useProgress.getState().active;
    const next = assessFrame(sample.current, delta, level, canMeasure);
    if (next !== level) onLevel(next);
  });
  return null;
}
