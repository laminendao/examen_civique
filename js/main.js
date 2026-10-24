/* ============================================================
   Point d'entrée de l'application.
   Organisation :
     config.js          réglages (clés publiques, éditeur, examen)
     core/              données, état, progression, navigation, Supabase
     auth/              connexion, inscription, anti-robots
     ui/                mise en page commune, menu du compte
     views/             un fichier par écran
   ============================================================ */
import { loadData } from "./core/data.js";
import { registerViews, setupNavigation } from "./core/router.js";
import { setupAccountMenu } from "./ui/account-menu.js";
import { boot } from "./auth/auth.js";

import { showHome } from "./views/home.js";
import { showDaily } from "./views/daily.js";
import { showExam } from "./views/exam.js";
import { showThemes } from "./views/themes.js";
import { showWeak } from "./views/weak.js";
import { showReview } from "./views/review.js";
import { showLegal, showPrivacy } from "./views/legal.js";
import { showAccount } from "./views/account.js";

registerViews({
  home: showHome, daily: showDaily, exam: showExam, themes: showThemes, weak: showWeak,
  review: showReview, legal: showLegal, privacy: showPrivacy, account: showAccount,
});
setupNavigation();
setupAccountMenu();

try {
  await loadData();
  await boot();
} catch(e){
  console.error(e);
  document.getElementById("view").innerHTML = `<div class="page container"><div class="card"><p style="margin:0">⚠️ Le site n'a pas pu se charger. Vérifie ta connexion internet puis recharge la page.</p></div></div>`;
}
