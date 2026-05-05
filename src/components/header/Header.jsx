import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useActiveSection } from '../../hooks/useReveal';
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
    const active = useActiveSection(SECTION_IDS);

    const navRef = useRef(null);
    const linkRefs = useRef([]);
    const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

    const toggleMenu = () => setMenuOpen((open) => !open);
    const closeMenu = () => setMenuOpen(false);

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
                    </div>
                </nav>
            </header>
        </>
    );
};

export default Header;
