/* Client Supabase (null si non configuré ou bibliothèque indisponible). */
import { CONFIG } from "../config.js";

/* À lire AVANT la création du client, qui nettoie l'adresse après un lien e-mail. */
export const RECOVERING = /type=recovery/.test(location.hash);

export const sb = (CONFIG.supabaseUrl && CONFIG.supabaseAnonKey && window.supabase)
  ? window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey)
  : null;
