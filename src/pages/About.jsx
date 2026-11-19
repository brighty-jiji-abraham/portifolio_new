import { useState } from "react";
import "./About.css";
import profileImg from "../assets/profile-img.jpg";
import {
  FaXTwitter,
  FaFacebookF,
  FaInstagram,
  FaGithub,
  FaLinkedinIn,
} from "react-icons/fa6";
import {
  FiArrowDown,
  FiArrowUpRight,
  FiPause,
  FiPlay,
  FiRotateCw,
} from "react-icons/fi";
import { useTilt, useMagnetic } from "../hooks/useInteractive";
import { useScramble } from "../hooks/useScramble";
import { profile, profileStats } from "../data/profile";

const ROLE_TEXT = profile.headline;
const socials = [
  {
    href: profile.links.github,
    label: "GitHub",
    cls: "github",
    Icon: FaGithub,
  },
  {
    href: profile.links.linkedin,
    label: "LinkedIn",
    cls: "linkedin",
    Icon: FaLinkedinIn,
  },
  {
    href: profile.links.twitter,
    label: "Twitter / X",
    cls: "twitter",
    Icon: FaXTwitter,
  },
  {
    href: profile.links.instagram,
    label: "Instagram",
    cls: "instagram",
    Icon: FaInstagram,
  },
  {
    href: profile.links.facebook,
    label: "Facebook",
    cls: "facebook",
    Icon: FaFacebookF,
  },
];

export default function About({
  orbitRef,
  reducedMotion,
  paused,
  onPauseChange,
  sceneUnavailable = false,
}) {
  const magnetic = useMagnetic(0.14);
  const tilt = useTilt(5);
  const [roleRef, scrambleRole] = useScramble(ROLE_TEXT, { duration: 400 });
  const [spinning, setSpinning] = useState(false);
  const toggleOrbit = () => {
    onPauseChange(!paused);
  };
  const spin = () => {
    orbitRef.current.boost = 12;
    onPauseChange(false);
    setSpinning(true);
  };
  return (
    <div className={`about${sceneUnavailable ? " no-scene" : ""}`}>
      <div className="about-text">
        <div className="profile-intro">
          <img
            src={profileImg}
            alt="Brighty Jiji Abraham"
            width="88"
            height="88"
          />
          <div>
            <span>Hello, fellow explorer</span>
            <span className="profile-location">
              I&apos;m Brighty. Welcome to my world.
            </span>
          </div>
        </div>
        <h1 id="about-title" tabIndex={-1} className="name-3d" {...tilt}>
          Brighty Jiji
          <br />
          Abraham<span className="name-period">.</span>
        </h1>
        <p className="about-role" ref={roleRef} onMouseEnter={scrambleRole}>
          {ROLE_TEXT}
        </p>
        <p className="about-bio">
          {profile.bio}
        </p>
        <div className="about-actions">
          <a
            className="btn btn-primary btn-magnetic"
            href="#projects"
            {...magnetic}
          >
            Explore my work <FiArrowUpRight />
          </a>
          <a
            className="btn btn-ghost btn-magnetic"
            href="#skills"
            {...magnetic}
          >
            Explore my skills <FiArrowDown />
          </a>
          <a className="about-contact-link" href="#contact">
            Let&apos;s talk
          </a>
        </div>
        <ul className="about-stats" aria-label="At a glance">
          {profileStats.map(({ value, suffix, label }) => (
            <li key={label}>
              <strong>{value}{suffix}</strong>
              <span>{label}</span>
            </li>
          ))}
        </ul>
        <div className="social-links" aria-label="Social profiles">
          {socials.map(({ href, label, cls, Icon }) => (
            <a
              key={cls}
              href={href}
              className={`social-icon ${cls}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
            >
              <Icon />
            </a>
          ))}
          <span className="social-caption">Find me around the internet</span>
        </div>
      </div>

      <div className="hero-universe">
        <div className="universe-caption">
          <span className="live-dot" /> My little tech universe
        </div>
        <div
          id="hero-world"
          className="hero-world"
          role="img"
          aria-label="A 3D Earth surrounded by 20 orbiting programming tools, rockets, asteroids, a satellite, a ringed planet, and a spacecraft"
        >
          <div className="world-guide" aria-hidden="true" />
          <span className="world-coordinate" aria-hidden="true">
            9.49° N / 76.33° E
          </span>
        </div>
        <div className="explorer-badge">
          <div>
            <strong>Earthling. Engineer. Explorer.</strong>
            <span>Based in Kerala. Building for everywhere.</span>
          </div>
          <span className="explorer-spark" aria-hidden="true">
            ✧
          </span>
        </div>
        {!reducedMotion && (
          <div className="orbit-controls" aria-label="Globe animation controls">
            <button
              type="button"
              onClick={spin}
              className={spinning ? "is-spinning" : ""}
              onAnimationEnd={() => setSpinning(false)}
            >
              <FiRotateCw /> Give it a spin
            </button>
            <button
              type="button"
              onClick={toggleOrbit}
              aria-pressed={paused}
              aria-label={
                paused ? "Resume orbit animation" : "Pause orbit animation"
              }
            >
              {paused ? <FiPlay /> : <FiPause />}
            </button>
          </div>
        )}
      </div>
      <a className="scroll-hint" href="#skills">
        <span className="scroll-mouse" aria-hidden="true" />
        <span>A journey through my skills</span>
        <FiArrowDown />
      </a>
    </div>
  );
}
