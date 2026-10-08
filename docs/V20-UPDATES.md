# V20 — Lecteur Wistia natif

## Modifications
- Suppression du message « Chargement de la vidéo… ».
- Préchargement silencieux des métadonnées Wistia dès l'ouverture de la page.
- Les liens Wistia `/s/...` sont résolus en arrière-plan via oEmbed JSONP, y compris en `file://`.
- Toutes les vidéos Wistia utilisent automatiquement leur miniature Wistia par défaut, sauf la VSL qui conserve sa miniature CEADS personnalisée.
- Le ratio réel de chaque vidéo Wistia est récupéré et appliqué au cadre parent.
- Le lecteur Wistia occupe exactement 100 % du cadre, sans crop du lecteur ni des contrôles.
- Au clic, le lecteur reste inline sur la page et démarre avec autoplay demandé.

## Ajout des liens
Les liens restent à coller directement dans `index.html`, dans `window.CEADS_VIDEO_URLS`.
