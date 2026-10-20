# har-to-mocks website

This `gh-pages` branch holds only the project website, published by GitHub Pages
("Deploy from a branch": `gh-pages`, `/ (root)`) to
https://peterknezek.github.io/har-to-mocks/.

It shares no history with `master`; the CLI source lives there. Pushing to this branch
publishes the site and never triggers a CLI build or npm release.

## Layout

- `index.html`, `docs.html`, `styles.css`, `app.js`: the site, no build step.
- `og.png`, `favicon*`, `apple-touch-icon.png`: social image and icons.
- `site-src/og.html`: editable source of `og.png`.
- `site-src/render-assets.mjs`: re-renders `og.png` and the favicon PNGs.
- `.nojekyll`: serve files as-is, without Jekyll.

## Editing locally

```bash
git worktree add ../har-to-mocks-site gh-pages
cd ../har-to-mocks-site
python3 -m http.server 4173
```

To regenerate images after changing the headline or version:

```bash
npm i --no-save playwright && npx playwright install chromium
node site-src/render-assets.mjs
```

The version (`v3.0.0`) and release date appear in `index.html`, `docs.html` and
`site-src/og.html`; update them by hand on a major release.
