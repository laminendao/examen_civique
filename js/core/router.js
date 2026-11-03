/* Navigation entre les onglets, avec des adresses propres (/serie-du-jour, /examen-blanc…). */
import { state } from "./state.js";
import { EXAMS } from "./data.js";

export const SLUGS = {
  home: "", daily: "serie-du-jour", exam: "examen-blanc", themes: "themes", weak: "a-ameliorer",
  review: "revision", info: "infos-utiles", legal: "mentions-legales", privacy: "confidentialite", account: "mon-compte", stats: "mon-suivi",
};
const SLUG2TAB = Object.fromEntries(Object.entries(SLUGS).map(([k, v]) => [v, k]));
/* Pages d'accueil propres à chaque examen : /naturalisation/, /carte-de-resident/… */
const PAGE2EXAM = Object.fromEntries(Object.entries(EXAMS).map(([k, e]) => [e.page, k]));

/* Adresses propres seulement sur un vrai site web, pas en fichier local ni dans un aperçu intégré. */
const ROUTING = /^https?:$/.test(location.protocol) && window.top === window;

export let BASE = location.pathname.replace(/index\.html$/, "");
let initialTab = null;

/* Lit l'onglet demandé dans l'adresse (y compris au retour de 404.html et des anciens liens #…). */
(function initRoute(){
  const q = new URLSearchParams(location.search);
  if (q.has("p")){
    const p = q.get("p").replace(/^\/+|\/+$/g, "");
    if (PAGE2EXAM[p]){ state.urlExam = PAGE2EXAM[p]; initialTab = "home"; }
    else initialTab = SLUG2TAB[p] || "home";
    q.delete("p");
  } else {
    const last = BASE.replace(/\/+$/, "").split("/").pop();
    if (ROUTING && last && SLUG2TAB[last] !== undefined){ initialTab = SLUG2TAB[last]; BASE = BASE.replace(new RegExp(last + "/?$"), ""); }
    else if (last && PAGE2EXAM[last]){ state.urlExam = PAGE2EXAM[last]; initialTab = "home"; BASE = BASE.replace(new RegExp(last + "/?$"), ""); }
  }
  const legacy = location.hash.slice(1);
  if (!initialTab && SLUGS[legacy] !== undefined) initialTab = legacy;
  if (!BASE.endsWith("/")) BASE += "/";
  if (ROUTING && !/access_token|type=recovery|error/.test(location.hash)){
    const rest = q.toString();
    const path = state.urlExam ? EXAMS[state.urlExam].page + "/" : (initialTab ? SLUGS[initialTab] : "");
    history.replaceState(null, "", BASE + path + (rest ? "?" + rest : ""));
  }
})();

export const APP_URL = location.origin + BASE;
/* L'accueil a une adresse par examen (/naturalisation/…) ; les autres onglets sont communs. */
export const pathFor = tab => BASE + (tab === "home" || !SLUGS[tab] ? EXAMS[state.exam].page + "/" : SLUGS[tab]);
export function replaceUrl(tab){ if (ROUTING) try { history.replaceState({ tab }, "", pathFor(tab)); } catch(e) {} }
export function takeInitialTab(){ const t = initialTab; initialTab = null; return t; }

/* Les pages s'enregistrent ici (voir main.js). */
const VIEWS = {};
export function registerViews(map){ Object.assign(VIEWS, map); }
export const hasView = tab => !!VIEWS[tab];

/* Garde de sortie : pendant un examen blanc, on demande confirmation avant de quitter la page.
   leaveGuard() renvoie une promesse : true = on peut partir. */
let leaveGuard = null;
export function setLeaveGuard(fn){ leaveGuard = fn; }
export async function canLeave(){ return !leaveGuard || await leaveGuard(); }

export let current = "home";
export function go(tab, render = true, pushUrl = true){
  if (!VIEWS[tab]) tab = "home";
  current = tab;
  document.body.dataset.page = tab;   // le choix de l'examen est masqué sur les pages générales (voir style.css)
  document.querySelectorAll(".navlink, .tabbar button").forEach(b => {
    if (b.dataset.tab === tab) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
  });
  if (render){ VIEWS[tab](); window.scrollTo({ top: 0, behavior: "instant" }); document.dispatchEvent(new CustomEvent("ec-page", { detail: pathFor(tab) })); }
  if (ROUTING && pushUrl){
    try { if (location.pathname !== pathFor(tab) || location.hash) history.pushState({ tab }, "", pathFor(tab)); } catch(e) {}
  } else if (!ROUTING && location.hash && SLUGS[location.hash.slice(1)] !== undefined){
    try { history.replaceState(null, "", location.pathname + location.search); } catch(e) {}
  }
}

/* Tout élément portant data-tab="…" ouvre l'onglet correspondant ; boutons Précédent/Suivant du navigateur. */
export function setupNavigation(){
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-tab]");
    if (!t) return;
    e.preventDefault();
    const auth = document.getElementById("auth");
    if (!auth.hidden){
      if (!["legal", "privacy"].includes(t.dataset.tab)) return;
      state.authReturn = true;
      auth.hidden = true; document.getElementById("view").hidden = false;
    }
    const m = document.getElementById("menu"); if (m) m.hidden = true;
    const tab = t.dataset.tab;
    canLeave().then(ok => { if (ok) go(tab); });
  });
  window.addEventListener("popstate", () => {
    if (!ROUTING || !document.getElementById("auth").hidden) return;
    const slug = location.pathname.slice(BASE.length).replace(/\/+$/, "");
    if (PAGE2EXAM[slug] && PAGE2EXAM[slug] !== state.exam){
      document.dispatchEvent(new CustomEvent("ec-exam-url", { detail: PAGE2EXAM[slug] }));
      return;
    }
    go(SLUG2TAB[slug] || "home", true, false);
  });
}
