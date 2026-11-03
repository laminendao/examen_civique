/* Confort de lecture : texte agrandi et lecture à voix haute (synthèse vocale du navigateur). */
import { lsGet, lsSet } from "../core/utils.js";

const BIG = "ec-big";
export function applyReading(){ document.body.classList.toggle("big", !!lsGet(BIG)); }
export function toggleBig(){ lsSet(BIG, !lsGet(BIG)); applyReading(); }
export const isBig = () => !!lsGet(BIG);

export const canSpeak = () => "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

/* Choix de la voix : français de France, de préférence une voix « naturelle » ou « améliorée ». */
let voice = null;
const GOOD = /natural|neural|online|premium|enhanced|amélioré|google|amélie|amelie|thomas|audrey|aurélie|aurelie|denise|henri|eloise|vivienne/i;
const BAD = /compact|eloquence|grandma|grandpa|jacques|rocko|shelley|sandy|flo|reed|eddy/i;
function pickVoice(){
  const vs = speechSynthesis.getVoices().filter(v => /^fr/i.test(v.lang));
  const score = v => (/fr[-_]FR/i.test(v.lang) ? 4 : 0) + (GOOD.test(v.name) ? 3 : 0) - (BAD.test(v.name) ? 5 : 0) + (v.localService ? 1 : 0);
  voice = vs.sort((a, b) => score(b) - score(a))[0] || null;
}
if (canSpeak()){ pickVoice(); speechSynthesis.addEventListener?.("voiceschanged", pickVoice); }
// On se tait quand on change de page.
document.addEventListener("ec-page", () => stopSpeaking());

/* Rend le texte plus naturel à l'oral. */
const clean = t => String(t)
  .replace(/[«»"]/g, "")
  .replace(/\s*:\s*/g, ", ")
  .replace(/\bex\.\s*/gi, "par exemple ")
  .replace(/\s+/g, " ").trim();

let speaking = false, onEnd = null;
const finish = () => { speaking = false; const f = onEnd; onEnd = null; f?.(); };

/* parts : liste de phrases lues l'une après l'autre, avec une courte pause entre elles. */
export function speak(parts, done){
  if (!canSpeak()) return;
  stopSpeaking();
  if (!voice) pickVoice();
  const list = (Array.isArray(parts) ? parts : [parts]).map(clean).filter(Boolean);
  speaking = true; onEnd = done;
  // Petit délai après l'arrêt : certains navigateurs (Safari) coupent sinon le début de la phrase.
  setTimeout(() => {
    if (!speaking) return;
    list.forEach((txt, i) => {
      const u = new SpeechSynthesisUtterance(txt);
      u.lang = voice ? voice.lang : "fr-FR"; if (voice) u.voice = voice;
      u.rate = 0.95; u.pitch = 1;
      if (i === list.length - 1){ u.onend = finish; u.onerror = finish; }
      speechSynthesis.speak(u);
    });
  }, 250);
}
export function stopSpeaking(){
  if (!canSpeak()) return;
  const was = speaking; speaking = false;
  speechSynthesis.cancel();
  if (was){ const f = onEnd; onEnd = null; f?.(); }
}
export const isSpeaking = () => speaking;

/* Petits boutons placés en haut d'une question. */
export const readingTools = () => `<span class="rtools">
  ${canSpeak() ? `<button type="button" class="tool" data-speak aria-pressed="false" title="Écouter la question et les réponses"><i class='ic' data-i='volume'></i><span>Écouter</span></button>` : ""}
  <button type="button" class="tool${isBig() ? " on" : ""}" data-big aria-pressed="${isBig()}" title="Agrandir le texte" aria-label="Agrandir le texte"><span class="aa">Aa</span></button>
</span>`;

/* partsFn() renvoie les phrases à lire : la question puis chaque réponse. */
export function bindReadingTools(root, partsFn){
  const btn = root.querySelector("[data-speak]");
  if (btn){
    const set = on => { btn.classList.toggle("on", on); btn.setAttribute("aria-pressed", on); btn.querySelector("span").textContent = on ? "Arrêter" : "Écouter"; };
    btn.addEventListener("click", () => {
      if (isSpeaking()){ stopSpeaking(); return; }
      set(true);
      speak(partsFn(), () => set(false));
    });
  }
  root.querySelector("[data-big]")?.addEventListener("click", e => {
    toggleBig(); const b = e.currentTarget; b.classList.toggle("on", isBig()); b.setAttribute("aria-pressed", isBig());
  });
}
