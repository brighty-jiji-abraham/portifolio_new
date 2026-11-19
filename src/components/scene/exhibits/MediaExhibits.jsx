/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { Panel, Paper, Ink, Dot, Check, Route, Surface } from "./primitives";
import { useExhibitClock, smooth, mix } from "./exhibitMotion";

function Optic({ color, isLight, irisRef, ...props }) {
  const blade = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0.44, 0); shape.bezierCurveTo(1.15, 0.02, 1.1, 0.6, 0.44, 1);
    shape.lineTo(-0.05, 0.56); shape.quadraticCurveTo(0.25, 0.25, 0.44, 0);
    return shape;
  }, []);
  return <group {...props}>
    <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[1.35, 1.35, 0.34, 64, 1, true]} /><Surface isLight={isLight} /></mesh>
    <mesh position={[0, 0, 0.18]}><ringGeometry args={[1.08, 1.35, 64]} /><Surface isLight={isLight} /></mesh>
    {[1.1, 1.34].map(r => <mesh key={r} position={[0, 0, 0.21]}><torusGeometry args={[r, 0.025, 8, 64]} /><Surface color={color} /></mesh>)}
    {Array.from({ length: 32 }, (_, i) => { const a = i / 32 * Math.PI * 2; return <Ink key={i} color={isLight ? "#c0ced5" : "#718c9b"} width={0.012} height={i % 4 ? 0.04 : 0.08} position={[Math.cos(a) * 1.22, Math.sin(a) * 1.22, 0.2]} rotation={[0, 0, a - Math.PI / 2]} />; })}
    <mesh position={[0, 0, -0.04]}><circleGeometry args={[1.1, 64]} /><meshPhysicalMaterial color="#061723" metalness={0.6} roughness={0.12} clearcoat={1} /></mesh>
    <group ref={irisRef}>{Array.from({ length: 8 }, (_, i) => <mesh key={i} position={[0, 0, 0.07 + i * 0.008]} rotation={[0, 0, i / 8 * Math.PI * 2]}><shapeGeometry args={[blade]} /><meshStandardMaterial color={isLight ? "#647b87" : "#39505e"} metalness={0.7} roughness={0.38} side={THREE.DoubleSide} /></mesh>)}</group>
  </group>;
}

function Reticle({ color, ...props }) {
  return <group {...props}>{[-1, 1].flatMap(x => [-1, 1].map(y => <Line key={`${x}${y}`} points={[[x * 0.3, y * 0.17, 0], [x * 0.3, y * 0.3, 0], [x * 0.17, y * 0.3, 0]]} color={color} lineWidth={1.6} />))}</group>;
}

export function Publisher({ color, isLight, timeRef }) {
  const clock = useExhibitClock(timeRef, 11);
  const lines = useRef(), cursor = useRef(), stamp = useRef(), illustration = useRef(), source = useRef();
  useFrame(() => {
    const t = clock.current;
    source.current.position.x = -1.65 + Math.sin(smooth(t, 0, 2) * Math.PI) * 0.3;
    lines.current.children.forEach((line, i) => { const p = 0.12 + smooth(t, 1.5 + i * 0.65, 2.5 + i * 0.65) * 0.88; line.scale.x = p; line.position.x = 0.45 - (1 - p) * (1.5 - (i % 2) * 0.25) / 2; });
    const row = Math.min(4, Math.floor(Math.max(0, t - 1.5) / 0.65));
    cursor.current.position.set(-0.3 + ((t * 1.3) % 1) * 1.5, -0.02 - row * 0.22, 0.18);
    cursor.current.visible = t < 6.2;
    illustration.current.scale.y = 0.2 + smooth(t, 0.4, 2) * 0.8;
    stamp.current.scale.setScalar(0.45 + smooth(t, 6.5, 7.8) * 0.55);
    stamp.current.rotation.z = (1 - smooth(t, 6.5, 7.8)) * -0.35;
  });
  return <group rotation={[0.06, -0.17, 0]}>
    <group ref={source} position={[-1.65, 0.35, 0]}><Paper color={color} isLight={isLight} scale={0.75} rotation={[0, 0, 0.1]} /><Paper color={color} isLight={isLight} scale={0.65} position={[0.12, -0.65, -0.18]} rotation={[0, 0, -0.1]} /></group>
    <Panel width={2.2} height={2.75} isLight={isLight} position={[0.45, 0, 0]} />
    <Ink color={color} width={1.6} height={0.1} position={[0.45, 1.08, 0.11]} />
    <group ref={illustration} position={[0.45, 0.55, 0.1]}><Panel width={1.65} height={0.6} color={color} /><mesh position={[-0.25, -0.02, 0.1]}><coneGeometry args={[0.25, 0.4, 3]} /><Surface color={isLight ? "#7d9baa" : "#426978"} /></mesh><Dot color="#f1dfba" radius={0.07} position={[0.5, 0.14, 0.12]} /></group>
    <group ref={lines}>{[0, 1, 2, 3, 4].map(i => <Ink key={i} color={isLight ? "#3b586e" : "#b9ced7"} width={1.5 - (i % 2) * 0.25} position={[0.45, -0.02 - i * 0.22, 0.1]} />)}</group>
    <Ink ref={cursor} color={color} width={0.035} height={0.17} />
    <group ref={stamp} position={[1.55, -0.95, 0.28]}><mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.38, 0.38, 0.13, 40]} /><Surface color={color} /></mesh><Check color={isLight ? "#16394c" : "#fff0dc"} position={[0, 0, 0.08]} /></group>
  </group>;
}

export function SkinScan({ color, isLight, timeRef }) {
  const clock = useExhibitClock(timeRef, 8);
  const scan = useRef(), reticle = useRef(), iris = useRef(), readings = useRef();
  useFrame(() => {
    const t = clock.current;
    scan.current.position.y = Math.sin(t / 8 * Math.PI * 2) * 0.95;
    iris.current.rotation.z = Math.sin(t * 0.6) * 0.12;
    reticle.current.position.x = -0.35 + Math.sin(t * 0.65) * 0.22;
    reticle.current.position.y = Math.cos(t * 0.65) * 0.2;
    reticle.current.scale.setScalar(0.65 + (1 - smooth(t, 1, 4)) * 0.3);
    readings.current.children.forEach((bar, i) => { bar.scale.x = 0.25 + smooth(t, 2 + i * 0.5, 4.5 + i * 0.5) * (0.7 - i * 0.15); });
  });
  return <group rotation={[0.1, -0.18, 0]}>
    <Optic color={color} isLight={isLight} irisRef={iris} position={[-0.35, 0, 0]} />
    {Array.from({ length: 13 }, (_, i) => { const a = i * 2.4, r = Math.sqrt(i / 13) * 0.69; return <mesh key={i} position={[-0.35 + Math.cos(a) * r, Math.sin(a) * r, 0.28]} scale={[1, 0.8, 0.22]}><sphereGeometry args={[0.18, 16, 12]} /><Surface color={i % 3 ? "#a58d85" : color} /></mesh>; })}
    <Ink ref={scan} color={color} width={1.9} height={0.018} position={[-0.35, 0, 0.48]} />
    <Reticle ref={reticle} color="#e5f4e9" position={[-0.35, 0.2, 0.5]} />
    <group ref={readings} position={[1.65, 0, 0]}>{[0, 1, 2].map(i => <Ink key={i} color={color} width={0.85} height={0.13} position={[0, 0.45 - i * 0.42, 0.1]} />)}</group>
    <Route color={color} points={[[0.9, 0, 0], [1.15, 0, 0], [1.15, 0.5, 0]]} />
  </group>;
}

export function VisualAssistant({ color, isLight, timeRef }) {
  const clock = useExhibitClock(timeRef, 12);
  const eye = useRef(), iris = useRef(), reticle = useRef(), waves = useRef();
  useFrame(() => {
    const t = clock.current, target = Math.floor(t / 4), p = t % 4;
    eye.current.rotation.y = Math.sin(t * 0.4) * 0.12;
    iris.current.rotation.z = Math.sin(p * 1.2) * 0.12;
    reticle.current.position.y = 0.95 - target * 0.95;
    reticle.current.scale.setScalar(0.85 + (1 - smooth(p, 0.2, 1.8)) * 0.2);
    waves.current.children.forEach((wave, i) => { wave.scale.setScalar(0.9 + Math.sin(p * 3 - i * 0.8) * 0.1); wave.material.opacity = 0.25 + smooth(p, 1.6 + i * 0.2, 2.2 + i * 0.2) * 0.55; });
  });
  return <group rotation={[0.08, -0.15, 0]}>
    <group ref={eye} position={[-0.65, 0.2, 0]} scale={0.83}><Optic color={color} isLight={isLight} irisRef={iris} /></group>
    {[0, 1, 2].map(i => <group key={i} position={[1.35, 0.95 - i * 0.95, 0.05]}><mesh>{i === 0 ? <sphereGeometry args={[0.23, 24, 16]} /> : i === 1 ? <boxGeometry args={[0.39, 0.39, 0.39]} /> : <coneGeometry args={[0.26, 0.46, 4]} />}<Surface color={color} /></mesh><Route color={color} points={[[-0.35, 0, 0], [-0.75, 0, -0.1]]} /></group>)}
    <Reticle ref={reticle} color={color} position={[1.35, 0.95, 0.4]} />
    <group ref={waves} position={[-0.65, -1.2, 0]} rotation={[0, 0, -Math.PI * 0.25]}>{[0, 1, 2].map(i => <mesh key={i}><torusGeometry args={[0.22 + i * 0.17, 0.02, 6, 32, Math.PI * 0.5]} /><meshBasicMaterial color={color} transparent opacity={0.5} /></mesh>)}</group>
  </group>;
}

const IMAGE_SAMPLES = [
  ["00000000", "00111100", "01100110", "11111111", "11000011", "01100110", "00000000", "00000000"],
  ["01000100", "01101100", "01111100", "01010100", "00111000", "00111000", "01111100", "00000000"],
  ["00010000", "00011000", "00011100", "00010000", "11111111", "01111110", "00111100", "00000000"],
];

export function Classifier({ color, isLight, timeRef }) {
  const clock = useExhibitClock(timeRef, 12);
  const iris = useRef(), pixels = useRef(), scan = useRef(), classes = useRef();
  useFrame(() => {
    const selected = Math.floor(clock.current / 4), t = clock.current % 4;
    pixels.current.children.forEach((pixel, i) => { pixel.visible = IMAGE_SAMPLES[selected][Math.floor(i / 8)][i % 8] === "1"; pixel.scale.z = 0.7 + smooth(t, 0.5, 2) * 0.3; });
    iris.current.rotation.z = Math.sin(t * 0.8) * 0.18;
    scan.current.position.y = mix(0.72, -0.72, smooth(t, 0, 2.4));
    classes.current.children.forEach((tile, i) => { tile.position.z = i === selected ? smooth(t, 1.8, 2.8) * 0.4 : 0; tile.scale.setScalar(i === selected ? 1.08 : 0.85); });
  });
  return <group rotation={[0.1, -0.16, 0]}>
    <Optic color={color} isLight={isLight} irisRef={iris} position={[-0.5, 0, 0]} />
    <group ref={pixels}>{Array.from({ length: 64 }, (_, i) => <mesh key={i} position={[-0.5 + ((i % 8) - 3.5) * 0.13, (3.5 - Math.floor(i / 8)) * 0.13, 0.34]} visible={IMAGE_SAMPLES[0][Math.floor(i / 8)][i % 8] === "1"}><boxGeometry args={[0.115, 0.115, 0.09]} /><Surface color={color} /></mesh>)}</group>
    <Ink ref={scan} color="#e5edf2" width={1.45} height={0.018} position={[-0.5, 0.72, 0.47]} />
    <group ref={classes}>{[0, 1, 2].map(i => <group key={i} position={[1.5, 0.9 - i * 0.9, 0]}><Panel width={0.85} height={0.64} isLight={isLight}><mesh position={[-0.15, 0, 0.15]}>{i === 0 ? <boxGeometry args={[0.28, 0.15, 0.1]} /> : i === 1 ? <sphereGeometry args={[0.13, 16, 12]} /> : <coneGeometry args={[0.16, 0.27, 3]} />}<Surface color={color} /></mesh><Check color={color} scale={0.55} position={[0.23, 0, 0.13]} /></Panel></group>)}</group>
  </group>;
}

export function SpeechEmotion({ color, isLight, timeRef }) {
  const clock = useExhibitClock(timeRef, 12);
  const bars = useRef(), faces = useRef(), signal = useRef();
  const colors = ["#8edccb", color, "#e5ba89"];
  useFrame(() => {
    const t = clock.current, emotion = Math.floor(t / 4), p = t % 4;
    bars.current.children.forEach((bar, i) => { const envelope = Math.sin(i / 28 * Math.PI); bar.scale.y = 0.15 + envelope * (0.4 + Math.sin(i * (0.7 + emotion * 0.25) - p * 3) ** 2 * (0.5 + emotion * 0.18)); });
    faces.current.children.forEach((face, i) => { face.scale.setScalar(i === emotion ? 1.1 : 0.75); face.position.z = i === emotion ? smooth(p, 1.6, 2.7) * 0.24 : 0; });
    signal.current.position.set(mix(0, (emotion - 1) * 1.15, smooth(p, 1, 2.5)), mix(0.2, -1.15, smooth(p, 1, 2.5)), 0.25);
  });
  return <group rotation={[0.07, -0.16, 0]}>
    <group ref={bars} position={[0, 0.4, 0]}>{Array.from({ length: 29 }, (_, i) => <mesh key={i} position={[(i - 14) * 0.145, 0, 0]}><capsuleGeometry args={[0.04, 1.25, 3, 8]} /><Surface color={i % 4 ? color : undefined} isLight={isLight} /></mesh>)}</group>
    <group ref={faces}>{[-1, 0, 1].map((x, i) => <group key={i} position={[x * 1.15, -1.15, 0]}><mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.33, 0.33, 0.12, 40]} /><Surface color={colors[i]} /></mesh><group position={[0, 0, 0.07]}>{[-0.11, 0.11].map(eye => <Dot key={eye} color="#203b4b" radius={0.026} position={[eye, 0.08, 0]} />)}<Line points={Array.from({ length: 13 }, (_, j) => { const x = (j / 12 - 0.5) * 0.26; return [x, -0.08 + (i - 1) * (0.05 - x * x * 3), 0]; })} color="#203b4b" lineWidth={1.5} /></group></group>)}</group>
    <Dot ref={signal} color={color} radius={0.055} />
  </group>;
}

export function Sentiment({ color, isLight, timeRef }) {
  const clock = useExhibitClock(timeRef, 12);
  const scan = useRef(), bars = useRef(), token = useRef();
  const colors = ["#8edccb", "#a4c7da", "#d7a888"];
  useFrame(() => {
    const t = clock.current % 4, category = Math.floor(clock.current / 4);
    scan.current.position.y = 0.75 - Math.min(4, Math.floor(t / 0.55)) * 0.32;
    scan.current.scale.x = 0.25 + (t % 0.55) / 0.55 * 0.75;
    bars.current.children.forEach((bar, i) => { bar.scale.x = 0.18 + smooth(t, 1.4, 3) * (i === category ? 0.82 : 0.12); });
    const p = smooth(t, 2.1, 3.6); token.current.position.set(mix(-0.55, 1.65, p), mix(-0.5, 0.55 - category * 0.55, p), 0.25);
  });
  return <group rotation={[0.08, -0.17, 0]}>
    <Panel width={2.3} height={2.6} position={[-0.6, 0, 0]} isLight={isLight} />
    {[0, 1, 2, 3, 4].map(row => <group key={row} position={[-0.6, 0.75 - row * 0.32, 0.1]}>{[0, 1, 2].map(word => <Ink key={word} color={word === row % 3 ? color : isLight ? "#405e73" : "#adc7d4"} width={0.38 + ((word + row) % 2) * 0.16} height={0.07} position={[(word - 1) * 0.61, 0, 0]} />)}</group>)}
    <Ink ref={scan} color={color} width={1.9} height={0.025} position={[-0.6, 0.75, 0.15]} />
    <group ref={bars}>{colors.map((c, i) => <Ink key={c} color={c} width={1} height={0.18} position={[1.6, 0.55 - i * 0.55, 0.08]} />)}</group>
    <Route color={color} points={[[0.65, 0, 0], [0.9, 0, 0], [0.9, -0.6, 0]]} />
    <Dot ref={token} color={color} radius={0.08} />
  </group>;
}
