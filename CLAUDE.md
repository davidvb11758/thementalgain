# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

The marketing site for The Mental Gain: Sabrina Rodgers, a Certified Mental Performance Consultant® (CMPC) who works with athletes, teams and parents. It replaces the WordPress site at thementalgain.com. `TMG rqmts.docx` is the source of truth for requirements, and `TMG site layout.txt` is the page outline.

**The deployed site is the hand-written static site in `site/`.** The Astro + Tailwind project at the root (`src/`, `content/`, `public/`, `astro.config.mjs`) is an unfinished scaffold with one placeholder page and is not deployed. `README.md` and `docs/architecture.md` still describe Astro as the main stack. Treat `site/` as the real site unless the user says they are moving to Astro.

Open issues, ranked by priority, are tracked in `docs/review-findings.md`. Check it before changing related code, and tick items off there when you fix them.

## Commands

```bash
npm run bake:site    # python site/scripts/bake_all_from_md.py — Markdown copy + footer partial → HTML, edits site/*.html in place
npm run deploy       # bake:site, then `wrangler pages deploy site --project-name=thementalgain` (PRODUCTION)
npm run deploy:only  # upload site/ without baking
npx wrangler pages dev site   # local preview with Cloudflare _headers; any static HTTP server on site/ also works
```

- `npm run deploy` publishes to production. Only run it when the user asks.
- Preview over HTTP, not `file://`: the pages `fetch()` their `text_content/*.md` at runtime.
- The bake needs Python 3 and uses only the standard library.
- There are no tests, linters or formatters. To check a bake change, run `npm run bake:site` and review `git diff site/`.
- Astro scaffold only: `npm run dev` (port 4321) and `npm run build` (output to `dist/`). Requires Node ≥ 22.12.

## How `site/` works

Plain HTML pages, one stylesheet (`site/css/styles.css`), vanilla JS, and no bundler. All links are relative: `services/<slug>/index.html` pages use `../../` and the top-level pages use bare filenames.

### Page copy lives in Markdown

`site/text_content/<page>.md` holds the text for home, about, services and the 4 service detail pages. A line like ``**ID:** `home-welcome-body` `` marks the block of paragraphs that follows it. The ID equals the `id` of an element in the matching HTML file. Text that doesn't follow an `**ID:**` line (notes, image paths, `*(…)*` asides) is documentation for humans and is ignored. A block ends at the next `**ID:**`, a heading, `---`, a `*(` note, or a list.

The copy is applied twice, in two ways:
1. **At deploy time:** `site/scripts/render_*_from_md.py` (run in order by `bake_all_from_md.py`) rewrite the inner HTML of matching elements in place. Each script only matches certain tags and ID prefixes:
   - home: `div`/`h2` with `home-*`. It also sets the newsletter placeholder and button text, and `data-newsletter-success` on `<html>`.
   - about: `div`/`h1`/`h2`/`h3` with `about-*` or `social-*`.
   - services: only **empty** `<div class="…" id="services-…"></div>`, so it currently does nothing (bug #2 in `docs/review-findings.md`).
   - service details: any tag with a matching ID. It warns about IDs that have no matching element.
2. **In the browser:** `<html data-home-content=…>` or `data-page-content=…` points at the `.md` file. `js/home-content.js`, `about-content.js`, `services-content.js` and `service-detail-content.js` download it and rewrite the same elements again.

The block parser and the inline Markdown handling (links, `**bold**`, `*em*`, `\!`/`\[`/`\]` unescaping, HTML escaping) are copied into all 4 Python scripts and all 4 JS loaders. A change to the format must be made in every copy.

**To edit copy:** change the `.md` file, run `npm run bake:site`, and check the HTML diff. Don't hand-edit text inside elements that have an ID, because the bake overwrites it. To add a new block, add the element with its ID to the HTML and the `**ID:**` block to the `.md` file, using the page's ID prefix.

`my-clients.html`, `contact.html` and `book-me.html` have no Markdown source. Edit them directly.

### Shared parts of every page

- **Header:** the `<header>` and primary nav (`#primary-nav`) are copied into all 10 HTML pages. A menu change means editing every page and moving `aria-current="page"` to the right link.
- **Footer:** `site/partials/site-footer.html` is the only source. `site/scripts/render_footer_from_partial.py` (the last step of `bake:site`) copies it into `<footer id="site-footer" class="site-footer">` on every page under `site/`, replacing whatever was there.
  - `@ROOT@` in the partial becomes the page's relative path back to `site/`, worked out from its folder depth (`""` at the top level, `"../../"` on service pages).
  - Edit the partial and re-bake. Don't edit the footer markup inside a page, because the next bake replaces it.
  - A new page needs an empty `<footer id="site-footer" class="site-footer"></footer>`.
  - The partial must not contain a `<footer>` element; the script refuses to run if it does.
- **`js/main.js`** runs on every page. Each init function does nothing if its elements are missing: mobile menu, back-to-top, the "Proven Success" scroll reveal, the newsletter form, the home client-logo carousel, and the services FAQ accordion.
  - The carousel requires exactly 5 `.client-carousel-slot` elements.
  - Its logo list is the `<li data-src data-alt>` items in `#client-carousel-source` in `index.html`.

### Integrations

- **Web3Forms:** the contact form (`contact.html` + `js/contact-form.js`) and the newsletter form (`index.html` + `js/main.js`) post to `api.web3forms.com`. The `access_key` hidden input is public by design.
- **SimplyBook.me:** the booking widget is configured in `js/book-me.js` and mounts into `#sbw_z0hg2i_calendar`. It falls back to a link to thementalgain.simplybook.me.
- **Google Fonts:** Lato and Lora, linked in each page's `<head>`.

### Cloudflare and staging

- `site/_headers` sets security headers and cache rules for Cloudflare Pages.
- The site is still staging: every page has `noindex`, both in a meta tag and in `_headers`. Remove both only at the production cutover.
- `/images/*` is cached for a year as `immutable`. When you change an image, give it a new filename.
- `master.thementalgain.com` stays on the InMotion WordPress host.

### Images

- Many filenames contain spaces. In HTML, write them URL-encoded (`Sabrina%20welcome%20400.JPG`).
- Full-size originals live in `orig-images-gitignore/` at the repo root. Git ignores that folder and it isn't deployed. Only web-sized images go in `site/images/`, and pages shouldn't reference multi-MB PNGs.

## Design system

From `.cursor/rules/tmg-design-system.mdc`, which in turn comes from `TMG Color palette.docx`:

| Role | Name | Hex |
|------|------|-----|
| Primary | Indigo | `#4057a1` |
| Accent / buttons | Light Blue | `#abddf7` |
| Text | Charcoal | `#25283d` |
| Background white | White | `#ffffff` |
| Background light | Lavender Gray | `#f5f4fa` |
| Background dark | Midnight blue | `#17213c` |

- **Fonts:** Lato for body text and UI, Lora for headings. Don't change them unless the user asks and the docx is updated.
- **Don't add new one-off hex colors.** The older pilot teal and coral are deprecated.
- **Watch out:** the `:root` variables in `site/css/styles.css` still hold the deprecated pilot palette, and the official colors are typed in as raw hex values (finding #11). Use the official values above, not `--accent` or `--contrast-3`.
- **Astro scaffold:** the tokens live in `src/styles/global.css` (`@theme`, `--color-tmg-*`) and `content/config/design-tokens.json`.

## Other folders

- **`docs/`:** `requirements-summary.md`, `sitemap.md` and `architecture.md`. The last two are partly stale about Astro. Also `review-findings.md`.
- **`content/`, `src/`, `public/`:** the Astro scaffold.
  - `content/pages/home.md` and `services.md` duplicate files in `site/text_content/`. The `site/` copies are the ones in use.
  - `public/robots.txt` and `public/_headers` are not deployed.
- **`legacy/pilot-site/`:** the first single-page prototype, kept for reference only.
- **Root `.docx` files:** requirements, color palette and deploy notes. Only the user can edit these.
