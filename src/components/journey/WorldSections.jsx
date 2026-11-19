import { useState } from "react";
import {
  FiArrowUpRight,
  FiChevronLeft,
  FiChevronRight,
  FiMapPin,
  FiPause,
  FiPlay,
  FiRadio,
  FiRotateCcw,
  FiStar,
} from "react-icons/fi";
import Projects from "../../pages/Projects";
import Experience from "../../pages/Experience";
import Contact from "../../pages/Contact";
import { projects } from "../../data/projects";
import { experiences } from "../../data/experience";
import ProjectLinks from "../projects/ProjectLinks";
import { birthStar } from "../../data/constellation";
import "./WorldSections.css";

export function Crossing({ id, instant }) {
  return (
    <div
      id={`crossing-${id}`}
      className={`space-crossing${id !== "skills" ? " from-archive" : ""}${instant ? " is-instant" : ""}`}
      aria-hidden="true"
    />
  );
}

function SceneControls({
  id,
  children,
  hint,
  trip,
  reducedMotion,
  unavailable,
}) {
  if (unavailable) return null;
  return (
    <div className="world-controls">
      <span>{hint}</span>
      <div>
        {children}
        {!reducedMotion && (
          <button
            onClick={trip.togglePause}
            aria-label={`${trip.paused ? "Resume" : "Pause"} ${id} motion`}
          >
            {trip.paused ? <FiPlay /> : <FiPause />}
          </button>
        )}
      </div>
    </div>
  );
}

function NextStop({ id, next, label, trip, reducedMotion, unavailable }) {
  return (
    <div className="world-links">
      {next && (
        <a href={`#${next}`}>
          {label}
          <FiArrowUpRight />
        </a>
      )}
      {!reducedMotion && !unavailable && (
        <button onClick={() => trip.launch(id, true)}>
          <FiRotateCcw />
          Replay arrival
        </button>
      )}
    </div>
  );
}

export function WorkWorld({
  selected,
  onSelect,
  trip,
  reducedMotion,
  unavailable,
}) {
  const [expanded, setExpanded] = useState(false);
  const project = projects[selected];
  const select = (index) => {
    onSelect((index + projects.length) % projects.length);
    setExpanded(false);
  };
  return (
    <>
      <Crossing id="projects" instant={reducedMotion || unavailable} />
      <section
        id="projects"
        className={`chapter world-section work-world${unavailable ? " without-scene" : ""}`}
        aria-labelledby="projects-title"
        data-project={selected}
      >
        <div
          id="projects-viewport"
          className="world-viewport"
          aria-hidden="true"
        />
        <div className="world-scene-label" aria-hidden="true">
          <span />
          My work, out in the world
        </div>
        <SceneControls
          id="work"
          hint="Select a floating project to explore it"
          trip={trip}
          reducedMotion={reducedMotion}
          unavailable={unavailable}
        >
          <button
            onClick={() => select(selected - 1)}
            aria-label="Previous project"
          >
            <FiChevronLeft />
          </button>
          <button
            onClick={() => select(selected + 1)}
            aria-label="Next project"
          >
            <FiChevronRight />
          </button>
        </SceneControls>
        <div className="world-panel">
          <header>
            <p className="world-kicker">Selected work</p>
            <h2 id="projects-title" tabIndex={-1}>
              Ideas out in the wild.
            </h2>
            <p>
              AI applications, SaaS platforms, and web experiments. Explore the
              projects and the source code behind my public work.
            </p>
          </header>
          <label className="world-select-label" htmlFor="featured-project">
            Explore a project
          </label>
          <select
            id="featured-project"
            value={selected}
            onChange={(event) => select(Number(event.target.value))}
          >
            {projects.map((entry, index) => (
              <option key={entry.title} value={index}>
                {entry.title}
              </option>
            ))}
          </select>
          <article className="featured-project" aria-live="polite">
            <span className="world-tag">{project.tag}</span>
            <h3>{project.title}</h3>
            <p
              className={`featured-project-copy${expanded ? " is-expanded" : ""}`}
            >
              {project.summary}
            </p>
            {project.summary.length > 240 && (
              <button
                className="world-read-more"
                onClick={() => setExpanded((value) => !value)}
                aria-expanded={expanded}
              >
                {expanded ? "Show less" : "Read the full story"}
              </button>
            )}
            <ul className="world-stack" aria-label="Project technologies">
              {project.stack.map((tool) => (
                <li key={tool}>{tool}</li>
              ))}
            </ul>
            <ProjectLinks project={project} />
          </article>
          <NextStop
            id="projects"
            next="experience"
            label="Follow my journey"
            trip={trip}
            reducedMotion={reducedMotion}
            unavailable={unavailable}
          />
        </div>
      </section>
      <div className="world-archive-wrap">
        <details className="world-archive">
          <summary>
            Browse all my projects<span>{projects.length} projects</span>
          </summary>
          <Projects />
        </details>
      </div>
    </>
  );
}

export function CareerWorld({
  selected,
  onSelect,
  trip,
  reducedMotion,
  unavailable,
}) {
  const experience = experiences[selected];
  return (
    <>
      <Crossing id="experience" instant={reducedMotion || unavailable} />
      <section
        id="experience"
        className={`chapter world-section career-world${unavailable ? " without-scene" : ""}`}
        aria-labelledby="experience-title"
        data-milestone={selected}
      >
        <div
          id="experience-viewport"
          className="world-viewport"
          aria-hidden="true"
        />
        <div className="world-scene-label" aria-hidden="true">
          <span />
          Brighty&apos;s constellation
        </div>
        <SceneControls
          id="career"
          hint="Select a star to explore a chapter"
          trip={trip}
          reducedMotion={reducedMotion}
          unavailable={unavailable}
        >
          <button
            onClick={() =>
              onSelect(selected === experiences.length - 1 ? -1 : selected + 1)
            }
            disabled={selected === -1}
            aria-label="Earlier milestone"
          >
            <FiChevronLeft />
          </button>
          <button
            onClick={() =>
              onSelect(
                selected === -1
                  ? experiences.length - 1
                  : Math.max(0, selected - 1),
              )
            }
            disabled={selected === 0}
            aria-label="Later milestone"
          >
            <FiChevronRight />
          </button>
        </SceneControls>
        <div className="world-panel">
          <header>
            <p className="world-kicker">Experience & growth</p>
            <h2 id="experience-title" tabIndex={-1}>
              My constellation.
            </h2>
            <p>
              Follow the stars through the beginnings, roles, and teams that
              shaped my work.
            </p>
          </header>
          <button
            className="career-origin-button"
            onClick={() => onSelect(-1)}
            aria-pressed={selected === -1}
          >
            <span className="career-origin-symbol" aria-hidden="true">
              ✧
            </span>
            <span>
              <small>The origin star</small>
              <strong>{birthStar.label}</strong>
            </span>
            <FiArrowUpRight aria-hidden="true" />
          </button>
          <div
            className="career-stop-list"
            role="group"
            aria-label="Career milestones"
          >
            {[...experiences].reverse().map((entry, reverseIndex) => {
              const index = experiences.length - reverseIndex - 1;
              return (
                <button
                  key={`${entry.company}-${entry.period}`}
                  onClick={() => onSelect(index)}
                  aria-pressed={selected === index}
                  aria-label={`${entry.period.match(/\d{4}/)?.[0]} · ${entry.role}`}
                >
                  <FiStar aria-hidden="true" />
                  <strong>{entry.period.match(/\d{4}/)?.[0]}</strong>
                </button>
              );
            })}
          </div>
          <article className="career-detail" aria-live="polite">
            {experience ? (
              <>
                <span className="world-tag">
                  {experience.period}
                  {experience.current && (
                    <span className="career-current">Current role</span>
                  )}
                </span>
                <h3>{experience.role}</h3>
                <p className="career-company">{experience.company}</p>
                <p className="career-location">
                  <FiMapPin />
                  {experience.location}
                </p>
                {experience.note && (
                  <p className="career-note">{experience.note}</p>
                )}
                {experience.works && (
                  <ul>
                    {experience.works.map((work) => (
                      <li key={work}>{work}</li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <div className="career-birth-detail">
                <span className="world-tag">The origin star</span>
                <h3>Where it all began.</h3>
                <p>
                  The first point in my constellation, connected to the roles
                  and teams that shaped my work.
                </p>
                <button onClick={() => onSelect(experiences.length - 1)}>
                  Follow my career <FiArrowUpRight aria-hidden="true" />
                </button>
              </div>
            )}
          </article>
          <NextStop
            id="experience"
            next="contact"
            label="Let's talk"
            trip={trip}
            reducedMotion={reducedMotion}
            unavailable={unavailable}
          />
        </div>
      </section>
      <div className="world-archive-wrap">
        <details className="world-archive">
          <summary>
            Experience, education & beyond<span>The full story</span>
          </summary>
          <Experience />
        </details>
      </div>
    </>
  );
}

export function ContactWorld({
  onSignal,
  onContactStatus,
  trip,
  reducedMotion,
  unavailable,
}) {
  const [previewed, setPreviewed] = useState(false);
  return (
    <>
      <Crossing id="contact" instant={reducedMotion || unavailable} />
      <section
        id="contact"
        className={`chapter world-section contact-world${unavailable ? " without-scene" : ""}`}
        aria-labelledby="contact-title"
      >
        <div
          id="contact-viewport"
          className="world-viewport"
          aria-hidden="true"
        />
        <div className="world-scene-label" aria-hidden="true">
          <span />
          Alappuzha, Kerala · Planet Earth
        </div>
        <SceneControls
          id="contact"
          hint="Based in Kerala. Building for everywhere."
          trip={trip}
          reducedMotion={reducedMotion}
          unavailable={unavailable}
        >
          <button
            className="world-signal-button"
            onClick={() => {
              onSignal();
              setPreviewed(true);
            }}
            aria-label="Preview a signal around Earth"
          >
            <FiRadio />
            Preview signal
          </button>
        </SceneControls>
        <div className="world-panel">
          <header>
            <p className="world-kicker">Start a conversation</p>
            <h2 id="contact-title" tabIndex={-1}>
              Let&apos;s build something.
            </h2>
            <p>
              A project, an opportunity, or a hello. I&apos;d love to hear what you
              have in mind.
            </p>
          </header>
          {previewed && (
            <span className="sr-only" role="status">
              Signal animation preview. No message has been sent.
            </span>
          )}
          <Contact embedded onStatusChange={onContactStatus} />
          <NextStop
            id="contact"
            next="about"
            label="Back to my world"
            trip={trip}
            reducedMotion={reducedMotion}
            unavailable={unavailable}
          />
        </div>
      </section>
    </>
  );
}
