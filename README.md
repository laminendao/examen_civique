# Examen civique : entraînement gratuit

Site d'entraînement à l'examen civique exigé depuis le 1ᵉʳ janvier 2026 pour une première carte de séjour pluriannuelle, une première carte de résident ou une demande de naturalisation.

🌐 **En ligne :** https://examen-civique.mlndao.fr

Il reprend les questions de connaissance publiées par le ministère de l'Intérieur (licence Etalab 2.0), présentées comme à l'examen : un QCM à 4 choix avec une seule bonne réponse. Chaque réponse est expliquée.

## Fonctionnalités

- **Série du jour** : 15 questions par jour. Les erreurs repassent en priorité, puis viennent les questions jamais vues.
- **Trois examens** : carte de séjour pluriannuelle, carte de résident, naturalisation. Chacun a sa propre progression et son historique.
- **Examen blanc** : 40 questions réparties par thème comme le jour J (28 de connaissance + 12 mises en situation), chronomètre de 45 minutes, correction à la fin, courbe des notes.
- **Mises en situation** : 50 exemples rédigés pour s'entraîner (le ministère ne publie pas les siennes), signalés comme non officiels.
- **Par thème** : les 5 thèmes officiels.
- **À améliorer** : bilan automatique par notion, avec l'essentiel à retenir et un entraînement ciblé.
- **Révision** : toutes les questions avec réponse et explication, une recherche et un filtre « mes erreurs ».
- **Signaler une erreur** sous chaque question : les signalements arrivent dans la table Supabase `reports`.
- **Confort de lecture** : texte agrandi et lecture à voix haute des questions.
- **Application installable** (PWA) qui fonctionne aussi hors connexion, et mises à jour visibles immédiatement.
- **Comptes** (Supabase) : progression sauvegardée en ligne, export et suppression des données. On peut aussi utiliser le site sans compte.

## Organisation des fichiers

```
index.html              structure de la page (en-tête, navigation, pied de page)
404.html                redirection des adresses propres sur GitHub Pages
CNAME                   domaine personnalisé (examen-civique.mlndao.fr)
carte-de-sejour-pluriannuelle/, carte-de-resident/, naturalisation/
                        pages d'accueil de chaque examen (générées, pour Google et le partage)
sw.js                   service worker : hors connexion et mises à jour immédiates (généré)
manifest.webmanifest    description de l'application installable
sitemap.xml, robots.txt pour les moteurs de recherche (sitemap généré)
tools/pages.py          ⚙️ régénère les pages d'examen, sitemap.xml et sw.js

assets/css/style.css    tout le style du site
assets/img/             icônes de l'application et image d'aperçu de partage

js/config.js            ⚙️ réglages : clés publiques Supabase et Turnstile, éditeur, GoatCounter
js/main.js              point d'entrée : enregistre les pages et démarre l'application
js/core/                logique sans affichage
  data.js               chargement des questions, thèmes et notions (JSON)
  state.js              état partagé (utilisateur connecté, progression)
  progress.js           sauvegarde locale et en ligne, statistiques, série du jour
  router.js             navigation et adresses propres (/serie-du-jour…)
  supabase.js           connexion à Supabase
  utils.js              petites fonctions utilitaires
js/auth/                connexion, inscription, mot de passe oublié, anti-robots
js/ui/                  mise en page, menu du compte, choix de l'examen, signalements,
                        lecture facile, application installable, mesure d'audience
js/views/               un fichier par écran (accueil, quiz, série du jour, examen…)

data/questions/carte-sejour-pluriannuelle.json   191 questions (CSP)
data/questions/carte-resident.json               209 questions (carte de résident)
data/questions/naturalisation.json               244 questions (naturalisation)
data/questions/situations.json                   50 mises en situation (exemples non officiels, communes aux 3 examens)
data/themes.json                     les 5 thèmes officiels
data/notions.json                    les notions et leurs fiches « À retenir »

supabase/setup.sql      création de la base (à exécuter dans le SQL Editor de Supabase)
supabase/reports.sql    table des signalements d'erreurs (déjà incluse dans setup.sql)
supabase/emails/        modèles d'e-mails en français
deploy/                 tâche GitHub qui empêche la mise en veille de Supabase
docs/                   documents de travail
```

**Modifier une question ou une explication :** édite le fichier de l'examen dans `data/questions/`.

**⚠️ Avant chaque mise en ligne, si tu as modifié un fichier :** lance `python3 tools/pages.py`. Il met à jour les pages des examens et la version du service worker, pour que tout le monde reçoive la nouvelle version.
**Les trois examens** sont déclarés dans `EXAMS` (`js/core/data.js`). Chaque examen a sa propre progression (`exams.<examen>` dans les données enregistrées) ; les anciennes progressions sont rattachées automatiquement à la carte de résident.

## Tester sur son ordinateur

Le site charge ses données avec `fetch` : il faut donc un petit serveur local. Ouvrir `index.html` en double-cliquant ne suffit pas.

```bash
python3 -m http.server 8000
```

Puis ouvre http://localhost:8000. Pense à ajouter `http://localhost:8000/**` dans les Redirect URLs de Supabase si tu testes la connexion.

## Mise en ligne

Le site est hébergé sur GitHub Pages. La liste des réglages (domaine, e-mails Brevo, modèles d'e-mails, anti-robots, mise en veille) se trouve dans `MISE_EN_LIGNE.md`.

## Licence

Code, design, réponses et explications : © Mouhamadou Lamine NDAO, tous droits réservés (voir `LICENSE`). Les questions officielles restent sous licence ouverte Etalab 2.0.
