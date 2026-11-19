import { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import { universeTextureSets } from "../../assets/universe/textures";
import { initialRenderLevel, measuredBandwidth, networkTier, pixelRatioFor, renderLevel, textureTier } from "./qualityPolicy";

function connectionHints() {
  const connection = navigator.connection;
  return { saveData: connection?.saveData, downlink: connection?.downlink,
    effectiveType: connection?.effectiveType, rtt: connection?.rtt };
}

function viewport() {
  return { width: innerWidth, height: innerHeight, ratio: devicePixelRatio || 1 };
}

export default function useSceneQuality(mode, cinematic) {
  const [device] = useState(() => ({ cores: navigator.hardwareConcurrency || 0, memory: navigator.deviceMemory || 0 }));
  const [connection, setConnection] = useState(connectionHints);
  const [bandwidth, setBandwidth] = useState(() => measuredBandwidth(performance.getEntriesByType("resource")));
  const [automatic, setAutomatic] = useState(() => initialRenderLevel(device));
  const [size, setSize] = useState(viewport);
  const desiredTextures = textureTier(mode, connection, device, bandwidth);
  const [textures, setTextures] = useState(() => desiredTextures);
  const [flightTextures, setFlightTextures] = useState(null);
  if (cinematic && flightTextures === null) setFlightTextures(textures);
  if (!cinematic && flightTextures !== null) setFlightTextures(null);
  const activeTextures = cinematic ? flightTextures || textures : textures;
  const level = renderLevel(mode, automatic);
  const reportBandwidth = useCallback(measured => {
    if (!Number.isFinite(measured) || measured <= 0) return;
    setBandwidth(previous => !previous || networkTier({}, measured) !== networkTier({}, previous)
      ? measured : previous);
  }, []);

  useEffect(() => {
    const update = () => setConnection(connectionHints());
    navigator.connection?.addEventListener?.("change", update);
    return () => navigator.connection?.removeEventListener?.("change", update);
  }, []);
  useEffect(() => {
    const update = () => setSize(viewport());
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  useEffect(() => {
    // Actual transfers can reveal a slower link than the browser's estimate;
    // they also work when the optional Network Information API is unavailable.
    if (connection.saveData || typeof PerformanceObserver === "undefined") return;
    const update = () => {
      const measured = measuredBandwidth(performance.getEntriesByType("resource"));
      if (!measured) return;
      // Small bandwidth fluctuations within one tier do not change graphics.
      // Avoid reconciling the entire universe after every resource response.
      reportBandwidth(measured);
    };
    update();
    const observer = new PerformanceObserver(update);
    try { observer.observe({ type: "resource", buffered: true }); }
    catch { observer.disconnect(); return; }
    return () => observer.disconnect();
  }, [connection, reportBandwidth]);
  useEffect(() => {
    // Keep the exact sky and black-hole uniforms throughout an active flight.
    // A transition keeps the current scene visible while new texture maps load.
    const rank = { light: 0, balanced: 1, original: 2 };
    // An already downloaded detailed map costs no more data if Wi-Fi gets slow.
    // Auto upgrades when possible; it does not fetch lower-detail replacements.
    if (mode === "auto" && rank[desiredTextures] < rank[textures]) return;
    if (!cinematic) startTransition(() => setTextures(desiredTextures));
  }, [desiredTextures, cinematic, mode, textures]);
  const reportLevel = useCallback(next => setAutomatic(next), []);
  const value = useMemo(() => ({ textures: universeTextureSets[activeTextures], level,
    anisotropy: [2, 4, 8, 16][level] }), [activeTextures, level]);

  return { value, level, textureTier: activeTextures, reportLevel, reportBandwidth,
    dpr: pixelRatioFor(level, size.width, size.height, size.ratio) };
}
