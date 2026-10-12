# The Mental Gain — Architecture

Based on **TMG rqmts.docx** (requirements source of truth).

## Stack

| Layer | Choice |
|--------|--------|
| Pages | Hand-written static HTML in `site/` |
| Styling | One stylesheet, `site/css/styles.css` (palette from `TMG Color palette.docx`) |
| Content | Markdown in `site/text_content/`, baked into the HTML by Python scripts in `site/scripts/` |
| Interactivity | Vanilla JavaScript in `site/js/`, with no framework or bundler |
| Hosting | Cloudflare Pages (free tier) → `thementalgain.com` |

## Repository layout

```
site/                  # The website: uploaded to Cloudflare Pages as-is
  *.html               # Top-level pages
  services/<slug>/     # Service detail pages (index.html)
  text_content/        # Page copy in Markdown (**ID:** blocks)
  partials/            # Shared markup baked into pages (site-footer.html)
  scripts/             # Python bake scripts (bake_all_from_md.py runs them all)
  css/  js/  images/
  _headers             # Cloudflare security and cache headers
orig-images-gitignore/ # Full-size image originals (git-ignored, not deployed)
docs/                  # Architecture, sitemap, requirements summary, review findings
legacy/pilot-site/     # First single-page prototype (reference only)
```

## Principles (from requirements)

1. **Content vs presentation:** edit Markdown in `site/text_content/` for text changes, not the HTML.
2. **Design tokens:** use the official palette and fonts only (see `.cursor/rules/tmg-design-system.mdc`).
3. **Shared pieces in one place:** the footer comes from `site/partials/`. The header is still copied into each page by hand.
4. **Static first:** no server in production. Forms post to Web3Forms and booking uses the SimplyBook.me widget.
5. **Incremental delivery:** build and ship pages as they're needed rather than all at once.
6. **No secrets in git:** the only key in the pages is the Web3Forms access key, which is designed to be public.

## Deployment

- **Bake:** `npm run bake:site` runs `site/scripts/bake_all_from_md.py`. It writes the Markdown copy and the footer partial into the HTML files in place.
- **Deploy:** `npm run deploy` bakes, then runs `npx wrangler pages deploy site --project-name=thementalgain`. Cloudflare has no build step and serves `site/` as-is.
- **Local preview:** `npm run dev` (Wrangler, which applies `_headers`) or any static HTTP server on `site/`.

## Legacy pilot

`legacy/pilot-site/` is the first single-page prototype, with `home-content.js` and one Python render script. It's kept for reference; new work happens in `site/`.
