/* Page d'accueil : présentation, progression et choix du mode d'entraînement. */
import { Q, THEMES, DAILY_N, EXAMS } from "../core/data.js";
import { state } from "../core/state.js";
import { esc } from "../core/utils.js";
import { dailyIds, mastered, weakList, streak, seenCount } from "../core/progress.js";
import { render } from "../ui/layout.js";

export function showHome(){
  const dl = dailyIds();
  const m = Q.filter(q=>mastered(q.id)).length, seen = seenCount();
  const weakN = weakList().length, st = streak();
  const R = 34, C = 2*Math.PI*R, frac = m/Q.length;
  const dailyDone = dl.pos >= dl.ids.length;
  const hello = state.user ? `Bonjour ${esc(state.user.name.split(" ")[0])} <i class='ic' data-i='hand'></i>` : "Bienvenue <i class='ic' data-i='hand'></i>";
  render(`
  <section class="hero">
    <div class="container">
      <div>
        <span class="pill-tag"><i class='ic' data-i='cap'></i> Page d'entraînement</span>
        <h1>Prépare l'examen civique ${EXAMS[state.exam].of}</h1>
        <p>Entraîne-toi sur les ${Q.length} questions publiées par le ministère de l'Intérieur. Chaque réponse est corrigée et expliquée, et le site repère tes points faibles. Le jour J : 40 questions en 45 minutes, 32 bonnes réponses pour réussir.</p>
        <div class="row">
          <button class="btn light" data-tab="daily">${dailyDone?"<i class='ic' data-i='check'></i> Série du jour terminée":"<i class='ic' data-i='play'></i> Commencer la série du jour"}</button>
          <button class="btn ghost-light" data-tab="exam"><i class='ic' data-i='exam'></i> Passer un examen blanc</button>
        </div>
      </div>
      <div class="hero-card">
        <h3>${hello}</h3>
        <div class="ring">
          <svg width="84" height="84" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="${R}" fill="none" stroke="#f1e6e9" stroke-width="10"/><circle cx="42" cy="42" r="${R}" fill="none" stroke="#c1002a" stroke-width="10" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-frac)}" transform="rotate(-90 42 42)"/><text x="42" y="47" text-anchor="middle" font-size="15" font-weight="800" fill="#1d1d1b" font-family="Plus Jakarta Sans, sans-serif">${Math.round(frac*100)}%</text></svg>
          <div><b>${m} / ${Q.length}</b><span>questions maîtrisées</span></div>
        </div>
        <div class="minibar"><div><span><i class='ic' data-i='calendar'></i> Série du jour</span><b>${Math.min(dl.pos,DAILY_N)}/${DAILY_N}</b></div><div class="bar"><i style="width:${Math.min(dl.pos,DAILY_N)/DAILY_N*100}%"></i></div></div>
      </div>
    </div>
  </section>
  <div class="page container">
    <div class="grid g4">
      <div class="stat"><div class="ico"><i class='ic' data-i='flame'></i></div><div><b>${st}</b><span>jour${st>1?"s":""} d'affilée</span></div></div>
      <div class="stat"><div class="ico"><i class='ic' data-i='check'></i></div><div><b>${m}</b><span>maîtrisées sur ${Q.length}</span></div></div>
      <div class="stat"><div class="ico"><i class='ic' data-i='eye'></i></div><div><b>${seen}</b><span>questions déjà vues</span></div></div>
      <div class="stat"><div class="ico"><i class='ic' data-i='target'></i></div><div><b>${weakN}</b><span>point${weakN>1?"s":""} à améliorer</span></div></div>
    </div>

    <h2 class="sec"><i class='ic' data-i='rocket'></i> Choisis ton entraînement</h2>
    <div class="grid g3">
      <div class="mode"><div class="ico"><i class='ic' data-i='calendar'></i></div><h3>Série du jour</h3><p>15 questions par jour : d'abord tes erreurs, puis des questions nouvelles. L'idéal pour progresser chaque jour.</p><button class="btn primary sm" data-tab="daily"><i class='ic' data-i='play'></i> Commencer</button></div>
      <div class="mode"><div class="ico"><i class='ic' data-i='exam'></i></div><h3>Examen blanc</h3><p>40 questions tirées au hasard, comme le jour J. Il faut 32 bonnes réponses (80 %) pour réussir.</p><button class="btn sm" data-tab="exam"><i class='ic' data-i='timer'></i> Passer l'examen</button></div>
      <div class="mode"><div class="ico"><i class='ic' data-i='book'></i></div><h3>Par thème</h3><p>Travaille un des 5 thèmes officiels : valeurs, institutions, droits, histoire, vie en société.</p><button class="btn sm" data-tab="themes"><i class='ic' data-i='folder'></i> Voir les thèmes</button></div>
      <div class="mode"><div class="ico"><i class='ic' data-i='target'></i></div><h3>À améliorer</h3><p>Ton bilan automatique : les notions où tu te trompes, l'essentiel à retenir et un entraînement ciblé.</p><button class="btn sm" data-tab="weak"><i class='ic' data-i='chart'></i> Voir mon bilan</button></div>
      <div class="mode"><div class="ico"><i class='ic' data-i='search'></i></div><h3>Révision</h3><p>Toutes les questions avec la réponse et l'explication. Recherche par mot-clé ou affiche seulement tes erreurs.</p><button class="btn sm" data-tab="review"><i class='ic' data-i='book'></i> Réviser</button></div>
      <div class="mode"><div class="ico"><i class='ic' data-i='bulb'></i></div><h3>Comment ça marche ?</h3><p>Une question est « maîtrisée » quand tu l'as réussie au moins deux fois, dont la dernière. Reviens chaque jour pour garder ta série <i class='ic' data-i='flame'></i>.</p></div>
    </div>

    <div class="grid g2">
      <div class="card"><h2 class="sec" style="margin:0 0 6px"><i class='ic' data-i='trend-up'></i> Ta progression par thème</h2>
        ${Object.entries(THEMES).map(([k,name])=>{ const qs=Q.filter(q=>q.t===k), mm=qs.filter(q=>mastered(q.id)).length;
          return `<div class="themerow"><div><span>${THEMES[k].icon} ${esc(name.label)}</span><small>${mm}/${qs.length}</small></div><div class="bar"><i style="width:${mm/qs.length*100}%"></i></div></div>`; }).join("")}
      </div>
      <div class="card"><h2 class="sec" style="margin:0 0 14px"><i class='ic' data-i='compass'></i> L'examen en bref</h2>
        <div class="steps" style="display:flex;flex-direction:column;gap:16px">
          <div class="step"><span class="n">1</span><div><b>40 questions en QCM, 45 minutes</b><span>28 questions de connaissance et 12 mises en situation, 4 choix et une seule bonne réponse.</span></div></div>
          <div class="step"><span class="n">2</span><div><b>32 bonnes réponses minimum</b><span>Soit 80 % de réussite pour obtenir l'attestation.</span></div></div>
          <div class="step"><span class="n">3</span><div><b>Connaissances + mises en situation</b><span>Les questions de mise en situation ne sont pas publiées : elles ne figurent pas ici.</span></div></div>
        </div>
      </div>
    </div>
  </div>`);
}
