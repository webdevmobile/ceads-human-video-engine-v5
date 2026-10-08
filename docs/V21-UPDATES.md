# V21 — Aperçus vidéo automatiques et optimisation

## Comportement

- Toutes les zones vidéo peuvent afficher un aperçu vidéo automatique, muet et inline.
- La VSL du Hero démarre son aperçu immédiatement.
- Les autres aperçus démarrent avant d'entrer dans le viewport et sont préparés progressivement en arrière-plan sur les connexions normales.
- Sur une connexion 2G / économie de données, le site évite de charger massivement les vidéos hors écran afin de préserver la vitesse.
- Un clic sur la vidéo ou sur Play remplace l'aperçu muet par le lecteur interactif et relance la vidéo depuis le début avec le son demandé.
- Aucun message « Chargement de la vidéo » n'est affiché.

## Performance

- Préconnexion automatique uniquement vers les plateformes réellement utilisées dans `CEADS_VIDEO_URLS`.
- Wistia : oEmbed est résolu en arrière-plan, ratio et miniature native préparés avant interaction.
- YouTube : miniature native préparée automatiquement hors VSL lorsque l'ID est disponible.
- Les previews sont sans contrôles et non interactives : toute la zone reste cliquable.
- Les lecteurs restent strictement dans leur cadre parent sans crop forcé.

## Limites externes

Les règles d'autoplay et d'embed restent imposées par le navigateur et par la plateforme vidéo. L'aperçu muet est le mode le plus compatible. La lecture avec son est demandée après un vrai clic utilisateur.
