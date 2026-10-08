# V22 — Performance + vidéo sans rechargement visuel

## Changements principaux

- Suppression du texte « Aperçu automatique sans son ».
- Le message conservé est : « Clique sur la vidéo pour la reprendre depuis le début avec le son ».
- Wistia utilise le player Aurora et conserve le même lecteur lors du passage aperçu → lecture normale.
- Vimeo conserve le même iframe et est piloté par son Player SDK quand disponible.
- YouTube conserve le même iframe et reçoit les commandes seek / unmute / play via son API iframe.
- Les fichiers vidéo directs conservent le même élément `<video>`.
- Aucun remplacement systématique du lecteur au clic : suppression du flash/rechargement qui changeait visuellement la couleur du cadre.
- Chargement des previews limité à proximité du viewport.
- 1 preview simultanée sur réseau lent, 2 sur réseau normal.
- Mise en pause des previews hors écran.
- Les métadonnées Wistia secondaires ne sont plus toutes récupérées au chargement initial.
- Préconnexion réseau limitée au contenu critique.

## Images et poids de la page

Les images lourdes ont été redimensionnées et converties en WebP.
Le dossier `assets/` est passé d’environ 38 Mo dans la version reçue à environ 1,6 Mo dans V22.

## Netlify

Un fichier `_headers` ajoute une politique de cache pour les assets statiques.
