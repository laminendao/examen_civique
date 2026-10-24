/* Examen blanc : 40 questions tirées au hasard. */
import { Q, EXAM_N, PASS } from "../core/data.js";
import { shuffle } from "../core/utils.js";
import { page, render } from "../ui/layout.js";
import { runQuiz, summary, bindTrain } from "./quiz.js";

export function showExam(){
  render(page("<i class='ic' data-i='exam'></i>", "Examen blanc", "Mets-toi dans les conditions du jour J.", `
    <div class="card" style="display:flex;flex-direction:column;gap:18px">
      <div class="grid g3">
        <div class="stat"><div class="ico"><i class='ic' data-i='question'></i></div><div><b>${EXAM_N}</b><span>questions au hasard</span></div></div>
        <div class="stat"><div class="ico"><i class='ic' data-i='target'></i></div><div><b>${PASS}</b><span>bonnes réponses pour réussir</span></div></div>
        <div class="stat"><div class="ico"><i class='ic' data-i='radio'></i></div><div><b>1 / 4</b><span>une seule bonne réponse</span></div></div>
      </div>
      <p class="note" style="margin:0">Le vrai examen compte 28 questions de connaissance et 12 mises en situation, en 45 minutes. Comme le ministère ne publie pas les mises en situation, cet examen blanc tire 40 questions de connaissance.</p>
      <div class="row"><button class="btn primary" id="start-exam"><i class='ic' data-i='rocket'></i> Commencer l'examen blanc</button></div>
    </div>`, true));
  document.getElementById("start-exam").addEventListener("click", start);
}

function start(){
  const ids = shuffle(Q.map(q => q.id)).slice(0, EXAM_N);
  runQuiz("Examen blanc", "<i class='ic' data-i='exam'></i>", { ids, pos: 0, good: 0, wrong: [] }, run => {
    const ok = run.good >= PASS;
    render(page(ok ? "<i class='ic' data-i='trophy'></i>" : "<i class='ic' data-i='exam'></i>", "Résultat de l'examen blanc",
      ok ? "Bravo, tu aurais été reçu !" : "Il manque " + (PASS - run.good) + " bonne(s) réponse(s) pour atteindre le seuil de " + PASS + ".",
      summary(run, `<div class="row"><button class="btn" id="retry"><i class='ic' data-i='refresh'></i> Nouvel examen blanc</button></div>`), true));
    document.getElementById("retry").addEventListener("click", showExam);
    bindTrain();
  });
}
