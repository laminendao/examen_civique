/* Examen blanc dans les conditions du jour J : 40 questions, 45 minutes, correction à la fin,
   et historique des notes propre à chaque examen. */
import { Q, EXAM_N, PASS, EXAMS } from "../core/data.js";
import { state } from "../core/state.js";
import { shuffle, esc } from "../core/utils.js";
import { addMock, mocks, refreshStats } from "../core/progress.js";
import { page, render, help } from "../ui/layout.js";
import { runQuiz, summary, bindTrain } from "./quiz.js";

const DURATION = 45 * 60;   // secondes
/* Répartition officielle des 40 questions : connaissances et mises en situation par thème. */
const PLAN = { P: [5, 6], S: [6, 0], D: [5, 6], H: [8, 0], V: [4, 0] };

function draw(){
  let ids = [];
  for (const [t, [know, sit]] of Object.entries(PLAN)){
    ids.push(...shuffle(Q.filter(q => q.t === t && !q.s)).slice(0, know).map(q => q.id));
    ids.push(...shuffle(Q.filter(q => q.t === t && q.s)).slice(0, sit).map(q => q.id));
  }
  if (ids.length < EXAM_N){   // complément si un thème manque de questions
    const have = new Set(ids);
    ids.push(...shuffle(Q.filter(q => !have.has(q.id))).slice(0, EXAM_N - ids.length).map(q => q.id));
  }
  return shuffle(ids);
}

const dfmt = t => new Date(t).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
const mfmt = s => Math.floor(s / 60) + " min " + String(s % 60).padStart(2, "0");

/* Courbe des notes (SVG simple) avec la ligne de réussite à 32/40. */
function chart(list){
  const pts = list.slice(-15);
  if (pts.length < 2) return "";
  const W = 640, H = 200, L = 34, R = 12, T = 12, B = 26, n = pts.length;
  const x = i => L + (W - L - R) * (n === 1 ? 0.5 : i / (n - 1));
  const y = v => T + (H - T - B) * (1 - v / 40);
  const line = pts.map((m, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(m.g / m.n * 40).toFixed(1)}`).join(" ");
  const grid = [0, 10, 20, 30, 40].map(v => `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" class="g"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${v}</text>`).join("");
  return `<figure class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Évolution de tes notes aux examens blancs">
    ${grid}
    <line x1="${L}" x2="${W - R}" y1="${y(PASS)}" y2="${y(PASS)}" class="pass"/><text x="${W - R}" y="${y(PASS) - 6}" text-anchor="end" class="passlbl">seuil ${PASS}/40</text>
    <path d="${line}" class="ln"/>
    ${pts.map((m, i) => `<circle cx="${x(i)}" cy="${y(m.g / m.n * 40)}" r="4.5" class="${m.g / m.n >= 0.8 ? "ok" : "ko"}"><title>${dfmt(m.t)} : ${m.g}/${m.n}</title></circle>`).join("")}
    ${pts.map((m, i) => (n <= 8 || i % 2 === 0 || i === n - 1) ? `<text x="${x(i)}" y="${H - 6}" text-anchor="${i === 0 ? "start" : i === n - 1 ? "end" : "middle"}">${dfmt(m.t)}</text>` : "").join("")}
  </svg></figure>`;
}

function history(){
  const list = mocks();
  if (!list.length) return "";   // l'historique n'apparaît qu'après un premier examen blanc
  const best = Math.max(...list.map(m => m.g)), passed = list.filter(m => m.g >= PASS).length, last = list[list.length - 1];
  return `<div class="card"><h2 class="sec" style="margin:0 0 14px"><i class='ic' data-i='chart'></i> Mes examens blancs · ${esc(EXAMS[state.exam].label)}</h2>
    <div class="kpis"><div><b>${list.length}</b><span>passé${list.length > 1 ? "s" : ""}</span></div><div><b>${last.g}/${last.n}</b><span>dernière note</span></div><div><b>${best}/40</b><span>meilleure note</span></div><div><b>${passed}</b><span>réussi${passed > 1 ? "s" : ""}</span></div></div>
    ${chart(list)}
    <table class="hist"><thead><tr><th>Date</th><th>Note</th><th>Durée</th><th></th></tr></thead><tbody>
    ${list.slice(-8).reverse().map(m => `<tr><td>${new Date(m.t).toLocaleDateString("fr-FR")}</td><td><b>${m.g}/${m.n}</b></td><td>${mfmt(m.sec)}</td><td>${m.g >= PASS ? `<span class="pill ok sm">Réussi</span>` : `<span class="pill ko sm">Non atteint</span>`}</td></tr>`).join("")}
    </tbody></table></div>`;
}

export function showExam(){
  render(page("<i class='ic' data-i='exam'></i>", "Examen blanc", help("Les conditions du jour J : 40 questions, 45 minutes, correction à la fin. Les questions sont réparties par thème comme à l'examen. Le ministère ne publie pas les mises en situation : celles de l'examen blanc sont des exemples rédigés pour s'entraîner."), `
    <div class="card" style="display:flex;flex-direction:column;gap:18px">
      <div class="grid g3">
        <div class="stat"><div class="ico"><i class='ic' data-i='question'></i></div><div><b>28 + 12</b><span>connaissances + mises en situation</span></div></div>
        <div class="stat"><div class="ico"><i class='ic' data-i='timer'></i></div><div><b>45 min</b><span>chronomètre, comme le jour J</span></div></div>
        <div class="stat"><div class="ico"><i class='ic' data-i='target'></i></div><div><b>${PASS}/40</b><span>bonnes réponses pour réussir</span></div></div>
      </div>
      <div class="row"><button class="btn primary" id="start-exam"><i class='ic' data-i='rocket'></i> Commencer l'examen blanc</button></div>
    </div>
    ${history()}`, true));
  document.getElementById("start-exam").addEventListener("click", start);
}

function start(){
  const t0 = Date.now();
  const run = { ids: draw(), pos: 0, good: 0, wrong: [], picks: {}, exam: true, deadline: t0 + DURATION * 1000 };
  runQuiz("Examen blanc", "<i class='ic' data-i='exam'></i>", run, run => {
    const sec = Math.min(DURATION, Math.round((Date.now() - t0) / 1000));
    addMock({ t: t0, g: run.good, n: run.ids.length, sec });
    refreshStats();
    const ok = run.good >= PASS;
    render(page(ok ? "<i class='ic' data-i='trophy'></i>" : "<i class='ic' data-i='exam'></i>", "Résultat de l'examen blanc",
      (run.timeout ? "Temps écoulé ! " : "") + (ok ? "Bravo, tu aurais été reçu !" : "Il manque " + (PASS - run.good) + " bonne(s) réponse(s) pour atteindre le seuil de " + PASS + "."),
      summary(run, `<p class="note" style="margin:0"><i class='ic' data-i='timer'></i> Durée : ${mfmt(sec)} sur 45 min</p><div class="row"><button class="btn" id="retry"><i class='ic' data-i='refresh'></i> Nouvel examen blanc</button><button class="btn" id="hist"><i class='ic' data-i='chart'></i> Voir mon historique</button></div>`), true));
    document.getElementById("retry").addEventListener("click", start);
    document.getElementById("hist").addEventListener("click", showExam);
    bindTrain();
  }, () => {}, { exam: true });
}
