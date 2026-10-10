#!/usr/bin/env node
/* MMA Ladder – static build for search engines.
   Turns index.html + data.js into one real HTML page per ranking and per fighter (clean URLs,
   unique titles and descriptions, content readable without JavaScript), plus sitemap.xml and robots.txt.
   Runs automatically on GitHub (.github/workflows/deploy.yml) after every push. No dependencies.

   Local run:  node build.js            → output in _site/
   Env:        BASE_PATH  e.g. "/mmaladder" for user.github.io/mmaladder, "" for a custom domain
               SITE_URL   e.g. "https://lakisekk.github.io/mmaladder" (data.js settings.siteUrl wins) */
const fs = require("fs");
const path = require("path");

global.window = global;
const ROOT = __dirname;
require(path.join(ROOT, "common.js"));
require(path.join(ROOT, "data.js"));
require(path.join(ROOT, "render.js"));

const D = MML.normalize(window.MMA_DATA);
const BASE = (process.env.BASE_PATH || "").replace(/\/+$/, "") + "/";
const SITE = (D.settings.siteUrl || process.env.SITE_URL || "").replace(/\/+$/, "");
const OUT = path.join(ROOT, "_site");

const esc = MML.esc;
const abs = p => SITE ? SITE + "/" + (p ? p + "/" : "") : "";
const template = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const ogFile = fs.existsSync(path.join(ROOT, "og.png")) ? "og.png" : fs.existsSync(path.join(ROOT, "assets", "og.png")) ? "assets/og.png" : "";

function htmlFor(pg, canonicalPath) {
  const canonical = canonicalPath == null ? "" : abs(canonicalPath);
  let seo = "";
  if (canonical) seo += `<link rel="canonical" href="${esc(canonical)}">\n<meta property="og:url" content="${esc(canonical)}">\n`;
  if (pg.jsonld) seo += `<script type="application/ld+json">${JSON.stringify(pg.jsonld).replace(/</g, "\\u003c")}</script>\n`;
  let h = template
    .replace('<meta charset="utf-8">', `<meta charset="utf-8">\n<base href="${esc(BASE)}">`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(pg.title)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(pg.desc)}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(pg.title)}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(pg.desc)}">`)
    .replace(/<meta property="og:image" content="[^"]*">/, ogFile && SITE ? `<meta property="og:image" content="${esc(SITE + "/" + ogFile)}">` : "")
    .replace("<!--SEO-->", seo)
    .replace("<!--SITE-->", `<script>window.__SITE__ = ${JSON.stringify({ base: BASE })};</script>`);
  // inserted last and via a function so "$" in names can never be read as a replacement pattern
  h = h.replace("<!--APP-->", () => pg.html);
  return h;
}

function write(rel, content) {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const ctx = { link: p => BASE + (p ? p + "/" : ""), preview: false };
const routes = MLR.allRoutes(D);
const urls = [];
for (const r of routes) {
  const pg = MLR.page(D, r, ctx);
  const p = MLR.path(D, r);
  write(p ? p + "/index.html" : "index.html", htmlFor(pg, p));
  urls.push(p);
}
// unknown URLs (e.g. a fighter added after the last build) still work: GitHub serves 404.html, the app routes it
write("404.html", htmlFor(MLR.page(D, { type: "notfound" }, ctx), null).replace("<title>", '<meta name="robots" content="noindex">\n<title>'));

// static files
for (const f of ["common.js", "data.js", "render.js", "app.js", "admin.html", "og.png", "favicon.png"]) {
  if (fs.existsSync(path.join(ROOT, f))) fs.copyFileSync(path.join(ROOT, f), path.join(OUT, f));
}
if (fs.existsSync(path.join(ROOT, "assets"))) fs.cpSync(path.join(ROOT, "assets"), path.join(OUT, "assets"), { recursive: true });

// sitemap + robots
if (SITE) {
  const lastmod = D.updated || new Date().toISOString().slice(0, 10);
  write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map(p => `  <url><loc>${esc(abs(p))}</loc><lastmod>${lastmod}</lastmod><priority>${p === "" ? "1.0" : p.startsWith("fighter/") ? "0.7" : "0.8"}</priority></url>`).join("\n") +
    `\n</urlset>\n`);
}
write("robots.txt", `User-agent: *\nAllow: /\nDisallow: ${BASE}admin.html\n${SITE ? `Sitemap: ${SITE}/sitemap.xml\n` : ""}`);

console.log(`Built ${urls.length} pages into _site/ (base ${BASE}${SITE ? ", site " + SITE : ", no site URL – sitemap skipped"})`);
