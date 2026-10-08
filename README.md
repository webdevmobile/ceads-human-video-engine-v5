# CEADS Human Video Engine — Page de vente V22

Version statique, responsive et optimisée pour Netlify, desktop, tablette et mobile.

## Ajouter / remplacer les vidéos

Ouvre `index.html` et cherche :

`CEADS — LIENS VIDÉOS : MODIFIE UNIQUEMENT CE BLOC`

Colle ensuite l’URL publique dans `window.CEADS_VIDEO_URLS`.

Plateformes prises en charge :
- Wistia, y compris les liens publics `/s/...`
- Vimeo
- YouTube
- Facebook public
- fichiers vidéo directs MP4 / WebM / OGG / MOV / M4V

## Comportement vidéo V22

- aperçu automatique muet à proximité de l’écran ;
- la VSL est prioritaire ;
- les vidéos hors écran ne sont plus toutes chargées en même temps ;
- le nombre de chargements simultanés est réduit sur réseau 2G / 3G / économie de données ;
- lors du clic, le lecteur déjà chargé est conservé au lieu d’être remplacé ;
- YouTube, Vimeo, Wistia et les fichiers directs repartent depuis le début avec le son demandé, sans recréer leur lecteur ;
- les aperçus hors écran sont mis en pause pour économiser data, CPU et batterie ;
- le texte sous les vidéos est : « Clique sur la vidéo pour la reprendre depuis le début avec le son ».

## Optimisations de performance

Les gros PNG/JPG précédents ont été convertis et redimensionnés en WebP. Les assets statiques de la page sont passés d’environ 38 Mo à environ 1,6 Mo dans cette version de travail.

Autres optimisations :
- images hors écran en lazy loading + décodage asynchrone ;
- dimensions explicites des images pour limiter les sauts de mise en page ;
- polices Google chargées sans bloquer le premier affichage ;
- rendu des sections hors écran différé sur les navigateurs compatibles ;
- préconnexion vidéo limitée au contenu critique ;
- fichier `_headers` fourni pour la mise en cache des assets sur Netlify.

## Checkout

Les CTA utilisant la classe `js-checkout` continuent d’utiliser le lien configuré dans `assets/js/config.js`.

## Notifications d’achat

Configuration : `assets/js/config.js` → `purchaseNotifications`.

## V23 — Fast Start Mobile
Cette version privilégie un affichage statique immédiat, des images mobiles plus légères, une préparation vidéo anticipée, la reprise sans flash du même lecteur, des contrôles natifs stables et des retries en cas d'échec réseau transitoire.
