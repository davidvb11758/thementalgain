# The Mental Gain — website redesign

Staging site for [TheMentalGain.com](https://thementalgain.com), built per **`TMG rqmts.docx`**.

**Stack:** static HTML · CSS · vanilla JavaScript · Python bake scripts · Cloudflare Pages
**Repo:** [github.com/davidvb11758/thementalgain](https://github.com/davidvb11758/thementalgain)

## Quick start

Requirements: **Python 3** (bake scripts) and **Node.js** (only to run Wrangler through `npx`). There are no npm dependencies to install.

```bash
npm run dev          # serve site/ locally with Wrangler (applies site/_headers)
npm run bake:site    # Markdown copy + footer partial → HTML (no upload)
npm run deploy       # bake, then upload site/ to Cloudflare Pages (after `npx wrangler login`)
npm run deploy:only  # upload site/ without re-baking
```

Any static HTTP server pointed at `site/` also works for previewing. Opening the files directly (`file://`) doesn't, because the pages load `text_content/*.md` with `fetch()`.

## Project layout

| Path | Purpose |
|------|---------|
| `site/` | **The website.** Everything in it is uploaded to Cloudflare Pages. |
| `site/text_content/` | Page copy in Markdown (`**ID:**` blocks), baked into the matching HTML |
| `site/partials/site-footer.html` | Shared footer, baked into every page |
| `site/scripts/` | Python bake scripts (`bake_all_from_md.py` runs them all) |
| `site/css/styles.css`, `site/js/` | Styles and behavior (no bundler) |
| `site/images/` | Web-sized images used by pages |
| `orig-images-gitignore/` | Full-size originals. Git ignores this folder and it is not deployed. |
| `docs/` | Architecture, sitemap, requirements summary, review findings |
| `legacy/pilot-site/` | First single-page prototype (reference only) |

See [docs/architecture.md](docs/architecture.md) and [CLAUDE.md](CLAUDE.md) for how the bake pipeline works.

## Edit content

1. Edit the page's Markdown in `site/text_content/`. Each `**ID:**` line names the HTML element that receives the paragraphs below it.
2. Run `npm run bake:site` and check the HTML diff.
3. Don't hand-edit text inside elements that have an ID, because the bake overwrites it. `my-clients.html`, `contact.html` and `book-me.html` have no Markdown file, so edit them directly.

To change the footer, edit `site/partials/site-footer.html` and re-bake. The header and menu are still copied by hand into each page.

## Add an image

1. Keep the original in `orig-images-gitignore/`, and put a web-sized copy (JPG or WebP, ideally under 300 KB) in `site/images/`.
2. Reference it with a relative path. Encode any spaces as `%20`.
3. Always set `alt` text, plus `width` and `height`.

## Colors and fonts

Official palette: **`TMG Color palette.docx`**, summarized in `.cursor/rules/tmg-design-system.mdc`. Styles live in `site/css/styles.css`.

**Fonts:** Lato (body), Lora (headings), loaded from Google Fonts in each page's `<head>`.

## Deploy (Cloudflare Pages)

`npm run deploy` runs every bake script under `site/scripts/`, then uploads `site/` with Wrangler to the `thementalgain` Pages project. There is no build step on Cloudflare's side.

Deploys from branch `main` are **Preview** deployments, served at **https://main.thementalgain.pages.dev**. The project's production branch is `production`, so **https://thementalgain.pages.dev** only changes when you deploy with `--branch=production`.

| Setting | Value |
|---------|--------|
| CLI deploy | `npm run deploy` |
| Output directory | `site` |
| Tools | Python 3 (bake), Node.js (`npx wrangler`) |

Connect custom domain **thementalgain.com** in the Pages project. Keep **master.thementalgain.com** DNS pointing to InMotion if that subdomain stays on WordPress.

## External services

- **Web3Forms:** contact form (`contact.html`) and newsletter signup (home page)
- **SimplyBook.me:** booking calendar (`book-me.html`, `js/book-me.js`)
- **Instagram and Spotify:** linked from the footer and the About page

## Legacy pilot

The first single-page prototype lives under `legacy/pilot-site/` for reference. `site/` grew out of it.

## Documentation

- [docs/requirements-summary.md](docs/requirements-summary.md)
- [docs/sitemap.md](docs/sitemap.md)
- [docs/architecture.md](docs/architecture.md)
- [docs/review-findings.md](docs/review-findings.md) — open issues and fixes, by priority
- [CLAUDE.md](CLAUDE.md) — how the live `site/` works (bake pipeline, shared header/footer, design tokens)
