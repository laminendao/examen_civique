/* Pastille d'initiales en haut à droite et son menu (compte, déconnexion). */
import { showAuth, logout } from "../auth/auth.js";

export function setupAccountMenu(){
  const menu = document.getElementById("menu"), av = document.getElementById("avatar");
  const close = () => { menu.hidden = true; av.setAttribute("aria-expanded", "false"); };

  av.addEventListener("click", e => {
    e.stopPropagation();
    const open = menu.hidden; menu.hidden = !open; av.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("click", e => { if (!menu.hidden && !menu.contains(e.target) && e.target !== av) close(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !menu.hidden){ close(); av.focus(); } });
  document.getElementById("signin").addEventListener("click", () => showAuth("login"));
  document.getElementById("logout").addEventListener("click", e => { e.stopPropagation(); close(); logout(); });
}
