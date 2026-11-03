/* Mentions légales et politique de confidentialité. */
import { CONFIG } from "../config.js";
import { state } from "../core/state.js";
import { esc } from "../core/utils.js";
import { APP_URL } from "../core/router.js";
import { page, render, help } from "../ui/layout.js";
import { showAuth } from "../auth/auth.js";

export const EDITOR = CONFIG.editorName || "l'éditeur du site";
export const CONTACT = CONFIG.contactEmail || "";
export const mail = CONTACT ? `<a href="mailto:${esc(CONTACT)}">${esc(CONTACT)}</a>` : "l'adresse indiquée par l'éditeur";

/* Bouton de retour : vers la connexion si la page a été ouverte depuis l'inscription. */
function backBtn(){
  return state.authReturn ? `<div class="row"><button class="btn" id="back-auth"><i class='ic' data-i='arrow-left'></i> Retour à la connexion</button></div>` : `<div class="row"><button class="btn" data-tab="home"><i class='ic' data-i='home'></i> Retour à l'accueil</button></div>`;
}
function bindBack(){
  const b = document.getElementById("back-auth");
  if (b) b.addEventListener("click", () => { state.authReturn = false; try { history.replaceState(null, "", APP_URL); } catch(e) {} showAuth("signup"); });
}
export function showLegal(){
  render(page("<i class='ic' data-i='file'></i>", "Mentions légales", help("Informations prévues par la loi pour la confiance dans l'économie numérique (LCEN)."), `
    <div class="card legal">
      <h2>Éditeur du site</h2>
      <p>Ce site est édité à titre personnel et non commercial par ${esc(EDITOR)}.<br>Contact : ${mail}</p>
      <h2>Hébergement</h2>
      <p>Site hébergé par GitHub Pages : GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis (<a href="https://github.com" target="_blank" rel="noopener">github.com</a>).</p>
      <p>Comptes et progression hébergés par Supabase, Inc. (<a href="https://supabase.com" target="_blank" rel="noopener">supabase.com</a>).</p>
      <h2>Nature du site</h2>
      <p>Ce site est un outil d'entraînement <b>non officiel</b>. Il n'est ni édité ni validé par le ministère de l'Intérieur, France Éducation international ou la CCI Paris Île-de-France. Pour toute information officielle, consulte <a href="https://formation-civique.interieur.gouv.fr/examen-civique/" target="_blank" rel="noopener">formation-civique.interieur.gouv.fr</a>.</p>
      <h2>Propriété intellectuelle</h2>
      <p>Les questions sont issues de la liste officielle publiée par le ministère de l'Intérieur, réutilisée sous <a href="https://www.etalab.gouv.fr/licence-ouverte-open-licence/" target="_blank" rel="noopener">licence ouverte Etalab 2.0</a>.</p>
      <p>Les réponses, les explications, les fiches « À retenir », le code, la mise en page et le design du site sont la propriété de ${esc(EDITOR)}. Toute reproduction ou réutilisation, totale ou partielle, sans autorisation écrite est interdite.</p>
      <h2>Responsabilité</h2>
      <p>Le ministère ne publie ni les réponses ni les mises en situation : les réponses, les explications et les mises en situation du site ont été rédigées pour s'entraîner.</p>
      <p>Les réponses et explications ont été rédigées avec soin pour la révision, mais peuvent contenir des erreurs ou devenir obsolètes. Elles n'ont pas de valeur officielle. Signale toute erreur à ${mail}.</p>
    </div>
    ${backBtn()}`, true));
  bindBack();
}
export function showPrivacy(){
  render(page("<i class='ic' data-i='lock'></i>", "Politique de confidentialité", help("Comment tes données sont utilisées, conformément au RGPD. Dernière mise à jour : octobre 2026."), `
    <div class="card legal">
      <h2>Responsable du traitement</h2>
      <p>${esc(EDITOR)}, joignable à ${mail}.</p>
      <h2>Données collectées</h2>
      <ul>
        <li><b>Avec un compte :</b> adresse e-mail, mot de passe (stocké chiffré, jamais lisible), nom complet.</li>
        <li><b>Facultatif :</b> genre et situation professionnelle, uniquement si tu les indiques.</li>
        <li><b>Progression :</b> tes réponses aux questions, tes jours d'entraînement et ta série du jour.</li>
        <li><b>Sans compte :</b> ta progression reste dans ton navigateur et n'est envoyée nulle part.</li>
        <li><b>Avis :</b> ta note, ton commentaire et, seulement si tu l'acceptes, ton prénom pour l'afficher sur le site.</li>
        <li><b>Signalement d'erreur :</b> le texte que tu écris, la question concernée et, si tu es connecté, l'identifiant de ton compte.</li>
      </ul>
      <h2>Pourquoi ces données</h2>
      <ul>
        <li>Créer ton compte et te permettre de te connecter (exécution du service).</li>
        <li>Sauvegarder ta progression et calculer tes points à améliorer (exécution du service).</li>
        <li>Signalements et avis : corriger et améliorer le site (intérêt légitime). Affichage d'un avis : uniquement avec ton accord.</li>
        <li>Genre et situation professionnelle : statistiques globales sur les utilisateurs du site (consentement, champs facultatifs).</li>
      </ul>
      <p>Tes données ne sont ni vendues, ni louées, ni utilisées pour de la publicité. Aucun cookie de suivi ni de publicité n'est utilisé.${CONFIG.goatcounter ? " Le nombre de visites est mesuré avec GoatCounter, un outil sans cookies qui ne collecte aucune donnée personnelle : seuls des totaux anonymes (pages vues, type d'appareil, pays) sont conservés." : ""}</p>
      <h2>Où sont les données</h2>
      <p>Les comptes et la progression sont hébergés par Supabase, Inc., sous-traitant technique. Le site charge aussi des polices depuis Google Fonts et une bibliothèque depuis jsDelivr : ces services reçoivent l'adresse IP de ton appareil lors du chargement de la page.</p>
      <p>Le navigateur garde une copie locale de ta session et de ta progression (stockage local), nécessaire au fonctionnement du site.</p>
      <h2>Durée de conservation</h2>
      <p>Tes données sont conservées tant que ton compte existe. Les signalements sont conservés le temps de traiter la correction, au plus un an. Quand tu supprimes ton compte, elles sont effacées immédiatement et définitivement.</p>
      <h2>Tes droits</h2>
      <p>Tu peux à tout moment accéder à tes données, les corriger, les supprimer, t'opposer à leur traitement ou demander leur portabilité. Tu peux supprimer ton compte toi-même depuis <b><i class='ic' data-i='settings'></i> Mon compte et mes données</b> (menu de ta pastille), ou écrire à ${mail}.</p>
      <p>Si tu estimes que tes droits ne sont pas respectés, tu peux adresser une réclamation à la <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener">CNIL</a>.</p>
    </div>
    ${backBtn()}`, true));
  bindBack();
}
