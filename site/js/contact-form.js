/* Contact form → Web3Forms (https://web3forms.com) */

document.addEventListener('DOMContentLoaded', () => {
  initContactForm();
});

function initContactForm() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('contact-form-status');
  const message = document.getElementById('contact-message');
  const counter = document.getElementById('contact-message-count');
  if (!form) return;

  if (message && counter) {
    const updateCount = () => {
      counter.textContent = `${message.value.length} / 180`;
    };
    message.addEventListener('input', updateCount);
    updateCount();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!status) return;

    const accessKey = form.querySelector('input[name="access_key"]')?.value?.trim();
    if (!accessKey || accessKey === 'YOUR_WEB3FORMS_ACCESS_KEY') {
      status.textContent = 'Form is not connected yet. Replace YOUR_WEB3FORMS_ACCESS_KEY in contact.html with your Web3Forms access key.';
      status.className = 'form-status is-error';
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    status.textContent = 'Sending…';
    status.className = 'form-status';

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Submission failed');
      }
      form.reset();
      if (message && counter) counter.textContent = '0 / 180';
      status.textContent = 'Thank you! Your message was sent. We will be in touch soon.';
      status.className = 'form-status is-success';
    } catch (err) {
      status.textContent = 'Sorry, something went wrong. Please try again or email TheMentalGain@gmail.com directly.';
      status.className = 'form-status is-error';
    } finally {
      button.disabled = false;
    }
  });
}
