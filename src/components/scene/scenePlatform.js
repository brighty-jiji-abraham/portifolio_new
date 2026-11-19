// The same scene runs on the page or in an OffscreenCanvas worker. Keep the
// few DOM operations at this boundary; geometry, shaders and animation agree.
export const isSceneWorker = typeof document === "undefined" || typeof WorkerGlobalScope !== "undefined";

export function createSceneCanvas() {
  return isSceneWorker ? new OffscreenCanvas(1, 1) : document.createElement("canvas");
}

export function setSceneCursor(cursor) {
  if (isSceneWorker) globalThis.postMessage({ type: "cursor", cursor });
  else document.body.style.cursor = cursor;
}

export function blurScenePanel() {
  if (isSceneWorker) globalThis.postMessage({ type: "blur-panel" });
  else if (document.activeElement?.closest(".spatial-panel")) document.activeElement.blur();
}

let bitmapSequence = 0;
const bitmaps = new Map();
export function requestIconBitmap(svg) {
  const id = ++bitmapSequence;
  return new Promise((resolve, reject) => {
    bitmaps.set(id, { resolve, reject });
    globalThis.postMessage({ type: "icon", id, svg });
  });
}

export function receiveIconBitmap({ id, bitmap, error }) {
  const pending = bitmaps.get(id);
  bitmaps.delete(id);
  if (!pending) { bitmap?.close(); return; }
  if (error) pending.reject(new Error(error));
  else pending.resolve(bitmap);
}
