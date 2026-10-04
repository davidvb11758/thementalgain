# Requirements summary

Full detail: **`TMG rqmts.docx`** (project root).

## Goal

Modern, responsive staging site for **TheMentalGain.com** on Cloudflare Pages, then DNS cutover from WordPress (InMotion). **master.thementalgain.com** can stay on InMotion separately.

## Must-haves

- Professional performance-coaching tone (not clinical/medical, not generic corporate)
- Astro + Tailwind + Markdown/MDX + Cloudflare Pages
- Central design tokens; no hard-coded colors per page
- Responsive (mobile-first reflow, not shrunk desktop)
- Full-width imagery, subtle motion (respect `prefers-reduced-motion`)
- Reusable components (header, footer, cards, CTAs, forms, podcast block)
- Markdown-first content editing
- Google Calendar–based scheduling (Booking)
- Contact form + newsletter (serverless / external service, no PHP)
- Accessibility, SEO, performance, security (no secrets in client/repo)
- GitHub: `https://github.com/davidvb11758/thementalgain`

## Agent / delivery rules

- Understand architecture before large changes
- Implement pages **only when needed**
- Reuse components; keep diffs focused
- Verify build, mobile, a11y, and no exposed secrets before calling work done

## Guiding principle

> Beautiful, modern site that is **extremely easy to maintain** for years—copy, images, services, and colors should not require rewrites.
