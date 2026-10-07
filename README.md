# The Mental Gain — website redesign

Staging site for [TheMentalGain.com](https://thementalgain.com), built per **`TMG rqmts.docx`**.

**Stack:** Astro · Tailwind CSS · Markdown/MDX · Cloudflare Pages  
**Repo:** [github.com/davidvb11758/thementalgain](https://github.com/davidvb11758/thementalgain)

## Quick start

Requirements: **Node.js ≥ 22.12**

```bash
npm install
npm run dev
```

Open [http://localhost:4321](http://localhost:4321).

```bash
npm run build    # output → dist/
npm run preview  # preview production build locally
npm run deploy   # bake site/*.md into HTML, then wrangler pages deploy (after wrangler login)
npm run bake:site   # Markdown → HTML only (no upload)
npm run deploy:only # upload site/ without re-baking
```

## Project layout

| Path | Purpose |
|------|---------|
| `content/pages/` | Page copy (`home.md`, `services.md`, …) |
| `content/config/site.json` | Navigation, footer links, social URLs |
| `src/components/` | Reusable UI |
| `src/layouts/` | Page shells |
| `src/pages/` | Astro routes (add incrementally) |
| `src/styles/global.css` | **Design tokens** (colors, type, spacing) |
| `public/images/` | Site images |
| `docs/` | Architecture, sitemap, requirements summary |
| `legacy/pilot-site/` | Old static HTML prototype |

See [docs/architecture.md](docs/architecture.md).

## Edit content

1. Open the Markdown file in `content/pages/` (same ID conventions as the pilot—see `home.md` header notes).
2. Implement or update the matching Astro page when that section is built.
3. Do **not** scatter copy in components unless it is truly global chrome.

## Add a page

1. Add `content/pages/your-page.md` (or MDX under `src/pages/` when using layouts).
2. Create `src/pages/your-page/index.astro` using `BaseLayout`.
3. Add an entry to `content/config/site.json` → `primaryMenu` if it belongs in the nav.
4. Add SEO title/description in the page frontmatter or layout props.
5. `npm run build` and test mobile + keyboard navigation.

## Add an image

1. Put files in `public/images/` (use sensible size; prefer WebP when practical).
2. Reference as `/images/filename.ext` in Markdown or Astro.
3. Always set `alt` text.

## Add a podcast episode

1. Extend `content/config/site.json` → `podcast` (or a future `content/podcast/` file).
2. Use a reusable podcast component (to be added under `src/components/`) on Social and Home sections.
3. Link out to Spotify / Apple / Instagram—do not hard-code URLs on multiple pages.

## Change global colors

Official palette: **`TMG Color palette.docx`** (also `content/config/design-tokens.json`).

Edit **`src/styles/global.css`** → `@theme { --color-tmg-* … }` to match. Do not hard-code hex values in individual `.astro` files.

**Fonts:** Lato (body), Lora (headings) — Google Fonts, loaded in `BaseLayout.astro`.

## Deploy (Cloudflare Pages)

**Static pilot (`site/`):** from repo root, `npm run deploy` runs all Python bake scripts under `site/scripts/` (home, about, services, service details), then uploads `site/` with Wrangler.

| Setting | Value |
|---------|--------|
| CLI deploy | `npm run deploy` |
| Build output directory | `site` |
| Node version | 22+ (Python 3 required for bake) |

**Future Astro (`dist/`):** `npm run build` → output `dist/`; Pages Git build can use that when Astro replaces the pilot.

Connect custom domain **thementalgain.com** in the Pages project. Keep **master.thementalgain.com** DNS pointing to InMotion if that subdomain stays on WordPress.

## Environment variables

Copy `.env.example` → `.env` for local experiments.  
Set production secrets in **Cloudflare Pages → Settings → Environment variables** (never commit `.env`).

Planned integrations: contact form endpoint, newsletter provider, Google Calendar booking URL.

## External services (planned)

- Google Calendar / Google appointment scheduling (Booking)
- Form provider for Contact Me (Cloudflare-compatible)
- Newsletter provider
- Instagram (link + optional latest post embed)

## Legacy pilot

The earlier single-page HTML site lives under `legacy/pilot-site/` (and may still exist as `/site` on disk). It used Python to bake `home.md` into HTML; the Astro site replaces that workflow over time.

## Documentation

- [docs/requirements-summary.md](docs/requirements-summary.md)
- [docs/sitemap.md](docs/sitemap.md)
- [docs/architecture.md](docs/architecture.md)
- [docs/review-findings.md](docs/review-findings.md) — open issues and fixes, by priority
- [CLAUDE.md](CLAUDE.md) — how the live `site/` actually works (bake pipeline, shared header/footer, design tokens)
