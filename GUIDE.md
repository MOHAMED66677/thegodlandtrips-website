# Guide de modification du site

Ce guide explique comment modifier les textes, les prix, les activités, les couleurs et les coordonnées, sans connaissances techniques particulières. Un simple éditeur de texte suffit (Bloc-notes, VS Code…).

## Les fichiers à connaître

| Fichier | Ce qu'il contient |
|---|---|
| `content/site.js` | Nom de l'agence, WhatsApp, e-mail, adresse, liste des activités et prix |
| `content/translations.js` | **Tous les textes** du site, en français, arabe, anglais, espagnol, allemand et néerlandais |
| `content/legal.js` | Page légale : informations officielles de l'agence et textes juridiques |
| `css/styles.css` | Couleurs et polices (tout en haut du fichier) |

Les autres fichiers (`index.html`, `js/`, `build.mjs`) n'ont normalement pas besoin d'être modifiés.

## 1. Coordonnées de l'agence

Ouvrez `content/site.js` et remplacez chaque valeur marquée `[À REMPLACER]` :

```js
agencyName: "Votre Agence",          // nom affiché en haut et en bas de page
whatsapp: "212600000000",            // numéro international, chiffres uniquement
whatsappDisplay: "+212 6 00 00 00 00",
email: "contact@votre-agence.ma",
address: "Marrakech, Maroc",         // "" pour ne pas l'afficher
siteUrl: "https://www.votre-agence.ma",
```

## 2. Modifier un texte

Ouvrez `content/translations.js`. Chaque texte a une clé, par exemple :

```js
"hero.title": "Votre séjour au Maroc, sans souci de transport",
```

Changez le texte entre guillemets **dans chacune des sept langues** (sections `fr`, `ar`, `en`, `es`, `de`, `nl`, `it`). Ne modifiez pas la clé à gauche.

- `{agency}` est remplacé automatiquement par le nom de l'agence.
- `{count}` est remplacé par le nombre d'activités.
- Si le texte contient un guillemet `"`, écrivez `\"`.

## 3. Ajouter, retirer ou modifier une activité

**a. Dans `content/site.js`**, ajoutez une ligne dans la liste `ACTIVITIES` :

```js
{ id: "surf", category: "sea", duration: "h1to2", safety: true, price: null },
```

- `id` : un mot unique, sans espace ni accent
- `category` : `"excursions"`, `"land"` (Terre), `"air"` ou `"sea"` (Mer)
- `duration` : une des durées existantes : `halfDay`, `fullDay`, `evening`, `h1to2`, `sunrise`, `onRequest`, `m30to60`
- `safety` : `true` affiche « Équipement de sécurité fourni »
- `price` : un nombre (ex. `450`) ou `null`

**b. Dans `content/translations.js`**, ajoutez le nom et la description dans les sept langues :

```js
"act.surf.name": "Surf",
"act.surf.desc": "Initiation au surf avec un moniteur, matériel compris.",
```

Pour **retirer** une activité, supprimez sa ligne dans `site.js` (les textes peuvent rester).

Pour une **nouvelle durée**, ajoutez une clé `"dur.xxx"` dans les sept langues.

## 4. Photos

Les photos actuelles sont des **photos d'exemple** gratuites (licence Unsplash, utilisation commerciale autorisée). Remplacez-les par les vraies photos de l'agence (véhicules, chauffeurs, excursions) : elles inspirent davantage confiance.

1. Placez vos photos dans le dossier `images/` (format JPG, environ **1600 px de large** pour la grande photo d'accueil, **1000 px** pour les autres, moins de 300 Ko chacune ; [squoosh.app](https://squoosh.app) permet de les alléger).
2. Dans `content/site.js`, remplacez l'identifiant par le chemin du fichier :

```js
var IMAGES = {
  hero: "images/accueil.jpg",          // grande photo d'accueil
  transfer: "images/transfert.jpg",    // carte « Transfert aéroport »
  disposal: "images/chauffeur.jpg",    // carte « Mise à disposition »
  activities: "images/excursions.jpg", // carte « Excursions et activités »
  why: "images/route-atlas.jpg",       // section « Pourquoi nous »
  contact: "images/contact.jpg"        // fond de la section contact
};
```

et pour chaque activité : `image: "images/quad.jpg"`.

Conseil : préférez des photos **horizontales**, lumineuses, avec des personnes en situation.

**Photos d'exemple hébergées sur le site.** Les photos Unsplash (identifiants `photo-…`) ne sont pas chargées depuis Unsplash : le site utilise des copies légères au format WebP, en plusieurs tailles, rangées dans `images/photos/`. Le téléphone du visiteur télécharge seulement la taille dont il a besoin. Si vous changez un identifiant `photo-…` dans `site.js`, lancez une fois :

```
python tools/photos.py
```

(il faut Pillow : `pip install pillow`). Le script télécharge les nouvelles photos et supprime celles qui ne servent plus. Sans cette étape, `node build.mjs` s'arrête et indique la photo manquante.

## 5. Google Maps

Le site utilise Google Maps **sans clé API ni compte de facturation** :

- **Section « Où allons-nous ? »** : une carte Google interactive et la liste des destinations. Un clic sur une destination déplace la carte. Les destinations se modifient dans `content/site.js`, liste `DESTINATIONS` :

```js
{ id: "ouzoud", lat: 32.0154, lng: -6.7190, zoom: 12, km: 150, minutes: 165 },
```

  - `lat` / `lng` : position GPS. Dans Google Maps, faites un clic droit sur le lieu : les coordonnées s'affichent, cliquez dessus pour les copier.
  - `km` / `minutes` : distance et temps de trajet depuis Marrakech (**valeurs indicatives à vérifier par l'agence**).
  - Le nom vient de `translations.js` (`act.<id>.name`, ou `dest.<id>` pour un lieu qui n'est pas une activité, comme l'aéroport).
- **Bouton « Voir sur la carte »** sur une fiche d'activité : ajoutez `place: "<id de la destination>"` à l'activité dans `ACTIVITIES`.
- **Formulaire de devis** : dès que le départ et la destination sont remplis, un lien « Voir l'itinéraire sur Google Maps » apparaît, et le lien de l'itinéraire est ajouté au message WhatsApp ou à l'e-mail envoyé à l'agence.
- **Adresse** : dans la section contact, elle s'ouvre dans Google Maps.
- **Avis Google** : si l'agence a une fiche Google Business Profile, copiez son lien (Google Maps > votre fiche > Partager) dans `googleBusinessUrl`. Un bouton « Avis Google » apparaît alors dans la section contact, et l'adresse ouvre votre fiche.

**Suggestions d'adresses et distance estimée (gratuit, sans clé)** : dans le formulaire, les champs « Départ » et « Destination » proposent des adresses pendant la saisie :

- d'abord les lieux fréquents (destinations de la carte + liste `PLACES` dans `content/site.js` : gare, Guéliz, Hivernage…). Ajoutez-y les hôtels ou lieux de prise en charge habituels de l'agence ;
- puis toutes les adresses du Maroc, via **Photon / OpenStreetMap** (service gratuit) ;
- quand les deux adresses sont choisies dans la liste, le formulaire affiche la **distance et le temps de trajet estimés** (service gratuit **OSRM**), qui sont aussi ajoutés au message WhatsApp/e-mail. Si ce service ne répond pas, une estimation à vol d'oiseau est utilisée.

Ces services publics sont gratuits mais prévus pour un usage modéré : c'est largement suffisant pour une agence. Si le site devient très fréquenté, l'agence pourra passer à un service payant (Google, Mapbox…) en changeant `GEOCODER_URL` / `ROUTER_URL`.

## 6. Engagements, véhicules et prix

**Engagements** (bandeau sous l'accueil, FAQ et page légale) : dans `content/site.js`, bloc `promises` :

```js
promises: {
  freeWaitingMinutes: 60,     // attente offerte à l'aéroport
  nameSign: true,             // pancarte au nom du client
  freeChildSeats: true,       // sièges enfant gratuits
  freeCancellationHours: 24   // annulation gratuite jusqu'à X h avant
},
```

Changez un chiffre ici : le bandeau, la FAQ et la page légale se mettent à jour ensemble. Mettez `0` ou `false` pour retirer un engagement (pensez alors à adapter la réponse de FAQ correspondante). **Ne promettez que ce que vous tenez à chaque fois.**

**Véhicules** : liste `VEHICLES` dans `content/site.js` (places, valises, climatisation). Pour afficher une vraie photo, mettez-la dans `images/` et indiquez `image: "images/minivan.jpg"`. Les noms et descriptions sont dans `translations.js` (`veh.sedan.name`…). Le client peut choisir un véhicule dans le formulaire ; son choix apparaît dans le message WhatsApp.

**Prix « à partir de »** : remplissez `prices` (transfert, mise à disposition) et le champ `price` de chaque activité, puis passez `showPrices: true`.

## 7. Pages des activités

Chaque activité a sa propre page dans les sept langues (91 pages), créée automatiquement par `node build.mjs` : `/activity/quad-marrakech.html` (français), `/en/activity/quad-marrakech.html`, etc. Elle reprend la photo, le nom, la description courte (`act.<id>.desc`) et la description longue (`act.<id>.long`, dans `translations.js`), la durée, ce qui est inclus, la carte (si l'activité a un `place`), le prix si `showPrices` est activé, et les liens vers 3 autres activités.

- L'adresse de la page vient du champ `slug` de l'activité dans `content/site.js`. **Ne la changez plus une fois le site connu de Google** (les anciens liens ne marcheraient plus).
- Le bouton « Demander un devis » ouvre le formulaire avec l'activité déjà choisie.
- Une nouvelle activité ajoutée à `ACTIVITIES` avec un `slug` et ses textes `act.<id>.name`, `.desc` et `.long` dans les sept langues obtient sa page toute seule.

## 8. Votre propre nom de domaine (ex. marrakechodyssey.com)

1. **Achetez le domaine** chez un registraire (Namecheap, OVH, Hostinger, Genious pour un .ma…), environ 120 à 150 MAD/an pour un .com.
2. Dans la gestion DNS du domaine, créez :
   - 4 enregistrements **A** pour `@` : `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - 1 enregistrement **CNAME** pour `www` : `mohamed66677.github.io`
3. Sur GitHub : **Settings → Pages → Custom domain** : saisissez `marrakechodyssey.com`, enregistrez, puis cochez **Enforce HTTPS** dès que c'est possible (quelques minutes à quelques heures).
4. Dans `content/site.js`, remplacez `siteUrl` par `https://marrakechodyssey.com`, puis publiez. Les aperçus de liens, le sitemap, Google et `security.txt` utilisent alors le nouveau domaine.

## 9. Foire aux questions (FAQ)

Les 8 questions/réponses sont dans `content/translations.js` (`faq.q1` / `faq.a1` … `faq.q8` / `faq.a8`), dans les sept langues. Pour ajouter une question, ajoutez `faq.q9` et `faq.a9` dans chaque langue : elle apparaît automatiquement.

⚠️ **À valider par l'agence** : les réponses sur le paiement (`faq.a5`), l'annulation (`faq.a6`) et les sièges enfant (`faq.a4`) renvoient pour l'instant « au devis ». Remplacez-les par vos vraies conditions (ex. « paiement en espèces ou par carte au chauffeur », « annulation gratuite jusqu'à 24 h avant ») dès qu'elles sont fixées.

## 10. Page légale (mentions légales, confidentialité, conditions)

La page `legal.html` existe dans les sept langues (lien en bas de chaque page et sous le formulaire). Tant qu'une information manque, elle s'affiche dans un **encadré « À compléter »**.

**Activité en cours de création** (pas encore d'entreprise) : laissez `status: "starting"` et indiquez seulement votre nom dans `ownerName`. La page affiche alors « Responsable du site », « Activité en cours de création » et la ville, et masque les numéros d'entreprise. Pensez à obtenir l'autorisation de transport touristique et une assurance adaptée **avant** d'accepter des clients payants (renseignements : CRI Marrakech-Safi ou un comptable).

**Une fois l'entreprise immatriculée** : passez à `status: "company"` et remplissez tous les champs de `LEGAL_INFO` :

```js
companyName: "Marrakech Odyssey Travel SARL",
legalForm: "SARL",
address: "N° …, Rue …, Marrakech",
rc: "…", ice: "…", taxId: "…",
director: "Prénom Nom",
tourismLicense: "…",          // autorisation de transport touristique / agence
insurance: "Assureur – police n° …",
cndp: "…",                    // déclaration auprès de la CNDP
retention:    { fr: "24 mois", ar: "24 شهرًا", en: "24 months", es: "24 meses" },
payment:      { fr: "…", ar: "…", en: "…", es: "…" },
cancellation: { fr: "…", ar: "…", en: "…", es: "…" },
waiting:      { fr: "…", ar: "…", en: "…", es: "…" },
```

Les textes eux-mêmes (sections, paragraphes) sont dans `LEGAL_TEXT`, dans le même fichier.

⚠️ **À faire vérifier** par le comptable ou un juriste de l'agence (numéros d'immatriculation, conditions d'annulation, déclaration CNDP), et les versions arabe et espagnole par un locuteur natif. Cette page a été rédigée à partir du fonctionnement réel du site, mais elle ne remplace pas un conseil juridique.

## 11. Aperçu des liens (WhatsApp, Facebook…) et référencement Google

- **Aperçu des liens** : quand quelqu'un partage le site, une carte avec le logo, une photo et le titre s'affiche, dans la langue de la page (`images/og-fr.jpg`, `og-ar.jpg`, `og-en.jpg`, `og-es.jpg`, `og-de.jpg`, `og-nl.jpg`). Pour les recréer après un changement de titre ou de photo : `python brand/make_og.py`.
- **Données structurées Google** : chaque page contient automatiquement une fiche « agence de voyage » (nom, contact, services, activités, FAQ) lisible par Google.
- ⚠️ **Indispensable** : renseignez la vraie adresse du site dans `siteUrl` (`content/site.js`), par exemple `https://marrakechodyssey.com`, **puis relancez `node build.mjs`**. Sinon l'image d'aperçu ne s'affichera pas.
- Pour vérifier une fois en ligne : [opengraph.xyz](https://www.opengraph.xyz) (aperçu des liens) et le [test des résultats enrichis Google](https://search.google.com/test/rich-results) (données structurées). WhatsApp garde l'aperçu en mémoire : un nouveau partage peut mettre quelques heures à se mettre à jour.
- **Google Search Console** (search.google.com/search-console, propriété `marrakechodyssey.com`, vérifiée par un enregistrement TXT dans Cloudflare : ne le supprimez pas) : le sitemap y est déclaré. Vous y voyez les recherches qui amènent des visiteurs et les pages indexées.
- **Bing et ChatGPT** : après chaque mise en ligne importante (nouvelle page, nouveaux prix), lancez `node tools/indexnow.mjs` : Bing (utilisé par ChatGPT) est prévenu immédiatement des 84 pages.

## 12. Statistiques de visite (gratuites, sans cookies)

Aucune statistique n'est activée par défaut. Pour en avoir, choisissez **un** service :

**GoatCounter** (recommandé : il compte aussi les clics WhatsApp et les demandes de devis)
1. Créez un compte sur [goatcounter.com](https://www.goatcounter.com), avec un code, par exemple `marrakechodyssey`.
2. Mettez ce code dans `goatcounterCode` (`content/site.js`), puis relancez `node build.mjs`.
3. Les visites et les actions apparaissent dans votre tableau de bord GoatCounter : `whatsapp-click`, `quote-sent-whatsapp-transfer`, `quote-sent-email-activity`, `quote-start-…`, `map-view-…`, `route-open-google`, `language-ar`…

**Cloudflare Web Analytics** (visites et pays uniquement, sans les clics) : créez le site dans le tableau de bord Cloudflare, puis copiez le jeton dans `cloudflareAnalyticsToken`.

Ces deux services ne déposent pas de cookies : aucun bandeau de consentement n'est nécessaire, et une mention s'ajoute automatiquement en bas de page. Vérifiez les conditions d'utilisation actuelles du service choisi.

## 13. Changer les couleurs

Tout en haut de `css/styles.css` :

```css
--color-primary: #173059;   /* bleu nuit du logo : titres, icônes, contact */
--rgb-primary: 23, 48, 89;  /* la même couleur en chiffres (pour les transparences) */
--color-action:  #D9783A;   /* orange terre cuite du logo : boutons d'action */
--color-text:    #1A2440;   /* titres et paragraphes */
...
```

Les couleurs reprennent celles du logo (bleu nuit, orange terre cuite, sable). Changez un code couleur ici et il est mis à jour sur tout le site. Si vous changez `--color-primary`, mettez aussi à jour `--rgb-primary` avec la même couleur (convertisseur : [htmlcolorcodes.com](https://htmlcolorcodes.com)). Gardez un texte foncé sur fond clair pour la lisibilité.

### Le logo

Le logo est dans `brand/my-logo/` :
- `original.webp` : votre fichier d'origine ;
- `logo-full.png` (fond transparent, pour fonds clairs) et `logo-full-white.png` (nom en blanc, pour fonds sombres) : pour les réseaux sociaux, les cartes de visite, les documents ;
- `emblem.png` : l'arche seule (en-tête du site, photo de profil) ;
- `wordmark.png` et `wordmark-white.png` : le nom seul, dans la police de votre logo (en-tête et pied de page du site : `images/wordmark.png`, `images/wordmark-white.png`) ;
- `icon.svg`, `icon-tiny.svg`, `app-icon.svg` : version simplifiée pour les petites tailles (onglet du navigateur, icône d'application).

Si vous changez le logo d'origine, relancez `python brand/my-logo/cutout.py`, recopiez `emblem.png` dans `images/logo-emblem.png`, puis `python brand/make_og.py`.

## 14. Réception des demandes de devis

Le formulaire propose deux boutons :

- **Envoyer sur WhatsApp** : ouvre WhatsApp chez le visiteur avec la demande déjà rédigée, adressée au numéro de l'agence. Rien à configurer.
- **Envoyer par e-mail** : par défaut, ouvre la messagerie du visiteur avec la demande pré-remplie.
  Pour recevoir l'e-mail **directement**, sans que le visiteur ait à appuyer sur « Envoyer » dans sa messagerie :
  1. Créez un formulaire gratuit sur [Formspree](https://formspree.io) avec l'adresse e-mail de l'agence.
  2. Copiez l'adresse fournie (ex. `https://formspree.io/f/abcdwxyz`) dans `formEndpoint` (dans `content/site.js`).
  (Avec Web3Forms : `formEndpoint: "https://api.web3forms.com/submit"` et la clé dans `formAccessKey`.)

Seules les informations utiles sont demandées (service, trajet, date, passagers, nom, contact), et une mention de confidentialité est affichée.

## 15. Voir le site et le mettre en ligne

**Voir le site en local :** double-cliquez sur `index.html`.

**Préparer la mise en ligne** (une fois Node.js installé) :

```bash
node build.mjs
```

Cette commande crée un dossier `dist/` contenant une page par langue (`/`, `/ar/`, `/en/`, `/es/`), avec un titre et une description propres à chaque langue pour les moteurs de recherche, ainsi qu'un `sitemap.xml`.

**Mettre en ligne :** envoyez le contenu du dossier `dist/` sur votre hébergeur. Avec Netlify, il suffit de glisser-déposer le dossier sur [app.netlify.com/drop](https://app.netlify.com/drop).

⚠️ Relancez `node build.mjs` après **chaque** modification, avant de remettre le site en ligne.

## 16. Avis clients

La section « Ce que disent nos voyageurs » reste **cachée tant qu'il n'y a aucun avis**. Elle apparaît dès que vous ajoutez le premier.

⚠️ **Uniquement de vrais avis**, recopiés mot pour mot (Google, TripAdvisor, ou un message WhatsApp d'un client qui a accepté d'être cité). Publier de faux avis est interdit (loi marocaine sur la protection du consommateur, et règles européennes pour vos clients européens) et fait perdre la confiance des visiteurs.

**Ajouter un avis** : dans `content/site.js`, liste `REVIEWS`, ajoutez une ligne :

```js
var REVIEWS = [
  { name: "Sarah M.", country: "GB", rating: 5, date: "2026-10", lang: "en",
    text: "Our driver was waiting with a sign at 2am. Spotless car, fair price.",
    activity: "agafay", source: "Google" },
];
```

- `name` : prénom + initiale seulement (protection de la vie privée)
- `country` : code du pays en 2 lettres (GB, FR, ES, DE, NL, MA, US, IT…) : le nom du pays s'affiche dans la langue du visiteur
- `rating` : de 1 à 5 étoiles ; `date` : année-mois
- `lang` : langue dans laquelle l'avis a été écrit. L'avis n'est pas traduit : le site indique « Écrit en anglais », etc.
- `activity` (facultatif) : l'avis s'affiche aussi sur la page de cette activité
- `source` (facultatif) : Google, TripAdvisor ou WhatsApp

Les 6 avis les plus récents s'affichent sur l'accueil (à faire glisser sur téléphone). À partir de **3 avis**, la note moyenne s'affiche aussi sous les boutons de l'accueil.

**Bouton « Laisser un avis »** : dans votre fiche Google Business Profile, cliquez sur « Demander des avis », copiez le lien (`g.page/r/…/review`) et collez-le dans `googleReviewUrl`. Si `googleBusinessUrl` est rempli, un bouton « Voir tous les avis sur Google » s'affiche aussi.

### Message à envoyer au client après le trajet

Envoyez-le par WhatsApp le soir même ou le lendemain (c'est là que les clients répondent le plus). Remplacez `[prénom]` et `[lien]` par le prénom du client et votre lien `googleReviewUrl`.

**Français**
> Bonjour [prénom], merci d'avoir voyagé avec Marrakech Odyssey Travel ! J'espère que tout s'est bien passé. Si vous avez une minute, votre avis nous aiderait beaucoup : [lien]. Bon séjour au Maroc !

**العربية**
> مرحبًا [prénom]، شكرًا لاختيارك Marrakech Odyssey Travel! أتمنى أن تكون رحلتك قد مرّت على ما يرام. إذا كان لديك دقيقة، فرأيك يساعدنا كثيرًا: [lien]. إقامة سعيدة في المغرب!

**English**
> Hi [prénom], thank you for travelling with Marrakech Odyssey Travel! I hope everything went well. If you have a minute, a short review would help us a lot: [lien]. Enjoy the rest of your stay in Morocco!

**Español**
> Hola [prénom], ¡gracias por viajar con Marrakech Odyssey Travel! Espero que todo haya ido bien. Si tiene un minuto, su opinión nos ayudaría mucho: [lien]. ¡Que disfrute de Marruecos!

**Deutsch**
> Hallo [prénom], vielen Dank, dass Sie mit Marrakech Odyssey Travel unterwegs waren! Ich hoffe, alles hat gut geklappt. Wenn Sie eine Minute Zeit haben, würde uns eine kurze Bewertung sehr helfen: [lien]. Genießen Sie Ihren Aufenthalt in Marokko!

**Nederlands**
> Hallo [prénom], bedankt dat u met Marrakech Odyssey Travel heeft gereisd! Ik hoop dat alles goed is verlopen. Als u even tijd heeft, zou een korte review ons erg helpen: [lien]. Geniet nog van Marokko!

**Italiano**
> Buongiorno [prénom], grazie per aver viaggiato con Marrakech Odyssey Travel! Spero che sia andato tutto bene. Se ha un minuto, una breve recensione ci aiuterebbe molto: [lien].

Quand un client répond par un compliment sur WhatsApp, demandez-lui : « Puis-je publier votre message sur notre site, avec votre prénom ? ». S'il accepte, ajoutez-le avec `source: "WhatsApp"`.

## 17. Guides de voyage (articles) et référencement par l'IA

**Les guides** sont dans `content/guides.js` : 5 articles en 7 langues (aéroport → médina, Agafay ou Merzouga, excursions d'une journée, que porter pour le quad, arriver de nuit). `node build.mjs` crée automatiquement :
- une page par guide et par langue : `/guides/marrakech-airport-to-medina.html`, `/en/guides/…` (30 pages) ;
- une page « Guides de voyage » par langue : `/guides/` ;
- la section « Avant de partir » sur l'accueil (les 3 premiers guides) et un lien dans le pied de page.

Pour **ajouter un guide**, copiez un bloc `{ id: …, slug: …, … }` dans `GUIDES`, changez `id`, `slug`, `image`, `related` (les activités liées) et écrivez les textes des 6 langues : `t` (titre), `d` (résumé), `facts` (3 points clés) et `s` (les parties : titre puis paragraphes). Restez factuel : évitez les prix qui changent souvent.

**Pour l'IA (ChatGPT, Gemini, Perplexity, Claude…)** :
- `llms.txt` (à la racine du site) est généré automatiquement : un résumé clair de l'agence (services, zones, horaires, distances, pages et guides).
- Les **zones desservies** et l'**ouverture 24 h/24** sont dans `content/site.js` (`serviceAreas`, `open24h`). Gardez-les **identiques à votre fiche Google Business Profile** : Google fait davantage confiance à un site et une fiche qui disent la même chose.
- Après une mise en ligne, lancez `node tools/indexnow.mjs` pour prévenir Bing (et donc ChatGPT) des nouvelles pages.

## Avant la mise en ligne

- [ ] Toutes les valeurs `[À REMPLACER]` sont renseignées dans `content/site.js`
- [ ] Les photos d'exemple ont été remplacées par celles de l'agence
- [ ] Les distances et temps de trajet de la carte ont été vérifiés
- [ ] Les réponses de la FAQ (paiement, annulation, sièges enfant) ont été validées
- [ ] La page légale ne contient plus aucun encadré « À compléter » et a été relue par un comptable ou un juriste
- [ ] `siteUrl` contient la vraie adresse du site (sinon pas d'aperçu des liens)
- [ ] Le partage d'un lien sur WhatsApp affiche bien l'aperçu
- [ ] La liste des activités et les durées ont été validées par l'agence
- [ ] Les sept langues ont été relues par un locuteur natif
- [ ] Une demande test a été envoyée par WhatsApp **et** par e-mail
- [ ] Le site a été testé sur un téléphone
