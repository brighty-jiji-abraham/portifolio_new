import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useActiveSection } from '../../hooks/useReveal';
import { FaMoon, FaSun, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { useSoundscape } from '../../hooks/useSoundscape';
import './Header.css';

const FULL_NAME = 'Brighty Jiji Abraham';
const SECTIONS = [
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Work' },
    { id: 'experience', label: 'Journey' },
    { id: 'contact', label: 'Contact' },
];
const SECTION_IDS = SECTIONS.map((s) => s.id);

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [progress, setProgress] = useState(0);
    const [theme, setTheme] = useState('dark');
    const { muted, toggleMute } = useSoundscape();
    const active = useActiveSection(SECTION_IDS);

    const navRef = useRef(null);
    const linkRefs = useRef([]);
    const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

    const toggleMenu = () => setMenuOpen((open) => !open);
    const closeMenu = () => setMenuOpen(false);

    // Initialize theme from local storage or OS preference
    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            setTheme(storedTheme);
            document.documentElement.setAttribute('data-theme', storedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            setTheme('light');
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 8);
            const max =
                document.documentElement.scrollHeight - window.innerHeight;
            setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    /* Position the sliding indicator behind the active nav link */
    const activeIndex = SECTIONS.findIndex((s) => s.id === active);
    useLayoutEffect(() => {
        const update = () => {
            const navEl = navRef.current;
            const linkEl = linkRefs.current[activeIndex];
            if (!navEl || !linkEl) return;
            const navRect = navEl.getBoundingClientRect();
            const linkRect = linkEl.getBoundingClientRect();
            setIndicator({
                left: linkRect.left - navRect.left,
                width: linkRect.width,
                ready: true,
            });
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, [activeIndex]);

    const handleNavClick = (e, id) => {
        e.preventDefault();
        closeMenu();
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', `#${id}`);
    };

    return (
        <>
            <div
                className="scroll-progress"
                style={{ transform: `scaleX(${progress})` }}
                aria-hidden="true"
            />

            <header className={`app-header ${scrolled ? 'is-scrolled' : ''}`}>
                <a
                    href="#about"
                    className="brand"
                    aria-label="Home"
                    onClick={(e) => handleNavClick(e, 'about')}
                >
                    <span className="brand-mark" aria-hidden="true">
                        <span className="brand-dot"></span>
                    </span>
                    <span className="brand-name">
                        {FULL_NAME.split('').map((ch, i) => (
                            <span
                                key={i}
                                className="letter"
                                style={{ animationDelay: `${i * 35}ms` }}
                            >
                                {ch === ' ' ? ' ' : ch}
                            </span>
                        ))}
                    </span>
                </a>

                <nav className="app-nav">
                    <div className="desktop-controls">
                        <button
                            type="button"
                            className="theme-toggle"
                            onClick={toggleMute}
                            aria-label={muted ? "Unmute soundscape" : "Mute soundscape"}
                        >
                            {muted ? <FaVolumeMute /> : <FaVolumeUp />}
                        </button>

                        <button
                            type="button"
                            className="theme-toggle"
                            onClick={toggleTheme}
                            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                        >
                            {theme === 'light' ? <FaMoon /> : <FaSun />}
                        </button>
                    </div>
                    
                    <button
                        type="button"
                        className={`hamburger ${menuOpen ? 'is-open' : ''}`}
                        aria-label="Toggle navigation menu"
                        aria-expanded={menuOpen}
                        aria-controls="primary-nav"
                        onClick={toggleMenu}
                    >
                        <span className="line"></span>
                        <span className="line"></span>
                        <span className="line"></span>
                    </button>
                    
                    <div
                        id="primary-nav"
                        className={`nav-links ${menuOpen ? 'show' : ''}`}
                        ref={navRef}
                    >
                        <span
                            className={`nav-indicator ${indicator.ready ? 'is-ready' : ''}`}
                            style={{
                                transform: `translateX(${indicator.left}px)`,
                                width: `${indicator.width}px`,
                            }}
                            aria-hidden="true"
                        />
                        {SECTIONS.map(({ id, label }, i) => (
                            <a
                                key={id}
                                ref={(el) => (linkRefs.current[i] = el)}
                                href={`#${id}`}
                                className={`nav-link ${active === id ? 'active' : ''}`}
                                onClick={(e) => handleNavClick(e, id)}
                            >
                                {label}
                            </a>
                        ))}

                        <div className="mobile-menu-footer">
                            <div className="mobile-controls">
                                <button
                                    type="button"
                                    className="theme-toggle"
                                    onClick={toggleMute}
                                    aria-label={muted ? "Unmute soundscape" : "Mute soundscape"}
                                >
                                    {muted ? <FaVolumeMute /> : <FaVolumeUp />}
                                </button>
                                <button
                                    type="button"
                                    className="theme-toggle"
                                    onClick={toggleTheme}
                                    aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                                >
                                    {theme === 'light' ? <FaMoon /> : <FaSun />}
                                </button>
                            </div>
                            <div className="music-copyright">
                                <strong>Now Playing</strong>
                                <span>Deep Space Cinematic Soundscape</span>
                                <span>© 2026 Cosmic Audio / CC-BY</span>
                            </div>
                        </div>
                    </div>
                </nav>
            </header>
        </>
    );
};

export default Header;
