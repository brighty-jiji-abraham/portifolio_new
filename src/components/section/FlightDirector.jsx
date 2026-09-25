import { useState } from "react";
import {
  FiArrowUpRight,
  FiPause,
  FiPlay,
  FiRotateCcw,
  FiZap,
} from "react-icons/fi";
import { useSectionFlight } from "../../hooks/useSectionFlight";
import "./SectionFlight.css";

const WAYPOINTS = [
  { id: "skills", name: "Skills" },
  { id: "projects", name: "Work" },
  { id: "experience", name: "Journey" },
  { id: "contact", name: "Contact" },
];

export default function FlightDirector({ reducedMotion, orbitRef }) {
  const [cinematic, setCinematic] = useState(true);
  const [status, setStatus] = useState({
    id: "about",
    title: "Home planet",
    phase: "cruising",
    visited: [],
    replaying: false,
  });
  const enabled = cinematic && !reducedMotion;
  const controls = useSectionFlight({ enabled, orbitRef, onStatus: setStatus });
  const incoming = status.arriving;

  return (
    <>
      <div className="flight-cinema" aria-hidden="true">
        <div className="flight-letterbox flight-letterbox-top" />
        <div className="flight-letterbox flight-letterbox-bottom" />
        <div className="flight-speed-lines">
          {Array.from({ length: 8 }, (_, i) => (
            <i key={i} style={{ "--trail": i }} />
          ))}
        </div>
        <span className="cinema-reticle reticle-left" />
        <span className="cinema-reticle reticle-right" />
      </div>
      <aside
        className={`flight-console ${incoming ? "is-incoming" : ""} ${status.boosted ? "is-boosted" : ""}`}
        aria-label="Space journey controls"
      >
        <div className="flight-console-top">
          <span className="flight-console-beacon" aria-hidden="true">
            <FiArrowUpRight />
          </span>
          <div className="flight-readout" role="status" aria-live="polite">
            <span>
              {status.boosted
                ? "Boost engaged"
                : status.replaying
                  ? "Replaying arrival"
                  : incoming
                    ? "Arriving in orbit"
                    : status.id === "about"
                      ? "Scroll to launch"
                      : "Orbit reached"}
            </span>
            <strong>{status.title}</strong>
          </div>
          <div className="flight-console-actions">
            <button
              type="button"
              onClick={() => controls.current?.boost()}
              disabled={!enabled}
              aria-label="Boost rocket engines"
              title="Boost rocket engines"
            >
              <FiZap />
            </button>
            <button
              type="button"
              onClick={() => controls.current?.replay()}
              disabled={!enabled}
              aria-label="Replay section arrival"
              title="Replay arrival"
            >
              <FiRotateCcw />
            </button>
            <button
              type="button"
              onClick={() => setCinematic((value) => !value)}
              disabled={reducedMotion}
              aria-pressed={enabled}
              aria-label={
                enabled
                  ? "Turn off cinematic scroll"
                  : "Turn on cinematic scroll"
              }
              title={enabled ? "Cinematic scroll on" : "Cinematic scroll off"}
            >
              {enabled ? <FiPause /> : <FiPlay />}
            </button>
            <button
              className="flight-next"
              type="button"
              onClick={() => controls.current?.next()}
              aria-label={
                status.id === "contact"
                  ? "Return to home planet"
                  : "Launch to next section"
              }
              title={
                status.id === "contact"
                  ? "Back to home"
                  : "Launch to next section"
              }
            >
              <FiArrowUpRight />
            </button>
          </div>
        </div>
        <nav className="flight-checkpoints" aria-label="Journey checkpoints">
          {WAYPOINTS.map(({ id, name }) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={status.id === id ? "location" : undefined}
              className={`${status.id === id ? "is-current" : ""} ${status.visited.includes(id) ? "is-visited" : ""}`}
            >
              <span aria-hidden="true" />
              {name}
            </a>
          ))}
        </nav>
      </aside>
    </>
  );
}
