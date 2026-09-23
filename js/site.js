/* Shared helpers: load posts from /blogs, parse front matter, render Markdown. */

const BLOG_DIR = 'blogs';
const INDEX_URL = `${BLOG_DIR}/posts.json`;

/* --- front matter -------------------------------------------------------
   Posts start with an optional YAML-ish block:

     ---
     title: My post
     date: 2026-09-23
     summary: One line shown on the home page.
     tags: [notes, rust]
     ---

   Only flat `key: value` pairs are supported, which is all a blog needs. */
function parseFrontMatter(raw) {
  const text = raw.replace(/^﻿/, '');
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (!match) return { meta: {}, body: text };

  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const pair = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line.trim());
    if (!pair) continue;
    let value = pair[2].trim().replace(/^["'](.*)["']$/, '$1');
    if (/^\[.*\]$/.test(value)) {
      value = value.slice(1, -1).split(',')
        .map((v) => v.trim().replace(/^["'](.*)["']$/, '$1'))
        .filter(Boolean);
    }
    meta[pair[1]] = value;
  }
  return { meta, body: text.slice(match[0].length) };
}

function slugOf(filename) {
  return filename.replace(/\.md$/i, '');
}

function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function tagsHtml(tags) {
  const list = Array.isArray(tags) ? tags : (tags ? [tags] : []);
  if (!list.length) return '';
  return `<span class="tags">${list
    .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
    .join('')}</span>`;
}

async function fetchPostList() {
  const res = await fetch(INDEX_URL, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`${INDEX_URL}: ${res.status}`);
  const files = await res.json();

  const posts = await Promise.all(files.map(async (file) => {
    const url = `${BLOG_DIR}/${file}`;
    const r = await fetch(url, { cache: 'no-cache' });
    if (!r.ok) return null;
    const { meta, body } = parseFrontMatter(await r.text());
    return {
      file,
      slug: slugOf(file),
      title: meta.title || slugOf(file),
      date: meta.date || '',
      summary: meta.summary || body.trim().split(/\r?\n\r?\n/)[0].slice(0, 180),
      tags: meta.tags || [],
    };
  }));

  return posts
    .filter(Boolean)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

function renderPostList(el, posts) {
  if (!posts.length) {
    el.innerHTML = '<p class="error">No posts yet. Drop a .md file in <code>blogs/</code>.</p>';
    return;
  }
  el.innerHTML = `<ul class="post-list">${posts.map((p) => `
    <li>
      <h3><a href="post.html?p=${encodeURIComponent(p.slug)}">${escapeHtml(p.title)}</a></h3>
      <p class="meta">${escapeHtml(formatDate(p.date))}${tagsHtml(p.tags)}</p>
      ${p.summary ? `<p>${escapeHtml(p.summary)}</p>` : ''}
    </li>`).join('')}</ul>`;
}

/* Footer year, on every page that includes this file. */
document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = new Date().getFullYear();
});
