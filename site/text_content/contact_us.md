# CONTACT US PAGE – Text Content

> **Notes for the reader of this doc**
>
> - Source: the current `site/contact.html`. This file is a copy of the page text for reference and editing.
> - **Not baked yet:** `contact.html` has no Markdown source, so no bake script or JS loader reads this file. Edit the HTML directly, or ask for a bake step like the one for `about.md`.
> - The form field names, the hidden Web3Forms inputs and the `access_key` live in `contact.html` and `js/contact-form.js`. They are listed below for reference only.

---

## \[Page\]

**Title (browser tab):** Contact – The Mental Gain

**Meta description:** Contact The Mental Gain — email, phone, Instagram, or send a message about mental performance consulting for athletes and teams.

---

## \[Header\]

*(Splash image: `images/services/services-hero-option-b-morning-horizon-1920x700.jpg`, shared with the Services page.)*

**Headline (h1, `contact-splash-heading`):** Contact Us

**Tagline:** Ready to talk? Your next mental gain starts with a hello.

---

## \[Let’s connect\] (left column)

### Let’s connect

Take the first step toward improved mental performance. This isn’t a traditional “get tougher” conversation. We can discuss where you are and where you want to be. Everybody’s journey is different. Together let’s explore you and your situation. The time is right for you to improve your MENTAL game – what do YOU have to GAIN?

Or use the contact form.

### Contact channels

*(Each channel is an image link in `images/contact/`.)*

* **Instagram:** @the.mental.gain — https://www.instagram.com/the.mental.gain/ (`instagram-rainbow-with-address2.png`)
* **Email:** TheMentalGain@gmail.com — `mailto:TheMentalGain@gmail.com` (`email-drk-blue-with-address1.png`)
* **Phone:** (319) 325-9499 — `tel:+13193259499` (`phone-drk-blue-with-number1.png`)

### Quote

> Working with Sabrina was awesome. She has the experience to understand how I feel. Now I’m a stronger player and much happier on the court.
>
> — Collegiate basketball player

---

## \[Contact form\] (right column)

Fields, in order (`*` = required):

1. **Parent Name \*** — placeholder: Parents name
2. **Player Name** — placeholder: Player name (optional)
3. **Email \*** — placeholder: Email address
4. **Phone** — placeholder: Phone e.g., 319-555-1212
5. **Message** — placeholder: Please enter a message or question. (400 character limit, with a live “0 / 400” counter)

**Submit button:** Send Message

*(A hidden honeypot field `botcheck` and the status line under the button show the success or error message from `js/contact-form.js`.)*
