const clamp = (value) => Math.min(1, Math.max(0, value));
const smoothstep = (start, end, value) => {
  const t = clamp((value - start) / (end - start));
  return t * t * (3 - 2 * t);
};

// Original, procedural sound design. The same graph works in an OfflineAudioContext.
export function createCosmicAudio(context) {
  const nodes = new Set();
  const sources = new Set();
  const targets = new WeakMap();
  const own = (node) => { nodes.add(node); return node; };
  const gain = (value, destination) => {
    const node = own(context.createGain());
    node.gain.value = value;
    node.connect(destination);
    return node;
  };
  const filter = (type, frequency, destination) => {
    const node = own(context.createBiquadFilter());
    node.type = type;
    node.frequency.value = frequency;
    node.Q.value = 0.65;
    node.connect(destination);
    return node;
  };
  const start = (source) => {
    sources.add(source);
    source.start();
    return source;
  };
  const tone = (frequency, destination) => {
    const node = own(context.createOscillator());
    node.type = "sine";
    node.frequency.value = frequency;
    node.connect(destination);
    return start(node);
  };
  const glide = (parameter, value, seconds = 0.18) => {
    if (targets.get(parameter) === value) return;
    targets.set(parameter, value);
    const now = context.currentTime;
    if (parameter.cancelAndHoldAtTime) parameter.cancelAndHoldAtTime(now);
    else {
      parameter.cancelScheduledValues(now);
      parameter.setValueAtTime(parameter.value, now);
    }
    parameter.setTargetAtTime(value, now, seconds);
  };

  const compressor = own(context.createDynamicsCompressor());
  compressor.threshold.value = -12;
  compressor.knee.value = 18;
  compressor.ratio.value = 6;
  compressor.attack.value = 0.006;
  compressor.release.value = 0.3;
  compressor.connect(context.destination);
  const master = gain(0, compressor);
  const ambient = gain(0, master);
  const journey = gain(0, master);
  const musicInput = gain(0, master);

  // Deterministic stereo noise, generated once after the visitor enables sound.
  const length = Math.ceil(context.sampleRate * 6);
  const brown = context.createBuffer(2, length, context.sampleRate);
  const white = context.createBuffer(2, length, context.sampleRate);
  let seed = 271828;
  for (let channel = 0; channel < 2; channel += 1) {
    const low = brown.getChannelData(channel);
    const air = white.getChannelData(channel);
    let previous = 0;
    for (let i = 0; i < length; i += 1) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const random = seed / 2147483648 - 1;
      previous = (previous + random * 0.018) / 1.018;
      low[i] = previous * 3.5;
      air[i] = random;
    }
    // Bring the low-frequency loop back to its opening value without a click.
    const seam = Math.floor(context.sampleRate * 0.04);
    for (let i = 0; i < seam; i += 1) {
      const t = smoothstep(0, seam - 1, i);
      low[length - seam + i] = low[length - seam + i] * (1 - t) + low[0] * t;
    }
  }
  const noise = (buffer, destination) => {
    const node = own(context.createBufferSource());
    node.buffer = buffer;
    node.loop = true;
    node.connect(destination);
    return start(node);
  };

  const ambientNoise = gain(0.09, ambient);
  noise(brown, filter("highpass", 28, filter("lowpass", 180, ambientNoise)));
  tone(55, gain(0.024, ambient));
  tone(55.12, gain(0.016, ambient));
  tone(82.41, gain(0.009, ambient));

  const rumble = gain(0.16, journey);
  const rumbleFilter = filter("lowpass", 100, rumble);
  noise(brown, filter("highpass", 24, rumbleFilter));
  const bass = gain(0.07, journey);
  const harmonic = gain(0.025, journey);
  const overtone = gain(0.008, journey);
  const bassTone = tone(50, bass);
  const harmonicTone = tone(100.16, harmonic);
  const overtoneTone = tone(149.9, overtone);
  // Slow pressure changes add movement without sharp impacts or sudden peaks.
  tone(0.11, gain(0.045, rumble.gain));

  const air = gain(0.008, journey);
  const pan = own(context.createStereoPanner());
  pan.connect(air);
  tone(0.075, gain(0.45, pan.pan));
  const airFilter = filter("lowpass", 500, pan);
  noise(white, filter("highpass", 180, airFilter));

  return {
    musicInput,
    setAudible(audible) {
      glide(master.gain, audible ? 0.55 : 0, audible ? 0.2 : 0.055);
    },
    setMix({ cinematic, progress = 0, atmosphere = true, universeVolume = 1, blackHoleVolume = 1 }) {
      const p = clamp(Number.isFinite(progress) ? progress : 0);
      const proximity = smoothstep(0.05, 0.94, p) ** 1.35;
      const descent = smoothstep(0.12, 0.96, p);
      const horizonFade = 1 - smoothstep(0.945, 1, p);
      const frequency = 50 - 21 * proximity;
      glide(ambient.gain, !cinematic && atmosphere ? clamp(universeVolume) : 0, 0.12);
      glide(musicInput.gain, cinematic ? 0 : 0.28 * clamp(universeVolume), 0.12);
      glide(journey.gain, cinematic ? horizonFade * clamp(blackHoleVolume) : 0, 0.12);
      glide(rumble.gain, 0.16 + 0.95 * proximity);
      glide(rumbleFilter.frequency, 100 + 130 * proximity);
      glide(bass.gain, 0.07 + 0.2 * proximity);
      glide(harmonic.gain, 0.025 + 0.085 * proximity);
      glide(overtone.gain, 0.008 + 0.025 * proximity);
      glide(bassTone.frequency, frequency);
      glide(harmonicTone.frequency, frequency * 2 + 0.16);
      glide(overtoneTone.frequency, frequency * 3 - 0.1);
      glide(air.gain, 0.008 + 0.18 * descent ** 1.7);
      glide(airFilter.frequency, 500 + 2100 * descent);
    },
    playTick(volume = 1) {
      const now = context.currentTime;
      const envelope = gain(0, master);
      const oscillator = own(context.createOscillator());
      oscillator.frequency.setValueAtTime(600, now);
      oscillator.frequency.exponentialRampToValueAtTime(300, now + 0.03);
      envelope.gain.linearRampToValueAtTime(0.035 * clamp(volume), now + 0.005);
      envelope.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
      oscillator.connect(envelope);
      oscillator.onended = () => {
        oscillator.disconnect();
        envelope.disconnect();
        sources.delete(oscillator);
        nodes.delete(oscillator);
        nodes.delete(envelope);
      };
      start(oscillator);
      oscillator.stop(now + 0.07);
    },
    dispose() {
      for (const source of sources) source.stop();
      for (const node of nodes) node.disconnect();
      sources.clear();
      nodes.clear();
    },
  };
}
