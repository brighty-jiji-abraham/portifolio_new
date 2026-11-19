import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import useSceneQuality from "./useSceneQuality";
import { playProjectCue, stopProjectSounds } from "../../hooks/useSoundscape";
import "./Scene3D.css";

const MainThreadScene = lazy(() => import("./Scene3D"));
const eventNames = ["click", "contextmenu", "dblclick", "wheel", "pointerdown", "pointerup",
  "pointerleave", "pointermove", "pointercancel", "lostpointercapture"];
const eventFields = ["pointerId", "pointerType", "button", "buttons", "clientX", "clientY",
  "offsetX", "offsetY", "ctrlKey", "shiftKey", "altKey", "metaKey", "deltaX", "deltaY", "deltaMode"];
const seekIds = new WeakMap();
let nextSeekId = 0;

function canUseWorker() {
  return typeof Worker !== "undefined" && typeof OffscreenCanvas !== "undefined"
    && typeof createImageBitmap === "function" && !!HTMLCanvasElement.prototype.transferControlToOffscreen;
}

function sceneSnapshot(props, quality, visible, theme) {
  const { reducedMotion, paused, category, selected, neuralPulse, networkReset, skyReset,
    project, milestone, signal, cinemaActive, information, ready, qualityMode } = props;
  if (props.cinema && !seekIds.has(props.cinema.seek)) seekIds.set(props.cinema.seek, ++nextSeekId);
  return { reducedMotion, paused, category, selected, neuralPulse, networkReset, skyReset,
    project, milestone, signal, cinemaActive, ready, qualityMode,
    isLight: theme === "light", visible, quality: quality.value, dpr: quality.dpr,
    information: information && { id: information.id, inspection: information.inspection,
      stop: information.stop, layout: information.layout, size: information.size },
    cinema: props.cinema && { paused: props.cinema.paused, reducedMotion: props.cinema.reducedMotion,
      seek: props.cinema.seek, seekId: seekIds.get(props.cinema.seek) },
  };
}

// Main-thread DOM, audio and preferences remain responsive while the original
// scene renders in a worker. Unsupported browsers use the same scene locally.
export default function WorkerScene(props) {
  const [fallback, setFallback] = useState(() => !canUseWorker());
  const [visible, setVisible] = useState(() => !document.hidden);
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || "dark");
  const quality = useSceneQuality(props.qualityMode || "auto", props.cinemaActive);
  const host = useRef(null);
  const workerRef = useRef(null);
  const latest = useRef(null);
  useLayoutEffect(() => { latest.current = { props, quality, visible, theme }; });
  useEffect(() => {
    const visibility = () => setVisible(!document.hidden);
    const observer = new MutationObserver(() => setTheme(document.documentElement.dataset.theme || "dark"));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    document.addEventListener("visibilitychange", visibility);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", visibility); };
  }, []);

  useEffect(() => {
    if (fallback) return;
    let alive = true;
    let frame;
    let worker;
    // A new canvas per effect also supports React StrictMode's setup/cleanup.
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "width:100%;height:100%;touch-action:none";
    host.current.appendChild(canvas);
    const fail = error => {
      error?.preventDefault?.();
      if (!alive) return;
      console.warn("Background rendering unavailable; using the local renderer.", error?.message || error);
      setFallback(true);
    };
    const post = (message, transfers) => { if (alive) worker?.postMessage(message, transfers || []); };
    const project = data => {
      const view = latest.current.props.information?.projectionRef.current;
      if (!view) return;
      view.connected = true;
      if (view.screen) Object.assign(view.screen.style, data.screen);
      if (view.camera) Object.assign(view.camera.style, data.camera);
      if (view.object) Object.assign(view.object.style, data.object);
    };
    const decodeIcon = async data => {
      try {
        const image = new Image();
        image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(data.svg)}`;
        await image.decode();
        const bitmap = await createImageBitmap(image, {
          imageOrientation: "flipY", premultiplyAlpha: "none", colorSpaceConversion: "none",
        });
        if (!alive) { bitmap.close(); return; }
        post({ type: "icon", id: data.id, bitmap }, [bitmap]);
      } catch (error) { post({ type: "icon", id: data.id, error: error.message }); }
    };
    const receive = ({ data }) => {
      if (!alive) return;
      const current = latest.current;
      switch (data.type) {
        case "ready": current.props.onReady(); break;
        case "failure": fail(data.error); break;
        case "projection": project(data); break;
        case "level": current.quality.reportLevel(data.level); break;
        case "bandwidth": current.quality.reportBandwidth(data.mbps); break;
        case "inspect": current.props.flight.current.onInspect?.(data.id); break;
        case "dismiss": current.props.flight.current.dismissInformation?.(data.options); break;
        case "report": current.props.flight.current.report?.(data.report); break;
        case "select":
          current.props.flight.current.dragged = data.dragged;
          current.props[data.callback]?.(data.value);
          break;
        case "cinema-progress": current.props.cinema?.onProgress(data.value); break;
        case "cinema-ready": current.props.cinema?.onReady(); break;
        case "project-cue": playProjectCue(data.cue); break;
        case "stop-project-sounds": stopProjectSounds(); break;
        case "cursor": document.body.style.cursor = data.cursor; break;
        case "blur-panel":
          if (document.activeElement?.closest(".spatial-panel")) document.activeElement.blur();
          break;
        case "icon": void decodeIcon(data); break;
      }
    };
    const forward = event => {
      if (event.type === "pointerdown") {
        latest.current.props.flight.current.dragged = false;
        canvas.setPointerCapture(event.pointerId);
      }
      if (event.type === "contextmenu" || event.type === "wheel") event.preventDefault();
      post({ type: "event", name: event.type,
        event: Object.fromEntries(eventFields.map(key => [key, event[key]])) });
    };
    const blur = () => post({ type: "blur" });
    const resize = () => post({ type: "size", width: host.current.clientWidth, height: host.current.clientHeight });
    const observer = new ResizeObserver(resize);
    try {
      worker = new Worker(new URL("./scene.worker.js", import.meta.url), { type: "module", name: "portfolio-universe" });
      workerRef.current = worker;
      worker.addEventListener("message", receive);
      worker.addEventListener("error", fail);
      const offscreen = canvas.transferControlToOffscreen();
      const current = latest.current;
      post({ type: "init", canvas: offscreen, width: host.current.clientWidth, height: host.current.clientHeight,
        props: sceneSnapshot(current.props, current.quality, current.visible, current.theme) }, [offscreen]);
      eventNames.forEach(name => canvas.addEventListener(name, forward, { passive: false }));
      window.addEventListener("blur", blur);
      observer.observe(host.current);
      // Mutable keyboard/touch controls change outside React. Send only changes;
      // pointer movement and the camera simulation stay entirely in the worker.
      let previous = "", previousCommand;
      let commandId = 0;
      const controls = () => {
        const control = latest.current.props.flight.current;
        if (previousCommand !== control.command) { previousCommand = control.command; commandId++; }
        const state = { enabled: control.enabled, session: control.session, start: control.start,
          reading: control.reading, keys: [...control.keys], command: control.command, commandId };
        const encoded = JSON.stringify(state);
        if (encoded !== previous) { post({ type: "controls", state }); previous = encoded; }
        frame = requestAnimationFrame(controls);
      };
      controls();
    } catch (error) { fail(error); }
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("blur", blur);
      eventNames.forEach(name => canvas.removeEventListener(name, forward));
      worker?.terminate();
      workerRef.current = null;
      canvas.remove();
      const view = latest.current.props.information?.projectionRef.current;
      if (view) view.connected = false;
      document.body.style.cursor = "";
      stopProjectSounds();
    };
  }, [fallback]);

  useEffect(() => {
    if (!fallback) workerRef.current?.postMessage({ type: "props", props: sceneSnapshot(props, quality, visible, theme) });
  }, [fallback, props, quality, visible, theme]);

  if (fallback) return <Suspense fallback={null}><MainThreadScene {...props} /></Suspense>;
  return <div ref={host} className="scene-3d" aria-hidden="true" data-renderer="worker"
    data-quality={quality.level} data-textures={quality.textureTier} />;
}
