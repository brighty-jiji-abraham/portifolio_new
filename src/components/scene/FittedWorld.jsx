/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils } from "three";
import { UNIVERSE_STOPS } from "../journey/destinations";
import { spatialLayout } from "../journey/spatialLayout";

// Every exhibit lives in the same world; its placement never depends on page scrolling.
export default function FittedWorld({ id, index, journey, children }) {
  const group = useRef();
  const { size } = useThree();
  const stop = UNIVERSE_STOPS[index];
  const informationScale = spatialLayout(
    stop,
    size.width,
    size.height,
  ).modelScale;
  useFrame((_, dt) => {
    const flight = journey.current.explorer;
    // Keep the focused constellation clear of distant exhibit labels.
    const readingStars = flight?.reading === "skills" || flight?.reading === "experience";
    group.current.visible = !readingStars || flight.reading === id;
    const approaching =
      flight?.travel?.id === id && flight.travel.progress > 0.55;
    const target = flight?.reading === id || approaching ? informationScale : 1;
    group.current.scale.setScalar(
      flight?.reducedMotion
        ? target
        : MathUtils.damp(group.current.scale.x, target, 5, Math.min(dt, 0.1)),
    );
  }, -0.5);
  return (
    <group ref={group} name={id + "-world"} position={stop.target}>
      {children}
    </group>
  );
}
