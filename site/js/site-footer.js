/* Inject shared footer from partials/site-footer.html (requires HTTP). */

document.addEventListener('DOMContentLoaded', () => {
  initSiteFooter();
});

async function initSiteFooter() {
  const footer = document.getElementById('site-footer');
  if (!footer || footer.dataset.footerLoaded === 'true') return;

  const root = footer.dataset.root ?? '';
  const partialUrl = `${root}partials/site-footer.html`;

  try {
    const res = await fetch(partialUrl, { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const html = (await res.text()).replaceAll('@ROOT@', root);
    footer.innerHTML = html;
    footer.dataset.footerLoaded = 'true';
  } catch (err) {
    console.warn('Could not load site footer:', err);
  }
}
