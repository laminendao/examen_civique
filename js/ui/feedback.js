/* « Ton avis » : encadré discret en fin de série ou d'examen blanc (une seule fois), et fenêtre ouverte
   depuis le lien « Donner mon avis » du bas de page. Les avis vont dans la table Supabase « feedback ». */
import { CONFIG } from "../config.js";
import { sb } from "../core/supabase.js";
import { state } from "../core/state.js";
import { esc, lsGet, lsSet } from "../core/utils.js";

const KEY = "ec-feedback";               // {done: true} ou {later: date en ms}
const AGAIN = 30 * 864e5;                // « Plus tard » : on redemande au plus tôt 30 jours après

/* Doit-on proposer l'encadré en fin de série ? */
function shouldAsk(){
  const s = lsGet(KEY);
  if (!s) return true;
  if (s.done) return false;
  return !s.later || Date.now() - s.later > AGAIN;
}

const firstName = () => state.user ? (state.user.name || "").split(" ")[0] : "";

const form = (inline) => `<form class="fb-form" novalidate>
  ${inline ? `<button type="button" class="fb-close" data-later aria-label="Plus tard">×</button>` : ""}
  <h2 class="sec" style="margin:0 0 4px">${inline ? "Ce site t'aide à préparer ton examen ?" : "Donner mon avis"}</h2>
  <p class="note" style="margin:0 0 12px">Ton avis aide à améliorer le site. Ça prend 20 secondes.</p>
  <div class="stars" role="radiogroup" aria-label="Note de 1 à 5">${[1, 2, 3, 4, 5].map(n => `<button type="button" class="star" data-n="${n}" role="radio" aria-checked="false" aria-label="${n} sur 5"><i class='ic' data-i='av-star'></i></button>`).join("")}</div>
  <label class="field fb-field">Un commentaire ? <small>(facultatif)</small><textarea rows="3" maxlength="1000" placeholder="Ce qui t'a plu, ce qui manque…"></textarea></label>
  <label class="check fb-consent"><input type="checkbox"> J'accepte que mon avis soit affiché sur le site${firstName() ? ` avec mon prénom (${esc(firstName())})` : " (sans nom)"}.</label>
  <p class="note fb-msg" hidden></p>
  <div class="row"><button class="btn primary sm" type="submit" disabled>Envoyer mon avis</button>${inline ? `<button type="button" class="link" data-later>Plus tard</button>` : `<button type="button" class="btn sm" data-cancel>Annuler</button>`}</div>
</form>`;

/* Encadré à placer sous un résultat ; renvoie "" si on ne doit pas le montrer. */
export const feedbackCard = () => shouldAsk() ? `<div class="card fb-card" id="fb-card">${form(true)}</div>` : "";

function bindForm(root, onDone){
  let rating = 0;
  const f = root.querySelector(".fb-form"), send = f.querySelector("[type=submit]"), msg = f.querySelector(".fb-msg");
  f.querySelectorAll(".star").forEach(b => b.addEventListener("click", () => {
    rating = +b.dataset.n;
    f.querySelectorAll(".star").forEach(x => { const on = +x.dataset.n <= rating; x.classList.toggle("on", on); x.setAttribute("aria-checked", String(+x.dataset.n === rating)); });
    send.disabled = false;
  }));
  f.querySelectorAll("[data-later]").forEach(b => b.addEventListener("click", () => { lsSet(KEY, { later: Date.now() }); onDone(false); }));
  f.querySelector("[data-cancel]")?.addEventListener("click", () => onDone(false));
  f.addEventListener("submit", async e => {
    e.preventDefault();
    if (!rating) return;
    const comment = f.querySelector("textarea").value.trim(), consent = f.querySelector(".fb-consent input").checked;
    send.disabled = true;
    let ok = false;
    if (sb){
      try {
        const { error } = await sb.from("feedback").insert({ exam: state.exam, rating, comment: comment || null, consent, first_name: consent && firstName() ? firstName() : null, user_id: state.user ? state.user.id : null });
        ok = !error;
      } catch(err) {}
    }
    if (ok){
      lsSet(KEY, { done: true });
      f.innerHTML = `<p class="fb-thanks"><i class='ic' data-i='check'></i> Merci pour ton avis !</p>`;
      setTimeout(() => onDone(true), 1800);
    } else {
      send.disabled = false; msg.hidden = false;
      const body = `Note : ${rating}/5\nExamen : ${state.exam}\n\n${comment}`;
      msg.innerHTML = `L'envoi n'a pas fonctionné. <a href="mailto:${CONFIG.contactEmail}?subject=${encodeURIComponent("Avis sur le site Examen civique")}&body=${encodeURIComponent(body)}">Envoyer par e-mail</a> à la place.`;
    }
  });
}

/* À appeler après l'affichage d'un résultat contenant feedbackCard(). */
export function bindFeedbackCard(){
  const card = document.getElementById("fb-card");
  if (card) bindForm(card, sent => { if (!sent) card.remove(); });
}

/* Fenêtre « Donner mon avis » (lien du bas de page). */
export function openFeedback(){
  document.querySelector(".modal-wrap")?.remove();
  const wrap = document.createElement("div");
  wrap.className = "modal-wrap";
  wrap.innerHTML = `<div class="modal fb-modal" role="dialog" aria-modal="true">${form(false)}</div>`;
  const close = () => { wrap.remove(); document.removeEventListener("keydown", onKey, true); };
  const onKey = e => { if (e.key === "Escape") close(); };
  wrap.addEventListener("click", e => { if (e.target === wrap) close(); });
  document.addEventListener("keydown", onKey, true);
  document.body.appendChild(wrap);
  bindForm(wrap, () => close());
  wrap.querySelector(".star")?.focus();
}

export function setupFeedback(){
  document.getElementById("fb-link")?.addEventListener("click", e => { e.preventDefault(); openFeedback(); });
}
