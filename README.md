# PokoProfile

PokoProfile is Poko personal website portfolio, rebuilt as a Nuxt 3 PokoOS-style desktop experience for System Engineer and DevOps-focused work.

## Features

- PokoOS boot animation with responsive desktop layout.
- Linux-style portfolio terminal with profile and DevOps commands.
- Liquid-glass app windows inspired by modern macOS design.
- Gallery app with optimized WebP images, thumbnails, transitions, and slideshow controls.
- Monitoring app for browser-side CPU/event-loop and memory signals.
- Light and dark mode support.

## Development

Install dependencies and start the Nuxt development server:

```bash
npm install
npm run dev
```

Build or generate the site:

```bash
npm run build
npm run generate
```

## Structure

- `app.vue` composes the PokoOS desktop shell, boot animation state, app window state, and theme state.
- `components/` contains the liquid-glass window system, top taskbar, terminal app, gallery app, monitoring app, and boot screen.
- `composables/` contains terminal commands, gallery data, client metrics, and draggable window state.
- `public/images/` contains the live site assets.
- `public/images/vrchat/` contains optimized VRChat WebP images and thumbnails.
- `Backup/` is the archived pre-Nuxt static version.
