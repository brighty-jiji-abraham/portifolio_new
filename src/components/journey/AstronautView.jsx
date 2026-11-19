import { useEffect, useRef, useState } from "react";
import {
  FiArrowDown,
  FiArrowLeft,
  FiArrowRight,
  FiArrowUp,
  FiCompass,
  FiCornerUpRight,
  FiPause,
  FiPlay,
  FiSun,
  FiMoon,
  FiMoreHorizontal,
  FiFileText,
} from "react-icons/fi";
import { UNIVERSE_STOPS } from "./destinations";
import SoundToggle from "./SoundToggle";
import "./AstronautView.css";

function Thruster({ flight: flightRef, code, label, children }) {
  return (
    <button
      aria-label={label}
      className="thruster"
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        flightRef.current.keys.add(code);
      }}
      onPointerUp={() => flightRef.current.keys.delete(code)}
      onPointerCancel={() => flightRef.current.keys.delete(code)}
      onLostPointerCapture={() => flightRef.current.keys.delete(code)}
      onKeyDown={(event) => {
        if ([" ", "Enter"].includes(event.key)) {
          event.preventDefault();
          flightRef.current.keys.add(code);
        }
      }}
      onKeyUp={(event) => {
        if ([" ", "Enter"].includes(event.key))
          flightRef.current.keys.delete(code);
      }}
      onBlur={() => flightRef.current.keys.delete(code)}
    >
      {children}
    </button>
  );
}

export default function AstronautView({
  flight: flightRef,
  onExit,
  onBlackHole,
  reducedMotion,
  inspection,
  onInspect,
  onPortal,
  settings,
  paused,
  onPause,
  ready,
}) {
  const options = useRef();
  const { theme, toggleTheme } = settings;
  const chooseOption = (action) => {
    options.current.open = false;
    action();
  };
  useEffect(() => {
    const close = (event) => {
      if (options.current && !options.current.contains(event.target))
        options.current.open = false;
    };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, []);
  const [telemetry, setTelemetry] = useState({
    nearest: inspection || UNIVERSE_STOPS[0].id,
    distance: 0,
    speed: 0,
    destination: null,
    position: [0, 0, 0],
  });
  const serial = useRef(0);
  useEffect(() => {
    const control = flightRef.current;
    control.report = setTelemetry;
    return () => {
      control.report = null;
    };
  }, [flightRef]);
  const go = (id) => {
    if (id === "stop")
      flightRef.current.command = { id, serial: ++serial.current };
    else onInspect(id, true);
  };
  const stop =
    UNIVERSE_STOPS.find(
      (entry) =>
        entry.id === (inspection || telemetry.destination || telemetry.nearest),
    ) || UNIVERSE_STOPS[0];
  return (
    <div
      className="astronaut-hud"
      role="region"
      aria-labelledby="astronaut-title"
      aria-describedby="astronaut-instructions"
      data-position={telemetry.position.join(",")}
      data-reading={!!inspection}
      data-traveling={!!telemetry.destination && !inspection}
    >
      <header className="astronaut-heading">
        <button
          className="universe-brand"
          onClick={() => onInspect("about", true)}
          aria-label="Brighty Jiji Abraham — Home"
          disabled={!ready}
        >
          <span className="astronaut-mark" aria-hidden="true">
            ✧
          </span>
          <span id="astronaut-title">Brighty<span className="universe-full-name"> Jiji Abraham</span></span>
        </button>
        <div className="universe-settings">
          <button className="black-hole-launch" onClick={onBlackHole} disabled={!ready}
            aria-label="Travel to the black hole" title="Travel to the black hole">
            <span className="black-hole-mark" aria-hidden="true" />
            <span className="black-hole-launch-label">Black hole</span>
          </button>
          <SoundToggle settings={settings} className="universe-sound" />
          <button
            className="universe-icon-button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          >
            {theme === "light" ? <FiMoon /> : <FiSun />}
          </button>
          <details
            ref={options}
            className="universe-options"
            onKeyDown={(event) => {
              if (event.key === "Escape" && options.current.open) {
                event.preventDefault();
                event.stopPropagation();
                options.current.open = false;
                options.current.querySelector("summary").focus();
              }
            }}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget))
                options.current.open = false;
            }}
          >
            <summary aria-label="Portfolio options" title="Portfolio options">
              <FiMoreHorizontal />
            </summary>
            <div className="universe-options-menu">
              <button
                onClick={() => chooseOption(onPause)}
                disabled={reducedMotion}
              >
                {paused || reducedMotion ? <FiPlay /> : <FiPause />}
                {reducedMotion
                  ? "Reduced motion enabled"
                  : paused
                    ? "Resume motion"
                    : "Pause motion"}
              </button>
              <button onClick={() => chooseOption(onExit)}>
                <FiFileText />
                Text view
              </button>
            </div>
          </details>
        </div>
      </header>
      <div className="flight-indicator" role="status">
        <span />
        {inspection
          ? `Exploring ${stop.label.toLowerCase()}`
          : telemetry.destination
            ? `Flying to ${stop.label.toLowerCase()}`
            : telemetry.speed > 0.8
              ? "Thrusters active"
              : "Free flight"}
      </div>
      {telemetry.destination && !inspection && (
        <div className="flight-caption" aria-hidden="true">
          <span>{telemetry.phase || "Departing"}</span>
          <strong key={stop.id}>{stop.caption || stop.title}</strong>
          <div className="flight-progress">
            <i style={{ transform: `scaleX(${telemetry.progress || 0})` }} />
          </div>
          <small>
            {stop.label}{" "}
            <span>
              {String(Math.round((telemetry.progress || 0) * 100)).padStart(
                2,
                "0",
              )}
              %
            </span>
          </small>
        </div>
      )}
      <nav className="universe-chart" aria-label="Guided flights">
        <p>
          <FiCompass /> Choose a destination
        </p>
        {UNIVERSE_STOPS.map((entry) => (
          <button
            key={entry.id}
            onClick={() => go(entry.id)}
            disabled={!ready}
            aria-label={`${reducedMotion ? "Go" : "Fly"} to ${entry.label.toLowerCase()}`}
            aria-pressed={
              entry.id ===
              (inspection || telemetry.destination || telemetry.nearest)
            }
            style={{ "--stop-color": entry.color }}
          >
            <span className="chart-star" />
            <span>{entry.label}</span>
          </button>
        ))}
      </nav>
      <div className="flight-reticle" aria-hidden="true">
        <span />
        <span />
      </div>
      <p className="mobile-look-hint">Drag to look · Hold the arrows to fly</p>
      <div className="astronaut-guidance">
        <p id="astronaut-instructions">
          <strong>Drag space to look around.</strong>
          <span className="desktop-flight-help">
            W A S D to fly · Q / E down / up
            <br />
            Shift to boost · Arrow keys to look · Esc to stop
          </span>
          <span className="touch-flight-help">
            Hold the arrows to fly. Choose a star for a guided flight.
          </span>
        </p>
        <button className="flight-brake" onClick={() => go("stop")}>
          <FiPause /> Stop flight
        </button>
      </div>
      <section className="universe-discovery" aria-label="Nearest destination">
        <small>
          {telemetry.destination
            ? "On the way"
            : telemetry.distance < 24
              ? "Within reach"
              : "Nearest destination"}
        </small>
        <h3>{stop.title}</h3>
        <p>{stop.description}</p>
        <button onClick={() => onInspect(stop.id)}>
          Read {stop.label === "Home" ? "my profile" : stop.label.toLowerCase()}{" "}
          <FiCornerUpRight />
        </button>
      </section>
      <div className="touch-thrusters" aria-label="Touch flight controls">
        <div className="thrust-pad">
          <Thruster flight={flightRef} code="KeyW" label="Fly forward">
            <FiArrowUp />
          </Thruster>
          <Thruster flight={flightRef} code="KeyA" label="Fly left">
            <FiArrowLeft />
          </Thruster>
          <Thruster flight={flightRef} code="KeyS" label="Fly backward">
            <FiArrowDown />
          </Thruster>
          <Thruster flight={flightRef} code="KeyD" label="Fly right">
            <FiArrowRight />
          </Thruster>
        </div>
        <div className="altitude-pad">
          <Thruster flight={flightRef} code="KeyE" label="Fly upward">
            +
          </Thruster>
          <Thruster flight={flightRef} code="KeyQ" label="Fly downward">
            −
          </Thruster>
        </div>
      </div>
      <div className="world-info-portal" ref={onPortal} />
    </div>
  );
}
