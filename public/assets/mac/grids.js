(() => {
  'use strict';
  // Grids live overlay on /apps/grids/ (his video 2026-11-28 17:13 & voice 17:22, dev/live-blocks.md):
  // - Real macOS 27.2 Dark menu bar at top of page (Grids status icon + live clock).
  // - Dropdown holds only the 5 grid modes; clicking the active checked mode toggles the grid off (same as Grids.app).
  // - Default on load: Halves & Quarters (equally spaced 25%/50%/75% across both phone and desktop layouts).
  // - Drawn once for the page's document dimensions (does not recalculate on pinch-zoom), click-through, no pill badges.
  const PHI = (Math.sqrt(5) - 1) / 2;
  const MODES = [
    { id: 'all', label: 'All' },
    null,
    { id: 'halves', label: 'Halves & Quarters' },
    { id: 'golden', label: 'Golden Ratio' },
    { id: 'thirds', label: 'Thirds' },
    { id: 'fine', label: '8-pt Grid' },
  ];
  // Apple macOS dark NSColor.system* sRGB values (same order as grids/main.swift)
  const C = {
    red: '#FF453A',
    orange: '#FF9F0A',
    yellow: '#FFD60A',
    green: '#30D158',
    blue: '10,132,255',
  };

  function guides(mode) {
    const half = [{ f: 0.5, c: C.red }];
    const quarters = [{ f: 0.25, c: C.orange }, { f: 0.75, c: C.orange }];
    const golden = [{ f: 1 - PHI, c: C.yellow }, { f: PHI, c: C.yellow }];
    const thirds = [{ f: 1 / 3, c: C.green }, { f: 2 / 3, c: C.green }];
    if (mode === 'all') return half.concat(quarters, golden, thirds);
    if (mode === 'halves') return half.concat(quarters);
    if (mode === 'golden') return half.concat(golden);
    if (mode === 'thirds') return half.concat(thirds);
    return half;
  }

  let activeMode = 'halves';
  let gridOn = true;
  let lockedW = 0;
  let lockedH = 0;
  let lockedDpr = 1;

  document.body.classList.add('has-gbar');

  // Menu bar
  const bar = document.createElement('header');
  bar.className = 'gbar';
  bar.setAttribute('aria-label', 'Grids menu bar');

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'gbar-btn';
  btn.setAttribute('aria-haspopup', 'menu');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-label', 'Grids');
  btn.innerHTML =
    '<svg viewBox="0 0 18 16" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<rect x="1" y="1" width="16" height="14" rx="2.5"/>' +
    '<path d="M6.33 1v14M11.67 1v14M1 5.67h16M1 10.33h16"/></svg>';

  const ck = document.createElement('span');
  ck.className = 'gbar-ck';
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function tickClock() {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    ck.textContent = `${DAYS[d.getDay()]} ${d.getDate()} ${MONS[d.getMonth()]}  ${hh}:${mm}`;
  }
  tickClock();
  setInterval(tickClock, 15000);

  bar.append(btn, ck);

  // Dropdown menu
  const menu = document.createElement('div');
  menu.className = 'gmenu';
  menu.setAttribute('role', 'menu');
  menu.hidden = true;

  const CHK_SVG =
    '<svg class="chk" viewBox="0 0 13 11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M1.5 5.8L4.8 9.2L11.5 1.8"/></svg>';

  const itemEls = [];
  for (const m of MODES) {
    if (!m) {
      const sep = document.createElement('div');
      sep.className = 'gsep';
      sep.setAttribute('role', 'separator');
      menu.append(sep);
      continue;
    }
    const it = document.createElement('button');
    it.type = 'button';
    it.className = 'gmi';
    it.setAttribute('role', 'menuitemcheckbox');
    it.dataset.mode = m.id;
    it.innerHTML = CHK_SVG + `<span>${m.label}</span>`;
    it.addEventListener('click', () => pickMode(m.id, it));
    menu.append(it);
    itemEls.push(it);
  }

  // Full-page canvas overlay
  const canvas = document.createElement('canvas');
  canvas.className = 'grids-ov';
  canvas.setAttribute('aria-hidden', 'true');

  document.body.append(bar, menu, canvas);

  function syncChecks() {
    for (const el of itemEls) {
      el.setAttribute('aria-checked', gridOn && el.dataset.mode === activeMode ? 'true' : 'false');
    }
  }

  function measureAndDraw(force) {
    const w = document.documentElement.clientWidth;
    const h = Math.max(document.documentElement.scrollHeight, window.innerHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    if (force || !lockedW || w !== lockedW) {
      lockedW = w;
      lockedH = h;
      lockedDpr = dpr;
      canvas.style.width = lockedW + 'px';
      canvas.style.height = lockedH + 'px';
      canvas.width = Math.round(lockedW * lockedDpr);
      canvas.height = Math.round(lockedH * lockedDpr);
    }
    if (!gridOn) {
      canvas.hidden = true;
      return;
    }
    canvas.hidden = false;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(lockedDpr, 0, 0, lockedDpr, 0, 0);
    ctx.clearRect(0, 0, lockedW, lockedH);

    const px = 1 / lockedDpr;
    const snap = (v) => Math.round(v * lockedDpr) / lockedDpr;

    if (activeMode === 'all' || activeMode === 'fine') {
      for (let x = 8; x < lockedW; x += 8) {
        ctx.fillStyle = `rgba(${C.blue},${x % 32 === 0 ? 0.45 : 0.2})`;
        ctx.fillRect(x, 0, px, lockedH);
      }
      for (let y = 8; y < lockedH; y += 8) {
        ctx.fillStyle = `rgba(${C.blue},${y % 32 === 0 ? 0.45 : 0.2})`;
        ctx.fillRect(0, y, lockedW, px);
      }
    }

    for (const g of guides(activeMode)) {
      const x = snap(lockedW * g.f);
      const y = snap(lockedH * g.f);
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(x + px, 0, px, lockedH);
      ctx.fillRect(0, y + px, lockedW, px);
      ctx.fillStyle = g.c;
      ctx.fillRect(x, 0, px, lockedH);
      ctx.fillRect(0, y, lockedW, px);
    }
  }

  function openMenu() {
    menu.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
  }
  function closeMenu() {
    menu.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
  }

  function pickMode(id, el) {
    if (gridOn && activeMode === id) {
      gridOn = false;
    } else {
      activeMode = id;
      gridOn = true;
    }
    syncChecks();
    measureAndDraw(false);
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !el) {
      closeMenu();
      return;
    }
    el.classList.add('blink');
    setTimeout(() => {
      el.classList.remove('blink');
      setTimeout(closeMenu, 55);
    }, 55);
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (menu.hidden) openMenu();
    else closeMenu();
  });

  document.addEventListener('pointerdown', (e) => {
    if (!menu.hidden && !menu.contains(e.target) && !btn.contains(e.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (menu.hidden) return;
    if (e.key === 'Escape') {
      closeMenu();
      btn.focus();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const idx = itemEls.indexOf(document.activeElement);
      const next = e.key === 'ArrowDown'
        ? (idx + 1) % itemEls.length
        : (idx <= 0 ? itemEls.length - 1 : idx - 1);
      itemEls[next].focus();
    }
  });

  // Calculate once on initial layout; do NOT listen to visualViewport (pinch-zoom keeps locked geometry).
  syncChecks();
  measureAndDraw(true);
  window.addEventListener('load', () => measureAndDraw(true), { once: true });
})();
