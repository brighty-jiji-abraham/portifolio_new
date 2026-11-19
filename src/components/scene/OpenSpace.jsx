/* eslint-disable react/no-unknown-property */
import { Suspense, useContext, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { SceneQualityContext } from "./SceneQualityContext";

function DeepSky({ isLight }) {
  const { textures } = useContext(SceneQualityContext);
  const sky = useRef();
  const texture = useTexture(textures.sky, (map) => {
    map.colorSpace = THREE.SRGBColorSpace;
  });
  const uniforms = useMemo(() => ({
    skyMap: { value: texture }, lightTheme: { value: isLight ? 1 : 0 },
  }), [texture, isLight]);
  // Follow translation, never rotation: the distant sky has no parallax.
  useFrame(({ camera }) => sky.current.position.copy(camera.position));
  return (
    <mesh ref={sky} rotation={[0.25, -1.1, 0.52]} renderOrder={-100} name="deep-sky">
      <sphereGeometry args={[480, 64, 40]} />
      <shaderMaterial
        side={THREE.BackSide} depthWrite={false} uniforms={uniforms}
        vertexShader={`varying vec2 vUv; varying vec3 vDirection;
          void main() { vUv = uv;
            vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
            vDirection = viewPosition.xyz;
            gl_Position = projectionMatrix * viewPosition; }`}
        fragmentShader={`uniform sampler2D skyMap; uniform float lightTheme; varying vec2 vUv; varying vec3 vDirection;
          void main() {
            vec3 stars = texture2D(skyMap, vUv).rgb;
            float dust = dot(stars, vec3(0.2126, 0.7152, 0.0722));
            vec3 tint = mix(vec3(0.62, 0.76, 1.0), vec3(1.0, 0.79, 0.62),
              smoothstep(0.2, 0.7, vUv.x));
            vec3 night = stars * mix(tint, vec3(1.0), smoothstep(0.04, 0.3, dust)) * 0.38;
            night += vec3(0.0007, 0.0011, 0.0022);
            vec3 direction = normalize(vDirection);
            float depth = smoothstep(-0.65, 0.7, direction.x - direction.y * 0.5);
            vec3 day = mix(vec3(0.82, 0.9, 0.98), vec3(0.29, 0.47, 0.68), depth);
            day += stars * vec3(0.45, 0.5, 0.6);
            gl_FragColor = vec4(night, 1.0);
            #include <tonemapping_fragment>
            gl_FragColor.rgb = mix(gl_FragColor.rgb, day, lightTheme);
            #include <colorspace_fragment>
          }`}
      />
    </mesh>
  );
}

function createStars() {
  let seed = 129;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const count = 900;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  const palette = [new THREE.Color("#dce7ff"), new THREE.Color("#fff1dc"), new THREE.Color("#9dbbff")];
  for (let i = 0; i < count; i++) {
    const theta = random() * Math.PI * 2;
    const y = random() * 2 - 1;
    const radius = 220 + random() * 160;
    const r = Math.sqrt(1 - y * y) * radius;
    positions.set([Math.cos(theta) * r, y * radius, Math.sin(theta) * r], i * 3);
    palette[Math.floor(random() * palette.length)].toArray(colors, i * 3);
    sizes[i] = random() > 0.97 ? 5 + random() * 4 : 1 + random() * 2;
    phases[i] = random() * Math.PI * 2;
  }
  return { positions, colors, sizes, phases };
}

function PinpointStars({ isLight, timeRef }) {
  const stars = useRef();
  const data = useMemo(() => createStars(), []);
  const uniforms = useMemo(() => ({ lightTheme: { value: isLight ? 1 : 0 }, time: { value: 0 } }), [isLight]);
  useFrame(({ camera }) => {
    stars.current.position.copy(camera.position);
    stars.current.material.uniforms.time.value = timeRef.current;
  });
  return (
    <points ref={stars} renderOrder={-99} name="distant-stars">
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[data.colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[data.sizes, 1]} />
        <bufferAttribute attach="attributes-phase" args={[data.phases, 1]} />
      </bufferGeometry>
      <shaderMaterial
        transparent depthWrite={false} vertexColors uniforms={uniforms}
        vertexShader={`attribute float size, phase; varying vec3 vColor; varying float brightness; uniform float lightTheme, time;
          void main() { vColor = color; brightness = 0.88 + sin(time * 0.45 + phase) * 0.12;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * mix(1.0, 0.7, lightTheme); }`}
        fragmentShader={`varying vec3 vColor; varying float brightness; uniform float lightTheme;
          void main() {
            vec2 p = gl_PointCoord - 0.5;
            float radius = length(p);
            float core = exp(-radius * radius * 65.0);
            float halo = exp(-radius * radius * 13.0) * 0.22;
            float alpha = (core + halo) * (1.0 - smoothstep(0.35, 0.5, radius));
            gl_FragColor = vec4(mix(vColor, vec3(0.86, 0.94, 1.0), lightTheme), alpha * brightness);
            #include <colorspace_fragment>
          }`}
      />
    </points>
  );
}

export function Moon({ scale = 1, ...props }) {
  const { textures, anisotropy, level } = useContext(SceneQualityContext);
  const gl = useThree(state => state.gl);
  const [color, height] = useTexture([
    textures.moon,
    textures.moonHeight,
  ], (maps) => {
    maps[0].colorSpace = THREE.SRGBColorSpace;
    const filtering = Math.min(anisotropy, gl.capabilities.getMaxAnisotropy() || 1);
    for (const map of maps) {
      if (map.anisotropy !== filtering) { map.anisotropy = filtering; map.needsUpdate = true; }
    }
  });
  return (
    <mesh {...props} scale={scale}>
      <sphereGeometry args={[1, level === 3 ? 128 : 64, level === 3 ? 96 : 48]} />
      <meshStandardMaterial map={color} bumpMap={height} bumpScale={0.035} roughness={1} />
    </mesh>
  );
}

export default function OpenSpace({ isLight, timeRef }) {
  return (
    <>
      <Suspense fallback={null}><DeepSky isLight={isLight} /></Suspense>
      <PinpointStars isLight={isLight} timeRef={timeRef} />
    </>
  );
}
