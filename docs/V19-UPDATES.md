# V19 — Correction des liens publics Wistia /s/

## Correction principale

Les liens publics Wistia de type :

```text
https://votrecompte.wistia.com/s/xxxxxxxxxxxx
```

sont désormais reconnus automatiquement.

Contrairement aux liens `/medias/<hashed-id>`, la valeur après `/s/` est un **slug de partage** et non le hashed ID utilisable directement dans l'iframe Wistia. La V19 résout automatiquement ce slug avec l'endpoint officiel Wistia oEmbed, puis lance la vidéo dans son cadre sur la page.

## Compatibilité file://

La résolution utilise JSONP, ce qui permet de fonctionner même lorsque `index.html` est ouvert directement depuis l'ordinateur, sans serveur local.

## Formats Wistia reconnus

- `/s/<slug>`
- `/medias/<hashed-id>`
- `/m/<hashed-id>`
- `fast.wistia.net/embed/iframe/<hashed-id>`
- liens `wi.st` compatibles
- paramètre `wvideo=<hashed-id>`

Les URL copiées sous une forme échappée comme `https\://...` sont également normalisées automatiquement.

## Important

Un lien `/s/` Wistia doit rester public et déverrouillé pour pouvoir être résolu par Wistia oEmbed.
