/* Page d'accueil : une action principale (la série du jour), la progression et les autres entraînements. */
import { Q, THEMES, DAILY_N, EXAMS, PASS } from "../core/data.js";
import { state } from "../core/state.js";
import { sb } from "../core/supabase.js";
import { esc } from "../core/utils.js";
import { dailyIds, mastered, weakList, streak, seenCount, mocks, estimate } from "../core/progress.js";
import { render } from "../ui/layout.js";
import { themeBars, gauge, MIN_EST } from "./stats.js";
import { isGuest, freeLeft } from "../ui/gate.js";

const row = (tab, icon, title, desc, extra = "") => `<li><button type="button" class="lrow" data-tab="${tab}" title="${desc}">
  <i class='ic' data-i='${icon}'></i><span><b>${title}${extra}</b></span><i class='ic' data-i='arrow-right'></i></button></li>`;

export function showHome(){
  const dl = dailyIds();
  const m = Q.filter(q => mastered(q.id)).length, seen = seenCount();
  const weakN = weakList().length, st = streak();
  const R = 34, C = 2 * Math.PI * R, frac = m / Q.length;
  const dailyDone = dl.pos >= dl.ids.length, started = dl.pos > 0 && !dailyDone;
  const last = mocks().slice(-1)[0];
  const hello = state.user ? `Bonjour ${esc(state.user.name.split(" ")[0])}` : "Bienvenue";
  const nKnow = Q.filter(q => !q.s).length, nSit = Q.length - nKnow;

  const main = dailyDone
    ? `<button class="btn primary" data-tab="exam"><i class='ic' data-i='exam'></i> Passer un examen blanc</button><span class="note done-note"><i class='ic' data-i='check'></i> Série du jour terminée, bravo !</span>`
    : `<button class="btn primary" data-tab="daily"><i class='ic' data-i='play'></i> ${started ? `Continuer ma série du jour (${dl.pos}/${DAILY_N})` : "Commencer ma série du jour"}</button>`;

  const left = freeLeft();
  const nudge = isGuest() ? `<p class="nudge"><i class='ic' data-i='save'></i> ${left ? `Sans compte : encore ${left} série${left > 1 ? "s" : ""} gratuite${left > 1 ? "s" : ""}.` : "Tes séries d'essai sont terminées."} <button type="button" class="link" data-signup>Crée un compte gratuit</button> pour continuer, passer l'examen blanc et suivre ta progression.</p>` : "";
  const progressCard = `<div class="hero-card">
        <h3>${hello}</h3>
        ${seen >= MIN_EST ? `<span class="note" style="margin-bottom:-6px">Ta note estimée aujourd'hui</span>${gauge(estimate(), true)}` : `<div class="ring">
          <svg width="84" height="84" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="${R}" fill="none" stroke="#ececf0" stroke-width="10"/><circle cx="42" cy="42" r="${R}" fill="none" stroke="#1e40af" stroke-width="10" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - frac)}" transform="rotate(-90 42 42)"/><text x="42" y="47" text-anchor="middle" font-size="15" font-weight="800" fill="#1d1d1b" font-family="Source Sans 3, sans-serif">${Math.round(frac * 100)}%</text></svg>
          <div><b>${m} / ${Q.length}</b><span title="Une question est maîtrisée quand tu l'as réussie au moins deux fois, dont la dernière.">questions maîtrisées</span></div>
        </div>`}
        <div class="mini3">
          <div><b>${st}</b><span>jour${st > 1 ? "s" : ""} d'affilée</span></div>
          <div><b>${seen}</b><span>déjà vue${seen > 1 ? "s" : ""}</span></div>
          <div><b>${weakN}</b><span>à améliorer</span></div>
        </div>
        <button type="button" class="link dash-link" data-tab="stats">Voir mon tableau de bord <i class='ic' data-i='arrow-right'></i></button>
        ${nudge}
      </div>`;
  const startCard = `<div class="hero-card start">
        <h3>Comment ça marche</h3>
        <ol class="howto">
          <li><b>15 questions par jour</b><span>La série du jour mélange tes erreurs et des questions nouvelles.</span></li>
          <li><b>Chaque réponse est expliquée</b><span>Tu sais tout de suite pourquoi c'est juste ou faux.</span></li>
          <li><b>Tes points faibles sont repérés</b><span>Le site te les fait retravailler jusqu'à ce qu'ils soient acquis.</span></li>
        </ol>
        ${nudge}
      </div>`;
  const themeCard = seen ? `<div class="card"><h2 class="sec" style="margin:0 0 10px"><i class='ic' data-i='trend-up'></i> Ta progression par thème</h2>
        ${themeBars()}
      </div>` : `<div class="card"><h2 class="sec" style="margin:0 0 6px"><i class='ic' data-i='compass'></i> L'examen en bref</h2>
        <ul class="brief"><li><b>40 questions</b> en 45 minutes</li><li><b>32 bonnes réponses</b> pour réussir</li><li>des <b>mises en situation</b> en plus des questions de connaissance</li></ul>
      </div>`;

  render(`
  <section class="hero">
    <div class="container">
      <div>
        <h1>Prépare l'examen civique ${EXAMS[state.exam].of}</h1>
        <p>${nKnow} questions officielles et ${nSit} mises en situation, corrigées et expliquées.</p>
        <div class="row hero-cta">${main}</div>
      </div>
      ${seen ? progressCard : startCard}
    </div>
  </section>
  <div class="page container">
    <div class="grid g2 home-grid">
      ${themeCard}
      <div class="card"><h2 class="sec" style="margin:0 0 6px"><i class='ic' data-i='rocket'></i> Autres entraînements</h2>
        <ul class="lrows">
          ${row("exam", "exam", "Examen blanc", "40 questions en 45 minutes, corrigées à la fin comme le jour J", isGuest() ? ` <span class="lock-note"><i class='ic' data-i='lock'></i> avec un compte</span>` : last ? ` <span class="pill ${last.g >= PASS ? "ok" : "ko"} sm">dernier : ${last.g}/${last.n}</span>` : "")}
          ${row("themes", "book", "Par thème", "Les 5 thèmes officiels, un par un")}
          ${row("weak", "target", "À améliorer", "Tes notions fragiles et un entraînement ciblé", weakN ? ` <span class="badge">${weakN}</span>` : "")}
          ${row("review", "search", "Révision", "Toutes les questions avec réponse et explication")}
          ${row("info", "link", "Liens utiles", "Inscription à l'examen, centres agréés, textes officiels")}
        </ul>
      </div>
    </div>
    <div id="install-slot"></div>
  </div>`);
  document.querySelector("[data-signup]")?.addEventListener("click", () => import("../auth/auth.js").then(a => a.showAuth("signup")));
}
