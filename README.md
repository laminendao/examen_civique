# Examen civique : entraînement gratuit

Site d'entraînement à l'examen civique exigé depuis le 1ᵉʳ janvier 2026 pour une première carte de séjour pluriannuelle, une première carte de résident ou une demande de naturalisation.

🌐 **En ligne :** https://examen-civique.mlndao.fr

Il reprend les questions de connaissance publiées par le ministère de l'Intérieur (licence Etalab 2.0), présentées comme à l'examen : un QCM à 4 choix avec une seule bonne réponse. Chaque réponse est expliquée.

## Fonctionnalités

- **Série du jour** : 15 questions par jour. Les erreurs repassent en priorité, puis viennent les questions jamais vues.
- **Examen blanc** : 40 questions tirées au hasard. Il faut 32 bonnes réponses (80 %) pour réussir.
- **Par thème** : les 5 thèmes officiels.
- **À améliorer** : bilan automatique par notion, avec l'essentiel à retenir et un entraînement ciblé.
- **Révision** : toutes les questions avec réponse et explication, une recherche et un filtre « mes erreurs ».
- **Comptes** (Supabase) : progression sauvegardée en ligne, export et suppression des données. On peut aussi utiliser le site sans compte.

## Organisation des fichiers

```
index.html              structure de la page (en-tête, navigation, pied de page)
404.html                redirection des adresses propres sur GitHub Pages
CNAME                   domaine personnalisé (examen-civique.mlndao.fr)

assets/css/style.css    tout le style du site

js/config.js            ⚙️ réglages : clés publiques Supabase et Turnstile, éditeur, examen
js/main.js              point d'entrée : enregistre les pages et démarre l'application
js/core/                logique sans affichage
  data.js               chargement des questions, thèmes et notions (JSON)
  state.js              état partagé (utilisateur connecté, progression)
  progress.js           sauvegarde locale et en ligne, statistiques, série du jour
  router.js             navigation et adresses propres (/serie-du-jour…)
  supabase.js           connexion à Supabase
  utils.js              petites fonctions utilitaires
js/auth/                connexion, inscription, mot de passe oublié, anti-robots
js/ui/                  mise en page commune, menu du compte
js/views/               un fichier par écran (accueil, quiz, série du jour, examen…)

data/questions/carte-sejour-pluriannuelle.json   191 questions (CSP)
data/questions/carte-resident.json               209 questions (carte de résident)
data/questions/naturalisation.json               244 questions (naturalisation)
data/themes.json                     les 5 thèmes officiels
data/notions.json                    les notions et leurs fiches « À retenir »

supabase/setup.sql      création de la base (à exécuter dans le SQL Editor de Supabase)
supabase/emails/        modèles d'e-mails en français
deploy/                 tâche GitHub qui empêche la mise en veille de Supabase
docs/                   documents de travail
```

**Modifier une question ou une explication :** édite le fichier de l'examen dans `data/questions/`.
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
