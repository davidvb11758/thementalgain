/* Shared footer — markup lives here so deploy always includes updates (partials/site-footer.html is the edit source; keep in sync). */

const SITE_FOOTER_HTML = `<div class="site-footer-bg" aria-hidden="true"></div>
<div class="container">
  <div class="footer-grid">
    <div class="footer-cta">
      <h2 class="section-title section-title--on-dark section-title--start">Let&rsquo;s work together.</h2>
      <p>Take the first step toward improved mental performance. This isn't a traditional "get tougher" conversation. We can discuss where you are and where you want to be. Everybody's journey is different. Together let's explore you and your situation. The time is right for you to improve your MENTAL game – what do YOU have to GAIN?</p>
      <a class="btn-light" href="@ROOT@contact.html">Contact Me</a>
    </div>

    <div class="footer-col">
      <h4>Navigation</h4>
      <ul>
        <li><a href="@ROOT@index.html">Home</a></li>
        <li><a href="@ROOT@services.html">Services</a></li>
        <li><a href="@ROOT@my-clients.html">My Clients</a></li>
        <li><a href="@ROOT@contact.html">Contact Us</a></li>
        <li><a href="@ROOT@about.html">About TMG</a></li>
        <li><a href="@ROOT@book-me.html">Book Me</a></li>
      </ul>
    </div>

    <div class="footer-col">
      <h4>Connect</h4>
      <div class="footer-social-links">
        <a class="social" href="https://www.instagram.com/the.mental.gain/" target="_blank" rel="noopener noreferrer" aria-label="The Mental Gain on Instagram">
          <svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/></svg>
        </a>
        <a class="social" href="https://open.spotify.com/show/033xKJypywgs6kCIGq360y" target="_blank" rel="noopener noreferrer" aria-label="The Full Approach podcast on Spotify">
          <svg viewBox="0 0 496 512" aria-hidden="true"><path fill="currentColor" d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm114.5 357.2c-3.9 6.4-12.1 8.5-18.6 4.6-51.1-31.2-115.4-38.3-191.1-20.8-7.2 1.6-14.4-2.9-16-10s2.9-14.4 10-16c83.9-19.1 155.3-10.7 212.3 25.5 6.4 3.9 8.5 12.1 4.6 18.6zm29.6-65.3c-4.9 7.9-15.3 10.4-23.2 5.5-58.5-35.9-147.7-46.3-216.9-25.3-8.9 2.7-18.3-2.3-21-11.1-2.7-8.9 2.3-18.3 11.1-21 79.1-24 177.8-12.3 245.3 30.9 7.9 4.9 10.4 15.3 5.5 23.2zm4.7-68.2c-70.5-41.9-187-51.1-254.5-28-10.1 3.2-20.8-2.6-24-12.6-3.2-10.1 2.6-20.8 12.6-24 77.1-23.3 206.5-12.5 290 36.8 9.1 5.4 12.6 17.1 7.1 26.2-5.5 9.1-17.1 12.6-26.2 7.1z"/></svg>
        </a>
      </div>
    </div>
  </div>

  <p class="copyright">© TheMentalGain.com</p>
</div>`;

document.addEventListener('DOMContentLoaded', () => {
  initSiteFooter();
});

function initSiteFooter() {
  const footer = document.getElementById('site-footer');
  if (!footer || footer.dataset.footerLoaded === 'true') return;

  const root = footer.dataset.root ?? '';
  footer.innerHTML = SITE_FOOTER_HTML.replaceAll('@ROOT@', root);
  footer.dataset.footerLoaded = 'true';
}
