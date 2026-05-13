# Repository Guidelines

## Project Structure & Module Organization

This repository is a Nuxt 3 personal portfolio site styled as PokoOS, an OS-like desktop for a System Engineer / DevOps-focused profile. The root entry is `app.vue`, which should stay focused on desktop composition, boot/theme state, app window state, and top-level app launch behavior. Reusable UI belongs in `components/`, and shared state or interaction logic belongs in `composables/`.

Live image and icon assets are served from `public/images/`, including the background, logo, favicon, VRChat icon, legacy slideshow WebP files, and optimized VRChat gallery WebP files under `public/images/vrchat/`. `Backup/` contains the older pre-Nuxt static site snapshot; do not update it unless intentionally refreshing the backup snapshot.

## Build, Test, and Development Commands

- `npm install` installs dependencies.
- `npm run dev` starts the Nuxt development server at the printed localhost URL.
- `npm run build` creates the production build.
- `npm run generate` creates static output when deploying as a static site.
- `npm run preview` previews the built output.
- `git status` checks pending changes before committing.

Keep new dependencies out of the project unless they are necessary and documented.

## Coding Style & Naming Conventions

Use two-space indentation in Vue, TypeScript, CSS, and config files. Prefer double quotes in JavaScript and TypeScript strings. Keep component names descriptive and PascalCase, such as `PokoWindow`, `PokoTopBar`, `PortfolioTerminal`, `GalleryApp`, `MonitorApp`, and `BootScreen`.

When editing terminal behavior, keep command parsing and command output in the terminal composable. When editing window or drag behavior, keep that logic in the relevant composable instead of returning it to `app.vue`. Name image assets with lowercase, readable names when adding new files, and prefer optimized `.webp` images for site media.

## Testing Guidelines

No automated test framework is configured. At minimum, run `npm run build` after code changes. Test changes manually in a browser when practical.

Manual checks should cover page load, PokoOS boot animation, top taskbar app launch, terminal commands (`help`, `clear`, `whoami`, `pwd`, `projects`, `skills`, `devops`, `infra`, `monitor`, `neofetch`, `theme`), command history/autocomplete, window controls, drag/resize behavior, Gallery navigation, Monitor CPU/RAM updates, light/dark theme switching, and narrow browser widths.

## Commit & Pull Request Guidelines

Recent commits use short, imperative summaries such as `Change Icon and Input Color Bar` and `Optimize Pictures and add auto-scale`. Follow that style, but proofread spelling and keep the subject specific.

Pull requests should include a brief summary, affected files or areas, manual test notes, and screenshots or screen recordings for visible UI changes. Link related issues when available and call out any newly added assets.

## Security & Configuration Tips

External social links are embedded in the terminal command registry and dock components. Use `target="_blank"` with `rel="noopener noreferrer"` consistently for outbound links, and avoid adding secrets, tokens, or private profile data to static files.
