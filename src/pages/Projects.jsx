import { useSpotlight } from '../hooks/useInteractive';
import './Projects.css';

const projects = [
    {
        title: 'Multi-Tenant AI Chatbot Platform',
        tag: 'Production · SaaS',
        featured: true,
        summary:
            'An end-to-end chatbot SaaS that lets any business plug in their own knowledge base, tools, and channels and have one AI speak to customers across WhatsApp, Telegram, Messenger, Instagram, and the web. Bots reason over per-tenant docs, can call into the tenant\'s own systems, and quietly hand off to a human agent when needed.',
        stack: ['Flask', 'gevent', 'Socket.IO', 'Celery', 'Redis', 'MongoDB', 'FAISS', 'MCP', 'LangChain', 'OpenAI', 'Together', 'Ollama', 'Docker'],
    },
    {
        title: 'AI WordPress Content Generator',
        tag: 'Production · SaaS',
        featured: true,
        summary:
            'A SaaS that turns documents or rough notes into ready-to-publish WordPress blog posts titles, HTML body, even custom CSS using fine-tuned OpenAI models. Each account has its own credit balance with token-precise billing through Stripe and Razorpay.',
        stack: ['Flask', 'OpenAI', 'MySQL', 'SQLAlchemy', 'Celery', 'Stripe', 'Razorpay', 'spaCy', 'JWT', 'Docker', 'NGINX'],
    },
    {
        title: 'Hybrid RAG Retriever',
        tag: 'NLP · Retrieval',
        featured: true,
        summary:
            'The retrieval brain inside the chatbot platform. Mixes classic keyword search with modern semantic search so the AI gets the right context every time, and falls back to the open web when nothing internal fits the question.',
        stack: ['LangChain', 'FAISS', 'ChromaDB', 'BM25', 'rapidfuzz', 'tiktoken', 'BeautifulSoup', 'Ollama'],
    },
    {
        title: 'MLM Product Chatbot (NL → SQL via MCP)',
        tag: 'Production · MCP · NL-to-SQL',
        featured: true,
        summary:
            'A natural-language chatbot for an MLM product where users can ask about their business data in plain English. It first tries fast structured MCP tool calls (sub-400 ms); if no tool fits, it falls back to a 9-step agentic SQL pipeline that strictly validates columns to prevent hallucinations, auto-injects row-level security (WHERE user_id = N) for non-admins, and retries up to 3× with a narrowed schema if a query is denied. Multi-turn memory, role-based access (admin / employee / user / guest), and a circuit breaker for OpenAI outages.',
        stack: ['Flask', 'OpenAI GPT-4', 'MCP', 'Laravel API', 'MySQL', 'JWT', 'RBAC', 'Python'],
    },
    {
        title: 'BrightysKingdom Proxy Gateway',
        tag: 'Infra · Gateway',
        featured: true,
        summary:
            'The single front door to a fleet of internal services (app1, app2, app3, …). Routes traffic, balances load, tunnels Socket.IO connections cleanly through a custom WebSocket proxy, and ships with an admin UI to manage backends in real time.',
        stack: ['Flask', 'gevent', 'Socket.IO', 'Engine.IO', 'Redis', 'JWT', 'Vite', 'Node.js'],
    },
    {
        title: 'Claude Code Automation',
        tag: 'AI Dev Tooling · Automation',
        featured: true,
        summary:
            'Custom Claude Code workflows that automate the everyday parts of building software code generation across full project scaffolds, repository-wide refactors, doc + README authoring, test-suite scaffolding, and integration into existing repos. Slash commands, sub-agents, and MCP tools wired together so a single prompt can ship work that used to take a day.',
        stack: ['Claude Code', 'Anthropic API', 'MCP', 'Sub-agents', 'Slash Commands', 'Hooks', 'Bash', 'Git'],
    },
    {
        title: 'Skin Disease Prediction',
        tag: 'Medical AI · Real-time',
        featured: true,
        summary:
            'A dermatology AI trained on four major skin-image datasets over half a million images combined. Recognises conditions in real time from a webcam and ships with the full training pipeline plus a deployment-ready model.',
        stack: ['PyTorch', 'EfficientNet-B4', 'ResNet-50', 'DenseNet-121', 'OpenCV', 'Albumentations', 'scikit-learn', 'Weights & Biases'],
    },
    {
        title: 'Visual Assistant for the Visually Impaired',
        tag: 'Multimodal AI · B.Tech major',
        featured: true,
        summary:
            'A multimodal assistant that helps visually impaired users navigate the web it sees, listens, describes, and speaks back. Combines image recognition, image captioning, speech, and natural-language understanding into one experience.',
        stack: ['PyTorch', 'CNN', 'LSTM', 'Transformers', 'Speech Recognition', 'TTS'],
    },
    {
        title: 'Speech Emotion Recognition',
        tag: 'Voice AI',
        featured: true,
        summary:
            'Picks up how someone is feeling from the way they speak not what they say. Useful for call-centre quality monitoring, mental-health apps, and assistive tech that can sense frustration before it\'s voiced.',
        stack: ['TensorFlow', 'LSTM', 'librosa', 'Audio Features'],
    },
    {
        title: 'Online Voting System (EVM)',
        tag: 'Civic',
        featured: true,
        summary:
            'A web voting system modelled on real Electronic Voting Machines anonymous casting, auditable tallying, and proper authentication. Built to hold up to the seriousness of a real election.',
        stack: ['PHP', 'MySQL', 'JavaScript'],
    },
    {
        title: 'Multi-Tenant Cloud Architecture',
        tag: 'Cloud · AWS',
        summary:
            'AWS-native infrastructure where thousands of organisations share the same backend without ever seeing each other\'s data. Each tenant lives in its own isolated bubble.',
        stack: ['AWS Bedrock', 'S3', 'Lambda', 'IAM'],
    },
    {
        title: 'AI Gym Trainer',
        tag: 'B.Tech mini project',
        summary:
            'A personalised workout coach that learns from your fitness data, goals, and preferences. Suggests routines, adapts as you progress, and refines its recommendations every session.',
        stack: ['Random Forest', 'scikit-learn', 'Python'],
    },
    {
        title: 'Image Classifier (CNN)',
        tag: 'Computer Vision',
        summary:
            'A general-purpose image classifier built from the ground up. Used as the foundation for medical imaging, face detection, and object recognition experiments.',
        stack: ['TensorFlow', 'CNN', 'NumPy'],
    },
    {
        title: 'Online Web Stores',
        tag: 'E-commerce',
        summary:
            'A complete e-commerce platform with browsing, cart, payments, order tracking, and admin tooling built end-to-end in PHP.',
        stack: ['PHP', 'MySQL', 'JavaScript'],
    },
    {
        title: 'College Events Website',
        tag: 'Web · Community',
        summary:
            'A campus events hub where students create, promote, and RSVP for events. Calendar view, notifications, and social sharing baked in.',
        stack: ['PHP', 'Node.js', 'MySQL'],
    },
    {
        title: 'Sentiment Analysis from Movie Reviews',
        tag: 'NLP',
        summary:
            'Reads movie reviews and tells you whether the audience liked the film. Trained on real reviews to capture sarcasm, context, and tone.',
        stack: ['TensorFlow', 'LSTM', 'NLP'],
    },
];

const Projects = () => {
    const spotlight = useSpotlight();
    return (
        <div className="projects">
            <div className="projects-head">
                <span className="section-eyebrow">Projects</span>
                <h2 className="section-title">Things I&apos;ve built</h2>
                <p className="section-lead">
                    Production SaaS platforms, AI/ML systems, and infrastructure selected work across machine learning, web, and cloud.
                </p>
            </div>
            <ul className="project-list">
                {projects.map((p, i) => (
                    <li
                        key={p.title}
                        className={`project-card ${p.featured ? 'is-featured' : ''}`}
                        style={{ animationDelay: `${i * 60}ms` }}
                        onMouseMove={spotlight.onMouseMove}
                    >
                        {p.featured && <span className="project-star" aria-label="Featured">★</span>}
                        <div className="project-tag">{p.tag}</div>
                        <h3>{p.title}</h3>
                        <p className="project-summary">{p.summary}</p>
                        <div className="project-stack" aria-label="Tech stack">
                            {p.stack.map((s) => (
                                <span key={s} className="stack-chip">{s}</span>
                            ))}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Projects;
