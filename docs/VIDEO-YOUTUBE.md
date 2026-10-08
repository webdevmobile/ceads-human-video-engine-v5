# Vidéos — fonctionnement V11

## Configuration la plus simple

Vous n'avez plus besoin d'ouvrir un éditeur de code.

Double-cliquez sur :

`CONFIGURER-VIDEOS.html`

Collez les liens puis cliquez sur **Enregistrer dans ce navigateur**.

Le configurateur peut aussi télécharger un fichier `videos.js` prêt à être placé dans `assets/js/` pour une publication définitive.

## Un seul clic sur la miniature

La totalité de chaque miniature vidéo est cliquable.

Le premier clic :

- remplace immédiatement la miniature par le lecteur lorsque la plateforme autorise l'intégration ;
- demande l'autoplay et le son ;
- ouvre directement la vidéo originale lorsque l'intégration locale n'est pas fiable.

## YouTube et le mode index.html / file://

Depuis 2025, YouTube peut retourner l'erreur 153 lorsque le lecteur intégré ne reçoit pas de `HTTP Referer` ou d'identification client équivalente.

Un fichier HTML ouvert directement depuis le disque n'envoie pas un Referer HTTP normal. Un navigateur web standard ne permet pas à JavaScript de fabriquer ce header pour un iframe YouTube.

La V11 évite donc l'erreur :

- en `file://`, le clic ouvre directement la vidéo YouTube ;
- sur un vrai domaine `http://` / `https://`, le lecteur YouTube reste intégré dans la page avec `autoplay=1`, `mute=0`, `origin` et `widget_referrer`.

Vous n'avez donc plus besoin d'un serveur local pour utiliser la page.

## Facebook

Le plugin Facebook peut imposer son propre bouton Play et ses propres règles d'autoplay. Pour éviter le double clic pendant une utilisation directe en `file://`, la V11 ouvre la vidéo Facebook au premier clic.

## Vidéo directe MP4 / WebM

C'est le mode le plus prévisible si vous voulez absolument :

- lecture dans la page ;
- un seul clic ;
- son activé ;
- aucun lecteur tiers.

Utilisez une URL publique se terminant directement par `.mp4` ou `.webm`.

## Formats de liens YouTube reconnus

- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/shorts/VIDEO_ID`
- `https://www.youtube.com/live/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
