import {
  FiArrowDown,
  FiArrowUpRight,
  FiCompass,
  FiGithub,
  FiLinkedin,
} from "react-icons/fi";
import profile from "../../assets/profile-img.jpg";
import { ProfileName, ProfileRole, AnimatedNumber } from "./ProfileTypography";
import { useMagnetic } from "../../hooks/useInteractive";
import { profile as profileContent, profileStats } from "../../data/profile";

export default function TextHero({ motion, onEnter, unavailable }) {
  const magnetic = useMagnetic(0.14);
  return (
    <div className="text-hero">
      <div className="text-hero-top cinematic-reveal">
        <span>01 / A little introduction</span>
        <span>
          <i /> Based in {profileContent.region}
        </span>
      </div>
      <div className="text-hero-copy">
        <p className="text-hello cinematic-reveal">
          Hello, fellow explorer <span aria-hidden="true">✧</span>
        </p>
        <ProfileName id="about-title" motion={motion} />
        <ProfileRole className="text-hero-role" motion={motion} />
        <p className="text-hero-bio cinematic-reveal">
          {profileContent.bio}
        </p>
        <div className="text-hero-actions cinematic-reveal">
          <a
            href="#projects"
            className="btn btn-primary"
            {...(motion ? magnetic : {})}
          >
            Explore my work <FiArrowUpRight />
          </a>
          <a href="#contact" className="text-inline-link">
            Let&apos;s talk <FiArrowUpRight />
          </a>
        </div>
        <div className="text-hero-socials cinematic-reveal">
          <a
            href={profileContent.links.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FiGithub /> GitHub
          </a>
          <a
            href={profileContent.links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FiLinkedin /> LinkedIn
          </a>
        </div>
      </div>
      <figure className="text-portrait cinematic-reveal">
        <svg
          className="portrait-orbit"
          viewBox="0 0 400 500"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <ellipse
            cx="200"
            cy="240"
            rx="181"
            ry="205"
            transform="rotate(-28 200 240)"
          />
          <ellipse
            cx="200"
            cy="240"
            rx="143"
            ry="225"
            transform="rotate(35 200 240)"
          />
        </svg>
        <div className="portrait-photo">
          <img
            src={profile}
            alt="Brighty Jiji Abraham outdoors in Kerala"
            width="600"
            height="760"
          />
        </div>
        <span className="portrait-star" aria-hidden="true">
          ✧
        </span>
        <figcaption>
          <span>Earthling. Engineer. Explorer.</span>
          <small>Curiosity is my constant.</small>
        </figcaption>
        {!unavailable && (
          <button className="portrait-flight" onClick={onEnter}>
            <FiCompass /> Step into my universe <FiArrowUpRight />
          </button>
        )}
      </figure>
      <div className="text-hero-bottom cinematic-reveal">
        <dl>
          {profileStats.map(({ value, suffix, label }) => (
            <div key={label}>
              <dt>
                <AnimatedNumber value={value} suffix={suffix} motion={motion} />
              </dt>
              <dd>{label}</dd>
            </div>
          ))}
        </dl>
        <a href="#skills">
          Discover the toolkit <FiArrowDown />
        </a>
      </div>
    </div>
  );
}
