/* Série du jour (15 questions) et série supplémentaire. */
import { Q, DAILY_N } from "../core/data.js";
import { state } from "../core/state.js";
import { todayStr, rng } from "../core/utils.js";
import { dailyIds, save, refreshStats, mastered, missed } from "../core/progress.js";
import { page, render } from "../ui/layout.js";
import { runQuiz, summary, bindTrain } from "./quiz.js";

export function showDaily(){
  const d = dailyIds();
  if (d.pos >= d.ids.length) return finish(d);
  runQuiz("Série du jour", "📅", d, finish, save);
}

function finish(run){
  state.store.days[todayStr()] = { score: run.good }; save(); refreshStats();
  const cal = [];
  for (let i = 27; i >= 0; i--){
    const x = new Date(); x.setDate(x.getDate() - i); const k = todayStr(x);
    cal.push(`<i class="${state.store.days[k] ? "done" : ""} ${i === 0 ? "today" : ""}" title="${k}"></i>`);
  }
  render(page("✅", "Série du jour terminée", "Reviens demain : la prochaine série reprendra d'abord tes erreurs, puis des questions jamais vues.", summary(run,
    `<div><div class="note" style="margin-bottom:8px">🔥 Tes 28 derniers jours</div><div class="calendar">${cal.join("")}</div></div>
     <div class="row"><button class="btn" id="again">➕ Faire une série supplémentaire</button><button class="btn" data-tab="weak">🎯 Voir mes points à améliorer</button></div>`), true));
  bindTrain();
  document.getElementById("again").addEventListener("click", extraSeries);
}

function extraSeries(){
  const r = rng(todayStr() + Date.now());
  const ids = Q.map(q => ({ id: q.id, k: (mastered(q.id) ? 2 : (missed(q.id) ? 0 : 1)) + r() }))
    .sort((a, b) => a.k - b.k).slice(0, DAILY_N).map(x => x.id);
  runQuiz("Série supplémentaire", "➕", { ids, pos: 0, good: 0, wrong: [] }, run => {
    render(page("➕", "Série supplémentaire", "", summary(run), true));
    bindTrain();
  });
}
