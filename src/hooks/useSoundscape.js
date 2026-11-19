import { useEffect, useSyncExternalStore } from "react";
import { createCosmicAudio } from "../audio/cosmicAudio";

let runtime = null;
let muted = true;
let universe = { cinematic: false, paused: false, atmosphere: true };
let journey = { ready: false, paused: false, progress: 0 };
const listeners = new Set();
const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener) => { listeners.add(listener); return () => listeners.delete(listener); };
const getMuted = () => muted;
const getServerMuted = () => true;
const VOLUME_KEY = "portfolio-sound-volumes";
const DEFAULT_VOLUMES = { universe: 1, blackHole: 1 };
const normalizeVolume = (value) => Math.min(1, Math.max(0, value));
function readVolumes() {
  try {
    const saved = JSON.parse(localStorage.getItem(VOLUME_KEY));
    return Object.fromEntries(Object.entries(DEFAULT_VOLUMES).map(([key, fallback]) => [
      key, Number.isFinite(saved?.[key]) ? normalizeVolume(saved[key]) : fallback,
    ]));
  } catch {
    return DEFAULT_VOLUMES;
  }
}
let volumes = readVolumes();
const getVolumes = () => volumes;
const getServerVolumes = () => DEFAULT_VOLUMES;

function syncAudio() {
  if (!runtime) return;
  const current = runtime;
  const { context, graph, music } = current;
  const volume = universe.cinematic ? volumes.blackHole : volumes.universe;
  const audible = !muted && volume > 0 && !document.hidden && (universe.cinematic
    ? journey.ready && !journey.paused && journey.progress < 1
    : !universe.paused);
  graph.setMix({ ...universe, progress: journey.progress, universeVolume: volumes.universe, blackHoleVolume: volumes.blackHole });
  const projectsAudible = audible && !universe.cinematic && !!universe.projects;
  if (projectsAudible !== current.projectsAudible) {
    current.projectsAudible = projectsAudible;
    if (!projectsAudible) graph.stopProjectCues();
  }

  if (audible !== current.audible) {
    current.audible = audible;
    clearTimeout(current.suspendTimer);
    graph.setAudible(audible);
    if (audible) {
      // Called synchronously from the sound button on first use.
      context.resume().catch(() => {
        if (runtime !== current || !current.audible) return;
        muted = true;
        emit();
        syncAudio();
      });
    } else {
      current.suspendTimer = setTimeout(() => {
        if (!current.audible) context.suspend().catch(() => {});
      }, 500);
    }
  }
  const wantsMusic = audible && !universe.cinematic;
  if (wantsMusic !== current.wantsMusic) {
    current.wantsMusic = wantsMusic;
    clearTimeout(current.musicTimer);
    if (wantsMusic) {
      // A failed/unsupported music file must not disable the procedural effects.
      music.play().catch(() => {});
    } else {
      current.musicTimer = setTimeout(() => music.pause(), universe.cinematic ? 1000 : 450);
    }
  }
}

export function initAudio() {
  if (runtime) return runtime;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  let context;
  try {
    context = new AudioContext();
    const graph = createCosmicAudio(context);
    const music = new Audio(import.meta.env.BASE_URL + "bg-music.m4a");
    music.loop = true;
    music.preload = "none";
    const musicSource = context.createMediaElementSource(music);
    musicSource.connect(graph.musicInput);
    runtime = { context, graph, music, musicSource, audible: null, wantsMusic: false };
    return runtime;
  } catch {
    context?.close().catch(() => {});
    return null;
  }
}

function toggleMute() {
  if (muted && !initAudio()) return;
  muted = !muted;
  emit();
  syncAudio();
}

function setVolume(channel, value) {
  if (!Object.hasOwn(DEFAULT_VOLUMES, channel) || !Number.isFinite(value)) return;
  volumes = { ...volumes, [channel]: normalizeVolume(value) };
  try { localStorage.setItem(VOLUME_KEY, JSON.stringify(volumes)); } catch { /* Optional persistence. */ }
  emit();
  syncAudio();
}

export function setUniverseAudio(state) {
  universe = state;
  syncAudio();
}

export function setJourneyAudio(state) {
  journey = state;
  syncAudio();
}

export function clearJourneyAudio() {
  journey = { ready: false, paused: false, progress: 0 };
  syncAudio();
}

export function playTick() {
  if (!muted && runtime?.audible && !universe.cinematic) runtime.graph.playTick(volumes.universe);
}

export function playProjectCue(cue) {
  if (muted || !runtime?.projectsAudible || document.hidden || runtime.context.state !== "running") return false;
  return runtime.graph.playProjectCue(cue);
}

export function stopProjectSounds() {
  runtime?.graph.stopProjectCues();
}

function disposeAudio() {
  if (!runtime) return;
  const current = runtime;
  runtime = null;
  clearTimeout(current.suspendTimer);
  clearTimeout(current.musicTimer);
  current.music.pause();
  current.music.removeAttribute("src");
  current.music.load();
  current.musicSource.disconnect();
  current.graph.dispose();
  current.context.close().catch(() => {});
  muted = true;
  emit();
}

export function useSoundscape() {
  const soundMuted = useSyncExternalStore(subscribe, getMuted, getServerMuted);
  const soundVolumes = useSyncExternalStore(subscribe, getVolumes, getServerVolumes);
  useEffect(() => {
    document.addEventListener("visibilitychange", syncAudio);
    return () => {
      document.removeEventListener("visibilitychange", syncAudio);
      disposeAudio();
    };
  }, []);
  return {
    muted: soundMuted,
    toggleMute,
    volumes: soundVolumes,
    setVolume,
    soundSupported: !!(window.AudioContext || window.webkitAudioContext),
  };
}
