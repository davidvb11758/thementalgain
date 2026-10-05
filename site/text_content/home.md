# HOME PAGE – Text Content

> **Notes for the reader of this doc**

> - Source: homepage scraped from [thementalgain.com](https://thementalgain.com/) (WordPress / GeneratePress).  
> - Sections match **main page body** only (not site header, footer, or navigation).  
> - Sections **not** on the live homepage as of this scrape: TheMentalGain overview, social media block, podcast block (planned in `TMG site layout.txt`).  
> - **Paragraph IDs:** every paragraph is preceded by an `ID:` line. Use as the `id` of the matching `<div>` in `index.html`.  
> - ID pattern: `home-*` (lowercase, hyphens). Keep unique across the site.  
> - After editing, run `python scripts/render_home_from_md.py` from the `site` folder to bake copy into `index.html`.

---

## \[SPLASH\]

Full-width image: `images/Xtream_whole_arena.png`. Headlines are static in `index.html` (not loaded from markdown):

- **H2:** Promoting Healthy Minds and Peak Performance
- **H3:** What do you have to gain?

---

## \[Signup for newsletter\]

*(Forminator signup below hero copy on live site.)*

**ID:** `home-newsletter-p1`

*Join our subscribers to learn more information about The Mental Gain.*

*Form label:* Enter your email... *Button text:* Send Message

---

## \[Services offered overview\]

*(Live home: `h2` “Services” then four service cards; no intro paragraph.)*

### Services

**ID:** `home-services-initial-consultation`

Take your first step on your road to the mental gain.

**ID:** `home-services-individual-sessions`

Let's dive into you.

**ID:** `home-services-online-modules`

Online, self-paced mental performance modules.

**ID:** `home-services-team-sessions`

Team success is more than just players.

*(Each card: **Learn more…** → `services.html#service-*-heading` until dedicated service pages exist.)*

---

## \[My clients overview\]

*(Live home: section heading plus two rows of client logos; no body paragraph.)*

### My Clients

*(Nine client PNGs (325×225) in `#client-carousel-source` on `index.html`; carousel shows prev / center / next, advances every 2s.)*