/* Anti-robots Cloudflare Turnstile (activé si CONFIG.turnstileSiteKey est renseigné). */
import { CONFIG } from "../config.js";

export const captchaEnabled = () => !!CONFIG.turnstileSiteKey;

let token = null, loading = null;
export const getCaptchaToken = () => token;
export const resetCaptchaToken = () => { token = null; };

function loadTurnstile(){
  if (window.turnstile) return Promise.resolve();
  if (!loading) loading = new Promise((ok, ko) => {
    const sc = document.createElement("script");
    sc.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    sc.async = true; sc.onload = ok; sc.onerror = ko;
    document.head.appendChild(sc);
  });
  return loading;
}

/* Affiche la case dans l'élément #cf-captcha ; onError(message) en cas d'échec de chargement. */
export function renderCaptcha(onError){
  token = null;
  loadTurnstile().then(() => {
    const el = document.getElementById("cf-captcha"); if (!el) return;
    window.turnstile.render(el, {
      sitekey: CONFIG.turnstileSiteKey, language: "fr", theme: "light",
      callback: t => { token = t; },
      "expired-callback": () => { token = null; },
      "error-callback": () => { token = null; },
    });
  }).catch(() => onError("La vérification anti-robot n'a pas pu se charger. Vérifie ta connexion puis recharge la page."));
}
