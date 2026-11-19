import { profile, profileStats } from "../src/data/profile.js";
import { education, experiences } from "../src/data/experience.js";
import { projects } from "../src/data/projects.js";
import {
  alternateNames,
  expertise,
  profileIntroduction,
  profileQuestions,
  site,
} from "../src/data/discovery.js";

export function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
}

// JSON inside a script element must not be able to terminate the element.
export function serializeJsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function createStructuredData() {
  const id = (fragment) => `${site.url}#${fragment}`;
  const person = { "@id": id("person") };
  const website = { "@id": id("website") };
  const page = { "@id": id("profile") };
  const employer = { "@id": id("employer") };
  const techieWizard = { "@id": id("techiewizard") };
  const techieWizardRole = "Chief Technology Officer (CTO)";
  const currentRole = experiences.find((experience) => experience.current);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        ...person,
        name: profile.name,
        alternateName: alternateNames,
        url: site.url,
        description: profileIntroduction,
        jobTitle: [currentRole.role, techieWizardRole],
        worksFor: [employer, techieWizard],
        homeLocation: { "@type": "Place", name: profile.location },
        alumniOf: { "@type": "CollegeOrUniversity", name: education[0].school },
        knowsAbout: expertise,
        sameAs: Object.values(profile.links),
        mainEntityOfPage: page,
      },
      {
        "@type": "Organization",
        ...employer,
        name: currentRole.company,
        alternateName: "iOSS",
      },
      {
        "@type": "Organization",
        ...techieWizard,
        name: "TechieWizard Enterprises",
        url: "https://techiewizard.enterprises/",
        employee: {
          "@type": "EmployeeRole",
          roleName: techieWizardRole,
          employee: person,
        },
      },
      {
        "@type": "WebSite",
        ...website,
        url: site.url,
        name: site.title,
        alternateName: ["Brighty’s Portfolio", "Brighty Jiji Portfolio"],
        description: site.description,
        inLanguage: "en",
        publisher: person,
      },
      {
        "@type": "ProfilePage",
        ...page,
        url: site.url,
        name: site.title,
        description: site.description,
        inLanguage: "en",
        isPartOf: website,
        mainEntity: person,
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: site.image,
          width: 1200,
          height: 630,
        },
        mentions: { "@id": id("selected-projects") },
      },
      {
        "@type": "ItemList",
        "@id": id("selected-projects"),
        name: "Selected software, AI and machine-learning projects",
        numberOfItems: projects.length,
        itemListElement: projects.map((project, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "CreativeWork",
            "@id": id(`project-${index + 1}`),
            name: project.title,
            description: project.summary,
            contributor: person,
            keywords: project.stack,
            ...(project.sourceUrl ? { sameAs: project.sourceUrl } : {}),
          },
        })),
      },
    ],
  };
}

export function renderMetadata() {
  const meta = (attribute, name, content) =>
    `<meta ${attribute}="${name}" content="${escapeHtml(content)}" />`;
  return [
    `<title>${escapeHtml(site.title)}</title>`,
    meta("name", "description", site.description),
    meta("name", "author", profile.name),
    meta("name", "robots", "index, follow, max-image-preview:large"),
    meta("property", "og:type", "website"),
    meta("property", "og:title", site.title),
    meta("property", "og:description", site.description),
    meta("property", "og:site_name", site.title),
    meta("property", "og:locale", "en_IN"),
    meta("property", "og:url", site.url),
    meta("property", "og:image", site.image),
    meta("property", "og:image:secure_url", site.image),
    meta("property", "og:image:type", "image/jpeg"),
    meta("property", "og:image:width", "1200"),
    meta("property", "og:image:height", "630"),
    meta("property", "og:image:alt", site.imageAlt),
    meta("name", "twitter:card", "summary_large_image"),
    meta("name", "twitter:title", site.title),
    meta("name", "twitter:description", site.description),
    meta("name", "twitter:creator", "@B_J_A_008"),
    meta("name", "twitter:image", site.image),
    meta("name", "twitter:image:alt", site.imageAlt),
    `<link rel="canonical" href="${escapeHtml(site.url)}" />`,
    `<link rel="alternate" type="application/ld+json" href="${site.url}portfolio.jsonld" title="Portfolio structured data" />`,
    `<script type="application/ld+json">${serializeJsonLd(createStructuredData())}</script>`,
  ].join("\n    ");
}

// A useful page for everyone, including visitors without JavaScript. React
// replaces it with the interactive portfolio, which uses the same source data.
export function renderPortfolioSummary() {
  const e = escapeHtml;
  const list = (items) =>
    `<ul>${items.map((item) => `<li>${e(item)}</li>`).join("")}</ul>`;
  return `<main class="portfolio-summary" id="main-content">
    <header id="about">
      <p class="portfolio-summary-label">${e(profile.headline)}</p>
      <h1>${e(profile.name)}</h1>
      <p>${e(profile.bio)}</p>
      <nav aria-label="Portfolio sections">
        <a href="#skills">Skills</a><a href="#projects">Projects</a><a href="#experience">Journey</a><a href="#contact">Contact</a>
      </nav>
      <h2>Software &amp; AI/ML engineering in Kerala</h2>
      <p>${e(profileIntroduction)}</p>
      <dl class="portfolio-summary-stats">${profileStats
        .map(
          (stat) =>
            `<div><dt>${e(`${stat.value}${stat.suffix}`)}</dt><dd>${e(stat.label)}</dd></div>`,
        )
        .join("")}</dl>
    </header>
    <section id="skills" aria-labelledby="summary-skills">
      <h2 id="summary-skills">AI/ML and software development skills</h2>
      ${list(expertise)}
    </section>
    <section id="projects" aria-labelledby="summary-projects">
      <h2 id="summary-projects">Selected projects</h2>
      <p>${projects.length} selected projects from my work in AI, software engineering and creative technology.</p>
      ${projects
        .map(
          (project) => `<article>
        <p class="portfolio-summary-label">${e(project.category)} · ${e(project.tag)}</p>
        <h3>${e(project.title)}</h3>
        <p>${e(project.summary)}</p>
        <p><strong>Technologies:</strong> ${e(project.stack.join(", "))}</p>
        ${project.sourceUrl ? `<a href="${e(project.sourceUrl)}">Source code for ${e(project.title)}</a>` : ""}
      </article>`,
        )
        .join("")}
    </section>
    <section id="experience" aria-labelledby="summary-experience">
      <h2 id="summary-experience">Career and education</h2>
      ${experiences
        .map(
          (experience) => `<article>
        <p class="portfolio-summary-label">${e(experience.period)}</p>
        <h3>${e(experience.role)}</h3>
        <p>${e(experience.company)} · ${e(experience.location)}</p>
        ${experience.works ? list(experience.works) : ""}
        ${experience.note ? `<p>${e(experience.note)}</p>` : ""}
      </article>`,
        )
        .join("")}
      ${education.map((item) => `<article><h3>${e(item.degree)}</h3><p>${e(item.school)} · ${e(item.period)}</p></article>`).join("")}
    </section>
    <section aria-labelledby="summary-questions">
      <h2 id="summary-questions">About Brighty</h2>
      ${profileQuestions
        .map(
          ({ question, answer, link }) => `<article>
        <h3>${e(question)}</h3><p>${e(answer)}</p>
        ${link ? `<a href="${e(link.href)}">${e(link.label)}</a>` : ""}
      </article>`,
        )
        .join("")}
    </section>
    <section id="contact" aria-labelledby="summary-contact">
      <h2 id="summary-contact">Contact ${e(profile.name)}</h2>
      <p>${e(profile.contactIntro)}</p>
      <p><a href="mailto:${e(profile.email)}">${e(profile.email)}</a></p>
      <nav aria-label="Brighty’s profiles">${Object.entries(profile.links)
        .map(
          ([name, url]) =>
            `<a rel="me" href="${e(url)}">${e(name === "linkedin" ? "LinkedIn" : name === "github" ? "GitHub" : name)}</a>`,
        )
        .join("")}</nav>
    </section>
  </main>`;
}

export function createDiscoveryFiles() {
  return {
    "robots.txt": {
      type: "text/plain; charset=utf-8",
      source: `User-agent: *\nAllow: /\n\nSitemap: ${site.url}sitemap.xml\n`,
    },
    "sitemap.xml": {
      type: "application/xml; charset=utf-8",
      // Hash sections are one page; do not advertise them as separate URLs.
      source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escapeHtml(site.url)}</loc></url></urlset>\n`,
    },
    "portfolio.jsonld": {
      type: "application/ld+json; charset=utf-8",
      source: `${JSON.stringify(createStructuredData(), null, 2)}\n`,
    },
  };
}

export default function portfolioSeo() {
  let base = "/";
  return {
    name: "portfolio-discovery",
    configResolved(config) {
      base = config.base;
    },
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        if (
          !html.includes("<!-- portfolio:metadata -->") ||
          !html.includes("<!-- portfolio:summary -->")
        ) {
          throw new Error(
            "The portfolio HTML is missing its discovery placeholders.",
          );
        }
        return html
          .replace("<!-- portfolio:metadata -->", renderMetadata())
          .replace("<!-- portfolio:summary -->", renderPortfolioSummary());
      },
    },
    generateBundle() {
      for (const [fileName, { source }] of Object.entries(
        createDiscoveryFiles(),
      )) {
        this.emitFile({ type: "asset", fileName, source });
      }
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = new URL(req.url, "http://localhost").pathname;
        const name = path.startsWith(base)
          ? path.slice(base.length)
          : path.slice(1);
        const file = Object.entries(createDiscoveryFiles()).find(
          ([fileName]) => fileName === name,
        )?.[1];
        if (!file || !["GET", "HEAD"].includes(req.method)) return next();
        res.setHeader("Content-Type", file.type);
        res.end(req.method === "HEAD" ? undefined : file.source);
      });
    },
  };
}
