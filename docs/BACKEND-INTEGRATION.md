# Notifications d'achat et synchronisation des paliers

Le paiement de la page ne passe pas par un backend CEADS : les CTA redirigent directement vers le checkout Chariow configuré dans `assets/js/config.js`.

## Notifications d'achat

Le frontend contient déjà :

- le composant visuel de notification ;
- une rotation environ toutes les 30 secondes ;
- l'avatar par initiale ;
- le pays et le code pays ;
- le calcul du vrai temps écoulé ;
- le badge « Vérifié par CEADS ».

Pour les notifications dynamiques, vous pouvez connecter un endpoint optionnel :

`GET /api/purchases?limit=30`

Exemple de réponse :

```json
{
  "purchases": [
    {
      "name": "Jonathan",
      "country": "Cameroun",
      "countryCode": "CM",
      "purchasedAt": "2026-10-02T13:05:00+01:00"
    }
  ]
}
```

Cet endpoint ne sert PAS au paiement. Il sert uniquement à alimenter la preuve sociale avec des achats réels.

## Paliers de prix + Chariow

La page affiche :

- 1–20 → 10 000 FCFA
- 21–40 → 15 000 FCFA
- 41–60 → 25 000 FCFA
- 61–80 → 50 000 FCFA
- 81+ → 100 000 FCFA

Comme le paiement est délégué à une page Chariow externe, le prix réellement facturé dépend du checkout Chariow. Au moment d'un changement de palier, il faut donc s'assurer que le prix du checkout Chariow correspond au prix affiché sur la landing page, ou utiliser le lien Chariow prévu pour le nouveau palier.
