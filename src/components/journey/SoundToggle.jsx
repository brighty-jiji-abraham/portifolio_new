import { useEffect, useId, useRef, useState } from "react";
import { FiChevronDown, FiVolume2, FiVolumeX } from "react-icons/fi";
import "./SoundToggle.css";

export default function SoundToggle({ settings, className = "" }) {
  const { muted, toggleMute, soundSupported, volumes, setVolume } = settings;
  const [expanded, setExpanded] = useState(false);
  const container = useRef();
  const volumeButton = useRef();
  const id = useId();
  useEffect(() => {
    if (!expanded) return;
    const close = (event) => {
      if (!container.current.contains(event.target)) setExpanded(false);
    };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [expanded]);
  const label = muted ? "Turn sound on" : "Turn sound off";
  return (
    <div className="sound-controls" ref={container}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setExpanded(false); }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && expanded) {
          event.preventDefault();
          event.stopPropagation();
          setExpanded(false);
          volumeButton.current.focus();
        }
      }}>
      <button type="button" className={`sound-toggle ${className}`} onClick={toggleMute}
      aria-label={label} aria-pressed={!muted} disabled={!soundSupported}
      title={soundSupported ? label : "Sound is unavailable in this browser"}>
      {muted ? <FiVolumeX aria-hidden="true" /> : <FiVolume2 aria-hidden="true" />}
      <span className="sound-toggle-label">Sound {muted ? "off" : "on"}</span>
      </button>
      <button ref={volumeButton} type="button" className="sound-volume-toggle"
        onClick={() => setExpanded(value => !value)} disabled={!soundSupported}
        aria-label="Adjust sound volumes" title="Adjust sound volumes"
        aria-expanded={expanded} aria-controls={`${id}-volumes`}>
        <FiChevronDown aria-hidden="true" />
      </button>
      {expanded && (
        <div id={`${id}-volumes`} className="sound-volume-panel" role="group" aria-label="Sound volume controls">
          <p className="sound-volume-title">Sound levels</p>
          {[
            ["universe", "Universe ambience", "Music, atmosphere & project sounds"],
            ["blackHole", "Black hole effects", "Rumble & rushing air"],
          ].map(([channel, name, description]) => {
            const percent = Math.round(volumes[channel] * 100);
            return (
              <div className="sound-volume-channel" key={channel}>
                <label htmlFor={`${id}-${channel}`}>{name}<span aria-hidden="true">{percent}%</span></label>
                <input id={`${id}-${channel}`} type="range" min="0" max="100" step="1"
                  value={percent} aria-valuetext={`${percent}%`} aria-describedby={`${id}-${channel}-description`}
                  onChange={(event) => setVolume(channel, Number(event.target.value) / 100)}
                  style={{ "--volume-level": `${percent}%` }} />
                <p id={`${id}-${channel}-description`}>{description}</p>
              </div>
            );
          })}
          {muted && <p className="sound-volume-muted">Sound is off. Turn it on to listen.</p>}
        </div>
      )}
    </div>
  );
}
