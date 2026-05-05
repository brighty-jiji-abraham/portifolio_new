import { useState } from 'react';
import { FiMail, FiMapPin, FiSend, FiLinkedin, FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { useMagnetic } from '../hooks/useInteractive';
import './Contact.css';

const FORM_ENDPOINT = 'https://formsubmit.co/ajax/brightymct@gmail.com';

const Contact = () => {
    const [status, setStatus] = useState('idle'); // 'idle' | 'sending' | 'sent' | 'error'
    const [errorMsg, setErrorMsg] = useState('');
    const magnetic = useMagnetic(0.2);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (status === 'sending') return;

        const form = e.currentTarget;
        const fd = new FormData(form);
        const data = Object.fromEntries(fd.entries());

        // Honeypot check — if a bot filled the hidden _honey field, silently ignore
        if (data._honey) {
            setStatus('sent');
            form.reset();
            return;
        }

        const firstName = (data.first_name || '').trim() || 'someone';

        const payload = {
            name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
            email: data.email,
            phone: data.phnumber,
            message: data.message,
            _subject: `Portfolio contact from ${firstName}`,
            _template: 'table',
            _captcha: 'false',
            _replyto: data.email,
        };

        setStatus('sending');
        setErrorMsg('');

        try {
            const res = await fetch(FORM_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const json = await res.json().catch(() => ({}));

            if (res.ok && (json.success === 'true' || json.success === true)) {
                setStatus('sent');
                form.reset();
            } else {
                throw new Error(json.message || `Server returned ${res.status}`);
            }
        } catch (err) {
            setStatus('error');
            setErrorMsg(err?.message || 'Could not send. Please try again or email me directly.');
        }
    };

    return (
        <div className="contact">
            <div className="contact-head">
                <span className="section-eyebrow">Contact</span>
                <h2 className="section-title">Let&apos;s talk</h2>
                <p className="section-lead">
                    Got a project in mind, an opportunity, or just want to say hi? Drop your details below.
                </p>
            </div>

            <div className="contact-grid">
                <aside className="contact-info">
                    <div className="info-item">
                        <FiMail className="info-icon" />
                        <div>
                            <div className="info-label">Email</div>
                            <a href="mailto:brightymct@gmail.com" className="info-value">
                                brightymct@gmail.com
                            </a>
                        </div>
                    </div>
                    <div className="info-item">
                        <FiLinkedin className="info-icon" />
                        <div>
                            <div className="info-label">LinkedIn</div>
                            <a
                                href="https://www.linkedin.com/in/brightyjijiabraham"
                                className="info-value"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                /brightyjijiabraham
                            </a>
                        </div>
                    </div>
                    <div className="info-item">
                        <FiMapPin className="info-icon" />
                        <div>
                            <div className="info-label">Location</div>
                            <div className="info-value">Alappuzha, Kerala, India</div>
                        </div>
                    </div>
                </aside>

                <form className="contact-form" onSubmit={handleSubmit} noValidate>
                    <div className="row">
                        <div className="field">
                            <label htmlFor="first_name">First name</label>
                            <input id="first_name" type="text" name="first_name" required autoComplete="given-name" />
                        </div>
                        <div className="field">
                            <label htmlFor="last_name">Last name</label>
                            <input id="last_name" type="text" name="last_name" required autoComplete="family-name" />
                        </div>
                    </div>

                    <div className="field">
                        <label htmlFor="email">Email</label>
                        <input id="email" type="email" name="email" required autoComplete="email" />
                    </div>

                    <div className="field">
                        <label htmlFor="phnumber">Phone number <span className="optional">(optional)</span></label>
                        <input
                            id="phnumber"
                            type="tel"
                            name="phnumber"
                            autoComplete="tel"
                            inputMode="tel"
                            pattern="[0-9+\-\s()]*"
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="message">Message <span className="optional">(optional)</span></label>
                        <textarea id="message" name="message" rows={4} />
                    </div>

                    {/* Honeypot — bots fill this; humans never see it */}
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
                        disabled={status === 'sending'}
                    >
                        {status === 'sending' ? (
                            <>
                                <FiLoader className="spin" /> Sending…
                            </>
                        ) : (
                            <>
                                <FiSend /> Send message
                            </>
                        )}
                    </button>

                    {status === 'sent' && (
                        <p className="contact-status is-success" role="status">
                            <FiCheckCircle /> Thanks — your message is on its way. I&apos;ll get back to you at the email you provided.
                        </p>
                    )}

                    {status === 'error' && (
                        <p className="contact-status is-error" role="alert">
                            <FiAlertCircle /> {errorMsg} You can also email me directly at{' '}
                            <a href="mailto:brightymct@gmail.com">brightymct@gmail.com</a>.
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Contact;
