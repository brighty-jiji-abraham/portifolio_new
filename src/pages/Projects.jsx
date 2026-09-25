import { useState } from "react";
import {
  FiCpu,
  FiLayers,
  FiCode,
  FiArrowDown,
  FiArrowUp,
  FiPlus,
  FiMinus,
} from "react-icons/fi";
import { useSpotlight, useTilt } from "../hooks/useInteractive";
import { useReveal } from "../hooks/useReveal";
import { playTick } from "../hooks/useSoundscape";
import { projects } from "../data/projects";
import "./Projects.css";

const CATEGORIES = ["All projects", "AI & ML", "Platforms", "Web & Creative"];
const CATEGORY_ART = {
  "AI & ML": { Icon: FiCpu, color: "#a1d8c6", className: "ai" },
  Platforms: { Icon: FiLayers, color: "#e1a775", className: "platform" },
  "Web & Creative": { Icon: FiCode, color: "#bcb0e8", className: "web" },
};

function ProjectCard({ project, index }) {
  const spotlight = useSpotlight();
  const tilt = useTilt(4);
  const [ref, visible] = useReveal();
  const [expanded, setExpanded] = useState(false);
  const { Icon, color, className } = CATEGORY_ART[project.category];
  return (
    <li
      ref={ref}
      className={`project-card ${visible ? "card-in-view" : ""} ${expanded ? "is-expanded" : ""}`}
      style={{
        "--project-color": color,
        "--reveal-delay": `${(index % 3) * 65}ms`,
      }}
      onMouseEnter={playTick}
      onMouseMove={(event) => {
        spotlight.onMouseMove(event);
        tilt.onMouseMove(event);
      }}
      onMouseLeave={tilt.onMouseLeave}
    >
      <div className={`project-art art-${className}`} aria-hidden="true">
        <span className="art-orbit orbit-one" />
        <span className="art-orbit orbit-two" />
        <span className="art-core">
          <Icon />
        </span>
        <span className="art-star star-one">✦</span>
        <span className="art-star star-two">+</span>
        <span className="art-caption">{project.category}</span>
      </div>
      <div className="project-card-body">
        <span className="project-tag">{project.tag}</span>
        <h3>{project.title}</h3>
        <p
          className={`project-summary ${expanded || project.summary.length <= 200 ? "" : "is-clamped"}`}
          id={`project-story-${projects.indexOf(project)}`}
        >
          {project.summary}
        </p>
        {project.summary.length > 200 && (
          <button
            className="project-expand"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-controls={`project-story-${projects.indexOf(project)}`}
          >
            {expanded ? "A little less" : "Read the story"}{" "}
            {expanded ? <FiMinus /> : <FiPlus />}
          </button>
        )}
        <div className="project-stack" aria-label="Tech stack">
          {project.stack.map((stack) => (
            <span key={stack} className="stack-chip">
              {stack}
            </span>
          ))}
        </div>
      </div>
    </li>
  );
}

export default function Projects() {
  const [category, setCategory] = useState("All projects");
  const [showAll, setShowAll] = useState(false);
  const filtered =
    category === "All projects"
      ? projects
      : projects.filter((project) => project.category === category);
  const displayed = showAll ? filtered : filtered.slice(0, 6);
  const changeCategory = (next) => {
    setCategory(next);
    setShowAll(false);
  };
  const toggleAll = () => {
    if (showAll) {
      // Put the heading back in view before the long grid collapses.
      document
        .getElementById("project-filters")
        ?.scrollIntoView({ behavior: "instant", block: "start" });
    }
    setShowAll(!showAll);
  };
  return (
    <div className="projects">
      <div className="projects-head cinematic-reveal delay-1">
        <div>
          <span className="section-eyebrow">Selected work</span>
          <h2 className="section-title">Ideas out in the wild.</h2>
        </div>
        <p className="section-lead">
          From curious experiments to platforms people use. A few things
          I&apos;ve brought to life with code.
        </p>
      </div>
      <div className="project-toolbar" id="project-filters">
        <div
          className="project-filters"
          role="group"
          aria-label="Filter projects"
        >
          {CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={category === item}
              className={category === item ? "is-selected" : ""}
              onClick={() => changeCategory(item)}
            >
              {item}
              {item === "All projects" && <span>{projects.length}</span>}
            </button>
          ))}
        </div>
        <span className="project-count" role="status">
          Showing {displayed.length} of {filtered.length}
        </span>
      </div>
      <ul className="project-list" aria-label={`${category} collection`}>
        {displayed.map((project, index) => (
          <ProjectCard key={project.title} project={project} index={index} />
        ))}
      </ul>
      {filtered.length > 6 && (
        <button
          className="btn btn-ghost projects-more"
          type="button"
          onClick={toggleAll}
          aria-expanded={showAll}
        >
          {showAll
            ? "Back to selected projects"
            : `Explore all ${filtered.length} projects`}{" "}
          {showAll ? <FiArrowUp /> : <FiArrowDown />}
        </button>
      )}
    </div>
  );
}
