export const QUALITY_MODES = ["auto", "maximum", "balanced", "light"];

export function networkTier(connection = {}, measuredMbps = 0) {
  if (connection.saveData || ["slow-2g", "2g", "3g"].includes(connection.effectiveType)) return "light";
  const estimate = connection.downlink > 0 ? connection.downlink : 0;
  const speed = measuredMbps > 0 ? (estimate > 0 ? Math.min(estimate, measuredMbps) : measuredMbps) : estimate;
  if (speed > 0 && speed < 3) return "light";
  if (speed >= 8 && !(connection.rtt > 250)) return "original";
  return "balanced";
}

export function initialRenderLevel({ cores = 0, memory = 0 } = {}) {
  if ((memory > 0 && memory <= 2) || (cores > 0 && cores <= 2)) return 0;
  return cores >= 8 && memory >= 8 ? 2 : 1;
}

export function textureTier(mode, connection, device, measuredMbps = 0) {
  if (mode === "maximum") return "original";
  if (mode === "light") return "light";
  const network = networkTier(connection, measuredMbps);
  if (device.memory > 0 && device.memory <= 2) return "light";
  if (mode === "balanced") return network === "light" ? "light" : "balanced";
  return network;
}

export function renderLevel(mode, automatic) {
  return mode === "maximum" ? 3 : mode === "light" ? 0 : mode === "balanced" ? 1 : automatic;
}

export function pixelRatioFor(level, width, height, nativeRatio = 1) {
  const native = Math.max(1, nativeRatio || 1);
  const requested = [1, Math.min(native, 1.5), Math.min(native, 2), Math.max(1.5, Math.min(native, 3))][level];
  const pixelBudget = [1_500_000, 3_500_000, 6_000_000, 8_300_000][level];
  const budgetRatio = Math.sqrt(pixelBudget / Math.max(1, width * height));
  return Math.max(0.5, Math.min(requested, budgetRatio));
}

// Use only real, uncached resource transfers; no separate speed-test download.
export function measuredBandwidth(entries) {
  const transfers = entries.filter(entry => entry.transferSize > 0 && entry.encodedBodySize > 0 && entry.responseEnd > entry.responseStart);
  const bytes = transfers.reduce((total, entry) => total + entry.encodedBodySize, 0);
  if (bytes < 200_000 || !transfers.length) return 0;
  // Merge overlapping downloads rather than counting JS/GPU work or idle gaps
  // between requests as a slow connection.
  const intervals = transfers.map(entry => [entry.responseStart, entry.responseEnd]).sort((a, b) => a[0] - b[0]);
  let start = intervals[0][0], end = intervals[0][1], duration = 0;
  for (const [nextStart, nextEnd] of intervals.slice(1)) {
    if (nextStart <= end) end = Math.max(end, nextEnd);
    else { duration += end - start; start = nextStart; end = nextEnd; }
  }
  duration += end - start;
  return duration > 0 ? (bytes * 8) / (duration * 1000) : 0;
}

export function createFrameAssessment() {
  return { elapsed: 0, frames: 0, fast: 0, slow: 0, cooldown: 0 };
}

// Hysteresis: sustained smooth frames upgrade; sustained slow frames downgrade.
// A cooldown keeps a borderline device from alternating quality every few frames.
export function assessFrame(sample, delta, level, enabled = true) {
  if (!enabled || !Number.isFinite(delta) || delta <= 0) {
    Object.assign(sample, createFrameAssessment());
    return level;
  }
  if (sample.cooldown > 0) {
    sample.cooldown -= delta;
    return level;
  }
  sample.elapsed += Math.min(delta, 1);
  sample.frames++;
  if (sample.elapsed < 2.5 || sample.frames < 6) return level;
  const fps = sample.frames / sample.elapsed;
  sample.fast = fps >= 57 ? sample.fast + 1 : 0;
  sample.slow = fps < 38 ? sample.slow + 1 : 0;
  sample.elapsed = sample.frames = 0;
  const next = sample.slow >= 2 ? Math.max(0, level - 1)
    : sample.fast >= 3 ? Math.min(3, level + 1) : level;
  if (next !== level) Object.assign(sample, createFrameAssessment(), { cooldown: 5 });
  return next;
}
