/* eslint-disable react/no-unknown-property */
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { Surface } from "./exhibits/primitives";
import { useExhibitClock } from "./exhibits/exhibitMotion";
import ProjectStories from "./exhibits/ProjectStories";
import * as THREE from "three";

const CHESS_PROFILE = [
  [0, 0],
  [0.24, 0],
  [0.26, 0.04],
  [0.26, 0.09],
  [0.22, 0.14],
  [0.2, 0.17],
  [0.18, 0.23],
  [0.12, 0.48],
  [0.1, 0.75],
  [0.16, 0.8],
  [0.17, 0.85],
  [0.12, 0.9],
  [0.16, 1.02],
  [0.16, 1.09],
  [0, 1.09],
].map(([radius, height]) => new THREE.Vector2(radius, height));

const CHESS_PIECES = [
  { name: "white-king", square: [-0.22, 0.66], color: "#f1e5cf", king: true },
  { name: "black-king", square: [0.66, -1.1], color: "#405566", king: true },
  { name: "white-b-pawn", square: [-1.1, 1.1], color: "#f1e5cf" },
  { name: "white-g-pawn", square: [1.1, 0.66], color: "#f1e5cf" },
  { name: "black-c-pawn", square: [-0.66, -0.66], color: "#405566" },
];
// A short endgame: b4, Ke6, Ke3, c5, bxc5, Kf6, g4.
const CHESS_MOVES = [
  { piece: 2, from: [-1.1, 1.1], to: [-1.1, 0.22] },
  { piece: 1, from: [0.66, -1.1], to: [0.22, -0.66] },
  { piece: 0, from: [-0.22, 0.66], to: [0.22, 0.66] },
  { piece: 4, from: [-0.66, -0.66], to: [-0.66, -0.22] },
  { piece: 2, from: [-1.1, 0.22], to: [-0.66, -0.22], capture: 4 },
  { piece: 1, from: [0.22, -0.66], to: [0.66, -0.66] },
  { piece: 3, from: [1.1, 0.66], to: [1.1, 0.22] },
];
const CHESS_MOVE_INTERVAL = 2.6;
const CHESS_MOVE_DURATION = 1.25;
const CHESS_OPENING_HOLD = 1.1;
const CHESS_RESET_AT =
  CHESS_OPENING_HOLD +
  (CHESS_MOVES.length - 1) * CHESS_MOVE_INTERVAL +
  CHESS_MOVE_DURATION +
  2.4;
const CHESS_SOUND_CUES = CHESS_MOVES.map((move, index) => ({
  at: CHESS_OPENING_HOLD + index * CHESS_MOVE_INTERVAL + CHESS_MOVE_DURATION,
  kind: move.capture === undefined ? "land" : "capture",
  pan: move.to[0] * 0.2,
}));

function ChessPiece({ pieceRef, name, position, color, king = false }) {
  const material = (
    <meshStandardMaterial
      color={color}
      metalness={0.4}
      roughness={0.28}
      transparent
    />
  );
  return (
    <group
      ref={pieceRef}
      name={`chess-${name}`}
      position={position}
      scale={king ? 1 : 0.65}
    >
      <mesh>
        <latheGeometry args={[CHESS_PROFILE, 32]} />
        {material}
      </mesh>
      {king ? (
        <>
          <mesh position={[0, 1.25, 0]}>
            <boxGeometry args={[0.085, 0.32, 0.085]} />
            {material}
          </mesh>
          <mesh position={[0, 1.29, 0]}>
            <boxGeometry args={[0.25, 0.08, 0.085]} />
            {material}
          </mesh>
        </>
      ) : (
        <mesh position={[0, 1.15, 0]}>
          <sphereGeometry args={[0.2, 24, 16]} />
          {material}
        </mesh>
      )}
    </group>
  );
}

function Chess({ color, isLight, timeRef }) {
  const clock = useExhibitClock(
    timeRef,
    CHESS_RESET_AT + 1.4,
    CHESS_SOUND_CUES,
  );
  const pieces = useRef([]);
  const squares = useRef();
  const animation = useRef(null);
  const map = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext("2d");
    for (let y = 0; y < 8; y++)
      for (let x = 0; x < 8; x++) {
        ctx.fillStyle = (x + y) % 2 ? "#263b47" : "#c6b896";
        ctx.fillRect(x * 32, y * 32, 32, 32);
      }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  }, []);
  useEffect(() => () => map.dispose(), [map]);
  useFrame(() => {
    if (!animation.current) {
      animation.current = {
        materials: pieces.current.map((piece) => {
          const materials = [];
          piece.traverse((object) => {
            if (object.isMesh) materials.push(object.material);
          });
          return materials;
        }),
      };
    }
    // The shared clock freezes for pause, reduced motion, and background tabs.
    const time = clock.current;
    const resetting = time >= CHESS_RESET_AT + 0.7;
    const playhead = resetting ? 0 : time;
    const opacity = resetting
      ? THREE.MathUtils.smoothstep(
          time,
          CHESS_RESET_AT + 0.7,
          CHESS_RESET_AT + 1.4,
        )
      : 1 -
        THREE.MathUtils.smoothstep(time, CHESS_RESET_AT, CHESS_RESET_AT + 0.6);
    pieces.current.forEach((piece, index) => {
      const initial = CHESS_PIECES[index];
      piece.position.set(initial.square[0], 0.1, initial.square[1]);
      piece.scale.setScalar(initial.king ? 1 : 0.65);
      piece.visible = opacity > 0;
      animation.current.materials[index].forEach((material) => {
        material.opacity = opacity;
        material.depthWrite = opacity > 0.99;
      });
    });
    squares.current.visible = false;
    for (let index = 0; index < CHESS_MOVES.length; index++) {
      const move = CHESS_MOVES[index];
      const progress = THREE.MathUtils.clamp(
        (playhead - CHESS_OPENING_HOLD - index * CHESS_MOVE_INTERVAL) /
          CHESS_MOVE_DURATION,
        0,
        1,
      );
      if (progress === 0) break;
      const ease = progress * progress * (3 - 2 * progress);
      pieces.current[move.piece].position.set(
        THREE.MathUtils.lerp(move.from[0], move.to[0], ease),
        0.1 + Math.sin(progress * Math.PI) ** 2 * 0.18,
        THREE.MathUtils.lerp(move.from[1], move.to[1], ease),
      );
      if (move.capture !== undefined) {
        const captured = THREE.MathUtils.smoothstep(progress, 0.35, 0.85);
        const victim = pieces.current[move.capture];
        victim.visible = captured < 1 && opacity > 0;
        victim.position.y = 0.1 - captured * 0.18;
        victim.scale.setScalar(0.65 * (1 - captured * 0.15));
        animation.current.materials[move.capture].forEach((material) => {
          material.opacity = opacity * (1 - captured);
          material.depthWrite = material.opacity > 0.99;
        });
      }
      if (progress < 1) {
        squares.current.visible = true;
        squares.current.children.forEach((square, squareIndex) => {
          const position = squareIndex === 0 ? move.from : move.to;
          square.position.set(position[0], 0.099, position[1]);
          square.material.opacity =
            Math.sin(progress * Math.PI) * 0.34 * opacity;
        });
      }
    }
  });
  return (
    <group
      name="chess-project-exhibit"
      position={[0, -0.55, 0]}
      rotation={[0.42, -0.35, 0]}
    >
      <RoundedBox args={[3.72, 0.18, 3.72]} radius={0.055} smoothness={3}>
        <Surface color={color} isLight={isLight} />
      </RoundedBox>
      <mesh position={[0, 0.095, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.52, 3.52]} />
        <meshStandardMaterial map={map} roughness={0.42} metalness={0.15} />
      </mesh>
      <group ref={squares} name="chess-move-squares" visible={false}>
        {[0, 1].map((index) => (
          <mesh key={index} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.42, 0.42]} />
            <meshBasicMaterial
              color="#f1c576"
              transparent
              opacity={0}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
      {CHESS_PIECES.map((piece, index) => (
        <ChessPiece
          key={piece.name}
          {...piece}
          position={[piece.square[0], 0.1, piece.square[1]]}
          pieceRef={(element) => {
            pieces.current[index] = element;
          }}
        />
      ))}
    </group>
  );
}

export default function ProjectSculpture({
  animation,
  color,
  isLight,
  timeRef,
}) {
  const props = { color, isLight, timeRef };
  if (animation === "chess") return <Chess {...props} />;
  return <ProjectStories animation={animation} {...props} />;
}
