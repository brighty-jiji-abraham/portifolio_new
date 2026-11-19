/* eslint-disable react/no-unknown-property */
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { makeSurface } from "./materials";
import { smoothRange } from "./mission";

const BASE = import.meta.env.BASE_URL;
const SUN = new THREE.Vector3(-0.5, 0.65, 0.8).normalize();
const earthVertex = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vNormal = normalize(mat3(modelMatrix) * normal);
    vPosition = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export function Earth({ motion }) {
  const globe = useRef();
  const material = useRef();
  const [surface, clouds, night] = useTexture([
    `${BASE}textures/earth_color.jpg`,
    `${BASE}textures/earth_clouds.png`,
    `${BASE}earth-lights.png`,
  ]);
  const uniforms = useMemo(
    () => ({
      surface: { value: surface },
      clouds: { value: clouds },
      night: { value: night },
      sun: { value: SUN },
      time: { value: 0 },
    }),
    [surface, clouds, night],
  );
  useFrame(() => {
    if (globe.current)
      globe.current.rotation.y = 2.9 + motion.current.time * 0.007;
    if (material.current)
      material.current.uniforms.time.value = motion.current.time;
  });
  return (
    <group position={[-20, -20, -40]} rotation={[0, 0, -0.15]}>
      <mesh ref={globe} name="earth-surface">
        <sphereGeometry args={[24, 96, 64]} />
        <shaderMaterial
          ref={material}
          vertexShader={earthVertex}
          uniforms={uniforms}
          fragmentShader={`
          uniform sampler2D surface, clouds, night;
          uniform vec3 sun;
          uniform float time;
          varying vec2 vUv;
          varying vec3 vNormal, vPosition;
          void main() {
            vec3 n = normalize(vNormal);
            float daylight = dot(n, sun);
            float terminator = smoothstep(-0.15, 0.3, daylight);
            vec3 color = pow(texture2D(surface, vUv).rgb, vec3(2.2));
            vec4 cloudTex = texture2D(clouds, vUv + vec2(time * 0.00025, 0.));
            float cloud = max(cloudTex.r, max(cloudTex.g, cloudTex.b)) * cloudTex.a;
            color = mix(color, vec3(0.78, 0.86, 0.94), cloud * 0.62);
            color *= 0.025 + terminator * (0.35 + max(daylight, 0.) * 1.15);
            vec3 cities = texture2D(night, vUv).rgb;
            color += cities * vec3(1., 0.57, 0.2) * (1. - terminator) * 0.75;
            float fresnel = pow(1. - max(dot(n, normalize(cameraPosition - vPosition)), 0.), 3.);
            color += vec3(0.08, 0.38, 0.72) * fresnel * terminator * 0.8;
            gl_FragColor = vec4(color, 1.);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `}
        />
      </mesh>
      <mesh name="earth-atmosphere">
        <sphereGeometry args={[24.55, 64, 48]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          vertexShader={earthVertex}
          uniforms={{ sun: { value: SUN } }}
          fragmentShader={`
            uniform vec3 sun;
            varying vec3 vNormal, vPosition;
            void main() {
              vec3 n = normalize(vNormal);
              float rim = pow(max(0., 0.67 + dot(n, normalize(cameraPosition - vPosition))), 4.);
              float light = smoothstep(-0.35, 0.6, dot(n, sun));
              gl_FragColor = vec4(vec3(0.22, 0.57, 1.) * 1.5, rim * light * 0.8);
            }
          `}
        />
      </mesh>
    </group>
  );
}

export function StarField() {
  const positions = useMemo(() => {
    const values = new Float32Array(1400 * 3);
    let seed = 83;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < 1400; i++) {
      const theta = random() * Math.PI * 2;
      const y = random() * 2 - 1;
      const radius = 150 + random() * 100;
      const r = Math.sqrt(1 - y * y) * radius;
      values.set([Math.cos(theta) * r, y * radius, Math.sin(theta) * r], i * 3);
    }
    return values;
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.17}
        color="#abc3d8"
        transparent
        opacity={0.75}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function Ring({
  radius,
  tube = 0.06,
  color = "#738994",
  emissive = false,
  ...props
}) {
  return (
    <mesh {...props}>
      <torusGeometry args={[radius, tube, 6, 64]} />
      {emissive ? (
        <meshBasicMaterial color={color} toneMapped={false} />
      ) : (
        <meshStandardMaterial color={color} metalness={0.75} roughness={0.36} />
      )}
    </mesh>
  );
}

function Hull({ size, material, ...props }) {
  return (
    <mesh {...props}>
      <boxGeometry args={size} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

function ResearchArray({ solar }) {
  const { scene } = useGLTF(`${BASE}models/nasa/iss.glb`, `${BASE}draco/`);
  const model = useMemo(() => {
    const copy = scene.clone(true);
    const box = new THREE.Box3().setFromObject(copy);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    copy.position.sub(center);
    const wrapper = new THREE.Group();
    wrapper.add(copy);
    wrapper.scale.setScalar(23 / Math.max(size.x, size.y, size.z));
    copy.traverse((mesh) => {
      if (!mesh.isMesh) return;
      mesh.material = mesh.material.clone();
      mesh.material.metalness = 0.55;
      mesh.material.roughness = 0.48;
      if (mesh.material.name === "ISSSolarPanels") {
        mesh.material.color.set("#809ebc");
        mesh.material.map = solar;
        mesh.material.side = THREE.DoubleSide;
      }
    });
    return wrapper;
  }, [scene, solar]);
  useEffect(
    () => () =>
      model.traverse((mesh) => {
        if (mesh.isMesh) mesh.material.dispose();
      }),
    [model],
  );
  return (
    <group position={[0, 7.5, -3]} rotation={[0, -0.1, 0]} scale={0.55}>
      <primitive object={model} dispose={null} />
    </group>
  );
}

export function Station({ motion, finish }) {
  const doorLeft = useRef();
  const doorRight = useRef();
  const wheel = useRef();
  const surfaces = useMemo(
    () => ({ hull: makeSurface("hull"), solar: makeSurface("solar") }),
    [],
  );
  const materials = useMemo(
    () => ({
      hull: new THREE.MeshStandardMaterial({
        map: surfaces.hull,
        color: "#d8e2e5",
        roughness: 0.46,
        metalness: 0.6,
      }),
      dark: new THREE.MeshStandardMaterial({
        color: "#172833",
        roughness: 0.43,
        metalness: 0.75,
      }),
      interior: new THREE.MeshStandardMaterial({
        map: surfaces.hull,
        color: "#3a5262",
        roughness: 0.65,
        metalness: 0.45,
      }),
      trim: new THREE.MeshStandardMaterial({
        color: "#b7cbd1",
        roughness: 0.3,
        metalness: 0.85,
      }),
      light: new THREE.MeshBasicMaterial({
        color: new THREE.Color("#8edceb").multiplyScalar(2.3),
        toneMapped: false,
      }),
    }),
    [surfaces],
  );
  useEffect(() => {
    materials.hull.color.set(finish === "ceramic" ? "#d8e2e5" : "#536c7b");
  }, [finish, materials]);
  useEffect(() => {
    Object.values(surfaces).forEach((texture) => {
      texture.needsUpdate = true;
    });
    return () => {
      Object.values(materials).forEach((material) => material.dispose());
      Object.values(surfaces).forEach((texture) => texture.dispose());
    };
  }, [materials, surfaces]);
  useFrame(() => {
    const opening = smoothRange(motion.current.progress, 0.4, 0.63);
    if (doorLeft.current) doorLeft.current.position.x = -1.12 - opening * 2.5;
    if (doorRight.current) doorRight.current.position.x = 1.12 + opening * 2.5;
    if (wheel.current) wheel.current.rotation.z = motion.current.time * 0.008;
  });
  return (
    <group name="orbital-station">
      <ResearchArray solar={surfaces.solar} />
      <group ref={wheel} position={[0, 0, -1.8]}>
        <Ring radius={6.6} tube={0.24} color="#889ba5" />
        <Ring radius={6.9} tube={0.08} />
        <Ring radius={6.35} tube={0.025} color="#75b9c8" emissive />
        {Array.from({ length: 24 }, (_, i) => {
          const angle = (i * Math.PI) / 12;
          return (
            <group key={i} rotation={[0, 0, angle]}>
              <Hull
                position={[0, 6.6, 0]}
                size={[1.2, 0.75, 0.85]}
                material={materials.hull}
              />
              {i % 3 === 0 && (
                <>
                  <Hull
                    position={[0, 4.4, 0]}
                    size={[0.16, 3.6, 0.22]}
                    material={materials.dark}
                  />
                  <Hull
                    position={[0, 6.6, 0.46]}
                    size={[0.48, 0.065, 0.02]}
                    material={materials.light}
                  />
                </>
              )}
            </group>
          );
        })}
      </group>
      <group position={[0, 0, 2]}>
        <Ring radius={2.8} tube={0.42} color="#9eadb5" />
        <Ring radius={3.2} tube={0.09} color="#49606d" />
        <Ring
          radius={2.42}
          tube={0.035}
          color={[1.1, 2.5, 3]}
          emissive
          position={[0, 0, 0.2]}
        />
        {Array.from({ length: 8 }, (_, i) => (
          <group key={i} rotation={[0, 0, (i * Math.PI) / 4]}>
            <Hull
              position={[0, 2.8, 0.15]}
              size={[0.4, 0.85, 0.9]}
              material={materials.dark}
            />
            <Hull
              position={[0, 2.8, 0.62]}
              size={[0.24, 0.18, 0.035]}
              material={materials.light}
            />
          </group>
        ))}
        {[-1, 1].map((side) => (
          <group
            ref={side === -1 ? doorLeft : doorRight}
            key={side}
            position={[side * 1.12, 0, -0.3]}
          >
            <Hull size={[2.22, 4.6, 0.25]} material={materials.hull} />
            <Hull
              size={[0.035, 3.6, 0.03]}
              position={[-side * 1.04, 0, 0.15]}
              material={materials.light}
            />
            <Hull
              size={[1.5, 0.08, 0.04]}
              position={[0, 0.6, 0.15]}
              material={materials.dark}
            />
            <Hull
              size={[1.5, 0.08, 0.04]}
              position={[0, -0.6, 0.15]}
              material={materials.dark}
            />
          </group>
        ))}
      </group>
      {[0.5, -1.5, -3.5, -5.5].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <Ring radius={2.65} tube={0.16} color="#6c828d" />
          <Ring radius={2.44} tube={0.025} color={[0.3, 1.2, 1.5]} emissive />
        </group>
      ))}
      {[-1, 1].map((side) => (
        <group key={side}>
          <Hull
            position={[side * 2.58, 0, -1.8]}
            size={[0.18, 4.9, 8]}
            material={materials.interior}
          />
          <Hull
            position={[side * 2.46, -1.4, -1.8]}
            size={[0.035, 0.04, 7.8]}
            material={materials.light}
          />
          <Hull
            position={[side * 4.6, 0, -11]}
            size={[0.18, 5.4, 10]}
            material={materials.interior}
          />
          <Hull
            position={[side * 4.48, 1.3, -11]}
            size={[0.04, 0.04, 8.5]}
            material={materials.light}
          />
          <Hull
            position={[side * 2.8, 2.63, -11]}
            size={[0.06, 0.035, 8.5]}
            material={materials.light}
          />
          {[-8, -12, -15.8].map((z) => (
            <Hull
              key={z}
              position={[side * 4.4, 0, z]}
              size={[0.15, 5.4, 0.22]}
              material={materials.dark}
            />
          ))}
        </group>
      ))}
      <Hull
        position={[0, -2.55, -1.8]}
        size={[4.8, 0.15, 8]}
        material={materials.hull}
      />
      <Hull
        position={[0, 2.55, -1.8]}
        size={[4.8, 0.15, 8]}
        material={materials.interior}
      />
      <Hull
        position={[0, -2.65, -11]}
        size={[9.5, 0.18, 11]}
        material={materials.dark}
      />
      <Hull
        position={[0, 2.75, -11]}
        size={[9.5, 0.18, 11]}
        material={materials.interior}
      />
      <Hull
        position={[0, 0, -16.2]}
        size={[9.5, 5.5, 0.2]}
        material={materials.interior}
      />
      <Ring radius={3.6} tube={0.055} position={[0, 0, -16]} color="#577b89" />
      {[-3, -1.5, 0, 1.5, 3].map((x) => (
        <Hull
          key={x}
          position={[x, -2.54, -11]}
          size={[0.016, 0.015, 10]}
          material={materials.trim}
        />
      ))}
      {[-7, -10, -13, -16].map((z) => (
        <Hull
          key={z}
          position={[0, -2.54, z]}
          size={[9, 0.015, 0.016]}
          material={materials.trim}
        />
      ))}
      <pointLight
        position={[0, 1.5, -8]}
        color="#b7e9ff"
        intensity={24}
        distance={14}
        decay={2}
      />
      <pointLight
        position={[-2, -0.5, -12]}
        color="#72d9ed"
        intensity={13}
        distance={8}
        decay={2}
      />
      <pointLight
        position={[3, 1, -13]}
        color="#ffb477"
        intensity={18}
        distance={9}
        decay={2}
      />
    </group>
  );
}

const SHIP_PATH = new THREE.CatmullRomCurve3([
  new THREE.Vector3(5, -1.5, 12),
  new THREE.Vector3(3, 0, 9),
  new THREE.Vector3(0, 0, 5),
  new THREE.Vector3(0, 0, -2),
  new THREE.Vector3(-3.5, -1.8, -9),
]);

export function Shuttle({ motion }) {
  const ship = useRef();
  const flame = useRef();
  const { scene } = useGLTF(`${BASE}models/kenney/craft-speeder.glb`);
  const model = useMemo(() => {
    const copy = scene.clone(true);
    const center = new THREE.Box3()
      .setFromObject(copy)
      .getCenter(new THREE.Vector3());
    copy.position.sub(center);
    copy.traverse((mesh) => {
      if (!mesh.isMesh) return;
      mesh.material = mesh.material.clone();
      mesh.material.metalness = 0.65;
      mesh.material.roughness = 0.3;
      if (mesh.material.name === "metalRed") mesh.material.color.set("#ba7649");
      if (mesh.material.name === "dark") {
        mesh.material.color.set("#1a3b50");
        mesh.material.metalness = 0.95;
        mesh.material.roughness = 0.12;
      }
    });
    return copy;
  }, [scene]);
  const target = useMemo(() => new THREE.Vector3(), []);
  const direction = useMemo(() => new THREE.Vector3(0, 0, -1), []);
  useEffect(
    () => () =>
      model.traverse((mesh) => {
        if (mesh.isMesh) mesh.material.dispose();
      }),
    [model],
  );
  useFrame(() => {
    if (!ship.current) return;
    const p = smoothRange(motion.current.progress, 0, 0.85);
    SHIP_PATH.getPoint(p, ship.current.position);
    SHIP_PATH.getTangent(Math.min(0.999, p), target);
    ship.current.quaternion.setFromUnitVectors(direction, target.normalize());
    if (flame.current) {
      flame.current.scale.y =
        p >= 1
          ? 0.01
          : 0.8 +
            Math.sin(motion.current.time * 23) * 0.12 +
            Math.sin(p * Math.PI) * 0.8;
    }
  });
  return (
    <group ref={ship} scale={0.8} name="approach-shuttle">
      <primitive object={model} dispose={null} />
      <group position={[0, 0, 0.95]} rotation={[Math.PI / 2, 0, 0]}>
        <group ref={flame}>
          {[-0.5, 0.5].map((x) => (
            <mesh key={x} position={[x, -0.8, 0]} rotation={[0, 0, Math.PI]}>
              <coneGeometry args={[0.15, 1.8, 12, 1, true]} />
              <meshBasicMaterial
                color={[0.2, 1.4, 2.4]}
                transparent
                opacity={0.55}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
                toneMapped={false}
              />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}
