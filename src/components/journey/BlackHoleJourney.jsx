import { useCallback, useEffect, useRef, useState } from "react";
import { FiArrowLeft, FiPause, FiPlay, FiRotateCcw } from "react-icons/fi";
import { BLACK_HOLE_DURATION } from "../scene/blackHoleFlight";
import { clearJourneyAudio, setJourneyAudio } from "../../hooks/useSoundscape";
import SoundToggle from "./SoundToggle";
import "./BlackHoleJourney.css";

const CHAPTERS = [
  { until: 4, label: "Departure", title: "Leaving the familiar.", text: "A journey toward the edge of light." },
  { until: 10, label: "Approach", title: "The universe bends.", text: "Starlight curves around the dark." },
  { until: 17, label: "Close pass", title: "At the edge of light.", text: "An ocean of hot gas. A perfectly dark heart." },
  { until: 21, label: "Descent", title: "Into the unknown.", text: "The horizon fills your view." },
  { until: Infinity, label: "Beyond", title: "Some things pull you closer.", text: "Back to the worlds that brought us here." },
];

export default function BlackHoleJourney({ onClose, reducedMotion, initiallyPaused, settings, onFlightChange }) {
  const dialog = useRef();
  const returnButton = useRef();
  const [paused, setPaused] = useState(initiallyPaused);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(() => !document.hidden);
  const [elapsed, setElapsed] = useState(0);
  const [seek, setSeek] = useState(() => ({ position: 0 }));
  const ended = elapsed >= BLACK_HOLE_DURATION;
  const chapter = CHAPTERS.findIndex((item) => elapsed < item.until);
  const content = CHAPTERS[chapter];
  const onReady = useCallback(() => setReady(true), []);
  useEffect(() => {
    onFlightChange({ seek, paused: paused || !visible || ended, reducedMotion, onProgress: setElapsed, onReady });
  }, [seek, paused, visible, ended, reducedMotion, onReady, onFlightChange]);
  useEffect(() => () => onFlightChange(null), [onFlightChange]);
  useEffect(() => {
    setJourneyAudio({ ready, paused: paused || !visible, progress: elapsed / BLACK_HOLE_DURATION });
  }, [elapsed, paused, ready, visible]);
  useEffect(() => clearJourneyAudio, []);
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    returnButton.current.focus();
    return () => element.close();
  }, []);
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  const moveTo = (position) => {
    setElapsed(position);
    setSeek({ position });
  };
  const replay = () => {
    moveTo(0);
    setPaused(false);
  };
  const handleKeys = (event) => {
    event.stopPropagation();
    if (event.key !== "Tab") return;
    const controls = dialog.current.querySelectorAll("button:not(:disabled), input:not(:disabled)");
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  return (
    <dialog ref={dialog} className="black-hole-journey" aria-label="Black hole journey"
      data-phase={content.label.toLowerCase().replace(" ", "-")}
      data-elapsed={elapsed.toFixed(2)}
      data-light-departure={settings.theme === "light" && elapsed < 3.8}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onKeyDown={handleKeys}>
      <div className="black-hole-cinema" aria-hidden="true" style={{ opacity: Math.min(1, elapsed / 4) }} />
      <div className="black-hole-horizon-fade" aria-hidden="true" style={{ opacity: Math.max(0, Math.min(1, (elapsed - 20.8) / 1.2)) }} />
      <header className="black-hole-header">
        <span className="black-hole-wordmark"><span aria-hidden="true">✧</span> Brighty <span>/ Deep space</span></span>
        <div className="black-hole-actions">
          <SoundToggle settings={settings} />
          {reducedMotion ? <span className="black-hole-still">Still mode</span> : (
            <button onClick={ended ? replay : () => setPaused(value => !value)} disabled={!ready}
              aria-label={ended ? "Replay black hole journey" : paused ? "Resume black hole journey" : "Pause black hole journey"}>
              {ended ? <FiRotateCcw /> : paused ? <FiPlay /> : <FiPause />}
              <span>{ended ? "Replay" : paused ? "Resume" : "Pause"}</span>
            </button>
          )}
          <button ref={returnButton} onClick={onClose} aria-label="Return to portfolio">
            <FiArrowLeft /><span>Return</span>
          </button>
        </div>
      </header>
      <footer className="black-hole-caption">
        <p className="black-hole-chapter" role="status">{ready ? `${String(chapter + 1).padStart(2, "0")} / ${content.label}` : "Preparing the flight"}</p>
        <h1>{content.title}</h1>
        <p className="black-hole-description">{reducedMotion ? "Move along the timeline to explore at your own pace." : content.text}</p>
        <div className="black-hole-timeline">
          <input type="range" min="0" max={BLACK_HOLE_DURATION} step="0.01" value={elapsed}
            disabled={!ready} aria-label="Journey position" aria-valuetext={`${Math.floor(elapsed)} seconds, ${content.label}`}
            onChange={(event) => moveTo(Number(event.target.value))}
            style={{ "--journey-progress": `${elapsed / BLACK_HOLE_DURATION * 100}%` }} />
          <div><span>Deep space</span><span>{`${String(Math.floor(elapsed)).padStart(2, "0")} / ${BLACK_HOLE_DURATION} SEC`}</span><span>Event horizon</span></div>
        </div>
      </footer>
    </dialog>
  );
}
