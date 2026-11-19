/* eslint-disable react-refresh/only-export-components -- Worker entry has no DOM Fast Refresh root. */
import { Component, startTransition, Suspense } from "react";
import { createRoot, events, extend, flushSync, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Universe from "./Universe";
import StartupRenderer from "./StartupRenderer";
import AdaptiveQuality from "./AdaptiveQuality";
import { SceneQualityContext } from "./SceneQualityContext";
import { SceneEffectsContext } from "./SceneEffectsContext";
import { receiveIconBitmap } from "./scenePlatform";
import { measuredBandwidth, networkTier } from "./qualityPolicy";

extend(THREE);
const send = message => globalThis.postMessage(message);
const effects = {
  playProjectCue: cue => send({ type: "project-cue", cue }),
  stopProjectSounds: () => send({ type: "stop-project-sounds" }),
};
const cinemaCallbacks = {
  onProgress: value => send({ type: "cinema-progress", value }),
  onReady: () => send({ type: "cinema-ready" }),
};
const ready = () => send({ type: "ready" });
const reportLevel = level => send({ type: "level", level });

class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { send({ type: "failure", error: error.message }); }
  render() { return this.state.failed ? null : this.props.children; }
}

function ProjectionBridge({ projectionRef }) {
  useFrame(() => {
    const view = projectionRef.current;
    const data = JSON.stringify([view.screen.style, view.camera.style, view.object.style]);
    if (data === view.sent) return;
    view.sent = data;
    send({ type: "projection", screen: view.screen.style, camera: view.camera.style, object: view.object.style });
  }, 2);
  return null;
}

export async function startSceneWorker({ canvas, width, height, props: initial }) {
  canvas.style = {};
  canvas.setPointerCapture = () => {};
  canvas.releasePointerCapture = () => {};
  canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width, height });
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.debug.checkShaderErrors = import.meta.env.DEV;
  const root = createRoot(canvas);
  let lastReport;
  const control = { enabled: false, keys: new Set(), lookX: 0, lookY: 0, dragged: false,
    onInspect: id => { control.reading = id; control.keys.clear(); send({ type: "inspect", id }); },
    dismissInformation: options => { control.reading = null; send({ type: "dismiss", options }); },
    report: report => {
      const encoded = JSON.stringify(report);
      if (encoded === lastReport) return;
      lastReport = encoded;
      send({ type: "report", report });
    },
  };
  const callbacks = Object.fromEntries(["onSelect", "onProject", "onMilestone"].map(callback => [
    callback, value => send({ type: "select", callback, value, dragged: control.dragged }),
  ]));
  const flight = { current: control };
  const journey = { current: { exploring: true, active: true, progress: 0, location: 0, explorer: control } };
  const projectionRef = { current: { screen: { style: {} }, camera: { style: {} }, object: { style: {} } } };
  let props = initial;
  let store;
  let seek;
  let seekId;
  let previousCommandId;
  await root.configure({ gl: renderer, events, dpr: props.dpr,
    size: { width, height, top: 0, left: 0 }, camera: { position: [0, 0, 20], fov: 55, near: 0.1, far: 650 },
    onCreated: state => {
      store = state;
      state.setEvents({ filter: hits => hits.filter(({ object }) => {
        for (let parent = object; parent; parent = parent.parent) if (!parent.visible) return false;
        return true;
      }) });
    },
  });
  const render = () => {
    if (props.cinema && seekId !== props.cinema.seekId) {
      seek = props.cinema.seek;
      seekId = props.cinema.seekId;
    }
    if (!props.cinema) { seek = null; seekId = null; }
    const cinema = props.cinema && { ...props.cinema, seek, ...cinemaCallbacks };
    const cinematicMoving = props.cinemaActive ? cinema && !cinema.paused && !cinema.reducedMotion : true;
    store?.setFrameloop(props.visible && cinematicMoving ? "always" : "demand");
    store?.setDpr(props.dpr);
    root.render(
      <SceneBoundary>
        <SceneQualityContext.Provider value={props.quality}>
          <SceneEffectsContext.Provider value={effects}>
            <Suspense fallback={null}>
              <StartupRenderer onReady={ready} />
              <AdaptiveQuality level={props.quality.level} onLevel={reportLevel} automatic={props.qualityMode === "auto"}
                enabled={props.ready && props.visible && (props.cinemaActive ? cinematicMoving : !props.paused && !props.reducedMotion)} />
              <Universe {...props} {...callbacks} flight={flight} journey={journey} cinema={cinema}
                information={props.information && { ...props.information, projectionRef }} />
              <ProjectionBridge projectionRef={projectionRef} />
            </Suspense>
          </SceneEffectsContext.Provider>
        </SceneQualityContext.Provider>
      </SceneBoundary>,
    );
    store?.invalidate();
  };
  render();
  // Worker transfers are absent from the page's Resource Timing timeline.
  // Report real download bandwidth so browsers without connection hints can
  // still upgrade to the original maps; never run a separate speed test.
  if (typeof PerformanceObserver !== "undefined") {
    let reportedTier;
    const observer = new PerformanceObserver(() => {
      const mbps = measuredBandwidth(performance.getEntriesByType("resource"));
      const tier = mbps && networkTier({}, mbps);
      if (!tier || tier === reportedTier) return;
      reportedTier = tier;
      send({ type: "bandwidth", mbps });
    });
    observer.observe({ type: "resource", buffered: true });
  }
  canvas.addEventListener("webglcontextlost", event => event.preventDefault());
  canvas.addEventListener("webglcontextrestored", () => store?.invalidate());
  return data => {
    switch (data.type) {
      case "props": {
        const loadingMaps = Object.entries(data.props.quality.textures)
          .some(([key, url]) => url !== props.quality.textures[key]);
        props = data.props;
        // Only map downloads may defer a scene commit. Camera destinations,
        // theme and pause/seek controls should reach the very next frame.
        if (loadingMaps) startTransition(render);
        else flushSync(render);
        break;
      }
      case "size":
        width = data.width; height = data.height;
        store?.setSize(width, height); store?.invalidate();
        break;
      case "controls": {
        const { keys, command, commandId, ...state } = data.state;
        Object.assign(control, state);
        control.keys = new Set(keys);
        if (commandId !== previousCommandId) { control.command = command; previousCommandId = commandId; }
        store?.invalidate();
        break;
      }
      case "event": {
        const event = new Event(data.name, { cancelable: true });
        Object.assign(event, data.event);
        canvas.dispatchEvent(event);
        store?.invalidate();
        break;
      }
      case "blur": globalThis.dispatchEvent(new Event("blur")); break;
      case "icon": receiveIconBitmap(data); break;
    }
  };
}
