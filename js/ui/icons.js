/* ============================================================
   Icônes du site : dessin au trait, maison (24 × 24, trait rond).
   Utilisation dans le HTML : <i class="ic" data-i="home"></i>
   Les balises sont remplies automatiquement (voir setupIcons).
   Couleur : celle du texte (currentColor) ; classe « icb » = pastille
   fond blanc + contour rouge.
   ============================================================ */

const P = {
  // Navigation
  home: '<path d="M3.5 10.5 12 3.5l8.5 7"/><path d="M5.5 9v10.5h13V9"/><path d="M10 19.5v-5.5h4v5.5"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="m9 15 2 2 4-4"/>',
  exam: '<rect x="5" y="4" width="14" height="17" rx="2.5"/><path d="M9 4V3h6v1"/><path d="M8.5 10h7M8.5 14h7M8.5 17.5h4"/>',
  book: '<path d="M12 6.5C10 5 7 4.5 3.5 5v13.5c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5Z"/><path d="M12 6.5V20"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>',

  // Compte
  user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c1-4 4-6 7.5-6s6.5 2 7.5 6"/>',
  logout: '<path d="M14 4h4.5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H14"/><path d="M10 16.5 5.5 12 10 7.5M5.5 12H15"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/><path d="M12 14.5v2"/>',
  key: '<circle cx="8" cy="15" r="4.5"/><path d="m11.2 11.8 8.3-8.3M16.5 6.5l2.5 2.5M14 9l2 2"/>',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="m3.5 7 8.5 6.5L20.5 7"/>',
  save: '<path d="M5 4h11.5L20 7.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a1 1 0 0 1 1-1Z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>',
  phone: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>',
  download: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/><path d="M4.5 16.5v2a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-2"/>',
  trash: '<path d="M4 7h16M9.5 7V4.5h5V7"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v5.5M14 11v5.5"/>',
  hand: '<path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V12M11 11V4.5a1.5 1.5 0 0 1 3 0V11M14 11V5.5a1.5 1.5 0 0 1 3 0V13"/><path d="M17 9.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-1a7 7 0 0 1-5.5-2.8L4 15.5a1.6 1.6 0 0 1 2.6-1.9L8 15.5"/>',

  // Actions et états
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  close: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l5.5-3.5Z"/>',
  plus: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
  refresh: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.5v4.5H15"/>',
  "arrow-right": '<path d="M4.5 12h15M14 6.5l5.5 5.5-5.5 5.5"/>',
  "arrow-left": '<path d="M19.5 12h-15M10 6.5 4.5 12l5.5 5.5"/>',
  external: '<path d="M14 4.5h5.5V10M19.5 4.5 11 13"/><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/>',
  hourglass: '<path d="M6.5 3.5h11M6.5 20.5h11"/><path d="M7.5 3.5c0 4 4.5 5.5 4.5 8.5s-4.5 4.5-4.5 8.5M16.5 3.5c0 4-4.5 5.5-4.5 8.5s4.5 4.5 4.5 8.5"/>',
  volume: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/>',
  install: '<path d="M12 3.5v11M7.5 10l4.5 4.5 4.5-4.5"/><path d="M4.5 16.5v2.5a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-2.5"/>',
  share: '<circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="m8.2 10.8 7.6-4.1M8.2 13.2l7.6 4.1"/>',
  timer: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 2M9.5 2.5h5"/>',
  warning: '<path d="M12 3.5 2.5 20h19Z"/><path d="M12 10v4.5M12 17.2v.3"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.8v.2"/>',
  question: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17v.2"/>',
  radio: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/>',

  // Progression et résultats
  flame: '<path d="M12 21c-4 0-6.5-2.7-6.5-6.3 0-3.7 3-5.6 3.7-9.2 2.3 1.3 3.3 3.3 3.3 5 1-.6 1.6-1.6 1.8-2.8 2 1.6 4.2 4.1 4.2 7 0 3.6-2.5 6.3-6.5 6.3Z"/><path d="M12 21c-1.6 0-2.7-1.1-2.7-2.7 0-1.8 1.4-2.6 2.7-4.3 1.3 1.7 2.7 2.5 2.7 4.3 0 1.6-1.1 2.7-2.7 2.7Z"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0V4Z"/><path d="M8 5.5H4.5V7a3 3 0 0 0 3.5 3M16 5.5h3.5V7A3 3 0 0 1 16 10M12 13v4M8.5 20.5h7M9.5 17h5v3.5h-5Z"/>',
  flag: '<path d="M5.5 21V4M5.5 4.5h11l-2 4 2 4h-11"/>',
  "trend-up": '<path d="M3.5 17.5 9.5 11.5l4 4 7-7.5"/><path d="M15 8h5.5v5.5"/>',
  "trend-down": '<path d="M3.5 6.5l6 6 4-4 7 7.5"/><path d="M15 16h5.5v-5.5"/>',
  chart: '<path d="M4 20.5h16"/><rect x="5.5" y="12" width="3" height="6" rx="1"/><rect x="10.5" y="7.5" width="3" height="10.5" rx="1"/><rect x="15.5" y="4" width="3" height="14" rx="1"/>',
  bulb: '<path d="M9 17.5h6M10 21h4"/><path d="M8.5 14.5a6 6 0 1 1 7 0c-.6.5-1 1.2-1 2v1h-5v-1c0-.8-.4-1.5-1-2Z"/>',
  muscle: '<path d="M4.5 9v6M7.5 6.5v11M16.5 6.5v11M19.5 9v6M7.5 12h9"/>',
  pin: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.5"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z"/>',
  folder: '<path d="M3.5 7a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2Z"/>',
  rocket: '<path d="M12 3c3.5 2 5 5.5 5 9.5l-2 3.5H9l-2-3.5C7 8.5 8.5 5 12 3Z"/><circle cx="12" cy="10" r="1.8"/><path d="M9 16l-2.5 3M15 16l2.5 3M12 17v3.5"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5Z"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  file: '<path d="M6 3.5h8.5L19 8v12.5H6Z"/><path d="M14 3.5V8.5h5M9 12.5h7M9 16h5"/>',
  list: '<path d="M9 6.5h11M9 12h11M9 17.5h11"/><path d="M4.5 6.5h.5M4.5 12h.5M4.5 17.5h.5"/>',
  pen: '<path d="M4 20l1-4.5L15.5 5a2 2 0 0 1 3 3L8 18.5Z"/><path d="M13.5 7l3 3"/>',
  building: '<rect x="5" y="3.5" width="14" height="17" rx="1.5"/><path d="M9 7.5h2M13 7.5h2M9 11h2M13 11h2M9 14.5h2M13 14.5h2M10.5 20.5V18h3v2.5"/>',
  idcard: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="8.5" cy="11" r="2.2"/><path d="M5.5 16c.6-1.6 1.7-2.3 3-2.3s2.4.7 3 2.3M14 10h4.5M14 13.5h3"/>',
  news: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M7 8.5h10M7 12h4.5M7 15.5h4.5"/><rect x="13" y="11.5" width="4" height="4.5" rx=".5"/>',
  cap: '<path d="M2.5 9.5 12 5l9.5 4.5L12 14Z"/><path d="M6.5 11.5v4c1.5 1.5 3.5 2.3 5.5 2.3s4-.8 5.5-2.3v-4M21.5 9.5V15"/>',

  // Thèmes officiels
  scale: '<path d="M12 4v16.5M8 20.5h8M5 7h14M12 4v3"/><path d="m5 7-2.5 6a2.5 2.5 0 0 0 5 0Z"/><path d="m19 7-2.5 6a2.5 2.5 0 0 0 5 0Z"/>',
  institution: '<path d="M3 9.5 12 4l9 5.5Z"/><path d="M5 9.5v8M9.5 9.5v8M14.5 9.5v8M19 9.5v8M3 20.5h18M4 17.5h16"/>',
  scroll: '<path d="M7 4h11a2 2 0 0 1 2 2v1.5h-4"/><path d="M16 7.5V18a2.5 2.5 0 0 1-5 0v-1H4V6a2 2 0 0 1 2-2"/><path d="M11 17v1a2.5 2.5 0 0 0 2.5 2.5H18M8 8.5h5M8 12h5"/>',
  map: '<path d="M3.5 6.5 9 4l6 2.5L20.5 4v13.5L15 20l-6-2.5-5.5 2.5Z"/><path d="M9 4v13.5M15 6.5V20"/>',
  people: '<circle cx="9" cy="8" r="3.2"/><path d="M3 19.5c.7-3.4 3-5.2 6-5.2s5.3 1.8 6 5.2"/><circle cx="17" cy="9" r="2.6"/><path d="M15.8 14.2c2.6 0 4.6 1.6 5.2 4.5"/>',
};

/* Logo : livre ouvert coché, blanc sur la pastille rouge. */
export const LOGO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 6.5C10 5 7 4.5 3.5 5v13.5c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5Z"/><path d="m8.5 12 2.3 2.3 4.7-4.7"/></svg>';

export function svg(name){
  const body = P[name] || P.info;
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
}

/* Balise à insérer dans les gabarits HTML. */
export const ic = (name, cls = "") => `<i class="ic ${cls}" data-i="${name}"></i>`;
/* Variante « pastille » : fond blanc, contour rouge. */
export const icb = (name, cls = "") => `<i class="ic icb ${cls}" data-i="${name}"></i>`;

function fill(root){
  root.querySelectorAll("i.ic[data-i]:not([data-done])").forEach(el => {
    el.innerHTML = el.dataset.i === "logo" ? LOGO : svg(el.dataset.i);
    el.setAttribute("data-done", "");
  });
}

/* Remplit les icônes présentes, puis toutes celles ajoutées ensuite à la page. */
export function setupIcons(){
  fill(document);
  new MutationObserver(muts => {
    for (const m of muts) for (const n of m.addedNodes) if (n.nodeType === 1){
      if (n.matches && n.matches("i.ic[data-i]:not([data-done])")) fill(n.parentNode || document);
      else fill(n);
    }
  }).observe(document.body, { childList: true, subtree: true });
}
