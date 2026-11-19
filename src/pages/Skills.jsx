import { skillGroups as groups } from "../data/skills";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useSpotlight } from "../hooks/useInteractive";
import { playTick } from "../hooks/useSoundscape";
import { projects } from "../data/projects";
import "./Skills.css";

const Skills = () => {
  const spotlight = useSpotlight();
  const [hoveredSkill, setHoveredSkill] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e, skill) => {
    playTick();
    setHoveredSkill(skill);
    const rect = e.currentTarget.getBoundingClientRect();
    const width = Math.min(280, window.innerWidth - 24);
    setTooltipPos({
      x: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)),
      y: Math.max(12, Math.min(rect.bottom + 10, window.innerHeight - 230)),
    });
  };

  const handleMouseLeave = () => {
    setHoveredSkill(null);
  };

  useEffect(() => {
    const dismiss = () => setHoveredSkill(null);
    window.addEventListener("scroll", dismiss, { passive: true });
    window.addEventListener("resize", dismiss);
    return () => {
      window.removeEventListener("scroll", dismiss);
      window.removeEventListener("resize", dismiss);
    };
  }, []);

  const relevantProjects = hoveredSkill
    ? projects.filter((p) =>
        p.stack.some((s) =>
          hoveredSkill.matches.some((m) => s.toLowerCase() === m.toLowerCase()),
        ),
      )
    : [];

  return (
    <div className="skills">
      <div className="skills-head cinematic-reveal delay-1">
        <span className="section-eyebrow">Skills</span>
        <h2 className="section-title">What I work with</h2>
        <p className="section-lead">
          The tools behind the ideas. Explore a skill to see where I&apos;ve put
          it to work.
        </p>
      </div>

      <div className="skill-grid">
        {groups.map((group, gi) => {
          const GroupIcon = group.Icon;
          return (
            <article
              key={group.title}
              className="skill-card cinematic-reveal"
              style={{
                animationDelay: `${gi * 0.08 + 0.3}s`,
                "--card-accent": group.accent,
              }}
              onMouseEnter={playTick}
              onMouseMove={spotlight.onMouseMove}
            >
              <header className="skill-card-head">
                <span className="skill-card-icon" aria-hidden="true">
                  <GroupIcon />
                </span>
                <div className="skill-card-headtext">
                  <h3 className="skill-card-title">{group.title}</h3>
                  <p className="skill-card-subtitle">{group.subtitle}</p>
                </div>
                <span className="skill-card-count" aria-hidden="true">
                  {group.items.length}
                </span>
              </header>

              <ul className="skill-chips">
                {group.items.map(({ Icon, label, color, matches }) => {
                  const skill = { label, matches: matches || [label] };
                  return (
                    <li key={label}>
                      <button
                        type="button"
                        className="skill-chip"
                        style={{ "--chip-color": color }}
                        onMouseEnter={(e) => handleMouseEnter(e, skill)}
                        onFocus={(e) => handleMouseEnter(e, skill)}
                        onClick={(e) => handleMouseEnter(e, skill)}
                        onMouseLeave={handleMouseLeave}
                        onBlur={handleMouseLeave}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") handleMouseLeave();
                        }}
                        aria-describedby={
                          hoveredSkill?.label === label &&
                          relevantProjects.length > 0
                            ? "skill-projects"
                            : undefined
                        }
                      >
                        <Icon className="chip-icon" />
                        <span>{label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </article>
          );
        })}
      </div>

      {hoveredSkill &&
        relevantProjects.length > 0 &&
        createPortal(
          <div
            className="skill-tooltip"
            id="skill-projects"
            role="tooltip"
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y,
            }}
          >
            <div className="skill-tooltip-header">
              {hoveredSkill.label} in action
            </div>
            <ul className="skill-tooltip-list">
              {relevantProjects.slice(0, 4).map((p) => (
                <li key={p.title}>{p.title}</li>
              ))}
            </ul>
            {relevantProjects.length > 4 && (
              <p className="skill-tooltip-more">
                And {relevantProjects.length - 4} more projects
              </p>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
};

export default Skills;
