// Builds a single-file static preview (for a private claude.ai link) from page snapshots + the island bundle.
import fs from "node:fs";
const [dir] = process.argv.slice(2);
const { PAGES, chrome, css } = JSON.parse(fs.readFileSync(`${dir}/snap.json`, "utf8"));
const bundle = fs.readFileSync(`${dir}/bundle.js`, "utf8");

const siteCss = css
  .replace(/@font-face\s*{[^}]*}/g, "")
  .replace(/\.__variable_[\w]+\s*{[^}]*}/g, "")
  .replace(/\.__className_[\w]+\s*{[^}]*}/g, "");

const groups = [
  ["Public site", ["home", "academy", "apply", "live", "notes", "about", "register", "login", "note-why-we-dont-post-pnl", "note-the-week-we-cut-size", "note-win-rate-is-a-trap"]],
  ["Student area", ["dashboard", "foundations", "foundations-lesson", "course", "lesson", "checkout", "account"]],
  ["Admin", ["admin", "admin-students", "admin-orders", "admin-requests"]],
  ["Legal", ["legal-risk-disclosure", "legal-terms", "legal-privacy", "legal-refunds", "legal-complaints"]],
];
const options = groups
  .map(([g, ts]) => `<optgroup label="${g}">${ts.map((t) => `<option value="${t}">${PAGES[t].title}</option>`).join("")}</optgroup>`)
  .join("");

const json = JSON.stringify(PAGES).replace(/<\//g, "<\\/").replace(/<!--/g, "<\\!--");
const html = `<title>Art of Markets Preview</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap">
<style>
${siteCss}
:root {
  --font-newsreader: "Newsreader";
  --font-plex-sans: "IBM Plex Sans";
  --font-plex-mono: "IBM Plex Mono";
}
.risk-bar { top: env(safe-area-inset-top, 0px); }
.pv-bar {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--s-2) var(--s-4);
  padding: var(--s-2) var(--gutter); background: var(--c-accent-soft); color: var(--c-ink);
  font-size: var(--step-n1); border-bottom: 1px solid var(--c-line);
}
.pv-bar label { display: flex; align-items: center; gap: var(--s-2); }
.pv-bar select { min-height: 2.25rem; max-width: 16rem; font-size: var(--step-n1); }
#pv-toast {
  position: fixed; left: 50%; bottom: calc(var(--s-5) + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%); z-index: 100;
  max-width: calc(100% - 2 * var(--gutter)); padding: var(--s-3) var(--s-5); border-radius: var(--radius-m);
  background: var(--c-ink); color: var(--c-bg); font-size: var(--step-n1); box-shadow: var(--shadow-m);
}
</style>
<div class="pv-bar">
  <span><strong>Preview of artofmarkets.com.</strong> The simulator, grid, 3D surface and shader are live. Sign-up, payments and admin actions work on the deployed site.</span>
  <label for="pv-page">Page <select id="pv-page" class="select">${options}</select></label>
</div>
${chrome.risk}
${chrome.header}
<main id="main"></main>
${chrome.footer}
<div id="pv-toast" role="status" hidden></div>
<script>const PAGES = ${json};</script>
<script>${bundle.replace(/<\/script/gi, "<\\/script")}</script>
`;
fs.writeFileSync(`${dir}/art-of-markets-preview.html`, html);
console.log("bytes", html.length);
