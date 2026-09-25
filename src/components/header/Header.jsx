import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { FaMoon, FaSun, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { useSoundscape } from "../../hooks/useSoundscape";
import "./Header.css";

const FULL_NAME = "Brighty Jiji Abraham";
const SECTIONS = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Work" },
  { id: "experience", label: "Journey" },
  { id: "contact", label: "Contact" },
];

const initialTheme = () => {
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* Storage may be disabled in a private browser. */
  }
  return "dark";
};

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(initialTheme);
  const [active, setActive] = useState("about");
  const { muted, toggleMute } = useSoundscape();

  const navRef = useRef(null);
  const linkRefs = useRef([]);
  const [indicator, setIndicator] = useState({
    left: 0,
    width: 0,
    ready: false,
  });

  const toggleMenu = () => setMenuOpen((open) => !open);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    try {
      localStorage.setItem("theme", newTheme);
    } catch {
      /* Theme still works without storage. */
    }
  };

  useEffect(() => {
    const onSection = (e) => setActive(e.detail);
    window.addEventListener("portfolio-section", onSection);
    return () => window.removeEventListener("portfolio-section", onSection);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const dismiss = (event) => {
      if (event.type === "keydown" && event.key !== "Escape") return;
      if (event.type === "pointerdown" && event.target.closest(".app-header"))
        return;
      setMenuOpen(false);
      if (event.type === "keydown")
        document.querySelector(".hamburger")?.focus();
    };
    document.addEventListener("keydown", dismiss);
    document.addEventListener("pointerdown", dismiss);
    return () => {
      document.removeEventListener("keydown", dismiss);
      document.removeEventListener("pointerdown", dismiss);
    };
  }, [menuOpen]);

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
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [activeIndex]);

  return (
    <>
      <div className="scroll-progress" aria-hidden="true" />

      <header className="app-header">
        <a
          href="#about"
          className="brand"
          aria-label="Home"
          onClick={closeMenu}
        >
          <span className="brand-mark" aria-hidden="true">
            <span className="brand-dot"></span>
          </span>
          <span className="brand-name">
            {FULL_NAME.split("").map((ch, i) => (
              <span
                key={i}
                className="letter"
                style={{ animationDelay: `${i * 35}ms` }}
              >
                {ch === " " ? " " : ch}
              </span>
            ))}
          </span>
        </a>

        <nav className="app-nav" aria-label="Main navigation">
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
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            >
              {theme === "light" ? <FaMoon /> : <FaSun />}
            </button>
          </div>

          <button
            type="button"
            className={`hamburger ${menuOpen ? "is-open" : ""}`}
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
            className={`nav-links ${menuOpen ? "show" : ""}`}
            ref={navRef}
          >
            <span
              className={`nav-indicator ${indicator.ready ? "is-ready" : ""}`}
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
                className={`nav-link ${active === id ? "active" : ""}`}
                onClick={closeMenu}
                aria-current={active === id ? "location" : undefined}
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
                  aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
                >
                  {theme === "light" ? <FaMoon /> : <FaSun />}
                </button>
              </div>
              <div className="music-copyright">
                <strong>{muted ? "Sound is off" : "Sound is on"}</strong>
                <span>A little atmosphere for your visit.</span>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Header;
