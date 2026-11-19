// Production static server for the built site (dist/), run by PM2 (ecosystem.config.cjs) behind nginx.
// Env: HOST (default 127.0.0.1), PORT (default 3014), DIST_DIR (default: dist/ next to this folder).
// No dependencies, so the server keeps running while `npm ci` rebuilds node_modules.
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { pipeline } from "node:stream";
import { fileURLToPath } from "node:url";

const root = resolve(process.env.DIST_DIR || fileURLToPath(new URL("../dist", import.meta.url)));
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 3014);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".glb": "model/gltf-binary",
  ".gltf": "model/gltf+json",
  ".bin": "application/octet-stream",
  ".wasm": "application/wasm",
  ".ktx2": "image/ktx2",
  ".m4a": "audio/mp4",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "SAMEORIGIN",
};

// Vite fingerprints everything in /assets/, so those files never change under the same name.
// Files copied from public/ (textures, models, audio, icons) keep their names, so they are cached for a day.
function cacheControl(relativePath, ext) {
  if (relativePath.startsWith("/assets/")) return "public, max-age=31536000, immutable";
  if (ext === ".html" || ext === ".webmanifest") return "no-cache";
  return "public, max-age=86400";
}

async function findFile(pathname) {
  const target = resolve(root, `.${pathname}`);
  // Never serve anything outside dist/.
  if (target !== root && !target.startsWith(root + sep)) return null;
  try {
    const stats = await stat(target);
    if (stats.isFile()) return { file: target, stats };
    if (stats.isDirectory()) {
      const index = resolve(target, "index.html");
      const indexStats = await stat(index);
      if (indexStats.isFile()) return { file: index, stats: indexStats };
    }
  } catch {
    // Missing file: handled by the caller.
  }
  return null;
}

function sendText(res, status, text, extraHeaders = {}) {
  res.writeHead(status, {
    ...SECURITY_HEADERS,
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
    ...extraHeaders,
  });
  res.end(text);
}

function isFresh(req, etag, lastModified) {
  const ifNoneMatch = req.headers["if-none-match"];
  if (ifNoneMatch) {
    const bare = etag.replace(/^W\//, "");
    return ifNoneMatch.split(",").some((tag) => {
      const value = tag.trim();
      return value === "*" || value.replace(/^W\//, "") === bare;
    });
  }
  const ifModifiedSince = Date.parse(req.headers["if-modified-since"] || "");
  return !Number.isNaN(ifModifiedSince) && Date.parse(lastModified) <= ifModifiedSince;
}

// One "bytes=start-end" range, which is what browsers send for audio (Safari will not play audio without it).
// Anything else (several ranges, junk, a stale If-Range) gets the whole file, which is always allowed.
function parseRange(req, size, etag, lastModified) {
  const header = req.headers.range;
  if (!header || size === 0) return null;
  const ifRange = req.headers["if-range"];
  if (ifRange && ifRange !== etag && ifRange !== lastModified) return null;

  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match || (match[1] === "" && match[2] === "")) return null;

  if (match[1] === "") {
    const suffix = Number(match[2]);
    if (suffix === 0) return "unsatisfiable";
    return { start: Math.max(size - suffix, 0), end: size - 1 };
  }
  const start = Number(match[1]);
  const end = match[2] === "" ? size - 1 : Math.min(Number(match[2]), size - 1);
  if (start >= size) return "unsatisfiable";
  if (end < start) return null;
  return { start, end };
}

function serveFile(req, res, { file, stats }) {
  const relativePath = file.slice(root.length).split(sep).join("/");
  const ext = extname(file).toLowerCase();
  const etag = `"${Math.floor(stats.mtimeMs).toString(16)}-${stats.size.toString(16)}"`;
  const lastModified = stats.mtime.toUTCString();
  const headers = {
    ...SECURITY_HEADERS,
    "Content-Type": TYPES[ext] || "application/octet-stream",
    "Cache-Control": cacheControl(relativePath, ext),
    "Last-Modified": lastModified,
    ETag: etag,
    "Accept-Ranges": "bytes",
  };

  if (isFresh(req, etag, lastModified)) {
    res.writeHead(304, headers);
    res.end();
    return;
  }

  let start = 0;
  let end = stats.size - 1;
  let status = 200;
  const range = parseRange(req, stats.size, etag, lastModified);
  if (range === "unsatisfiable") {
    sendText(res, 416, "Range Not Satisfiable", { "Content-Range": `bytes */${stats.size}` });
    return;
  }
  if (range) {
    ({ start, end } = range);
    status = 206;
    headers["Content-Range"] = `bytes ${start}-${end}/${stats.size}`;
  }
  headers["Content-Length"] = stats.size === 0 ? 0 : end - start + 1;
  res.writeHead(status, headers);

  if (req.method === "HEAD" || stats.size === 0) {
    res.end();
    return;
  }
  pipeline(createReadStream(file, { start, end }), res, (error) => {
    // A visitor leaving mid-download is normal; anything else is worth a log line.
    if (error && error.code !== "ERR_STREAM_PREMATURE_CLOSE") console.error(`[serve] ${relativePath}: ${error.message}`);
  });
}

async function handle(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    sendText(res, 405, "Method Not Allowed", { Allow: "GET, HEAD" });
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch {
    sendText(res, 400, "Bad Request");
    return;
  }
  if (pathname.includes("\0")) {
    sendText(res, 400, "Bad Request");
    return;
  }

  let found = await findFile(pathname);
  // An address without a file extension is a page: answer it with the app.
  // A missing file with an extension (a texture, a model) stays a real 404 instead of returning HTML.
  if (!found && !extname(pathname)) found = await findFile("/index.html");
  if (!found) {
    sendText(res, 404, "Not Found");
    return;
  }
  serveFile(req, res, found);
}

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(`Invalid PORT "${process.env.PORT}".`);
  process.exit(1);
}
try {
  await stat(resolve(root, "index.html"));
} catch {
  console.error(`No build found at ${root}. Run "npm run build:server" first.`);
  process.exit(1);
}

const server = createServer((req, res) => {
  handle(req, res).catch((error) => {
    console.error(`[serve] ${req.url}: ${error.stack || error}`);
    if (!res.headersSent) sendText(res, 500, "Internal Server Error");
    else res.destroy();
  });
});

server.listen(port, host, () => console.log(`Serving ${root} on http://${host}:${port}`));

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
