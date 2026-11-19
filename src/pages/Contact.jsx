import { useEffect, useState } from "react";
import {
  FiMail,
  FiMapPin,
  FiSend,
  FiLinkedin,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
} from "react-icons/fi";
import { useMagnetic } from "../hooks/useInteractive";
import "./Contact.css";

import { profile } from "../data/profile";

const FORM_ENDPOINT = `https://formsubmit.co/ajax/${profile.email}`;

const Contact = ({ embedded = false, onStatusChange, idPrefix = "" }) => {
  const [status, setStatus] = useState("idle"); // 'idle' | 'sending' | 'sent' | 'error'
  const [errorMsg, setErrorMsg] = useState("");
  const magnetic = useMagnetic(0.2);
  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === "sending") return;

    const form = e.currentTarget;
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());

    // Honeypot check if a bot filled the hidden _honey field, silently ignore
    if (data._honey) {
      setStatus("sent");
      form.reset();
      return;
    }

    const firstNameRaw = (data.first_name || "").trim();
    const lastNameRaw = (data.last_name || "").trim();
    const emailRaw = (data.email || "").trim();

    // Block empty submissions: first name, last name, and a valid email are required
    if (!firstNameRaw || !lastNameRaw || !emailRaw) {
      setStatus("error");
      setErrorMsg("Please fill in your name and email before sending.");
      return;
    }

    const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw);
    if (!emailLooksValid) {
      setStatus("error");
      setErrorMsg(
        "That email address doesn’t look right. Please double-check it.",
      );
      return;
    }

    const firstName = firstNameRaw || "someone";

    const payload = {
      name: `${firstNameRaw} ${lastNameRaw}`.trim(),
      email: emailRaw,
      phone: (data.phnumber || "").trim(),
      message: (data.message || "").trim(),
      _subject: `Portfolio contact from ${firstName}`,
      _template: "table",
      _captcha: "false",
      _replyto: emailRaw,
    };

    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok && (json.success === "true" || json.success === true)) {
        setStatus("sent");
        form.reset();
      } else {
        throw new Error(json.message || `Server returned ${res.status}`);
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err?.message ||
          "Could not send. Please try again or email me directly.",
      );
    }
  };

  return (
    <div className={`contact${embedded ? " contact-embedded" : ""}`}>
      <div className="contact-head cinematic-reveal delay-1">
        <span className="section-eyebrow">Contact</span>
        <h2 className="section-title">Let&apos;s talk</h2>
        <p className="section-lead">
          {profile.contactIntro}
        </p>
      </div>

      <div className="contact-grid">
        <aside className="contact-info">
          <div className="info-item cinematic-reveal delay-2">
            <FiMail className="info-icon" />
            <div>
              <div className="info-label">Email</div>
              <a href={`mailto:${profile.email}`} className="info-value">
                {profile.email}
              </a>
            </div>
          </div>
          <div className="info-item cinematic-reveal delay-3">
            <FiLinkedin className="info-icon" />
            <div>
              <div className="info-label">LinkedIn</div>
              <a
                href={profile.links.linkedin}
                className="info-value"
                target="_blank"
                rel="noopener noreferrer"
              >
                /brightyjijiabraham
              </a>
            </div>
          </div>
          <div className="info-item cinematic-reveal delay-4">
            <FiMapPin className="info-icon" />
            <div>
              <div className="info-label">Location</div>
              <div className="info-value">{profile.location}</div>
            </div>
          </div>
        </aside>

        <form
          aria-label={idPrefix ? "Universe contact form" : "Contact form"}
          className="contact-form cinematic-reveal delay-5"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="row">
            <div className="field">
              <label htmlFor={`${idPrefix}first_name`}>First name</label>
              <input
                id={`${idPrefix}first_name`}
                type="text"
                name="first_name"
                required
                autoComplete="given-name"
              />
            </div>
            <div className="field">
              <label htmlFor={`${idPrefix}last_name`}>Last name</label>
              <input
                id={`${idPrefix}last_name`}
                type="text"
                name="last_name"
                required
                autoComplete="family-name"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor={`${idPrefix}email`}>Email</label>
            <input
              id={`${idPrefix}email`}
              type="email"
              name="email"
              required
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label htmlFor={`${idPrefix}phnumber`}>
              Phone number <span className="optional">(optional)</span>
            </label>
            <input
              id={`${idPrefix}phnumber`}
              type="tel"
              name="phnumber"
              autoComplete="tel"
              inputMode="tel"
              pattern="[0-9+\-\s()]*"
            />
          </div>

          <div className="field">
            <label htmlFor={`${idPrefix}message`}>
              Message <span className="optional">(optional)</span>
            </label>
            <textarea id={`${idPrefix}message`} name="message" rows={4} />
          </div>

          {/* Honeypot bots fill this; humans never see it */}
          <input
            type="text"
            name="_honey"
            tabIndex={-1}
            autoComplete="off"
            className="contact-honeypot"
            aria-hidden="true"
          />

          <button
            type="submit"
            className="btn btn-primary btn-magnetic contact-submit"
            onMouseMove={magnetic.onMouseMove}
            onMouseLeave={magnetic.onMouseLeave}
            disabled={status === "sending"}
          >
            {status === "sending" ? (
              <>
                <FiLoader className="spin" /> Sending…
              </>
            ) : (
              <>
                <FiSend /> Send message
              </>
            )}
          </button>

          {status === "sent" && (
            <p className="contact-status is-success" role="status">
              <FiCheckCircle /> Thanks! Your message is on its way. I&apos;ll
              get back to you at the email you provided.
            </p>
          )}

          {status === "error" && (
            <p className="contact-status is-error" role="alert">
              <FiAlertCircle /> {errorMsg} You can also email me directly at{" "}
              <a href={`mailto:${profile.email}`}>{profile.email}</a>.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Contact;
