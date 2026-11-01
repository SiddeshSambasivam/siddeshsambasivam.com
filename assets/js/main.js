// Sid's site — minimal vanilla JS. No dependencies.
(function () {
  'use strict';

  // Sends an Umami event when the analytics script loaded (production with an ID set).
  function track(name, data) {
    if (window.umami) window.umami.track(name, data);
  }

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
      // Keys pressed on a control inside the item (the View more button) belong to that control.
      if (e.target !== item) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });

  // "View more" inside a timeline item reveals the rest of its bullets without collapsing the item.
  document.querySelectorAll('[data-tl-more]').forEach((button) => {
    const more = button.previousElementSibling;
    const label = button.textContent;
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = more.classList.toggle('open');
      more.inert = !open;
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      button.textContent = open ? 'Show less' : label;
      if (open) track('work-view-more', { role: button.closest('.tl-item').querySelector('.tl-role').textContent.trim() });
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
      const pills = root.querySelectorAll('.mm-point, .mm-pill, .mm-dot');
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

  // ─── Flow diagrams (agent-workflow, plan-lifecycle shortcodes) ─────
  // Clicking a node, or Previous and Next, shows that node's detail. A diagram with
  // data-flow-autoplay also steps on its own until the reader takes over.
  function initFlows() {
    document.querySelectorAll('[data-flow]').forEach((root) => {
      const nodes = [...root.querySelectorAll('[data-flow-node]')];
      const details = root.querySelectorAll('[data-flow-detail]');
      const prev = root.querySelector('[data-flow-step="-1"]');
      const next = root.querySelector('[data-flow-step="1"]');
      let current = Math.max(0, nodes.findIndex((n) => n.getAttribute('aria-pressed') === 'true'));
      let autoplay = null;
      const gate = initFlowGate(root, nodes);
      function select(i) {
        current = Math.min(Math.max(i, 0), nodes.length - 1);
        const id = nodes[current].getAttribute('data-flow-node');
        nodes.forEach((n, k) => n.setAttribute('aria-pressed', String(k === current)));
        details.forEach((d) => { d.hidden = d.getAttribute('data-flow-detail') !== id; });
        if (prev) prev.disabled = current === 0;
        if (next) next.disabled = current === nodes.length - 1;
        if (gate) gate.show(current);
      }
      // The reader's own choice ends autoplay. Autoplay calls select() directly.
      const takeOver = () => { if (autoplay) autoplay.stop(); };
      nodes.forEach((n, k) => n.addEventListener('click', () => { takeOver(); select(k); }));
      if (prev) prev.addEventListener('click', () => { takeOver(); select(current - 1); });
      if (next) next.addEventListener('click', () => { takeOver(); select(current + 1); });
      autoplay = initFlowAutoplay(root, () => select((current + 1) % nodes.length));
      // A playing diagram tells the story from the first step.
      select(autoplay && autoplay.playing() ? 0 : current);
      root.setAttribute('data-flow-ready', '');
    });
  }
  // The lifecycle's gate: the score fills the gate state's card and the badge counts up,
  // and the arrow opens at the target. Before the gate state the score is empty, at it
  // the score climbs, and after it the gate stays open. Returns show(index), or null.
  function initFlowGate(root, nodes) {
    const gateIndex = nodes.findIndex((n) => n.hasAttribute('data-gate'));
    if (gateIndex < 0) return null;
    const target = Number(root.getAttribute('data-gate-target'));
    const badge = root.querySelector('[data-gate-badge]');
    const peak = Math.min(100, target + 5);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let climbing = null;
    function set(value) {
      const open = value >= target;
      root.style.setProperty('--score', value);
      root.toggleAttribute('data-gate-open', open);
      if (badge) badge.textContent = value === 0 ? 'Score ≥ ' + target : open ? 'Open · ' + value : 'Score ' + value + ' / ' + target;
    }
    function climb() {
      if (reduce.matches) return set(peak);
      let value = 0;
      set(value);
      climbing = setInterval(() => {
        value = Math.min(value + 2, peak);
        set(value);
        if (value === peak) clearInterval(climbing);
      }, 55);
    }
    return {
      show(index) {
        clearInterval(climbing);
        if (index === gateIndex) return climb();
        // States on the main path after the gate passed it. A side state (Archived) didn't.
        const passed = index > gateIndex && !nodes[index].classList.contains('lc-side');
        set(passed ? peak : 0);
      },
    };
  }
  // Steps a diagram every data-flow-autoplay ms while it is on screen, unless the reader
  // paused it, is pointing at or focused on its content, or asked for less motion.
  // Returns stop(), for when the reader takes over.
  function initFlowAutoplay(root, step) {
    const ms = Number(root.getAttribute('data-flow-autoplay'));
    const button = root.querySelector('[data-flow-play]');
    if (!ms || !button) return null;
    const details = root.querySelector('.flow-details');
    const content = [root.firstElementChild, details];
    let playing = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let onScreen = false;
    let held = false;
    let timer = null;
    root.style.setProperty('--flow-step-ms', ms + 'ms');
    function sync() {
      const running = playing && onScreen && !held;
      button.setAttribute('aria-pressed', String(playing));
      button.setAttribute('aria-label', playing ? 'Pause' : 'Play the states in turn');
      button.setAttribute('data-tip', playing ? 'Pause' : 'Play');
      // Screen readers hear each state the reader picks, not every automatic step.
      details.setAttribute('aria-live', running ? 'off' : 'polite');
      clearTimeout(timer);
      root.removeAttribute('data-flow-ticking');
      if (!running) return;
      void root.offsetWidth; // restarts the progress bar
      root.setAttribute('data-flow-ticking', '');
      timer = setTimeout(() => { step(); sync(); }, ms);
    }
    button.hidden = false;
    button.addEventListener('click', () => { playing = !playing; sync(); });
    content.forEach((el) => {
      el.addEventListener('pointerenter', () => { held = true; sync(); });
      el.addEventListener('pointerleave', () => { held = false; sync(); });
      el.addEventListener('focusin', () => { held = true; sync(); });
      el.addEventListener('focusout', () => { held = false; sync(); });
    });
    sync();
    new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; sync(); }, { threshold: 0.4 }).observe(root);
    return { stop() { playing = false; sync(); }, playing: () => playing };
  }
  initFlows();

  // ─── Alignment example (align-demo shortcode) ──────
  // Scores the way OpenPlan does (src/lib/alignmentScore.ts): up to 80 for areas
  // settled out of the required ones plus any other settled area, and 5 for each
  // answer that says why, up to 20.
  const REQUIRED_AREAS = ['edge cases', 'error handling', 'scale'];
  function alignmentScore(messages) {
    const settled = new Set();
    let reasoned = 0;
    messages.forEach((m) => {
      if (!m.hasAttribute('data-answered')) return;
      settled.add(m.getAttribute('data-aspect').trim().toLowerCase());
      if (m.hasAttribute('data-reasoned')) reasoned += 1;
    });
    const counted = new Set([...REQUIRED_AREAS, ...settled]).size;
    const coverage = Math.round((80 * settled.size) / counted);
    return { total: coverage + Math.min(20, 5 * reasoned), settled: settled.size, counted };
  }
  // A persona hops, with happy eyes, when its question gets an answer.
  function hop(persona) {
    persona.removeAttribute('data-hop');
    void persona.offsetWidth;
    persona.setAttribute('data-hop', '');
    persona.setAttribute('data-happy', '');
    setTimeout(() => { persona.removeAttribute('data-hop'); persona.removeAttribute('data-happy'); }, 900);
  }
  function initAlignDemos() {
    document.querySelectorAll('[data-align-demo]').forEach((root) => {
      const target = Number(root.getAttribute('data-target'));
      const messages = [...root.querySelectorAll('[data-ad-q]')];
      const ring = root.querySelector('[data-ad-ring]');
      const scoreNum = root.querySelector('[data-ad-score]');
      const areas = root.querySelector('[data-ad-areas]');
      const pill = root.querySelector('[data-ad-pill]');
      const waiting = root.querySelector('[data-ad-waiting]');
      const build = root.querySelector('[data-ad-build]');
      const note = root.querySelector('[data-ad-note]');
      const reset = root.querySelector('[data-ad-reset]');
      const startNote = note.textContent;
      let built = false;
      function render() {
        const score = alignmentScore(messages);
        const open = messages.filter((m) => !m.hasAttribute('data-answered')).length;
        ring.style.setProperty('--value', score.total);
        scoreNum.textContent = score.total;
        areas.textContent = score.settled + ' of ' + score.counted + ' areas settled';
        pill.hidden = score.total >= target && score.total < 100;
        pill.classList.toggle('is-full', score.total === 100);
        pill.textContent = score.total === 100 ? 'Fully aligned' : 'Below your ' + target + '% target';
        waiting.hidden = open === 0;
        waiting.textContent = open;
        reset.hidden = open === messages.length && !built;
        if (built) return;
        const ready = score.total >= target;
        build.disabled = !ready;
        build.setAttribute('data-tip', ready
          ? 'Tell the agent to start the work'
          : 'Align with the agent first. Alignment is ' + score.total + '%, and Build opens at ' + target + '%.');
        note.textContent = ready ? 'Aligned. Build turns your answers into the plan\'s todo list.' : startNote;
      }
      function answer(msg, text, reasoned) {
        msg.setAttribute('data-answered', '');
        msg.toggleAttribute('data-reasoned', reasoned);
        const reply = msg.querySelector('[data-ad-reply]');
        reply.textContent = text;
        reply.hidden = false;
        hop(msg.querySelector('.persona'));
        render();
        if (alignmentScore(messages).total === 100) messages.forEach((m) => hop(m.querySelector('.persona')));
      }
      messages.forEach((msg) => {
        const options = [...msg.querySelectorAll('[data-ad-opt], [data-ad-own]')];
        const form = msg.querySelector('[data-ad-own-form]');
        const input = msg.querySelector('[data-ad-own-input]');
        options.forEach((opt) => {
          opt.addEventListener('click', () => {
            options.forEach((o) => o.setAttribute('aria-checked', String(o === opt)));
            if (opt.hasAttribute('data-ad-own')) {
              form.hidden = false;
              input.focus();
              return;
            }
            form.hidden = true;
            answer(msg, opt.getAttribute('data-label'), false);
          });
        });
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const text = input.value.trim();
          if (!text) return input.focus();
          answer(msg, text, true);
        });
      });
      build.addEventListener('click', () => {
        built = true;
        build.disabled = true;
        build.setAttribute('data-tip', 'Build sent');
        note.textContent = 'Build sent. The agent turns your answers into a todo list and starts the work.';
        messages.forEach((m) => hop(m.querySelector('.persona')));
        render();
      });
      reset.addEventListener('click', () => {
        built = false;
        messages.forEach((msg) => {
          msg.removeAttribute('data-answered');
          msg.removeAttribute('data-reasoned');
          msg.querySelector('[data-ad-reply]').hidden = true;
          msg.querySelector('[data-ad-own-form]').hidden = true;
          msg.querySelector('[data-ad-own-input]').value = '';
          msg.querySelectorAll('[aria-checked]').forEach((o) => o.setAttribute('aria-checked', 'false'));
        });
        render();
      });
      render();
    });
  }
  initAlignDemos();

  // ─── Video nudge: fullscreen tip and a sound warning on the first press of play ─────
  // The first play request waits for the reader's choice, so no sound starts before
  // they've seen the warning. "Don't show again" is remembered in this browser only.
  function initVideoNudge() {
    const nudge = document.querySelector('[data-video-nudge]');
    const player = document.querySelector('.post-video media-player');
    if (!nudge || !player) return;
    const key = 'video-nudge-dismissed';
    let asked = false;
    try { asked = Boolean(localStorage.getItem(key)); } catch (e) {}
    // Vidstack routes every way of starting playback (button, click, keyboard)
    // through a media-play-request event. Catching it first holds the play.
    player.addEventListener('media-play-request', (e) => {
      if (asked) return;
      e.stopImmediatePropagation();
      nudge.hidden = false;
      nudge.querySelector('[data-nudge-full]').focus();
    }, { capture: true });
    function play(fullscreen) {
      asked = true;
      nudge.hidden = true;
      if (fullscreen) player.enterFullscreen().catch(() => {});
      player.play().catch(() => {});
    }
    nudge.querySelector('[data-nudge-full]').addEventListener('click', () => play(true));
    nudge.querySelector('[data-nudge-here]').addEventListener('click', () => play(false));
    nudge.querySelector('[data-nudge-never]').addEventListener('click', () => {
      try { localStorage.setItem(key, '1'); } catch (e) {}
      play(false);
    });
    // Escape closes it without playing. The next press of play asks again.
    nudge.addEventListener('keydown', (e) => { if (e.key === 'Escape') nudge.hidden = true; });
  }
  initVideoNudge();

  // ─── Scroll arrows on posts ─────────────────────────
  // Each arrow shows only when it saves more than a screen of scrolling. The down
  // arrow waits until the reader has started scrolling, so a fresh page stays clean.
  function initScrollJump() {
    const box = document.querySelector('[data-scroll-jump]');
    if (!box) return;
    const up = box.querySelector('[data-scroll-to="top"]');
    const down = box.querySelector('[data-scroll-to="end"]');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    function scrollTo(top) {
      window.scrollTo({ top, behavior: reduce.matches ? 'auto' : 'smooth' });
    }
    up.addEventListener('click', () => scrollTo(0));
    down.addEventListener('click', () => scrollTo(document.documentElement.scrollHeight));
    function update() {
      const screen = window.innerHeight;
      const below = document.documentElement.scrollHeight - (window.scrollY + screen);
      up.classList.toggle('is-visible', window.scrollY > screen);
      down.classList.toggle('is-visible', window.scrollY > screen / 2 && below > screen);
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }
  initScrollJump();

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

  // ─── App download: point the main button at the visitor's OS ─────
  function detectDesktopOS() {
    const ua = navigator.userAgent;
    const platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
    // Phones and tablets can't run the desktop app. iPadOS reports itself as a Mac with touch.
    if (/Android|iPhone|iPad|iPod/i.test(ua) || (/Mac/i.test(platform) && navigator.maxTouchPoints > 1)) return null;
    if (/Win/i.test(platform)) return 'windows';
    if (/Mac/i.test(platform)) return 'macos';
    if (/Linux|X11/i.test(platform) && !/CrOS/i.test(ua)) return 'linux';
    return null;
  }
  function initAppDownloads() {
    const os = detectDesktopOS();
    const names = { macos: 'macOS', windows: 'Windows', linux: 'Linux' };
    document.querySelectorAll('[data-app-download]').forEach((box) => {
      const main = box.querySelector('[data-app-main]');
      const label = box.querySelector('[data-app-main-label]');
      const menu = box.querySelector('details');
      const url = os && main.getAttribute('data-url-' + os);
      if (url) {
        main.href = url;
        main.setAttribute('data-os', os);
        // The main link only becomes a download once it knows the file, so Umami tags it here.
        main.setAttribute('data-umami-event', 'download');
        main.setAttribute('data-umami-event-os', os);
        main.setAttribute('data-umami-event-format', url.split('.').pop());
        label.textContent = 'Download for ' + names[os];
        box.querySelectorAll('[data-os="' + os + '"]').forEach((a) => a.classList.add('current'));
      } else if (menu) {
        // No installer for this device: the main button opens the full list instead.
        label.textContent = 'Download';
        main.addEventListener('click', (e) => { e.preventDefault(); menu.open = !menu.open; });
      } else {
        label.textContent = 'Download';
        main.href = box.getAttribute('data-app-fallback');
      }
    });
    document.addEventListener('click', (e) => {
      document.querySelectorAll('[data-app-download] details[open]').forEach((d) => {
        if (!d.closest('[data-app-download]').contains(e.target)) d.open = false;
      });
    });
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      document.querySelectorAll('[data-app-download] details[open]').forEach((d) => { d.open = false; });
    });
    // A download click opens install notes for that file's OS, when the app has some (macOS only today).
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-app-widget] a[data-os]');
      if (!link) return;
      const menu = link.closest('details');
      if (menu) menu.open = false;
      openInstallDialog(link.closest('[data-app-widget]'), link.getAttribute('data-os'));
    });
    // Copy buttons on install commands. Falls back to selecting the text when the clipboard is blocked.
    document.addEventListener('click', (e) => {
      const button = e.target.closest('[data-copy]');
      if (!button) return;
      const flash = (label) => {
        button.textContent = label;
        setTimeout(() => { button.textContent = 'Copy'; }, 2000);
      };
      const done = () => flash('Copied');
      const selectText = () => {
        flash('Press ⌘C');
        const range = document.createRange();
        range.selectNodeContents(button.parentElement.querySelector('code'));
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(button.getAttribute('data-copy')).then(done, selectText);
      else selectText();
      track('install-command-copy', { os: button.getAttribute('data-copy-os') });
    });
    // Links to the callout glide down to it, unless the visitor asked for reduced motion.
    document.querySelectorAll('a[href="#download"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const target = document.getElementById('download');
        if (!target) return;
        e.preventDefault();
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        history.pushState(null, '', '#download');
      });
    });
    // Hide the sticky side card while the full callout at the end is on screen.
    const callout = document.getElementById('download');
    const side = document.querySelector('.doc-side');
    if (callout && side && 'IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => side.classList.toggle('is-hidden', entry.isIntersecting))
        .observe(callout);
    }
  }
  let installDialog = null;
  function openInstallDialog(widget, os) {
    const template = widget.querySelector('template[data-app-install]');
    if (!template || !template.content.querySelector('[data-install-os="' + os + '"]')) return;
    if (!installDialog) {
      installDialog = document.createElement('dialog');
      installDialog.className = 'app-dialog';
      installDialog.setAttribute('aria-labelledby', 'app-dialog-title');
      // The dialog has no padding of its own, so a click on it (not its body) is a backdrop click.
      installDialog.addEventListener('click', (e) => { if (e.target === installDialog) installDialog.close(); });
      document.body.appendChild(installDialog);
    }
    installDialog.replaceChildren(template.content.cloneNode(true));
    installDialog.querySelectorAll('[data-install-os]').forEach((el) => {
      el.hidden = el.getAttribute('data-install-os') !== os;
    });
    installDialog.showModal();
  }
  initAppDownloads();

  initAnalyticsEvents();

  // ─── Analytics events (Umami) ──────────────────────
  // Download links carry data-umami-event attributes, which Umami records on its own.
  // Everything else is sent from here. track() is a no-op until the Umami script loads.
  function initAnalyticsEvents() {
    document.addEventListener('click', (e) => {
      const toc = e.target.closest('.doc-toc a, .post-toc a');
      if (toc) return track('toc-click', { heading: toc.textContent.trim() });

      const link = e.target.closest('a[href]');
      // Download buttons report their own event, or none when they only open the menu.
      if (!link || link.hasAttribute('data-umami-event') || link.closest('[data-app-download]')) return;
      if (link.closest('.hero-socials, .footer')) {
        return track('social-click', {
          network: link.getAttribute('aria-label') || link.textContent.trim(),
          area: link.closest('.footer') ? 'footer' : 'hero',
        });
      }
      if (link.classList.contains('featured-link')) {
        return track('featured-open', { post: link.textContent.trim() });
      }
      if (link.host && link.host !== location.host) {
        track('outbound-link', {
          host: link.host,
          label: (link.getAttribute('aria-label') || link.textContent).trim().slice(0, 80),
          area: link.closest('.doc-article, .post-body') ? 'post' : (location.pathname === '/' ? 'home' : 'page'),
        });
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('[data-action="toggle-theme"]')) return;
      // The theme handler above has already flipped it.
      track('theme-toggle', { to: root.getAttribute('data-theme') });
    });

    document.querySelectorAll('.app-download-menu').forEach((menu) => {
      menu.addEventListener('toggle', () => {
        if (!menu.open) return;
        const main = menu.parentElement.querySelector('[data-app-main]');
        track('download-menu-open', { placement: main ? main.getAttribute('data-umami-event-placement') : '' });
      });
    });

    // Search terms, sent once the visitor stops typing for 1.2s.
    document.querySelectorAll('[data-search] input').forEach((input) => {
      let timer;
      input.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          const query = input.value.trim().toLowerCase().slice(0, 60);
          if (query.length >= 2) track('writing-search', { query });
        }, 1200);
      });
    });

    document.querySelectorAll('.post-video media-player').forEach((player) => {
      player.addEventListener('play', () => track('video-play', { page: location.pathname }), { once: true });
      player.addEventListener('ended', () => track('video-complete', { page: location.pathname }), { once: true });
    });

    // A post counts as finished when its end (the comments, or the last block) comes on screen.
    const end = document.querySelector('.doc-article .comments') || document.querySelector('.doc-article > :last-child');
    if (end && 'IntersectionObserver' in window) {
      const seen = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        track('post-finish', { page: location.pathname });
        seen.disconnect();
      });
      seen.observe(end);
    }
  }
})();
