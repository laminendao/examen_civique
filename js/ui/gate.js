/* Accès sans compte : 3 séries gratuites, puis un compte est demandé.
   L'examen blanc et le tableau de bord demandent toujours un compte. */
import { sb } from "../core/supabase.js";
import { state } from "../core/state.js";
import { lsGet, lsSet } from "../core/utils.js";
import { page, render } from "./layout.js";

export const FREE_RUNS = 3;
const KEY = "ec-guest-runs";

/* Les comptes n'existent que si Supabase est configuré. */
export const isGuest = () => !!sb && !state.user;
export const guestRuns = () => +(lsGet(KEY) || 0);
export const freeLeft = () => Math.max(0, FREE_RUNS - guestRuns());

/* Appelé à la fin de chaque série terminée sans compte. */
export function countGuestRun(){ if (isGuest()) lsSet(KEY, guestRuns() + 1); }

const REASONS = {
  runs: { icon: "lock", title: "Crée ton compte gratuit pour continuer",
    text: `Tu as terminé tes ${FREE_RUNS} séries d'essai. Pour continuer à t'entraîner, crée un compte : c'est gratuit et ça prend une minute.` },
  exam: { icon: "exam", title: "L'examen blanc demande un compte",
    text: "L'examen blanc chronométré et l'historique de tes notes sont réservés aux comptes. C'est gratuit et ça prend une minute." },
  stats: { icon: "chart", title: "Le tableau de bord demande un compte",
    text: "Ta note estimée, ta progression par thème et ta régularité sont réservées aux comptes. C'est gratuit et ça prend une minute." },
};

/* Affiche l'écran « compte requis » si nécessaire. Renvoie true si l'accès est bloqué. */
export function gate(reason){
  if (!isGuest()) return false;
  if (reason === "runs" && guestRuns() < FREE_RUNS) return false;
  const r = REASONS[reason];
  render(page(`<i class='ic' data-i='${r.icon}'></i>`, r.title, "", `
    <div class="card gate">
      <p style="margin:0">${r.text}</p>
      <ul class="gate-list">
        <li><i class='ic' data-i='check'></i> Examens blancs chronométrés et historique de tes notes</li>
        <li><i class='ic' data-i='check'></i> Tableau de bord : note estimée, progression, régularité</li>
        <li><i class='ic' data-i='check'></i> Ta progression sauvegardée sur tous tes appareils</li>
      </ul>
      <div class="row"><button class="btn primary" data-gate="signup"><i class='ic' data-i='user'></i> Créer mon compte gratuit</button><button class="btn" data-gate="login">J'ai déjà un compte</button></div>
      <p class="note" style="margin:0">Ce que tu as déjà fait sans compte est conservé dans ton nouveau compte. Aucune publicité, aucune revente de données, et tu peux supprimer ton compte à tout moment.</p>
    </div>`, true));
  document.querySelectorAll("[data-gate]").forEach(b => b.addEventListener("click", () =>
    import("../auth/auth.js").then(a => a.showAuth(b.dataset.gate))));
  return true;
}
