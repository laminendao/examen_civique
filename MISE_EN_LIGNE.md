# Mise en ligne : la liste à suivre

À faire une seule fois, dans cet ordre. Compte environ 1 h 30 en tout, plus le délai de propagation DNS (jusqu'à 24 h).

> ⚠️ **Le plus urgent.** Tant que l'étape 2 n'est pas faite, Supabase n'envoie ses e-mails **qu'aux membres de ton organisation Supabase**, et au maximum **2 par heure**. Les autres personnes qui s'inscrivent ne reçoivent pas leur e-mail de confirmation et ne peuvent pas activer leur compte.

---

## 1. Nom de domaine : examen-civique.mlndao.fr ✅

Le domaine `mlndao.fr` est acheté chez Hostinger. Le site sera à l'adresse **https://examen-civique.mlndao.fr**, et `mlndao.fr` reste libre pour autre chose.

1. **Chez Hostinger** : va dans **hPanel** > **Domaines** > `mlndao.fr` > **DNS / Serveurs de noms**, et ajoute **un seul** enregistrement :

   | Type | Nom | Pointe vers | TTL |
   |---|---|---|---|
   | CNAME | `examen-civique` | `laminendao.github.io` | 3600 (ou par défaut) |

   Ne touche pas aux autres enregistrements de `mlndao.fr`. Vérifie seulement qu'il n'existe pas déjà un enregistrement nommé `examen-civique`.
2. **Sur GitHub** : pousse le fichier `CNAME`, qui est déjà prêt dans le dossier. Va ensuite dans le dépôt **examen_civique** > **Settings** > **Pages** : le champ **Custom domain** doit afficher `examen-civique.mlndao.fr`. Sinon, saisis-le et clique sur **Save**. Attends que GitHub affiche « DNS check successful » (de quelques minutes à quelques heures), puis coche **Enforce HTTPS**.
3. **Conseillé** : sur GitHub, va dans ton profil > **Settings** > **Pages** > **Add a domain**, et ajoute `mlndao.fr`. GitHub te donne un enregistrement **TXT** à ajouter chez Hostinger. Il empêche quelqu'un d'autre d'utiliser ton domaine sur GitHub.
4. **Dans Supabase** : va dans **Authentication** > **URL Configuration** :
   - **Site URL** : `https://examen-civique.mlndao.fr/`
   - **Redirect URLs** : ajoute `https://examen-civique.mlndao.fr/**` et garde `https://laminendao.github.io/examen_civique/**` pendant la transition.
5. **Vérification** : ouvre https://examen-civique.mlndao.fr, puis https://examen-civique.mlndao.fr/serie-du-jour. Les deux doivent afficher le site. L'ancienne adresse github.io redirigera automatiquement vers la nouvelle.

## 2. Envoi d'e-mails avec Brevo (gratuit jusqu'à 300 e-mails par jour)

1. Crée un compte sur [brevo.com](https://www.brevo.com).
2. Dans **Senders, Domains & Dedicated IPs**, ajoute ton domaine `mlndao.fr`. Brevo te donne des enregistrements **SPF**, **DKIM** et **DMARC** : ajoute-les chez Hostinger, dans la zone DNS de `mlndao.fr`, puis attends qu'ils soient validés.
3. Crée un expéditeur sur ce domaine, par exemple `no-reply@mlndao.fr`.
4. Va dans **Settings** > **SMTP & API** > onglet **SMTP**, puis **Generate SMTP key**. Il faut bien une clé SMTP, pas une clé API.
5. Dans Supabase, va dans **Authentication** > **Emails** > **SMTP Settings** et active **Enable custom SMTP** :

   | Champ | Valeur |
   |---|---|
   | Sender email | `no-reply@mlndao.fr` |
   | Sender name | `Examen civique` |
   | Host | `smtp-relay.brevo.com` |
   | Port | `587` |
   | Username | ton identifiant SMTP Brevo (affiché sur la même page) |
   | Password | la clé SMTP générée |

6. Dans **Authentication** > **Rate Limits**, monte la limite d'e-mails à **100 par heure**. Avec le SMTP personnalisé, elle passe à 30 par défaut.
7. **Test :** inscris-toi avec une autre adresse que la tienne. Si rien n'arrive, regarde dans **Brevo** > **Transactional** > **Logs**.

## 3. E-mails en français

Dans Supabase, va dans **Authentication** > **Emails** > **Templates**. Pour chaque modèle, colle l'objet indiqué dans `supabase/emails/SUJETS.txt`, puis le contenu HTML du fichier correspondant :

| Modèle Supabase | Fichier |
|---|---|
| Confirm signup | `supabase/emails/1_confirmation_inscription.html` |
| Reset password | `supabase/emails/2_reinitialisation_mot_de_passe.html` |
| Change email address | `supabase/emails/3_changement_email.html` |
| Magic link | `supabase/emails/4_lien_de_connexion.html` |

## 4. Anti-robots (Cloudflare Turnstile, gratuit)

1. Crée un compte sur [cloudflare.com](https://dash.cloudflare.com), puis va dans **Turnstile** > **Add widget**.
2. **Hostnames :** `examen-civique.mlndao.fr` et `laminendao.github.io`. **Mode :** *Managed*.
3. Récupère les deux clés :
   - la **Site key**, publique : colle-la dans `js/config.js`, dans `turnstileSiteKey` ;
   - la **Secret key**, secrète : colle-la dans Supabase, dans **Authentication** > **Attack Protection** (ou *Bot and Abuse Protection*). Active **Enable CAPTCHA protection**, choisis **Turnstile**, puis **Save**.
4. ⚠️ Fais les deux en même temps. Si Supabase exige le CAPTCHA alors que la clé n'est pas encore dans le site, plus personne ne peut se connecter.

## 5. Sécurité du compte

- Dans **Authentication** > **Sign In / Providers** > **Email**, vérifie que **Confirm email** est activé.
- Dans **Project Settings** > **General**, vérifie que la région du projet est en Europe.
- Active la double authentification sur ton compte GitHub, ton compte Supabase et ton registrar.

## 6. Empêcher la mise en veille de Supabase

Sur l'offre gratuite, Supabase met le projet en pause après environ 7 jours sans activité. Une petite tâche GitHub automatique fait une requête deux fois par semaine pour l'éviter.

0. **Crée la tâche.** Sur GitHub, va dans le dépôt > **Add file** > **Create new file**. Nomme le fichier exactement `.github/workflows/supabase-keepalive.yml`, colle le contenu de `deploy/supabase-keepalive.yml`, puis clique sur **Commit changes**. Les dossiers qui commencent par un point ne peuvent pas être créés depuis ici, d'où cette étape manuelle.
1. Sur GitHub, va dans le dépôt > **Settings** > **Secrets and variables** > **Actions** > **New repository secret**, et crée :
   - `SUPABASE_URL` = `https://rqxohlirhgyxzokzqaha.supabase.co`
   - `SUPABASE_ANON_KEY` = ta clé publique (celle de `js/config.js`)
2. Va dans l'onglet **Actions** > **Supabase keep-alive** > **Run workflow** pour tester. La ligne doit devenir verte ✅.
3. GitHub désactive les tâches planifiées d'un dépôt sans aucun commit pendant 60 jours. Un commit de temps en temps suffit à l'éviter, et tu recevras un e-mail d'avertissement avant.

---

✅ **Quand tout est fait :** inscris-toi avec une adresse Gmail et une adresse Outlook différentes de la tienne, puis vérifie que l'e-mail arrive bien dans la boîte de réception et pas dans les spams, que le lien ramène sur ton site et que la connexion fonctionne.

## 7. Signalements d'erreurs (table `reports`)

1. Supabase > **SQL Editor** > **New query** : colle le contenu de `supabase/reports.sql`, puis **Run**.
2. Les signalements s'affichent dans **Table Editor** > `reports`. Change la colonne `status` à la main (`vu`, `corrigé`, `rejeté`) pour t'y retrouver.
3. Tant que la table n'existe pas, le bouton propose d'envoyer le signalement par e-mail à l'adresse de contact.

## 8. Mesure d'audience (GoatCounter, gratuit, sans cookies) — facultatif

1. Crée un compte sur https://www.goatcounter.com/signup et choisis un code, par exemple `examen-civique` (ton tableau de bord sera https://examen-civique.goatcounter.com).
2. Dans `js/config.js`, mets ce code : `goatcounter: "examen-civique",`.
3. La politique de confidentialité le mentionne automatiquement. Aucun bandeau de cookies n'est nécessaire.

## 9. Google (référencement)

1. Va sur https://search.google.com/search-console, ajoute la propriété « Domaine » `mlndao.fr` (vérification par un enregistrement TXT chez Hostinger, comme pour GitHub).
2. Dans **Sitemaps**, envoie `https://examen-civique.mlndao.fr/sitemap.xml`.
3. Les pages de chaque examen (`/carte-de-sejour-pluriannuelle/`, `/carte-de-resident/`, `/naturalisation/`) ont leur propre titre et description.

## 10. Avant chaque mise en ligne

```bash
python3 tools/pages.py      # pages des examens, sitemap, version du service worker
git add -A
git commit -m "…"
git push
```

Grâce au service worker, les visiteurs qui ont déjà ouvert le site reçoivent la nouvelle version dès leur visite suivante, sans attendre les 10 minutes de cache de GitHub.
