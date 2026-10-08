# V23 — Fast Start Mobile

- Suppression du rendu différé `content-visibility` pour éviter les sections qui apparaissent tard au scroll.
- Toutes les images statiques sont demandées dès l'ouverture; les images sous la ligne de flottaison restent en priorité réseau basse.
- Préparation vidéo déclenchée beaucoup plus tôt avant l'entrée dans le viewport.
- Wistia oEmbed dédupliqué par URL et mis en cache dans `sessionStorage`.
- Wistia/Vimeo préchauffés après le premier rendu.
- Vimeo démarre en qualité initiale adaptée aux connexions lentes et utilise un preload plus prudent.
- YouTube passe par `youtube-nocookie.com` avec referrer explicite pour réduire certains échecs d'embed.
- Au clic, le même lecteur est conservé; le poster reste jusqu'à ce que le player soit prêt, donc aucun flash.
- Les contrôles natifs du player ne sont plus interceptés par le parent une fois la vidéo active.
- Les preuves de démonstration sont visibles en environnement local, localhost et IP privée (LAN), mais restent absentes d'un domaine public sans vrais achats.
- Tailles des moyens de paiement et du logo de footer corrigées.
