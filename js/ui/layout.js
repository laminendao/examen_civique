/* Mise en page commune aux écrans. */
import { esc } from "../core/utils.js";

export const view = () => document.getElementById("view");

/* En-tête de page + contenu ; narrow = colonne centrée plus étroite. */
export const page = (emoji, title, sub, inner, narrow = false) => `
  <div class="page container">
    <div class="pagehead ${narrow ? "narrow" : ""}"><h1><span>${emoji}</span>${esc(title)}</h1>${sub ? `<p>${sub}</p>` : ""}</div>
    ${narrow ? `<div class="narrow" style="display:flex;flex-direction:column;gap:22px">${inner}</div>` : inner}
  </div>`;

export function render(html){ view().innerHTML = html; }

/* Petit message temporaire en bas de l'écran (ex. « Tu es déconnecté »). Texte simple, jamais de HTML. */
export function toast(text){
  document.querySelector(".toast")?.remove();
  const el = document.createElement("div");
  el.className = "toast"; el.setAttribute("role", "status"); el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add("out"), 3500);
  setTimeout(() => el.remove(), 4000);
}

/* Affiche ou masque la navigation (masquée sur l'écran de connexion). */
export function setChrome(showNav){
  document.getElementById("navlinks").hidden = !showNav;
  document.getElementById("tabbar").hidden = !showNav;
  document.getElementById("exambar").hidden = !showNav;
}
