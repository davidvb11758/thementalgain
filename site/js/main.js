/* =========================================================
   The Mental Gain – homepage pilot
   Vanilla JS, no dependencies.
   ========================================================= */

/* ---------------------------------------------------------
   CONFIG
   Where the newsletter form posts to.
   - Leave '' while piloting: the form validates and shows a
     "not connected yet" message (nothing is sent anywhere).
   - To go live, paste a Formspree / MailerLite / Buttondown
     endpoint that accepts a JSON POST, e.g.
       'https://formspree.io/f/xxxxxxxx'
   --------------------------------------------------------- */
const NEWSLETTER_ENDPOINT = '';

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initBackToTop();
  initProvenReveal();
  initNewsletter();
});

/** Success copy from home.md (set by home-content.js when loaded). */
function newsletterSuccessMessage() {
  return document.documentElement.dataset.newsletterSuccess
    || 'Thank you! You are on the list. Watch your inbox for something good.';
}

/* ---------- Proven Success: reveal lower part of the photo on scroll ---------- */
function initProvenReveal() {
  const section = document.querySelector('.proven');
  if (!section) return;

  const desktop = window.matchMedia('(min-width: 901px)');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let ticking = false;

  const update = () => {
    ticking = false;
    if (!desktop.matches) { section.style.removeProperty('--p'); return; }

    if (reduceMotion.matches) { section.style.setProperty('--p', 1); return; }  // no animation: show lower part

    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    // 0 when the banner starts entering the bottom of the screen,
    // 1 when the banner is centred on screen (and stays 1 after that)
    const progress = (vh - rect.top) / ((vh + rect.height) / 2);
    section.style.setProperty('--p', Math.min(1, Math.max(0, progress)).toFixed(4));
  };

  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  desktop.addEventListener('change', request);
  update();
}

/* ---------- Mobile menu ---------- */
function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('primary-nav');
  if (!toggle || !nav) return;

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  // close on Escape or when a link is chosen
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });

  // reset when resizing up to desktop
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });
}

/* ---------- Back-to-top button ---------- */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  const update = () => btn.classList.toggle('is-visible', window.scrollY > 300);
  window.addEventListener('scroll', update, { passive: true });
  update();

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------- Newsletter form ---------- */
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  const status = document.getElementById('newsletter-status');
  if (!form || !status) return;

  const show = (msg, type) => {
    status.textContent = msg;
    status.className = 'form-status' + (type ? ' is-' + type : '');
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = form.elements.email.value.trim();
    const honeypot = form.elements.website.value;

    if (honeypot) return;                                   // bot – silently ignore
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      show('Please enter a valid email address.', 'error');
      form.elements.email.focus();
      return;
    }

    if (!NEWSLETTER_ENDPOINT) {
      show('Pilot mode: the signup form is not connected to an email service yet.', 'error');
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    show('Sending…');

    try {
      const res = await fetch(NEWSLETTER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      form.reset();
      show(newsletterSuccessMessage(), 'success');
    } catch (err) {
      show('Sorry, something went wrong. Please try again in a moment.', 'error');
    } finally {
      button.disabled = false;
    }
  });
}
