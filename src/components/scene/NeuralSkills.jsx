/* eslint-disable react/no-unknown-property */
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";
import { skillGroups } from "../../data/skills";
import useIconTexture from "./useIconTexture";
import FittedWorld from "./FittedWorld";
import { StellarLight, StellarCloud } from "./StellarAtmosphere";
import {
  CurveLine,
  WorldLabel,
} from "./CelestialPrimitives";
import { useExhibitRotation } from "../../hooks/useExhibitRotation";

function Neuron({
  item, index, position, selected, hovered, onHover, onSelect,
  journey, timeRef, isLight, compact, signal,
}) {
  const node = useRef();
  const color = isLight ? new THREE.Color(item.color).multiplyScalar(0.2).getStyle() : item.color;
  const starColor = isLight ? "#376482" : new THREE.Color(item.color).lerp(new THREE.Color("#c3e3ff"), 0.65).getStyle();
  const icon = useIconTexture(item.Icon, color);
  const active = selected || hovered;
  useFrame((_, delta) => {
    const target = (compact ? 1.18 : 1) * (active ? 1.08 : 1);
    node.current.scale.setScalar(journey.current.explorer?.motionOff
      ? target : THREE.MathUtils.damp(node.current.scale.x, target, 8, Math.min(delta, 0.05)));
  });
  return (
    <group
      ref={node} position={position} name={`neuron-${index}`}
      onClick={event => {
        if (journey.current.explorer?.dragged) return;
        event.stopPropagation(); onSelect(index);
      }}
      onPointerOver={event => { event.stopPropagation(); onHover(index); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { onHover(-1); document.body.style.cursor = ""; }}
    >
      <Billboard>
        <StellarLight color={starColor} size={compact ? 2.0 : active ? 1.85 : 1.45}
          active={active} phase={index * 1.7} timeRef={timeRef}
          signal={selected ? signal : undefined} isLight={isLight} />
        <sprite name="neuron-icon" position={[compact ? 0.47 : 0.37, 0.02, 0.02]}
          scale={compact ? [0.6, 0.6, 1] : [0.4, 0.4, 1]} renderOrder={3}>
          <spriteMaterial key={icon?.uuid || "loading"} map={icon} transparent
            opacity={icon ? active ? 1 : 0.86 : 0} depthWrite={false} depthTest={false} toneMapped={false} />
        </sprite>
        {(!compact || active) && (
          <WorldLabel text={item.label}
            color={active ? isLight ? "#173e5a" : "#f0f5fc" : isLight ? "#31556f" : "#b2c6d6"}
            position={[0.12, compact ? -0.7 : -0.47, 0]}
            width={compact ? 3 : 2.1} size={compact ? 160 : 78} />
        )}
      </Billboard>
      <mesh>
        <sphereGeometry args={[compact ? 0.79 : 0.52, 12, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Synapses({
  nodes,
  focus,
  selected,
  timeRef,
  signal,
  accent,
  isLight,
  journey,
}) {
  const pulses = useRef();
  const lineRefs = useRef([]);
  const edges = useMemo(() => {
    const result = [];
    nodes.forEach((from, a) =>
      nodes.forEach((to, b) => {
        if (to.layer !== from.layer + 1) return;
        const fromRank = from.count === 1 ? 0.5 : from.row / (from.count - 1);
        const toRank = to.count === 1 ? 0.5 : to.row / (to.count - 1);
        if (Math.abs(fromRank - toRank) > 0.5 && (a + b) % 4 !== 0) return;
        const start = new THREE.Vector3(...from.position);
        const end = new THREE.Vector3(...to.position);
        const middle = start.clone().lerp(end, 0.5);
        middle.z -= 0.85 + Math.abs(start.y - end.y) * 0.18;
        result.push({
          a,
          b,
          curve: new THREE.QuadraticBezierCurve3(start, middle, end),
        });
      }),
    );
    return result;
  }, [nodes]);
  const helpers = useMemo(
    () => ({
      point: new THREE.Vector3(),
      object: new THREE.Object3D(),
      color: new THREE.Color(),
    }),
    [],
  );
  const idleColor = useMemo(
    () => new THREE.Color(isLight ? "#517c90" : "#47778c"),
    [isLight],
  );
  const activeColor = useMemo(() => new THREE.Color(accent), [accent]);
  useFrame((_, delta) => {
    if (!pulses.current) return;
    const elapsed = timeRef.current - signal.current;
    edges.forEach((edge, i) => {
      const focused = edge.a === focus || edge.b === focus;
      const connected = edge.a === selected || edge.b === selected;
      const burst = connected && elapsed >= 0 && elapsed < 2.3;
      const progress = burst
        ? Math.min(1, elapsed / 2.3)
        : (timeRef.current * 0.13 + i * 0.173) % 1;
      edge.curve.getPoint(
        burst && edge.b === selected ? 1 - progress : progress,
        helpers.point,
      );
      helpers.object.position.copy(helpers.point);
      helpers.object.scale.setScalar(
        burst
          ? 0.045 + Math.sin(progress * Math.PI) * 0.025
          : focused
            ? 0.035
            : 0.017,
      );
      helpers.object.updateMatrix();
      pulses.current.setMatrixAt(i, helpers.object.matrix);
      pulses.current.setColorAt(
        i,
        helpers.color.copy(focused ? activeColor : idleColor),
      );
      const material = lineRefs.current[i]?.material;
      if (material) {
        const still = journey.current.explorer?.motionOff;
        material.color.lerp(
          focused ? activeColor : idleColor,
          still ? 1 : 1 - Math.exp(-delta * 9),
        );
        const opacity = focused ? isLight ? 0.7 : 0.58 : isLight ? 0.3 : 0.14;
        material.opacity = still
          ? opacity
          : THREE.MathUtils.damp(
              material.opacity,
              opacity,
              8,
              Math.min(delta, 0.05),
            );
      }
    });
    pulses.current.instanceMatrix.needsUpdate = true;
    if (pulses.current.instanceColor)
      pulses.current.instanceColor.needsUpdate = true;
  });
  return (
    <group name="neural-connections">
      {edges.map((edge, i) => (
        <CurveLine
          key={i}
          ref={(el) => {
            lineRefs.current[i] = el;
          }}
          curve={edge.curve}
          color={idleColor}
          opacity={0.14}
        />
      ))}
      <instancedMesh
        ref={pulses}
        args={[null, null, edges.length]}
        frustumCulled={false}
        raycast={() => null}
      >
        <sphereGeometry args={[1, 8, 6]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

export default function NeuralSkills({
  timeRef,
  category,
  selected,
  onSelect,
  journey,
  isLight,
  pulse = 0,
  reset = 0,
}) {
  const [hovered, setHovered] = useState(-1);
  const signal = useRef(-10);
  const { size } = useThree();
  const compact = size.width < 1000 || size.height < 600;
  const assembly = useExhibitRotation(
    "skills",
    journey,
    `${reset}:${category}`,
    [0.4, 0.85],
    timeRef,
  );
  const group = skillGroups[category];
  const accent = isLight ? "#287280" : group.accent;
  const nodes = useMemo(() => {
    const counts = Array.from(
      { length: 4 },
      (_, layer) =>
        Math.floor(group.items.length / 4) +
        (layer < group.items.length % 4 ? 1 : 0),
    );
    let index = 0;
    return counts.flatMap((count, layer) =>
      Array.from({ length: count }, (_, row) => {
        const y = ((count - 1) / 2 - row) * 1.62;
        return {
          index: index++,
          row, count,
          layer,
          position: [
            (layer - 1.5) * 2.08 + Math.sin(row * 2.4 + layer) * 0.25,
            y + Math.sin(layer * 1.5 + row * 0.65) * 0.38,
            Math.cos(layer * 1.4) * 0.65 + Math.cos(row * 1.8) * 0.45,
          ],
        };
      }),
    );
  }, [group]);
  useEffect(() => {
    signal.current = timeRef.current;
  }, [selected, category, pulse, timeRef]);
  useEffect(
    () => () => {
      document.body.style.cursor = "";
    },
    [],
  );
  return (
    <FittedWorld id="skills" index={1} journey={journey}>
      {!compact && (
        <WorldLabel
          text={`${group.title} · ${group.items.length} connected tools`}
          color={isLight ? "#3b6577" : "#acccda"}
          position={[0, 3.75, 0]}
          width={7}
          size={49}
        />
      )}
      <group ref={assembly} name="skills-neural-network">
        <StellarCloud timeRef={timeRef} isLight={isLight} seed={431 + category * 13} color={group.accent} />
        <group scale={compact ? 1.28 : 1} rotation={[0.08, -0.16, -0.025]}>
          <Synapses
            nodes={nodes}
            focus={hovered < 0 ? selected : hovered}
            selected={selected}
            timeRef={timeRef}
            signal={signal}
            accent={accent}
            isLight={isLight}
            journey={journey}
          />
          {nodes.map((node) => (
            <Neuron
              key={group.items[node.index].label}
              item={group.items[node.index]}
              index={node.index}
              position={node.position}
              selected={selected === node.index}
              hovered={hovered === node.index}
              onHover={setHovered}
              onSelect={onSelect}
              journey={journey}
              timeRef={timeRef}
              signal={signal}
              isLight={isLight}
              compact={compact}
            />
          ))}
        </group>
      </group>
      {!compact && (
        <WorldLabel
          text="Drag to rotate · Select a neuron to follow its connections"
          color={isLight ? "#526d80" : "#91afc0"}
          position={[0, -3.85, 0]}
          width={7.2}
          size={30}
        />
      )}
      <pointLight
        color="#d4eeff"
        intensity={isLight ? 36 : 55}
        position={[-3, 4, 4]}
        distance={15}
      />
      <pointLight
        color={group.accent}
        intensity={isLight ? 22 : 36}
        position={[4, -1, 3]}
        distance={14}
      />
      <pointLight
        color="#b4dce8"
        intensity={40}
        position={[0, 2, -3]}
        distance={14}
      />
    </FittedWorld>
  );
}
