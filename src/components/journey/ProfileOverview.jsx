import { useId } from "react";
import { profileIntroduction, profileQuestions } from "../../data/discovery.js";
import "./ProfileOverview.css";

export default function ProfileOverview({ onInspect }) {
  const headingId = useId();
  return (
    <section className="profile-overview" aria-labelledby={headingId}>
      <h3 id={headingId}>Software &amp; AI/ML engineering in Kerala</h3>
      <p>{profileIntroduction}</p>
      {profileQuestions.map(({ question, answer, link }) => (
        <details key={question}>
          <summary>{question}</summary>
          <p>{answer}</p>
          {link && (
            <a
              href={link.href}
              onClick={(event) => {
                if (onInspect && link.href.startsWith("#")) {
                  event.preventDefault();
                  onInspect(link.href.slice(1));
                }
              }}
            >
              {link.label} <span aria-hidden="true">↗</span>
            </a>
          )}
        </details>
      ))}
    </section>
  );
}
