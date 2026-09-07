import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// Repo root, one level up from scripts/ — works on Windows and POSIX alike.
const REPO = fileURLToPath(new URL("..", import.meta.url));
const FONTDIR = join(REPO, "fonts");
mkdirSync(FONTDIR, { recursive: true });

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const CSS_URL =
  "https://fonts.googleapis.com/css2" +
  "?family=Anton" +
  "&family=IBM+Plex+Mono:wght@400;500" +
  "&family=IBM+Plex+Sans:wght@400;500;600" +
  "&display=swap";

// Ukrainian lives entirely in the `cyrillic` subset (U+0400-045F plus U+0490-0491).
const KEEP = new Set(["latin", "cyrillic"]);

const SLUG = {
  "Anton": "anton",
  "IBM Plex Mono": "plexmono",
  "IBM Plex Sans": "plexsans",
};

const res = await fetch(CSS_URL, { headers: { "User-Agent": UA } });
if (!res.ok) throw new Error("CSS fetch failed: " + res.status);
const css = await res.text();

// Google emits: /* subset */\n@font-face { ... }
const blocks = [];
const re = /\/\*\s*([a-z-]+)\s*\*\/\s*(@font-face\s*\{[^}]*\})/g;
let m;
while ((m = re.exec(css)) !== null) blocks.push({ subset: m[1], body: m[2] });

if (blocks.length === 0) throw new Error("no @font-face blocks parsed");

const out = [
  "/* Self-hosted so the page does not depend on fonts.googleapis.com.",
  "   Privacy browsers (Zen, Firefox strict mode, uBlock) block that domain,",
  "   which silently drops every face back to a system fallback.",
  "   Subsets kept: latin + cyrillic. Regenerate with scripts/selfhost-fonts.mjs. */",
  "",
];

// Group by the FILE, not by the weight: Google serves IBM Plex Sans as a
// variable font, so 400/500/600 all resolve to one identical woff2. Writing
// it once and declaring a weight RANGE saves ~150 KB of duplicate bytes.
const byFile = new Map();
const skipped = [];

for (const b of blocks) {
  const family = (b.body.match(/font-family:\s*'([^']+)'/) || [])[1];
  const weight = (b.body.match(/font-weight:\s*(\d+)/) || [])[1];
  const url = (b.body.match(/url\((https:\/\/[^)]+\.woff2)\)/) || [])[1];
  const range = (b.body.match(/unicode-range:\s*([^;]+);/) || [])[1];

  if (!family || !weight || !url) continue;
  if (!KEEP.has(b.subset)) {
    skipped.push(b.subset);
    continue;
  }
  if (!SLUG[family]) throw new Error("unmapped family: " + family);

  if (!byFile.has(url)) {
    byFile.set(url, { family, subset: b.subset, range, weights: [] });
  }
  byFile.get(url).weights.push(Number(weight));
}

let bytes = 0;

for (const [url, f] of byFile) {
  const lo = Math.min(...f.weights);
  const hi = Math.max(...f.weights);
  const name = `${SLUG[f.family]}-${lo === hi ? lo : lo + "-" + hi}-${f.subset}.woff2`;

  const fres = await fetch(url, { headers: { "User-Agent": UA } });
  if (!fres.ok) throw new Error("font fetch failed " + fres.status + " " + url);
  const buf = Buffer.from(await fres.arrayBuffer());
  writeFileSync(join(FONTDIR, name), buf);
  bytes += buf.length;

  out.push("@font-face {");
  out.push(`  font-family: '${f.family}';`);
  out.push("  font-style: normal;");
  out.push(`  font-weight: ${lo === hi ? lo : lo + " " + hi};`);
  out.push("  font-display: swap;");
  out.push(`  src: url('fonts/${name}') format('woff2');`);
  if (f.range) out.push(`  unicode-range: ${f.range};`);
  out.push("}");
  out.push("");

  console.log(`${name.padEnd(32)} ${String(buf.length).padStart(7)} B  weights ${f.weights.join("/")}`);
}

const kept = byFile.size;

writeFileSync(join(REPO, "fonts.css"), out.join("\n"), "utf8");
console.log(`\n${kept} files written to fonts.css`);
console.log(`skipped subsets: ${[...new Set(skipped.map((s) => s.split(" ").pop()))].join(", ")}`);
