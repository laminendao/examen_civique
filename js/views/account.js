/* « Mon compte et mes données » : informations, export, suppression du compte. */
import { sb } from "../core/supabase.js";
import { state, emptyStore } from "../core/state.js";
import { esc } from "../core/utils.js";
import { go } from "../core/router.js";
import { cancelPendingSave, forgetLocal } from "../core/progress.js";
import { page, render, toast } from "../ui/layout.js";
import { showAuth, frErr, enterGuest } from "../auth/auth.js";
import { mail, CONTACT } from "./legal.js";
import { AVATARS, paintAvatar } from "../ui/avatar.js";
import { initials } from "../core/utils.js";

export function showAccount(){
  if (!state.user){
    render(page("<i class='ic' data-i='settings'></i>", "Mes données", "Tu utilises le site sans compte.", `
      <div class="card"><p style="margin:0 0 12px">Ta progression est enregistrée seulement dans ce navigateur. Pour l'effacer, utilise le bouton en bas de l'onglet <b><i class='ic' data-i='target'></i> À améliorer</b>.</p><div class="row"><button class="btn primary" id="go-login"><i class='ic' data-i='user'></i> Se connecter ou créer un compte</button></div></div>`, true));
    document.getElementById("go-login").addEventListener("click", ()=>showAuth("login"));
    return;
  }
  render(page("<i class='ic' data-i='settings'></i>", "Mon compte et mes données", "", `
    <div class="card">
      <h2 class="sec" style="margin:0 0 4px">Ma pastille <span class="note">(facultatif)</span></h2>
      <p class="note" style="margin:0 0 12px">Choisis l'icône qui s'affiche en haut à droite, ou garde tes initiales.</p>
      <div class="avpick" role="radiogroup" aria-label="Pastille de profil">
        <button type="button" class="avopt${!state.user.avatar ? " on" : ""}" data-av="" role="radio" aria-checked="${!state.user.avatar}" title="Mes initiales"><span class="ini">${esc(initials(state.user.name))}</span></button>
        ${AVATARS.map(a => `<button type="button" class="avopt${state.user.avatar === a ? " on" : ""}" data-av="${a}" role="radio" aria-checked="${state.user.avatar === a}"><i class='ic' data-i='${a}'></i></button>`).join("")}
      </div>
      <p class="note" id="av-msg" hidden></p>
    </div>
    <div class="card legal">
      <h2>Mes informations</h2>
      <p><b>Nom :</b> ${esc(state.user.name)}<br><b>E-mail :</b> ${esc(state.user.email||"")}${state.user.gender?`<br><b>Genre :</b> ${esc(state.user.gender)}`:""}${state.user.occupation?`<br><b>Situation professionnelle :</b> ${esc(state.user.occupation)}`:""}</p>
      <p class="note">Pour modifier ces informations, écris à ${mail}. Voir aussi la <a href="confidentialite" data-tab="privacy">politique de confidentialité</a>.</p>
      <div class="row"><button class="btn" id="export"><i class='ic' data-i='download'></i> Télécharger mes données</button></div>
    </div>
    <div class="danger" id="del-box">
      <h2><i class='ic' data-i='trash'></i> Supprimer mon compte</h2>
      <p style="margin:0">Ton compte, ton e-mail, tes informations et toute ta progression seront effacés définitivement. Cette action est irréversible.</p>
      <div class="row"><button class="btn danger-btn" id="del">Supprimer mon compte</button></div>
    </div>`, true));
  document.querySelectorAll("[data-av]").forEach(b => b.addEventListener("click", async () => {
    const val = b.dataset.av || null, prev = state.user.avatar, msg = document.getElementById("av-msg");
    state.user.avatar = val; paintAvatar();
    document.querySelectorAll("[data-av]").forEach(x => { const on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-checked", on); });
    try {
      const { error } = await sb.auth.updateUser({ data: { avatar: val } });
      if (error) throw error;
      msg.hidden = true;
    } catch(e){
      state.user.avatar = prev; paintAvatar();
      msg.hidden = false; msg.textContent = "Impossible d'enregistrer ce choix pour l'instant. Réessaie dans un moment.";
    }
  }));
  document.getElementById("export").addEventListener("click", ()=>{
    const blob = new Blob([JSON.stringify({compte:{nom:state.user.name, email:state.user.email, genre:state.user.gender||null, situation_professionnelle:state.user.occupation||null}, progression:state.store}, null, 2)], {type:"application/json"});
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "mes-donnees-examen-civique.json"; a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href), 1000);
  });
  document.getElementById("del").addEventListener("click", ()=>{
    const box = document.getElementById("del-box");
    box.innerHTML = `<h2><i class='ic' data-i='warning'></i> Confirmer la suppression</h2>
      <p style="margin:0">Pour confirmer, tape <b>SUPPRIMER</b> ci-dessous.</p>
      <label class="field" for="del-confirm">Confirmation<input id="del-confirm" type="text" autocomplete="off"></label>
      <p class="msg err" id="del-err" hidden></p>
      <div class="row"><button class="btn danger-btn fill" id="del-yes" disabled><i class='ic' data-i='trash'></i> Supprimer définitivement</button><button class="btn" id="del-no">Annuler</button></div>`;
    const inp = document.getElementById("del-confirm"), yes = document.getElementById("del-yes");
    inp.focus();
    inp.addEventListener("input", ()=>{ yes.disabled = inp.value.trim().toUpperCase() !== "SUPPRIMER"; });
    document.getElementById("del-no").addEventListener("click", ()=>go("account"));
    yes.addEventListener("click", async ()=>{
      yes.disabled = true; yes.innerHTML = "<i class='ic' data-i='hourglass'></i> Suppression…";
      try {
        const {error} = await sb.rpc("delete_my_account");
        if (error) throw error;
        forgetLocal(state.user.id);
        cancelPendingSave();
        try { await sb.auth.signOut(); } catch(e) {}
        state.user = null; state.store = emptyStore();
        await enterGuest();
        toast("Ton compte et toutes tes données ont été supprimés.");
      } catch(err){
        const el = document.getElementById("del-err"); el.hidden = false;
        el.textContent = /function|schema cache|not find/i.test(err.message||"")
          ? "La suppression automatique n'est pas encore activée sur le serveur. Écris à " + (CONTACT||"l'éditeur") + " pour faire supprimer ton compte."
          : frErr(err);
        yes.innerHTML = "<i class='ic' data-i='trash'></i> Supprimer définitivement"; yes.disabled = false;
      }
    });
  });
}

