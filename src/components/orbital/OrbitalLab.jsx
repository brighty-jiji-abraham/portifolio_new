import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  FiArrowDown,
  FiArrowRight,
  FiArrowUpRight,
  FiChevronLeft,
  FiChevronRight,
  FiPause,
  FiPlay,
  FiRotateCcw,
  FiX,
} from "react-icons/fi";
import {
  DOCUMENTS,
  FLIGHT_PHASES,
  QUESTIONS,
  RETRIEVAL_STAGES,
} from "./mission";
import useMission from "./useMission";
import "./OrbitalLab.css";

const OrbitalScene = lazy(() => import("./OrbitalScene"));

class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? (
      <div className="orbital-canvas-fallback">
        The 3D scene couldn&apos;t load. The project exhibit is still available.
      </div>
    ) : (
      this.props.children
    );
  }
}

function OrbitMark() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="10" stroke="currentColor" />
      <ellipse
        cx="24"
        cy="24"
        rx="22"
        ry="9"
        transform="rotate(-35 24 24)"
        stroke="currentColor"
      />
      <circle cx="40" cy="13" r="3" fill="currentColor" />
    </svg>
  );
}

export default function OrbitalLab({ reducedMotion }) {
  const section = useRef(null);
  const canvasContainer = useRef(null);
  const manualQuality = useRef(false);
  const exhibitTitle = useRef(null);
  const launchButton = useRef(null);
  const [active, setActive] = useState(true);
  const [sceneActive, setSceneActive] = useState(true);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [finish, setFinish] = useState("ceramic");
  const [quality, setQuality] = useState(() =>
    window.matchMedia("(max-width: 760px)").matches ? "low" : "high",
  );
  const mission = useMission({ active, reducedMotion });
  const {
    state,
    motion,
    progressElement,
    launch,
    dock,
    reset,
    chooseQuery,
    runQuery,
    selectSource,
    togglePause,
    rotate,
  } = mission;
  const query = QUESTIONS[state.query];
  const selectedSource = DOCUMENTS.find(
    (document) => document.id === state.source,
  );
  const running = state.stage >= 0 && state.stage < 3;
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => {
    setFailed(true);
    setReady(true);
  }, []);
  const onSlow = useCallback(() => {
    if (!manualQuality.current) setQuality("low");
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === section.current) setActive(entry.isIntersecting);
          else setSceneActive(entry.isIntersecting);
        });
      },
      { threshold: 0.02 },
    );
    if (section.current) observer.observe(section.current);
    if (canvasContainer.current) observer.observe(canvasContainer.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const rect = section.current?.getBoundingClientRect();
    if (
      state.mode === "lab" &&
      rect?.bottom > 0 &&
      rect.top < window.innerHeight
    ) {
      exhibitTitle.current?.focus({ preventScroll: true });
    }
  }, [state.mode]);

  useEffect(() => {
    if (state.mode !== "flight") return;
    const skip = (event) => {
      if (event.key === "Escape") dock();
    };
    window.addEventListener("keydown", skip);
    return () => window.removeEventListener("keydown", skip);
  }, [state.mode, dock]);

  const returnToOrbit = () => {
    reset();
    requestAnimationFrame(() =>
      launchButton.current?.focus({ preventScroll: true }),
    );
  };

  return (
    <section
      id="about"
      ref={section}
      className={`orbital-lab chapter orbital-${state.mode}${failed ? " orbital-failed" : ""}`}
      data-mode={state.mode}
      data-ready={ready}
      data-paused={state.paused}
      aria-label="Brighty's orbital laboratory"
    >
      <div ref={canvasContainer} className="orbital-canvas" aria-hidden="true">
        <SceneBoundary onFailure={onFailure}>
          <Suspense fallback={null}>
            <OrbitalScene
              motion={motion}
              mode={state.mode}
              active={sceneActive}
              paused={state.paused}
              reducedMotion={reducedMotion}
              quality={quality}
              finish={finish}
              query={query}
              source={state.source}
              onSelect={selectSource}
              onReady={onReady}
              onFailure={onFailure}
              onSlow={onSlow}
              revision={state.revision}
            />
          </Suspense>
        </SceneBoundary>
      </div>
      <div className="orbital-vignette" aria-hidden="true" />
      <div
        className="orbital-letterbox orbital-letterbox-top"
        aria-hidden="true"
      />
      <div
        className="orbital-letterbox orbital-letterbox-bottom"
        aria-hidden="true"
      />

      <div className="orbital-heading">
        <span className="orbital-insignia">
          <OrbitMark /> Orbital lab
        </span>
        <span className="orbital-location">
          {state.mode === "lab"
            ? "Research bay / Hybrid retrieval"
            : "Earth orbit / Departure lounge"}
        </span>
      </div>

      {state.mode === "orbit" && (
        <>
          <div className="orbital-introduction">
            <p className="orbital-byline">
              A small world by Brighty Jiji Abraham
            </p>
            <h1>
              Ideas,
              <br />
              in orbit.
            </h1>
            <p className="orbital-lead">
              AI research. Thoughtful engineering.
              <br />A little curiosity beyond the atmosphere.
            </p>
            <div className="orbital-hero-actions">
              <button
                ref={launchButton}
                className="orbital-primary"
                onClick={failed ? dock : launch}
                disabled={!ready && !reducedMotion}
              >
                <span>
                  {!ready && !reducedMotion
                    ? "Preparing the spacecraft"
                    : reducedMotion || failed
                      ? "Open the research lab"
                      : "Enter the orbital lab"}
                </span>
                <FiArrowRight />
              </button>
              <a className="orbital-text-link" href="#projects">
                Explore my work <FiArrowUpRight />
              </a>
            </div>
            <p className="orbital-flight-note">
              {failed
                ? "The 3D view is unavailable. The interactive project is ready."
                : reducedMotion
                ? "Reduced motion is on. Enter the exhibit directly."
                : "A 12-second journey. You're in control."}
            </p>
          </div>
          <div className="orbital-destination" aria-hidden="true">
            <span className="orbital-destination-cross" />
            <span>
              Research station<strong>Docking bay 07</strong>
            </span>
          </div>
          <div
            className="orbital-finish"
            role="group"
            aria-label="Station hull finish"
          >
            <span>Hull finish</span>
            <button
              className="finish-ceramic"
              aria-label="Ceramic hull"
              aria-pressed={finish === "ceramic"}
              onClick={() => setFinish("ceramic")}
              title="Ceramic hull"
            />
            <button
              className="finish-graphite"
              aria-label="Graphite hull"
              aria-pressed={finish === "graphite"}
              onClick={() => setFinish("graphite")}
              title="Graphite hull"
            />
          </div>
        </>
      )}

      {state.mode === "flight" && (
        <div className="orbital-flight-ui">
          <div className="orbital-flight-copy" role="status" aria-live="polite">
            <span>
              {state.paused
                ? "Journey paused"
                : FLIGHT_PHASES[state.phase].detail}
            </span>
            <h2>{FLIGHT_PHASES[state.phase].label}</h2>
          </div>
          <progress
            ref={progressElement}
            className="orbital-flight-progress"
            max="1"
            defaultValue="0"
            aria-label="Docking journey progress"
          />
          <div className="orbital-flight-actions">
            <button className="orbital-small-button" onClick={togglePause}>
              {state.paused ? <FiPlay /> : <FiPause />}
              {state.paused ? "Resume" : "Pause"}
            </button>
            <button className="orbital-small-button" onClick={dock}>
              Skip to the lab <FiArrowRight />
            </button>
          </div>
        </div>
      )}

      {state.mode === "lab" && (
        <>
          <div className="orbital-exhibit-instruction">
            <span className="orbital-live-dot" /> Interactive research exhibit
            <p>Select a floating document to inspect its source.</p>
            <div
              className="orbital-rotation-controls"
              role="group"
              aria-label="Rotate the exhibit"
            >
              <button
                aria-label="Rotate exhibit left"
                onClick={() => rotate(-1)}
              >
                <FiChevronLeft />
              </button>
              <span>Drag the core to rotate</span>
              <button
                aria-label="Rotate exhibit right"
                onClick={() => rotate(1)}
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
          <article
            className="orbital-exhibit-panel"
            aria-label="Hybrid RAG Retriever project exhibit"
          >
            <div className="orbital-project-label">
              <span>From the project archive</span>
              <span className="orbital-demo-tag">Sample documents</span>
            </div>
            <h2 ref={exhibitTitle} tabIndex={-1}>
              Hybrid RAG
              <br />
              Retriever
            </h2>
            <p className="orbital-project-description">
              Watch a question become a grounded answer. Follow keyword matches,
              related meaning, and the sources that connect them.
            </p>
            <label
              className="orbital-question-label"
              htmlFor="orbital-question"
            >
              Choose a question
            </label>
            <select
              id="orbital-question"
              value={state.query}
              onChange={(event) => chooseQuery(Number(event.target.value))}
            >
              {QUESTIONS.map((question, i) => (
                <option key={question.label} value={i}>
                  {question.label}
                </option>
              ))}
            </select>
            <button
              className="orbital-primary orbital-run"
              onClick={runQuery}
              disabled={running}
            >
              <span>
                {running
                  ? RETRIEVAL_STAGES[state.stage]
                  : state.stage === 3
                    ? "Run it again"
                    : "Run retrieval"}
              </span>
              {running ? (
                <span className="orbital-spinner" aria-hidden="true" />
              ) : (
                <FiPlay />
              )}
            </button>
            <div className="orbital-retrieval-track" aria-hidden="true">
              {["Keywords", "Meaning", "Context", "Answer"].map((label, i) => (
                <span
                  key={label}
                  className={state.stage >= i ? "is-complete" : ""}
                >
                  <i />
                  {label}
                </span>
              ))}
            </div>
            <div
              className="orbital-result"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              {state.stage === 3 ? (
                <>
                  <strong>The answer</strong>
                  <p>{query.answer}</p>
                </>
              ) : running ? (
                <p>
                  {RETRIEVAL_STAGES[state.stage]}… Follow the light moving
                  through the exhibit.
                </p>
              ) : (
                <p>
                  This guided demonstration uses four sample passages to
                  illustrate the project&apos;s retrieval flow.
                </p>
              )}
            </div>
            <div className="orbital-source-heading">
              <span>Inspect the sources</span>
              <span>
                {state.stage === 3
                  ? `${query.sources.length} used in this answer`
                  : "4 sample passages"}
              </span>
            </div>
            <div className="orbital-source-list">
              {DOCUMENTS.map((document, i) => (
                <button
                  key={document.id}
                  onClick={() => selectSource(document.id)}
                  aria-expanded={state.source === document.id}
                  aria-controls="orbital-source-detail"
                  className={`${state.source === document.id ? "is-selected" : ""} ${state.stage === 3 && query.sources.includes(document.id) ? "is-used" : ""}`}
                >
                  <span className="orbital-source-number">{i + 1}</span>
                  <span>{document.title}</span>
                  <FiArrowUpRight />
                </button>
              ))}
            </div>
            {selectedSource && (
              <div id="orbital-source-detail" className="orbital-source-detail">
                <div>
                  <strong>{selectedSource.tag}</strong>
                  <button
                    onClick={() => selectSource(null)}
                    aria-label="Close source detail"
                  >
                    <FiX />
                  </button>
                </div>
                <p>{selectedSource.text}</p>
              </div>
            )}
            <div className="orbital-project-footer">
              <span>Python · LangChain · FAISS · BM25</span>
              <a href="#projects">
                All projects <FiArrowUpRight />
              </a>
            </div>
          </article>
        </>
      )}

      <div className="orbital-bottom-bar">
        <nav className="orbital-waypoints" aria-label="Orbital journey">
          <button
            onClick={returnToOrbit}
            aria-current={state.mode === "orbit" ? "step" : undefined}
          >
            <i />
            Earth
          </button>
          <span className={state.mode !== "orbit" ? "is-travelled" : ""} />
          <button
            onClick={launch}
            disabled={!ready || failed || state.mode === "flight"}
            aria-current={state.mode === "flight" ? "step" : undefined}
          >
            <i />
            Docking
          </button>
          <span className={state.mode === "lab" ? "is-travelled" : ""} />
          <button
            onClick={dock}
            aria-current={state.mode === "lab" ? "step" : undefined}
          >
            <i />
            Lab
          </button>
        </nav>
        <div className="orbital-tools">
          {state.mode === "lab" && (
            <button
              className="orbital-small-button"
              onClick={launch}
              disabled={!ready || failed}
            >
              <FiRotateCcw />
              Replay arrival
            </button>
          )}
          {state.mode !== "flight" && !reducedMotion && (
            <button
              className="orbital-icon-button"
              onClick={togglePause}
              aria-label={
                state.paused ? "Resume scene motion" : "Pause scene motion"
              }
              title={
                state.paused ? "Resume scene motion" : "Pause scene motion"
              }
            >
              {state.paused ? <FiPlay /> : <FiPause />}
            </button>
          )}
          <button
            className="orbital-quality"
            onClick={() => {
              manualQuality.current = true;
              setQuality((value) => (value === "high" ? "low" : "high"));
            }}
            aria-label={`Graphics quality: ${quality}. Switch to ${quality === "high" ? "low" : "high"}.`}
          >
            {quality === "high" ? "High detail" : "Lightweight"}
          </button>
        </div>
      </div>
      <a
        className="orbital-scroll-link"
        href="#skills"
        aria-label="Continue to skills"
      >
        <FiArrowDown />
        <span>Continue exploring</span>
      </a>
      <details className="orbital-credits">
        <summary>Scene credits</summary>
        <div>
          <p>
            Station hardware:{" "}
            <a
              href="https://science.nasa.gov/3d-resources/international-space-station-iss-a/"
              target="_blank"
              rel="noreferrer"
            >
              NASA / Ames Research Center
            </a>
            .
          </p>
          <p>
            Spacecraft:{" "}
            <a
              href="https://kenney.nl/assets/space-kit"
              target="_blank"
              rel="noreferrer"
            >
              Kenney Space Kit
            </a>
            , CC0. Docking bay, materials, and exhibit built for this portfolio.
          </p>
        </div>
      </details>
    </section>
  );
}
