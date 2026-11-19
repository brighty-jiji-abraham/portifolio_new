/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

function createDust() {
  let seed = 417;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  return {
    stars: Array.from({ length: 100 }, () => [
      (random() - 0.5) * 65,
      (random() - 0.5) * 45,
      -8 - random() * 75,
    ]),
    positions: new Float32Array(600),
  };
}

export default function FlightDust({ flight, isLight }) {
  const ref = useRef();
  const data = useMemo(() => createDust(), []);
  useFrame(({ camera }, dt) => {
    const travel = flight.current.travel;
    const visible = !!travel && !flight.current.motionOff;
    ref.current.visible = visible;
    if (!visible) return;
    ref.current.position.copy(camera.position);
    ref.current.quaternion.copy(camera.quaternion);
    ref.current.material.opacity =
      Math.sin(Math.PI * travel.progress) ** 2 * (isLight ? 0.32 : 0.38);
    data.stars.forEach((star, i) => {
      star[2] += Math.min(dt, 0.1) * Math.min(travel.speed, 32);
      if (star[2] > -4) star[2] = -83;
      data.positions.set(star, i * 6);
      data.positions.set(
        [star[0], star[1], star[2] - Math.min(travel.speed * 0.035, 1.2)],
        i * 6 + 3,
      );
    });
    ref.current.geometry.attributes.position.needsUpdate = true;
  });
  return (
    <lineSegments
      ref={ref}
      frustumCulled={false}
      visible={false}
      name="flight-dust"
    >
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[data.positions, 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={isLight ? "#537b94" : "#bad5e3"}
        transparent
        opacity={0}
        depthWrite={false}
      />
    </lineSegments>
  );
}
