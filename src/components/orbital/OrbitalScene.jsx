/* eslint-disable react/no-unknown-property */
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { Earth, Shuttle, StarField, Station } from "./OrbitalWorld";
import RetrievalExhibit from "./RetrievalExhibit";
import { smoothRange } from "./mission";

const CAMERA_PATH = new THREE.CatmullRomCurve3(
  [
    [18, 9, 32],
    [14, 6.5, 26],
    [8, 3.6, 19],
    [3, 1.5, 13],
    [0.4, 0.3, 7],
    [0, 0, 2],
    [0, 0, -3],
    [2.5, 1.2, -6],
  ].map((position) => new THREE.Vector3(...position)),
);
const TARGET_PATH = new THREE.CatmullRomCurve3(
  [
    [-6, 0, -3],
    [-2, 0, -2],
    [0, 0, -2],
    [0, 0, -3],
    [0, 0, -5],
    [0, 0, -8],
    [0, 0, -11],
    [0.3, 0.1, -12.8],
  ].map((position) => new THREE.Vector3(...position)),
);

function CameraRig({ motion, reducedMotion, mode, revision }) {
  const { size, invalidate } = useThree();
  const targetRef = useRef(new THREE.Vector3());
  useEffect(() => {
    invalidate();
  }, [mode, revision, invalidate]);
  useFrame(({ camera }) => {
    const target = targetRef.current;
    const p = motion.current.progress;
    const t = p * p * p * (p * (p * 6 - 15) + 10);
    CAMERA_PATH.getPoint(t, camera.position);
    TARGET_PATH.getPoint(t, target);
    const mobile = size.width < 760;
    if (mobile) {
      const orbit = 1 - Math.min(1, p * 3);
      camera.position.z += orbit * 14;
      camera.position.x -= p * 1.7;
      target.x += orbit * 5.5 - p * 1.25;
      target.y += orbit * 6 + p * 0.85;
    }
    if (!reducedMotion && mode === "orbit") {
      camera.position.x += Math.sin(motion.current.time * 0.1) * 0.24;
      camera.position.y += Math.sin(motion.current.time * 0.14) * 0.12;
    }
    camera.lookAt(target);
    camera.rotateZ(Math.sin(p * Math.PI) * Math.sin(p * Math.PI * 2) * 0.055);
    camera.fov = 43 + Math.sin(p * Math.PI) * 9 + (mobile ? p * 16 : 0);
    camera.updateProjectionMatrix();
  }, -1);
  return null;
}

function Lighting({ motion }) {
  const { gl, get } = useThree();
  const key = useRef();
  const fill = useRef();
  useEffect(() => {
    const { scene } = get();
    const generator = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const target = generator.fromScene(room, 0.04);
    scene.environment = target.texture;
    scene.environmentIntensity = 0.28;
    room.dispose();
    generator.dispose();
    return () => {
      scene.environment = null;
      target.dispose();
    };
  }, [gl, get]);
  useFrame(() => {
    const inside = smoothRange(motion.current.progress, 0.6, 0.9);
    key.current.intensity = 2.8 * (1 - inside * 0.95);
    fill.current.intensity = 1.2 * (1 - inside * 0.8);
  });
  return (
    <>
      <ambientLight intensity={0.17} color="#94bcd4" />
      <directionalLight
        ref={key}
        position={[-20, 25, 30]}
        intensity={2.8}
        color="#fff0d7"
      />
      <directionalLight
        ref={fill}
        position={[0, -12, -20]}
        intensity={1.2}
        color="#548dcc"
      />
    </>
  );
}

function CinematicRender({ bloom }) {
  const { gl, scene, camera, size } = useThree();
  const composer = useMemo(() => {
    if (!bloom) return null;
    const effect = new EffectComposer(gl);
    effect.addPass(new RenderPass(scene, camera));
    effect.addPass(
      new UnrealBloomPass(new THREE.Vector2(1, 1), 0.38, 0.55, 1.15),
    );
    effect.addPass(new OutputPass());
    return effect;
  }, [gl, scene, camera, bloom]);
  useEffect(() => {
    composer?.setPixelRatio(gl.getPixelRatio());
    composer?.setSize(size.width, size.height);
  }, [composer, gl, size]);
  useEffect(
    () => () => {
      composer?.passes.forEach((pass) => pass.dispose?.());
      composer?.dispose();
    },
    [composer],
  );
  useFrame((_, delta) => {
    if (composer) composer.render(delta);
    else gl.render(scene, camera);
  }, 1);
  return null;
}

function Ready({ onReady }) {
  useEffect(() => {
    onReady();
  }, [onReady]);
  return null;
}

function FrameBudget({ quality, onSlow }) {
  const sample = useRef({ seconds: 0, frames: 0, reported: false });
  useFrame((_, delta) => {
    const current = sample.current;
    if (quality !== "high" || current.reported || delta > 1) return;
    current.seconds += delta;
    current.frames += 1;
    if (current.seconds > 5) {
      current.reported = true;
      if (current.frames / current.seconds < 28) onSlow();
    }
  });
  return null;
}

function World({
  motion,
  mode,
  reducedMotion,
  finish,
  query,
  source,
  onSelect,
  onReady,
  onSlow,
  quality,
  revision,
}) {
  const { invalidate, gl } = useThree();
  useEffect(() => {
    invalidate();
  }, [finish, source, query, revision, invalidate]);
  useEffect(() => {
    const handleLost = (event) => event.preventDefault();
    const handleRestored = () => invalidate();
    gl.domElement.addEventListener("webglcontextlost", handleLost);
    gl.domElement.addEventListener("webglcontextrestored", handleRestored);
    return () => {
      gl.domElement.removeEventListener("webglcontextlost", handleLost);
      gl.domElement.removeEventListener("webglcontextrestored", handleRestored);
    };
  }, [gl, invalidate]);
  return (
    <>
      <color attach="background" args={["#030710"]} />
      <CameraRig
        motion={motion}
        mode={mode}
        reducedMotion={reducedMotion}
        revision={revision}
      />
      <Lighting motion={motion} />
      <StarField />
      <Earth motion={motion} />
      <Station motion={motion} finish={finish} />
      <Shuttle motion={motion} />
      <RetrievalExhibit
        motion={motion}
        query={query}
        source={source}
        onSelect={onSelect}
        interactive={mode === "lab"}
      />
      <CinematicRender bloom={quality === "high"} />
      <FrameBudget quality={quality} onSlow={onSlow} />
      <Ready onReady={onReady} />
    </>
  );
}

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2");
    if (!context) return false;
    context.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export default function OrbitalScene({
  active,
  paused,
  reducedMotion,
  quality,
  onFailure,
  ...props
}) {
  const [supported] = useState(supportsWebGL);
  useEffect(() => {
    if (!supported) onFailure();
  }, [supported, onFailure]);
  if (!supported) {
    return (
      <div className="orbital-canvas-fallback">
        The interactive 3D view is unavailable. You can still explore the project.
      </div>
    );
  }
  return (
    <Canvas
      camera={{ position: [18, 9, 32], fov: 43, near: 0.08, far: 600 }}
      dpr={quality === "high" ? [1, 1.5] : 1}
      frameloop={active && !paused && !reducedMotion ? "always" : "demand"}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
      fallback={
        <div className="orbital-canvas-fallback">
          The interactive 3D view is unavailable. You can still explore the
          project.
        </div>
      }
      style={{ touchAction: "pan-y" }}
    >
      <Suspense fallback={null}>
        <World {...props} reducedMotion={reducedMotion} quality={quality} />
      </Suspense>
    </Canvas>
  );
}
