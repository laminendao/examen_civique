/* Chargement des données : questions, thèmes et notions (fichiers JSON dans /data). */
import { CONFIG } from "../config.js";

export const DAILY_N = 15;   // questions par série du jour
export const EXAM_N = 40;    // questions par examen blanc
export const PASS = 32;      // seuil de réussite

/* Remplis par loadData() avant le démarrage de l'application. */
export const THEMES = {};    // { P: {label, icon}, ... }
export const NOTIONS = {};   // { laic: {label, retenir}, ... }
export const Q = [];         // [{id, t, n, q, a, d, x}, ...]
export let EXAM = { exam: "", label: "" };

const url = path => new URL("../../data/" + path, import.meta.url);

async function getJSON(path){
  const res = await fetch(url(path));
  if (!res.ok) throw new Error("Impossible de charger " + path + " (" + res.status + ")");
  return res.json();
}

export async function loadData(){
  const [themes, notions, exam] = await Promise.all([
    getJSON("themes.json"),
    getJSON("notions.json"),
    getJSON("questions/" + CONFIG.exam + ".json"),
  ]);
  Object.assign(THEMES, themes);
  Object.assign(NOTIONS, notions);
  EXAM = { exam: exam.exam, label: exam.label };
  Q.length = 0;
  for (const x of exam.questions){
    Q.push({ id: x.id, t: x.theme, n: x.notion, q: x.question, a: x.answer, d: x.distractors, x: x.explanation });
  }
}
