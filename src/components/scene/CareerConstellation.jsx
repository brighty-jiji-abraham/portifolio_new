import { setSceneCursor } from "./scenePlatform";
/* eslint-disable react/no-unknown-property */
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";
import FittedWorld from "./FittedWorld";
import { StellarLight, StellarCloud } from "./StellarAtmosphere";
import { experiences } from "../../data/experience";
import {
  birthStar,
  careerStarLabels,
  journeyStars,
} from "../../data/constellation";
import {
  CelestialGlow,
  CurveLine,
  WorldLabel,
} from "./CelestialPrimitives";
import { useExhibitRotation } from "../../hooks/useExhibitRotation";

const POSITIONS = journeyStars.map(
  (entry) =>
    new THREE.Vector3(
      entry.position[0] * 1.16,
      entry.position[1] * 1.24,
      entry.position[2] * 2.4,
    ),
);

function MilestoneStar({
  entry,
  ordinal,
  selected,
  hovered,
  onHover,
  onSelect,
  journey,
  timeRef,
  isLight,
  compact,
}) {
  const body = useRef();

  const origin = entry.experienceIndex === -1;
  const active = selected || hovered;
  const color =
    origin || active
      ? isLight
        ? "#9b6733"
        : "#efc58a"
      : isLight
        ? "#357c9a"
        : "#a6d9ef";
  const entryData = experiences[entry.experienceIndex];
  useFrame((_, delta) => {
    const still = journey.current.explorer?.motionOff;
    const scale = (compact ? 1.65 : 1) * (active ? 1.24 : 1);
    body.current.scale.setScalar(
      still
        ? scale
        : THREE.MathUtils.damp(
            body.current.scale.x,
            scale,
            8,
            Math.min(delta, 0.05),
          ),
    );

  });
  const select = (event) => {
    if (journey.current.explorer?.dragged) return;
    event.stopPropagation();
    onSelect(entry.experienceIndex);
  };
  return (
    <group
      position={POSITIONS[ordinal]}
      name={origin ? "birth-star" : `career-star-${entry.experienceIndex}`}
    >
      <group ref={body}>
        <Billboard>
          <StellarLight color={color} size={origin ? 2.4 : active ? 2.6 : 1.8}
            active={active || origin} phase={ordinal * 2.17} timeRef={timeRef} isLight={isLight} />
        </Billboard>
      </group>
      <mesh
        onClick={select}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(entry.experienceIndex);
          setSceneCursor("pointer");
        }}
        onPointerOut={() => {
          onHover(null);
          setSceneCursor("");
        }}
      >
        <sphereGeometry args={[compact ? 0.8 : 0.43, 16, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <WorldLabel
        text={origin ? "My beginning" : compact && !active ? entryData.period.match(/\d{4}/)?.[0] : entryData.period.split(" – ")[0]}
        color={
          active || origin
            ? isLight
              ? "#825423"
              : "#f1d1a6"
            : isLight
              ? "#2e5268"
              : "#e2edf4"
        }
        position={[
          0,
          (ordinal === 0 || ordinal === 4 ? 1 : -1) *
            (compact ? (origin ? 1.05 : active ? 0.95 : 0.62) : 0.65),
          0,
        ]}
        width={origin ? 2.75 : 1.65}
        size={compact ? (origin ? 185 : 255) : origin ? 75 : 115}
      />
      {!compact && !origin && (
        <WorldLabel
          text={careerStarLabels[entry.experienceIndex]}
          color={isLight ? "#546f80" : "#9cb6ca"}
          position={[0, ordinal === 4 ? 1 : -1, 0]}
          width={2.7}
          size={58}
        />
      )}
    </group>
  );
}

function ConstellationPaths({ selectedStep, focusStep, journey, timeRef, isLight }) {
  const beacon = useRef();
  const trail = useRef();
  const flow = useRef();
  const lines = useRef([]);
  const progress = useRef(selectedStep);
  const curves = useMemo(
    () =>
      POSITIONS.slice(1).map((end, i) => {
        const mid = POSITIONS[i].clone().lerp(end, 0.5);
        mid.z += 0.22;
        return new THREE.QuadraticBezierCurve3(POSITIONS[i], mid, end);
      }),
    [],
  );
  const helper = useMemo(
    () => ({
      point: new THREE.Vector3(),
      object: new THREE.Object3D(),
      gold: new THREE.Color(isLight ? "#9b6733" : "#e0bd88"),
      blue: new THREE.Color(isLight ? "#547f95" : "#5b93ae"),
    }),
    [isLight],
  );
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const still = journey.current.explorer?.motionOff;
    progress.current = still
      ? selectedStep
      : THREE.MathUtils.damp(progress.current, selectedStep, 2.8, dt);
    const place = (p, target) => {
      const n = THREE.MathUtils.clamp(p, 0, curves.length - 0.00001);
      return curves[Math.floor(n)].getPoint(n % 1, target);
    };
    place(progress.current, beacon.current.position);
    const traveling = Math.abs(progress.current - selectedStep) > 0.015;
    beacon.current.visible = traveling && !still;
    trail.current.visible = traveling && !still;
    for (let i = 0; i < 18; i++) {
      place(
        progress.current +
          Math.sign(progress.current - selectedStep) * i * 0.018,
        helper.point,
      );
      helper.object.position.copy(helper.point);
      helper.object.scale.setScalar(0.04 * (1 - i / 18));
      helper.object.updateMatrix();
      trail.current.setMatrixAt(i, helper.object.matrix);
    }
    trail.current.instanceMatrix.needsUpdate = true;
    curves.forEach((curve, segment) => {
      for (let i = 0; i < 3; i++) {
        const t = (timeRef.current * 0.09 + i / 3 + segment * 0.17) % 1;
        curve.getPoint(t, helper.point);
        helper.object.position.copy(helper.point);
        helper.object.scale.setScalar((0.012 + Math.sin(t * Math.PI) * 0.012) * (segment < selectedStep ? 1 : 0.65));
        helper.object.updateMatrix();
        flow.current.setMatrixAt(segment * 3 + i, helper.object.matrix);
      }
    });
    flow.current.instanceMatrix.needsUpdate = true;
    lines.current.forEach((line, i) => {
      if (!line) return;
      const active = i < selectedStep || i === focusStep || i + 1 === focusStep;
      line.material.color.lerp(
        active ? helper.gold : helper.blue,
        still ? 1 : 1 - Math.exp(-dt * 6),
      );
      const opacity = active ? isLight ? 0.65 : 0.5 : isLight ? 0.28 : 0.13;
      line.material.opacity = still ? opacity : THREE.MathUtils.damp(line.material.opacity, opacity, 6, dt);
    });
  });
  return (
    <group name="constellation-paths">
      {curves.map((curve, i) => (
        <CurveLine
          key={i}
          ref={(el) => {
            lines.current[i] = el;
          }}
          curve={curve}
          color={helper.blue}
          opacity={0.5}
        />
      ))}
      <instancedMesh ref={flow} args={[null, null, curves.length * 3]} raycast={() => null} frustumCulled={false} name="career-starlight-flow">
        <sphereGeometry args={[1, 8, 6]} />
        <meshBasicMaterial color={isLight ? "#416a86" : "#d6e8f7"} toneMapped={false} />
      </instancedMesh>
      <group ref={beacon} name="journey-comet">
        <mesh>
          <sphereGeometry args={[0.032, 12, 8]} />
          <meshBasicMaterial
            color={isLight ? "#8a5b2b" : "#fff2c7"}
            toneMapped={false}
          />
        </mesh>
        <Billboard>
          <CelestialGlow
            color={isLight ? "#b07e47" : "#efd4a5"}
            size={0.65}
            strength={0.8}
            isLight={isLight}
            journey={journey}
          />
        </Billboard>
      </group>
      <instancedMesh
        ref={trail}
        args={[null, null, 18]}
        raycast={() => null}
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 8, 6]} />
        <meshBasicMaterial
          color={isLight ? "#a6763e" : "#e6c58b"}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  );
}

export default function CareerConstellation({
  journey,
  timeRef,
  selected,
  onSelect,
  isLight,
  reset = 0,
}) {
  const [hovered, setHovered] = useState(null);
  const { size } = useThree();
  const compact = size.width < 1000 || size.height < 600;
  const assembly = useExhibitRotation(
    "experience",
    journey,
    reset,
    [0.35, 0.65],
    timeRef,
  );
  const selectedStep = journeyStars.findIndex(
    (entry) => entry.experienceIndex === selected,
  );
  const focusStep = journeyStars.findIndex(
    (entry) => entry.experienceIndex === hovered,
  );
  useEffect(
    () => () => {
      setSceneCursor("");
    },
    [],
  );
  return (
    <FittedWorld id="experience" index={3} journey={journey}>
      {!compact && (
        <WorldLabel
          text="Every experience, a guiding star."
          color={isLight ? "#3b6577" : "#b7d1df"}
          position={[0, 4.15, 0]}
          width={7}
          size={49}
        />
      )}
      <group ref={assembly} name="career-constellation">
        <group scale={compact ? 1.25 : 1}>
          <StellarCloud timeRef={timeRef} isLight={isLight} seed={birthStar.seed} color="#9bb5d8" />
          <ConstellationPaths
            selectedStep={selectedStep}
            timeRef={timeRef}
            focusStep={focusStep}
            journey={journey}
            isLight={isLight}
          />
          {journeyStars.map((entry, ordinal) => (
            <MilestoneStar
              key={entry.experienceIndex}
              entry={entry}
              ordinal={ordinal}
              selected={selected === entry.experienceIndex}
              hovered={hovered === entry.experienceIndex}
              onHover={setHovered}
              onSelect={onSelect}
              journey={journey}
              timeRef={timeRef}
              isLight={isLight}
              compact={compact}
            />
          ))}
        </group>
      </group>
      {!compact && (
        <WorldLabel
          text="Drag to turn the sky · Select a star to explore"
          color={isLight ? "#526d80" : "#91afc0"}
          position={[0, -4.35, 0]}
          width={7}
          size={30}
        />
      )}
      <pointLight
        color="#d2eaff"
        intensity={45}
        position={[-3, 3, 4]}
        distance={14}
      />
      <pointLight
        color="#f4d0a0"
        intensity={28}
        position={[3, -1, 2]}
        distance={12}
      />
    </FittedWorld>
  );
}
