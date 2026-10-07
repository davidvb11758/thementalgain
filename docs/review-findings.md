# Code review findings

**Reviewed:** 2026-10-07, at commit `2200bab` plus the uncommitted changes in the working tree at that time.
**Scope:** the live static site in `site/` (what `npm run deploy` uploads to Cloudflare Pages), its bake scripts, and repo housekeeping. The Astro scaffold (`src/`) was only checked to see whether it is in use.

Tick the box when a finding is fixed. Mark a finding *won't fix* rather than deleting it, so the reason stays on record.

**Priorities:** **P1** means fix before thementalgain.com points at this site. **P2** is worth fixing soon. **P3** is housekeeping.

| # | Pri | Finding |
|---|-----|---------|
| 1 | P1 | Site is blocked from search engines; `site/` has no robots.txt or sitemap |
| 2 | P1 | The services bake script never updates `services.html` |
| 3 | P1 | Contact form can be submitted empty |
| 4 | P1 | Link previews (og:image) broken; most pages have no og tags |
| 5 | P1 | ~102 MB of unused images are deployed |
| 6 | P1 | Home hero image is a 1.4 MB PNG (fixed 2026-10-07) |
| 7 | P2 | Page copy is applied twice (baked HTML and a runtime fetch) |
| 8 | P2 | Internal files are publicly downloadable |
| 9 | P2 | Header is duplicated by hand (footer fixed 2026-10-07) |
| 10 | P2 | Markdown parser is copied into 8 files |
| 11 | P2 | `styles.css` variables still hold the old teal/coral palette |
| 12 | P2 | Accessibility issues |
| 13 | P2 | Contact form copy and limits |
| 14 | P2 | Booking widget doesn't use TMG colors |
| 15 | P2 | Year-long immutable image caching |
| 16 | P3 | Two parallel projects; README and docs are stale |
| 17 | P3 | Duplicate copies of content and images |
| 18 | P3 | Git hygiene |
| 19 | P3 | Image filenames contain spaces |
| 20 | P3 | Small script and folder clutter |
| 21 | P3 | Restrict the Web3Forms key to your domain |

---

## P1: fix before go-live

### 1. Site is blocked from search engines; `site/` has no robots.txt or sitemap
- [ ] Fixed

Three separate things tell search engines to stay away:
- `<meta name="robots" content="noindex, nofollow">` is in all 10 pages (`site/index.html:11`, line 10 in the others).
- `site/_headers:5-6` sends `X-Robots-Tag: noindex, nofollow` on every response.
- `public/robots.txt` says `Disallow: /`. That file belongs to the Astro scaffold and **is not deployed**. `site/` has no `robots.txt` and no `sitemap.xml`.

That's correct for staging. At cutover, remove the meta tag and the header line, and add `site/robots.txt` and `site/sitemap.xml`.

### 2. The services bake script never updates `services.html`
- [ ] Fixed

`site/scripts/render_services_from_md.py:87` only matches **empty** elements: `<div class="…" id="services-…"></div>`. `services.html` was filled long ago, so nothing matches any more. The script still prints `Rendered 14 text blocks into services.html` but changes nothing.

**Verified:** on a scratch copy, I added a marker to a paragraph in `services.md` and ran the script. The marker didn't appear in `services.html`.

The bug is hidden because `js/services-content.js` downloads `services.md` in the browser and overwrites the text. The live page looks right with JavaScript on, but the HTML itself is stale for search engines, link previews and visitors without JavaScript.

**Fix:** match id'd elements regardless of their content, the way `render_service_details_from_md.py:96-98` does. **Do this before #7.**

### 3. Contact form can be submitted empty
- [ ] Fixed

`site/contact.html:103` puts `novalidate` on the form, which turns off the browser's built-in checks. `site/js/contact-form.js` only checks the access key, so the `required` name and email fields are never enforced. The newsletter form in `js/main.js` does validate its email field.

**Fix:** remove `novalidate`, or call `form.reportValidity()` at the start of the submit handler.

### 4. Link previews (og:image) broken; most pages have no og tags
- [ ] Fixed

`site/index.html:16` has `og:image` set to `images/Sabrina Mountain 2b expand1920.jpg`. That's a relative path with unencoded spaces, and Facebook, iMessage, LinkedIn and Slack need a full `https://thementalgain.com/...` URL. No other page has any `og:` tags.

**Fix:** use an absolute URL to a JPG of about 1200×630 with no spaces in its name, and add `og:title`, `og:description` and `og:image` to every page.

### 5. ~102 MB of unused images are deployed
- [ ] Fixed

`site/images/` holds 112 MB, and about 102.5 MB of it isn't referenced by any HTML, CSS, JS or Markdown file in `site/`. Wrangler uploads all of it, and git stores it. The unreferenced files, largest first:

| File | Size |
|------|------|
| `Sabrina Mountain 1.png` | 22.7 MB |
| `Sabrina Mountain 1a.png` | 17.8 MB |
| `Sabrina Mountain 2.png` | 16.7 MB |
| `Sabrina Mountain 2b expand5000.png` | 12.1 MB |
| `Sabrina Mountain 2b cropA.png` | 8.3 MB |
| `Sabrina Mountain 1b horizontal.png` | 7.9 MB |
| `Xtream_whole_arena.png`, `Xtream_whole_arena orig.png`, `Xtream_whole_arena.jpg` | 11.3 MB |
| `Sabrina welcome.JPG` (the `… 400.JPG` version *is* used) | 2.6 MB |
| `15R-anthem2.png`, `sabrina.png` | 1.1 MB |
| `services/2022-player-injury-500b.png`, `services/2022-team-celebrate-500b.png`, `services/Rockets3Players1a.png` | 1.4 MB |
| `services/services-hero-option-a-…`, `services/services-hero-option-c-…` (unused hero options) | 0.3 MB |
| `logo-backup/` (whole folder) | 0.4 MB |
| `icons/service-*.svg` (the SVGs are inlined in the HTML) | <0.01 MB |

**Fix:** move the originals to a folder outside `site/` that isn't committed to git, or to cloud storage.

**Progress 2026-10-07:** the large originals and `logo-backup/` were moved to `orig-images-gitignore/`, which git ignores, and `site/images/` dropped to 9.9 MB. Still unreferenced in `site/images/`: the `services/*-500b.png` files, `services/Rockets3Players1a.png`, hero options a and c, and `icons/*.svg` (about 1.7 MB in total). The old copies also stay in git history until it's rewritten, so the repo download stays large.

### 6. Home hero image is a 1.4 MB PNG
- [x] Fixed 2026-10-07: `index.html` now uses `Sabrina Mountain 2b expand1920.jpg` (188 KB, same 1920×810 size). Still open: a smaller `srcset` version for phones, and the `*-645.png` service images.

The first thing the home page loads (and its largest image) is `images/Sabrina Mountain 2b expand1920.png`, at 1.42 MB. Saved as a JPG or WebP at 1920 px it would be about 200–300 KB. Adding `srcset` with a smaller version for phones would help further. Also check the other `*-645.png` service images, which are about 0.6 MB each.

---

## P2: should fix

### 7. Page copy is applied twice (baked HTML and a runtime fetch)
- [ ] Fixed

The bake scripts write Markdown copy into the HTML at deploy time. Then `js/home-content.js`, `js/about-content.js`, `js/services-content.js` and `js/service-detail-content.js` download the same `.md` file in the browser (with `cache: 'no-cache'`) and rewrite the same elements. That costs an extra request on each page and can make the text flicker. If the request fails, the page shows "Page copy could not be loaded" even though the baked text is already there.

**Fix:** after fixing #2, remove the `*-content.js` scripts and the `data-home-content` / `data-page-content` attributes on `<html>`, and treat the bake step as the only source. The home newsletter success message is read from `data-newsletter-success`, which the home bake already sets, so it keeps working.

### 8. Internal files are publicly downloadable
- [ ] Fixed

Because everything in `site/` is deployed, these are publicly downloadable:
- `site/scripts/*.py`
- `site/partials/`
- `site/text_content/`, including `services - old.md`

`text_content/` has to stay public while #7 is in place. After that, move the authoring sources out of the deployed folder (for example to `site-src/`), or deploy a copied build folder that excludes them.

### 9. Header is duplicated by hand (footer fixed)
- [ ] Fixed

- **Header:** the full `<header>` and primary nav are copied into all 10 HTML files. A menu change means editing 10 files.
- ~~**Footer:** `js/site-footer.js` holds the footer HTML as a string, and the comment says `partials/site-footer.html` is "the edit source; keep in sync". Nothing enforces that. The footer is also inserted by JavaScript, so it's missing for visitors without JavaScript and for some crawlers.~~ **Fixed 2026-10-07:** `js/site-footer.js` was deleted. `site/scripts/render_footer_from_partial.py` (part of `npm run bake:site`) now writes `partials/site-footer.html` into every page as plain HTML.
- `docs/sitemap.md` says the menu and footer come from `content/config/site.json`. That's only true for the Astro scaffold.

**Fix:** do the same for the header that was done for the footer: a `site/partials/site-header.html` baked into each page, with `aria-current="page"` set for each page.

### 10. Markdown parser is copied into 8 files
- [ ] Fixed

The `**ID:**` block parser and the inline Markdown conversion (`unescape_md`, `escape_html`, `inline_markdown_to_html`, `parse_id_blocks`) appear in all 4 `render_*_from_md.py` scripts and all 4 `*-content.js` files. The copies have already drifted: each Python script matches different tags and ID prefixes, and the services one is broken (#2).

**Fix:** move the Python parts into one shared module. Removing the JS loaders (#7) gets rid of the other 4 copies.

### 11. `styles.css` variables still hold the old teal/coral palette
- [ ] Fixed

The official palette is in `.cursor/rules/tmg-design-system.mdc` and `TMG Color palette.docx`: Indigo `#4057a1`, Light Blue `#abddf7`, Charcoal `#25283d`, Lavender Gray `#f5f4fa`, Midnight `#17213c`. In `site/css/styles.css`:
- Those official colors are typed in as raw hex values about 120 times.
- The `:root` variables at `site/css/styles.css:7-16` still hold the old pilot palette, which the design rule marks as deprecated: `--contrast-3: #3a606e` (dark teal, used 14 times), `--accent: #db7965` (coral, 3 uses), `--accent-2`, `--blue`, `--contrast`, `--base`, and the unused `--footer-bg`.
- About 20 other one-off hex values appear as well.

**Fix:** change the `:root` variables to the official palette (`--tmg-indigo` and so on), replace the raw hex values with `var(...)`, and check visually whether anything still shows teal or coral.

### 12. Accessibility issues
- [ ] Fixed

- **Testimonials are images of text:** the 9 cards on `site/my-clients.html:72-80` all have the alt text "Client testimonial", so screen reader users can't read them. Put each quote in the alt text, or show it as real text.
- **Contact details are images:** the email, phone and Instagram links on `site/contact.html` (lines 77–92) are images. The alt text is good, but visitors can't select or copy the address or number, and the images won't scale with font size. Use real text styled with CSS.
- **Headings skip levels:** every page subtitle is an `<h3>` right after the `<h1>`, with no `<h2>` in between (`index.html:73`, `services.html:65`, `contact.html:63`, `book-me.html:63`, `my-clients.html:62`). The footer columns use `<h4>`. Use `<p class="splash-subheading">` and footer `<h3>` (or `<h2>`) instead.
- **Service pages share one h1:** all 4 service detail pages have the same `<h1>`, "Helping you reach your potential" (`services/*/index.html:64`), which is also the h1 on `services.html`. Each page's h1 should name the service.

### 13. Contact form copy and limits
- [ ] Fixed

In `site/contact.html`:
- Line 114: the placeholder "Parents name" needs an apostrophe ("Parent's name").
- Line 129: the phone example `403-555-1212` is a Canadian area code. Something like `319-555-1212` would match the business number.
- Line 134: `maxlength="180"` is very tight for a parent describing their athlete's situation. Consider 1,000 or more.

### 14. Booking widget doesn't use TMG colors
- [ ] Fixed

`site/js/book-me.js:20,24,25` uses SimplyBook's default pink (`#FF3259`) and black. Change these to the TMG palette, for example Indigo `#4057a1` for buttons and the nav bar.

### 15. Year-long immutable image caching
- [ ] Fixed

`site/_headers:8-9` caches `/images/*` as `immutable` for one year. If you replace an image but keep its filename, returning visitors will keep the old one for up to a year. Either always use a new filename for a changed image, or drop `immutable` and use a shorter max-age. Only `/index.html` has a short cache time; the other pages fall back to Cloudflare's defaults.

---

## P3: housekeeping

### 16. Two parallel projects; README and docs are stale
- [ ] Fixed

The deployed site is the hand-written static `site/`. The Astro and Tailwind project (`src/`, `content/`, `public/`, `astro.config.mjs`, and the npm dependencies) has a single placeholder page and isn't deployed. Several docs still describe Astro as the way forward:
- `README.md`: the stack line, "Edit content", "Add a page" and "Add an image" (which says to use `public/images/`).
- `docs/architecture.md:43-49` says new work happens under `src/`.
- `legacy/pilot-site/README.md`.
- `docs/sitemap.md` points Home and Services at `content/pages/*.md` rather than `site/text_content/*.md`.

**Decide:** either commit to the static site (delete or archive the scaffold and update the docs), or plan the move to Astro. `CLAUDE.md` documents the current reality in the meantime.

### 17. Duplicate copies of content and images
- [ ] Fixed

- **Home page copy:** `content/pages/home.md` and `site/text_content/home.md` are two copies of the same text, so they will drift.
- **Services copy:** `content/pages/services.md` and `site/text_content/services.md` are a second pair.
- **Images:** `public/images/` and `legacy/pilot-site/images/` hold older copies of the logos and photos.

### 18. Git hygiene
- [ ] Fixed

- **Word lock file:** `~$G deploy.docx` shows as untracked. Add `~$*` to `.gitignore`.
- **Loose photos:** `Sabrina peaceful1.JPG` and `Sabrina peaceful2.JPG` are untracked in the repo root. Move them to an asset folder outside git.
- **Line endings:** git warns about LF/CRLF on every diff. Add a `.gitattributes` with `* text=auto`.
- **Large binaries:** multi-MB images and the `.docx` files are committed. Consider Git LFS, or keep originals outside the repo, especially after #5.

### 19. Image filenames contain spaces
- [ ] Fixed

Filenames such as `Sabrina welcome 400.JPG` and `myclients/GSU logo 400.png` have to be written as `%20` in HTML. This caused the og:image bug in #4. Lowercase names with hyphens (for example `sabrina-welcome-400.jpg`) avoid the problem.

### 20. Small script and folder clutter
- [ ] Fixed

- **Misleading message:** when `index.html` or `about.html` is already up to date, the home and about bake scripts print "No changes (check IDs in … match …)" to stderr. That reads like an error but is normal.
- **One-off script:** `site/scripts/extract_service_svgs.py` was used once. It has a hard-coded `C:\9-personal\...` path and needs `bs4`. Move it out of `site/` or delete it.
- **Empty folder:** `site/about_tmg/` is empty and untracked. Delete it.
- **Old copy:** `site/text_content/services - old.md` is an outdated copy. Delete it.

### 21. Restrict the Web3Forms key to your domain
- [ ] Done

The access key in `contact.html` and `index.html` is meant to be public (Web3Forms works that way), so it isn't a leak. Still, restrict it to the thementalgain.com domain in the Web3Forms dashboard so other sites can't send through it.

---

## Checked and fine

- **Bake output matches the Markdown:** on a scratch copy, running the full bake against `index.html`, `about.html` and the 4 service detail pages produced no changes, so the committed HTML matches the Markdown. (`services.html` is the exception; see #2.)
- **HTML escaping:** the bake scripts escape HTML before converting Markdown, so stray `<` or `&` in copy can't break the page.
- **Carousel motion:** the carousel and the scroll reveal both respect `prefers-reduced-motion`.
- **External links:** they use `rel="noopener noreferrer"`.
- **Security headers:** `nosniff`, `Referrer-Policy` and `X-Frame-Options` are set in `site/_headers`.
