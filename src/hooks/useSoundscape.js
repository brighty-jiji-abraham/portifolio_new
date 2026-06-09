import { useState, useCallback, useEffect } from 'react';

// Global audio state
let bgMusic = null;
let audioCtx = null;
let masterGain = null;
let isInitialized = false;
let globalMuted = true;

export function initAudio() {
    if (isInitialized) return;
    
    try {
        // 1. Setup the background music using HTML5 Audio
        // It expects a file named 'bg-music.m4a' in your public folder!
        bgMusic = new Audio(import.meta.env.BASE_URL + 'bg-music.m4a');
        bgMusic.loop = true;
        bgMusic.volume = 0; // Start faded out
        bgMusic.play().catch(e => console.warn('Background music play blocked by browser:', e));

        // 2. Setup Web Audio API just for the very soft UI hover ticks
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            audioCtx = new AudioContext();
            masterGain = audioCtx.createGain();
            masterGain.connect(audioCtx.destination);
            masterGain.gain.value = 0; 
        }

        isInitialized = true;
    } catch (e) {
        console.warn('Audio initialization failed', e);
    }
}

export function playTick() {
    if (!isInitialized || globalMuted || !audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    // Very soft, organic wooden/glass tap instead of a harsh synth
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.03);

    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
}

export function updateDrone(p) {
    if (!isInitialized || !bgMusic) return;
    // We can't modulate pitch easily with HTML5 audio without distortion,
    // but we can gently adjust volume based on scroll if desired.
    // For natural music, keeping it at a steady volume is usually best.
}

let subscribers = [];

export function useSoundscape() {
    const [muted, setMuted] = useState(globalMuted);

    useEffect(() => {
        subscribers.push(setMuted);
        return () => {
            subscribers = subscribers.filter(s => s !== setMuted);
        };
    }, []);

    const toggleMute = useCallback(() => {
        if (!isInitialized) {
            initAudio();
        }
        
        globalMuted = !globalMuted;
        subscribers.forEach(s => s(globalMuted));
        
        // Fade music in/out
        if (bgMusic) {
            bgMusic.volume = globalMuted ? 0 : 0.4;
        }

        // Mute UI ticks
        if (audioCtx && masterGain) {
            if (audioCtx.state === 'suspended') audioCtx.resume();
            masterGain.gain.setTargetAtTime(globalMuted ? 0 : 1.0, audioCtx.currentTime, 0.1);
        }
    }, []);

    return { muted, toggleMute };
}
