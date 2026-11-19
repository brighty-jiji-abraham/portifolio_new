/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

const SUN = new THREE.Vector3(-0.85, 0.45, 0.55).normalize();
const vertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorld;
  void main() {
    vUv = uv;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * viewMatrix * vec4(vWorld, 1.0);
  }
`;

export default function PlanetEarth({ timeRef }) {
  const globe = useRef();
  const surface = useRef();
  const base = import.meta.env.BASE_URL;
  const [day, night, water, clouds] = useTexture([
    `${base}textures/earth_color.jpg`,
    `${base}earth-lights.png`,
    `${base}textures/earth_specular.jpg`,
    `${base}textures/earth_clouds.png`,
  ], (maps) => {
    maps[0].colorSpace = THREE.SRGBColorSpace;
    maps[1].colorSpace = THREE.SRGBColorSpace;
    maps.forEach((map) => { map.anisotropy = 4; });
  });
  const uniforms = useMemo(() => ({
    dayMap: { value: day }, nightMap: { value: night },
    waterMap: { value: water }, cloudMap: { value: clouds },
    sun: { value: SUN }, cloudOffset: { value: 0 },
  }), [day, night, water, clouds]);
  const atmosphere = useMemo(() => ({ sun: { value: SUN } }), []);
  useFrame(() => {
    globe.current.rotation.y = 3.45 + timeRef.current * 0.018;
    surface.current.uniforms.cloudOffset.value = timeRef.current * 0.0006;
  });
  return (
    <group rotation={[0.12, 0, -0.18]} scale={1.22} name="photographic-earth">
      <mesh ref={globe}>
        <sphereGeometry args={[1.58, 96, 64]} />
        <shaderMaterial
          ref={surface} uniforms={uniforms} vertexShader={vertexShader}
          fragmentShader={`
            uniform sampler2D dayMap, nightMap, waterMap, cloudMap;
            uniform vec3 sun;
            uniform float cloudOffset;
            varying vec2 vUv;
            varying vec3 vNormal, vWorld;
            void main() {
              vec3 n = normalize(vNormal);
              vec3 view = normalize(cameraPosition - vWorld);
              float daylight = dot(n, sun);
              float dayAmount = smoothstep(-0.16, 0.22, daylight);
              vec3 land = texture2D(dayMap, vUv).rgb;
              vec3 lights = texture2D(nightMap, vUv).rgb;
              vec2 cloudUv = vec2(fract(vUv.x + cloudOffset), vUv.y);
              // This cloud map stores density in alpha, with white RGB.
              float cloud = texture2D(cloudMap, cloudUv).a;
              float shadow = texture2D(cloudMap, cloudUv + vec2(0.002, 0.001)).a;
              float ocean = texture2D(waterMap, vUv).r;
              float diffuse = max(daylight, 0.0);
              vec3 color = land * (0.012 + diffuse * 1.65) * (1.0 - shadow * 0.3);
              color = mix(color, vec3(0.95, 0.98, 1.0) * (0.018 + diffuse * 1.5), cloud * 0.85);
              float specular = pow(max(dot(n, normalize(sun + view)), 0.0), 75.0);
              color += vec3(1.0, 0.9, 0.72) * specular * ocean * (1.0 - cloud) * 0.6;
              color += lights * vec3(1.0, 0.72, 0.4) * (1.0 - dayAmount) * (1.0 - cloud * 0.75) * 1.6;
              float rim = pow(1.0 - max(dot(n, view), 0.0), 4.0);
              color += vec3(0.08, 0.32, 0.8) * rim * smoothstep(-0.25, 0.5, daylight) * 0.5;
              gl_FragColor = vec4(color, 1.0);
              #include <tonemapping_fragment>
              #include <colorspace_fragment>
            }`}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.625, 80, 56]} />
        <shaderMaterial
          uniforms={atmosphere} vertexShader={vertexShader}
          transparent depthWrite={false} side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          fragmentShader={`
            uniform vec3 sun;
            varying vec3 vNormal, vWorld;
            void main() {
              vec3 n = normalize(vNormal);
              vec3 view = normalize(cameraPosition - vWorld);
              float edge = pow(clamp(1.0 + dot(n, view), 0.0, 1.0), 5.0);
              float light = smoothstep(-0.3, 0.6, dot(n, sun));
              gl_FragColor = vec4(vec3(0.12, 0.42, 1.0), edge * light * 0.42);
              #include <colorspace_fragment>
            }`}
        />
      </mesh>
    </group>
  );
}
