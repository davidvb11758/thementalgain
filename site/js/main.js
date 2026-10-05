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
  initClientCarousel();
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

    if (reduceMotion.matches) { section.style.setProperty('--p', 1); return; }

    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
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

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });

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
  if (!form || form.dataset.layoutOnly === 'true') return;

  const status = document.getElementById('newsletter-status');
  if (!status) return;

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

/* ---------- Client logo carousel (home) ---------- */
function initClientCarousel() {
  const root = document.getElementById('client-carousel');
  const source = document.getElementById('client-carousel-source');
  const track = document.getElementById('client-carousel-track');
  if (!root || !source || !track) return;

  const items = [...source.querySelectorAll('li')].map((li) => ({
    src: li.dataset.src || '',
    alt: li.dataset.alt || '',
  })).filter((item) => item.src);

  if (items.length < 3) return;

  const slotEls = {
    prev: track.querySelector('.client-carousel-slot--prev'),
    center: track.querySelector('.client-carousel-slot--center'),
    next: track.querySelector('.client-carousel-slot--next'),
    enter: track.querySelector('.client-carousel-slot--enter'),
  };
  const status = document.getElementById('client-carousel-status');
  if (!slotEls.prev || !slotEls.center || !slotEls.next || !slotEls.enter) return;

  let index = 0;
  const len = items.length;
  let panning = false;

  const mod = (i) => ((i % len) + len) % len;

  const fillSlot = (slotEl, item) => {
    const img = slotEl.querySelector('img');
    if (!img || !item) return;
    img.src = item.src;
    img.alt = item.alt;
  };

  const render = () => {
    fillSlot(slotEls.prev, items[mod(index - 1)]);
    fillSlot(slotEls.center, items[index]);
    fillSlot(slotEls.next, items[mod(index + 1)]);
    fillSlot(slotEls.enter, items[mod(index + 2)]);
    if (status) {
      status.textContent = `Showing ${items[index].alt} (${index + 1} of ${len})`;
    }
  };

  render();

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const advanceInstant = () => {
    index = mod(index + 1);
    render();
  };

  const advanceWithPan = () => {
    if (panning) return;
    panning = true;
    track.classList.remove('is-panning-instant');
    track.classList.add('is-panning');

    const onEnd = (e) => {
      if (e.propertyName !== 'transform') return;
      track.removeEventListener('transitionend', onEnd);
      track.classList.add('is-panning-instant');
      track.classList.remove('is-panning');
      index = mod(index + 1);
      render();
      requestAnimationFrame(() => {
        track.classList.remove('is-panning-instant');
        panning = false;
      });
    };

    track.addEventListener('transitionend', onEnd);
  };

  const advance = reducedMotion ? advanceInstant : advanceWithPan;

  const intervalMs = 2000;
  let timer = window.setInterval(advance, intervalMs);

  root.addEventListener('mouseenter', () => window.clearInterval(timer));
  root.addEventListener('mouseleave', () => {
    timer = window.setInterval(advance, intervalMs);
  });
}
