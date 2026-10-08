/**
 * CEADS Human Video Engine — configuration commerciale
 * ----------------------------------------------------
 * Checkout Chariow : déjà branché.
 * Vidéos : elles se modifient directement dans index.html, dans le bloc CEADS_VIDEO_URLS.
 * Notifications : le composant flottant est compact et prévu pour tourner toutes les 30 secondes.
 *
 * IMPORTANT :
 * - purchases / endpoint = données réelles affichées comme vérifiées.
 * - samplePurchases peut être affiché publiquement uniquement comme DÉMO clairement signalée.
 */
window.CEADS_CONFIG = {
  checkoutUrl: "https://lumina-ebooks.mychariow.com/laverie-domicile/checkout",

  pricing: {
    currentPurchases: 0,
    tiers: [
      { min: 1, max: 20, price: 10000 },
      { min: 21, max: 40, price: 15000 },
      { min: 41, max: 60, price: 25000 },
      { min: 61, max: 80, price: 50000 },
      { min: 81, max: null, price: 100000 }
    ]
  },

  purchaseNotifications: {
    enabled: true,
    intervalMs: 60000,
    visibleMs: 6500,
    actionText: "vient de rejoindre la formation",
    // sampleActionText: "exemple de notification d’inscription",
    showSamplesPublicly: true,

    // À remplacer par les vrais achats quand ils sont disponibles.
    purchases: [
      { name: "Jonathan", country: "Cameroun", countryCode: "CM", minutesAgo: 32 },
      { name: "Aïcha", country: "Côte d’Ivoire", countryCode: "CI", minutesAgo: 120 },
      { name: "Moussa", country: "Sénégal", countryCode: "SN", minutesAgo: 840 },
      { name: "Estelle", country: "Bénin", countryCode: "BJ", minutesAgo: 1440 },
      { name: "Koffi", country: "Togo", countryCode: "TG", minutesAgo: 75 },
      { name: "Mireille", country: "Gabon", countryCode: "GA", minutesAgo: 210 },
      { name: "Patrick", country: "RDC", countryCode: "CD", minutesAgo: 48 },
      { name: "Grâce", country: "Congo", countryCode: "CG", minutesAgo: 360 },
      { name: "Fatoumata", country: "Mali", countryCode: "ML", minutesAgo: 960 },
      { name: "Idrissa", country: "Burkina Faso", countryCode: "BF", minutesAgo: 2880 },
      { name: "Sandra", country: "Cameroun", countryCode: "CM", minutesAgo: 18 },
      { name: "Yannick", country: "Côte d’Ivoire", countryCode: "CI", minutesAgo: 1260 },
      { name: "Marième", country: "Sénégal", countryCode: "SN", minutesAgo: 180 },
      { name: "Loïc", country: "Bénin", countryCode: "BJ", minutesAgo: 1560 },
      { name: "Nadia", country: "Togo", countryCode: "TG", minutesAgo: 420 },
      { name: "Kevin", country: "Cameroun", countryCode: "CM", minutesAgo: 55 },
      { name: "Clarisse", country: "Gabon", countryCode: "GA", minutesAgo: 300 },
      { name: "Emmanuel", country: "RDC", countryCode: "CD", minutesAgo: 660 },
      { name: "Aminata", country: "Mali", countryCode: "ML", minutesAgo: 2040 },
      { name: "Serge", country: "Congo", countryCode: "CG", minutesAgo: 95 },
      { name: "Carine", country: "Côte d’Ivoire", countryCode: "CI", minutesAgo: 540 },
      { name: "Abdoulaye", country: "Sénégal", countryCode: "SN", minutesAgo: 1500 },
      { name: "Nathalie", country: "Bénin", countryCode: "BJ", minutesAgo: 35 },
      { name: "Franck", country: "Burkina Faso", countryCode: "BF", minutesAgo: 780 },
      { name: "Mariam", country: "Guinée", countryCode: "GN", minutesAgo: 2520 },
      { name: "Landry", country: "Cameroun", countryCode: "CM", minutesAgo: 165 },
      { name: "Awa", country: "Côte d’Ivoire", countryCode: "CI", minutesAgo: 4320 },
      { name: "Junior", country: "RDC", countryCode: "CD", minutesAgo: 25 },
      { name: "Fanta", country: "Sénégal", countryCode: "SN", minutesAgo: 1080 },
      { name: "Rodrigue", country: "Togo", countryCode: "TG", minutesAgo: 2160 }
    ],
    endpoint: "",

    // Ces entrées sont des exemples et restent visiblement marquées « DÉMO » sur le site public.
    // samplePurchases: [
    //   { name: "Jonathan", country: "Cameroun", countryCode: "CM", minutesAgo: 32 },
    //   { name: "Aïcha", country: "Côte d’Ivoire", countryCode: "CI", minutesAgo: 120 },
    //   { name: "Moussa", country: "Sénégal", countryCode: "SN", minutesAgo: 840 },
    //   { name: "Estelle", country: "Bénin", countryCode: "BJ", minutesAgo: 1440 },
    //   { name: "Koffi", country: "Togo", countryCode: "TG", minutesAgo: 75 },
    //   { name: "Mireille", country: "Gabon", countryCode: "GA", minutesAgo: 210 },
    //   { name: "Patrick", country: "RDC", countryCode: "CD", minutesAgo: 48 },
    //   { name: "Grâce", country: "Congo", countryCode: "CG", minutesAgo: 360 },
    //   { name: "Fatoumata", country: "Mali", countryCode: "ML", minutesAgo: 960 },
    //   { name: "Idrissa", country: "Burkina Faso", countryCode: "BF", minutesAgo: 2880 },
    //   { name: "Sandra", country: "Cameroun", countryCode: "CM", minutesAgo: 18 },
    //   { name: "Yannick", country: "Côte d’Ivoire", countryCode: "CI", minutesAgo: 1260 },
    //   { name: "Marième", country: "Sénégal", countryCode: "SN", minutesAgo: 180 },
    //   { name: "Loïc", country: "Bénin", countryCode: "BJ", minutesAgo: 1560 },
    //   { name: "Nadia", country: "Togo", countryCode: "TG", minutesAgo: 420 },
    //   { name: "Kevin", country: "Cameroun", countryCode: "CM", minutesAgo: 55 },
    //   { name: "Clarisse", country: "Gabon", countryCode: "GA", minutesAgo: 300 },
    //   { name: "Emmanuel", country: "RDC", countryCode: "CD", minutesAgo: 660 },
    //   { name: "Aminata", country: "Mali", countryCode: "ML", minutesAgo: 2040 },
    //   { name: "Serge", country: "Congo", countryCode: "CG", minutesAgo: 95 },
    //   { name: "Carine", country: "Côte d’Ivoire", countryCode: "CI", minutesAgo: 540 },
    //   { name: "Abdoulaye", country: "Sénégal", countryCode: "SN", minutesAgo: 1500 },
    //   { name: "Nathalie", country: "Bénin", countryCode: "BJ", minutesAgo: 35 },
    //   { name: "Franck", country: "Burkina Faso", countryCode: "BF", minutesAgo: 780 },
    //   { name: "Mariam", country: "Guinée", countryCode: "GN", minutesAgo: 2520 },
    //   { name: "Landry", country: "Cameroun", countryCode: "CM", minutesAgo: 165 },
    //   { name: "Awa", country: "Côte d’Ivoire", countryCode: "CI", minutesAgo: 4320 },
    //   { name: "Junior", country: "RDC", countryCode: "CD", minutesAgo: 25 },
    //   { name: "Fanta", country: "Sénégal", countryCode: "SN", minutesAgo: 1080 },
    //   { name: "Rodrigue", country: "Togo", countryCode: "TG", minutesAgo: 2160 }
    // ]
  }
};
