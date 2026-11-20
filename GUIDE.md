# Guide de modification du site

Ce guide explique comment modifier les textes, les prix, les activités, les couleurs et les coordonnées, sans connaissances techniques particulières. Un simple éditeur de texte suffit (Bloc-notes, VS Code…).

## Les fichiers à connaître

| Fichier | Ce qu'il contient |
|---|---|
| `content/site.js` | Nom de l'agence, WhatsApp, e-mail, adresse, liste des activités et prix |
| `content/translations.js` | **Tous les textes** du site, en français, arabe, anglais et espagnol |
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

Changez le texte entre guillemets **dans chacune des quatre langues** (sections `fr`, `ar`, `en`, `es`). Ne modifiez pas la clé à gauche.

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

**b. Dans `content/translations.js`**, ajoutez le nom et la description dans les quatre langues :

```js
"act.surf.name": "Surf",
"act.surf.desc": "Initiation au surf avec un moniteur, matériel compris.",
```

Pour **retirer** une activité, supprimez sa ligne dans `site.js` (les textes peuvent rester).

Pour une **nouvelle durée**, ajoutez une clé `"dur.xxx"` dans les quatre langues.

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

## 6. Foire aux questions (FAQ)

Les 8 questions/réponses sont dans `content/translations.js` (`faq.q1` / `faq.a1` … `faq.q8` / `faq.a8`), dans les quatre langues. Pour ajouter une question, ajoutez `faq.q9` et `faq.a9` dans chaque langue : elle apparaît automatiquement.

⚠️ **À valider par l'agence** : les réponses sur le paiement (`faq.a5`), l'annulation (`faq.a6`) et les sièges enfant (`faq.a4`) renvoient pour l'instant « au devis ». Remplacez-les par vos vraies conditions (ex. « paiement en espèces ou par carte au chauffeur », « annulation gratuite jusqu'à 24 h avant ») dès qu'elles sont fixées.

## 7. Page légale (mentions légales, confidentialité, conditions)

La page `legal.html` existe dans les quatre langues (lien en bas de chaque page et sous le formulaire). Tant qu'une information manque, elle s'affiche dans un **encadré « À compléter »**.

**Activité en cours de création** (pas encore d'entreprise) : laissez `status: "starting"` et indiquez seulement votre nom dans `ownerName`. La page affiche alors « Responsable du site », « Activité en cours de création » et la ville, et masque les numéros d'entreprise. Pensez à obtenir l'autorisation de transport touristique et une assurance adaptée **avant** d'accepter des clients payants (renseignements : CRI Marrakech-Safi ou un comptable).

**Une fois l'entreprise immatriculée** : passez à `status: "company"` et remplissez tous les champs de `LEGAL_INFO` :

```js
companyName: "TheGodLandTrips SARL",
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

## 8. Aperçu des liens (WhatsApp, Facebook…) et référencement Google

- **Aperçu des liens** : quand quelqu'un partage le site, une carte avec le logo, une photo et le titre s'affiche, dans la langue de la page (`images/og-fr.jpg`, `og-ar.jpg`, `og-en.jpg`, `og-es.jpg`). Pour les recréer après un changement de titre ou de photo : `python brand/make_og.py`.
- **Données structurées Google** : chaque page contient automatiquement une fiche « agence de voyage » (nom, contact, services, activités, FAQ) lisible par Google.
- ⚠️ **Indispensable** : renseignez la vraie adresse du site dans `siteUrl` (`content/site.js`), par exemple `https://thegodlandtrips.netlify.app` ou votre nom de domaine, **puis relancez `node build.mjs`**. Sinon l'image d'aperçu ne s'affichera pas.
- Pour vérifier une fois en ligne : [opengraph.xyz](https://www.opengraph.xyz) (aperçu des liens) et le [test des résultats enrichis Google](https://search.google.com/test/rich-results) (données structurées). WhatsApp garde l'aperçu en mémoire : un nouveau partage peut mettre quelques heures à se mettre à jour.

## 9. Statistiques de visite (gratuites, sans cookies)

Aucune statistique n'est activée par défaut. Pour en avoir, choisissez **un** service :

**GoatCounter** (recommandé : il compte aussi les clics WhatsApp et les demandes de devis)
1. Créez un compte sur [goatcounter.com](https://www.goatcounter.com), avec un code, par exemple `thegodlandtrips`.
2. Mettez ce code dans `goatcounterCode` (`content/site.js`), puis relancez `node build.mjs`.
3. Les visites et les actions apparaissent dans votre tableau de bord GoatCounter : `whatsapp-click`, `quote-sent-whatsapp-transfer`, `quote-sent-email-activity`, `quote-start-…`, `map-view-…`, `route-open-google`, `language-ar`…

**Cloudflare Web Analytics** (visites et pays uniquement, sans les clics) : créez le site dans le tableau de bord Cloudflare, puis copiez le jeton dans `cloudflareAnalyticsToken`.

Ces deux services ne déposent pas de cookies : aucun bandeau de consentement n'est nécessaire, et une mention s'ajoute automatiquement en bas de page. Vérifiez les conditions d'utilisation actuelles du service choisi.

## 10. Afficher les prix

1. Dans `content/site.js`, renseignez `price` pour chaque activité (ex. `price: 450`).
2. Passez `showPrices: false` à `showPrices: true`.
3. Vérifiez la devise : `currency: "MAD"`.

« À partir de 450 MAD » s'affiche alors sur les fiches qui ont un prix.

## 11. Changer les couleurs

Tout en haut de `css/styles.css` :

```css
--color-primary: #A13A26;   /* rouge de Marrakech : bandeau, icônes, contact */
--rgb-primary: 161, 58, 38; /* la même couleur en chiffres (pour les transparences) */
--color-action:  #F0A63A;   /* ambre safran : boutons d'action */
--color-text:    #2B1915;   /* titres et paragraphes */
...
```

Changez un code couleur ici et il est mis à jour sur tout le site. Si vous changez `--color-primary`, mettez aussi à jour `--rgb-primary` avec la même couleur (convertisseur : [htmlcolorcodes.com](https://htmlcolorcodes.com)). Gardez un texte foncé sur fond clair pour la lisibilité.

## 12. Réception des demandes de devis

Le formulaire propose deux boutons :

- **Envoyer sur WhatsApp** : ouvre WhatsApp chez le visiteur avec la demande déjà rédigée, adressée au numéro de l'agence. Rien à configurer.
- **Envoyer par e-mail** : par défaut, ouvre la messagerie du visiteur avec la demande pré-remplie.
  Pour recevoir l'e-mail **directement**, sans que le visiteur ait à appuyer sur « Envoyer » dans sa messagerie :
  1. Créez un formulaire gratuit sur [Formspree](https://formspree.io) avec l'adresse e-mail de l'agence.
  2. Copiez l'adresse fournie (ex. `https://formspree.io/f/abcdwxyz`) dans `formEndpoint` (dans `content/site.js`).
  (Avec Web3Forms : `formEndpoint: "https://api.web3forms.com/submit"` et la clé dans `formAccessKey`.)

Seules les informations utiles sont demandées (service, trajet, date, passagers, nom, contact), et une mention de confidentialité est affichée.

## 13. Voir le site et le mettre en ligne

**Voir le site en local :** double-cliquez sur `index.html`.

**Préparer la mise en ligne** (une fois Node.js installé) :

```bash
node build.mjs
```

Cette commande crée un dossier `dist/` contenant une page par langue (`/`, `/ar/`, `/en/`, `/es/`), avec un titre et une description propres à chaque langue pour les moteurs de recherche, ainsi qu'un `sitemap.xml`.

**Mettre en ligne :** envoyez le contenu du dossier `dist/` sur votre hébergeur. Avec Netlify, il suffit de glisser-déposer le dossier sur [app.netlify.com/drop](https://app.netlify.com/drop).

⚠️ Relancez `node build.mjs` après **chaque** modification, avant de remettre le site en ligne.

## Avant la mise en ligne

- [ ] Toutes les valeurs `[À REMPLACER]` sont renseignées dans `content/site.js`
- [ ] Les photos d'exemple ont été remplacées par celles de l'agence
- [ ] Les distances et temps de trajet de la carte ont été vérifiés
- [ ] Les réponses de la FAQ (paiement, annulation, sièges enfant) ont été validées
- [ ] La page légale ne contient plus aucun encadré « À compléter » et a été relue par un comptable ou un juriste
- [ ] `siteUrl` contient la vraie adresse du site (sinon pas d'aperçu des liens)
- [ ] Le partage d'un lien sur WhatsApp affiche bien l'aperçu
- [ ] La liste des activités et les durées ont été validées par l'agence
- [ ] Les quatre langues ont été relues par un locuteur natif
- [ ] Une demande test a été envoyée par WhatsApp **et** par e-mail
- [ ] Le site a été testé sur un téléphone
