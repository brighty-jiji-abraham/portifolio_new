import PortfolioJourney from "./components/journey/PortfolioJourney";
import { useMotionPreference } from "./hooks/useMotionPreference";
import { usePortfolioSettings } from "./hooks/usePortfolioSettings";

function App() {
  const reducedMotion = useMotionPreference();
  const settings = usePortfolioSettings();

  return (
    <>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          (
            document.getElementById("universe-information-title") ||
            document.getElementById("main-content")
          )?.focus({ preventScroll: true });
        }}
      >
        Skip to content
      </a>
      <main className="story" id="main-content" tabIndex={-1}>
        <PortfolioJourney reducedMotion={reducedMotion} settings={settings} />
      </main>
    </>
  );
}

export default App;
