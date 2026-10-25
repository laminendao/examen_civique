/* Onglets de choix de l'examen (carte de séjour pluriannuelle, carte de résident, naturalisation).
   Chaque examen garde sa propre progression : changer d'onglet ne touche pas aux autres. */
import { state } from "../core/state.js";
import { EXAMS, EXAM_ORDER, isExam, loadExam, Q } from "../core/data.js";
import { rememberExam, refreshStats, examSummary, save } from "../core/progress.js";
import { go, current, replaceUrl, canLeave } from "../core/router.js";

const menu = () => document.getElementById("exam-menu");
const pick = () => document.getElementById("exam-pick");

/* Charge les questions d'un examen et met à jour les textes qui le nomment. */
export async function useExam(slug){
  if (!isExam(slug)) slug = "carte-resident";
  await loadExam(slug);
  state.exam = slug;
  const e = EXAMS[slug];
  document.getElementById("exam-pick-long").textContent = e.label;
  document.getElementById("exam-pick-short").textContent = e.tiny;
  document.title = e.title;
  document.querySelector('meta[name="description"]')?.setAttribute("content", e.desc);
  paintBar();
}

/* Contenu du menu : les 3 examens avec l'avancement de chacun. */
export function paintBar(){
  const el = menu(); if (!el) return;
  el.innerHTML = `<div class="menu-head"><b>Je m'entraîne pour</b><span>Chaque examen garde sa propre progression.</span></div>` + EXAM_ORDER.map(slug => {
    const e = EXAMS[slug], on = slug === state.exam;
    const s = examSummary(slug, on ? Q.length : null);
    const prog = s.seen ? `${s.seen} vue${s.seen > 1 ? "s" : ""} · ${s.mastered} acquise${s.mastered > 1 ? "s" : ""}` : "Pas commencé";
    return `<button type="button" class="exam-opt${on ? " on" : ""}" data-exam="${slug}" aria-current="${on}">
      <i class='ic' data-i='${e.icon}'></i><span><b>${e.label}</b><small>${prog}</small></span>${on ? "<i class='ic' data-i='check'></i>" : ""}</button>`;
  }).join("");
}

function openMenu(open){
  menu().hidden = !open;
  pick().setAttribute("aria-expanded", String(open));
  if (open){ paintBar(); menu().querySelector(".exam-opt.on")?.focus(); }
}

/* Change d'examen : charge ses questions, garde le choix, rafraîchit l'écran en cours. */
export async function switchExam(slug){
  if (!isExam(slug) || slug === state.exam) return;
  if (!(await canLeave())) return;
  try {
    await useExam(slug);
    rememberExam(state.exam);
    save();
    refreshStats();
    const t = current || "home";
    go(t, true, false);
    if (t === "home") replaceUrl("home");
  } catch(e){
    console.error(e);
  }
  paintBar();
}

export function setupExamSwitch(){
  document.addEventListener("ec-stats", paintBar);
  document.addEventListener("ec-exam-url", e => switchExam(e.detail));
  pick().addEventListener("click", e => { e.stopPropagation(); openMenu(menu().hidden); });
  menu().addEventListener("click", ev => {
    const b = ev.target.closest("[data-exam]");
    if (!b) return;
    ev.stopPropagation();
    openMenu(false);
    switchExam(b.dataset.exam);
  });
  document.addEventListener("click", e => { if (!menu().hidden && !e.target.closest("#picker")) openMenu(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !menu().hidden){ openMenu(false); pick().focus(); } });
}
