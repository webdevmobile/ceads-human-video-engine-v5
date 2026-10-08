# V12 — Vidéos sans sortie du tunnel

Cette version supprime les redirections externes des blocs vidéo.

## Comportement

- clic sur la miniature ou sur le bouton Play = le lecteur est chargé sur la page de vente ;
- Hero et VSL : lecture directement dans leur cadre ;
- autres formats : lecture dans la fenêtre vidéo de la page ;
- aucun `window.open()` n'est utilisé pour les vidéos ;
- les URLs directes MP4/WebM utilisent le lecteur HTML5 avec autoplay, son activé et contrôles ;
- Vimeo, Wistia et Facebook sont chargés dans des iframes sur la page avec autoplay demandé ;
- une plateforme inconnue est également tentée dans une iframe locale à la page au lieu d'ouvrir un nouvel onglet.

## YouTube et index.html ouvert directement

Depuis 2025, YouTube peut retourner l'erreur 153 lorsque son iframe n'obtient pas un `HTTP Referer` valide. Un document ouvert avec `file://` n'a pas de Referer HTTP réel. La V12 ne redirige plus vers YouTube : elle tente toujours la lecture dans la page.

Sur un vrai domaine HTTP/HTTPS, le script ajoute automatiquement `origin` et `widget_referrer`, ce qui est le mode normal recommandé pour le lecteur intégré.

## Où modifier les URLs

Double-cliquer sur `CONFIGURER-VIDEOS.html`, puis coller les liens et enregistrer. Aucun éditeur de code n'est nécessaire pour la prévisualisation dans le navigateur.
