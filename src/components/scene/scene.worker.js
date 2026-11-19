// Prepare the rendering environment before the scene modules are evaluated.
// Static imports remove one network round trip from the worker's startup.
import "./sceneWorkerEnvironment";
import { startSceneWorker } from "./sceneWorkerRuntime.jsx";
import { measuredBandwidth } from "./qualityPolicy";

let receive;
let initial;
const pending = [];
globalThis.onmessage = async ({ data }) => {
  try {
    if (data.type === "init") {
      initial = data;
      // The engine transfer is a real bandwidth sample, available before any
      // texture request. Let the page choose one initial set from that sample.
      globalThis.postMessage({ type: "prepared", mbps: measuredBandwidth(performance.getEntriesByType("resource")) });
    } else if (data.type === "start") {
      const startupInput = pending.splice(0).filter(message => message.type !== "props");
      receive = await startSceneWorker({ ...initial, props: data.props });
      initial = null;
      // The start snapshot supersedes older React props. Preserve input and
      // resize messages received while loading, plus every newer update that
      // arrived while the renderer was being configured.
      startupInput.forEach(receive);
      pending.splice(0).forEach(receive);
    } else if (receive) receive(data);
    else pending.push(data);
  } catch (error) {
    globalThis.postMessage({ type: "failure", error: error.stack || error.message });
  }
};
globalThis.addEventListener("unhandledrejection", event => {
  globalThis.postMessage({ type: "failure", error: event.reason?.message || String(event.reason) });
});
