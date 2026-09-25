import { lazy, Suspense, useRef, useState } from "react";
import Header from "./components/header/Header";
import CustomCursor from "./components/cursor/CustomCursor";
import IntroSequence from "./components/intro/IntroSequence";
import Section from "./components/section/Section";
import FlightDirector from "./components/section/FlightDirector";
import Footer from "./components/footer/Footer";
import ButtonEffects from "./components/buttons/ButtonEffects";
import About from "./pages/About";
import Skills from "./pages/Skills";
import Projects from "./pages/Projects";
import Experience from "./pages/Experience";
import Contact from "./pages/Contact";
import { useMouse } from "./hooks/useMouse";
import { usePageScroll } from "./hooks/usePageScroll";
import { useMotionPreference } from "./hooks/useMotionPreference";

const Scene3D = lazy(() => import("./components/scene/Scene3D"));

function App() {
  const mouseRef = useMouse();
  const scrollRef = usePageScroll();
  const reducedMotion = useMotionPreference();
  const orbitRef = useRef({ boost: 0 });
  const [paused, setPaused] = useState(false);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <IntroSequence reducedMotion={reducedMotion} />
      <CustomCursor />
      <ButtonEffects reducedMotion={reducedMotion} orbitRef={orbitRef} />
      <Header />
      <FlightDirector reducedMotion={reducedMotion} orbitRef={orbitRef} />
      <Suspense fallback={null}>
        <Scene3D
          mouseRef={mouseRef}
          scrollRef={scrollRef}
          orbitRef={orbitRef}
          reducedMotion={reducedMotion}
          paused={paused}
        />
      </Suspense>
      <main className="story" id="main-content" tabIndex={-1}>
        <Section id="about">
          <About
            orbitRef={orbitRef}
            reducedMotion={reducedMotion}
            paused={paused}
            onPauseChange={setPaused}
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
      </main>
    </>
  );
}

export default App;
