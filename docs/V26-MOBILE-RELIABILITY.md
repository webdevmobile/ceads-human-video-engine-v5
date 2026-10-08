# V26 — Mobile reliability

## Ce qui a été modifié
- plus aucun oEmbed Wistia n’est déclenché pour toutes les vidéos au chargement initial ;
- un seul lecteur lourd se prépare à la fois sur mobile/tablette ;
- les lecteurs hors écran ne sont préparés qu’à proximité du viewport ;
- les 30 images non critiques sont lazy-loadées ;
- les polices Google ne bloquent plus le premier affichage et sont différées ;
- un service worker met en cache le shell après une première visite réussie ;
- notifications : première apparition 30 s après `window.load`, ordre aléatoire ;
- sous-titres YouTube : `cc_load_policy=0` demandé en best effort.

## Important : ERR_CONNECTION_RESET / « secure connection required »
Ces messages se produisent avant que le JavaScript de la page puisse s’exécuter. Sur un domaine Netlify public, vérifier dans Netlify > Domain management > HTTPS que le certificat est actif et que le DNS du domaine pointe réellement vers Netlify. Sur une IP locale en HTTP, Firefox en mode HTTPS-Only peut refuser l’URL : utiliser `http://IP:PORT` avec une exception locale ou tester le vrai domaine HTTPS.
