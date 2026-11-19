/* eslint-disable react/no-unknown-property */
import { useEffect, useMemo } from "react";
import { Line, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

export function Surface({ color, isLight, glass = false }) {
  return <meshPhysicalMaterial color={color || (isLight ? "#718490" : "#29343e")}
    metalness={glass ? 0.15 : 0.72} roughness={glass ? 0.13 : 0.42}
    clearcoat={glass ? 1 : 0.22} clearcoatRoughness={0.3}
    transparent={glass} opacity={glass ? 0.25 : 1} depthWrite={!glass}
    side={glass ? THREE.DoubleSide : THREE.FrontSide}
    emissive={color || "#183b51"} emissiveIntensity={glass ? 0.08 : 0.015} />;
}

export function Panel({ children, width = 1.2, height = 1.5, color, isLight, ...props }) {
  return <group {...props}>
    <RoundedBox args={[width, height, 0.12]} radius={0.045} smoothness={3}>
      <Surface color={color} isLight={isLight} />
    </RoundedBox>
    {children}
  </group>;
}

export function Ink({ color, width = 0.8, height = 0.045, ...props }) {
  return <mesh {...props}><boxGeometry args={[width, height, 0.025]} /><meshBasicMaterial color={color} /></mesh>;
}

export function Dot({ color, radius = 0.06, ...props }) {
  return <mesh {...props}><sphereGeometry args={[radius, 16, 12]} /><meshBasicMaterial color={color} /></mesh>;
}

export function Check({ color, ...props }) {
  return <group {...props}><Line points={[[-0.15, 0, 0], [-0.03, -0.12, 0], [0.2, 0.15, 0]]} color={color} lineWidth={2.2} /></group>;
}

export function Paper({ color, isLight, lines = 4, ...props }) {
  return <Panel {...props} color={isLight ? "#dae5ec" : "#344651"}>
    <Ink color={color} width={0.78} height={0.09} position={[0, 0.45, 0.08]} />
    {Array.from({ length: lines }, (_, index) => <Ink key={index}
      color={isLight ? "#405b70" : "#adc7d4"} width={0.8 - (index % 3) * 0.13}
      position={[-(index % 3) * 0.065, 0.18 - index * 0.2, 0.08]} />)}
  </Panel>;
}

export function Route({ points, color, opacity = 0.35, ...props }) {
  return <Line points={points} color={color} transparent opacity={opacity} lineWidth={1.2} {...props} />;
}

function useNumberTexture(number, isLight = false) {
  const map = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = isLight ? "#263b47" : "#f5ead3";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = '600 72px "Segoe UI", sans-serif';
    ctx.fillText(String(number), 64, 66);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [number, isLight]);
  useEffect(() => () => map.dispose(), [map]);
  return map;
}

export function NumberFace({ number, isLight, size = 0.4, ...props }) {
  const map = useNumberTexture(number, isLight);
  return <mesh {...props}><planeGeometry args={[size, size]} /><meshBasicMaterial map={map} transparent depthWrite={false} toneMapped={false} /></mesh>;
}
