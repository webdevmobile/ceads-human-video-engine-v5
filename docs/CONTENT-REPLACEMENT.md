# Remplacer les vidéos et visuels

## Principe

Les placeholders sont marqués dans `index.html` avec `data-media-slot`.

Exemples :

- `hero-video`
- `vsl`
- `generic-video`
- `directed-video`
- `coaching-video`

## Exemple HTML vidéo

Remplacez :

```html
<div class="media-placeholder" data-media-slot="hero-video">...</div>
```

par :

```html
<video class="real-media" controls playsinline preload="metadata" poster="assets/media/hero-poster.webp">
  <source src="assets/media/hero.mp4" type="video/mp4" />
</video>
```

Ajoutez au CSS si nécessaire :

```css
.real-media {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 14px;
  background: #07101E;
}
```

## Galerie des formats

Les huit miniatures sont actuellement des compositions CSS. Remplacez chaque `.format-card__thumb` par une vraie image WebP ou un clip court dès que les assets sont prêts.

## Recommandations

- poster : WebP, idéalement < 250 Ko ;
- vidéo hero : MP4 H.264 + WebM si possible ;
- lazy-loading pour les médias sous la ligne de flottaison ;
- conserver les contrôles accessibles sur la VSL ;
- ne pas autoplay avec son.
