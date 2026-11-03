/* Mesure d'audience GoatCounter : sans cookies ni données personnelles, désactivée si CONFIG.goatcounter est vide.
   Compte les pages vues (une par onglet ouvert). */
import { CONFIG } from "../config.js";

let ready = false;
const queue = [];

export function setupAnalytics(){
  const code = (CONFIG.goatcounter || "").trim();
  if (!code || !/^https?:$/.test(location.protocol)) return;
  window.goatcounter = { no_onload: true };
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://gc.zgo.at/count.js";
  s.dataset.goatcounter = "https://" + code + ".goatcounter.com/count";
  s.onload = () => { ready = true; queue.splice(0).forEach(track); };
  document.head.appendChild(s);
  document.addEventListener("ec-page", e => track(e.detail));
}

function track(path){
  if (!ready){ if (queue.length < 5) queue.push(path); return; }
  try { window.goatcounter.count({ path }); } catch(e) {}
}
