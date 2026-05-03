// Sid's site — minimal vanilla JS. No dependencies.
(function () {
  'use strict';

  // ─── Theme toggle ──────────────────────────────────────
  const root = document.documentElement;
  function syncThemeIcons() {
    const t = root.getAttribute('data-theme') || 'light';
    document.querySelectorAll('[data-theme-icon]').forEach((el) => {
      el.hidden = el.getAttribute('data-theme-icon') !== t;
    });
  }
  function syncGiscusTheme(t) {
    const iframe = document.querySelector('iframe.giscus-frame');
    if (!iframe) return;
    iframe.contentWindow.postMessage(
      { giscus: { setConfig: { theme: t === 'dark' ? 'dark' : 'light' } } },
      'https://giscus.app'
    );
  }
  function setTheme(t) {
    root.setAttribute('data-theme', t);
    try { localStorage.setItem('theme', t); } catch (e) {}
    syncThemeIcons();
    syncGiscusTheme(t);
  }
  syncThemeIcons();
  // Push the current theme to giscus once its iframe finishes loading.
  window.addEventListener('message', (e) => {
    if (e.origin !== 'https://giscus.app') return;
    if (e.data && e.data.giscus && e.data.giscus.discussion) {
      syncGiscusTheme(root.getAttribute('data-theme') || 'light');
    }
  });
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="toggle-theme"]');
    if (!btn) return;
    setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  // ─── Timeline expand/collapse ──────────────────────────
  // On small screens, force every item to start collapsed regardless of `current`.
  if (window.matchMedia('(max-width: 720px)').matches) {
    document.querySelectorAll('[data-timeline] .tl-item.expanded').forEach((item) => {
      item.classList.remove('expanded');
      item.setAttribute('aria-expanded', 'false');
    });
  }
  document.querySelectorAll('[data-timeline] .tl-item').forEach((item) => {
    const toggle = () => {
      const expanded = item.classList.toggle('expanded');
      item.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    };
    item.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      toggle();
    });
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });

  // ─── List page search ──────────────────────────────────
  document.querySelectorAll('[data-search] input').forEach((input) => {
    const feed = document.querySelector('[data-feed]');
    const empty = document.querySelector('[data-search-empty]');
    if (!feed) return;
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      let visible = 0;
      feed.querySelectorAll('[data-feed-row]').forEach((row) => {
        const hay = row.getAttribute('data-search-text') || '';
        const match = !q || hay.indexOf(q) !== -1;
        row.style.display = match ? '' : 'none';
        if (match) visible++;
      });
      if (empty) empty.hidden = visible !== 0;
    });
  });

  // ─── TOC active highlighting ───────────────────────────
  const tocLinks = document.querySelectorAll('.post-toc a[href^="#"]');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    const map = new Map();
    tocLinks.forEach((a) => {
      const id = decodeURIComponent(a.getAttribute('href').slice(1));
      const el = document.getElementById(id);
      if (el) map.set(el, a);
    });
    const setActive = (link) => {
      tocLinks.forEach((l) => l.classList.remove('active'));
      if (link) link.classList.add('active');
    };
    const obs = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(map.get(visible[0].target));
    }, { rootMargin: '-20% 0px -70% 0px' });
    map.forEach((_, el) => obs.observe(el));
  }

  // ─── Cmd/Ctrl-K search shortcut ────────────────────────
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      const input = document.querySelector('[data-search] input');
      if (input) {
        e.preventDefault();
        input.focus();
      }
    }
  });

  // ─── Nav sliding pill ──────────────────────────────────
  const navEl = document.querySelector('[data-nav]');
  if (navEl) {
    const pill = navEl.querySelector('.nav-pill');
    const links = Array.from(navEl.querySelectorAll('a'));
    const active = navEl.querySelector('a.active');
    function moveTo(el, withTransition) {
      if (!el || !pill) return;
      const r = el.getBoundingClientRect();
      const nr = navEl.getBoundingClientRect();
      if (!withTransition) pill.style.transition = 'none';
      pill.style.width = r.width + 'px';
      pill.style.transform = 'translateX(' + (r.left - nr.left) + 'px)';
      pill.style.opacity = '1';
      if (!withTransition) {
        // Force reflow then restore transition
        // eslint-disable-next-line no-unused-expressions
        pill.offsetHeight;
        pill.style.transition = '';
      }
    }
    function reset() { moveTo(active || links[0], false); }
    requestAnimationFrame(() => moveTo(active || links[0], false));
    links.forEach((a) => {
      // Hover/focus: instantly appear at the link (no slide).
      a.addEventListener('mouseenter', () => moveTo(a, false));
      a.addEventListener('focus', () => moveTo(a, false));
      // Click: slide to the clicked link before page nav (only inter-page slide).
      a.addEventListener('click', () => moveTo(a, true));
    });
    navEl.addEventListener('mouseleave', reset);
    window.addEventListener('resize', () => moveTo(navEl.querySelector('a.active') || links[0], false));
  }
})();
