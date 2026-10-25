/* État partagé de l'application. */

/* Progression par examen : { stats, days, daily } */
export const emptyExam = () => ({ stats: {}, days: {}, daily: null, mocks: [], act: {} });
/* Progression complète (format v2) : un historique séparé pour chaque examen. */
export const emptyStore = () => ({ v: 2, exams: {} });

export const state = {
  user: null,            // {id, email, name, gender, occupation} quand connecté
  store: emptyStore(),   // progression de tous les examens
  exam: "carte-resident",// examen choisi (voir EXAMS dans data.js)
  authReturn: false, urlExam: null,     // vrai si une page légale a été ouverte depuis l'écran de connexion
};
