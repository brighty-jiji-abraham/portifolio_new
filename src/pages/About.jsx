import { useEffect, useState } from 'react';
import './About.css';
import profileImg from '../assets/profile-img.jpg';
import { FaXTwitter, FaFacebookF, FaInstagram, FaGithub, FaLinkedinIn } from 'react-icons/fa6';
import { FiArrowDown } from 'react-icons/fi';
import { useTilt, useMagnetic } from '../hooks/useInteractive';
import { useScramble } from '../hooks/useScramble';

const ROLE_TEXT = 'AI-Native Software Engineer · R&D Specialist';
const NAME_LINE_1 = 'Brighty Jiji';
const NAME_LINE_2 = 'Abraham';

const socials = [
    { href: 'https://github.com/brighty-jiji-abraham', label: 'GitHub', cls: 'github', Icon: FaGithub },
    { href: 'https://www.linkedin.com/in/brightyjijiabraham/', label: 'LinkedIn', cls: 'linkedin', Icon: FaLinkedinIn },
    { href: 'https://twitter.com/B_J_A_008', label: 'Twitter / X', cls: 'twitter', Icon: FaXTwitter },
    { href: 'https://www.instagram.com/brighty.jiji.abraham/', label: 'Instagram', cls: 'instagram', Icon: FaInstagram },
    { href: 'https://www.facebook.com/brighty.jiji.abraham/', label: 'Facebook', cls: 'facebook', Icon: FaFacebookF },
];

/* 3D-tilting hero name extruded with text-shadow, rotates with cursor */
const Name3D = () => {
    const tilt = useTilt(12);
    return (
        <h1 className="name-3d" aria-label={`${NAME_LINE_1} ${NAME_LINE_2}`}>
            <span
                className="name-3d-stage"
                onMouseMove={tilt.onMouseMove}
                onMouseLeave={tilt.onMouseLeave}
            >
                <span className="name-3d-layer front">
                    {NAME_LINE_1}
                    <br />
                    {NAME_LINE_2}
                    <span className="ghost">👻</span>
                </span>
            </span>
        </h1>
    );
};

/* 3D image card back glow → image plate → accent ring orbiting in front, all in
   a perspective stage that tilts to follow the cursor.  */
const Image3D = () => {
    const tilt = useTilt(14);
    return (
        <div
            className="image-3d"
            onMouseMove={tilt.onMouseMove}
            onMouseLeave={tilt.onMouseLeave}
        >
            <div className="image-3d-stage">
                <div className="image-3d-shadow" aria-hidden="true"></div>
                <div className="image-3d-halo" aria-hidden="true"></div>
                <div className="image-3d-frame">
                    <img src={profileImg} alt="Brighty Jiji Abraham" />
                    <div className="image-3d-shine" aria-hidden="true"></div>
                </div>
                <div className="image-3d-orbit" aria-hidden="true">
                    <span className="orbit-dot dot-1"></span>
                    <span className="orbit-dot dot-2"></span>
                    <span className="orbit-dot dot-3"></span>
                    <span className="orbit-ring"></span>
                </div>
                <div className="image-3d-tag" aria-hidden="true">{'// AI · ML · WEB'}</div>
            </div>
        </div>
    );
};

const About = () => {
    const magnetic = useMagnetic(0.2);
    const [roleRef, scrambleRole] = useScramble(ROLE_TEXT, { duration: 700 });

    const [hideHint, setHideHint] = useState(false);
    useEffect(() => {
        const onScroll = () => setHideHint(window.scrollY > 80);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className="about">
            <div className="about-text">
                <span className="section-eyebrow">Hello, I&apos;m</span>
                <Name3D />
                <p
                    className="about-role"
                    ref={roleRef}
                    onMouseEnter={scrambleRole}
                    onFocus={scrambleRole}
                    tabIndex={0}
                    data-cursor
                >
                    {ROLE_TEXT}
                </p>
                <p className="about-bio">
                    Building systems that understand humans better than we understand ourselves.
                    I synthesise AI research, full-stack engineering, and creative design
                    into scalable, secure, human-centered solutions turning &ldquo;impossible&rdquo; into &ldquo;inevitable&rdquo;.
                </p>

                <ul className="about-stats" aria-label="At a glance">
                    <li><strong>5+</strong><span>years engineering</span></li>
                    <li><strong>100+</strong><span>devs mentored</span></li>
                    <li><strong>10+</strong><span>shipped projects</span></li>
                </ul>

                <div className="about-actions">
                    <a
                        className="btn btn-primary btn-magnetic"
                        href="#projects"
                        onMouseMove={magnetic.onMouseMove}
                        onMouseLeave={magnetic.onMouseLeave}
                    >
                        View projects
                    </a>
                    <a
                        className="btn btn-ghost btn-magnetic"
                        href="#contact"
                        onMouseMove={magnetic.onMouseMove}
                        onMouseLeave={magnetic.onMouseLeave}
                    >
                        Get in touch
                    </a>
                </div>

                <div className="social-links" aria-label="Social profiles">
                    {socials.map(({ href, label, cls, Icon }, i) => (
                        <a
                            key={cls}
                            href={href}
                            className={`social-icon ${cls}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={label}
                            style={{ animationDelay: `${0.4 + i * 0.08}s` }}
                        >
                            <Icon />
                        </a>
                    ))}
                </div>
            </div>

            <Image3D />

            <div className={`scroll-hint ${hideHint ? 'is-hidden' : ''}`} aria-hidden="true">
                <span className="scroll-hint-label">Scroll</span>
                <FiArrowDown className="scroll-hint-icon" />
            </div>
        </div>
    );
};

export default About;
