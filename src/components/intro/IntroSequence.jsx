import { useEffect, useState } from "react";
import "./IntroSequence.css";

const hasVisited = () => {
  try {
    return (
      sessionStorage.getItem("portfolio-visited") === "true" ||
      Boolean(location.hash)
    );
  } catch {
    return Boolean(location.hash);
  }
};

export default function IntroSequence({ reducedMotion }) {
  const [dismissed, setDismissed] = useState(hasVisited);
  useEffect(() => {
    try {
      sessionStorage.setItem("portfolio-visited", "true");
    } catch {
      /* Optional preference. */
    }
    const timer = setTimeout(() => setDismissed(true), 1100);
    return () => clearTimeout(timer);
  }, []);
  if (dismissed || reducedMotion) return null;
  return (
    <div className="intro-sequence">
      <div className="intro-emblem" aria-hidden="true">
        b.
      </div>
      <p>A little world of ideas.</p>
      <button className="intro-button" onClick={() => setDismissed(true)}>
        Explore now
      </button>
    </div>
  );
}
