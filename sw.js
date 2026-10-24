/* Service worker : le site fonctionne hors connexion et se met à jour sans délai.
   Stratégie « réseau d'abord » : on demande toujours la dernière version au serveur ;
   si le réseau est indisponible, on sert la copie enregistrée.
   VERSION et FILES sont mis à jour par tools/pages.py. */
const VERSION = "5a5619eca8";
const FILES = [
  "./",
  "assets/css/style.css",
  "assets/img/apple-touch-icon.png",
  "assets/img/favicon.svg",
  "assets/img/icon-192.png",
  "assets/img/icon-512.png",
  "assets/img/icon-maskable-512.png",
  "carte-de-resident/",
  "carte-de-sejour-pluriannuelle/",
  "data/notions.json",
  "data/questions/carte-resident.json",
  "data/questions/carte-sejour-pluriannuelle.json",
  "data/questions/naturalisation.json",
  "data/questions/situations.json",
  "data/themes.json",
  "index.html",
  "js/auth/auth.js",
  "js/auth/captcha.js",
  "js/config.js",
  "js/core/data.js",
  "js/core/progress.js",
  "js/core/router.js",
  "js/core/state.js",
  "js/core/supabase.js",
  "js/core/utils.js",
  "js/main.js",
  "js/ui/account-menu.js",
  "js/ui/analytics.js",
  "js/ui/confirm.js",
  "js/ui/exam-switch.js",
  "js/ui/icons.js",
  "js/ui/layout.js",
  "js/ui/pwa.js",
  "js/ui/reading.js",
  "js/ui/report.js",
  "js/views/account.js",
  "js/views/daily.js",
  "js/views/exam.js",
  "js/views/home.js",
  "js/views/info.js",
  "js/views/legal.js",
  "js/views/quiz.js",
  "js/views/review.js",
  "js/views/themes.js",
  "js/views/weak.js",
  "manifest.webmanifest",
  "naturalisation/"
];
const CACHE = "ec-" + VERSION;

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: "reload" })))).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("ec-") && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const same = url.origin === self.location.origin;
  const fonts = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname) || url.hostname === "cdn.jsdelivr.net";
  if (!same && !fonts) return;   // Supabase, Cloudflare, mesure d'audience : jamais en cache

  if (fonts){   // polices et bibliothèque : copie locale d'abord, mise à jour en arrière-plan
    e.respondWith(caches.open(CACHE).then(async c => {
      const hit = await c.match(req);
      const net = fetch(req).then(r => { if (r.ok || r.type === "opaque") c.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }

  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    try {
      const r = await fetch(req, { cache: "no-cache" });   // revalide auprès du serveur : toujours la dernière version
      if (r.ok) c.put(req, r.clone());
      return r;
    } catch(err){
      const hit = await c.match(req, { ignoreSearch: req.mode === "navigate" });
      if (hit) return hit;
      if (req.mode === "navigate"){   // adresse propre (/examen-blanc…) hors connexion : page principale
        const page = url.pathname.split("/").filter(Boolean)[0];
        return (await c.match(page + "/")) || (await c.match("./")) || (await c.match("index.html")) || Response.error();
      }
      return Response.error();
    }
  })());
});
