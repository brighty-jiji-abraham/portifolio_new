import { FiGithub } from "react-icons/fi";
import "./ProjectLinks.css";

export default function ProjectLinks({ project }) {
  if (!project.sourceUrl) return null;

  return (
    <a
      className="project-source-link"
      href={project.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`View source code for ${project.title} on GitHub`}
    >
      <FiGithub aria-hidden="true" />
      Source code
    </a>
  );
}
