/* Load text_content/service-*.md into elements whose id matches each **ID:** block. */

document.addEventListener('DOMContentLoaded', () => {
  initServiceDetailContent();
});

async function initServiceDetailContent() {
  const mdUrl = document.documentElement.dataset.pageContent;
  if (!mdUrl) return;

  try {
    const res = await fetch(mdUrl, { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    applyMarkdownIds(await res.text());
  } catch (err) {
    console.warn('Could not load service detail markdown:', err);
    const status = document.getElementById('page-content-status');
    if (status) {
      status.textContent = 'Page copy could not be loaded. Serve the site over HTTP and refresh.';
      status.hidden = false;
    }
  }
}

function applyMarkdownIds(text) {
  for (const { id, raw } of parseIdBlocks(text)) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = inlineMarkdownToHtml(raw);
  }
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
    const paraLines = [];

    while (i < lines.length) {
      const line = lines[i];
      if (/^\*\*ID:\*\* `/.test(line)) break;
      if (/^\*\*Image/.test(line)) break;
      if (/^#{1,4} /.test(line)) break;
      if (line === '---') break;
      if (/^\*\(/.test(line.trim())) break;
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
