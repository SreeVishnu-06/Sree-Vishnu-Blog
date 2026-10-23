# Sree Vishnu - AI engineering portfolio

A static, local-first portfolio with an original orchestration graph, six illustrated architecture concepts, a capability explorer, deterministic simulations, and anonymized professional history. All connections use the configured LinkedIn destination.

## Develop

Requires Node.js 22+ and no runtime or build dependencies.

- `npm run build` regenerates `index.html` and creates a clean `dist/` artifact.
- `npm run dev` previews source at `http://127.0.0.1:4173/Sree-Vishnu-Blog/`.
- `npm run preview` serves the production artifact at the same address; build first.
- Set `PORT` to use a different local port.

Edit `assets/content.js` for identity, capabilities, concept copy, scenarios, and experience. `scripts/build.mjs` owns the semantic page structure; `scripts/visuals.mjs` owns the six original SVG schematics. `style.css` controls typography, layout, focus styles, and reduced motion. `assets/app.js` handles progressive interactions; `assets/simulation.js` contains the pure state machine.

The public index is generated and checked in. Rebuild after content or template edits. All core content and native architecture panels work without JavaScript; unavailable controls are hidden or disabled. No backend, API credentials, external fonts, or model calls are required. `assets/social.svg` is the editable source for the local PNG share image.

## Verify

Run `npm ci` to install development-only Playwright, axe, and Lighthouse tools. Chrome must be installed for browser checks.

- `npm run check` syntax-checks every source, build, and test module.
- `npm test` tests simulation transitions, content integrity, public links, anchors, asset paths, clean builds, and output encoding.
- `npm run test:browser` starts its own isolated production server and checks six responsive widths, all concept and capability interactions, repeated policy switching, timer cleanup, all simulation scenarios, keyboard focus, mobile navigation, touch graph controls, active section indication, reduced motion, 200% base text scaling at three widths, WCAG A/AA checks on desktop and mobile, root/project/legacy paths, and the no-JavaScript fallback. Screenshots under `tests/preview-*.png` are ignored by Git. Tests never modify public assets.

For Lighthouse, start the production preview and run:

```powershell
$env:CHROME_PATH = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
npx lighthouse http://127.0.0.1:4173/Sree-Vishnu-Blog/ --preset=desktop --chrome-flags="--headless" --output=json --output-path=tests/lighthouse-desktop.json
```

Omit `--preset=desktop` for mobile emulation. These are local lab measurements; hosted results depend on the eventual deployment environment.

## GitHub Pages

The existing configuration identifies `https://sreevishnu0506-cyber.github.io/Sree-Vishnu-Blog/`. Relative asset paths support both a project subpath and a root deployment. If changing the public URL, update `_config.yml`, canonical/share metadata in `scripts/build.mjs`, `robots.txt`, and `sitemap.xml` together.

For branch publishing, confirm Settings > Pages points to the intended branch and repository root. The generated index has no front matter, so Jekyll serves it unchanged. Existing about/projects/blog paths redirect to the corresponding sections. The unused starter post and layout were removed.

If publishing a static build artifact, use only `dist/`, which includes `.nojekyll` and standalone legacy-path redirects. The build clears its fixed local output directory first so deleted assets cannot survive in a release. No workflow was added or triggered.

See `IMPLEMENTATION.md` for the starting architecture and implementation decisions. All portfolio examples are illustrative and synthetic; they make no claims of delivered public client products. Keep employer/client names, confidential details, unsupported outcomes, personal contact data, and repository links out of public content.
