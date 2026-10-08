# Responsive — CEADS Human Video Engine

La V7 renforce la gestion de l'axe X afin d'empêcher le scroll horizontal parasite sur mobile.

## Breakpoints principaux

- Desktop : > 1024 px
- Tablette : 821–1024 px
- Tablette portrait : 641–820 px
- Mobile : <= 640 px
- Petits Android : <= 390 px

## Corrections V7

- `html` et `body` sont limités à 100 % de largeur avec overflow horizontal masqué ;
- les sections et grilles ne peuvent plus dépasser la largeur du viewport ;
- les images, vidéos, iframes et mockups restent à l'intérieur de leur conteneur ;
- les cartes passent en une colonne sur mobile ;
- les CTA prennent la largeur disponible ;
- le composant de notification flottante est limité à environ 300 px sur mobile ;
- le texte centré des placeholders vidéo a été corrigé pour ne plus déborder latéralement.
