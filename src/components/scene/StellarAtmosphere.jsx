/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";

const vertex = `varying vec2 vUv;
  void main() { vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

// An unresolved stellar core and its optical halo, rather than a solid marker.
export function StellarLight({ color, size = 1.5, active = false, phase = 0, timeRef, signal, isLight }) {
  const material = useRef();
  const uniforms = useMemo(() => ({
    tint: { value: new THREE.Color(color) },
    time: { value: 0 },
    phase: { value: phase },
    emphasis: { value: active ? 1 : 0 },
    pulse: { value: 0 },
    lightTheme: { value: isLight ? 1 : 0 },
  }), [color, phase, active, isLight]);
  useFrame(() => {
    const values = material.current.uniforms;
    values.time.value = timeRef.current;
    values.pulse.value = signal ? Math.max(0, 1 - (timeRef.current - signal.current) / 1.6) : 0;
  });
  return (
    <mesh scale={[size, size, 1]} raycast={() => null} name="stellar-light">
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={material} uniforms={uniforms} vertexShader={vertex}
        transparent depthWrite={false} toneMapped={false}
        fragmentShader={`
          varying vec2 vUv;
          uniform vec3 tint;
          uniform float time, phase, emphasis, pulse, lightTheme;
          void main() {
            vec2 p = vUv - 0.5;
            float r = length(p);
            float core = exp(-r * r * 2400.0);
            float halo = exp(-r * r * 95.0) * 0.32 + exp(-r * 17.0) * 0.09;
            float spikes = (exp(-abs(p.x) * 230.0) * exp(-abs(p.y) * 19.0)
              + exp(-abs(p.y) * 230.0) * exp(-abs(p.x) * 19.0)) * (0.06 + emphasis * 0.08);
            float shimmer = 0.94 + sin(time * 0.8 + phase) * 0.035 + sin(time * 1.17 + phase * 2.0) * 0.025;
            float strength = shimmer * (1.0 + emphasis * 0.3 + pulse * 0.22);
            float alpha = (core * 1.65 + (halo + spikes) * mix(1.0, 0.6, lightTheme)) * strength;
            alpha *= 1.0 - smoothstep(0.32, 0.5, r);
            vec3 hot = mix(vec3(1.0, 0.98, 0.91), vec3(0.92, 0.97, 1.0), lightTheme);
            vec3 glowTint = mix(tint, mix(tint, hot, 0.8), lightTheme);
            vec3 starColor = mix(glowTint, hot, smoothstep(0.03, 0.8, core));
            float edge = smoothstep(0.02, 0.12, core) * (1.0 - smoothstep(0.32, 0.8, core));
            starColor = mix(starColor, tint, edge * lightTheme * 0.85);
            gl_FragColor = vec4(starColor, min(alpha, 1.0));
            #include <colorspace_fragment>
          }`}
      />
    </mesh>
  );
}

function dustData(seed) {
  let state = seed;
  const random = () => {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
  const positions = new Float32Array(220 * 3);
  const sizes = new Float32Array(220);
  const phases = new Float32Array(220);
  for (let i = 0; i < 220; i++) {
    const angle = random() * Math.PI * 2;
    const radius = Math.sqrt(random());
    positions.set([Math.cos(angle) * radius * 4.5, Math.sin(angle) * radius * 3.3, -0.8 - random() * 2.6], i * 3);
    sizes[i] = 0.8 + random() ** 3 * 3.0;
    phases[i] = random() * Math.PI * 2;
  }
  return { positions, sizes, phases };
}

export function StellarCloud({ timeRef, isLight, seed = 431, color = "#7eafd5" }) {
  const cloud = useRef();
  const dust = useRef();
  const data = useMemo(() => dustData(seed), [seed]);
  const uniforms = useMemo(() => ({
    time: { value: 0 },
    tint: { value: new THREE.Color(isLight ? "#3b6486" : color) },
    lightTheme: { value: isLight ? 1 : 0 },
    offset: { value: seed % 97 },
  }), [isLight, color, seed]);
  useFrame(() => {
    cloud.current.uniforms.time.value = timeRef.current;
    dust.current.material.uniforms.time.value = timeRef.current;
    dust.current.rotation.z = Math.sin(timeRef.current * 0.04) * 0.018;
  });
  return (
    <group name="stellar-atmosphere">
      <Billboard position={[0, 0, -2.8]}>
        <mesh raycast={() => null}>
          <planeGeometry args={[10, 8]} />
          <shaderMaterial
            ref={cloud} uniforms={uniforms} vertexShader={vertex}
            transparent depthWrite={false} toneMapped={false}
            fragmentShader={`
              varying vec2 vUv;
              uniform vec3 tint;
              uniform float time, offset, lightTheme;
              float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
              float noise(vec2 p) {
                vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
                return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                  mix(hash(i + vec2(0.0, 1.0)), hash(i + 1.0), f.x), f.y);
              }
              void main() {
                vec2 p = (vUv - 0.5) * 2.0;
                vec2 flow = p * 3.2 + vec2(time * 0.007, offset);
                float density = noise(flow) * 0.55 + noise(flow * 2.1) * 0.3 + noise(flow * 4.2) * 0.15;
                float wisps = pow(smoothstep(0.28, 0.8, density), 2.0);
                float envelope = exp(-dot(p * vec2(1.0, 1.4), p * vec2(1.0, 1.4)) * 2.0);
                float edge = 1.0 - smoothstep(0.55, 1.0, max(abs(p.x), abs(p.y)));
                gl_FragColor = vec4(tint, wisps * envelope * edge * mix(0.24, 0.11, lightTheme));
                #include <colorspace_fragment>
              }`}
          />
        </mesh>
      </Billboard>
      <points ref={dust} raycast={() => null}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
          <bufferAttribute attach="attributes-size" args={[data.sizes, 1]} />
          <bufferAttribute attach="attributes-phase" args={[data.phases, 1]} />
        </bufferGeometry>
        <shaderMaterial
          uniforms={uniforms} transparent depthWrite={false} toneMapped={false}
          vertexShader={`attribute float size, phase; uniform float time; varying float brightness;
            void main() {
              vec4 p = modelViewMatrix * vec4(position, 1.0);
              gl_Position = projectionMatrix * p;
              gl_PointSize = size * clamp(24.0 / -p.z, 0.45, 1.8);
              brightness = 0.48 + 0.13 * sin(time * 0.6 + phase);
            }`}
          fragmentShader={`uniform vec3 tint; varying float brightness;
            void main() {
              float radius = length(gl_PointCoord - 0.5);
              float alpha = exp(-radius * radius * 28.0) * (1.0 - smoothstep(0.35, 0.5, radius));
              gl_FragColor = vec4(tint, alpha * brightness);
              #include <colorspace_fragment>
            }`}
        />
      </points>
    </group>
  );
}
