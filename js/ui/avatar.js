/* Pastille de profil : initiales par défaut, ou une icône choisie (facultatif) dans « Mon compte ». */
import { state } from "../core/state.js";
import { initials } from "../core/utils.js";
import { svg } from "./icons.js";

export const AVATARS = ["av-star", "av-heart", "av-sun", "av-moon", "av-leaf", "av-flower", "av-mountain", "av-boat", "av-coffee", "av-feather", "av-tower", "av-globe"];

export function paintAvatar(){
  const u = state.user, av = document.getElementById("avatar");
  if (!u || !av) return;
  const ic = AVATARS.includes(u.avatar) ? u.avatar : null;
  av.classList.toggle("has-icon", !!ic);
  if (ic) av.innerHTML = svg(ic); else av.textContent = initials(u.name);
}
