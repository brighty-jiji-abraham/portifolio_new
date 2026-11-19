/* eslint-disable react/no-unknown-property */
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import FittedWorld from "./FittedWorld";
import EarthWorld from "./EarthWorld";
export { default as ProjectGallery } from "./ProjectGallery";

export function ContactEarth({
  journey,
  timeRef,
  signal,
  isLight,
  reducedMotion,
}) {
  const pulse = useRef();
  const pulseTime = useRef(-100);
  const { invalidate } = useThree();
  useEffect(() => {
    if (signal) pulseTime.current = timeRef.current;
    invalidate();
  }, [signal, timeRef, invalidate]);
  useFrame(() => {
    if (!pulse.current) return;
    const age =
      reducedMotion && signal ? 0.7 : timeRef.current - pulseTime.current;
    pulse.current.children.forEach((ring, index) => {
      const t = age - index * 0.4;
      ring.visible = t >= 0 && t < 3.5;
      ring.scale.setScalar(1 + Math.max(0, t) * 0.25);
      ring.material.opacity = Math.max(0, 0.7 - t * 0.2);
    });
  });
  return (
    <FittedWorld id="contact" index={4} bounds={[8.7, 8]} journey={journey}>
      <EarthWorld timeRef={timeRef} isLight={isLight} />
      <group ref={pulse} name="contact-signal">
        {[0, 1, 2].map((index) => (
          <mesh key={index}>
            <torusGeometry args={[2.05, 0.018, 8, 96]} />
            <meshBasicMaterial
              color={isLight ? "#237b88" : "#a4eeec"}
              transparent
              opacity={0}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
    </FittedWorld>
  );
}
