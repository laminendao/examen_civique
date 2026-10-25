/* Connexion, inscription, mot de passe oublié, démarrage de l'application. */
import { sb, RECOVERING } from "../core/supabase.js";
import { state, emptyStore } from "../core/state.js";
import { esc, initials } from "../core/utils.js";
import { APP_URL, go, hasView, takeInitialTab } from "../core/router.js";
import { loadLocal, loadRemote, pushRemote, cancelPendingSave, setSync, refreshStats, initialExam } from "../core/progress.js";
import { useExam } from "../ui/exam-switch.js";
import { paintAvatar } from "../ui/avatar.js";
import { view, setChrome, toast } from "../ui/layout.js";
import { captchaEnabled, renderCaptcha, getCaptchaToken } from "./captcha.js";

const authBox = () => document.getElementById("auth");
let lastEmail = "";

/* Messages d'erreur Supabase traduits en français. */
const ERRORS = [
  [/invalid login credentials/i, "E-mail ou mot de passe incorrect."],
  [/already registered|already exists/i, "Un compte existe déjà avec cet e-mail. Connecte-toi ou réinitialise ton mot de passe."],
  [/email not confirmed/i, "Ton adresse n'est pas encore confirmée : clique sur le lien reçu par e-mail."],
  [/password should be at least|weak password/i, "Le mot de passe doit contenir au moins 8 caractères."],
  [/invalid email|unable to validate email/i, "Cette adresse e-mail n'est pas valide."],
  [/rate limit|too many/i, "Trop de tentatives. Réessaie dans quelques minutes."],
  [/captcha/i, "La vérification anti-robot a échoué ou a expiré. Recommence."],
  [/fetch|network/i, "Connexion au serveur impossible. Vérifie ta connexion internet."],
];
export const frErr = e => {
  const m = (e && e.message) || String(e);
  for (const [r, t] of ERRORS) if (r.test(m)) return t;
  return "Une erreur est survenue : " + m;
};

function showAuthError(t){
  let el = document.getElementById("auth-inline-err");
  if (!el){
    el = document.createElement("p"); el.id = "auth-inline-err"; el.className = "msg err"; el.setAttribute("role", "alert");
    document.getElementById("auth-form").before(el);
  }
  el.textContent = t;
}

/* ---------- Écran de connexion (modes : login, signup, reset, newpass) ---------- */
export function showAuth(mode = "login", msg = null){
  const v0 = view(); v0.innerHTML = ""; v0.hidden = true;
  setChrome(false);
  document.getElementById("acct").hidden = true;
  authBox().hidden = false;
  window.scrollTo({top:0,behavior:"instant"});
  const F = (id,label,type,ac,extra="") => `<label class="field" for="${id}">${label}<input id="${id}" type="${type}" autocomplete="${ac}" required ${extra} ${id==="a-email"&&lastEmail?`value="${esc(lastEmail)}"`:""}></label>`;
  const SEL = (id,label,opts) => `<label class="field" for="${id}"><span>${label}</span><select id="${id}"><option value="">—</option>${opts.map(o=>`<option>${esc(o)}</option>`).join("")}</select></label>`;
  const titles = {login:"<i class='ic' data-i='hand'></i> Se connecter", signup:"<i class='ic' data-i='user'></i> Créer un compte", reset:"<i class='ic' data-i='key'></i> Mot de passe oublié", newpass:"<i class='ic' data-i='lock'></i> Nouveau mot de passe"};
  const intro = {
    login:"Connecte-toi pour retrouver ta progression sur tous tes appareils.",
    signup:"Un compte par personne : chaque compte a sa propre progression et ses propres points à améliorer.",
    reset:"Indique ton e-mail : tu recevras un lien pour choisir un nouveau mot de passe.",
    newpass:"Choisis ton nouveau mot de passe."};
  const fields = {
    login: F("a-email","E-mail","email","email")+F("a-pass","Mot de passe","password","current-password"),
    signup: `<div class="two">` + F("a-first","Prénom","text","given-name",'maxlength="40"') + F("a-last","Nom","text","family-name",'maxlength="40"') + `</div>` + F("a-email","E-mail","email","email")+F("a-pass","Mot de passe <small>(8 caractères minimum)</small>","password","new-password",'minlength="8"')
      + `<div class="two">` + SEL("a-gender","Genre <small>(facultatif)</small>",["Femme","Homme","Autre","Je préfère ne pas répondre"])
      + SEL("a-job","Situation pro. <small>(facultatif)</small>",["Salarié(e)","Indépendant(e) / entrepreneur","Fonctionnaire","Demandeur(se) d'emploi","Étudiant(e)","Retraité(e)","Sans activité professionnelle","Autre"]) + `</div>`
      + `<p class="note" style="margin:0">Le genre et la situation professionnelle sont facultatifs. Ils servent seulement à mieux connaître les personnes qui utilisent le site. En créant un compte, tu acceptes la <a href="confidentialite" data-tab="privacy" style="color:var(--accent);font-weight:700">politique de confidentialité</a>.</p>`,
    reset: F("a-email","E-mail","email","email"),
    newpass: F("a-pass","Nouveau mot de passe <small>(8 caractères minimum)</small>","password","new-password",'minlength="8"')};
  const useCaptcha = captchaEnabled() && mode !== "newpass";
  const btn = {login:"Se connecter <i class='ic' data-i='arrow-right'></i>", signup:"<i class='ic' data-i='user'></i> Créer mon compte", reset:"<i class='ic' data-i='mail'></i> Envoyer le lien", newpass:"<i class='ic' data-i='save'></i> Enregistrer"};
  const links = {
    login:`<button type="button" class="link" data-m="signup">Pas encore de compte ? Inscris-toi</button><button type="button" class="link" data-m="reset">Mot de passe oublié ?</button>`,
    signup:`<button type="button" class="link" data-m="login">J'ai déjà un compte</button>`,
    reset:`<button type="button" class="link" data-m="login"><i class='ic' data-i='arrow-left'></i> Retour à la connexion</button>`,
    newpass:``};
  authBox().innerHTML = `<div class="authgrid">
    <div class="authside">
      <span class="pill-tag" style="align-self:flex-start"><i class='ic' data-i='cap'></i> Page d'entraînement</span>
      <h2>Prépare ton examen civique : titre de séjour ou naturalisation</h2>
      <ul>
        <li><span><i class='ic' data-i='book'></i></span>Les questions officielles des 3 examens : carte de séjour pluriannuelle, carte de résident, naturalisation</li>
        <li><span><i class='ic' data-i='bulb'></i></span>Une explication pour chaque réponse</li>
        <li><span><i class='ic' data-i='target'></i></span>Tes points faibles repérés automatiquement</li>
        <li><span><i class='ic' data-i='phone'></i></span>Ta progression sur tous tes appareils</li>
      </ul>
    </div>
    <div class="authform">
      <h2>${titles[mode]}</h2><p class="note" style="margin:0">${intro[mode]}</p>
      ${msg?`<p class="msg ${msg[0]}" role="status">${esc(msg[1])}</p>`:""}
      <form id="auth-form" novalidate>${fields[mode]}${useCaptcha?`<div id="cf-captcha" class="captcha"></div>`:""}<button class="btn primary block" type="submit">${btn[mode]}</button></form>
      <div class="links">${links[mode]}</div>
      ${mode!=="newpass"?`<div class="sep">Tu peux aussi <button type="button" class="link" id="guest">continuer sans compte</button> : ta progression restera alors seulement dans ce navigateur.</div>`:""}
    </div></div>`;
  authBox().querySelectorAll("[data-m]").forEach(b=>b.addEventListener("click",()=>showAuth(b.dataset.m)));
  const g = document.getElementById("guest"); if (g) g.addEventListener("click", enterGuest);
  const form = document.getElementById("auth-form");
  form.querySelector("input").focus({preventScroll:true});
  if (useCaptcha) renderCaptcha(showAuthError);
  form.addEventListener("submit", async e=>{
    e.preventDefault();
    if (!form.reportValidity()) return;
    if (useCaptcha && !getCaptchaToken()){ showAuthError("Merci de valider la vérification anti-robot avant de continuer."); return; }
    const cap = useCaptcha ? { captchaToken: getCaptchaToken() } : {};
    const v = id => (document.getElementById(id)||{}).value || "";
    if (v("a-email")) lastEmail = v("a-email").trim();
    const sub = form.querySelector("button[type=submit]"); sub.disabled = true; sub.innerHTML = "<i class='ic' data-i='hourglass'></i> Patiente…";
    try {
      if (mode==="login"){
        const {data, error} = await sb.auth.signInWithPassword({email:v("a-email").trim(), password:v("a-pass"), options:cap});
        if (error) throw error;
        await enter(data.user);
      } else if (mode==="signup"){
        const {data, error} = await sb.auth.signUp({email:v("a-email").trim(), password:v("a-pass"), options:{data:{first_name:v("a-first").trim(), last_name:v("a-last").trim(), full_name:(v("a-first").trim() + " " + v("a-last").trim()).trim(), gender:v("a-gender")||null, occupation:v("a-job")||null}, emailRedirectTo:APP_URL, ...cap}});
        if (error) throw error;
        if (data.session) await enter(data.user);
        else showAuth("login", ["info","Compte créé. Ouvre le lien reçu par e-mail pour l'activer, puis connecte-toi ici."]);
      } else if (mode==="reset"){
        const {error} = await sb.auth.resetPasswordForEmail(v("a-email").trim(), {redirectTo:APP_URL, ...cap});
        if (error) throw error;
        showAuth("login", ["info","Si un compte existe avec cette adresse, un e-mail de réinitialisation vient d'être envoyé."]);
      } else if (mode==="newpass"){
        const {data, error} = await sb.auth.updateUser({password:v("a-pass")});
        if (error) throw error;
        history.replaceState(null, "", APP_URL);
        await enter(data.user);
      }
    } catch(err){
      showAuth(mode, ["err", frErr(err)]);
    }
  });
}

/* ---------- Démarrage de l'application après connexion (ou sans compte) ---------- */
function startApp(){
  state.authReturn = false;
  authBox().hidden = true; authBox().innerHTML = "";
  view().hidden = false;
  setChrome(true);
  document.getElementById("acct").hidden = !sb;
  const u = state.user, av = document.getElementById("avatar");
  av.hidden = !u; document.getElementById("signin").hidden = !!u;
  document.getElementById("menu").hidden = true; av.setAttribute("aria-expanded", "false");
  if (u){
    paintAvatar();
    av.title = u.name + " · " + u.email;
    av.setAttribute("aria-label", "Compte de " + u.name);
    document.getElementById("who").textContent = u.name;
    document.getElementById("who-mail").textContent = u.email || "";
  }
  const note = document.getElementById("storage-note");
  if (note) note.innerHTML = u
    ? "<i class='ic' data-i='save'></i> Ta progression est enregistrée dans ton compte : tu la retrouves sur tous tes appareils."
    : "<i class='ic' data-i='save'></i> Ta progression est enregistrée dans ce navigateur uniquement.";
  refreshStats();
  const t0 = takeInitialTab();
  go(t0 && hasView(t0) ? t0 : "home", true, true);
}

async function enter(u){
  const meta = u.user_metadata || {};
  state.user = { id: u.id, email: u.email, name: meta.full_name || meta.name || (u.email || "").split("@")[0], gender: meta.gender || null, occupation: meta.occupation || null, avatar: meta.avatar || null };
  await loadRemote();
  await useExam(initialExam());
  startApp();
}

export async function enterGuest(){ state.user = null; loadLocal(); await useExam(initialExam()); startApp(); }

export async function logout(){
  if (state.user){
    cancelPendingSave(); await pushRemote();
    try { await sb.auth.signOut(); } catch(err) {}
    state.user = null; state.store = emptyStore(); setSync("");
    await enterGuest();   // retour au site, sans compte
    toast("Tu es déconnecté. À bientôt !");
  } else showAuth("login");
}

/* Point de départ : session existante, lien « mot de passe oublié », ou écran de connexion. */
export async function boot(){
  if (!sb){ await enterGuest(); return; }
  sb.auth.onAuthStateChange(ev => { if (ev === "PASSWORD_RECOVERY") setTimeout(() => showAuth("newpass"), 0); });
  if (RECOVERING){ showAuth("newpass"); return; }
  try {
    const { data: { session } } = await sb.auth.getSession();
    // Sans session : on arrive directement sur le site, sans écran de connexion (le compte est proposé ensuite).
    if (session) await enter(session.user); else await enterGuest();
  } catch(e){ await enterGuest(); }
}
