/* Load text_content/about.md into elements whose id matches each **ID:** block. */

document.addEventListener('DOMContentLoaded', () => {
  initAboutContent();
});

async function initAboutContent() {
  const mdUrl = document.documentElement.dataset.pageContent;
  if (!mdUrl) return;

  try {
    const res = await fetch(mdUrl, { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    applyAboutMarkdown(await res.text());
  } catch (err) {
    console.warn('Could not load about.md:', err);
    const status = document.getElementById('page-content-status');
    if (status) {
      status.textContent = 'Page copy could not be loaded. Serve the site over HTTP and refresh.';
      status.hidden = false;
    }
  }
}

function applyAboutMarkdown(text) {
  for (const { id, paragraphs } of parseIdBlocks(text)) {
    const el = document.getElementById(id);
    if (!el) continue;
    el.innerHTML = paragraphsToHtml(paragraphs, el.tagName);
  }
}

function paragraphsToHtml(paragraphs, tagName = 'DIV') {
  if (!paragraphs.length) return '';
  const htmlParts = paragraphs.map((p) => inlineMarkdownToHtml(p));
  if (tagName === 'H1' || tagName === 'H2' || tagName === 'H3') return htmlParts[0];
  if (htmlParts.length === 1) return htmlParts[0];
  return htmlParts.map((h) => `<p>${h}</p>`).join('');
}

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
    const paragraphs = [];
    let current = [];

    while (i < lines.length) {
      const line = lines[i];

      if (/^\*\*ID:\*\* `/.test(line)) break;
      if (/^#{1,4} /.test(line)) break;
      if (line === '---') break;
      if (/^\*\(/.test(line.trim())) break;
      if (/^-\s/.test(line) && current.length === 0 && paragraphs.length === 0) break;

      if (line.trim() === '') {
        if (current.length) {
          paragraphs.push(current.join(' ').trim());
          current = [];
        }
        i += 1;
        continue;
      }

      current.push(line);
      i += 1;
    }

    if (current.length) paragraphs.push(current.join(' ').trim());
    if (paragraphs.length) blocks.push({ id, paragraphs });
  }

  return blocks;
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
