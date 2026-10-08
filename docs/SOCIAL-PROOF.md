# Notifications flottantes — CEADS

Le composant de preuve sociale n'est plus affiché dans une section de la page.
Il apparaît uniquement en bas à gauche, sous forme compacte et lisible.

## Comportement

- première apparition quelques secondes après le chargement ;
- rotation toutes les 30 secondes ;
- disparition automatique après quelques secondes ;
- responsive sur desktop, tablette et mobile ;
- avatar par initiale, prénom, pays, code pays et temps écoulé.

## Données

Dans `assets/js/config.js` :

- `purchases` est réservé aux vrais achats ;
- `endpoint` permet de charger de vrais achats depuis un endpoint ;
- `samplePurchases` contient 15 profils de prévisualisation locale.

Les profils de `samplePurchases` ne sont utilisés que lorsque la page tourne en `file://`, `localhost` ou `127.0.0.1`. Ils ne s'affichent pas sur un domaine public.

Les durées de prévisualisation sont volontairement variées : quelques minutes, 32 minutes, plusieurs heures, 14 heures, 1 jour, 2 jours, etc.


## V9 — profils de prévisualisation
Le projet contient désormais 30 profils fictifs de prévisualisation locale afin de tester la rotation visuelle. Ils ne sont jamais utilisés sur un domaine public : en production, utilisez uniquement de vrais achats via `purchases` ou `endpoint`.
