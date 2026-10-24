/* Confort de lecture : texte agrandi et lecture à voix haute (synthèse vocale du navigateur). */
import { lsGet, lsSet } from "../core/utils.js";

const BIG = "ec-big";
export function applyReading(){ document.body.classList.toggle("big", !!lsGet(BIG)); }
export function toggleBig(){ lsSet(BIG, !lsGet(BIG)); applyReading(); }
export const isBig = () => !!lsGet(BIG);

export const canSpeak = () => "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

let voice = null;
function pickVoice(){
  const vs = speechSynthesis.getVoices().filter(v => /^fr(-|_|$)/i.test(v.lang));
  voice = vs.find(v => /fr-FR/i.test(v.lang)) || vs[0] || null;
}
if (canSpeak()){ pickVoice(); speechSynthesis.addEventListener?.("voiceschanged", pickVoice); }

export function speak(text){
  if (!canSpeak()) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "fr-FR"; u.rate = 0.92; if (voice) u.voice = voice;
  speechSynthesis.speak(u);
}
export function stopSpeaking(){ if (canSpeak()) speechSynthesis.cancel(); }

/* Petits boutons placés en haut d'une question. */
export const readingTools = () => `<span class="rtools">
  ${canSpeak() ? `<button type="button" class="tool" data-speak title="Écouter la question" aria-label="Écouter la question"><i class='ic' data-i='volume'></i><span>Écouter</span></button>` : ""}
  <button type="button" class="tool${isBig() ? " on" : ""}" data-big aria-pressed="${isBig()}" title="Agrandir le texte" aria-label="Agrandir le texte"><span class="aa">Aa</span></button>
</span>`;

export function bindReadingTools(root, textFn){
  root.querySelector("[data-speak]")?.addEventListener("click", () => speak(textFn()));
  root.querySelector("[data-big]")?.addEventListener("click", e => {
    toggleBig(); const b = e.currentTarget; b.classList.toggle("on", isBig()); b.setAttribute("aria-pressed", isBig());
  });
}
