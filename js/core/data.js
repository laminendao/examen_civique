/* Données : examens disponibles, questions, thèmes et notions (fichiers JSON dans /data). */

export const DAILY_N = 15;   // questions par série du jour
export const EXAM_N = 40;    // questions par examen blanc
export const PASS = 32;      // seuil de réussite

/* Les trois examens civiques. Le nom de fichier est dans data/questions/<slug>.json */
export const EXAMS = {
  "carte-sejour-pluriannuelle": {
    page: "carte-de-sejour-pluriannuelle", title: "Examen civique carte de séjour pluriannuelle : entraînement gratuit",
    desc: "Prépare gratuitement l'examen civique de la carte de séjour pluriannuelle : questions officielles, réponses expliquées, examens blancs chronométrés et suivi de tes points faibles.",
    label: "Carte de séjour pluriannuelle", short: "Séjour pluriannuel", tiny: "CSP", icon: "idcard",
    of: "de la carte de séjour pluriannuelle", level: "le niveau le plus accessible",
    list: "https://formation-civique.interieur.gouv.fr/examen-civique/liste-officielle-des-questions-de-connaissance-csp/",
  },
  "carte-resident": {
    page: "carte-de-resident", title: "Examen civique carte de résident : entraînement gratuit",
    desc: "Prépare gratuitement l'examen civique de la carte de résident : questions officielles, réponses expliquées, examens blancs chronométrés et suivi de tes points faibles.",
    label: "Carte de résident", short: "Carte de résident", tiny: "Résident", icon: "home",
    of: "de la carte de résident", level: "le niveau intermédiaire",
    list: "https://formation-civique.interieur.gouv.fr/examen-civique/liste-officielle-des-questions-de-connaissance-cr/",
  },
  "naturalisation": {
    page: "naturalisation", title: "Examen civique naturalisation : entraînement gratuit",
    desc: "Prépare gratuitement l'examen civique de naturalisation : questions officielles, réponses expliquées, examens blancs chronométrés et suivi de tes points faibles.",
    label: "Naturalisation", short: "Naturalisation", tiny: "Nationalité", icon: "flag",
    of: "de naturalisation", level: "le niveau le plus exigeant",
    list: "https://www.immigration.interieur.gouv.fr/documentation/guides-textes-et-brochures/questions-de-connaissance-pour-lexamen-civique-nationalite-francaise.html",
  },
};
export const EXAM_ORDER = ["carte-sejour-pluriannuelle", "carte-resident", "naturalisation"];
export const isExam = slug => !!EXAMS[slug];

/* Remplis par loadData() / loadExam() */
export const THEMES = {};    // { P: {label, icon, iconName}, ... }
export const NOTIONS = {};   // { laic: {label, retenir}, ... }
export const Q = [];         // questions de l'examen choisi : [{id, t, n, q, a, d, x, s}, ...]
export const QI = {};        // les mêmes, par identifiant

const url = path => new URL("../../data/" + path, import.meta.url);
async function getJSON(path){
  const res = await fetch(url(path));
  if (!res.ok) throw new Error("Impossible de charger " + path + " (" + res.status + ")");
  return res.json();
}

/* Thèmes et notions, communs aux trois examens. */
export async function loadData(){
  const [themes, notions] = await Promise.all([getJSON("themes.json"), getJSON("notions.json")]);
  for (const [k, th] of Object.entries(themes)) THEMES[k] = { label: th.label, iconName: th.icon, icon: `<i class='ic' data-i='${th.icon}'></i>` };
  Object.assign(NOTIONS, notions);
}

/* Questions d'un examen (gardées en mémoire après le premier chargement). */
const cache = {};
export async function loadExam(slug){
  if (!cache[slug]) cache[slug] = getJSON("questions/" + slug + ".json");
  if (!cache.situations) cache.situations = getJSON("questions/situations.json");
  const [exam, sit] = await Promise.all([cache[slug], cache.situations]);
  Q.length = 0;
  for (const k of Object.keys(QI)) delete QI[k];
  const add = (x, s) => { const q = { id: x.id, t: x.theme, n: x.notion, q: x.question, a: x.answer, d: x.distractors, x: x.explanation, s }; Q.push(q); QI[q.id] = q; };
  for (const x of exam.questions) add(x, false);
  for (const x of sit.questions) add(x, true);   // mises en situation : exemples non officiels, communs aux 3 examens
}
