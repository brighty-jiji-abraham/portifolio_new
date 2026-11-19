import {
  FiMapPin,
  FiBriefcase,
  FiBookOpen,
  FiAward,
  FiZap,
} from "react-icons/fi";
import { useSpotlight } from "../hooks/useInteractive";
import { playTick } from "../hooks/useSoundscape";
import "./Experience.css";

import {
  experiences,
  education,
  certifications,
  activities,
} from "../data/experience";

const SideBlock = ({
  Icon,
  title,
  subtitle,
  count,
  accent,
  children,
  onMouseMove,
  delayClass = "delay-1",
}) => (
  <section
    className={`side-block cinematic-reveal ${delayClass}`}
    style={{ "--card-accent": accent }}
    onMouseEnter={playTick}
    onMouseMove={onMouseMove}
  >
    <header className="side-block-head">
      <span className="side-block-icon" aria-hidden="true">
        <Icon />
      </span>
      <div className="side-block-headtext">
        <h3 className="side-block-title">{title}</h3>
        <p className="side-block-subtitle">{subtitle}</p>
      </div>
      {count != null && <span className="side-block-count">{count}</span>}
    </header>
    {children}
  </section>
);

const Experience = () => {
  const spotlight = useSpotlight();

  return (
    <div className="experience">
      <div className="experience-head cinematic-reveal delay-1">
        <span className="section-eyebrow">Experience</span>
        <h2 className="section-title">My journey so far</h2>
        <p className="section-lead">
          From student developer communities and a machine-learning internship
          to software development, AI product R&amp;D, and team leadership at iOSS.
        </p>
      </div>

      <div className="experience-grid">
        <section className="experience-main" aria-label="Work experience">
          <header className="main-head cinematic-reveal delay-2">
            <span className="side-block-icon" aria-hidden="true">
              <FiBriefcase />
            </span>
            <div className="side-block-headtext">
              <h3 className="side-block-title">Work</h3>
              <p className="side-block-subtitle">
                Learning, building, and growing
              </p>
            </div>
            <span className="side-block-count">{experiences.length}</span>
          </header>

          <ol className="exp-timeline">
            {experiences.map((exp, i) => (
              <li
                key={`${exp.company}-${i}`}
                className={`exp-item cinematic-reveal delay-${(i % 8) + 1} ${exp.current ? "is-current" : ""}`}
                onMouseEnter={playTick}
                onMouseMove={spotlight.onMouseMove}
              >
                <span className="exp-marker" aria-hidden="true"></span>
                <div className="exp-card">
                  <div className="exp-period">
                    {exp.period}
                    {exp.current && <span className="exp-now-pill">NOW</span>}
                  </div>
                  <h4 className="exp-role">{exp.role}</h4>
                  <div className="exp-company">{exp.company}</div>
                  <div className="exp-location">
                    <FiMapPin /> {exp.location}
                  </div>
                  {exp.note && <div className="exp-note">{exp.note}</div>}
                  {exp.works && (
                    <ul className="exp-works">
                      {exp.works.map((w) => (
                        <li key={w}>{w}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <aside className="experience-side">
          <SideBlock
            Icon={FiBookOpen}
            title="Education"
            subtitle="Where I studied"
            count={education.length}
            accent="#8C5A3C"
            delayClass="delay-3"
            onMouseMove={spotlight.onMouseMove}
          >
            <ul className="edu-list">
              {education.map((e) => (
                <li key={e.school} className="edu-item">
                  <div className="edu-degree">{e.degree}</div>
                  <div className="edu-school">{e.school}</div>
                  <div className="edu-period">{e.period}</div>
                </li>
              ))}
            </ul>
          </SideBlock>

          <SideBlock
            Icon={FiAward}
            title="Certifications"
            subtitle="Courses I completed"
            count={certifications.length}
            accent="#4B2E2B"
            delayClass="delay-5"
            onMouseMove={spotlight.onMouseMove}
          >
            <ul className="cert-list">
              {certifications.map((c) => (
                <li key={c} className="cert-item">
                  {c}
                </li>
              ))}
            </ul>
          </SideBlock>

          <SideBlock
            Icon={FiZap}
            title="Activities & Leadership"
            subtitle="Beyond the job"
            count={activities.length}
            accent="#f59e0b"
            delayClass="delay-7"
            onMouseMove={spotlight.onMouseMove}
          >
            <ul className="activity-list">
              {activities.map((a) => (
                <li key={a} className="activity-item">
                  {a}
                </li>
              ))}
            </ul>
          </SideBlock>
        </aside>
      </div>
    </div>
  );
};

export default Experience;
