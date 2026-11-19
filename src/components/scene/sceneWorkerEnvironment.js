// Fiber chooses layout-effect subscriptions through window.document. Workers
// are live renderers too: frame callbacks must detach with their mesh refs,
// rather than waiting for a passive effect as they would during server render.
// Keep global document absent so loaders continue to use worker-safe bitmaps.
globalThis.window = {
  document: { createElement: () => new OffscreenCanvas(1, 1) },
  addEventListener: globalThis.addEventListener.bind(globalThis),
  removeEventListener: globalThis.removeEventListener.bind(globalThis),
  dispatchEvent: globalThis.dispatchEvent.bind(globalThis),
};
if (import.meta.env.DEV) {
  // Vite's unshaken development imports include React DOM feature detection.
  // No DOM is rendered here; these inert probes only support those imports.
  globalThis.document = {
    createElement: () => ({ style: {}, setAttribute() {} }),
    querySelector: () => null,
    querySelectorAll: () => [],
  };
  globalThis.window = globalThis;
  globalThis.$RefreshReg$ = () => {};
  globalThis.$RefreshSig$ = () => type => type;
}
