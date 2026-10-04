/* =========================================================
   Load paragraph copy from text_content/home.md into
   elements whose id matches each **ID:** block.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initHomeContent();
});

async function initHomeContent() {
  const root = document.documentElement;
  const mdUrl = root.dataset.homeContent;
  if (!mdUrl) return;

  try {
    const res = await fetch(mdUrl, { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const text = await res.text();
    applyHomeMarkdown(text);
  } catch (err) {
    console.warn('Could not load home.md:', err);
    const status = document.getElementById('home-content-status');
    if (status) {
      status.textContent = 'Page copy could not be loaded. Refresh or check that the site is served over HTTP.';
      status.hidden = false;
    }
  }
}

function applyHomeMarkdown(text) {
  const blocks = parseIdBlocks(text);
  for (const { id, raw } of blocks) {
    const el = document.getElementById(id);
    if (!el) continue;
    el.innerHTML = inlineMarkdownToHtml(raw);
  }

  applyNewsletterHints(text);
}

/** Blocks between **ID:** `code` and the next ID, heading, ---, or editor note line. */
function parseIdBlocks(text) {
  const lines = text.split(/\r?\n/);
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const idMatch = lines[i].match(/^\*\*ID:\*\* `([^`]+)`\s*$/);
    if (!idMatch) {
      i += 1;
      continue;
    }

    const id = idMatch[1];
    i += 1;
    const paraLines = [];

    while (i < lines.length) {
      const line = lines[i];

      if (/^\*\*ID:\*\* `/.test(line)) break;
      if (/^#{1,4} /.test(line)) break;
      if (line === '---') break;
      if (/^\*\(/.test(line.trim())) break;
      if (/^\*Form label:/.test(line)) break;
      if (/^\*Button text:/.test(line)) break;
      if (/^\*Success message:/.test(line)) break;
      if (/^\*\*Links:\*\*/.test(line)) break;
      if (/^\*\*Listen on:\*\*/.test(line)) break;
      if (/^-\s/.test(line) && paraLines.length === 0) break;

      if (line.trim() === '') {
        if (paraLines.length === 0) {
          i += 1;
          continue;
        }
        break;
      }

      paraLines.push(line);
      i += 1;
    }

    const raw = paraLines.join(' ').trim();
    if (raw) blocks.push({ id, raw });
  }

  return blocks;
}

function applyNewsletterHints(text) {
  const label = text.match(/\*Form label:\* (.+?)(?: \*Button text:|\n\*Button text:)/s);
  const button = text.match(/\*Button text:\* (.+?)(?: \*Success message:|\n\*Success message:)/s);
  const success = text.match(/\*Success message:\* (.+?)(?:\n---|\n## |\s*$)/s);

  const unescapeMd = (s) => s.replace(/\\!/g, '!').replace(/\\\[/g, '[').replace(/\\\]/g, ']');

  const input = document.getElementById('newsletter-email');
  if (input && label) input.placeholder = unescapeMd(label[1].trim());

  const form = document.getElementById('newsletter-form');
  if (form && button) {
    const btn = form.querySelector('button[type="submit"]');
    if (btn) btn.textContent = unescapeMd(button[1].trim());
  }

  if (success) {
    document.documentElement.dataset.newsletterSuccess = unescapeMd(success[1].trim());
  }
}

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inlineMarkdownToHtml(raw) {
  let s = escapeHtml(
    raw.replace(/\\!/g, '!').replace(/\\\[/g, '[').replace(/\\\]/g, ']')
  );

  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    const safeHref = href.replace(/"/g, '%22');
    return `<a href="${safeHref}">${label}</a>`;
  });

  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  return s;
}
