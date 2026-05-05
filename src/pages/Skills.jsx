import { FaJava, FaNodeJs, FaPython, FaJsSquare, FaFilm, FaCameraRetro, FaMagic, FaDatabase } from 'react-icons/fa';
import { FaAws } from 'react-icons/fa6';
import { BiLogoPhp } from 'react-icons/bi';
import { GiMeshNetwork, GiMusicalKeyboard } from 'react-icons/gi';
import { TbBrandCSharp } from 'react-icons/tb';
import { GrSwift } from 'react-icons/gr';
import { DiPhotoshop } from 'react-icons/di';
import { FiCode, FiLayers, FiCpu, FiDatabase, FiAperture } from 'react-icons/fi';
import {
    SiCplusplus,
    SiSolidity,
    SiGit,
    SiOpenai,
    SiClaude,
    SiAnthropic,
    SiReact,
    SiNextdotjs,
    SiExpress,
    SiLaravel,
    SiFlask,
    SiFlutter,
    SiSocketdotio,
    SiCelery,
    SiTailwindcss,
    SiVite,
    SiTensorflow,
    SiPytorch,
    SiLangchain,
    SiOpencv,
    SiScikitlearn,
    SiSpacy,
    SiMongodb,
    SiRedis,
    SiNginx,
    SiGooglecloud,
    SiDocker,
    SiAffinitydesigner,
    SiAffinityphoto,
    SiBlender,
    SiMysql,
    SiSparkar,
    SiGithub,
    SiUnity,
} from 'react-icons/si';
import { useSpotlight } from '../hooks/useInteractive';
import './Skills.css';

const groups = [
    {
        title: 'Languages',
        subtitle: 'What I write code in',
        Icon: FiCode,
        accent: '#22d3ee',
        items: [
            { Icon: FaPython, label: 'Python', color: '#ffce3e' },
            { Icon: FaJsSquare, label: 'JavaScript', color: '#f0db4f' },
            { Icon: SiCplusplus, label: 'C/C++', color: '#5c6bc0' },
            { Icon: FaJava, label: 'Java', color: '#e76f00' },
            { Icon: GrSwift, label: 'Swift', color: '#f05138' },
            { Icon: BiLogoPhp, label: 'PHP', color: '#777bb3' },
            { Icon: SiSolidity, label: 'Solidity', color: '#b2b2b2' },
            { Icon: FaNodeJs, label: 'Node.js', color: '#5fa04e' },
            { Icon: TbBrandCSharp, label: 'C#', color: '#7c3aed' },
        ],
    },
    {
        title: 'Frameworks',
        subtitle: 'What I build with',
        Icon: FiLayers,
        accent: '#a78bfa',
        items: [
            { Icon: SiReact, label: 'React', color: '#61dafb' },
            { Icon: SiNextdotjs, label: 'Next.js', color: '#cbd5e1' },
            { Icon: SiVite, label: 'Vite', color: '#646cff' },
            { Icon: SiTailwindcss, label: 'Tailwind CSS', color: '#38bdf8' },
            { Icon: SiExpress, label: 'Express', color: '#cbd5e1' },
            { Icon: SiLaravel, label: 'Laravel', color: '#ff2d20' },
            { Icon: SiFlask, label: 'Flask', color: '#cbd5e1' },
            { Icon: SiFlutter, label: 'Flutter', color: '#02569b' },
            { Icon: SiSocketdotio, label: 'Socket.IO', color: '#cbd5e1' },
            { Icon: SiCelery, label: 'Celery', color: '#a9cc54' },
        ],
    },
    {
        title: 'AI / ML',
        subtitle: 'Models, training, inference',
        Icon: FiCpu,
        accent: '#f472b6',
        items: [
            { Icon: SiOpenai, label: 'OpenAI', color: '#10a37f' },
            { Icon: SiClaude, label: 'Claude', color: '#cc785c' },
            { Icon: SiAnthropic, label: 'Claude Code', color: '#cc785c' },
            { Icon: SiTensorflow, label: 'TensorFlow', color: '#ff6f00' },
            { Icon: SiPytorch, label: 'PyTorch', color: '#ee4c2c' },
            { Icon: SiLangchain, label: 'LangChain', color: '#22d3ee' },
            { Icon: SiOpencv, label: 'OpenCV', color: '#5fa04e' },
            { Icon: SiScikitlearn, label: 'scikit-learn', color: '#f7931e' },
            { Icon: SiSpacy, label: 'spaCy', color: '#09a3d5' },
            { Icon: GiMeshNetwork, label: 'Neural Networks', color: '#a78bfa' },
            { Icon: FaMagic, label: 'Generative AI', color: '#f472b6' },
        ],
    },
    {
        title: 'Data & Infra',
        subtitle: 'Storage, ops, deployment',
        Icon: FiDatabase,
        accent: '#4ade80',
        items: [
            { Icon: SiMongodb, label: 'MongoDB', color: '#4faa41' },
            { Icon: SiMysql, label: 'MySQL', color: '#00758f' },
            { Icon: FaDatabase, label: 'SQL', color: '#94a3b8' },
            { Icon: SiRedis, label: 'Redis', color: '#dc382d' },
            { Icon: SiDocker, label: 'Docker', color: '#2496ed' },
            { Icon: SiNginx, label: 'NGINX', color: '#009639' },
            { Icon: FaAws, label: 'AWS', color: '#ff9900' },
            { Icon: SiGooglecloud, label: 'Google Cloud', color: '#4285f4' },
            { Icon: SiGit, label: 'Git', color: '#f05033' },
            { Icon: SiGithub, label: 'GitHub', color: '#cbd5e1' },
        ],
    },
    {
        title: 'Creative & Tools',
        subtitle: 'Design, motion, audio, 3D',
        Icon: FiAperture,
        accent: '#f59e0b',
        items: [
            { Icon: DiPhotoshop, label: 'Photoshop', color: '#2da8fa' },
            { Icon: FaMagic, label: 'After Effects', color: '#9a98fc' },
            { Icon: FaFilm, label: 'Premiere Pro', color: '#9c9bfb' },
            { Icon: FaCameraRetro, label: 'Lightroom', color: '#00a5f3' },
            { Icon: SiAffinitydesigner, label: 'Affinity Designer', color: '#50baea' },
            { Icon: SiAffinityphoto, label: 'Affinity Photo', color: '#e874fd' },
            { Icon: SiBlender, label: 'Blender', color: '#ea7600' },
            { Icon: SiUnity, label: 'Unity', color: '#cbd5e1' },
            { Icon: SiSparkar, label: 'Spark AR', color: '#ff5e5b' },
            { Icon: GiMusicalKeyboard, label: 'FL Studio', color: '#f59e0b' },
        ],
    },
];

const Skills = () => {
    const spotlight = useSpotlight();
    return (
        <div className="skills">
            <div className="skills-head">
                <span className="section-eyebrow">Skills</span>
                <h2 className="section-title">What I work with</h2>
                <p className="section-lead">
                    A snapshot of the languages, frameworks, AI/ML stack, data &amp; infra, and creative tools I use day-to-day.
                </p>
            </div>

            <div className="skill-grid">
                {groups.map((group, gi) => {
                    const GroupIcon = group.Icon;
                    return (
                        <article
                            key={group.title}
                            className="skill-card"
                            style={{
                                animationDelay: `${gi * 0.08}s`,
                                '--card-accent': group.accent,
                            }}
                            onMouseMove={spotlight.onMouseMove}
                        >
                            <header className="skill-card-head">
                                <span className="skill-card-icon" aria-hidden="true">
                                    <GroupIcon />
                                </span>
                                <div className="skill-card-headtext">
                                    <h3 className="skill-card-title">{group.title}</h3>
                                    <p className="skill-card-subtitle">{group.subtitle}</p>
                                </div>
                                <span className="skill-card-count" aria-hidden="true">
                                    {group.items.length}
                                </span>
                            </header>

                            <ul className="skill-chips">
                                {group.items.map(({ Icon, label, color }) => (
                                    <li
                                        key={label}
                                        className="skill-chip"
                                        style={{ '--chip-color': color }}
                                    >
                                        <Icon className="chip-icon" />
                                        <span>{label}</span>
                                    </li>
                                ))}
                            </ul>
                        </article>
                    );
                })}
            </div>
        </div>
    );
};

export default Skills;
