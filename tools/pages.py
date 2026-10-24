"""Génère les pages d'accueil propres à chaque examen (pour Google et le partage de liens),
le fichier sitemap.xml et la liste des fichiers du service worker.

À relancer après toute modification de index.html, d'un fichier JS/CSS ou de données :
    python3 tools/pages.py
"""
import json, re, os, datetime, hashlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://examen-civique.mlndao.fr/"

EXAMS = [
    ("carte-de-sejour-pluriannuelle", "Examen civique carte de séjour pluriannuelle : entraînement gratuit",
     "Prépare gratuitement l'examen civique de la carte de séjour pluriannuelle : questions officielles, réponses expliquées, examens blancs chronométrés et suivi de tes points faibles."),
    ("carte-de-resident", "Examen civique carte de résident : entraînement gratuit",
     "Prépare gratuitement l'examen civique de la carte de résident : questions officielles, réponses expliquées, examens blancs chronométrés et suivi de tes points faibles."),
    ("naturalisation", "Examen civique naturalisation : entraînement gratuit",
     "Prépare gratuitement l'examen civique de naturalisation : questions officielles, réponses expliquées, examens blancs chronométrés et suivi de tes points faibles."),
]

def esc(s): return s.replace("&", "&amp;").replace('"', "&quot;")

src = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
start, end = "<!-- page:start", "<!-- page:end -->"
i, j = src.index(start), src.index(end) + len(end)

for page, title, desc in EXAMS:
    url = SITE + page + "/"
    head = f'''<!-- Page générée par tools/pages.py à partir de index.html : ne pas modifier à la main. -->
<base href="../">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{url}">
<meta property="og:url" content="{url}">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">'''
    os.makedirs(os.path.join(ROOT, page), exist_ok=True)
    open(os.path.join(ROOT, page, "index.html"), "w", encoding="utf-8").write(src[:i] + head + src[j:])

today = datetime.date.today().isoformat()
urls = [SITE] + [SITE + p + "/" for p, _, _ in EXAMS]
open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8").write(
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + "".join(f"  <url><loc>{u}</loc><lastmod>{today}</lastmod></url>\n" for u in urls) + "</urlset>\n")

# Liste des fichiers mis en cache par le service worker + empreinte (change à chaque modification).
files = ["./", "index.html", "manifest.webmanifest"] + [p + "/" for p, _, _ in EXAMS]
h = hashlib.sha1()
for folder in ["assets/css", "assets/img", "js", "data"]:
    for dp, _, fs in os.walk(os.path.join(ROOT, folder)):
        for f in sorted(fs):
            rel = os.path.relpath(os.path.join(dp, f), ROOT).replace(os.sep, "/")
            if rel.endswith("og-image.png"): continue
            files.append(rel)
for rel in sorted(files):
    p = os.path.join(ROOT, rel)
    if os.path.isfile(p): h.update(open(p, "rb").read())
h.update(src.encode())
sw = open(os.path.join(ROOT, "sw.js"), encoding="utf-8").read()
sw = re.sub(r'const VERSION = "[^"]*";', f'const VERSION = "{h.hexdigest()[:10]}";', sw)
sw = re.sub(r"const FILES = \[[\s\S]*?\];", "const FILES = " + json.dumps(sorted(files), indent=2) + ";", sw)
open(os.path.join(ROOT, "sw.js"), "w", encoding="utf-8").write(sw)
print("Pages, sitemap.xml et sw.js à jour (version " + h.hexdigest()[:10] + ").")
