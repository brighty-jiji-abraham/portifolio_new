import { FiMapPin, FiBriefcase, FiBookOpen, FiAward, FiZap } from 'react-icons/fi';
import { useSpotlight } from '../hooks/useInteractive';
import './Experience.css';

const experiences = [
    {
        role: 'Software Engineer · R&D',
        company: 'Infinite Open Source Solutions LLP',
        period: 'Jan 2026 Present',
        location: 'Kozhikode',
        current: true,
        works: [
            'Backend & frontend development',
            'Database design',
            'Cloud deployments',
            'AI / Deep-learning application development',
            'API design, integration & development',
        ],
    },
    {
        role: 'Associate Software Engineer · R&D',
        company: 'Infinite Open Source Solutions LLP',
        period: 'Jan 2025 Jan 2026',
        location: 'Kozhikode',
        works: [
            'Built the AI WhatsApp chatbot platform end-to-end',
            'Multi-tenant SaaS architecture with encrypted channels',
            'RAG retrieval over FAISS indices',
        ],
    },
    {
        role: 'Software Developer',
        company: 'Xyvin Technologies Pvt Ltd',
        period: 'Jul 2024 Dec 2024',
        location: 'Kochi, Kerala',
        works: [
            'API development',
            'Backend development',
            'Web design',
            'App testing',
        ],
    },
    {
        role: 'Machine Learning Intern',
        company: 'Prodigy InfoTech',
        period: 'Oct 2023 Feb 2024',
        location: 'Remote · India',
    },
    {
        role: 'Vice Tech Lead',
        company: 'TinkerHub SBCE',
        period: 'Jan 2022 Apr 2023',
        location: 'Alappuzha',
        note: 'Mentored 100+ developers',
    },
    {
        role: 'Technology Lead',
        company: 'IEDC SBCE',
        period: 'Jan 2021 Jul 2022',
        location: 'Alappuzha',
    },
];

const education = [
    {
        degree: 'B.Tech, Computer Science (AI / ML)',
        school: 'Sree Buddha College of Engineering',
        period: '2020 2024',
    },
    {
        degree: 'Higher Secondary · Math & CS',
        school: 'Bethany Central School',
        period: '2018 2020',
    },
    {
        degree: 'General Studies (CBSE)',
        school: 'Indian School Wadi Kabir',
        period: '2008 2018',
    },
];

const certifications = [
    'Tech Labs Initiative Generative AI with Google Cloud',
    'Introduction to Generative AI Studio',
    'Build a Face Recognition Application using Python',
    'C++ Tutorial',
    'CSS Fundamentals',
];

const activities = [
    'Editor of school magazine',
    'Video editor in chief inter-school mathematics quiz',
    'Developed electronic school election software',
    'Hackathons',
    'Events technical team',
    'Tech-talks host',
    'Webinars and mentoring',
];

const SideBlock = ({ Icon, title, subtitle, count, accent, children, onMouseMove }) => (
    <section
        className="side-block"
        style={{ '--card-accent': accent }}
        onMouseMove={onMouseMove}
    >
        <header className="side-block-head">
            <span className="side-block-icon" aria-hidden="true">
                <Icon />
            </span>
            <div className="side-block-headtext">
                <h3 className="side-block-title">{title}</h3>
                <p className="side-block-subtitle">{subtitle}</p>
            </div>
            {count != null && <span className="side-block-count">{count}</span>}
        </header>
        {children}
    </section>
);

const Experience = () => {
    const spotlight = useSpotlight();

    return (
        <div className="experience">
            <div className="experience-head">
                <span className="section-eyebrow">Experience</span>
                <h2 className="section-title">My journey so far</h2>
                <p className="section-lead">
                    Engineering and mentorship across product, R&amp;D, and ML from intern to engineer
                    on production systems.
                </p>
            </div>

            <div className="experience-grid">
                <section className="experience-main" aria-label="Work experience">
                    <header className="main-head">
                        <span className="side-block-icon" aria-hidden="true">
                            <FiBriefcase />
                        </span>
                        <div className="side-block-headtext">
                            <h3 className="side-block-title">Work</h3>
                            <p className="side-block-subtitle">Roles, top to bottom</p>
                        </div>
                        <span className="side-block-count">{experiences.length}</span>
                    </header>

                    <ol className="exp-timeline">
                        {experiences.map((exp, i) => (
                            <li
                                key={`${exp.company}-${i}`}
                                className={`exp-item ${exp.current ? 'is-current' : ''}`}
                                onMouseMove={spotlight.onMouseMove}
                            >
                                <span className="exp-marker" aria-hidden="true"></span>
                                <div className="exp-card">
                                    <div className="exp-period">
                                        {exp.period}
                                        {exp.current && <span className="exp-now-pill">NOW</span>}
                                    </div>
                                    <h4 className="exp-role">{exp.role}</h4>
                                    <div className="exp-company">{exp.company}</div>
                                    <div className="exp-location">
                                        <FiMapPin /> {exp.location}
                                    </div>
                                    {exp.note && <div className="exp-note">{exp.note}</div>}
                                    {exp.works && (
                                        <ul className="exp-works">
                                            {exp.works.map((w) => (
                                                <li key={w}>{w}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>

                <aside className="experience-side">
                    <SideBlock
                        Icon={FiBookOpen}
                        title="Education"
                        subtitle="Where I studied"
                        count={education.length}
                        accent="#a78bfa"
                        onMouseMove={spotlight.onMouseMove}
                    >
                        <ul className="edu-list">
                            {education.map((e) => (
                                <li key={e.school} className="edu-item">
                                    <div className="edu-degree">{e.degree}</div>
                                    <div className="edu-school">{e.school}</div>
                                    <div className="edu-period">{e.period}</div>
                                </li>
                            ))}
                        </ul>
                    </SideBlock>

                    <SideBlock
                        Icon={FiAward}
                        title="Certifications"
                        subtitle="Courses I completed"
                        count={certifications.length}
                        accent="#f472b6"
                        onMouseMove={spotlight.onMouseMove}
                    >
                        <ul className="cert-list">
                            {certifications.map((c) => (
                                <li key={c} className="cert-item">{c}</li>
                            ))}
                        </ul>
                    </SideBlock>

                    <SideBlock
                        Icon={FiZap}
                        title="Activities & Leadership"
                        subtitle="Beyond the job"
                        count={activities.length}
                        accent="#f59e0b"
                        onMouseMove={spotlight.onMouseMove}
                    >
                        <ul className="activity-list">
                            {activities.map((a) => (
                                <li key={a} className="activity-item">{a}</li>
                            ))}
                        </ul>
                    </SideBlock>
                </aside>
            </div>
        </div>
    );
};

export default Experience;
