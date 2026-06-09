import Header from './components/header/Header';
import Footer from './components/footer/Footer';
import Scene3D from './components/scene/Scene3D';
import CustomCursor from './components/cursor/CustomCursor';
import IntroSequence from './components/intro/IntroSequence';
import About from './pages/About';
import Skills from './pages/Skills';
import Projects from './pages/Projects';
import Experience from './pages/Experience';
import Contact from './pages/Contact';
import { useReveal } from './hooks/useReveal';
import { useMouse } from './hooks/useMouse';
import { useState, useEffect } from 'react';

const Chapter = ({ id, kicker, children }) => {
    const [ref, visible] = useReveal();
    return (
        <section
            ref={ref}
            id={id}
            className={`chapter chapter-${id} ${visible ? 'is-visible' : ''}`}
            data-kicker={kicker}
        >
            <div className="chapter-inner">{children}</div>
        </section>
    );
};

function App() {
    const mouseRef = useMouse();
    const [introFinished, setIntroFinished] = useState(false);

    useEffect(() => {
        if (!introFinished) {
            document.body.style.overflow = 'hidden';
            window.scrollTo(0, 0);
        } else {
            document.body.style.overflow = '';
        }
    }, [introFinished]);

    return (
        <>
            {!introFinished && <IntroSequence onComplete={() => setIntroFinished(true)} />}
            <CustomCursor />
            <Scene3D mouseRef={mouseRef} />
            <Header />
            <main className="story">
                <Chapter id="about" kicker="01 / Hello">
                    <About />
                </Chapter>
                <Chapter id="skills" kicker="02 / Toolkit">
                    <Skills />
                </Chapter>
                <Chapter id="projects" kicker="03 / Work">
                    <Projects />
                </Chapter>
                <Chapter id="experience" kicker="04 / Journey">
                    <Experience />
                </Chapter>
                <Chapter id="contact" kicker="05 / Contact">
                    <Contact />
                </Chapter>
            </main>
            <Footer />
        </>
    );
}

export default App;
