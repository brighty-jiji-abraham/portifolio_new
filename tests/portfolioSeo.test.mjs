import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import portfolioSeo, {
  createDiscoveryFiles,
  createStructuredData,
  escapeHtml,
  renderMetadata,
  renderPortfolioSummary,
  serializeJsonLd,
} from "../build/portfolioSeo.js";
import { projects } from "../src/data/projects.js";
import { profile } from "../src/data/profile.js";
import { site } from "../src/data/discovery.js";

test("content and JSON-LD cannot terminate their HTML containers", () => {
  const text = '</script><img src=x onerror="alert(1)"> & Brighty\'s';
  assert.equal(
    escapeHtml(text),
    "&lt;/script&gt;&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; Brighty&#39;s",
  );
  const encoded = serializeJsonLd({ description: text });
  assert.ok(!encoded.includes("<"));
  assert.equal(JSON.parse(encoded).description, text);
});

test("page, person, employer and project references resolve in the same graph", () => {
  const structured = createStructuredData();
  const definitions = new Set();
  const references = [];
  const inspect = (node) => {
    if (!node || typeof node !== "object") return;
    if (node["@id"]) {
      if (node["@type"]) definitions.add(node["@id"]);
      else references.push(node["@id"]);
      assert.ok(node["@id"].startsWith(site.url));
    }
    Object.values(node).forEach(inspect);
  };
  inspect(structured);
  references.forEach((reference) =>
    assert.ok(definitions.has(reference), reference),
  );
  const person = structured["@graph"].find(
    (node) => node["@type"] === "Person",
  );
  assert.equal(person.name, profile.name);
  assert.deepEqual(person.alternateName, ["Brighty", "Brighty Jiji"]);
  const selected = structured["@graph"].find(
    (node) => node["@type"] === "ItemList",
  );
  assert.equal(selected.numberOfItems, projects.length);
  assert.equal(selected.itemListElement.length, projects.length);
  const html = renderPortfolioSummary();
  for (const { item } of selected.itemListElement) {
    assert.ok(html.includes(escapeHtml(item.name)), item.name);
    assert.ok(html.includes(escapeHtml(item.description)), item.name);
  }
});

test("HTML, discovery files and manifest consistently identify brighty.pro", async () => {
  const html = renderMetadata();
  assert.equal((html.match(/<title>/g) || []).length, 1);
  assert.ok(html.includes(`<title>${site.title}</title>`));
  assert.ok(html.includes('<link rel="canonical" href="https://brighty.pro/"'));
  assert.ok(!html.includes("github.io"));
  assert.ok(!html.includes('name="keywords"'));
  const embedded = JSON.parse(
    html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1],
  );
  const files = createDiscoveryFiles();
  assert.deepEqual(embedded, JSON.parse(files["portfolio.jsonld"].source));
  assert.ok(
    files["robots.txt"].source.includes(`Sitemap: ${site.url}sitemap.xml`),
  );
  assert.equal((files["sitemap.xml"].source.match(/<loc>/g) || []).length, 1);
  assert.ok(files["sitemap.xml"].source.includes(`<loc>${site.url}</loc>`));
  const manifest = JSON.parse(
    await readFile(
      new URL("../public/site.webmanifest", import.meta.url),
      "utf8",
    ),
  );
  assert.equal(manifest.description, site.description);
});

test("the real HTML template gets crawlable content, and missing markers fail loudly", async () => {
  const template = await readFile(
    new URL("../index.html", import.meta.url),
    "utf8",
  );
  const transform = portfolioSeo().transformIndexHtml.handler;
  const output = transform(template);
  assert.ok(!output.includes("<!-- portfolio:"));
  assert.ok(output.includes(`<h1>${profile.name}</h1>`));
  assert.ok(output.includes(`href="mailto:${profile.email}"`));
  assert.ok(output.includes('src="/src/main.jsx"'));
  assert.throws(() => transform('<div id="root"></div>'), /missing/);
});
