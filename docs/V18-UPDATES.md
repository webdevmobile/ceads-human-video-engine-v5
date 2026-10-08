# V18 — Liens vidéo directement dans le code source

- Suppression de `CONFIGURER-VIDEOS.html`.
- Suppression de `assets/js/videos.js`.
- Suppression de la sauvegarde locale des URL vidéo.
- Les liens sont maintenant saisis directement dans `index.html`, dans le bloc `window.CEADS_VIDEO_URLS`.
- Le moteur vidéo conserve la lecture inline de la V17 : aucune redirection et aucun popup.
