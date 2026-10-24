/* État partagé de l'application. */
export const emptyStore = () => ({ stats: {}, days: {}, daily: null });

export const state = {
  user: null,            // {id, email, name, gender, occupation} quand connecté
  store: emptyStore(),   // progression : {stats, days, daily}
  authReturn: false,     // vrai si une page légale a été ouverte depuis l'écran de connexion
};
