/* Série du jour (15 questions) et série supplémentaire. */
import { Q, DAILY_N } from "../core/data.js";
import { todayStr, rng } from "../core/utils.js";
import { dailyIds, save, refreshStats, mastered, missed, markDayDone, dayDone } from "../core/progress.js";
import { page, render, help } from "../ui/layout.js";
import { runQuiz, summary, bindTrain } from "./quiz.js";

export function showDaily(){
  const d = dailyIds();
  if (d.pos >= d.ids.length) return finish(d);
  runQuiz("Série du jour", "<i class='ic' data-i='calendar'></i>", d, finish, save);
}

function finish(run){
  markDayDone(run.good); refreshStats();
  const cal = [];
  for (let i = 27; i >= 0; i--){
    const x = new Date(); x.setDate(x.getDate() - i); const k = todayStr(x);
    cal.push(`<i class="${dayDone(k) ? "done" : ""} ${i === 0 ? "today" : ""}" title="${k}"></i>`);
  }
  render(page("<i class='ic' data-i='check'></i>", "Série du jour terminée", help("Reviens demain : la prochaine série reprendra d'abord tes erreurs, puis des questions jamais vues."), summary(run,
    `<div><div class="note" style="margin-bottom:8px"><i class='ic' data-i='flame'></i> Tes 28 derniers jours</div><div class="calendar">${cal.join("")}</div></div>
     <div class="row"><button class="btn" id="again"><i class='ic' data-i='plus'></i> Faire une série supplémentaire</button><button class="btn" data-tab="weak"><i class='ic' data-i='target'></i> Voir mes points à améliorer</button></div>`), true));
  bindTrain();
  document.getElementById("again").addEventListener("click", extraSeries);
}

function extraSeries(){
  const r = rng(todayStr() + Date.now());
  const ids = Q.map(q => ({ id: q.id, k: (mastered(q.id) ? 2 : (missed(q.id) ? 0 : 1)) + r() }))
    .sort((a, b) => a.k - b.k).slice(0, DAILY_N).map(x => x.id);
  runQuiz("Série supplémentaire", "<i class='ic' data-i='plus'></i>", { ids, pos: 0, good: 0, wrong: [] }, run => {
    render(page("<i class='ic' data-i='plus'></i>", "Série supplémentaire", "", summary(run), true));
    bindTrain();
  });
}
