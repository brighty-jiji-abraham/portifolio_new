/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Panel, Paper, Ink, Dot, Check, Route, Surface } from "./primitives";
import { useExhibitClock, smooth, mix } from "./exhibitMotion";

export function Conversation({ color, isLight, timeRef }) {
  const clock = useExhibitClock(timeRef, 12);
  const packet = useRef(), dots = useRef(), reply = useRef(), channels = useRef();
  useFrame(() => {
    const t = clock.current % 4, channel = Math.floor(clock.current / 4);
    const p = t < 1.5 ? smooth(t, 0, 1.5) : smooth(t, 2.1, 3.7);
    packet.current.position.set(t < 1.5 ? mix(-1.65, 0, p) : mix(0, 1.6, p), t < 1.5 ? (1 - channel) * 0.95 * (1 - p) : 0, 0.25);
    packet.current.scale.setScalar(t > 1.5 && t < 2.1 ? 0.4 : 1);
    dots.current.children.forEach((dot, i) => { dot.position.y = Math.sin(t * 6 - i) * 0.07; });
    channels.current.children.forEach((node, i) => { node.scale.setScalar(i === channel ? 1.08 : 0.92); });
    reply.current.children.forEach((line, i) => { line.scale.x = 0.2 + 0.8 * smooth(t, 2.2 + i * 0.25, 2.7 + i * 0.25); });
  });
  return <group rotation={[0.05, -0.12, 0]}>
    {[1, 0, -1].map(y => <Route key={y} color={color} points={[[-1.65, y * 0.95, 0], [0, 0, 0], [1.6, 0, 0]]} />)}
    <group ref={channels}>{[1, 0, -1].map((y, i) => <group key={y} position={[-1.65, y * 0.95, 0]}>
      <Panel width={0.9} height={0.55} isLight={isLight}><Ink color={color} width={0.52} position={[0, 0.07, 0.09]} /><Ink color={color} width={0.3 + i * 0.05} position={[-0.1, -0.1, 0.09]} /></Panel>
    </group>)}</group>
    <Panel width={1.05} height={1.05} color={color}><group ref={dots} position={[0, 0, 0.13]}>{[-1, 0, 1].map(x => <Dot key={x} position={[x * 0.22, 0, 0]} color={isLight ? "#16394c" : "#fff0dc"} />)}</group></Panel>
    <Panel width={1.3} height={1.1} position={[1.6, 0, 0]} isLight={isLight}>
      <group ref={reply}>{[0, 1, 2].map(i => <Ink key={i} width={0.85 - i * 0.12} color={color} position={[-i * 0.06, 0.26 - i * 0.24, 0.09]} />)}</group>
    </Panel><Dot ref={packet} color={color} radius={0.085} />
  </group>;
}

export function Retriever({ color, isLight, timeRef }) {
  const clock = useExhibitClock(timeRef, 10);
  const sources = useRef(), results = useRef(), packet = useRef(), search = useRef();
  useFrame(() => {
    const t = clock.current, selected = t < 5 ? 0 : 2, phase = t % 5;
    sources.current.children.forEach((paper, i) => { paper.position.z = i === selected ? smooth(phase, 0, 1) * 0.35 : 0; });
    search.current.rotation.z = t * 0.7;
    const p = smooth(phase, 0.4, 2);
    if (phase < 2) packet.current.position.set(mix(-1.65, 0, p), (0.95 - selected * 0.95) * (1 - p), 0.35);
    else packet.current.position.set(mix(0, 1.55, smooth(phase, 2, 3)), 0.3 * smooth(phase, 2, 3), 0.35);
    results.current.children.forEach((paper, i) => {
      const reveal = smooth(phase, 2.4 + i * 0.35, 3.2 + i * 0.35);
      paper.position.x = 1.35 + i * 0.25 * reveal; paper.position.y = -0.2 + i * 0.4 * reveal;
      paper.rotation.z = (i - 1) * -0.12 * reveal;
    });
  });
  return <group rotation={[0.08, -0.12, 0]}>
    <group ref={sources}>{[0, 1, 2].map(i => <Paper key={i} color={color} isLight={isLight} scale={0.6} position={[-1.65, 0.95 - i * 0.95, 0]} />)}</group>
    <Route color={color} points={[[-1.65, 0.95, 0], [0, 0, 0], [-1.65, -0.95, 0]]} /><Route color={color} points={[[0, 0, 0], [1.65, 0.3, 0]]} />
    <group ref={search}><mesh><torusGeometry args={[0.52, 0.07, 12, 48]} /><Surface color={color} /></mesh><Ink color={color} width={0.4} height={0.07} position={[0.5, -0.5, 0]} rotation={[0, 0, -0.8]} /></group>
    <group ref={results}>{[0, 1, 2].map(i => <Paper key={i} color={color} isLight={isLight} scale={0.72} position={[1.35, -0.2, (2 - i) * 0.18]} />)}</group>
    <Dot ref={packet} color={color} radius={0.08} />
  </group>;
}

export function DataQuery({ color, isLight, timeRef }) {
  const clock = useExhibitClock(timeRef, 9);
  const rows = useRef(), packet = useRef(), disks = useRef();
  useFrame(() => {
    const t = clock.current, input = smooth(t, 0.5, 2.4), output = smooth(t, 3, 5);
    packet.current.position.set(t < 3 ? mix(-1.8, 0, input) : mix(0, 1.65, output), t < 3 ? 0.45 * (1 - input) : 0, 0.4);
    disks.current.children.forEach((disk, i) => { disk.scale.x = disk.scale.z = 1 + Math.sin(t * 2 - i) * 0.04; });
    rows.current.children.forEach((row, i) => { row.scale.x = 0.18 + smooth(t, 4 + i * 0.5, 5.1 + i * 0.5) * 0.82; });
  });
  return <group rotation={[0.12, -0.16, 0]}>
    <Paper color={color} isLight={isLight} position={[-1.8, 0.45, 0]} scale={0.72} />
    <Route color={color} points={[[-1.8, 0.45, 0], [0, 0, 0], [1.65, 0, 0]]} />
    <group ref={disks}>{[-0.55, 0, 0.55].map(y => <mesh key={y} position={[0, y, 0]}><cylinderGeometry args={[0.52, 0.52, 0.38, 48]} /><Surface color={color} isLight={isLight} /></mesh>)}</group>
    <Panel width={1.35} height={1.8} isLight={isLight} position={[1.65, 0, 0]}>
      <Ink color={color} width={1.05} height={0.1} position={[0, 0.62, 0.1]} />
      <group ref={rows}>{[0, 1, 2, 3].map(i => <group key={i} position={[0, 0.28 - i * 0.28, 0.1]}>{[-0.35, 0.12, 0.4].map((x, col) => <Ink key={x} color={col === 0 ? color : isLight ? "#415c70" : "#afc7d3"} width={col === 0 ? 0.35 : 0.16} position={[x, 0, 0]} />)}</group>)}</group>
    </Panel><Dot ref={packet} color={color} radius={0.085} />
  </group>;
}

export function Gateway({ color, isLight, timeRef }) {
  const clock = useExhibitClock(timeRef, 12);
  const packet = useRef(), gates = useRef(), lights = useRef();
  useFrame(() => {
    const lane = Math.floor(clock.current / 4), t = clock.current % 4, progress = smooth(t, 0.3, 3.4);
    const returning = progress > 0.6, p = returning ? (1 - progress) / 0.4 : progress / 0.6;
    packet.current.position.set(mix(-2, 1.85, p), Math.max(0, (p - 0.5) * 2) * (1 - lane), 0.26);
    gates.current.children.forEach((gate, i) => { gate.position.x = (i ? 1 : -1) * (0.3 + Math.sin(p * Math.PI) ** 4 * 0.16); });
    lights.current.children.forEach((light, i) => { light.scale.setScalar(i === lane ? 1.5 : 0.65); });
  });
  return <group rotation={[0.08, -0.2, 0]}>
    <mesh position={[-2, 0, 0]}><icosahedronGeometry args={[0.32, 1]} /><Surface color={color} /></mesh>
    {[1, 0, -1].map(y => <Route key={y} color={color} points={[[-2, 0, 0], [0, 0, 0], [1.85, y, 0]]} />)}
    <group ref={gates}>{[-1, 1].map(x => <Panel key={x} width={0.27} height={2.25} position={[x * 0.3, 0, 0]} color={color} />)}</group>
    <Ink color={color} width={1.1} height={0.12} position={[0, 1.13, 0]} />
    {[1, 0, -1].map(y => <Panel key={y} width={0.95} height={0.65} position={[1.85, y, 0]} isLight={isLight}><Ink color={color} width={0.47} position={[-0.07, 0.12, 0.1]} /><Ink color={color} width={0.35} position={[-0.13, -0.08, 0.1]} /></Panel>)}
    <group ref={lights}>{[1, 0, -1].map(y => <Dot key={y} color="#8edccb" position={[2.15, y - 0.13, 0.11]} />)}</group><Dot ref={packet} color={color} radius={0.09} />
  </group>;
}

export function Workflow({ color, isLight, timeRef }) {
  const clock = useExhibitClock(timeRef, 11);
  const tasks = useRef(), checks = useRef(), packet = useRef();
  const points = [[-1.65, 0.55, 0], [-0.55, -0.35, 0], [0.55, 0.55, 0], [1.65, -0.35, 0]];
  useFrame(() => {
    const t = clock.current, step = Math.min(3, Math.floor(t / 2.3));
    tasks.current.children.forEach((task, i) => { task.position.z = i === step ? Math.sin((t % 2.3) / 2.3 * Math.PI) * 0.28 : 0; });
    checks.current.children.forEach((check, i) => { check.scale.setScalar(0.1 + smooth(t, i * 2.3 + 1.2, i * 2.3 + 2) * 0.9); });
    const edge = Math.min(2, step), p = smooth(t, edge * 2.3 + 1.5, edge * 2.3 + 2.3);
    packet.current.position.set(mix(points[edge][0], points[edge + 1][0], p), mix(points[edge][1], points[edge + 1][1], p), 0.18);
  });
  return <group rotation={[0.04, -0.12, 0]}>
    <Route color={color} points={points} />
    <group ref={tasks}>{points.map((point, i) => <group key={i} position={point}><Panel width={0.86} height={1.08} isLight={isLight}>{[0, 1, 2].map(row => <Ink key={row} width={0.57 - row * 0.1} position={[-row * 0.05, 0.24 - row * 0.18, 0.1]} color={color} />)}</Panel></group>)}</group>
    <group ref={checks}>{points.map((p, i) => <Check key={i} color="#8edccb" position={[p[0], p[1] - 0.72, 0.1]} />)}</group>
    <Dot ref={packet} color={color} radius={0.065} />
  </group>;
}

export function Tenants({ color, isLight, timeRef }) {
  const clock = useExhibitClock(timeRef, 8);
  const packets = useRef(), lamps = useRef();
  const colors = [color, "#8edccb", "#c5afe6"];
  useFrame(() => {
    packets.current.children.forEach((packet, i) => { packet.position.y = 1.45 - ((clock.current * 0.28 + i / 3) % 1) * 2.9; });
    lamps.current.children.forEach((lamp, i) => { const y = packets.current.children[Math.floor(i / 3)].position.y; lamp.scale.setScalar(0.75 + Math.exp(-Math.abs(y - (0.72 - i % 3 * 0.72)) * 5) * 0.85); });
  });
  return <group rotation={[0.13, -0.26, 0]}>
    {colors.map((lane, i) => <group key={lane} position={[(i - 1) * 1.45, 0, 0]}>
      <Route color={lane} points={[[0, 1.5, 0.25], [0, -1.5, 0.25]]} opacity={0.5} />
      {[0.72, 0, -0.72].map(y => <Panel key={y} width={1.08} height={0.48} position={[0, y, 0]} isLight={isLight}><Ink color={lane} width={0.6} position={[-0.07, 0, 0.09]} /></Panel>)}
      <mesh position={[0, 1.52, 0]} scale={[1, 0.32, 0.5]}><sphereGeometry args={[0.48, 24, 16]} /><Surface color={lane} /></mesh>
    </group>)}
    <group ref={lamps}>{Array.from({ length: 9 }, (_, i) => <Dot key={i} color={colors[Math.floor(i / 3)]} position={[(Math.floor(i / 3) - 1) * 1.45 + 0.4, 0.72 - i % 3 * 0.72, 0.1]} radius={0.04} />)}</group>
    <group ref={packets}>{colors.map((lane, i) => <Dot key={lane} color={lane} position={[(i - 1) * 1.45, 1.45, 0.25]} radius={0.08} />)}</group>
  </group>;
}

export function Workout({ color, isLight, timeRef }) {
  const clock = useExhibitClock(timeRef, 12);
  const weight = useRef(), routines = useRef(), marker = useRef();
  useFrame(() => {
    const t = clock.current, selected = Math.floor(t / 4), rep = (t % 4) / 4;
    weight.current.position.y = 0.45 + (1 - Math.cos(rep * Math.PI * 4)) * 0.24;
    weight.current.rotation.z = Math.sin(rep * Math.PI * 2) * 0.1;
    routines.current.children.forEach((routine, i) => { routine.position.z = i === selected ? 0.25 : 0; routine.scale.setScalar(i === selected ? 1.08 : 0.9); });
    marker.current.position.set(mix(-1.6, (selected - 1) * 0.9 + 0.45, smooth(rep, 0, 0.5)), mix(0, -1.05, smooth(rep, 0.2, 0.7)), 0.3);
  });
  return <group rotation={[0.12, -0.2, 0]}>
    {[-0.6, 0.65].map(y => <Paper key={y} color={color} isLight={isLight} position={[-1.65, y, 0]} scale={0.6} lines={3} />)}
    <Route color={color} points={[[-1.6, 0.65, 0], [-0.6, 0, 0], [-1.6, -0.6, 0]]} />
    <group ref={weight} position={[0.65, 0.45, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.07, 0.07, 1.9, 20]} /><Surface isLight={isLight} /></mesh>
      {[-0.78, -0.58, 0.58, 0.78].map(x => <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.38, 0.38, 0.16, 32]} /><Surface color={color} /></mesh>)}
    </group>
    <group ref={routines}>{[0, 1, 2].map(i => <group key={i} position={[(i - 1) * 0.9 + 0.45, -1.05, 0]}><Panel width={0.75} height={0.65} isLight={isLight}>{[0, 1, 2].map(j => <Ink key={j} color={color} width={0.12} height={0.15 + ((i + j) % 3) * 0.1} position={[(j - 1) * 0.19, 0, 0.1]} />)}</Panel></group>)}</group><Dot ref={marker} color={color} />
  </group>;
}
