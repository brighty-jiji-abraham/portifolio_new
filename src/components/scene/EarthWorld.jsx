/* eslint-disable react/no-unknown-property */
import { Suspense, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

import { FaReact, FaPython, FaAws, FaNodeJs } from "react-icons/fa";
import {
  SiPytorch,
  SiTensorflow,
  SiDocker,
  SiOpenai,
  SiMongodb,
  SiRedis,
  SiTypescript,
  SiAnthropic,
  SiKubernetes,
  SiLangchain,
  SiPostgresql,
  SiGraphql,
  SiNextdotjs,
  SiVuedotjs,
  SiTailwindcss,
  SiLinux,
} from "react-icons/si";
import * as THREE from "three";
import useIconTexture from "./useIconTexture";
import PlanetEarth from "./PlanetEarth";
import { Moon } from "./OpenSpace";

const TECH = [
  { Icon: FaPython, color: "#ffce3e" },
  { Icon: FaReact, color: "#61dafb" },
  { Icon: SiOpenai, color: "#77d5b3" },
  { Icon: SiPytorch, color: "#ff7561" },
  { Icon: SiDocker, color: "#54baff" },
  { Icon: SiAnthropic, color: "#edb391" },
  { Icon: FaNodeJs, color: "#8bd66d" },
  { Icon: SiTensorflow, color: "#ffa64e" },
  { Icon: SiMongodb, color: "#73bf67" },
  { Icon: FaAws, color: "#ffbc65" },
  { Icon: SiTypescript, color: "#69a6ff" },
  { Icon: SiRedis, color: "#ff7474" },
  { Icon: SiKubernetes, color: "#739bff" },
  { Icon: SiLangchain, color: "#83d8d2" },
  { Icon: SiPostgresql, color: "#72a7d0" },
  { Icon: SiGraphql, color: "#f16ccc" },
  { Icon: SiNextdotjs, color: "#ffffff", lightColor: "#302118" },
  { Icon: SiVuedotjs, color: "#69cfaa" },
  { Icon: SiTailwindcss, color: "#38bdf8" },
  { Icon: SiLinux, color: "#fcc624" },
];
const ORBITS = [
  {
    radius: 2.35,
    rotation: [0.9, 0.25, -0.25],
    color: "#dba57c",
    speed: 0.13,
    phase: 0,
  },
  {
    radius: 2.6,
    rotation: [-0.65, -0.35, 0.45],
    color: "#82c9c2",
    speed: -0.09,
    phase: 0.45,
  },
  {
    radius: 2.85,
    rotation: [0.4, 1.05, -0.4],
    color: "#b6a2db",
    speed: 0.065,
    phase: 0.9,
  },
  {
    radius: 3.05,
    rotation: [1.2, -0.5, 0.7],
    color: "#8bb8e5",
    speed: -0.075,
    phase: 1.35,
  },
  {
    radius: 3.25,
    rotation: [-0.35, 0.7, -0.65],
    color: "#dda1c9",
    speed: 0.085,
    phase: 1.8,
  },
];

function Satellite({ item, index, orbit, timeRef, isLight }) {
  const sprite = useRef();
  const texture = useIconTexture(
    item.Icon,
    isLight ? item.lightColor || new THREE.Color(item.color).multiplyScalar(0.28).getStyle() : item.color,
  );
  useFrame(() => {
    if (!sprite.current) return;
    const angle =
      (index * Math.PI) / 2 + orbit.phase + timeRef.current * orbit.speed;
    sprite.current.position.set(
      Math.cos(angle) * orbit.radius,
      Math.sin(angle) * orbit.radius,
      0,
    );
  });
  return (
    <sprite ref={sprite} scale={[0.29, 0.29, 0.29]}>
      <spriteMaterial
        key={texture?.uuid || "loading"}
        map={texture}
        transparent
        opacity={texture ? isLight ? 1 : 0.8 : 0}
        toneMapped={false}
        depthTest
        depthWrite={false}
      />
    </sprite>
  );
}

function OrbitingMoon({ timeRef }) {
  const orbit = useRef();
  const axis = useMemo(() => new THREE.Vector3(2.1, -2.75, 0).normalize(), []);
  useFrame(() => orbit.current.quaternion.setFromAxisAngle(axis, timeRef.current * 0.04));
  return (
    <group ref={orbit} name="moon-orbit">
      <Moon position={[2.75, 2.1, -1.8]} rotation={[0.1, 1.8, 0.1]} scale={0.46} name="earth-moon" />
    </group>
  );
}

export default function EarthWorld({ timeRef, isLight }) {
  return (
    <group name="earth-system">
      <Suspense
        fallback={
          <mesh scale={1.22}>
            <sphereGeometry args={[1.58, 32, 24]} />
            <meshPhongMaterial color="#31505c" />
          </mesh>
        }
      >
        <PlanetEarth timeRef={timeRef} />
      </Suspense>
      <Suspense fallback={null}>
        <OrbitingMoon timeRef={timeRef} />
      </Suspense>
      {ORBITS.map((orbit, ring) => (
        <group key={ring} rotation={orbit.rotation}>
          <mesh>
            <ringGeometry
              args={[orbit.radius - 0.005, orbit.radius + 0.005, 128]}
            />
            <meshBasicMaterial
              color={isLight ? "#496e8a" : orbit.color}
              transparent
              opacity={isLight ? 0.2 : 0.08}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          {TECH.slice(ring * 4, ring * 4 + 4).map((item, i) => (
            <Satellite
              key={i}
              item={item}
              index={i}
              orbit={orbit}
              timeRef={timeRef}
              isLight={isLight}
            />
          ))}
        </group>
      ))}
    </group>
  );
}
