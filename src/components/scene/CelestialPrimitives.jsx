/* eslint-disable react/no-unknown-property */
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function WorldLabel({ text, color, position, width = 3, size = 54 }) {
  const map = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 192;
    const ctx = canvas.getContext("2d");
    ctx.font = `500 ${size}px "Segoe UI", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;
    ctx.fillText(text, 512, 96, 1000);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [text, color, size]);
  useEffect(() => () => map.dispose(), [map]);
  return (
    <sprite
      position={position}
      scale={[width, (width * 192) / 1024, 1]}
      renderOrder={4}
    >
      <spriteMaterial
        map={map}
        transparent
        depthWrite={false}
        depthTest={false}
        toneMapped={false}
      />
    </sprite>
  );
}

const VERTEX = `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`;
const FRAGMENT = `
  varying vec2 vUv;
  uniform vec3 tint;
  uniform float strength;
  uniform float rays;
  void main() {
    vec2 p = vUv - .5;
    float r = length(p);
    float halo = exp(-r * r * 32.) * .45;
    float core = exp(-r * r * 900.);
    float cross = (exp(-abs(p.x) * 110.) * exp(-abs(p.y) * 9.)
                 + exp(-abs(p.y) * 110.) * exp(-abs(p.x) * 9.)) * rays;
    float alpha = (halo + core * .6 + cross * .42) * strength * (1. - smoothstep(.32, .5, r));
    gl_FragColor = vec4(tint, min(alpha, 1.));
  }
`;

export function CelestialGlow({
  color,
  size = 1,
  strength = 0.6,
  rays = 0,
  isLight,
  journey,
}) {
  const mesh = useRef();
  const material = useRef();
  const uniforms = useMemo(
    () => ({
      tint: { value: new THREE.Color(color) },
      strength: { value: 0 },
      rays: { value: rays },
    }),
    [color, rays],
  );
  useFrame((_, delta) => {
    const still = journey?.current.explorer?.motionOff;
    const dt = Math.min(delta, 0.05);
    mesh.current.scale.setScalar(
      still ? size : THREE.MathUtils.damp(mesh.current.scale.x, size, 8, dt),
    );
    const value = material.current.uniforms.strength;
    value.value = still
      ? strength
      : THREE.MathUtils.damp(value.value, strength, 8, dt);
  });
  return (
    <mesh ref={mesh} raycast={() => null}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        transparent
        depthWrite={false}
        toneMapped={false}
        blending={isLight ? THREE.NormalBlending : THREE.AdditiveBlending}
      />
    </mesh>
  );
}

export function CurveLine({
  curve,
  color,
  opacity = 1,
  segments = 40,
  ...props
}) {
  const positions = useMemo(
    () =>
      new Float32Array(curve.getPoints(segments).flatMap((p) => p.toArray())),
    [curve, segments],
  );
  return (
    <line {...props} raycast={() => null}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        toneMapped={false}
      />
    </line>
  );
}
