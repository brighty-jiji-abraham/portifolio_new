import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  FiArrowUpRight,
  FiCompass,
  FiGithub,
  FiLinkedin,
} from "react-icons/fi";
import profileImage from "../../assets/profile-thumbnail.webp";
import profile96 from "../../assets/profile-thumbnail-96.webp?no-inline";
import profile128 from "../../assets/profile-thumbnail-128.webp?no-inline";
import profile192 from "../../assets/profile-thumbnail-192.webp?no-inline";
import { profile, profileStats } from "../../data/profile";
import { ProfileName, ProfileRole, AnimatedNumber } from "./ProfileTypography";
import { useMagnetic } from "../../hooks/useInteractive";
import ProfileOverview from "./ProfileOverview";
import "./UniverseInfo.css";

const UniverseDetails = lazy(() => import("./UniverseDetails"));

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
  ...details
}) {
  const heading = useRef();
  const scroll = useRef();
  const [detailsVisited, setDetailsVisited] = useState(id !== "about");
  if (id !== "about" && !detailsVisited) setDetailsVisited(true);
  const magnetic = useMagnetic(0.12);
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
            <img src={profileImage}
              srcSet={`${profile96} 96w, ${profile128} 128w, ${profile192} 192w, ${profileImage} 256w`}
              sizes="(min-width: 640px) and (max-height: 600px) 55px, (max-width: 999px) 64px, 72px"
              alt={profile.name} width="76" height="76" fetchPriority="high" />
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
        {detailsVisited && <Suspense fallback={<p className="spatial-section" role="status">Opening this section…</p>}>
          <UniverseDetails id={id} motion={motion} onInspect={onInspect} {...details} />
        </Suspense>}
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
