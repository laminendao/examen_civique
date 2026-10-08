# Examen civique – carte de résident

Un site gratuit pour s'entraîner à l'examen civique exigé depuis le 1er janvier 2026 pour une première demande de carte de résident de 10 ans.

Il reprend les 209 questions de connaissance publiées par le ministère de l'Intérieur, présentées comme à l'examen : un QCM avec 4 choix et une seule bonne réponse.

## Comment ça marche

Le site propose cinq onglets :

- **Série du jour** : 15 questions par jour. La série reprend d'abord les questions auxquelles vous avez mal répondu, puis celles que vous n'avez jamais vues. Revenez chaque jour pour couvrir toute la liste petit à petit.
- **Examen blanc** : 40 questions tirées au hasard, comme le jour de l'examen. Il faut au moins 32 bonnes réponses (80 %) pour réussir.
- **Par thème** : les questions d'un seul thème, pour travailler un point faible. Les cinq thèmes sont les principes et valeurs de la République, les institutions, les droits et devoirs, l'histoire-géographie-culture, et la vie en société.
- **À améliorer** : le bilan automatique de vos points faibles, notion par notion, avec l'essentiel à retenir et un entraînement ciblé.
- **Révision** : toutes les questions avec leur réponse et leur explication, une recherche par mot-clé et un filtre « seulement mes erreurs ».

Après chaque réponse, le site affiche la bonne réponse et une explication. En fin de série, il liste les questions à revoir et les points à améliorer ; l'onglet **À améliorer** fait le bilan par notion.

## Votre progression

Le site compte vos jours d'entraînement consécutifs et les questions que vous maîtrisez (réussies au moins deux fois, dont la dernière). Avec un compte, cette progression est enregistrée en ligne et vous la retrouvez sur tous vos appareils. Sans compte, elle reste dans votre navigateur : utilisez alors le même appareil et le même navigateur.

## Comptes utilisateurs (Supabase)

Le site propose un espace de connexion : chaque personne crée son compte (prénom, e-mail, mot de passe) et retrouve sa progression et ses points à améliorer sur tous ses appareils. Sans configuration, le site fonctionne en mode « sans compte » (progression gardée dans le navigateur).

Mise en place, une seule fois :

1. Créer un projet gratuit sur [supabase.com](https://supabase.com).
2. Dans **SQL Editor**, coller le contenu de `supabase_setup.sql` et cliquer sur **Run**. Cela crée la table `progress` et les règles de sécurité : chacun ne voit que sa propre progression.
3. Dans **Authentication > URL Configuration**, mettre l'adresse du site dans **Site URL** (par exemple `https://laminendao.github.io/examen_civique/`) et l'ajouter aussi dans **Redirect URLs**. Les liens de confirmation et de réinitialisation du mot de passe renvoient vers cette adresse.
4. Dans **Project Settings > API**, copier la **Project URL** et la clé **anon public**, puis les coller en haut de `index.html` :

   ```js
   window.EC_CONFIG = {
     supabaseUrl: "https://xxxx.supabase.co",
     supabaseAnonKey: "eyJ..."
   };
   ```

   La clé « anon » est faite pour être publique : la sécurité repose sur les règles de l'étape 2. Ne jamais mettre la clé `service_role` dans le site.
5. Facultatif : dans **Authentication > Sign In / Providers > Email**, désactiver **Confirm email** pour que les comptes soient actifs sans passer par l'e-mail de confirmation.

Chaque compte a sa propre progression, indépendante de celle faite sans compte. À l'inscription, le site demande le nom complet, puis, de façon facultative, le genre et la situation professionnelle. Ces informations sont visibles dans Supabase, dans **Authentication > Users**, champ *raw user meta data*. Un bouton en bas de l'onglet **À améliorer** permet de remettre sa progression à zéro.

## Bon à savoir

- Les questions de mise en situation de l'examen ne sont pas publiées par le ministère : elles ne figurent donc pas sur ce site.
- Le ministère publie les questions, pas les réponses. Les réponses proposées ici ont été rédigées pour la révision.

Source des questions : [formation-civique.interieur.gouv.fr](https://formation-civique.interieur.gouv.fr/examen-civique/liste-officielle-des-questions-de-connaissance-cr/) (licence Etalab 2.0).
