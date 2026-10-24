/* Petites fonctions utilitaires, sans dépendance. */

export const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
export const pct = x => Math.round(x * 100) + " %";

export function todayStr(d = new Date()){
  const z = n => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + z(d.getMonth() + 1) + "-" + z(d.getDate());
}

/* Générateur pseudo-aléatoire déterministe (même graine = même série du jour). */
export function rng(seed){
  let h = 2166136261;
  for (const c of seed){ h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 100000) / 100000; };
}

export function shuffle(arr, r = Math.random){
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/* Stockage local : peut être indisponible (navigation privée…), on ne plante jamais. */
export const lsGet = k => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch(e) { return null; } };
export const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) {} };
export const lsRemove = k => { try { localStorage.removeItem(k); } catch(e) {} };

export function initials(name){
  const parts = String(name || "").trim().split(/[\s-]+/).filter(Boolean);
  if (!parts.length) return "?";
  const a = parts[0][0], b = parts.length > 1 ? parts[parts.length - 1][0] : (parts[0][1] || "");
  return (a + b).toUpperCase();
}
