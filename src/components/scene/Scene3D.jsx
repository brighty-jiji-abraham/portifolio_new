import Universe from "./Universe";
import { SceneEffectsContext } from "./SceneEffectsContext";
import { playProjectCue, stopProjectSounds } from "../../hooks/useSoundscape";
import { Canvas, useThree } from "@react-three/fiber";
import { Component, useCallback, useEffect, useState } from "react";
import { WebGLRenderer } from "three";
import "./Scene3D.css";
import { SceneQualityContext } from "./SceneQualityContext";
import useSceneQuality from "./useSceneQuality";
import AdaptiveQuality from "./AdaptiveQuality";
import StartupRenderer from "./StartupRenderer";

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

export default function Scene3D({ onReady, onFailure, ready = false, cinemaActive = false, cinema = null, qualityMode = "auto", ...props }) {
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
            <StartupRenderer onReady={onReady} />
            <AdaptiveQuality level={quality.level} onLevel={quality.reportLevel}
              automatic={qualityMode === "auto"}
              enabled={ready && visible && !(cinemaActive ? !cinema || cinema.paused || cinema.reducedMotion : props.paused || props.reducedMotion)} />
            <SceneEffectsContext.Provider value={{ playProjectCue, stopProjectSounds }}><Universe {...props} cinema={cinema} cinemaActive={cinemaActive} isLight={theme === "light"} /></SceneEffectsContext.Provider>
          </Canvas>
        </WebGLErrorBoundary>
      )}
    </div>
    </SceneQualityContext.Provider>
  );
}
