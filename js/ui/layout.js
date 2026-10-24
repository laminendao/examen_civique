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

/* Affiche ou masque la navigation (masquée sur l'écran de connexion). */
export function setChrome(showNav){
  document.getElementById("navlinks").hidden = !showNav;
  document.getElementById("tabbar").hidden = !showNav;
  document.getElementById("exambar").hidden = !showNav;
}
