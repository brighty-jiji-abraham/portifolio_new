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
        // First, type "Welcome 👋"
        const welcomeOptions = {
            strings: ["Welcome 👋"], // Texts to be typed
            typeSpeed: 100,
            backSpeed: 0,  // No backspacing
            backDelay: 1000,
            startDelay: 500,
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
            }, 1000); // Delay before starting B J A
        }

        if (animationState === 2) {
            // Type B J A (Step 1)
            setTimeout(() => {
                setAnimationState(3); // Delay before showing the parts after typing B J A
            }, 2000); // Adding delay to animation state 3 before expanding the parts

            // Expand the parts with delay
            setTimeout(() => {
                setAnimationState(4); // Show "righty"
            }, 3000); // Show righty after a delay

            setTimeout(() => {
                setAnimationState(5); // Show "iji"
            }, 4000); // Show "iji" after a short delay

            setTimeout(() => {
                setAnimationState(6); // Show "raham"
            }, 5000); // Show "raham" after a longer delay
        }

        if (animationState === 4) {
            // Erase everything
            setTimeout(() => {
                typedElement.current.innerHTML = ""; // Clear the welcome text
            }, 300); // Delay before erasing
        }

    }, [animationState]);

    return (
        <header>
            <h2 className="focus-in-contract-bck">
                <span ref={typedElement}></span> {/* Welcome text */}
                <span className={`typed-content ${animationState >= 2 ? 'show' : ''}`}>
                    B
                    <span className={`typed-expanded ${(animationState >= 3 && animationState >= 4) ? 'expand' : ''}`}>
                        <span className={`part part1 ${animationState >= 4 ? 'show' : ''}`}>righty </span>
                    </span>
                    J
                    <span className={`typed-expanded ${(animationState >= 3 && animationState >= 5) ? 'expand' : ''}`}>
                        <span className={`part part2 ${animationState >= 5 ? 'show' : ''}`}>iji </span>
                    </span>
                    A
                    <span className={`typed-expanded ${(animationState >= 3 && animationState >= 6) ? 'expand' : ''}`}>
                        <span className={`part part3 ${animationState >= 6 ? 'show' : ''}`}>raham</span>
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