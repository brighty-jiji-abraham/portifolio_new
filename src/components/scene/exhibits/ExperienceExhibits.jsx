/* eslint-disable react/no-unknown-property */
import { Suspense, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import PlanetEarth from "../PlanetEarth";
import { Panel, Paper, Ink, Dot, Check, Route, Surface, NumberFace } from "./primitives";
import { useExhibitClock, smooth, mix } from "./exhibitMotion";

export function Ballot({ color, isLight, timeRef }) {
  const clock = useExhibitClock(timeRef, 9);
  const ballot = useRef(), tally = useRef(), accepted = useRef();
  useFrame(() => {
    const t = clock.current;
    ballot.current.position.y = mix(1.35, -0.63, smooth(t, 0.7, 3.2));
    ballot.current.rotation.z = (1 - smooth(t, 0.7, 2.3)) * -0.12;
    tally.current.children.forEach((bar, i) => { const height = 0.18 + smooth(t, 3.2 + i * 0.3, 5.2 + i * 0.3) * [1.35, 0.65, 0.95][i]; bar.scale.y = height; bar.position.y = -1.1 + height / 2; });
    accepted.current.scale.setScalar(0.5 + smooth(t, 3.1, 4.1) * 0.5);
  });
  return <group rotation={[0.12, -0.2, 0]}>
    <RoundedBox args={[1.9, 1.15, 1.05]} radius={0.06} position={[-0.65, -0.6, 0]}><Surface isLight={isLight} /></RoundedBox>
    <Ink color="#07141e" width={1.2} height={0.11} rotation={[-Math.PI / 2, 0, 0]} position={[-0.65, -0.015, 0]} />
    <group ref={ballot} position={[-0.65, 1.35, 0]}><Paper color={color} isLight={isLight} scale={0.72} lines={2} /><Check color={color} position={[0, -0.27, 0.1]} /></group>
    <Check ref={accepted} color={color} position={[-0.65, -0.6, 0.55]} scale={1.4} />
    <group ref={tally}>{[0, 1, 2].map(i => <mesh key={i} position={[0.9 + i * 0.5, -1, 0]}><boxGeometry args={[0.3, 1, 0.35]} /><Surface color={i === 0 ? color : undefined} isLight={isLight} /></mesh>)}</group>
    <Ink width={1.6} color={color} height={0.03} position={[1.4, -1.15, 0.2]} />
  </group>;
}

export function Commerce({ color, isLight, timeRef }) {
  const clock = useExhibitClock(timeRef, 12);
  const product = useRef(), receipt = useRef(), wheels = useRef();
  useFrame(() => {
    const t = clock.current % 4, selected = Math.floor(clock.current / 4);
    product.current.position.y = mix(1.35, -0.4, smooth(t, 0.6, 2.5));
    product.current.rotation.y = (1 - smooth(t, 0.3, 2.5)) * Math.PI * 0.45;
    product.current.children.forEach((item, i) => { item.visible = i === selected; });
    receipt.current.position.y = -0.25 + smooth(t, 2.2, 3.5) * 0.8;
    wheels.current.children.forEach(wheel => { wheel.rotation.z = t * 0.6; });
  });
  const basket = [[-1.35, 0, 0.35], [0.45, 0, 0.35], [0.2, -0.8, 0.35], [-1.1, -0.8, 0.35], [-1.35, 0, 0.35]];
  return <group rotation={[0.12, -0.22, 0]}>
    <Route color={color} points={basket} opacity={0.9} lineWidth={3} />
    <Route color={color} points={basket.map(([x, y]) => [x, y, -0.35])} opacity={0.7} lineWidth={2} />
    {[-1.15, -0.8, -0.45, -0.1, 0.25].map(x => <Route key={x} color={color} points={[[x, 0, 0.35], [x * 0.75 - 0.1, -0.8, 0.35], [x * 0.75 - 0.1, -0.8, -0.35], [x, 0, -0.35]]} opacity={0.6} />)}
    <Route color={color} points={[[-1.35, 0, 0.35], [-1.55, 0.42, 0.35], [-1.9, 0.42, 0.35]]} opacity={1} lineWidth={3} />
    <group ref={wheels}>{[-1, 0.1].map(x => <mesh key={x} position={[x, -1.05, 0.35]}><torusGeometry args={[0.15, 0.05, 10, 32]} /><Surface color={color} /></mesh>)}</group>
    <group ref={product} position={[-0.45, 1.35, 0]}>
      <mesh><boxGeometry args={[0.65, 0.65, 0.55]} /><Surface color={color} /></mesh>
      <mesh><sphereGeometry args={[0.35, 32, 24]} /><Surface color="#91bedb" /></mesh>
      <Panel width={0.55} height={0.8} isLight={isLight}><Ink width={0.32} height={0.45} color={color} position={[0, 0.05, 0.09]} /></Panel>
    </group>
    <group ref={receipt} position={[1.4, -0.25, -0.15]}><Paper color={color} isLight={isLight} scale={0.85} lines={3} /><Check color={color} position={[0, -0.7, 0.1]} /></group>
  </group>;
}

export function Events({ color, isLight, timeRef }) {
  const clock = useExhibitClock(timeRef, 12);
  const tickets = useRef(), stubs = useRef(), lights = useRef();
  useFrame(() => {
    const selected = Math.floor(clock.current / 4), t = clock.current % 4;
    tickets.current.children.forEach((ticket, i) => { ticket.position.z = i === selected ? 0.45 : -0.2; ticket.position.y = i === selected ? Math.sin(t / 4 * Math.PI) * 0.2 : -0.12; ticket.rotation.y = (i - 1) * -0.15 * (i === selected ? 0.2 : 1); });
    stubs.current.children.forEach((stub, i) => { stub.rotation.x = i === selected ? smooth(t, 1, 2.5) * 0.65 : 0; });
    lights.current.children.forEach((light, i) => { light.scale.setScalar(0.7 + Math.sin(clock.current * 1.5 - i * 0.4) ** 2 * 0.6); });
  });
  return <group rotation={[0.08, -0.12, 0]}>
    <group ref={tickets}>{[-1, 0, 1].map((x, i) => <group key={i} position={[x * 1.25, 0, 0]}><Panel width={1.06} height={1.95} isLight={isLight}><Ink color={color} width={0.72} height={0.1} position={[0, 0.68, 0.1]} /><NumberFace number={23} isLight={isLight} size={0.7} position={[0, 0.1, 0.1]} /><Ink color={color} width={0.64} position={[0, -0.55, 0.1]} />{[-0.36, -0.18, 0, 0.18, 0.36].map(dot => <Dot key={dot} color={color} radius={0.018} position={[dot, -0.73, 0.09]} />)}</Panel></group>)}</group>
    <group ref={stubs}>{[-1, 0, 1].map(x => <group key={x} position={[x * 1.25, -0.75, 0.2]}><Panel width={1.04} height={0.3} color={color} position={[0, -0.16, 0]} /></group>)}</group>
    <group ref={lights}>{Array.from({ length: 9 }, (_, i) => <Dot key={i} color={color} radius={0.035} position={[(i - 4) * 0.45, 1.45 + Math.cos(i * 0.7) * 0.15, -0.1]} />)}</group>
  </group>;
}

export function PortfolioWorld({ color, timeRef }) {
  const clock = useExhibitClock(timeRef, 18);
  const worlds = useRef(), ship = useRef();
  const orbit = useMemo(() => Array.from({ length: 97 }, (_, i) => { const a = i / 96 * Math.PI * 2; return [Math.cos(a) * 2, Math.sin(a) * 1.2, Math.sin(a) * 0.5]; }), []);
  useFrame(() => {
    worlds.current.children.forEach((world, i) => { const angle = i / 5 * Math.PI * 2 + clock.current * 0.08; world.position.set(Math.cos(angle) * 2, Math.sin(angle) * 1.2, Math.sin(angle) * 0.5); world.rotation.y = clock.current * 0.22; });
    const a = clock.current / 18 * Math.PI * 2; ship.current.position.set(Math.cos(a) * 2, Math.sin(a) * 1.2, Math.sin(a) * 0.5); ship.current.rotation.z = a + Math.PI / 2;
  });
  return <group rotation={[0.16, -0.15, -0.08]}>
    <Suspense fallback={null}><group scale={0.36}><PlanetEarth timeRef={timeRef} /></group></Suspense>
    <Route color={color} points={orbit} opacity={0.4} />
    <group ref={worlds}>{["#91bedb", "#8edccb", "#e6b77b", "#c7ade6", "#9fb9d5"].map((c, i) => <mesh key={c} position={[Math.cos(i / 5 * Math.PI * 2) * 2, Math.sin(i / 5 * Math.PI * 2) * 1.2, 0]}><sphereGeometry args={[0.14 + i * 0.018, 24, 16]} /><Surface color={c} /></mesh>)}</group>
    <group ref={ship} position={[2, 0, 0]}><mesh rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[0.095, 0.3, 5]} /><Surface color="#e8eff3" /></mesh><Dot color={color} radius={0.035} position={[-0.16, 0, 0]} /></group>
  </group>;
}

export function ResponsiveSites({ color, isLight, timeRef }) {
  const clock = useExhibitClock(timeRef, 12);
  const layouts = useRef([]), devices = useRef();
  useFrame(() => {
    const t = clock.current, selected = Math.floor(t / 4), p = (1 - Math.cos((t % 4) / 4 * Math.PI * 2)) / 2;
    devices.current.children.forEach((device, i) => { device.position.z = i === selected ? p * 0.25 : 0; });
    layouts.current.forEach((layout, i) => {
      layout.children.forEach((block, row) => {
        if (row === 0) { block.scale.x = 0.75 + p * 0.25; return; }
        const stacked = i === 2 ? 1 : i === 1 ? p : 0.25 * p;
        block.position.x = (row - 2) * 0.34 * (1 - stacked);
        block.position.y = -0.1 - (row - 1) * 0.2 * stacked;
        block.scale.x = 1 + stacked * 1.7;
      });
    });
  });
  const devicesData = [[0, 0.4, 2.6, 1.8, 1], [-1.85, -0.4, 1.05, 1.5, 0.55], [1.85, -0.45, 0.75, 1.35, 0.48]];
  return <group rotation={[0.06, -0.13, 0]}>
    <group ref={devices}>{devicesData.map(([x, y, w, h, scale], i) => <group key={i} position={[x, y, 0]}><Panel width={w} height={h} isLight={isLight}><group ref={node => { layouts.current[i] = node; }} scale={scale} position={[0, 0.1, 0.1]}><Ink color={color} width={i ? 1.2 : 1.9} height={0.3} position={[0, 0.35, 0]} />{[0, 1, 2].map(row => <Ink key={row} color={isLight ? "#4a6b80" : "#aac5d5"} width={0.26} height={0.14} position={[(row - 1) * 0.34, -0.1, 0]} />)}</group><Dot color={color} radius={0.025} position={[0, -h / 2 + 0.1, 0.1]} /></Panel></group>)}</group>
    <mesh position={[0, -0.8, -0.1]}><cylinderGeometry args={[0.12, 0.28, 0.6, 20]} /><Surface isLight={isLight} /></mesh><Panel width={1.1} height={0.12} position={[0, -1.12, 0]} isLight={isLight} />
  </group>;
}

export function SharedEditor({ color, isLight, timeRef }) {
  const clock = useExhibitClock(timeRef, 10);
  const lines = useRef(), cursors = useRef(), sync = useRef();
  useFrame(() => {
    const t = clock.current;
    lines.current.children.forEach((line, i) => { const width = 0.18 + smooth(t, i * 0.75, i * 0.75 + 2.8) * 0.82; line.scale.x = width; line.position.x = -0.75 * (1 - width); });
    cursors.current.children.forEach((cursor, i) => { cursor.position.x = -0.75 + ((t * 0.18 + i * 0.4) % 1) * 1.5; cursor.position.y = 0.55 - i * 0.9; });
    sync.current.children.forEach((dot, i) => { const p = (t * 0.32 + i * 0.5) % 1; dot.position.set((i ? 1 : -1) * 1.8 * p, 0.25 * p, 0.15); });
  });
  return <group rotation={[0.07, -0.12, 0]}>
    {[-1.8, 1.8].map(x => <group key={x}><Paper color={x < 0 ? "#8edccb" : color} isLight={isLight} scale={0.65} position={[x, 0.25, -0.15]} /><Route color={color} points={[[0, 0, -0.2], [x, 0.25, -0.2]]} /></group>)}
    <Panel width={2.35} height={2.65} isLight={isLight} />
    <Ink color={color} width={1.75} height={0.1} position={[0, 0.98, 0.1]} />
    <group ref={lines}>{[0, 1, 2, 3, 4].map(i => <Ink key={i} width={1.5} color={isLight ? "#426177" : "#b2cbd8"} position={[0, 0.55 - i * 0.3, 0.1]} />)}</group>
    <group ref={cursors}>{["#8edccb", color].map((c, i) => <group key={c} position={[-0.75, 0.55 - i * 0.9, 0.18]}><Ink color={c} width={0.025} height={0.2} /><mesh position={[0.04, 0.16, 0]} rotation={[0, 0, -0.6]}><coneGeometry args={[0.065, 0.15, 3]} /><meshBasicMaterial color={c} /></mesh></group>)}</group>
    <group ref={sync}>{[0, 1].map(i => <Dot key={i} color={i ? color : "#8edccb"} radius={0.055} />)}</group>
    {[-0.32, 0.32].map((x, i) => <mesh key={x} position={[x, 1.55, 0]}><sphereGeometry args={[0.13, 24, 16]} /><Surface color={i ? color : "#8edccb"} /></mesh>)}
  </group>;
}

const BINGO_NUMBERS = [4, 21, 33, 50, 66, 8, 18, 36, 54, 72, 6, 25, 0, 48, 64, 11, 27, 39, 55, 70, 1, 23, 42, 59, 75];
const BINGO_DRAWS = [0, 6, 18, 24];

export function Bingo({ color, isLight, timeRef }) {
  const clock = useExhibitClock(timeRef, 13);
  const markers = useRef(), ball = useRef(), numbers = useRef(), winning = useRef();
  const map = useMemo(() => {
    const canvas = document.createElement("canvas"); canvas.width = canvas.height = 512;
    const ctx = canvas.getContext("2d");
    BINGO_NUMBERS.forEach((n, i) => {
      const x = (i % 5) * 102.4, y = Math.floor(i / 5) * 102.4;
      ctx.fillStyle = isLight ? "#d4e2e9" : "#1a303f"; ctx.beginPath(); ctx.roundRect(x + 3, y + 3, 96.4, 96.4, 8); ctx.fill();
      ctx.fillStyle = isLight ? "#254659" : "#dbe7ed"; ctx.font = '500 42px "Segoe UI", sans-serif'; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(n ? String(n) : "✦", x + 51.2, y + 53);
    });
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; return texture;
  }, [isLight]);
  useEffect(() => () => map.dispose(), [map]);
  useFrame(() => {
    const t = clock.current, draw = Math.min(3, Math.floor(t / 2.8)), p = (t % 2.8) / 2.8;
    ball.current.position.y = 0.6 + Math.sin(smooth(p, 0, 0.6) * Math.PI) * 0.55;
    ball.current.rotation.z = Math.sin(p * Math.PI * 2) * 0.15;
    numbers.current.children.forEach((number, i) => { number.visible = i === draw; });
    markers.current.children.forEach((marker, i) => { const scale = smooth(t, i * 2.8 + 0.8, i * 2.8 + 1.4); marker.scale.setScalar(0.01 + scale * 0.99); });
    winning.current.material.opacity = smooth(t, 9.8, 10.8) * 0.8;
  });
  return <group rotation={[0.09, -0.15, 0]}>
    <Panel width={3.25} height={3.25} isLight={isLight} position={[-0.45, 0, 0]} />
    <mesh position={[-0.45, 0, 0.075]}><planeGeometry args={[3.05, 3.05]} /><meshBasicMaterial map={map} transparent toneMapped={false} /></mesh>
    <group ref={markers}>{BINGO_DRAWS.map(index => <mesh key={index} position={[-0.45 + (index % 5 - 2) * 0.61, (2 - Math.floor(index / 5)) * 0.61, 0.13]}><torusGeometry args={[0.245, 0.028, 8, 32]} /><meshBasicMaterial color={color} /></mesh>)}</group>
    <Route ref={winning} color={color} points={[[-1.67, 1.22, 0.15], [0.77, -1.22, 0.15]]} opacity={0} lineWidth={3} />
    <group ref={ball} position={[1.75, 0.6, 0]}><mesh><sphereGeometry args={[0.37, 32, 24]} /><Surface color={color} /></mesh><group ref={numbers}>{BINGO_DRAWS.map(index => <NumberFace key={index} number={BINGO_NUMBERS[index]} isLight size={0.43} position={[0, 0, 0.375]} />)}</group></group>
    <mesh position={[1.75, -0.05, 0]}><cylinderGeometry args={[0.45, 0.3, 0.16, 40]} /><Surface isLight={isLight} /></mesh>
  </group>;
}

export function Treasure({ color, isLight, timeRef }) {
  const clock = useExhibitClock(timeRef, 12);
  const marker = useRef(), lid = useRef(), coins = useRef(), clues = useRef();
  const curve = useMemo(() => new THREE.CatmullRomCurve3([[-1.65, -0.75, 0.1], [-1.1, 0.55, 0.1], [-0.25, -0.3, 0.1], [0.35, 0.35, 0.1], [1.25, 0.55, 0.1]].map(p => new THREE.Vector3(...p))), []);
  const path = useMemo(() => curve.getPoints(64), [curve]);
  useFrame(() => {
    const t = clock.current, progress = smooth(t, 0.4, 6.5), opening = smooth(t, 6.3, 8) * (1 - smooth(t, 10.2, 11.8));
    curve.getPoint(progress, marker.current.position);
    lid.current.rotation.x = -opening * 1.3;
    coins.current.children.forEach((coin, i) => { coin.position.y = 0.35 + opening * (0.4 + i * 0.13); coin.rotation.y = t * 0.7 + i; coin.scale.setScalar(0.05 + opening * 0.95); });
    clues.current.children.forEach((clue, i) => { clue.scale.setScalar(0.7 + smooth(progress, i / 4, (i + 0.5) / 4) * 0.3); });
  });
  return <group rotation={[0.15, -0.16, -0.04]}>
    <Panel width={3.65} height={2.5} position={[-0.35, -0.05, -0.05]} color={isLight ? "#b9cec9" : "#314d52"} />
    <Route color={color} points={path} dashed dashScale={8} dashSize={0.12} gapSize={0.12} opacity={0.7} />
    <group ref={clues}>{[[-1.65, -0.75], [-1.1, 0.55], [-0.25, -0.3], [0.35, 0.35]].map(([x, y], i) => <group key={i} position={[x, y, 0.14]}><mesh><torusGeometry args={[0.14, 0.025, 8, 24]} /><meshBasicMaterial color={color} /></mesh><Dot color={color} radius={0.035} /></group>)}</group>
    <Dot ref={marker} color="#f5ddb1" radius={0.08} />
    <group position={[1.25, 0.55, 0.22]}>
      <RoundedBox args={[0.95, 0.55, 0.68]} radius={0.045}><Surface color={isLight ? "#8e6e4d" : "#68513a"} /></RoundedBox>
      <group ref={lid} position={[0, 0.28, -0.34]}><RoundedBox args={[1, 0.15, 0.72]} radius={0.045} position={[0, 0, 0.34]}><Surface color="#c49f65" /></RoundedBox></group>
      <Ink color="#e7c486" width={0.13} height={0.2} position={[0, 0.03, 0.35]} />
      <group ref={coins}>{[-0.2, 0, 0.2].map((x, i) => <mesh key={i} position={[x, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.1, 0.1, 0.035, 24]} /><Surface color="#e7c486" /></mesh>)}</group>
    </group>
  </group>;
}
