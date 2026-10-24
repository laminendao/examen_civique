/* « À améliorer » : bilan automatique par notion et remise à zéro. */
import { Q, QI, NOTIONS } from "../core/data.js";
import { state } from "../core/state.js";
import { esc, pct } from "../core/utils.js";
import { notionStats, weakList, resetProgress, refreshStats, seenCount } from "../core/progress.js";
import { EXAMS } from "../core/data.js";
import { go } from "../core/router.js";
import { page, render } from "../ui/layout.js";
import { bindTrain } from "./quiz.js";

export function showWeak(){
  const answered = seenCount();
  if (!answered){
    render(page("<i class='ic' data-i='target'></i>", "Mes points à améliorer", "", `<div class="card" style="display:flex;flex-direction:column;gap:14px"><p style="margin:0">Pas encore de bilan. Réponds à quelques questions (série du jour, examen blanc ou thème) : cette page listera automatiquement les notions où tu te trompes, avec l'essentiel à retenir et un entraînement ciblé.</p><div class="row"><button class="btn primary" data-tab="daily"><i class='ic' data-i='play'></i> Commencer la série du jour</button></div></div>`, true));
    return;
  }
  const all = notionStats(), weak = weakList();
  const weakKeys = new Set(weak.map(o => o.k));
  const good = Object.values(all).filter(o => o.seen && !weakKeys.has(o.k));

  render(page("<i class='ic' data-i='target'></i>", "Mes points à améliorer", `Bilan calculé automatiquement à partir de tes ${answered} questions déjà travaillées. Une notion apparaît ici dès qu'une de ses questions a été ratée à la dernière tentative, ou si ton taux de réussite y est sous 80 %.`, `
    <div class="grid g2">${weak.length ? weak.map(card).join("") : `<div class="card"><p style="margin:0"><i class='ic' data-i='trophy'></i> Aucun point faible pour l'instant sur les notions travaillées. Continue la série du jour pour couvrir les autres questions.</p></div>`}</div>
    ${good.length ? `<div class="card"><h2 class="sec" style="margin:0 0 12px"><i class='ic' data-i='heart'></i> Notions solides</h2><div class="solid">${good.map(o => `<span><i class='ic' data-i='check'></i> ${esc(NOTIONS[o.k].label)} · ${pct(o.rate)}</span>`).join("")}</div></div>` : ""}
    <div id="reset-box"><button type="button" class="link" id="reset"><i class='ic' data-i='trash'></i> Remettre à zéro ma progression pour cet examen</button></div>`));
  bindTrain(); bindReset();
}

function card(o){
  const cls = o.rate === null ? "" : (o.rate >= 0.6 ? "mid" : "");
  const n = o.miss.length;
  return `<div class="wk ${cls}">
    <h3>${esc(NOTIONS[o.k].label)}<span>${o.rate === null ? "–" : pct(o.rate)} de réussite · ${o.seen}/${o.total} vues</span></h3>
    <div class="bar"><i style="width:${(o.rate || 0) * 100}%;background:${o.rate >= 0.6 ? "var(--warn)" : "var(--ko)"}"></i></div>
    <div class="retain"><b><i class='ic' data-i='bulb'></i> À retenir.</b> ${esc(NOTIONS[o.k].retenir)}</div>
    ${n ? `<details><summary>${n} question${n > 1 ? "s" : ""} ratée${n > 1 ? "s" : ""} la dernière fois</summary><ul>${o.miss.map(id => `<li>${esc(QI[id].q)}<span><i class='ic' data-i='check'></i> ${esc(QI[id].a)}</span><div class="note">${esc(QI[id].x)}</div></li>`).join("")}</ul></details>` : ""}
    <div class="row"><button class="btn sm primary" data-train="${o.k}"><i class='ic' data-i='muscle'></i> S'entraîner sur ce point</button></div>
  </div>`;
}

function bindReset(){
  const b = document.getElementById("reset"); if (!b) return;
  b.addEventListener("click", () => {
    const box = document.getElementById("reset-box");
    box.className = "card";
    box.innerHTML = `<p style="margin:0 0 12px"><i class='ic' data-i='warning'></i> Effacer ta progression « ${EXAMS[state.exam].label} »${state.user ? " dans ce compte" : " sur cet appareil"} (réponses, jours d'affilée, points à améliorer) ? Les autres examens ne sont pas touchés. C'est définitif.</p>
      <div class="row"><button class="btn primary sm" id="reset-yes"><i class='ic' data-i='trash'></i> Oui, tout effacer</button><button class="btn sm" id="reset-no">Annuler</button></div>`;
    document.getElementById("reset-no").addEventListener("click", () => go("weak"));
    document.getElementById("reset-yes").addEventListener("click", async () => {
      await resetProgress(); refreshStats(); go("home");
    });
  });
}
