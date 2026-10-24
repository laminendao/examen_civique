/* Moteur de quiz commun (série du jour, examen blanc, thèmes, entraînement ciblé) et écran de résultat.
   Deux modes : entraînement (correction après chaque réponse) et examen (correction à la fin, chronomètre). */
import { Q, QI, THEMES, NOTIONS } from "../core/data.js";
import { esc, shuffle } from "../core/utils.js";
import { record, refreshStats, missed, mastered } from "../core/progress.js";
import { go } from "../core/router.js";
import { page, render, view } from "../ui/layout.js";
import { reportLink, bindReports } from "../ui/report.js";
import { readingTools, bindReadingTools, stopSpeaking } from "../ui/reading.js";

const sitTag = q => q.s ? `<span class="chip sit" title="Le ministère ne publie pas les mises en situation : celle-ci est un exemple rédigé pour s'entraîner.">Mise en situation · exemple non officiel</span>` : "";
const fmt = s => Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");

let tick = null;
const stopTimer = () => { clearInterval(tick); tick = null; };

/* run = {ids, pos, good, wrong[]} ; onDone(run) en fin de série ; persist() après chaque réponse.
   opts.exam = true : pas de correction immédiate, run.deadline (ms) = fin du temps imparti. */
export function runQuiz(label, emoji, run, onDone, persist = () => {}, opts = {}){
  stopSpeaking();
  if (run.pos >= run.ids.length){ stopTimer(); return onDone(run); }
  const q = QI[run.ids[run.pos]];
  const opts4 = shuffle([q.a, ...q.d]);
  const exam = !!opts.exam;
  render(page(emoji, label, "", `
    <div class="card quiz${exam ? " exam-mode" : ""}">
      <div class="qtop"><span class="qnum">Question ${run.pos + 1} <span>/ ${run.ids.length}</span></span>
        ${exam ? `<span class="timer" id="timer" aria-live="off"><i class='ic' data-i='timer'></i> <b>--:--</b></span>` : `<span class="chip">${THEMES[q.t].icon} ${esc(NOTIONS[q.n].label)}</span>`}</div>
      <div class="bar"><i style="width:${run.pos / run.ids.length * 100}%"></i></div>
      <div class="qhead">${sitTag(q)}${readingTools()}</div>
      <p class="q">${esc(q.q)}</p>
      <div class="opts">${opts4.map((o, i) => `<button class="opt" id="opt-${i}" data-v="${i}"><span class="k">${"ABCD"[i]}</span><span>${esc(o)}</span></button>`).join("")}</div>
      <div id="after" hidden></div>
      ${exam ? `<p class="note exam-hint">Comme le jour J, la correction s'affiche à la fin de l'examen.</p>` : ""}
    </div>`, true));
  bindReadingTools(view(), () => q.q + ". " + opts4.map((o, i) => "Réponse " + "ABCD"[i] + " : " + o).join(". "));

  if (exam){
    const el = document.getElementById("timer");
    const upd = () => {
      if (!document.getElementById("timer")){ stopTimer(); return; }   // l'utilisateur a quitté la page
      const left = Math.max(0, Math.round((run.deadline - Date.now()) / 1000));
      el.querySelector("b").textContent = fmt(left);
      el.classList.toggle("low", left <= 300);
      if (left <= 0){
        stopTimer();
        run.timeout = true;
        for (const id of run.ids.slice(run.pos)) run.wrong.push(id);
        run.pos = run.ids.length;
        onDone(run);
      }
    };
    stopTimer(); upd(); tick = setInterval(upd, 1000);
  }

  view().querySelectorAll(".opt").forEach(b => b.addEventListener("click", () => {
    const pick = opts4[+b.dataset.v], ok = pick === q.a;
    view().querySelectorAll(".opt").forEach(x => x.disabled = true);
    record(q.id, ok);
    if (ok) run.good++; else run.wrong.push(q.id);
    if (exam) (run.picks ||= {})[q.id] = pick;
    run.pos++; persist();

    if (exam){
      b.classList.add("picked");
      setTimeout(() => { runQuiz(label, emoji, run, onDone, persist, opts); window.scrollTo({ top: 0, behavior: "instant" }); }, 320);
      return;
    }
    view().querySelectorAll(".opt").forEach((x, i) => {
      if (opts4[i] === q.a){ x.classList.add("right"); x.querySelector(".k").innerHTML = "<i class='ic' data-i='check'></i>"; }
      else if (x !== b) x.classList.add("dim");
    });
    if (!ok){ b.classList.add("wrong"); b.querySelector(".k").innerHTML = "<i class='ic' data-i='close'></i>"; }

    const after = document.getElementById("after");
    const last = run.pos >= run.ids.length;
    after.hidden = false;
    after.innerHTML = `<div class="feedback ${ok ? "ok" : "ko"}">${ok ? "<i class='ic' data-i='trophy'></i> Bonne réponse !" : "<i class='ic' data-i='close'></i> Raté. La bonne réponse : " + esc(q.a)}</div>
      <div class="expl" style="margin-top:12px"><b><i class='ic' data-i='bulb'></i> Explication</b>${esc(q.x)}</div>
      <div class="report-row">${reportLink(q.id)}</div>
      <div class="qfoot" style="margin-top:12px"><span class="note">Score : ${run.good}/${run.pos}</span><button class="btn primary" id="next">${last ? "<i class='ic' data-i='flag'></i> Voir le résultat" : "Question suivante <i class='ic' data-i='arrow-right'></i>"}</button></div>`;
    bindReports(after, id => QI[id]);
    const nx = document.getElementById("next");
    nx.focus({ preventScroll: true });
    after.scrollIntoView({ block: "nearest", behavior: "smooth" });
    nx.addEventListener("click", () => { runQuiz(label, emoji, run, onDone, persist, opts); window.scrollTo({ top: 0, behavior: "instant" }); });
    refreshStats();
  }));
}

/* Points à améliorer tirés d'une série terminée. */
function sessionWeak(run){
  if (!run.wrong.length) return "";
  const by = {};
  for (const id of run.wrong){ const n = QI[id].n; (by[n] ||= []).push(id); }
  const items = Object.entries(by).sort((a, b) => b[1].length - a[1].length);
  return `<div class="card"><h2 class="sec" style="margin:0 0 12px"><i class='ic' data-i='target'></i> Points à améliorer</h2>
    <div class="mini">${items.map(([n, ids]) => `<div><b>${esc(NOTIONS[n].label)} · ${ids.length} erreur${ids.length > 1 ? "s" : ""}</b><span class="note">${esc(NOTIONS[n].retenir)}</span><button class="btn sm" data-train="${n}" style="align-self:flex-start;margin-top:4px"><i class='ic' data-i='muscle'></i> S'entraîner sur ce point</button></div>`).join("")}</div></div>`;
}

const errItem = (id, picked) => {
  const q = QI[id];
  return `<li>${q.s ? `<span class="note">Mise en situation · exemple non officiel</span>` : ""}<div style="font-weight:700">${esc(q.q)}</div>
    ${picked !== undefined ? `<div class="yours"><i class='ic' data-i='close'></i> Ta réponse : ${picked === null ? "pas de réponse (temps écoulé)" : esc(picked)}</div>` : ""}
    <div class="a"><i class='ic' data-i='check'></i> ${esc(q.a)}</div><div class="x">${esc(q.x)}</div>${reportLink(id)}</li>`;
};

export function summary(run, extra = ""){
  const n = run.ids.length, p = Math.round(run.good / n * 100), passed = run.good / n >= 0.8;
  const picks = run.picks || {};
  return `<div class="card" style="display:flex;flex-direction:column;gap:16px">
    <div class="result-top"><span class="score">${run.good}<span style="font-size:1.4rem;color:var(--muted)">/${n}</span></span><span class="pill ${passed ? "ok" : "ko"}">${passed ? "<i class='ic' data-i='trophy'></i>" : "<i class='ic' data-i='trend-down'></i>"} ${p} % · ${passed ? "au-dessus de 80 %" : "sous les 80 %"}</span></div>
    ${extra}
  </div>
  ${sessionWeak(run)}
  ${run.wrong.length
    ? `<div class="card"><h2 class="sec" style="margin:0 0 12px"><i class='ic' data-i='pin'></i> Questions à revoir (${run.wrong.length})</h2><ul class="errs">${run.wrong.map(id => errItem(id, run.exam ? (picks[id] ?? null) : undefined)).join("")}</ul></div>`
    : `<div class="card"><p style="margin:0"><i class='ic' data-i='trophy'></i> Aucune erreur ! Ces questions repasseront plus rarement.</p></div>`}`;
}

/* À appeler après l'affichage d'un résultat : boutons « S'entraîner sur ce point » et « Signaler une erreur ». */
export function bindTrain(){
  view().querySelectorAll("[data-train]").forEach(b => b.addEventListener("click", () => trainNotion(b.dataset.train)));
  bindReports(view(), id => QI[id]);
}

/* Entraînement ciblé sur une notion : erreurs d'abord, puis non maîtrisées, puis le reste. */
export function trainNotion(n){
  go("weak", false);
  const qs = Q.filter(q => q.n === n);
  const ids = [
    ...shuffle(qs.filter(q => missed(q.id))),
    ...shuffle(qs.filter(q => !missed(q.id) && !mastered(q.id))),
    ...shuffle(qs.filter(q => mastered(q.id))),
  ].map(q => q.id).slice(0, 12);
  runQuiz(NOTIONS[n].label, "<i class='ic' data-i='muscle'></i>", { ids, pos: 0, good: 0, wrong: [] }, run => {
    render(page("<i class='ic' data-i='muscle'></i>", NOTIONS[n].label, "Résultat de l'entraînement ciblé", summary(run, `<div class="row"><button class="btn" data-tab="weak"><i class='ic' data-i='arrow-left'></i> Retour aux points à améliorer</button></div>`), true));
    bindTrain();
  });
}
