# Sree Vishnu - cinematic AI engineering portfolio

A GitHub Pages-compatible, single-page portfolio for Sree Vishnu Raju Dommaraju. The public content distinguishes anonymized professional experience from illustrative architecture concepts. All professional connection links use the configured LinkedIn URL.

## Build and preview

Node.js 22+ is required. The site and build have no runtime package dependencies.

```text
npm run build
npm run preview
```

Open `http://127.0.0.1:4173/Sree-Vishnu-Blog/`. `npm run dev` serves source instead of `dist/`. Set the `PORT` environment variable if 4173 is occupied. The generated `index.html` is checked in for existing branch-based Pages publishing; rebuild after template or content edits.

## Editing map

- `assets/content.js`: identity, concepts, expertise, anonymized history, deterministic sample events.
- `scripts/build.mjs`: semantic HTML, SEO, dialogs, static/no-JavaScript fallbacks, and clean build output.
- `style.css`: obsidian/chrome/ice palette, locally hosted typography, responsive layouts, native sticky positioning, contrast and reduced-motion treatments.
- `assets/runtime.js`: one demand-driven requestAnimationFrame scheduler, pointer state, resize and motion preference lifecycle.
- `assets/scene.js`: lazily loaded Canvas 2D renderer projecting original 3D torus geometry, metallic lighting, an orbiting core, signals, and a pointer-reactive grid. It caps pixel ratio at 1.5, stops offscreen/hidden, and renders a static frame on mobile or reduced motion. `assets/core-fallback.svg` remains visible if canvas is unavailable.
- `assets/motion.js`: eased cursor glow, precise pointer center, magnetic springs, card tilt/lighting, Web Animations API entrances and scroll reveals, and subtle closing-section parallax. The native cursor remains available.
- `assets/showcase.js`: native sticky horizontal work showcase on capable desktop viewports; vertical scrolling drives the track without wheel interception. Dragging, arrows, indicators, and keyboard Home/End/arrow keys also work. Mobile, reduced-motion, short-screen, and enlarged-text layouts use a native scroll-snap carousel.
- `assets/app.js`: navigation, clickable workflow nodes, run/pause/reset with traveling signals and trace, capability selection, and native dialog lifecycle. Dialogs support Escape, focus containment, return focus, and finite concept walkthroughs.
- `scripts/visuals.mjs`: six original concept schematics.

The full name is the hero's actual heading. All content is available without motion; no-JavaScript visitors get the static sculpture, visible concept collection, inline architecture details, and full skill descriptions. Unavailable actions are hidden or disabled. A motion toggle pauses decorative motion. OS reduced-motion and coarse-pointer preferences disable the custom pointer effects; higher contrast preferences increase text/border contrast.

Space Grotesk is self-hosted in `assets/fonts/`; its OFL license is included. No external font requests, trackers, model APIs, backend, credentials, or contact-form simulation are required. Social artwork is original: edit `assets/social.svg` and run `node scripts/render-share.mjs` with development tools installed to regenerate the 1200 x 630 PNG.

## Verification

Run `npm ci` to install development-only Playwright, axe, and Lighthouse. Chrome is required for browser checks.

```text
npm run check
npm test
npm run test:browser
```

Browser tests start their own ephemeral-port production server. They verify actual changing canvas pixels, following cursor transforms, magnetic displacement/return, active scroll reveals, all seven requested widths, moving architecture signals, run/pause/resume/reset, every scenario, offscreen pause, pinned horizontal movement, dragging, slider keyboard controls/indicators, six concept dialogs and demos, policy switching, modal focus, six skill categories, desktop/mobile WCAG A/AA scans, reduced motion, 200% text scaling, touch gestures, no-JavaScript content, root/project/legacy paths, exact contact links, and failed assets/runtime errors. Screenshots under `tests/preview-*.png` are ignored. Tests do not rewrite public artwork.

To measure Lighthouse against a running production preview on Windows:

```powershell
$env:CHROME_PATH = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
npx lighthouse http://127.0.0.1:4173/Sree-Vishnu-Blog/ --preset=desktop --chrome-flags="--headless" --output=json --output-path=tests/lighthouse-desktop.json
```

Omit `--preset=desktop` for mobile emulation. Scores and frame timing are local lab measurements, not guarantees for other hardware or the deployed host.

## GitHub Pages

The existing public URL is `https://sreevishnu0506-cyber.github.io/Sree-Vishnu-Blog/`. Relative asset/module/font paths work at the project path and root. If changing this URL, update `_config.yml`, canonical/share metadata in `scripts/build.mjs`, `robots.txt`, and `sitemap.xml` together.

For existing branch publishing, confirm Settings > Pages uses the intended branch and repository root. The generated index has no front matter and is served unchanged by Jekyll. For artifact-based publishing, use only `dist/`, which includes `.nojekyll` and standalone about/projects/blog redirects. Each build clears only its fixed local output directory before copying current assets. Build scripts, tests, internal documents, dependencies, and the V2 instruction brief are excluded from Jekyll publication and are not part of `dist/`.

There is no client router or server-side runtime requirement. No deployment workflow was added or triggered. Publishing and all Git operations remain the owner's responsibility.
