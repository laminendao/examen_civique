/* « Mon tableau de bord » : note estimée, avancement par thème, activité de la semaine, régularité. */
import { Q, THEMES, EXAMS, PASS } from "../core/data.js";
import { state } from "../core/state.js";
import { esc, todayStr } from "../core/utils.js";
import { qState, estimate, activity, streak, seenCount, mocks } from "../core/progress.js";
import { page, render, help } from "../ui/layout.js";
import { gate } from "../ui/gate.js";

export const MIN_EST = 20;   // questions vues avant d'afficher une note estimée
const DAYS = ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"];
const SHORT = { P: "Principes et valeurs", S: "Institutions", D: "Droits et devoirs", H: "Histoire et culture", V: "Vivre en société" };

/* Barres par thème en 3 états (utilisées aussi sur l'accueil). */
export function themeBars(){
  return `<div class="tbars">${Object.entries(THEMES).map(([k, th]) => {
    const qs = Q.filter(q => q.t === k), n = qs.length || 1;
    const m = qs.filter(q => qState(q.id) === "m").length, c = qs.filter(q => qState(q.id) === "c").length;
    return `<div class="trow"><span title="${esc(th.label)}">${th.icon} ${esc(SHORT[k] || th.label)}</span><div class="seg" title="${m} maîtrisées, ${c} en cours, ${qs.length - m - c} pas encore vues"><i class="m" style="width:${m / n * 100}%"></i><i class="c" style="width:${c / n * 100}%"></i></div><small>${m}/${qs.length}</small></div>`;
  }).join("")}</div>
  <div class="leg"><span class="lm">Maîtrisées</span><span class="lc">En cours</span><span class="ln">Pas encore vues</span></div>`;
}

/* Jauge de la note estimée (version complète ou compacte). */
export function gauge(est, compact = false){
  const gap = PASS - est;
  return `<div class="est${compact ? " compact" : ""}">
    <div class="est-top"><span class="big">${est}<small>/40</small></span>${gap > 0 ? `<span class="pill ko sm">encore ${gap} point${gap > 1 ? "s" : ""}</span>` : `<span class="pill ok sm">au-dessus du seuil</span>`}</div>
    <div class="gauge"><i style="width:${est / 40 * 100}%"></i><b style="left:${PASS / 40 * 100}%"></b></div>
    <div class="glbl"><span>0</span><span class="gseuil" style="left:${PASS / 40 * 100}%">seuil ${PASS}</span><span>40</span></div>
  </div>`;
}

function week(){
  const w = activity(7), max = Math.max(5, ...w.map(x => x.n));
  const tot = w.reduce((a, x) => a + x.n, 0), ok = w.reduce((a, x) => a + x.ok, 0), act = w.filter(x => x.n).length;
  return `<div class="wbars">${w.map(x => {
    const day = DAYS[(new Date(x.d + "T12:00").getDay() + 6) % 7];
    return `<div><span>${x.n || ""}</span><i style="height:${x.n ? Math.max(6, x.n / max * 100) : 2}%" class="${x.n ? "" : "z"}"></i><em>${x.d === todayStr() ? "auj." : day}</em></div>`;
  }).join("")}</div>
  <div class="kpis"><div><b>${tot}</b><span>questions cette semaine</span></div><div><b>${act}/7</b><span>jours actifs</span></div><div><b>${tot ? Math.round(ok / tot * 100) + " %" : "–"}</b><span>de bonnes réponses</span></div><div><b>${streak()}</b><span>jours d'affilée</span></div></div>`;
}

function heat(){
  // 13 semaines, une colonne par semaine, du lundi au dimanche
  const end = new Date(), start = new Date(); start.setDate(end.getDate() - 7 * 12 - ((end.getDay() + 6) % 7));
  const n = Math.round((end - start) / 864e5) + 1, a = activity(n);
  const lvl = x => !x.n ? "" : x.n < 10 ? "l1" : x.n < 25 ? "l2" : "l3";
  const active = a.filter(x => x.n).length;
  return `<div class="heat">${a.map(x => `<i class="${lvl(x)}" title="${new Date(x.d + "T12:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} : ${x.n} question${x.n > 1 ? "s" : ""}"></i>`).join("")}</div>
  <div class="heat-leg"><span>Moins</span><i></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><span>Plus</span><span class="sp"></span><span>${active} jour${active > 1 ? "s" : ""} d'entraînement sur 3 mois</span></div>`;
}

export function showStats(){
  if (gate("stats")) return;
  const seen = seenCount(), est = estimate(), list = mocks(), last = list[list.length - 1];
  render(page("<i class='ic' data-i='chart'></i>", "Mon tableau de bord", help(`Ta progression pour l'examen « ${esc(EXAMS[state.exam].label)} ». La note estimée est indicative : elle combine ce que tu as réussi dans chaque thème, pondéré comme à l'examen (11 questions sur les principes, 6 sur les institutions, 11 sur les droits et devoirs, 8 sur l'histoire, 4 sur la vie en société).`), `
    <div class="dash">
      <section class="card"><h2 class="sec"><i class='ic' data-i='target'></i> Prêt pour l'examen ?</h2>
        ${seen >= MIN_EST ? gauge(est) + `<p class="note">Note estimée si tu passais l'examen aujourd'hui.${last ? ` Dernier examen blanc : <b>${last.g}/${last.n}</b>.` : ""}</p>`
          : `<p class="note">Réponds à au moins ${MIN_EST} questions pour obtenir une note estimée (tu en es à ${seen}).</p><div class="row"><button class="btn primary sm" data-tab="daily"><i class='ic' data-i='play'></i> Série du jour</button></div>`}
      </section>
      <section class="card"><h2 class="sec"><i class='ic' data-i='book'></i> Où tu en es dans chaque thème</h2>${themeBars()}</section>
      <section class="card"><h2 class="sec"><i class='ic' data-i='calendar'></i> Ta semaine</h2>${week()}</section>
      <section class="card"><h2 class="sec"><i class='ic' data-i='flame'></i> Ta régularité</h2>${heat()}</section>
    </div>
    <div class="row"><button class="btn" data-tab="exam"><i class='ic' data-i='exam'></i> Mes examens blancs</button><button class="btn" data-tab="weak"><i class='ic' data-i='target'></i> Mes points à améliorer</button></div>`));
}
