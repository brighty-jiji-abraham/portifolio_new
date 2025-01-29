import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Typed from "typed.js";
import './Header.css';

const Header = () => {
  const typedElement = useRef(null);
  const rightyTyped = useRef(null);
  const ijiTyped = useRef(null);
  const rahamTyped = useRef(null);
  const [animationState, setAnimationState] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  useEffect(() => {
    const welcomeOptions = {
      strings: ["Welcome 👋 to ", ""], // Changed to empty string for proper backspacing
      typeSpeed: 50,
      backSpeed: 50,
      backDelay: 700,
      startDelay: 300,
      loop: false,
      showCursor: false,
      onStringTyped: () => { // Changed to onComplete for reliable triggering
        setTimeout(() => setAnimationState(2), 10);
      },
    };

    const typedWelcome = new Typed(typedElement.current, welcomeOptions);

    return () => {
      typedWelcome.destroy();
    };
  }, []);

  useEffect(() => {
    const handleAnimations = async () => {
      switch (animationState) {
        case 2:
          await new Promise(resolve => setTimeout(resolve, 100));
          setAnimationState(3);
          break;
        
        case 3:
          await new Promise(resolve => setTimeout(resolve, 800));
          setAnimationState(4);
          
          // Type "righty"
          await new Promise(resolve => setTimeout(resolve, 1800));
          rightyTyped.current = new Typed("#righty", {
            strings: ["righty"],
            typeSpeed: 40,
            backSpeed: 30,
            showCursor: false,
          });
          setAnimationState(5);

          // Type "iji"
          await new Promise(resolve => setTimeout(resolve, 100));
          ijiTyped.current = new Typed("#iji", {
            strings: ["iji"],
            typeSpeed: 50,
            backSpeed: 30,
            showCursor: false,
          });
          setAnimationState(6);

          // Type "raham"
          await new Promise(resolve => setTimeout(resolve, 100));
          rahamTyped.current = new Typed("#raham", {
            strings: ["raham"],
            typeSpeed: 50,
            backSpeed: 30,
            showCursor: false,
          });
          setAnimationState(7);
          break;

        default:
          break;
      }
    };

    handleAnimations();
  }, [animationState]);

  return (
    <header>
      <h2 className="focus-in-contract-bck">
        <span ref={typedElement}></span>
        <span className={`typed-content ${animationState >= 3 ? 'show' : ''}`}>
          B
          <span className={`typed-expanded ${animationState >= 5 ? 'expand' : ''}`}>
            <span id="righty" className={`part part1 ${animationState >= 5 ? 'show' : ''}`}></span>
          </span>
          J
          <span className={`typed-expanded ${animationState >= 6 ? 'expand' : ''}`}>
            <span id="iji" className={`part part2 ${animationState >= 6 ? 'show' : ''}`}></span>
          </span>
          A
          <span className={`typed-expanded ${animationState >= 7 ? 'expand' : ''}`}>
            <span id="raham" className={`part part3 ${animationState >= 7 ? 'show' : ''}`}></span>
          </span>
        </span>
      </h2>

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