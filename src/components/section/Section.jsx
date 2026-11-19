import { useReveal } from "../../hooks/useReveal";
import SectionRocket from "./SectionRocket";

function Section({ children, id, flight = false }) {
  const [ref, visible] = useReveal();
  return (
    <section
      id={id}
      ref={ref}
      className={`chapter chapter-${id} ${flight && id !== "about" ? "chapter-flight" : ""} ${visible ? "is-visible" : ""}`}
      aria-label={id}
    >
      <div className="chapter-inner">
        {!flight || id === "about" ? (
          children
        ) : (
          <div className="flight-carriage">
            <SectionRocket sectionId={id} />
            <div className="section-payload">{children}</div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Section;
