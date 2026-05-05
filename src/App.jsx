import Header from './components/header/Header';
import Footer from './components/footer/Footer';
import Scene3D from './components/scene/Scene3D';
import CustomCursor from './components/cursor/CustomCursor';
import About from './pages/About';
import Skills from './pages/Skills';
import Projects from './pages/Projects';
import Experience from './pages/Experience';
import Contact from './pages/Contact';
import { useReveal } from './hooks/useReveal';
import { useMouse } from './hooks/useMouse';

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

    return (
        <>
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
