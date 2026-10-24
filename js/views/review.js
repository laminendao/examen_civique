/* Révision : toutes les questions avec réponse et explication, recherche et filtre. */
import { Q, THEMES } from "../core/data.js";
import { esc } from "../core/utils.js";
import { missed } from "../core/progress.js";
import { page, render, view } from "../ui/layout.js";
import { reportLink, bindReports } from "../ui/report.js";
import { QI } from "../core/data.js";

export function showReview(){
  render(page("<i class='ic' data-i='search'></i>", "Révision", "Toutes les questions avec leur réponse et leur explication.", `
    <div class="searchbox"><div class="inp"><span><i class='ic' data-i='search'></i></span><input type="search" id="search" placeholder="Rechercher un mot (ex. : Sénat, 1905, laïcité)" aria-label="Rechercher"></div>
      <label class="check"><input type="checkbox" id="only-miss"> <i class='ic' data-i='close'></i> Seulement mes erreurs</label></div>
    <div class="list" id="list"></div>`, true));
  document.getElementById("search").addEventListener("input", renderList);
  document.getElementById("only-miss").addEventListener("change", renderList);
  renderList();
}

function renderList(){
  const term = document.getElementById("search").value, t = term.trim().toLowerCase();
  const onlyMiss = document.getElementById("only-miss").checked;
  let html = "";
  for (const [k, th] of Object.entries(THEMES)){
    const qs = Q.filter(q => q.t === k && (!onlyMiss || missed(q.id)) && (!t || (q.q + " " + q.a + " " + q.x).toLowerCase().includes(t)));
    if (!qs.length) continue;
    html += `<h3>${th.icon} ${esc(th.label)}</h3>` + qs.map(q => `<div class="item">${missed(q.id) ? `<span class="flag"><i class='ic' data-i='close'></i> Ratée la dernière fois</span>` : ""}${q.s ? `<span class="note">Mise en situation · exemple non officiel</span>` : ""}<p class="qq">${esc(q.q)}</p><p class="a"><i class='ic' data-i='check'></i> ${esc(q.a)}</p><p class="x">${esc(q.x)}</p>${reportLink(q.id)}</div>`).join("");
  }
  const list = document.getElementById("list");
  list.innerHTML = html || `<p class="note">${onlyMiss && !t ? "Aucune erreur enregistrée pour l'instant." : "Aucune question ne correspond à « " + esc(term) + " »."}</p>`;
  bindReports(list, id => QI[id]);
}
