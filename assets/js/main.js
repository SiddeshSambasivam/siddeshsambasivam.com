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
    const rows = document.querySelectorAll('[data-feed-row]');
    if (!rows.length) return;
    const blocks = document.querySelectorAll('[data-search-block]');
    const groups = document.querySelectorAll('[data-search-group]');
    const empty = document.querySelector('[data-search-empty]');
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      let visibleRows = 0;
      // Per-row matching across the page
      rows.forEach((row) => {
        const hay = row.getAttribute('data-search-text') || '';
        const match = !q || hay.indexOf(q) !== -1;
        row.style.display = match ? '' : 'none';
        if (match) visibleRows++;
      });
      // A series block stays visible if its own metadata matches OR any of its rows match
      blocks.forEach((block) => {
        if (!q) { block.style.display = ''; return; }
        const blockHay = block.getAttribute('data-search-block-text') || '';
        const blockMatch = blockHay.indexOf(q) !== -1;
        const anyRowVisible = Array.from(block.querySelectorAll('[data-feed-row]')).some((r) => r.style.display !== 'none');
        const show = blockMatch || anyRowVisible;
        block.style.display = show ? '' : 'none';
        // If the block matched as a whole, surface all its rows
        if (blockMatch && !anyRowVisible) {
          block.querySelectorAll('[data-feed-row]').forEach((r) => { r.style.display = ''; visibleRows++; });
        }
      });
      // Hide a group entirely if none of its rows or blocks are visible
      groups.forEach((group) => {
        const anyVisible = Array.from(group.children).some((c) => c.style.display !== 'none');
        group.style.display = anyVisible ? '' : 'none';
      });
      // Hide a section (header + group) if none of its rows or blocks are visible
      document.querySelectorAll('[data-search-section]').forEach((section) => {
        const anyVisible = section.querySelectorAll('[data-feed-row]:not([style*="display: none"]), [data-search-block]:not([style*="display: none"])').length > 0;
        section.style.display = anyVisible || !q ? '' : 'none';
      });
      if (empty) empty.hidden = visibleRows !== 0;
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

  // ─── Sortable / filterable tables (.doc-article tables wrapped by {{< table >}}) ─────
  function initTables() {
    document.querySelectorAll('[data-table-mount]').forEach((mount) => {
      const table = mount.querySelector('table');
      if (!table) return;
      if (mount.getAttribute('data-sortable') === 'true') {
        table.classList.add('sortable');
        const ths = table.querySelectorAll('thead th');
        ths.forEach((th, idx) => {
          th.addEventListener('click', () => {
            const cur = th.getAttribute('data-sort');
            const dir = cur === 'asc' ? 'desc' : 'asc';
            ths.forEach((t) => t.removeAttribute('data-sort'));
            th.setAttribute('data-sort', dir);
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));
            rows.sort((a, b) => {
              const av = (a.children[idx]?.textContent || '').trim();
              const bv = (b.children[idx]?.textContent || '').trim();
              const an = parseFloat(av.replace(/[^0-9.\-]/g, ''));
              const bn = parseFloat(bv.replace(/[^0-9.\-]/g, ''));
              const numeric = !isNaN(an) && !isNaN(bn) && av.match(/[0-9]/) && bv.match(/[0-9]/);
              let cmp = numeric ? an - bn : av.localeCompare(bv);
              return dir === 'asc' ? cmp : -cmp;
            });
            rows.forEach((r) => tbody.appendChild(r));
          });
        });
      }
    });
    document.querySelectorAll('[data-table-filter]').forEach((input) => {
      const id = input.getAttribute('data-table-filter');
      const mount = document.querySelector(`[data-table-mount="${id}"]`);
      if (!mount) return;
      const table = mount.querySelector('table');
      if (!table) return;
      input.addEventListener('input', () => {
        const q = input.value.toLowerCase().trim();
        table.querySelectorAll('tbody tr').forEach((tr) => {
          const text = tr.textContent.toLowerCase();
          tr.style.display = !q || text.includes(q) ? '' : 'none';
        });
      });
    });
  }
  initTables();

  // ─── Methods map (interactive 2D plot) ─────────────
  function initMethodsMaps() {
    document.querySelectorAll('.methods-map').forEach((root) => {
      const info = root.querySelector('[data-mm-info]');
      const nameEl = root.querySelector('[data-mm-name]');
      const descEl = root.querySelector('[data-mm-desc]');
      const tagsEl = root.querySelector('[data-mm-tags]');
      const pills = root.querySelectorAll('.mm-pill, .mm-dot');
      function select(pill) {
        pills.forEach((d) => d.classList.remove('active'));
        pill.classList.add('active');
        if (nameEl) nameEl.textContent = pill.getAttribute('data-name') || '';
        if (descEl) descEl.textContent = pill.getAttribute('data-desc') || '';
        if (tagsEl) {
          const t = (pill.getAttribute('data-type') || '').split(',').map(s => s.trim()).filter(Boolean);
          tagsEl.innerHTML = t.map(x => `<span class="tag">${x}</span>`).join('');
        }
      }
      pills.forEach((pill) => {
        pill.addEventListener('click', (e) => { e.preventDefault(); select(pill); });
        pill.addEventListener('focus', () => select(pill));
      });
      if (pills.length) select(pills[0]);
    });
  }
  initMethodsMaps();

  // ─── TOC scroll-spy for .doc-toc ────────────────────
  function initDocToc() {
    const toc = document.querySelector('.doc-toc #TableOfContents');
    if (!toc) return;
    const links = Array.from(toc.querySelectorAll('a[href^="#"]'));
    if (!links.length) return;
    const map = new Map();
    links.forEach((a) => {
      const id = decodeURIComponent(a.getAttribute('href').slice(1));
      const el = document.getElementById(id);
      if (el) map.set(el, a);
    });
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const a = map.get(entry.target);
        if (!a) return;
        if (entry.isIntersecting) {
          links.forEach((l) => l.classList.remove('active'));
          a.classList.add('active');
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });
    map.forEach((_, el) => obs.observe(el));
  }
  initDocToc();

  // ─── Refs: highlight target on click ────────────────
  function initRefs() {
    document.querySelectorAll('a.ref-cite[href^="#ref-"]').forEach((a) => {
      a.addEventListener('click', () => {
        const id = a.getAttribute('href').slice(1);
        const el = document.getElementById(id);
        if (!el) return;
        document.querySelectorAll('.ref-item.target').forEach((x) => x.classList.remove('target'));
        el.classList.add('target');
        setTimeout(() => el.classList.remove('target'), 1600);
      });
    });
  }
  initRefs();
})();
