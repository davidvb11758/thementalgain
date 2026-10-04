# The Mental Gain — Architecture

Based on **TMG rqmts.docx** (requirements source of truth).

## Stack

| Layer | Choice |
|--------|--------|
| Framework | [Astro 7](https://astro.build) — static output |
| Styling | Tailwind CSS v4 + `@theme` tokens in `src/styles/global.css` |
| Content | Markdown / MDX in `content/pages/` (authoring); JSON nav in `content/config/site.json` |
| Interactivity | Vanilla JS or React islands only when needed |
| Hosting | Cloudflare Pages (free tier) → `thementalgain.com` |

## Repository layout

```
content/
  config/site.json     # Navigation, footer links, social URLs
  pages/               # Page copy (home.md, services.md, …)
docs/                  # Architecture, sitemap, requirements summary
legacy/pilot-site/     # Pre-Astro HTML/CSS prototype (reference only)
public/                # Static assets (images, robots.txt, _headers)
src/
  components/          # Reusable UI (layout/, ui/)
  content/             # Astro content collections (future structured content)
  layouts/             # BaseLayout.astro
  lib/                 # site.ts helpers
  pages/               # Routes (implement incrementally)
```

## Principles (from requirements)

1. **Content vs presentation** — Edit Markdown/JSON; avoid changing components for text tweaks.
2. **Design tokens** — Colors, type, spacing in one place (`global.css` `@theme`).
3. **Reusable components** — Header, Footer, Button, cards, heroes (expand as pages are built).
4. **Static first** — No Node server in production; serverless/forms only when required.
5. **Incremental delivery** — Do not build all pages at once; ship as needed.
6. **No secrets in git** — Use Cloudflare env vars and `.env` locally (see `.env.example`).

## Deployment

- **Build:** `npm run build` → `dist/`
- **Cloudflare Pages:** build command `npm run build`, output directory `dist`
- **Wrangler CLI:** `npm run deploy`

## Legacy pilot

`legacy/pilot-site/` (and root `site/` if still present) is the earlier static prototype with `home-content.js` + Python render script. New work happens under `src/` and `content/`.
