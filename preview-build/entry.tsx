import { createRoot, type Root } from "react-dom/client";
import { EdgeSimulator } from "@/components/sim/EdgeSimulator";
import { ExpectancyGrid } from "@/components/sim/ExpectancyGrid";
import { MiniFan } from "@/components/sim/MiniFan";
import { VolSurface } from "@/components/visual/VolSurface";
import { InkShader } from "@/components/visual/InkShader";
import { toToken } from "./routes";

declare const PAGES: Record<string, { title: string; html: string }>;

let roots: Root[] = [];

function mountInPlace(el: Element | null | undefined, node: React.ReactNode) {
  if (!el) return;
  const host = document.createElement("div");
  host.style.display = "contents";
  el.replaceWith(host);
  const root = createRoot(host);
  root.render(node);
  roots.push(root);
}

function islands(token: string) {
  const main = document.getElementById("main")!;
  if (token === "home") {
    mountInPlace(main.querySelector("#simulator .panel"), <EdgeSimulator />);
    mountInPlace(main.querySelector("section[aria-labelledby=wr-title] figure"), <ExpectancyGrid />);
    mountInPlace(main.querySelector('[aria-label^="A 3D implied volatility"]'), <VolSurface />);
    mountInPlace(main.querySelector("canvas.shader"), <InkShader />);
  }
  if (token === "apply") {
    const fan = main.querySelector('canvas[aria-label^="Miniature"]')?.closest(".stack");
    mountInPlace(fan, <MiniFan profile={{ winRate: 0.35, avgWinR: 3, riskPct: 5, trades: 200, costR: 0.05 }} />);
  }
}

function rewriteLinks(scope: ParentNode) {
  scope.querySelectorAll<HTMLAnchorElement>("a[href^='/']").forEach((a) => {
    a.setAttribute("href", "#" + toToken(a.getAttribute("href")!));
  });
}

function toast(msg: string) {
  const t = document.getElementById("pv-toast")!;
  t.textContent = msg;
  t.hidden = false;
  clearTimeout((t as any)._h);
  (t as any)._h = setTimeout(() => (t.hidden = true), 4200);
}

function route() {
  const raw = location.hash.slice(1);
  const token = PAGES[raw] ? raw : "home";
  roots.forEach((r) => r.unmount());
  roots = [];
  const main = document.getElementById("main")!;
  main.innerHTML = PAGES[token].html;
  rewriteLinks(main);
  islands(token);
  (document.getElementById("pv-page") as HTMLSelectElement).value = token;
  document.querySelectorAll("details[open]").forEach((d) => d.removeAttribute("open"));
  // In-page anchors on the home page (e.g. #simulator) aren't page tokens: scroll to them.
  if (raw && !PAGES[raw]) document.getElementById(raw)?.scrollIntoView();
  else window.scrollTo(0, 0);
}

document.addEventListener("submit", (e) => {
  e.preventDefault();
  toast("Preview only: forms, sign-up and payments work on the deployed site.");
}, true);
document.addEventListener("click", (e) => {
  const a = (e.target as Element).closest?.("a");
  if (a && a.getAttribute("href") === location.hash) route();
});
document.getElementById("pv-page")!.addEventListener("change", (e) => {
  location.hash = (e.target as HTMLSelectElement).value;
});
rewriteLinks(document);
window.addEventListener("hashchange", route);
route();
