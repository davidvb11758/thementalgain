# HOME PAGE – Text Content

> **Notes for the reader of this doc**  
> 

> - Source: homepage scraped from [thementalgain.com](https://thementalgain.com/) (WordPress / GeneratePress).  
> - Sections match **main page body** only (not site header, footer, or navigation).  
> - Sections **not** on the live homepage as of this scrape: The Mental Gain overview, social media block, podcast block (planned in `TMG site layout.txt`).  
> - **Paragraph IDs:** every paragraph is preceded by an `ID:` line. Use as the `id` of the matching `<div>` in `index.html`.  
> - ID pattern: `home-*` (lowercase, hyphens). Keep unique across the site.  
> - After editing, run `python scripts/render_home_from_md.py` from the `site` folder to bake copy into `index.html`.

---

## \[SPLASH\]

Full-width image: `images/Sabrina Mountain 2b expand1920.jpg`. Headlines are static in `index.html` (not loaded from markdown):

- **H2:** Promoting Peak Performance through Mental Skills Training  
- **H3:** What do you have to gain?

---

## \[Welcome to TMG\]

**ID:** `home-welcome-title`

Welcome to The Mental Gain

*(Section photo: `images/Sabrina welcome 400.JPG` — fixed in HTML, left of body.)*

**ID:** `home-welcome-body`

I’m Sabrina..

I am a ***Certified*** *Mental Performance Consultant*®. If you want to help your athlete or team play with ***confidence, move on from mistakes, or just start playing to their potential***, you’ve come to the right place. I’ve worked with hundreds of athletes to help them achieve their best mindset. Get ready to watch your athlete or team play to their potential, and get back to enjoying their sport\!

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

Learn more about The Mental Gain and how we can help your athletes or team in a phone call with Sabrina.   
**ID:** `home-services-individual-sessions`

Athletes meet 1-on-1 with Sabrina to strengthen their mindset through a personalized plan tailored to their individual needs.

**ID:** `home-services-online-modules`

Learn mental skills through online modules, built by Sabrina and tailored to your athletes' needs. Each module is paired with 30-minute sessions with Sabrina.

**ID:** `home-services-team-sessions`

Have your team work directly with Sabrina to improve team dynamics, communication, motivation, confidence, and other mental skills. Every session is personalized to address your team's specific needs, challenges, and goals.

*(Each card: **Discover more…** → `services/<slug>/` detail pages.)*

---

## \[My clients overview\]

*(Live home: section heading plus two rows of client logos; no body paragraph.)*

### My Clients

*(Twelve client logos (`images/myclients/* logo 400`) in `#client-carousel-source` on `index.html`; carousel shows prev / center / next, advances every 2s.)*