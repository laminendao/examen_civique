/* Petite fenêtre de confirmation (remplace window.confirm, plus lisible et au style du site). */
export function confirmBox({ title, text, ok = "Confirmer", cancel = "Annuler" }){
  return new Promise(resolve => {
    const prev = document.activeElement;
    const wrap = document.createElement("div");
    wrap.className = "modal-wrap";
    wrap.innerHTML = `<div class="modal" role="alertdialog" aria-modal="true" aria-labelledby="m-t" aria-describedby="m-d">
      <h2 id="m-t">${title}</h2><p id="m-d">${text}</p>
      <div class="row"><button class="btn primary" data-v="0">${cancel}</button><button class="btn" data-v="1">${ok}</button></div></div>`;
    const close = v => { wrap.remove(); document.removeEventListener("keydown", onKey, true); prev?.focus?.(); resolve(v); };
    const onKey = e => { if (e.key === "Escape"){ e.stopPropagation(); close(false); } };
    wrap.addEventListener("click", e => { if (e.target === wrap) close(false); const b = e.target.closest("[data-v]"); if (b) close(b.dataset.v === "1"); });
    document.addEventListener("keydown", onKey, true);
    document.body.appendChild(wrap);
    wrap.querySelector("[data-v='0']").focus();
  });
}
