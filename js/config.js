/* ============================================================
   Réglages du site — seul fichier à modifier pour la configuration.
   Toutes ces valeurs sont publiques (elles sont visibles dans le navigateur).
   Ne jamais mettre ici la clé « service_role » de Supabase ni la clé secrète Turnstile.
   ============================================================ */
export const CONFIG = {
  // Supabase (comptes et sauvegarde). Vide = mode sans compte.
  supabaseUrl: "https://rqxohlirhgyxzokzqaha.supabase.co",
  supabaseAnonKey: "sb_publishable_F4N_k5e8o0lGebWe0kdB5A_zT1CuffJ",

  // Anti-robots Cloudflare Turnstile : clé de site publique. Vide = pas de CAPTCHA.
  turnstileSiteKey: "0x4AAAAAAFj_zOlN0ze72X4p",

  // Mentions légales
  editorName: "Mouhamadou Lamine NDAO",
  contactEmail: "ndao.lamine0404@gmail.com",

  // Examen proposé (fichier dans data/questions/)
  exam: "carte-resident",
};
