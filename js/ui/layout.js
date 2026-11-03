/* Mise en page commune aux écrans. */
import { esc } from "../core/utils.js";

export const view = () => document.getElementById("view");

/* Texte d'aide repliable, affiché sous le titre seulement si l'utilisateur le demande. */
export const help = text => ({ help: text });

/* En-tête de page + contenu ; narrow = colonne centrée plus étroite.
   sub : texte affiché sous le titre, ou help("…") pour une explication repliée. */
export const page = (emoji, title, sub, inner, narrow = false) => `
  <div class="page container">
    <div class="pagehead ${narrow ? "narrow" : ""}">${sub && sub.help
      ? `<details class="pagehelp"><summary><h1><span>${emoji}</span>${esc(title)}</h1><span class="qhelp" title="En savoir plus" aria-label="En savoir plus sur cette page"><i class='ic' data-i='info'></i></span></summary><p>${sub.help}</p></details>`
      : `<h1><span>${emoji}</span>${esc(title)}</h1>${sub ? `<p>${sub}</p>` : ""}`}</div>
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
  document.getElementById("picker").hidden = !showNav;
}
