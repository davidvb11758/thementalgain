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

  // The limit comes from the textarea's maxlength so the counter can't drift from it.
  const updateCount = () => {
    if (message && counter) counter.textContent = `${message.value.length} / ${message.maxLength}`;
  };
  if (message && counter) {
    message.addEventListener('input', updateCount);
    updateCount();
  }

  // The form has novalidate, so required fields are checked here.
  const nameInput = document.getElementById('contact-parent-name');
  const emailInput = document.getElementById('contact-email');
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  [nameInput, emailInput].forEach((input) => {
    input?.addEventListener('input', () => input.removeAttribute('aria-invalid'));
  });

  function validate() {
    const problems = [];
    if (nameInput && !nameInput.value.trim()) {
      problems.push({ input: nameInput, text: 'Please enter your name.' });
    }
    if (emailInput) {
      const email = emailInput.value.trim();
      if (!email) {
        problems.push({ input: emailInput, text: 'Please enter your email address.' });
      } else if (!EMAIL_RE.test(email)) {
        problems.push({ input: emailInput, text: 'Please enter a valid email address, like name@example.com.' });
      }
    }
    [nameInput, emailInput].forEach((input) => {
      if (!input) return;
      if (problems.some((p) => p.input === input)) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    });
    return problems;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!status) return;

    const problems = validate();
    if (problems.length) {
      status.textContent = problems.map((p) => p.text).join(' ');
      status.className = 'form-status is-error';
      problems[0].input.focus();
      return;
    }

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
      updateCount();
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
