/* « Signaler une erreur » : petit formulaire sous une question.
   Envoi dans la table Supabase « reports » ; sinon (ou en cas d'échec) proposition d'e-mail. */
import { CONFIG } from "../config.js";
import { sb } from "../core/supabase.js";
import { state } from "../core/state.js";
import { esc, lsGet, lsSet, todayStr } from "../core/utils.js";

const LIMIT_KEY = "ec-reports";
const tooMany = () => { const r = lsGet(LIMIT_KEY); return r && r.d === todayStr() && r.n >= 10; };
const count = () => { const r = lsGet(LIMIT_KEY); lsSet(LIMIT_KEY, { d: todayStr(), n: r && r.d === todayStr() ? r.n + 1 : 1 }); };

export const reportLink = id => `<button type="button" class="link report-link" data-report="${esc(id)}"><i class='ic' data-i='warning'></i> Signaler une erreur</button>`;

function mailto(q, msg){
  const body = `Examen : ${state.exam}\nQuestion (${q.id}) : ${q.q}\nRéponse affichée : ${q.a}\n\nMon signalement :\n${msg}`;
  return `mailto:${CONFIG.contactEmail}?subject=${encodeURIComponent("Erreur signalée · question " + q.id)}&body=${encodeURIComponent(body)}`;
}

/* Branche tous les liens « Signaler une erreur » présents dans root. getQ(id) renvoie la question. */
export function bindReports(root, getQ){
  root.querySelectorAll("[data-report]").forEach(btn => btn.addEventListener("click", () => {
    const q = getQ(btn.dataset.report); if (!q) return;
    const box = document.createElement("form");
    box.className = "report-box";
    box.innerHTML = `<label for="rep-${esc(q.id)}"><b>Qu'est-ce qui ne va pas ?</b> <span class="note">Réponse fausse, explication imprécise, faute…</span></label>
      <textarea id="rep-${esc(q.id)}" maxlength="1000" rows="3" required placeholder="Ex. : la bonne réponse est plutôt…, source : …"></textarea>
      <div class="row"><button class="btn sm primary" type="submit"><i class='ic' data-i='mail'></i> Envoyer</button><button class="btn sm" type="button" data-cancel>Annuler</button></div>
      <p class="note rep-msg" hidden></p>`;
    btn.replaceWith(box);
    box.querySelector("textarea").focus();
    box.querySelector("[data-cancel]").addEventListener("click", () => box.replaceWith(btn));
    box.addEventListener("submit", async ev => {
      ev.preventDefault();
      const msg = box.querySelector("textarea").value.trim(), out = box.querySelector(".rep-msg");
      if (msg.length < 3) return;
      out.hidden = false;
      if (tooMany()){ out.innerHTML = "Tu as déjà envoyé beaucoup de signalements aujourd'hui. Merci ! Tu peux aussi écrire par <a href='" + mailto(q, msg) + "'>e-mail</a>."; return; }
      if (sb){
        box.querySelector("[type=submit]").disabled = true;
        try {
          const { error } = await sb.from("reports").insert({ exam: state.exam, question_id: String(q.id), question: q.q, message: msg, user_id: state.user ? state.user.id : null });
          if (!error){ count(); box.innerHTML = `<p class="note ok-msg"><i class='ic' data-i='check'></i> Merci ! Ton signalement a bien été envoyé, la question sera vérifiée.</p>`; return; }
        } catch(e) {}
        box.querySelector("[type=submit]").disabled = false;
      }
      out.innerHTML = `L'envoi direct n'a pas fonctionné. <a href="${mailto(q, msg)}">Envoyer par e-mail</a> à la place.`;
    });
  }));
}
