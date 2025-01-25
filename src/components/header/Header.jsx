import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Typed from "typed.js";
import './Header.css';

const Header = () => {
  const typedElement = useRef(null);
  const [animationState, setAnimationState] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen); // Toggles the menu state
  };

  useEffect(() => {
    // First, type "Welcome 👋" without cursor
    const welcomeOptions = {
      strings: ["Welcome 👋 to "], // Texts to be typed
      typeSpeed: 50, // Faster typing speed
      backSpeed: 30, // Faster backspacing
      backDelay: 700, // Faster delay before backspacing
      startDelay: 300, // Shorter start delay
      loop: false, // We don't want this part to loop
      showCursor: false, // Hide cursor for the welcome text
      onComplete: () => setAnimationState(1), // Set state to trigger next part after Welcome
    };

    const typedWelcome = new Typed(typedElement.current, welcomeOptions);

    return () => {
      typedWelcome.destroy();
    };
  }, []);

  useEffect(() => {
    if (animationState === 1) {
      // Type B J A after a short pause
      setTimeout(() => {
        setAnimationState(2);
      }, 200); // Delay before starting B J A
    }

    if (animationState === 2) {
      // Type B J A (Step 1)
      setTimeout(() => {
        setAnimationState(3); // Delay before showing the parts after typing B J A
        // Erase everything with backspace animation
        const eraseOptions = {
          strings: [""], // Empty string to backspace to
          typeSpeed: 50, // Typing speed for backspacing
          backSpeed: 10, // Backspacing speed
          fadeOut: true, // Enable fade out effect
          fadeOutClass: 'typed-fade-out', // CSS class for fade out effect
          fadeOutDelay: 300, // Delay before fade out starts
          showCursor: false, // Hide cursor during backspacing
        };

        const typedErase = new Typed(typedElement.current, eraseOptions);
      }, 500);

      // Type "righty"
      setTimeout(() => {
        const typedRighty = new Typed("#righty", {
          strings: ["righty"],
          typeSpeed: 40,
          backSpeed: 30,
          showCursor: false,
        });
        setAnimationState(4); // Set state to show "righty" after typing
      }, 800);

      // Type "iji"
      setTimeout(() => {
        const typedIji = new Typed("#iji", {
          strings: ["iji"],
          typeSpeed: 50,
          backSpeed: 30,
          showCursor: false,
        });
        setAnimationState(5); // Set state to show "iji" after typing
      }, 900);

      // Type "raham"
      setTimeout(() => {
        const typedRaham = new Typed("#raham", {
          strings: ["raham"],
          typeSpeed: 50,
          backSpeed: 30,
          showCursor: false,
          onComplete: () => setAnimationState(6), // Erase everything after "BJA" is typed
        });
      }, 1000);
    }
  }, [animationState]);

  return (
    <header>
      <h2 className="focus-in-contract-bck">
        <span ref={typedElement}></span> {/* Welcome text */}
        <span className={`typed-content ${animationState >= 2 ? 'show' : ''}`}>
          B
          <span className={`typed-expanded ${(animationState >= 3 && animationState >= 4) ? 'expand' : ''}`}>
            <span id="righty" className={`part part1 ${animationState >= 4 ? 'show' : ''}`}></span>
          </span>
          J
          <span className={`typed-expanded ${(animationState >= 3 && animationState >= 5) ? 'expand' : ''}`}>
            <span id="iji" className={`part part2 ${animationState >= 5 ? 'show' : ''}`}></span>
          </span>
          A
          <span className={`typed-expanded ${(animationState >= 3 && animationState >= 6) ? 'expand' : ''}`}>
            <span id="raham" className={`part part3 ${animationState >= 6 ? 'show' : ''}`}></span>
          </span>
        </span>
      </h2>

      {/* Navigation Menu */}
      <nav className={`nav ${menuOpen ? 'open' : ''}`}>
        <div className="hamburger" onClick={toggleMenu}>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
        </div>
        <div className={`nav-links focus-in-contract-bck ${menuOpen ? 'show' : ''}`}>
          <Link to="/" className="nav-link">About Me</Link>
          <Link to="/skills" className="nav-link">Skills</Link>
          <Link to="/projects" className="nav-link">Projects</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
