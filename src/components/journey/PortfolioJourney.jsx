import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { experiences } from "../../data/experience";
import profileImage from "../../assets/profile-img.jpg";
import { setUniverseAudio } from "../../hooks/useSoundscape";
import useAstronaut from "./useAstronaut";
import AstronautView from "./AstronautView";
import "./PortfolioJourney.css";

const Scene3D = lazy(() => import("../scene/Scene3D"));
const TextPortfolio = lazy(() => import("./TextPortfolio"));
const BlackHoleJourney = lazy(() => import("./BlackHoleJourney"));

export default function PortfolioJourney({ reducedMotion, settings }) {
  const astronaut = useAstronaut();
  const { exit: exitUniverse } = astronaut;
  const [unavailable, setUnavailable] = useState(false);
  const [ready, setReady] = useState(false);
  const [informationHost, setInformationHost] = useState(null);
  const informationPortal = useMemo(
    () => ({ current: informationHost }),
    [informationHost],
  );
  const [paused, setPaused] = useState(false);
  const [blackHoleOpen, setBlackHoleOpen] = useState(false);
  const blackHoleTrigger = useRef(null);
  const [cinema, setCinema] = useState(null);
  useEffect(() => {
    if (blackHoleOpen || !blackHoleTrigger.current) return;
    // Restore focus after the main controls have become visible again.
    const trigger = blackHoleTrigger.current;
    let frame;
    const restore = () => {
      if (!trigger.isConnected) return;
      if (getComputedStyle(trigger).visibility !== "visible") {
        frame = requestAnimationFrame(restore);
        return;
      }
      trigger.focus({ preventScroll: true });
      blackHoleTrigger.current = null;
    };
    frame = requestAnimationFrame(restore);
    return () => cancelAnimationFrame(frame);
  }, [blackHoleOpen]);
  useEffect(() => {
    setUniverseAudio({
      cinematic: blackHoleOpen,
      paused: astronaut.enabled && paused,
      atmosphere: astronaut.enabled,
      projects: astronaut.enabled && ready && astronaut.inspection === "projects" && !paused && !reducedMotion,
    });
  }, [blackHoleOpen, paused, astronaut.enabled, astronaut.inspection, reducedMotion, ready]);
  const [category, setCategory] = useState(2);
  const [selected, setSelected] = useState(0);
  const [project, setProject] = useState(0);
  const [milestone, setMilestone] = useState(0);
  const [signal, setSignal] = useState(0);
  const [neuralPulse, setNeuralPulse] = useState(0);
  const [networkReset, setNetworkReset] = useState(0);
  const [skyReset, setSkyReset] = useState(0);
  const [tracing, setTracing] = useState(false);
  const canTrace =
    astronaut.enabled &&
    astronaut.inspection === "experience" &&
    !blackHoleOpen &&
    !reducedMotion &&
    !paused;
  if (tracing && !canTrace) setTracing(false);
  useEffect(() => {
    if (!tracing || !canTrace) return;
    const timer = setTimeout(
      () => {
        if (milestone === 0) setTracing(false);
        else
          setMilestone((value) =>
            value === -1 ? experiences.length - 1 : value - 1,
          );
      },
      milestone === 0 ? 1600 : 2800,
    );
    return () => clearTimeout(timer);
  }, [tracing, milestone, canTrace]);
  const chooseMilestone = (index) => {
    setTracing(false);
    setMilestone(index);
  };
  const traceJourney = () => {
    if (tracing) {
      setTracing(false);
      return;
    }
    setMilestone(-1);
    setSkyReset((value) => value + 1);
    setTracing(!reducedMotion && !paused);
  };
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => {
    setUnavailable(true);
    setBlackHoleOpen(false);
    setCinema(null);
    exitUniverse();
  }, [exitUniverse]);
  const openBlackHole = (event) => {
    blackHoleTrigger.current = event.currentTarget;
    astronaut.stopFlight();
    setBlackHoleOpen(true);
  };
  const chooseCategory = useCallback((index) => {
    setCategory(index);
    setSelected(0);
  }, []);
  const selectSkill = (index) => {
    setSelected(index);
    astronaut.inspect("skills");
  };
  const selectProject = (index) => {
    if (astronaut.flight.current.dragged) return;
    setProject(index);
    astronaut.inspect("projects");
  };
  const selectMilestone = (index) => {
    chooseMilestone(index);
    astronaut.inspect("experience");
  };
  const previewSignal = useCallback(() => setSignal((value) => value + 1), []);
  const contactStatus = useCallback((status) => {
    if (status === "sent") setSignal((value) => value + 1);
  }, []);
  const enter = () => {
    setReady(false);
    astronaut.enter();
  };

  if (!astronaut.enabled)
    return (
      <Suspense
        fallback={
          <p className="portfolio-loading-text">Opening the text view…</p>
        }
      >
        <TextPortfolio
          reducedMotion={reducedMotion}
          paused={paused}
          settings={settings}
          onEnter={enter}
          unavailable={unavailable}
        />
      </Suspense>
    );

  return (
    <div className="portfolio-universe" data-ready={ready} data-cinematic={blackHoleOpen}>
      <Suspense fallback={null}>
        <Scene3D
          cinemaActive={blackHoleOpen}
          cinema={blackHoleOpen ? cinema : null}
          journey={astronaut.journey}
          reducedMotion={reducedMotion}
          paused={paused}
          category={category}
          selected={selected}
          onSelect={selectSkill}
          neuralPulse={neuralPulse}
          networkReset={networkReset}
          skyReset={skyReset}
          onReady={onReady}
          onFailure={onFailure}
          project={project}
          onProject={selectProject}
          milestone={milestone}
          onMilestone={selectMilestone}
          signal={signal}
          exploring
          flight={astronaut.flight}
          information={
            ready && informationHost
              ? {
                  inspection: astronaut.inspection,
                  portal: informationPortal,
                  content: {
                    motion: !reducedMotion && !paused,
                    onDismiss: astronaut.dismissInformation,
                    onInspect: astronaut.inspect,
                    category,
                    onCategory: chooseCategory,
                    selected,
                    onSkill: setSelected,
                    onNeuralPulse: () => setNeuralPulse((value) => value + 1),
                    onNetworkReset: () => setNetworkReset((value) => value + 1),
                    project,
                    onProject: setProject,
                    milestone,
                    onMilestone: chooseMilestone,
                    onTraceJourney: traceJourney,
                    tracing,
                    onSkyReset: () => setSkyReset((value) => value + 1),
                    onContactStatus: contactStatus,
                    onSignal: previewSignal,
                  },
                }
              : null
          }
        />
      </Suspense>
      <AstronautView
        onBlackHole={openBlackHole}
        flight={astronaut.flight}
        onExit={astronaut.exit}
        reducedMotion={reducedMotion}
        inspection={astronaut.inspection}
        onInspect={astronaut.inspect}
        onPortal={setInformationHost}
        settings={settings}
        paused={paused}
        onPause={() => setPaused((value) => !value)}
        ready={ready}
      />
      {blackHoleOpen && (
        <Suspense fallback={
          <div className="black-hole-loading" role="status">
            <p>Preparing the flight…</p>
            <button onClick={() => setBlackHoleOpen(false)}>Return to portfolio</button>
          </div>
        }>
          <BlackHoleJourney onClose={() => setBlackHoleOpen(false)} reducedMotion={reducedMotion} initiallyPaused={paused} settings={settings} onFlightChange={setCinema} />
        </Suspense>
      )}
      {!ready && (
        <div className="universe-loading" role="status">
          <img src={profileImage} width="88" height="88" alt="" />
          <h1>Brighty Jiji Abraham.</h1>
          <p>AI-Native Software Engineer · R&D Specialist</p>
          <span>Opening my universe…</span>
        </div>
      )}
    </div>
  );
}
