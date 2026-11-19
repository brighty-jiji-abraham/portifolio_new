/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Component, Suspense, useCallback, useEffect, useRef, useState } from "react";
import OpenSpace from "./OpenSpace";
import BlackHole from "./BlackHole";
import BlackHoleCinema from "./BlackHoleCinema";
import SceneReflections from "./SceneReflections";
import NeuralSkills from "./NeuralSkills";
import EarthWorld from "./EarthWorld";
import { ProjectGallery, ContactEarth } from "./WorldModels";
import CareerConstellation from "./CareerConstellation";
import AstronautCamera from "./AstronautCamera";
import WorldInformation from "./WorldInformation";
import FlightDust from "./FlightDust";
import { MathUtils, WebGLRenderer } from "three";
import { spatialLayout } from "../journey/spatialLayout";
import { UNIVERSE_STOPS } from "../journey/destinations";
import "./Scene3D.css";
import { SceneQualityContext } from "./SceneQualityContext";
import useSceneQuality from "./useSceneQuality";
import AdaptiveQuality from "./AdaptiveQuality";

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

function Universe({
  journey: journeyRef,
  reducedMotion,
  paused,
  isLight,
  category,
  selected,
  onSelect,
  neuralPulse,
  networkReset,
  skyReset,
  onReady,
  project,
  onProject,
  milestone,
  onMilestone,
  signal,
  flight,
  information,
  cinema,
  cinemaActive,
}) {
  const world = useRef();
  const timeRef = useRef(0);
  const { size } = useThree();
  const informationScale = spatialLayout(
    UNIVERSE_STOPS[0],
    size.width,
    size.height,
  ).modelScale;
  useEffect(() => {
    onReady();
  }, [onReady]);
  useFrame((_, dt) => {
    if (!cinemaActive && !reducedMotion && !paused) timeRef.current += Math.min(dt, 0.1);
    const control = journeyRef.current.explorer;
    control.motionOff = cinemaActive ? !cinema || cinema.paused || cinema.reducedMotion : reducedMotion || paused;
    world.current.visible = control.reading !== "skills" && control.reading !== "experience";
    const approaching =
      control.travel?.id === "about" && control.travel.progress > 0.55;
    const target =
      control.reading === "about" || approaching ? informationScale : 1;
    world.current.scale.setScalar(
      reducedMotion
        ? target
        : MathUtils.damp(world.current.scale.x, target, 5, Math.min(dt, 0.1)),
    );
  }, -1);
  return (
    <>
      <ambientLight intensity={isLight ? 0.9 : 0.28} />
      <directionalLight position={[-8.5, 4.5, 5.5]} intensity={3.2} color="#fff1df" />
      <pointLight position={[-4, -1, 3]} intensity={3} color="#7ebfd3" />
      <OpenSpace isLight={isLight} timeRef={timeRef} />
      <Suspense fallback={null}><SceneReflections /></Suspense>
      <Suspense fallback={null}><BlackHole timeRef={timeRef} cinemaActive={cinemaActive} /></Suspense>
      {cinema && <BlackHoleCinema {...cinema} timeRef={timeRef} />}
      <AstronautCamera
        flight={flight}
        reducedMotion={reducedMotion || paused}
        disabled={cinemaActive}
      />
      <FlightDust flight={flight} isLight={isLight} />
      {information && <WorldInformation {...information} isLight={isLight} />}
      <ProjectGallery
        journey={journeyRef}
        timeRef={timeRef}
        selected={project}
        onSelect={onProject}
        isLight={isLight}
      />
      <CareerConstellation
        journey={journeyRef}
        timeRef={timeRef}
        selected={milestone}
        onSelect={onMilestone}
        isLight={isLight}
        reset={skyReset}
      />
      <Suspense fallback={null}>
        <ContactEarth
          journey={journeyRef}
          timeRef={timeRef}
          signal={signal}
          isLight={isLight}
          reducedMotion={reducedMotion}
        />
      </Suspense>
      <NeuralSkills
        key={category}
        timeRef={timeRef}
        journey={journeyRef}
        category={category}
        selected={selected}
        onSelect={onSelect}
        pulse={neuralPulse}
        reset={networkReset}
        isLight={isLight}
      />
      <group ref={world} name="tech-universe">
        <EarthWorld timeRef={timeRef} isLight={isLight} />
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
    console.warn("The portfolio scene is unavailable:", error.message);
    this.props.onFailure();
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

function supportsWebGL() {
  // Canvas creates the actual context; createRenderer handles driver failures.
  // A throwaway context here duplicates GPU initialization on every page load.
  return typeof window.WebGL2RenderingContext !== "undefined";
}

function visibleIntersections(intersections) {
  return intersections.filter(({ object }) => {
    for (let parent = object; parent; parent = parent.parent) {
      if (!parent.visible) return false;
    }
    return true;
  });
}

export default function Scene3D({ onFailure, cinemaActive = false, cinema = null, qualityMode = "auto", ...props }) {
  const theme = useTheme();
  const quality = useSceneQuality(qualityMode, cinemaActive);
  const createRenderer = useCallback((defaults) => {
    try {
      const renderer = new WebGLRenderer({
        ...defaults, antialias: true, alpha: true, powerPreference: "high-performance",
      });
      // Driver diagnostic reads synchronize shader compilation. Keep them in
      // development; production renders the same shaders without those stalls.
      renderer.debug.checkShaderErrors = import.meta.env.DEV;
      return renderer;
    } catch (error) {
      console.warn("The portfolio renderer is unavailable:", error.message);
      onFailure();
      // Fiber accepts an async renderer. The text fallback unmounts this Canvas;
      // leave configuration suspended instead of rejecting its async setup.
      return new Promise(() => {});
    }
  }, [onFailure]);
  const [supported] = useState(supportsWebGL);
  useEffect(() => {
    if (!supported) onFailure();
  }, [supported, onFailure]);
  const [visible, setVisible] = useState(() => !document.hidden);
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  return (
    <SceneQualityContext.Provider value={quality.value}>
    <div className="scene-3d" aria-hidden="true" data-quality={quality.level} data-textures={quality.textureTier}>
      {supported && (
        <WebGLErrorBoundary onFailure={onFailure}>
          <Canvas
            onCreated={({ setEvents }) => setEvents({ filter: visibleIntersections })}
            dpr={quality.dpr}
            frameloop={visible && (!cinemaActive || (cinema && !cinema.paused && !cinema.reducedMotion)) ? "always" : "demand"}
            gl={createRenderer}
            camera={{ position: [0, 0, 20], fov: 55, near: 0.1, far: 650 }}
          >
            <ContextEvents />
            <AdaptiveQuality level={quality.level} onLevel={quality.reportLevel}
              automatic={qualityMode === "auto"}
              enabled={visible && !(cinemaActive ? !cinema || cinema.paused || cinema.reducedMotion : props.paused || props.reducedMotion)} />
            <Universe {...props} cinema={cinema} cinemaActive={cinemaActive} isLight={theme === "light"} />
          </Canvas>
        </WebGLErrorBoundary>
      )}
    </div>
    </SceneQualityContext.Provider>
  );
}
