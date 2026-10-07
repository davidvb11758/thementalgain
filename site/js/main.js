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
  initServicesFaq();
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
    document.body.classList.toggle('mobile-nav-open', open);
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

  if (items.length < 2) return;

  const slots = [...track.querySelectorAll('.client-carousel-slot')].map((slotEl) => {
    const offset = Number(slotEl.dataset.slotOffset || 0);
    const panTrack = slotEl.querySelector('.client-carousel-pan-track');
    const imgs = panTrack ? [...panTrack.querySelectorAll('img')] : [];
    return { slotEl, offset, panTrack, currentImg: imgs[0], nextImg: imgs[1] };
  }).filter((s) => s.panTrack && s.currentImg && s.nextImg);

  if (slots.length !== 5) return;

  const status = document.getElementById('client-carousel-status');
  let centerIndex = 0;
  const len = items.length;
  let panning = false;
  let loopTimer = null;
  const pauseMs = 2000;

  const mod = (i) => ((i % len) + len) % len;

  const itemAt = (center, offset) => items[mod(center + offset)];

  const isSlotVisible = (slotEl) => {
    if (!slotEl) return false;
    return window.getComputedStyle(slotEl).display !== 'none';
  };

  const applyItemToImg = (img, item) => {
    if (!img || !item) return;
    img.src = item.src;
    img.alt = item.alt;
  };

  const updateStatus = () => {
    if (status) {
      status.textContent = `Showing ${items[centerIndex].alt} (${centerIndex + 1} of ${len})`;
    }
  };

  const render = () => {
    slots.forEach(({ offset, currentImg, nextImg, slotEl }) => {
      const item = itemAt(centerIndex, offset);
      applyItemToImg(currentImg, item);
      nextImg.removeAttribute('src');
      nextImg.alt = '';
      nextImg.setAttribute('aria-hidden', 'true');
      slotEl.querySelector('.client-carousel-pan-track')?.classList.remove('is-panning', 'is-panning-instant');
    });
    updateStatus();
  };

  render();

  const clearLoopTimer = () => {
    if (loopTimer !== null) {
      window.clearTimeout(loopTimer);
      loopTimer = null;
    }
  };

  const scheduleNext = () => {
    clearLoopTimer();
    if (panning) return;
    loopTimer = window.setTimeout(runAdvance, pauseMs);
  };

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const finishPan = (nextCenter, animatedTracks) => {
    centerIndex = nextCenter;
    slots.forEach(({ offset, currentImg, nextImg, panTrack }) => {
      panTrack.classList.add('is-panning-instant');
      panTrack.classList.remove('is-panning');
      applyItemToImg(currentImg, itemAt(centerIndex, offset));
      nextImg.removeAttribute('src');
      nextImg.alt = '';
    });

    requestAnimationFrame(() => {
      animatedTracks.forEach((panTrack) => panTrack.classList.remove('is-panning-instant'));
      panning = false;
      updateStatus();
      scheduleNext();
    });
  };

  const runAdvance = () => {
    loopTimer = null;
    if (panning) return;

    if (reducedMotion) {
      centerIndex = mod(centerIndex + 1);
      render();
      scheduleNext();
      return;
    }

    panning = true;
    const nextCenter = mod(centerIndex + 1);
    const animatedSlots = slots.filter(({ slotEl }) => isSlotVisible(slotEl));

    slots.forEach(({ offset, nextImg, panTrack, slotEl }) => {
      panTrack.classList.remove('is-panning-instant', 'is-panning');
      if (!isSlotVisible(slotEl)) return;
      applyItemToImg(nextImg, itemAt(nextCenter, offset));
    });

    if (!animatedSlots.length) {
      finishPan(nextCenter, []);
      return;
    }

    const panTracks = animatedSlots.map((s) => s.panTrack);
    let finished = 0;
    let settled = false;

    const settle = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(fallbackTimer);
      panTracks.forEach((panTrack) => panTrack.removeEventListener('transitionend', onEnd));
      finishPan(nextCenter, panTracks);
    };

    const onEnd = (e) => {
      if (e.propertyName !== 'transform') return;
      finished += 1;
      if (finished < panTracks.length) return;
      settle();
    };

    const fallbackTimer = window.setTimeout(settle, 900);

    requestAnimationFrame(() => {
      panTracks.forEach((panTrack) => panTrack.classList.add('is-panning'));
    });

    panTracks.forEach((panTrack) => panTrack.addEventListener('transitionend', onEnd));
  };

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearLoopTimer();
      return;
    }
    scheduleNext();
  });

  scheduleNext();
}

/* ---------- Services page FAQ (single-open accordion) ---------- */
function initServicesFaq() {
  const accordion = document.getElementById('services-faq');
  if (!accordion) return;

  const items = [...accordion.querySelectorAll('.faq-item')];
  const buttons = items.map((item) => item.querySelector('.faq-question')).filter(Boolean);
  if (!buttons.length) return;

  const closeItem = (item) => {
    const btn = item.querySelector('.faq-question');
    const panel = item.querySelector('.faq-answer');
    if (!btn || !panel) return;
    item.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    panel.hidden = true;
  };

  const openItem = (item) => {
    const btn = item.querySelector('.faq-question');
    const panel = item.querySelector('.faq-answer');
    if (!btn || !panel) return;
    item.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    panel.hidden = false;
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      if (!item) return;

      const isOpen = button.getAttribute('aria-expanded') === 'true';
      items.forEach(closeItem);

      if (!isOpen) openItem(item);
    });
  });
}
