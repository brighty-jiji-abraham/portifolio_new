import { profile } from "./profile.js";
import { education, experiences } from "./experience.js";

export const site = {
  url: "https://brighty.pro/",
  title: "Brighty Jiji Abraham Portfolio",
  description:
    "Brighty Jiji Abraham — software engineer and AI/ML engineer in Kerala, India. Explore AI chatbots, RAG systems and full-stack web projects.",
  image: "https://brighty.pro/og-image.jpg",
  imageAlt:
    "Brighty Jiji Abraham — software and AI/ML engineer in Kerala, India",
};

export const alternateNames = ["Brighty", "Brighty Jiji"];

export const expertise = [
  "Artificial intelligence and machine learning",
  "Generative AI and large language models",
  "Retrieval-augmented generation (RAG)",
  "AI chatbots and conversational applications",
  "Full-stack web development",
  "Python and API development",
  "React and JavaScript",
  "Multi-tenant SaaS platforms",
  "Computer vision and natural language processing",
  "Database design and cloud deployment",
];

export const profileIntroduction = `${profile.name}, also known as ${alternateNames.join(" or ")}, is a software engineer, AI/ML engineer and R&D specialist based in ${profile.location}.`;

const currentRole = experiences.find((experience) => experience.current);
const previousRole = experiences.find(
  (experience) => experience.role === "Software Engineer · R&D",
);
const degree = education[0];

// These answers are shared by the visible portfolio and the initial HTML.
export const profileQuestions = [
  {
    question: "What does Brighty build?",
    answer:
      "Brighty builds AI chatbots, retrieval-augmented generation (RAG) systems, machine-learning applications and full-stack web products. His selected work includes a multi-tenant AI chatbot platform, a hybrid RAG retriever, a collaborative text editor and multiplayer chess.",
    link: { label: "Explore the projects", href: "#projects" },
  },
  {
    question: "Where does Brighty work?",
    answer: `${profile.name} is ${currentRole.role} at ${currentRole.company} (iOSS) in ${currentRole.location} (${currentRole.period}). He previously worked there as ${previousRole.role} (${previousRole.period}).`,
    link: { label: "Explore the career journey", href: "#experience" },
  },
  {
    question: "What is Brighty’s educational background?",
    answer: `Brighty studied ${degree.degree} at ${degree.school} (${degree.period}). His work brings together AI research, backend engineering and web development.`,
  },
  {
    question: "How can I contact Brighty about a project?",
    answer: `For AI products, web applications or collaboration, email ${profile.email} or connect with ${profile.name} on LinkedIn.`,
    link: { label: "Connect on LinkedIn", href: profile.links.linkedin },
  },
];
