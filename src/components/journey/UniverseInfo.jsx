import { useEffect, useRef } from "react";
import {
  FiArrowUpRight,
  FiChevronLeft,
  FiChevronRight,
  FiCompass,
  FiGithub,
  FiLinkedin,
  FiMapPin,
  FiStar,
  FiActivity,
  FiRotateCcw,
  FiPlay,
  FiPause,
} from "react-icons/fi";
import profileImage from "../../assets/profile-img.jpg";
import { skillGroups } from "../../data/skills";
import { projects } from "../../data/projects";
import { profile, profileStats } from "../../data/profile";
import ProjectLinks from "../projects/ProjectLinks";
import {
  experiences,
  education,
  certifications,
  activities,
} from "../../data/experience";
import Contact from "../../pages/Contact";
import { ProfileName, ProfileRole, AnimatedNumber } from "./ProfileTypography";
import { useMagnetic } from "../../hooks/useInteractive";
import ProfileOverview from "./ProfileOverview";
import "./UniverseInfo.css";

const TITLES = {
  about: "Meet Brighty",
  skills: "My skills",
  projects: "Selected work",
  experience: "My journey",
  contact: "Let's talk",
};

export default function UniverseInfo({
  id,
  active,
  motion = true,
  onDismiss,
  onInspect,
  category,
  onCategory,
  selected,
  onSkill,
  onNeuralPulse,
  onNetworkReset,
  project,
  onProject,
  milestone,
  onMilestone,
  onTraceJourney,
  tracing,
  onSkyReset,
  onContactStatus,
  onSignal,
}) {
  const heading = useRef();
  const scroll = useRef();
  const magnetic = useMagnetic(0.12);
  const group = skillGroups[category];
  const tool = group.items[selected];
  const work = projects[project];
  const chapter = experiences[milestone];
  const related = projects
    .map((item, index) => ({ ...item, index }))
    .filter((item) =>
      item.stack.some((name) =>
        (tool.matches || [tool.label]).some(
          (match) => name.toLowerCase() === match.toLowerCase(),
        ),
      ),
    );
  useEffect(() => {
    if (!active) return;
    scroll.current.scrollTop = 0;
    const frame = requestAnimationFrame(() =>
      heading.current?.focus({ preventScroll: true }),
    );
    return () => cancelAnimationFrame(frame);
  }, [id, active]);
  return (
    <article
      className="spatial-panel"
      data-information={id}
      data-active={active}
      data-motion={motion}
      inert={!active}
      aria-hidden={!active}
      aria-labelledby="universe-information-title"
    >
      <header className="spatial-panel-heading">
        <h2 id="universe-information-title" ref={heading} tabIndex={-1}>
          <span aria-hidden="true">✧</span>
          {TITLES[id]}
        </h2>
        <button className="spatial-resume" onClick={onDismiss}>
          <FiCompass /> Fly freely
        </button>
      </header>
      <div
        className="spatial-panel-scroll"
        ref={scroll}
        tabIndex={0}
        aria-label="Information panel content"
      >
        <div className="spatial-section" hidden={id !== "about"}>
          <p className="spatial-eyebrow">01 / The person behind the universe</p>
          <div className="spatial-profile">
            <img src={profileImage} alt={profile.name} width="76" height="76" />
            <p>
              Based in Kerala.
              <br />
              Building for everywhere.
            </p>
          </div>
          <ProfileName
            className="spatial-profile-name"
            active={active && id === "about"}
            motion={motion}
          />
          <ProfileRole
            className="spatial-role"
            active={active && id === "about"}
            motion={motion}
          />
          <p className="spatial-bio">{profile.bio}</p>
          <dl className="spatial-facts">
            {profileStats.map(({ value, suffix, label }) => (
              <div key={label}>
                <dt>
                  <AnimatedNumber
                    value={value}
                    suffix={suffix}
                    active={active && id === "about"}
                    motion={motion}
                  />
                </dt>
                <dd>{label}</dd>
              </div>
            ))}
          </dl>
          <div className="spatial-socials">
            <a
              href={profile.links.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiGithub /> GitHub
            </a>
            <a
              href={profile.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiLinkedin /> LinkedIn
            </a>
          </div>
          <div className="spatial-actions">
            <button
              className="spatial-primary"
              {...(motion ? magnetic : {})}
              onClick={() => onInspect("projects")}
            >
              Explore my work <FiArrowUpRight />
            </button>
            <button onClick={() => onInspect("contact")}>
              Start a conversation <FiArrowUpRight />
            </button>
          </div>
          <ProfileOverview onInspect={onInspect} />
        </div>
        <div className="spatial-section" hidden={id !== "skills"}>
          <p className="spatial-eyebrow">02 / A connected toolkit</p>
          <div className="spatial-current-tool" aria-live="polite">
            <span className="spatial-tool-emblem">
              <tool.Icon style={{ color: tool.color }} />
            </span>
            <div>
              <h3>{tool.label}</h3>
              <p>
                {group.title} · {group.items.length} connected tools
              </p>
            </div>
          </div>
          <p className="spatial-scene-hint">
            Select a neuron to discover where I use it. Drag to turn the
            network.
          </p>
          <div
            className="spatial-categories"
            role="group"
            aria-label="Universe skill categories"
          >
            {skillGroups.map((item, index) => (
              <button
                key={item.title}
                aria-pressed={category === index}
                onClick={() => onCategory(index)}
              >
                <item.Icon />
                {item.title}
              </button>
            ))}
          </div>
          <div
            className="spatial-exhibit-controls"
            aria-label="Neural network controls"
          >
            <button
              onClick={onNeuralPulse}
              disabled={!motion}
              title={
                motion
                  ? "Send a signal from the selected neuron"
                  : "Resume motion to send a signal"
              }
            >
              <FiActivity /> Send a signal
            </button>
            <button onClick={onNetworkReset}>
              <FiRotateCcw /> Reset view
            </button>
          </div>
          <div
            className="spatial-tool-list"
            role="group"
            aria-label={`${group.title} in the universe`}
          >
            {group.items.map((item, index) => (
              <button
                key={item.label}
                aria-pressed={selected === index}
                onClick={() => onSkill(index)}
              >
                <item.Icon style={{ color: item.color }} />
                {item.label}
              </button>
            ))}
          </div>
          <div className="spatial-selected-detail" key={tool.label}>
            <h3 aria-live="polite">
              <tool.Icon style={{ color: tool.color }} />
              {tool.label}
            </h3>
            <p>{group.subtitle}</p>
            {related.length ? (
              <>
                <h4>In my work</h4>
                <ul className="spatial-related">
                  {related.map((item) => (
                    <li key={item.title}>
                      <button
                        onClick={() => {
                          onProject(item.index);
                          onInspect("projects");
                        }}
                      >
                        {item.title}
                        <FiArrowUpRight />
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p>Part of my wider toolkit for exploring and building ideas.</p>
            )}
          </div>
        </div>
        <div className="spatial-section" hidden={id !== "projects"}>
          <p className="spatial-eyebrow">03 / Ideas made real</p>
          <label className="spatial-field-label" htmlFor="universe-project">
            Explore a project
          </label>
          <select
            id="universe-project"
            value={project}
            onChange={(event) => onProject(Number(event.target.value))}
          >
            {projects.map((item, index) => (
              <option key={item.title} value={index}>
                {item.title}
              </option>
            ))}
          </select>
          <div className="spatial-pagination">
            <button
              aria-label="Previous universe project"
              onClick={() =>
                onProject((project - 1 + projects.length) % projects.length)
              }
            >
              <FiChevronLeft />
            </button>
            <span>
              {project + 1} of {projects.length}
            </span>
            <button
              aria-label="Next universe project"
              onClick={() => onProject((project + 1) % projects.length)}
            >
              <FiChevronRight />
            </button>
          </div>
          <div className="spatial-project-story" key={work.title}>
            <p className="spatial-project-type">{work.tag}</p>
            <h3 aria-live="polite">{work.title}</h3>
            <p>{work.summary}</p>
            <ul
              className="spatial-stack"
              aria-label="Universe project technologies"
            >
              {work.stack.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <ProjectLinks project={work} />
          </div>
          <button
            className="spatial-text-link"
            onClick={() => onInspect("contact")}
          >
            Have something in mind? Let&apos;s talk <FiArrowUpRight />
          </button>
        </div>
        <div className="spatial-section" hidden={id !== "experience"}>
          <p className="spatial-eyebrow">04 / A constellation of experiences</p>
          <p className="spatial-scene-hint">
            Turn the sky or select a star. Trace the path to explore each
            chapter.
          </p>
          <div
            className="spatial-exhibit-controls"
            aria-label="Constellation controls"
          >
            <button onClick={onTraceJourney} aria-pressed={!!tracing}>
              {tracing ? <FiPause /> : <FiPlay />}
              {tracing
                ? "Stop tracing"
                : motion
                  ? "Trace my journey"
                  : "Start at beginning"}
            </button>
            <button onClick={onSkyReset}>
              <FiRotateCcw /> Reset view
            </button>
          </div>
          <div
            className="spatial-years"
            role="group"
            aria-label="Universe career milestones"
          >
            <button
              aria-pressed={milestone === -1}
              onClick={() => onMilestone(-1)}
            >
              <FiStar /> My beginning
            </button>
            {[...experiences].reverse().map((item, index) => (
              <button
                key={item.period}
                aria-pressed={milestone === experiences.length - 1 - index}
                aria-label={`${item.role}, ${item.period}`}
                title={`${item.role}, ${item.period}`}
                onClick={() => onMilestone(experiences.length - 1 - index)}
              >
                {item.period.split(" – ")[0]}
              </button>
            ))}
          </div>
          <div
            className="spatial-journey-progress"
            aria-label={`Chapter ${milestone < 0 ? 1 : experiences.length + 1 - milestone} of ${experiences.length + 1}`}
          >
            <span>
              Chapter {milestone < 0 ? 1 : experiences.length + 1 - milestone}{" "}
              of {experiences.length + 1}
            </span>
            <div aria-hidden="true">
              <i
                style={{
                  width: `${((milestone < 0 ? 1 : experiences.length + 1 - milestone) / (experiences.length + 1)) * 100}%`,
                }}
              />
            </div>
          </div>
          {chapter ? (
            <div className="spatial-selected-detail" key={milestone}>
              <p className="spatial-project-type">{chapter.period}</p>
              <h3 aria-live="polite">{chapter.role}</h3>
              <p className="spatial-company">{chapter.company}</p>
              <p className="spatial-location">
                <FiMapPin />
                {chapter.location}
              </p>
              {chapter.note && <p>{chapter.note}</p>}
              {chapter.works && (
                <ul className="spatial-work-list">
                  {chapter.works.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="spatial-selected-detail">
              <h3>My beginning</h3>
              <p>
                The first point in my constellation, connected to the roles and
                teams that shaped my work.
              </p>
              <button
                className="spatial-text-link"
                onClick={() => onMilestone(experiences.length - 1)}
              >
                Follow my career <FiArrowUpRight />
              </button>
            </div>
          )}
          <details className="spatial-archive">
            <summary>Education</summary>
            {education.map((item) => (
              <div key={item.degree}>
                <h4>{item.degree}</h4>
                <p>
                  {item.school}
                  <br />
                  {item.period}
                </p>
              </div>
            ))}
          </details>
          <details className="spatial-archive">
            <summary>Certifications</summary>
            <ul>
              {certifications.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </details>
          <details className="spatial-archive">
            <summary>Community & creative life</summary>
            <ul>
              {activities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </details>
        </div>
        <div className="spatial-section" hidden={id !== "contact"}>
          <p className="spatial-eyebrow">05 / The next possibility</p>
          <h3>A new conversation.</h3>
          <p>{profile.contactIntro}</p>
          <button className="spatial-text-link" onClick={onSignal}>
            Preview a signal around Earth <FiArrowUpRight />
          </button>
          <Contact
            embedded
            idPrefix="universe-"
            onStatusChange={onContactStatus}
          />
        </div>
      </div>
      <div className="spatial-panel-foot" aria-hidden="true">
        <span />
        Connected to{" "}
        {id === "about" || id === "contact"
          ? "Earth"
          : id === "skills"
            ? "the neural network"
            : id === "projects"
              ? "my work"
              : "my constellation"}
      </div>
    </article>
  );
}
