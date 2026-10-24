/* Application installable : service worker (hors connexion + mises à jour immédiates) et bouton « Installer ». */
let deferred = null;

const standalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent);

export function setupPwa(){
  const local = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) && !location.search.includes("sw=1");
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol) && !local){
    const base = document.querySelector('link[rel="manifest"]')?.href.replace(/manifest\.webmanifest.*$/, "") || "./";
    navigator.serviceWorker.register(base + "sw.js", { scope: base }).catch(() => {});
  }
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferred = e; paintInstall(); });
  window.addEventListener("appinstalled", () => { deferred = null; paintInstall(); });
  document.addEventListener("ec-page", () => setTimeout(paintInstall, 0));
}

/* Encadré affiché dans l'emplacement #install-slot (page d'accueil) quand l'installation est possible. */
export function paintInstall(){
  const slot = document.getElementById("install-slot");
  if (!slot) return;
  if (standalone() || (!deferred && !isIos())){ slot.innerHTML = ""; return; }
  slot.innerHTML = `<div class="install card">
    <div><b><i class='ic' data-i='install'></i> Installe l'application sur ton téléphone</b>
    <span class="note">${deferred ? "Accès en un geste depuis l'écran d'accueil, et révision possible même sans connexion." : "Sur iPhone : touche le bouton Partager <i class='ic' data-i='share'></i> de Safari, puis « Sur l'écran d'accueil »."}</span></div>
    ${deferred ? `<button class="btn primary sm" id="install-btn"><i class='ic' data-i='install'></i> Installer</button>` : ""}
  </div>`;
  slot.querySelector("#install-btn")?.addEventListener("click", async () => {
    deferred.prompt();
    try { await deferred.userChoice; } catch(e) {}
    deferred = null; paintInstall();
  });
}
