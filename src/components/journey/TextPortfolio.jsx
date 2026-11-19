import { useEffect } from "react";
import { FiCompass } from "react-icons/fi";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import Section from "../section/Section";
import TextHero from "./TextHero";
import Skills from "../../pages/Skills";
import Projects from "../../pages/Projects";
import Experience from "../../pages/Experience";
import Contact from "../../pages/Contact";
import { usePageScroll } from "../../hooks/usePageScroll";
import "./TextPortfolio.css";

export default function TextPortfolio({
  settings,
  onEnter,
  unavailable,
  reducedMotion,
  paused,
}) {
  usePageScroll();
  useEffect(() => {
    document.getElementById("main-content")?.focus({ preventScroll: true });
  }, []);
  return (
    <div
      className="portfolio-text-view"
      data-motion={!reducedMotion && !paused}
    >
      <Header settings={settings} />
      {!unavailable && (
        <button className="universe-return" onClick={onEnter}>
          <FiCompass /> 3D view
        </button>
      )}
      {unavailable && (
        <p className="scene-unavailable" role="status">
          The 3D view isn&apos;t available in this browser. You can explore my
          complete portfolio below.
        </p>
      )}
      <Section id="about">
        <TextHero
          motion={!reducedMotion && !paused}
          onEnter={onEnter}
          unavailable={unavailable}
        />
      </Section>
      <Section id="skills">
        <Skills />
      </Section>
      <Section id="projects">
        <Projects />
      </Section>
      <Section id="experience">
        <Experience />
      </Section>
      <Section id="contact">
        <Contact />
      </Section>
      <Footer />
    </div>
  );
}
