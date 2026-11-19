// Small, original Foley-like gestures. No files, long loops or independent clocks.
const tone = (frequency, end, duration, level, offset = 0, type = "sine") => ({
  frequency,
  end,
  duration,
  level,
  offset,
  type,
});
const noise = (frequency, end, duration, level) => ({
  frequency,
  end,
  duration,
  level,
  noise: true,
});

const SOUNDS = {
  send: [tone(440, 660, 0.16, 0.018)],
  reply: [tone(660, 660, 0.18, 0.014), tone(880, 880, 0.2, 0.01, 0.075)],
  paper: [noise(1200, 650, 0.18, 0.026)],
  type: [
    tone(360, 220, 0.045, 0.018, 0, "triangle"),
    tone(460, 280, 0.045, 0.013, 0.075, "triangle"),
  ],
  pulse: [tone(175, 110, 0.21, 0.025)],
  relay: [tone(520, 390, 0.09, 0.019)],
  scan: [tone(260, 520, 0.32, 0.012), noise(850, 1400, 0.3, 0.008)],
  confirm: [
    tone(523.25, 523.25, 0.2, 0.014),
    tone(659.25, 659.25, 0.24, 0.012, 0.085),
  ],
  land: [
    tone(210, 105, 0.11, 0.027, 0, "triangle"),
    noise(950, 480, 0.055, 0.018),
  ],
  capture: [
    tone(170, 80, 0.17, 0.029, 0, "triangle"),
    tone(300, 150, 0.08, 0.014, 0.09),
  ],
  orbit: [tone(392, 523.25, 0.42, 0.012), noise(700, 1000, 0.4, 0.009)],
  open: [noise(520, 270, 0.3, 0.026), tone(165, 220, 0.28, 0.012)],
  celebrate: [
    tone(523.25, 523.25, 0.34, 0.014),
    tone(659.25, 659.25, 0.34, 0.011, 0.09),
    tone(783.99, 783.99, 0.4, 0.009, 0.18),
  ],
};

export function createProjectEffects(context, destination, noiseBuffer) {
  const voices = new Set();
  let disposed = false;

  const cancel = (voice, immediate = false) => {
    if (voice.cancelled && !immediate) return;
    voice.cancelled = true;
    const now = context.currentTime,
      end = now + (immediate ? 0 : 0.025);
    voice.bus.gain.cancelScheduledValues(now);
    voice.bus.gain.setValueAtTime(voice.bus.gain.value, now);
    voice.bus.gain.linearRampToValueAtTime(0, end);
    for (const source of voice.sources) source.stop(end);
    if (immediate) voice.clean();
  };

  return {
    play({ kind, strength = 1, pan = 0 }) {
      const layers = SOUNDS[kind];
      if (
        disposed ||
        !layers ||
        voices.size >= 4 ||
        !Number.isFinite(strength) ||
        !Number.isFinite(pan)
      )
        return false;
      const now = context.currentTime;
      const bus = context.createGain(),
        panner = context.createStereoPanner();
      bus.gain.value = Math.max(0, Math.min(1, strength));
      panner.pan.value = Math.max(-0.45, Math.min(0.45, pan));
      bus.connect(panner);
      panner.connect(destination);
      const voice = {
        bus,
        nodes: new Set([bus, panner]),
        sources: new Set(),
        cancelled: false,
      };
      voice.clean = () => {
        for (const node of voice.nodes) node.disconnect();
        voice.nodes.clear();
        voices.delete(voice);
      };
      voices.add(voice);
      for (const layer of layers) {
        const start = now + (layer.offset || 0),
          end = start + layer.duration;
        const envelope = context.createGain();
        voice.nodes.add(envelope);
        envelope.connect(bus);
        envelope.gain.setValueAtTime(0, start);
        envelope.gain.linearRampToValueAtTime(
          layer.level,
          start + Math.min(0.018, layer.duration * 0.16),
        );
        envelope.gain.exponentialRampToValueAtTime(0.00001, end);
        envelope.gain.linearRampToValueAtTime(0, end + 0.01);
        let source;
        if (layer.noise) {
          source = context.createBufferSource();
          source.buffer = noiseBuffer;
          const filter = context.createBiquadFilter();
          voice.nodes.add(filter);
          filter.type = "bandpass";
          filter.Q.value = 0.65;
          filter.frequency.setValueAtTime(layer.frequency, start);
          filter.frequency.exponentialRampToValueAtTime(layer.end, end);
          source.connect(filter);
          filter.connect(envelope);
        } else {
          source = context.createOscillator();
          source.type = layer.type;
          source.frequency.setValueAtTime(layer.frequency, start);
          source.frequency.exponentialRampToValueAtTime(layer.end, end);
          source.connect(envelope);
        }
        voice.nodes.add(source);
        voice.sources.add(source);
        source.onended = () => {
          source.disconnect();
          voice.sources.delete(source);
          if (!voice.sources.size) voice.clean();
        };
        source.start(start);
        source.stop(end + 0.02);
      }
      return true;
    },
    stop() {
      for (const voice of voices) cancel(voice);
    },
    dispose() {
      disposed = true;
      for (const voice of voices) cancel(voice, true);
    },
  };
}
