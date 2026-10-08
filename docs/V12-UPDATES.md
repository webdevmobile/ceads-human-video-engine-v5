# V12 — Mise à jour

- Suppression totale des redirections vidéo vers YouTube, Facebook ou d'autres plateformes.
- Toutes les vidéos restent dans le tunnel de vente.
- YouTube est tenté en iframe même en mode `file://` au lieu d'ouvrir un nouvel onglet.
- Facebook est intégré dans le plugin vidéo sur la page, y compris en mode fichier local.
- URLs vidéo directes : autoplay avec son activé demandé au premier clic.
- Plateformes inconnues : tentative d'iframe sur la page, jamais de `window.open()`.
- Les miniatures Hero et VSL de la V11 sont conservées.
