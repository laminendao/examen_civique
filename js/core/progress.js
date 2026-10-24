/* Progression : sauvegarde locale + synchronisation Supabase, statistiques. */
import { sb } from "./supabase.js";
import { state, emptyStore } from "./state.js";
import { Q, NOTIONS, DAILY_N } from "./data.js";
import { lsGet, lsSet, todayStr, rng } from "./utils.js";

const KEY = "ec-cr-v1";
export const localKey = () => state.user ? KEY + ":" + state.user.id : KEY;

export function loadLocal(){ state.store = Object.assign(emptyStore(), lsGet(localKey()) || {}); }
export function forgetLocal(userId){ try { localStorage.removeItem(KEY + ":" + userId); } catch(e) {} }

/* ---------- Sauvegarde ---------- */
let pushTimer = null;
export function save(){
  lsSet(localKey(), state.store);
  if (sb && state.user){ clearTimeout(pushTimer); pushTimer = setTimeout(pushRemote, 700); }
}
export function cancelPendingSave(){ clearTimeout(pushTimer); }

export function setSync(t){
  const el = document.getElementById("sync");
  el.hidden = !t; el.textContent = t || "";
}

export async function pushRemote(){
  if (!sb || !state.user) return;
  try {
    const { error } = await sb.from("progress").upsert({ user_id: state.user.id, data: state.store, updated_at: new Date().toISOString() });
    setSync(error ? "Synchronisation impossible pour l'instant : ta progression est gardée sur cet appareil et sera renvoyée à la prochaine réponse." : "");
  } catch(e){ setSync("Hors ligne : ta progression est gardée sur cet appareil."); }
}

/* Fusionne deux progressions (ex. cet appareil + serveur) en gardant le plus avancé. */
export function mergeStores(a, b){
  a = Object.assign(emptyStore(), a || {}); b = Object.assign(emptyStore(), b || {});
  const m = emptyStore();
  for (const id of new Set([...Object.keys(a.stats), ...Object.keys(b.stats)])){
    const x = a.stats[id], y = b.stats[id];
    m.stats[id] = !x ? y : !y ? x : (y.seen > x.seen ? y : x);
  }
  m.days = Object.assign({}, a.days, b.days);
  const da = a.daily, db = b.daily;
  m.daily = !da ? db : !db ? da : (da.date !== db.date ? (da.date > db.date ? da : db) : (db.pos > da.pos ? db : da));
  return m;
}

export async function loadRemote(){
  loadLocal();
  try {
    const { data, error } = await sb.from("progress").select("data").eq("user_id", state.user.id).maybeSingle();
    if (error){ setSync("Serveur injoignable : la progression enregistrée sur cet appareil est utilisée."); return; }
    if (data && data.data) state.store = mergeStores(data.data, state.store);
    lsSet(localKey(), state.store);
    await pushRemote();
  } catch(e){ setSync("Serveur injoignable : la progression enregistrée sur cet appareil est utilisée."); }
}

export async function resetProgress(){
  state.store = emptyStore(); save(); cancelPendingSave(); await pushRemote();
}

/* ---------- Statistiques ---------- */
export const mastered = id => { const s = state.store.stats[id]; return s && s.lastOk && s.ok >= 2; };
export const missed = id => { const s = state.store.stats[id]; return s && !s.lastOk; };

export function record(id, ok){
  const s = state.store.stats[id] || { seen: 0, ok: 0, lastOk: false };
  s.seen++; if (ok) s.ok++; s.lastOk = ok; state.store.stats[id] = s; save();
}

/* Série du jour : d'abord les erreurs, puis les jamais vues, puis le reste. */
export function dailyIds(){
  const t = todayStr(), st = state.store;
  if (st.daily && st.daily.date === t) return st.daily;
  const r = rng(t);
  const scored = Q.map(q => {
    const s = st.stats[q.id];
    const p = !s ? 1 : (!s.lastOk ? 0 : (mastered(q.id) ? 3 : 2));
    return { id: q.id, k: p + r() };
  }).sort((a, b) => a.k - b.k);
  st.daily = { date: t, ids: scored.slice(0, DAILY_N).map(x => x.id), pos: 0, good: 0, wrong: [] };
  save();
  return st.daily;
}

export function streak(){
  let n = 0; const d = new Date();
  if (!state.store.days[todayStr(d)]) d.setDate(d.getDate() - 1);
  while (state.store.days[todayStr(d)]){ n++; d.setDate(d.getDate() - 1); }
  return n;
}

/* Bilan par notion pour « À améliorer ». */
export function notionStats(){
  const out = {};
  for (const k of Object.keys(NOTIONS)) out[k] = { k, total: 0, seen: 0, att: 0, ok: 0, miss: [] };
  for (const q of Q){
    const o = out[q.n]; o.total++;
    const s = state.store.stats[q.id];
    if (!s) continue;
    o.seen++; o.att += s.seen; o.ok += s.ok;
    if (!s.lastOk) o.miss.push(q.id);
  }
  for (const o of Object.values(out)){
    o.rate = o.att ? o.ok / o.att : null;
    o.score = o.miss.length * 2 + (o.rate === null ? 0 : (1 - o.rate) * o.seen);
  }
  return out;
}
export function weakList(){
  return Object.values(notionStats()).filter(o => o.miss.length || (o.rate !== null && o.rate < 0.8)).sort((a, b) => b.score - a.score);
}

export function refreshStats(){
  dailyIds();
  const n = weakList().length;
  document.querySelectorAll(".weak-count").forEach(el => { el.hidden = !n; el.textContent = n; });
}
