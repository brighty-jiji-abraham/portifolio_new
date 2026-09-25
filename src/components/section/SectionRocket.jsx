import "./SectionFlight.css";

function RocketBody({ sectionId, side }) {
  const shellId = `rocket-shell-${sectionId}-${side}`;
  return (
    <svg viewBox="80 0 62 112" fill="none" aria-hidden="true">
      <defs>
        <linearGradient
          id={shellId}
          x1="99"
          y1="25"
          x2="126"
          y2="65"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff7e8" />
          <stop offset="0.5" stopColor="#d9e5e7" />
          <stop offset="1" stopColor="#7d98a2" />
        </linearGradient>
      </defs>
      <g>
        <g className="rocket-ship">
          <path d="M99 49 L87 64 L87 78 L103 69 Z" fill="#cf805b" />
          <path d="M123 49 L135 64 L135 78 L119 69 Z" fill="#965033" />
          <path
            d="M99 65 L99 36 Q99 21 111 9 Q123 21 123 36 L123 65 Z"
            fill={`url(#${shellId})`}
          />
          <path d="M101 26 Q104 17 111 9 Q118 17 121 26 Z" fill="#e79b71" />
          <circle
            cx="111"
            cy="40"
            r="7"
            fill="#233a4a"
            stroke="#a3bac0"
            strokeWidth="2"
          />
          <circle cx="111" cy="40" r="4.5" fill="#8cd7e7" />
          <path
            d="M108 38 L112 36"
            stroke="#e7ffff"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path d="M99 62 H123 L120 70 H102 Z" fill="#8b7261" />
          <g className="rocket-flame">
            <path
              d="M102 73 Q97 91 111 108 Q125 91 120 73 Z"
              fill="#e7a154"
              opacity="0.8"
            />
            <path d="M106 73 Q104 84 111 97 Q118 84 116 73 Z" fill="#fff1b3" />
          </g>
        </g>
      </g>
    </svg>
  );
}

const NAMES = {
  skills: "Skills",
  projects: "Work",
  experience: "Journey",
  contact: "Contact",
};

export default function SectionRocket({ sectionId }) {
  return (
    <div className="section-rocket">
      <div className="payload-rail" aria-hidden="true">
        <span />
        <span />
      </div>
      {[-1, 1].map((side, index) => (
        <div
          className={`tow-craft tow-craft-${index}`}
          key={side}
          style={{ "--tow-side": side }}
        >
          <svg
            className="tow-cable"
            viewBox="0 0 62 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path className="tow-cable-shadow" d="M10 0 Q5 56 31 100" />
            <path className="tow-cable-core" d="M10 0 Q5 56 31 100" />
          </svg>
          <button
            type="button"
            className="tow-rocket"
            aria-label={`Boost ${NAMES[sectionId]} rocket ${index + 1}`}
            title="Tap to fire the boosters"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("portfolio-thrust", {
                  detail: { id: sectionId },
                }),
              )
            }
          >
            <RocketBody sectionId={sectionId} side={index} />
            <span className="tow-exhaust" aria-hidden="true" />
          </button>
          <span className="tow-anchor" aria-hidden="true">
            <i />
          </span>
        </div>
      ))}
      <div className="tow-caption" aria-hidden="true">
        <span className="tow-signal" />
        <span className="tow-phase">Docked · tap a rocket</span>
      </div>
      <div className="docking-wave" aria-hidden="true" />
    </div>
  );
}
