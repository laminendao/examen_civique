/* Moteur de quiz commun (série du jour, examen blanc, thèmes, entraînement ciblé) et écran de résultat. */
import { Q, THEMES, NOTIONS } from "../core/data.js";
import { esc, shuffle } from "../core/utils.js";
import { record, refreshStats, missed, mastered } from "../core/progress.js";
import { go } from "../core/router.js";
import { page, render, view } from "../ui/layout.js";

/* run = {ids, pos, good, wrong[]} ; onDone(run) en fin de série ; persist() après chaque réponse. */
export function runQuiz(label, emoji, run, onDone, persist = () => {}){
  if (run.pos >= run.ids.length) return onDone(run);
  const q = Q[run.ids[run.pos]];
  const opts = shuffle([q.a, ...q.d]);
  render(page(emoji, label, "", `
    <div class="card quiz">
      <div class="qtop"><span class="qnum">Question ${run.pos + 1} <span>/ ${run.ids.length}</span></span><span class="chip">${THEMES[q.t].icon} ${esc(NOTIONS[q.n].label)}</span></div>
      <div class="bar"><i style="width:${run.pos / run.ids.length * 100}%"></i></div>
      <p class="q">${esc(q.q)}</p>
      <div class="opts">${opts.map((o, i) => `<button class="opt" id="opt-${i}" data-v="${i}"><span class="k">${"ABCD"[i]}</span><span>${esc(o)}</span></button>`).join("")}</div>
      <div id="after" hidden></div>
    </div>`, true));

  view().querySelectorAll(".opt").forEach(b => b.addEventListener("click", () => {
    const pick = opts[+b.dataset.v], ok = pick === q.a;
    view().querySelectorAll(".opt").forEach((x, i) => {
      x.disabled = true;
      if (opts[i] === q.a){ x.classList.add("right"); x.querySelector(".k").innerHTML = "<i class='ic' data-i='check'></i>"; }
      else if (x !== b) x.classList.add("dim");
    });
    if (!ok){ b.classList.add("wrong"); b.querySelector(".k").innerHTML = "<i class='ic' data-i='close'></i>"; }
    record(q.id, ok);
    if (ok) run.good++; else run.wrong.push(q.id);
    run.pos++; persist();

    const after = document.getElementById("after");
    const last = run.pos >= run.ids.length;
    after.hidden = false;
    after.innerHTML = `<div class="feedback ${ok ? "ok" : "ko"}">${ok ? "<i class='ic' data-i='trophy'></i> Bonne réponse !" : "<i class='ic' data-i='close'></i> Raté. La bonne réponse : " + esc(q.a)}</div>
      <div class="expl" style="margin-top:12px"><b><i class='ic' data-i='bulb'></i> Explication</b>${esc(q.x)}</div>
      <div class="qfoot" style="margin-top:16px"><span class="note">Score : ${run.good}/${run.pos}</span><button class="btn primary" id="next">${last ? "<i class='ic' data-i='flag'></i> Voir le résultat" : "Question suivante <i class='ic' data-i='arrow-right'></i>"}</button></div>`;
    const nx = document.getElementById("next");
    nx.focus({ preventScroll: true });
    after.scrollIntoView({ block: "nearest", behavior: "smooth" });
    nx.addEventListener("click", () => { runQuiz(label, emoji, run, onDone, persist); window.scrollTo({ top: 0, behavior: "instant" }); });
    refreshStats();
  }));
}

/* Points à améliorer tirés d'une série terminée. */
function sessionWeak(run){
  if (!run.wrong.length) return "";
  const by = {};
  for (const id of run.wrong){ const n = Q[id].n; (by[n] ||= []).push(id); }
  const items = Object.entries(by).sort((a, b) => b[1].length - a[1].length);
  return `<div class="card"><h2 class="sec" style="margin:0 0 12px"><i class='ic' data-i='target'></i> Points à améliorer</h2>
    <div class="mini">${items.map(([n, ids]) => `<div><b>${esc(NOTIONS[n].label)} · ${ids.length} erreur${ids.length > 1 ? "s" : ""}</b><span class="note">${esc(NOTIONS[n].retenir)}</span><button class="btn sm" data-train="${n}" style="align-self:flex-start;margin-top:4px"><i class='ic' data-i='muscle'></i> S'entraîner sur ce point</button></div>`).join("")}</div></div>`;
}

export function summary(run, extra = ""){
  const n = run.ids.length, p = Math.round(run.good / n * 100), passed = run.good / n >= 0.8;
  return `<div class="card" style="display:flex;flex-direction:column;gap:16px">
    <div class="result-top"><span class="score">${run.good}<span style="font-size:1.4rem;color:var(--muted)">/${n}</span></span><span class="pill ${passed ? "ok" : "ko"}">${passed ? "<i class='ic' data-i='trophy'></i>" : "<i class='ic' data-i='trend-down'></i>"} ${p} % · ${passed ? "au-dessus de 80 %" : "sous les 80 %"}</span></div>
    ${extra}
  </div>
  ${sessionWeak(run)}
  ${run.wrong.length
    ? `<div class="card"><h2 class="sec" style="margin:0 0 12px"><i class='ic' data-i='pin'></i> Questions à revoir</h2><ul class="errs">${run.wrong.map(id => `<li><div style="font-weight:700">${esc(Q[id].q)}</div><div class="a"><i class='ic' data-i='check'></i> ${esc(Q[id].a)}</div><div class="x">${esc(Q[id].x)}</div></li>`).join("")}</ul></div>`
    : `<div class="card"><p style="margin:0"><i class='ic' data-i='trophy'></i> Aucune erreur ! Ces questions repasseront plus rarement.</p></div>`}`;
}

/* Boutons « S'entraîner sur ce point » présents dans la vue. */
export function bindTrain(){
  view().querySelectorAll("[data-train]").forEach(b => b.addEventListener("click", () => trainNotion(b.dataset.train)));
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
