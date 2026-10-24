/* Entraînement par thème officiel. */
import { Q, THEMES } from "../core/data.js";
import { esc, shuffle } from "../core/utils.js";
import { mastered } from "../core/progress.js";
import { page, render, view } from "../ui/layout.js";
import { runQuiz, summary, bindTrain } from "./quiz.js";

export function showThemes(){
  render(page("📚", "Entraînement par thème", "Choisis l'un des 5 thèmes officiels de l'examen.", `<div class="grid g3">${Object.entries(THEMES).map(([k, th]) => {
    const qs = Q.filter(q => q.t === k), m = qs.filter(q => mastered(q.id)).length;
    return `<button class="theme" id="th-${k}" data-k="${k}"><span class="ico">${th.icon}</span><strong>${esc(th.label)}</strong><small>${qs.length} questions · ${m} maîtrisées</small><div class="bar"><i style="width:${m / qs.length * 100}%"></i></div><span class="go">Commencer ➜</span></button>`;
  }).join("")}</div>`));
  view().querySelectorAll(".theme").forEach(b => b.addEventListener("click", () => start(b.dataset.k)));
}

function start(k){
  const th = THEMES[k], ids = shuffle(Q.filter(q => q.t === k).map(q => q.id));
  runQuiz(th.label, th.icon, { ids, pos: 0, good: 0, wrong: [] }, run => {
    render(page(th.icon, th.label, "Résultat du thème", summary(run, `<div class="row"><button class="btn" data-tab="themes">📚 Choisir un autre thème</button></div>`), true));
    bindTrain();
  });
}
