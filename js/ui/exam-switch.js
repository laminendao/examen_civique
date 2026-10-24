/* Onglets de choix de l'examen (carte de séjour pluriannuelle, carte de résident, naturalisation).
   Chaque examen garde sa propre progression : changer d'onglet ne touche pas aux autres. */
import { state } from "../core/state.js";
import { EXAMS, EXAM_ORDER, isExam, loadExam, Q } from "../core/data.js";
import { rememberExam, refreshStats, examSummary, save } from "../core/progress.js";
import { go, current } from "../core/router.js";

const bar = () => document.getElementById("exambar");

/* Charge les questions d'un examen et met à jour les textes qui le nomment. */
export async function useExam(slug){
  if (!isExam(slug)) slug = "carte-resident";
  await loadExam(slug);
  state.exam = slug;
  const e = EXAMS[slug];
  document.getElementById("brand-sub").textContent = "Entraînement · " + e.label.toLowerCase();
  document.getElementById("foot-exam").textContent = "Examen civique · " + e.label.toLowerCase();
  document.title = "Examen civique " + e.of.replace(/^de (la )?/, "") + " : entraînement gratuit";
  paintBar();
}

export function paintBar(){
  const el = bar(); if (!el) return;
  el.querySelector(".exam-tabs").innerHTML = EXAM_ORDER.map(slug => {
    const e = EXAMS[slug], on = slug === state.exam;
    const s = examSummary(slug, on ? Q.length : null);
    const prog = s.seen ? `${s.seen} vue${s.seen > 1 ? "s" : ""} · ${s.mastered} acquise${s.mastered > 1 ? "s" : ""}` : "Pas commencé";
    return `<button type="button" role="tab" class="exam-tab${on ? " on" : ""}" data-exam="${slug}" aria-selected="${on}">
      <span class="e"><i class='ic' data-i='${e.icon}'></i></span>
      <span class="lbl"><b><span class="long">${e.label}</span><span class="tiny">${e.tiny}</span></b><small>${prog}</small></span>
    </button>`;
  }).join("");
}

export function showExamBar(show){ bar().hidden = !show; }

export function setupExamSwitch(){
  document.addEventListener("ec-stats", paintBar);
  bar().addEventListener("click", async ev => {
    const b = ev.target.closest("[data-exam]");
    if (!b || b.dataset.exam === state.exam) return;
    const tabs = bar().querySelectorAll(".exam-tab");
    tabs.forEach(t => t.disabled = true);
    try {
      await useExam(b.dataset.exam);
      rememberExam(state.exam);
      save();
      refreshStats();
      paintBar();
      go(current || "home", true, false);
    } catch(e){
      console.error(e);
      tabs.forEach(t => t.disabled = false);
    }
  });
}
