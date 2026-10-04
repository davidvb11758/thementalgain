# HOME PAGE – Text Content

> **Notes for the reader of this doc**

> - Source: homepage scraped from [thementalgain.com](https://thementalgain.com/) (WordPress / GeneratePress).  
> - Sections match **main page body** only (not site header, footer, or navigation).  
> - Sections **not** on the live homepage as of this scrape: TheMentalGain overview, social media block, podcast block (planned in `TMG site layout.txt`).  
> - **Paragraph IDs:** every paragraph is preceded by an `ID:` line. Use as the `id` of the matching `<div>` in `index.html`.  
> - ID pattern: `home-*` (lowercase, hyphens). Keep unique across the site.  
> - After editing, run `python scripts/render_home_from_md.py` from the `site` folder to bake copy into `index.html`.

---

## \[Image & attention grabber\]

*(Hero: headline, intro copy, photo `images/sabrina.png`.)*

### Hi, I'm Sabrina…

**ID:** `home-hero-p1`

I am a *Certified Mental Performance Consultant*® . We all need that mental lift or that mental edge. Work with me and I will help you achieve the mental gain you have been striving for. THIS IS DRIVEN FROM **THE MD** file.

**ID:** `home-hero-p2`

Every person is different. And each requires personal understanding, and a personal plan to help them achieve their desired goals. Whether it is confidence, motivation, self-esteem, or any other type of support, together we can explore your past and get you on your way to peak performance.  *this was edited on google docs and downloaded a MD file.*

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

Take you first step on your road to the mental gain. Call me to set up a complementary initial consultation. This is a 60-minute meeting. We'll spend some time getting to know each other. From there we'll map out a plan for your future success.

**ID:** `home-services-individual-sessions`

Let's dive into *you*. Let's learn about your situation and work together to bring out the best you can be. During our individual sessions we can help you understand your mental strengths and areas for improvement. Whether it is confidence, or motivation, or self-esteem, or anything else, we can unlock the door to gain that mental edge on your way to peak performance.

**ID:** `home-services-online-modules`

Online, self-paced mental performance modules designed for athletes who want to build confidence, focus, and resilience. Each module includes a 30-minute 1-on-1 implementation session to provide personalized implementation strategies to training and competition.

**ID:** `home-services-team-sessions`

Team success is more than just individual players. There are many factors involved with the success or failure of a team. Team dynamics and interpersonal skills are just the beginning. We can explore individual personalities and interactions together. The coach(es) and all players are integral to the conversations and path to team success.

*(Each card links: **Contact Me** → Services / Contact on live site.)*

---

## \[My clients overview\]

*(Live home: section heading plus two rows of client logos; no body paragraph.)*

### My clients include…

*(Logo images in HTML only: Barry University, Rockets, North Cobb, Stevens Institute of Technology, Walton, A5 Volleyball, Georgia State University, Morningside University, West Forsyth, many individual athletes.)*