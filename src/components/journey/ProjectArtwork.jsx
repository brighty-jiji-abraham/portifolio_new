import { useId } from "react";
import { projectVisuals } from "../../data/projectVisuals";
import "./ProjectArtwork.css";

export default function ProjectArtwork({ index }) {
  const { color, kind, label } = projectVisuals[index];
  const id = useId().replace(/:/g, "");
  const nodes = Array.from({ length: 6 }, (_, i) => [
    200 + Math.cos((i * Math.PI) / 3) * 125,
    125 + Math.sin((i * Math.PI) / 3) * 70,
  ]);
  return (
    <div
      className="project-artwork"
      style={{ "--art-color": color }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 400 250" fill="none">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="var(--art-color)" stopOpacity="0.4" />
            <stop offset="1" stopColor="var(--art-color)" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        <ellipse
          cx="200"
          cy="125"
          rx="158"
          ry="77"
          transform="rotate(-14 200 125)"
          stroke="currentColor"
          opacity="0.16"
        />
        <g className="artwork-object" stroke="currentColor" strokeWidth="1.4">
          {kind === "platform" && (
            <>
              {nodes.map(([x, y], i) => (
                <g key={i}>
                  <path d={`M200 125L${x} ${y}`} opacity="0.4" />
                  <rect
                    x={x - 16}
                    y={y - 16}
                    width="32"
                    height="32"
                    rx="7"
                    fill={`url(#${id})`}
                  />
                  <circle cx={x} cy={y} r="5" />
                </g>
              ))}
              <path
                d="M200 81l38 22v44l-38 23-38-23v-44z"
                fill={`url(#${id})`}
              />
              <path d="M162 103l38 23 38-23M200 126v44" />
            </>
          )}
          {kind === "network" && (
            <>
              {[0, 1, 2].flatMap((layer) =>
                [0, 1, 2].flatMap((row) =>
                  [0, 1, 2].map((next) => (
                    <path
                      key={`${layer}${row}${next}`}
                      d={`M${82 + layer * 78} ${65 + row * 60}L${160 + layer * 78} ${65 + next * 60}`}
                      opacity="0.22"
                    />
                  )),
                ),
              )}
              {[0, 1, 2, 3].flatMap((x) =>
                [0, 1, 2].map((y) => (
                  <circle
                    key={`${x}${y}`}
                    cx={82 + x * 78}
                    cy={65 + y * 60}
                    r="9"
                    fill={`url(#${id})`}
                  />
                )),
              )}
            </>
          )}
          {kind === "vision" && (
            <>
              {[35, 57, 73, 83].map((r) => (
                <ellipse
                  key={r}
                  cx="200"
                  cy="125"
                  rx={r}
                  ry={r * 0.85}
                  fill={r === 35 ? `url(#${id})` : "none"}
                />
              ))}
              {Array.from({ length: 8 }, (_, i) => (
                <path
                  key={i}
                  transform={`rotate(${i * 45} 200 125)`}
                  d="M200 95L250 90L260 120"
                  opacity="0.65"
                />
              ))}
              <path d="M91 91v68h18M309 91v68h-18" />
            </>
          )}
          {kind === "chess" && (
            <>
              <g transform="translate(200 158) scale(1 .45) rotate(-35)">
                <rect x="-103" y="-103" width="206" height="206" rx="4" fill="var(--bg-1)" />
                {Array.from({ length: 64 }, (_, i) => (
                  <rect
                    key={i}
                    x={-96 + (i % 8) * 24}
                    y={-96 + Math.floor(i / 8) * 24}
                    width="24"
                    height="24"
                    fill="currentColor"
                    fillOpacity={(i + Math.floor(i / 8)) % 2 ? 0.35 : 0.06}
                    stroke="none"
                  />
                ))}
              </g>
              {[[-43, 13], [47, -8]].map(([x, y], i) => (
                <g key={i} transform={`translate(${200 + x} ${y})`} fill="var(--bg-1)">
                  <path d="M-22 163h44l-4-10h-36zM-18 151c8-22 10-36 7-47h22c-3 11-1 25 7 47z" />
                  <path d="M-14 102l-4-16h36l-4 16z" fill={`url(#${id})`} />
                  <path d="M0 62v24M-9 71h18" strokeWidth="5" />
                  <path d="M-13 112h26M-15 143h30" opacity="0.5" />
                </g>
              ))}
            </>
          )}
          {kind === "voice" &&
            Array.from({ length: 31 }, (_, i) => {
              const height = 15 + (Math.sin(i * 0.62) * 0.5 + 0.5) * 90;
              return (
                <rect
                  key={i}
                  className="artwork-bar"
                  x={76 + i * 8}
                  y={125 - height / 2}
                  width="4"
                  height={height}
                  rx="2"
                  fill={`url(#${id})`}
                  style={{ "--bar": i }}
                />
              );
            })}
          {kind === "web" &&
            [-1, 0, 1].map((x) => (
              <g
                key={x}
                transform={`translate(${x * 45} ${-x * 12}) rotate(${-x * 6} 200 125)`}
              >
                <rect
                  x="140"
                  y="50"
                  width="120"
                  height="150"
                  rx="9"
                  fill="var(--bg-1)"
                />
                <rect
                  x="151"
                  y="68"
                  width="98"
                  height="65"
                  rx="4"
                  fill={`url(#${id})`}
                />
                <path d="M152 150h90M152 162h73M152 174h80" opacity="0.6" />
              </g>
            ))}
        </g>
      </svg>
      <span className="artwork-index">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="artwork-label">{label}</span>
    </div>
  );
}
