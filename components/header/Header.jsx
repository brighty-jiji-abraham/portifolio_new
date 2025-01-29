import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Typed from "typed.js";
import './Header.css'; // Ensure the CSS file is linked correctly

const Header = () => {
  const typedElement = useRef(null);
  const [animationState, setAnimationState] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen); // Toggles the menu state
  };

  useEffect(() => {
    // First, type "Welcome 👋 to " without cursor
    const welcomeOptions = {
      strings: ["Welcome 👋 to "," "], // Texts to be typed (separated into two words)
      typeSpeed: 50, // Faster typing speed
      backSpeed: 50, // Faster backspacing
      backDelay: 700, // Delay before backspacing starts
      startDelay: 300, // Shorter start delay
      loop: false, // We don't want this part to loop
      showCursor: false, // Hide cursor for the welcome text
      onStringTyped: () => {
        setAnimationState(1); // Set state to trigger next part after Welcome
      },
      onLastStringBackspaced: () => {
        if (animationState === 1) {
          deleteWelcome(); // Delete the welcome
        }
      },
    };

    const typedWelcome = new Typed(typedElement.current, welcomeOptions);

    function deleteWelcome() {
      typedWelcome.deleteAll(); // Delete all the texts
    }

    return () => {
      typedWelcome.destroy(); // Destroy the Typed instance
      setTimeout(() => {
        setAnimationState(2); // Proceed to the next stage of typing
      }, 500);
    };
  }, []);

  useEffect(() => {
    if (animationState === 2) {
      // After the backspace, type B J A with the same pattern
      setTimeout(() => {
        setAnimationState(3); // Proceed to the next stage of typing
      }, 500);
    }

    if (animationState === 3) {
      // Type B J A (Step 1)
      setTimeout(() => {
        setAnimationState(4); // Delay before showing the parts after typing B J A
      }, 500);

      // Type "righty"
      setTimeout(() => {
        const typedRighty = new Typed("#righty", {
          strings: ["righty"],
          typeSpeed: 40,
          backSpeed: 30,
          showCursor: false,
        });
        setAnimationState(5); // Set state to show "righty" after typing
      }, 1800);

      // Type "iji"
      setTimeout(() => {
        const typedIji = new Typed("#iji", {
          strings: ["iji"],
          typeSpeed: 50,
          backSpeed: 30,
          showCursor: false,
        });
        setAnimationState(6); // Set state to show "iji" after typing
      }, 1900);

      // Type "raham"
      setTimeout(() => {
        const typedRaham = new Typed("#raham", {
          strings: ["raham"],
          typeSpeed: 50,
          backSpeed: 30,
          showCursor: false,
          onComplete: () => setAnimationState(7), // Erase everything after "BJA" is typed
        });
      }, 2000);
    }
  }, [animationState]);

  return (
    <header>
      <h2 className="focus-in-contract-bck">
        <span ref={typedElement}></span> {/* Welcome text */}
        <span className={`typed-content ${animationState >= 3 ? 'show' : ''}`}>
          B
          <span className={`typed-expanded ${(animationState >= 4 && animationState >= 5) ? 'expand' : ''}`}>
            <span id="righty" className={`part part1 ${animationState >= 5 ? 'show' : ''}`}></span>
          </span>
          J
          <span className={`typed-expanded ${(animationState >= 4 && animationState >= 6) ? 'expand' : ''}`}>
            <span id="iji" className={`part part2 ${animationState >= 6 ? 'show' : ''}`}></span>
          </span>
          A
          <span className={`typed-expanded ${(animationState >= 4 && animationState >= 7) ? 'expand' : ''}`}>
            <span id="raham" className={`part part3 ${animationState >= 7 ? 'show' : ''}`}></span>
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
