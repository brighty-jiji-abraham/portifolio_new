/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Component, Suspense, useEffect, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FaReact, FaPython, FaAws, FaNodeJs } from "react-icons/fa";
import {
  SiPytorch,
  SiTensorflow,
  SiDocker,
  SiOpenai,
  SiMongodb,
  SiRedis,
  SiTypescript,
  SiAnthropic,
  SiKubernetes,
  SiLangchain,
  SiPostgresql,
  SiGraphql,
  SiNextdotjs,
  SiVuedotjs,
  SiTailwindcss,
  SiLinux,
} from "react-icons/si";
import * as THREE from "three";
import SpaceObjects from "./SpaceObjects";
import "./Scene3D.css";

const TECH = [
  { Icon: FaPython, color: "#ffce3e" },
  { Icon: FaReact, color: "#61dafb" },
  { Icon: SiOpenai, color: "#77d5b3" },
  { Icon: SiPytorch, color: "#ff7561" },
  { Icon: SiDocker, color: "#54baff" },
  { Icon: SiAnthropic, color: "#edb391" },
  { Icon: FaNodeJs, color: "#8bd66d" },
  { Icon: SiTensorflow, color: "#ffa64e" },
  { Icon: SiMongodb, color: "#73bf67" },
  { Icon: FaAws, color: "#ffbc65" },
  { Icon: SiTypescript, color: "#69a6ff" },
  { Icon: SiRedis, color: "#ff7474" },
  { Icon: SiKubernetes, color: "#739bff" },
  { Icon: SiLangchain, color: "#83d8d2" },
  { Icon: SiPostgresql, color: "#72a7d0" },
  { Icon: SiGraphql, color: "#f16ccc" },
  { Icon: SiNextdotjs, color: "#ffffff", lightColor: "#302118" },
  { Icon: SiVuedotjs, color: "#69cfaa" },
  { Icon: SiTailwindcss, color: "#38bdf8" },
  { Icon: SiLinux, color: "#fcc624" },
];
const ORBITS = [
  {
    radius: 2.35,
    rotation: [0.9, 0.25, -0.25],
    color: "#dba57c",
    speed: 0.13,
    phase: 0,
  },
  {
    radius: 2.6,
    rotation: [-0.65, -0.35, 0.45],
    color: "#82c9c2",
    speed: -0.09,
    phase: 0.45,
  },
  {
    radius: 2.85,
    rotation: [0.4, 1.05, -0.4],
    color: "#b6a2db",
    speed: 0.065,
    phase: 0.9,
  },
  {
    radius: 3.05,
    rotation: [1.2, -0.5, 0.7],
    color: "#8bb8e5",
    speed: -0.075,
    phase: 1.35,
  },
  {
    radius: 3.25,
    rotation: [-0.35, 0.7, -0.65],
    color: "#dda1c9",
    speed: 0.085,
    phase: 1.8,
  },
];

function useTheme() {
  const [theme, setTheme] = useState(
    () => document.documentElement.dataset.theme || "dark",
  );
  useEffect(() => {
    const observer = new MutationObserver(() =>
      setTheme(document.documentElement.dataset.theme || "dark"),
    );
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);
  return theme;
}

function useIconTexture(Icon, color) {
  const [texture, setTexture] = useState(null);
  useEffect(() => {
    const svg = renderToStaticMarkup(<Icon />)
      .replace(/currentColor/g, color)
      .replace(/width="1em"/, 'width="128"')
      .replace(/height="1em"/, 'height="128"');
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    let disposed = false;
    const loaded = new THREE.TextureLoader().load(url, (map) => {
      URL.revokeObjectURL(url);
      if (disposed) return;
      map.colorSpace = THREE.SRGBColorSpace;
      setTexture(map);
    });
    return () => {
      disposed = true;
      URL.revokeObjectURL(url);
      loaded.dispose();
    };
  }, [Icon, color]);
  return texture;
}

function Earth({ timeRef, isLight }) {
  const globe = useRef();
  const clouds = useRef();
  const base = import.meta.env.BASE_URL;
  const [color, normal, specular, cloud] = useTexture(
    [
      `${base}textures/earth_color.jpg`,
      `${base}textures/earth_normal.jpg`,
      `${base}textures/earth_specular.jpg`,
      `${base}textures/earth_clouds.png`,
    ],
    (maps) => {
      // Only color maps contain sRGB color data; normal/specular are linear data.
      maps[0].colorSpace = THREE.SRGBColorSpace;
      maps[3].colorSpace = THREE.SRGBColorSpace;
      maps.forEach((map) => {
        map.anisotropy = 4;
      });
    },
  );
  useFrame(() => {
    if (globe.current)
      globe.current.rotation.y = 3.45 + timeRef.current * 0.055;
    if (clouds.current)
      clouds.current.rotation.y = 3.45 + timeRef.current * 0.068;
  });
  return (
    <group rotation={[0.12, 0, -0.18]} scale={1.22}>
      <mesh ref={globe}>
        <sphereGeometry args={[1.58, 64, 48]} />
        <meshPhongMaterial
          map={color}
          normalMap={normal}
          normalScale={[0.5, 0.5]}
          specularMap={specular}
          specular="#263f47"
          shininess={24}
        />
      </mesh>
      <mesh ref={clouds}>
        <sphereGeometry args={[1.6, 48, 32]} />
        <meshPhongMaterial
          map={cloud}
          transparent
          opacity={0.27}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.67, 48, 32]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          uniforms={{
            color: { value: new THREE.Color(isLight ? "#5888a8" : "#82d8e5") },
          }}
          vertexShader={`varying vec3 vNormal; varying vec3 vView;
                        void main() { vec4 pos = modelViewMatrix * vec4(position, 1.0);
                        vNormal = normalize(normalMatrix * normal); vView = normalize(-pos.xyz);
                        gl_Position = projectionMatrix * pos; }`}
          fragmentShader={`varying vec3 vNormal; varying vec3 vView; uniform vec3 color;
                        void main() { float glow = pow(clamp(0.62 + dot(normalize(vNormal), normalize(vView)), 0.0, 1.0), 3.0);
                        gl_FragColor = vec4(color, glow * 0.7); }`}
        />
      </mesh>
    </group>
  );
}

function Satellite({ item, index, orbit, timeRef, isLight }) {
  const sprite = useRef();
  const texture = useIconTexture(
    item.Icon,
    isLight ? item.lightColor || item.color : item.color,
  );
  useFrame(() => {
    if (!sprite.current) return;
    const angle =
      (index * Math.PI) / 2 + orbit.phase + timeRef.current * orbit.speed;
    sprite.current.position.set(
      Math.cos(angle) * orbit.radius,
      Math.sin(angle) * orbit.radius,
      0,
    );
  });
  return (
    <sprite ref={sprite} scale={[0.38, 0.38, 0.38]}>
      <spriteMaterial
        key={texture?.uuid || "loading"}
        map={texture}
        transparent
        opacity={texture ? 0.95 : 0}
        depthTest
        depthWrite={false}
      />
    </sprite>
  );
}

function Asteroids({ timeRef }) {
  const belt = useRef();
  const rock = useRef(new THREE.Object3D());
  useFrame(() => {
    if (!belt.current) return;
    const t = timeRef.current;
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2 + t * 0.028;
      const radius = 3.55 + (i % 4) * 0.13;
      rock.current.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.74,
        Math.sin(angle + i * 0.8) * 0.9 - 0.5,
      );
      rock.current.rotation.set(i + t * 0.08, i * 0.7 + t * 0.12, i * 0.3);
      const size = 0.055 + (i % 4) * 0.022;
      rock.current.scale.set(size * 1.35, size, size * 0.8);
      rock.current.updateMatrix();
      belt.current.setMatrixAt(i, rock.current.matrix);
    }
    belt.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh
      ref={belt}
      args={[null, null, 14]}
      name="asteroid-belt"
      frustumCulled={false}
    >
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#988375" roughness={0.95} flatShading />
    </instancedMesh>
  );
}

function OrbitalRocket({ timeRef }) {
  const rocket = useRef();
  const flame = useRef();
  useFrame(() => {
    const t = timeRef.current;
    const angle = -2.3 + t * 0.075;
    if (rocket.current) {
      rocket.current.position.set(
        Math.cos(angle) * 3.65,
        Math.sin(angle) * 2.7,
        0.7,
      );
      rocket.current.rotation.z =
        Math.atan2(Math.cos(angle) * 2.7, -Math.sin(angle) * 3.65) -
        Math.PI / 2;
    }
    if (flame.current) flame.current.scale.y = 0.9 + Math.sin(t * 24) * 0.16;
  });
  return (
    <group ref={rocket} scale={0.62} name="orbital-rocket">
      <mesh>
        <cylinderGeometry args={[0.13, 0.15, 0.52, 16]} />
        <meshStandardMaterial
          color="#e4e8de"
          roughness={0.45}
          metalness={0.15}
        />
      </mesh>
      <mesh position={[0, 0.39, 0]}>
        <coneGeometry args={[0.13, 0.26, 16]} />
        <meshStandardMaterial color="#df8f63" roughness={0.45} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.15, -0.2, 0]}
          rotation={[0, 0, side * -0.35]}
        >
          <coneGeometry args={[0.11, 0.32, 3]} />
          <meshStandardMaterial color="#bd6b48" roughness={0.55} />
        </mesh>
      ))}
      <mesh position={[0, 0.07, 0.14]}>
        <circleGeometry args={[0.065, 16]} />
        <meshBasicMaterial color="#81d6e5" />
      </mesh>
      <mesh position={[0, 0.07, 0.14]}>
        <torusGeometry args={[0.069, 0.013, 8, 20]} />
        <meshStandardMaterial color="#617b85" metalness={0.4} roughness={0.4} />
      </mesh>
      <group ref={flame} position={[0, -0.27, 0]}>
        <mesh position={[0, -0.2, 0]} rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[0.115, 0.4, 12]} />
          <meshBasicMaterial
            color="#eea451"
            transparent
            opacity={0.8}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[0, -0.13, 0.06]} rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[0.065, 0.26, 12]} />
          <meshBasicMaterial color="#fff1b3" />
        </mesh>
      </group>
    </group>
  );
}

function Universe({
  scrollRef,
  mouseRef,
  orbitRef,
  reducedMotion,
  paused,
  isLight,
}) {
  const world = useRef();
  const timeRef = useRef(0);
  const layout = useRef({ x: 0, y: 0, width: 400 });
  const initialized = useRef(false);
  const { invalidate } = useThree();

  useEffect(() => {
    const target = document.getElementById("hero-world");
    if (!target) return;
    const measure = () => {
      const rect = target.getBoundingClientRect();
      layout.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + window.scrollY + rect.height / 2,
        width: rect.width,
      };
      invalidate();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(target);
    observer.observe(document.querySelector(".about"));
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", invalidate, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", invalidate);
    };
  }, [invalidate]);

  useFrame((state, dt) => {
    const delta = Math.min(dt, 0.05);
    const { departure, chapter, progress } = scrollRef.current;
    const pointer =
      reducedMotion || paused ? { nx: 0, ny: 0 } : mouseRef.current;
    if (!reducedMotion && !paused) {
      timeRef.current += delta * (1 + orbitRef.current.boost);
      orbitRef.current.boost = THREE.MathUtils.damp(
        orbitRef.current.boost,
        0,
        1.4,
        delta,
      );
    }
    if (!world.current) return;
    const { width, height } = state.viewport;
    const rect = layout.current;
    const transition = departure;
    const side = Math.cos((chapter - 1) * Math.PI) * 0.37;
    const x = (rect.x / state.size.width - 0.5) * width;
    const y = (0.5 - (rect.y - window.scrollY) / state.size.height) * height;
    const heroScale = ((rect.width / state.size.width) * width) / 6.3;
    // Grow continuously with the native page scroll, reaching 2.8x at the end.
    // The full orbit system scales together so satellites stay outside Earth.
    const scale = heroScale * (1 + progress * 1.8);
    const targetX =
      THREE.MathUtils.lerp(x, side * width, transition) + pointer.nx * 0.045;
    const targetY =
      THREE.MathUtils.lerp(y, -0.35, transition) - pointer.ny * 0.04;
    const alpha =
      reducedMotion || paused || !initialized.current
        ? 1
        : 1 - Math.exp(-9 * delta);
    world.current.position.x = THREE.MathUtils.lerp(
      world.current.position.x,
      targetX,
      alpha,
    );
    world.current.position.y = THREE.MathUtils.lerp(
      world.current.position.y,
      targetY,
      alpha,
    );
    world.current.scale.setScalar(
      THREE.MathUtils.lerp(world.current.scale.x, scale, alpha),
    );
    world.current.rotation.y = reducedMotion
      ? 0
      : chapter * 0.2 + pointer.nx * 0.05;
    initialized.current = true;
  });

  return (
    <>
      <ambientLight intensity={isLight ? 1.3 : 1.1} />
      <directionalLight position={[5, 4, 7]} intensity={2.2} color="#fff1df" />
      <pointLight position={[-4, -1, 3]} intensity={12} color="#7ebfd3" />
      <group ref={world} name="tech-universe">
        <Suspense
          fallback={
            <mesh scale={1.22}>
              <sphereGeometry args={[1.58, 32, 24]} />
              <meshPhongMaterial color="#31505c" />
            </mesh>
          }
        >
          <Earth timeRef={timeRef} isLight={isLight} />
        </Suspense>
        <Asteroids timeRef={timeRef} />
        <OrbitalRocket timeRef={timeRef} />
        <SpaceObjects timeRef={timeRef} />
        {ORBITS.map((orbit, ring) => (
          <group key={ring} rotation={orbit.rotation}>
            <mesh>
              <ringGeometry
                args={[orbit.radius - 0.005, orbit.radius + 0.005, 128]}
              />
              <meshBasicMaterial
                color={orbit.color}
                transparent
                opacity={isLight ? 0.36 : 0.25}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
            {TECH.slice(ring * 4, ring * 4 + 4).map((item, i) => (
              <Satellite
                key={i}
                item={item}
                index={i}
                orbit={orbit}
                timeRef={timeRef}
                isLight={isLight}
              />
            ))}
          </group>
        ))}
      </group>
    </>
  );
}

class WebGLErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    console.warn("The decorative 3D scene is unavailable:", error.message);
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

function ContextEvents() {
  const { gl, invalidate } = useThree();
  useEffect(() => {
    const lost = (event) => event.preventDefault();
    const restored = () => invalidate();
    gl.domElement.addEventListener("webglcontextlost", lost);
    gl.domElement.addEventListener("webglcontextrestored", restored);
    return () => {
      gl.domElement.removeEventListener("webglcontextlost", lost);
      gl.domElement.removeEventListener("webglcontextrestored", restored);
    };
  }, [gl, invalidate]);
  return null;
}

export default function Scene3D(props) {
  const theme = useTheme();
  const [visible, setVisible] = useState(() => !document.hidden);
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  return (
    <div className="scene-3d" aria-hidden="true">
      <WebGLErrorBoundary>
        <Canvas
          dpr={[1, 1.5]}
          frameloop={
            props.reducedMotion || props.paused || !visible
              ? "demand"
              : "always"
          }
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
          camera={{ position: [0, 0, 10], fov: 45 }}
          fallback={<div className="scene-fallback" />}
        >
          <ContextEvents />
          <Universe {...props} isLight={theme === "light"} />
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
}
