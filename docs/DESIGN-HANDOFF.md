# Design handoff — CEADS Human Video Engine

## Source Figma

https://www.figma.com/design/M4uWwUeNcxaxsduwgEturc

## Direction visuelle

Dark premium, sobre, lisible, inspiré du système visuel CEADS.

### Couleurs

- Base : `#08111F`
- Surface : `#0B1426`
- Surface élevée : `#101C33`
- Engine Blue : `#175CFF`
- Ignition Orange : `#FF5A24`
- Signal Cyan : `#28C7FA`
- Texte principal : `#FFFFFF`
- Texte secondaire : `#9FB0C9`
- Bordure : `#21304A`

### Typographies

- Titres : Space Grotesk
- Corps / UI : Inter
- Données / micro-labels : IBM Plex Mono

Les polices sont appelées depuis Google Fonts ; aucun fichier de police n’est inclus dans le projet.

## Responsive

- Desktop : design centré autour d’un contenu de 1180 px
- Tablette : grilles 4 colonnes → 2 colonnes, blocs complexes empilés
- Mobile : contenu en une colonne, navigation repliée, CTA larges, typographie adaptée

## Interactions

- menu mobile ;
- ancres avec scroll fluide ;
- FAQ native via `<details>` ;
- reveal au scroll ;
- système de pricing dynamique ;
- notifications d’achat flottantes.

## Composant notification

Référence fournie dans `trustpulse-reference.jpg`.

Adaptation :

- même logique de carte pilule blanche ;
- avatar à gauche = première lettre du prénom ;
- ligne 1 : `Jonathan, Cameroun, CM` ;
- ligne 2 : `vient juste de rejoindre la formation` ;
- ligne 3 : `Il y a 1 h · ✓ Vérifié par CEADS`.
