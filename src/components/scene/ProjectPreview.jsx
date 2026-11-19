/* eslint-disable react/no-unknown-property */
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { projectVisuals } from "../../data/projectVisuals";

function previewTexture(index, isLight, active, compact) {
  const visual = projectVisuals[index];
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  const accent = isLight ? new THREE.Color(visual.color).multiplyScalar(0.42).getStyle() : visual.color;
  const ink = isLight ? "#173447" : "#e5edf2";
  ctx.fillStyle = isLight ? "#edf4f8" : "#0b141e";
  ctx.beginPath(); ctx.roundRect(0, 0, 512, 512, 18); ctx.fill();
  ctx.strokeStyle = active ? accent : isLight ? "#9cabb8" : "#35495b";
  ctx.lineWidth = active ? 7 : 2;
  ctx.beginPath(); ctx.roundRect(4, 4, 504, 504, 16); ctx.stroke();
  ctx.font = '500 34px "Segoe UI", sans-serif';
  ctx.fillStyle = accent;
  ctx.fillText(String(index + 1).padStart(2, "0"), 30, 49);
  if (active) {
    ctx.beginPath(); ctx.arc(468, 36, 7, 0, Math.PI * 2); ctx.fill();
  }
  const line = (points, opacity = 1, width = 3) => {
    ctx.globalAlpha = opacity; ctx.strokeStyle = accent; ctx.lineWidth = width;
    ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); ctx.globalAlpha = 1;
  };
  const dot = (x, y, radius = 7) => {
    ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
  };
  // Small conceptual diagrams, derived from each project's field of work.
  if (visual.kind === "network") {
    for (let col = 0; col < 3; col++) for (let row = 0; row < 3; row++) {
      for (let next = 0; next < 3; next++) {
        if ((row + next + index) % 2 === 0) line([[96 + col * 106, 100 + row * 65], [202 + col * 106, 100 + next * 65]], 0.3, 2);
      }
    }
    for (let col = 0; col < 4; col++) for (let row = 0; row < 3; row++) dot(96 + col * 106, 100 + row * 65, col === 1 ? 9 : 6);
  } else if (visual.kind === "vision") {
    [32, 61, 92].forEach((radius, i) => {
      ctx.strokeStyle = accent; ctx.globalAlpha = 1 - i * 0.25; ctx.lineWidth = i === 1 ? 7 : 2;
      ctx.beginPath(); ctx.arc(256, 164, radius, 0, Math.PI * 2); ctx.stroke();
    });
    ctx.globalAlpha = 1;
    line([[105, 127], [105, 82], [150, 82]], 0.75);
    line([[407, 201], [407, 246], [362, 246]], 0.75);
    line([[240, 164], [272, 164]], 1, 2); line([[256, 148], [256, 180]], 1, 2);
  } else if (visual.kind === "voice") {
    line([[65, 166], [447, 166]], 0.2, 2);
    for (let i = 0; i < 43; i++) {
      const envelope = Math.sin(i / 42 * Math.PI);
      const height = (15 + Math.abs(Math.sin(i * 0.73 + index)) * 70) * envelope;
      line([[67 + i * 9, 166 - height], [67 + i * 9, 166 + height]], 0.45 + envelope * 0.55, 4);
    }
  } else if (visual.kind === "chess") {
    ctx.fillStyle = accent;
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
      ctx.globalAlpha = (x + y) % 2 ? 0.5 : 0.08;
      ctx.fillRect(144 + x * 28, 76 + y * 23, 28, 23);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = isLight ? "#edf4f8" : "#0b141e";
    ctx.strokeStyle = accent; ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(220, 235); ctx.lineTo(292, 235); ctx.lineTo(284, 218);
    ctx.lineTo(274, 176); ctx.lineTo(278, 146); ctx.lineTo(234, 146);
    ctx.lineTo(238, 176); ctx.lineTo(228, 218); ctx.closePath();
    ctx.fill(); ctx.stroke();
    line([[228, 218], [284, 218]], 1, 4);
    line([[235, 162], [277, 162]], 1, 4);
    line([[256, 108], [256, 142]], 1, 6);
    line([[241, 121], [271, 121]], 1, 6);
  } else if (visual.kind === "web") {
    ctx.strokeStyle = accent; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(89, 83, 334, 178, 9); ctx.stroke();
    line([[89, 114], [423, 114]], 0.4, 2);
    [104, 117, 130].forEach(x => dot(x, 99, 3));
    line([[115, 144], [255, 144]], 0.9, 9);
    line([[115, 166], [295, 166]], 0.35, 5);
    [115, 212, 309].forEach((x, i) => {
      ctx.globalAlpha = 0.12 + i * 0.1; ctx.fillStyle = accent; ctx.fillRect(x, 194, 77, 42);
    });
    ctx.globalAlpha = 1;
  } else {
    [[90, 110], [422, 110], [90, 234], [422, 234]].forEach(([x, y]) => {
      line([[x, y], [x, 172], [256, 172]], 0.45, 2); dot(x, y, 8);
    });
    ctx.fillStyle = isLight ? "#d7e7ee" : "#132a37"; ctx.fillRect(195, 113, 122, 118);
    ctx.strokeStyle = accent; ctx.lineWidth = 3; ctx.strokeRect(195, 113, 122, 118);
    for (let i = 0; i < 4; i++) {
      line([[210 + i * 30, 104], [210 + i * 30, 87]], 0.65, 3);
      line([[210 + i * 30, 240], [210 + i * 30, 257]], 0.65, 3);
    }
    ctx.fillStyle = accent; ctx.fillRect(234, 151, 44, 42);
  }
  line([[30, 294], [482, 294]], 0.22, 2);
  ctx.fillStyle = ink; ctx.font = `600 ${compact ? 68 : 58}px "Segoe UI", sans-serif`;
  const words = visual.shortTitle.split(" ");
  const rows = [];
  let row = "";
  for (const word of words) {
    const next = row ? `${row} ${word}` : word;
    if (ctx.measureText(next).width > 452 && row) { rows.push(row); row = word; }
    else row = next;
  }
  rows.push(row);
  rows.slice(0, 3).forEach((text, i) => ctx.fillText(text, 30, 359 + i * 64, 452));
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export default function ProjectPreview({ index, active, position, onSelect, isLight, compact, journey }) {
  const [hovered, setHovered] = useState(false);
  const group = useRef();
  const map = useMemo(() => previewTexture(index, isLight, active, compact), [index, isLight, active, compact]);
  useEffect(() => () => map.dispose(), [map]);
  useEffect(() => () => { document.body.style.cursor = ""; }, []);
  useFrame((_, dt) => {
    const target = position[1] + (hovered || active ? 0.08 : 0);
    group.current.position.y = journey.current.explorer?.motionOff
      ? target : THREE.MathUtils.damp(group.current.position.y, target, 10, Math.min(dt, 0.05));
  });
  return (
    <group
      ref={group} position={position} scale={compact ? 3.2 : 1}
      name={`project-preview-${index}`}
      onPointerOver={event => { event.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = ""; }}
      onClick={event => { event.stopPropagation(); onSelect(index); }}
    >
      <RoundedBox args={[1.15, 1.15, 0.065]} radius={0.04} smoothness={3}>
        <meshStandardMaterial color={isLight ? "#a9bcc8" : "#263745"} metalness={0.65} roughness={0.45} />
      </RoundedBox>
      <mesh position={[0, 0, 0.037]}>
        <planeGeometry args={[1.12, 1.12]} />
        <meshBasicMaterial map={map} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}
