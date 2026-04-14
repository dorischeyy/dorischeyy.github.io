/* ─── Config ──────────────────────────────────────── */
const CONFIG = {
  blogName: '我的博客',
  blogDesc: '记录想法与生活',
  // Giscus 评论配置：请前往 https://giscus.app 获取你的参数
  giscus: {
    repo:        'your-username/your-repo',       // 替换为你的 GitHub 仓库
    repoId:      'YOUR_REPO_ID',
    category:    'Announcements',
    categoryId:  'YOUR_CATEGORY_ID',
    mapping:     'pathname',
    lang:        'zh-CN',
  }
};

/* ─── Theme ───────────────────────────────────────── */
function initTheme() {
  const saved = localStorage.getItem('theme');
  const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  setTheme(saved || preferred);
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  const btn = document.getElementById('theme-btn');
  if (btn) btn.textContent = theme === 'dark' ? '☀' : '☾';
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');

  // 重新加载 Giscus 以切换主题
  const frame = document.querySelector('iframe.giscus-frame');
  if (frame) {
    frame.contentWindow.postMessage(
      { giscus: { setConfig: { theme: current === 'dark' ? 'light' : 'dark_dimmed' } } },
      'https://giscus.app'
    );
  }
}

/* ─── Nav active link ─────────────────────────────── */
function initNav() {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    if (href === path) a.classList.add('active');
  });
}

/* ─── Fetch helpers ───────────────────────────────── */
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.text();
}

/* ─── Reading time ────────────────────────────────── */
function readingTime(text) {
  const words = text.replace(/<[^>]*>/g, '').length;
  const mins = Math.max(1, Math.round(words / 400));
  return `${mins} 分钟读完`;
}

/* ─── Date format ─────────────────────────────────── */
function formatDate(str) {
  const d = new Date(str);
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}

/* ─── TAG FILTER (index & tags pages) ────────────── */
let allPosts = [];
let activeTag = 'all';

function renderStatsBar(posts) {
  const bar = document.getElementById('stats-bar');
  if (!bar) return;

  const counts = {};
  posts.forEach(p => p.tags.forEach(t => counts[t] = (counts[t] || 0) + 1));

  const tagItems = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, n]) => `<span class="stats-tag" data-tag="${tag}">${tag} <em>${n}</em></span>`)
    .join('');

  bar.innerHTML = `
    <span class="stats-total">共 <em>${posts.length}</em> 篇</span>
    <span class="stats-divider">·</span>
    ${tagItems}`;

  bar.querySelectorAll('.stats-tag').forEach(el => {
    el.addEventListener('click', () => {
      activeTag = el.dataset.tag;
      document.querySelectorAll('.tag-bar .tag').forEach(t =>
        t.classList.toggle('active', t.dataset.tag === activeTag)
      );
      renderPostList(allPosts, activeTag);
    });
  });
}

function renderTagBar(posts, containerId) {
  const counts = {};
  posts.forEach(p => p.tags.forEach(t => counts[t] = (counts[t] || 0) + 1));

  const tags = ['all', ...new Set(posts.flatMap(p => p.tags))];
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = tags.map(t =>
    `<span class="tag${t === activeTag ? ' active' : ''}" data-tag="${t}">
      ${t === 'all' ? `全部 <em class="tag-count">${posts.length}</em>` : `${t} <em class="tag-count">${counts[t] || 0}</em>`}
    </span>`
  ).join('');

  container.querySelectorAll('.tag').forEach(el => {
    el.addEventListener('click', () => {
      activeTag = el.dataset.tag;
      container.querySelectorAll('.tag').forEach(t =>
        t.classList.toggle('active', t.dataset.tag === activeTag)
      );
      renderPostList(allPosts, activeTag);
    });
  });
}

function renderPostList(posts, tag) {
  const list = document.getElementById('post-list');
  if (!list) return;

  const filtered = tag === 'all' ? posts : posts.filter(p => p.tags.includes(tag));

  if (!filtered.length) {
    list.innerHTML = `<div class="empty-state">该标签下暂无文章</div>`;
    return;
  }

  list.innerHTML = `<ul class="post-list">${filtered.map(post => `
    <li class="post-item">
      <a class="post-item-title" href="post.html?slug=${post.slug}">${post.title}</a>
      <div class="post-item-meta">
        <span>${formatDate(post.date)}</span>
      </div>
      <p class="post-item-excerpt">${post.excerpt}</p>
      <div class="post-item-tags">
        ${post.tags.map(t => `<span class="tag" data-tag="${t}">${t}</span>`).join('')}
      </div>
    </li>`).join('')}</ul>`;

  // tag clicks in list → filter
  list.querySelectorAll('.tag').forEach(el => {
    el.addEventListener('click', () => {
      activeTag = el.dataset.tag;
      document.querySelectorAll('.tag-bar .tag').forEach(t =>
        t.classList.toggle('active', t.dataset.tag === activeTag)
      );
      renderPostList(allPosts, activeTag);
    });
  });
}

/* ─── INDEX PAGE ──────────────────────────────────── */
async function initIndex() {
  const list = document.getElementById('post-list');
  if (!list) return;

  // check URL for tag param
  const params = new URLSearchParams(location.search);
  if (params.get('tag')) activeTag = params.get('tag');

  list.innerHTML = `<div class="loading">加载中…</div>`;
  try {
    allPosts = await fetchJSON('./posts/index.json');
    allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    renderStatsBar(allPosts);
    renderTagBar(allPosts, 'tag-bar');
    renderPostList(allPosts, activeTag);
  } catch (e) {
    list.innerHTML = `<div class="empty-state">加载失败，请刷新重试</div>`;
  }
}

/* ─── POST PAGE ───────────────────────────────────── */
async function initPost() {
  const content = document.getElementById('post-content');
  if (!content) return;

  const params = new URLSearchParams(location.search);
  const slug = params.get('slug');
  if (!slug) { content.innerHTML = `<div class="empty-state">找不到文章</div>`; return; }

  content.innerHTML = `<div class="loading">加载中…</div>`;

  try {
    const [posts, raw] = await Promise.all([
      fetchJSON('./posts/index.json'),
      fetchText(`./posts/${slug}.md`)
    ]);

    const meta = posts.find(p => p.slug === slug) || {};
    const html = marked.parse(raw);

    // Update page title
    if (meta.title) document.title = `${meta.title} · ${CONFIG.blogName}`;

    content.innerHTML = `
      <header class="post-header">
        <h1 class="post-title">${meta.title || slug}</h1>
        <div class="post-meta">
          <span>${formatDate(meta.date || '')}</span>
          <span>${readingTime(raw)}</span>
        </div>
        <div class="post-tags">
          ${(meta.tags || []).map(t =>
            `<a class="tag" href="tags.html?tag=${t}">${t}</a>`
          ).join('')}
        </div>
      </header>
      <div class="post-body">${html}</div>
      <footer class="post-footer">
        <span>发布于：${formatDate(meta.date || '')}</span>
        ${meta.updated && meta.updated !== meta.date
          ? `<span>最后更新：${formatDate(meta.updated)}</span>`
          : ''}
        <span id="busuanzi_container_page_pv">
          <span id="busuanzi_value_page_pv">—</span> 次查看
        </span>
      </footer>`;

    // Syntax highlight
    content.querySelectorAll('pre code').forEach(block => {
      if (window.hljs) hljs.highlightElement(block);
    });

    // Add heading IDs for TOC anchors
    content.querySelectorAll('h2, h3').forEach((el, i) => {
      if (!el.id) el.id = `heading-${i}`;
    });

    buildTOC();
    initScrollSpy();
    initComments(slug);

  } catch (e) {
    content.innerHTML = `<div class="empty-state">文章加载失败：${e.message}</div>`;
  }
}

/* ─── Table of Contents ───────────────────────────── */
function buildTOC() {
  const toc = document.getElementById('toc');
  if (!toc) return;

  const headings = document.querySelectorAll('.post-body h2, .post-body h3');
  if (headings.length < 2) {
    toc.closest('.toc-sidebar').style.display = 'none';
    return;
  }

  const items = Array.from(headings).map(h => ({
    id: h.id,
    text: h.textContent,
    depth: parseInt(h.tagName[1])
  }));

  toc.innerHTML = `
    <div class="toc-progress">
      <div class="toc-progress-track">
        <div class="toc-progress-fill" id="toc-progress-fill"></div>
        <span class="toc-progress-pct" id="toc-progress-pct">0%</span>
      </div>
    </div>
    <ul class="toc-list">${items.map(item =>
      `<li class="toc-item depth-${item.depth}">
        <a class="toc-link" href="#${item.id}">${item.text}</a>
      </li>`
    ).join('')}</ul>`;
}

/* ─── Scroll spy for TOC ─────────────────────────── */
function initScrollSpy() {
  const headings = Array.from(document.querySelectorAll('.post-body h2, .post-body h3'));
  if (!headings.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.toc-link').forEach(a =>
          a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`)
        );
      }
    });
  }, { rootMargin: `-${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'))}px 0px -70% 0px` });

  headings.forEach(h => observer.observe(h));
}

/* ─── Giscus Comments ─────────────────────────────── */
function initComments(slug) {
  const container = document.getElementById('giscus-container');
  if (!container) return;

  const theme = document.documentElement.getAttribute('data-theme') === 'dark'
    ? 'dark_dimmed' : 'light';

  const script = document.createElement('script');
  script.src = 'https://giscus.app/client.js';
  script.setAttribute('data-repo',            CONFIG.giscus.repo);
  script.setAttribute('data-repo-id',         CONFIG.giscus.repoId);
  script.setAttribute('data-category',        CONFIG.giscus.category);
  script.setAttribute('data-category-id',     CONFIG.giscus.categoryId);
  script.setAttribute('data-mapping',         CONFIG.giscus.mapping);
  script.setAttribute('data-strict',          '0');
  script.setAttribute('data-reactions-enabled', '0');  // 不启用点赞
  script.setAttribute('data-emit-metadata',   '0');
  script.setAttribute('data-input-position',  'top');
  script.setAttribute('data-theme',           theme);
  script.setAttribute('data-lang',            CONFIG.giscus.lang);
  script.crossOrigin = 'anonymous';
  script.async = true;
  container.appendChild(script);
}

/* ─── TAGS PAGE ───────────────────────────────────── */
async function initTagsPage() {
  const cloud = document.getElementById('tags-cloud');
  const listSection = document.getElementById('tag-posts-section');
  if (!cloud) return;

  const params = new URLSearchParams(location.search);
  activeTag = params.get('tag') || 'all';

  try {
    allPosts = await fetchJSON('./posts/index.json');
    allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Count tags
    const counts = {};
    allPosts.forEach(p => p.tags.forEach(t => counts[t] = (counts[t] || 0) + 1));

    cloud.innerHTML = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, n]) =>
        `<a class="tag-cloud-item${activeTag === tag ? ' active' : ''}" data-tag="${tag}">
          ${tag}<span class="tag-cloud-count">${n}</span>
        </a>`
      ).join('');

    cloud.querySelectorAll('.tag-cloud-item').forEach(el => {
      el.addEventListener('click', () => {
        activeTag = el.dataset.tag;
        cloud.querySelectorAll('.tag-cloud-item').forEach(t =>
          t.classList.toggle('active', t.dataset.tag === activeTag)
        );
        renderTaggedPosts();
        history.replaceState(null, '', `?tag=${activeTag}`);
      });
    });

    renderTaggedPosts();

  } catch (e) {
    cloud.innerHTML = `<div class="empty-state">加载失败</div>`;
  }
}

function renderTaggedPosts() {
  const section = document.getElementById('tag-posts-section');
  if (!section) return;

  const posts = activeTag === 'all'
    ? allPosts
    : allPosts.filter(p => p.tags.includes(activeTag));

  const title = activeTag === 'all' ? '全部文章' : `# ${activeTag}`;

  section.innerHTML = `
    <p class="section-title">${title} · ${posts.length} 篇</p>
    ${posts.length ? `<ul class="post-list">${posts.map(post => `
      <li class="post-item">
        <a class="post-item-title" href="post.html?slug=${post.slug}">${post.title}</a>
        <div class="post-item-meta">
          <span>${formatDate(post.date)}</span>
        </div>
        <p class="post-item-excerpt">${post.excerpt}</p>
        <div class="post-item-tags">
          ${post.tags.map(t => `<span class="tag">${t}</span>`).join('')}
        </div>
      </li>`).join('')}</ul>`
    : `<div class="empty-state">该标签下暂无文章</div>`}`;
}

/* ─── Reading progress bar ───────────────────────── */
function initReadingProgress() {
  const topBar  = document.getElementById('reading-progress');
  const tocFill = document.getElementById('toc-progress-fill');
  const tocPct  = document.getElementById('toc-progress-pct');
  if (!topBar && !tocFill) return;

  window.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    const pct = scrollHeight > clientHeight
      ? Math.round((scrollTop / (scrollHeight - clientHeight)) * 100)
      : 0;

    if (topBar)  topBar.style.width = `${pct}%`;
    if (tocFill) tocFill.style.width = `${pct}%`;
    if (tocPct)  tocPct.textContent  = `${pct}%`;
  }, { passive: true });
}

/* ─── Init ────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNav();

  const page = location.pathname.split('/').pop() || 'index.html';
  if (page === 'index.html' || page === '')   initIndex();
  if (page === 'post.html')                 { initPost(); initReadingProgress(); }
  if (page === 'tags.html')                   initTagsPage();

  const themeBtn = document.getElementById('theme-btn');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
});
