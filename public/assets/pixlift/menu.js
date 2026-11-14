// Pixlift's live block: what a file on the «Desktop» answers to, as a file on the Mac's Desktop does. A click selects it,
// a double click opens it; a right click (on an iPhone a long press) opens a copy of Finder's own context menu (menu.css
// holds the measurements), keeping only what a page can really do: Open (the picture in a new tab), Move to Trash (the
// file leaves the row), Rename (Finder's inline field, the name selected without «.png»), Duplicate (Pixlift's own
// « (2)» naming), Quick Look (the panel grows out of the thumbnail), Copy (the real clipboard), Download Image (the
// browser's own download; WebKit's own words) and Share… where the browser can share a file. Titles are Finder's and
// WebKit's own, from their .loctable/.strings on macOS 27.2. Keys as in Finder and its menus: Esc closes, arrows move
// the highlight, Return acts, a letter jumps; on a selected file Space is Quick Look, Return renames, ⌘⌫ trashes,
// ⌘C copies, ⌘D duplicates, ⌘O opens.
// Several files, as on the Mac's Desktop (his word 2026-11-14 ~11:07): ⌘-click or ⇧-click adds a file to the selection or
// takes it out (in Finder's icon view both do that), ⌘A selects all; a right click on one of them opens the menu for all
// of them, with Finder's own titles for several items («Quick Look 3 Items»), and keeps only what a page can do for several
// at once: Move to Trash, Duplicate, Quick Look (← → step through them, as in Finder), and Share… where the browser can
// share several files. ⌘⌫, ⌘D and Space act on all the selected files.
'use strict';
(() => {
  const desk = document.getElementById('px-desk');
  if (!desk) return;
  PX.menu = true;
  const T = {
    en: { open: 'Open', trash: 'Move to Trash', rename: 'Rename', dup: 'Duplicate', ql: 'Quick Look', copy: 'Copy', dl: 'Download Image', share: 'Share…', close: 'Close' },
    ru: { open: 'Открыть', trash: 'Переместить в Корзину', rename: 'Переименовать', dup: 'Дублировать', ql: 'Быстрый просмотр', copy: 'Скопировать', dl: 'Загрузить изображение', share: 'Поделиться…', close: 'Закрыть' },
    uk: { open: 'Відкрити', trash: 'Перемістити в Смітник', rename: 'Перейменувати', dup: 'Дублювати', ql: 'Швидкий перегляд', copy: 'Скопіювати', dl: 'Викачати зображення', share: 'Поширити…', close: 'Закрити' },
  };
  // Finder's titles for several items (Finder.app Localizable.strings on macOS 27.2, key N169.18_V3; ^0 is the count).
  const QLN = { en: 'Quick Look ^0 Items', ru: 'Быстрый просмотр объектов (^0)', uk: 'Швидкий перегляд ^0 елем.' };
  const qln = (n) => (QLN[document.documentElement.lang] || QLN.en).replace('^0', n);
  const t = () => T[document.documentElement.lang] || T.en;
  const ICON = {
    trash: '<svg viewBox="0 0 11.5 13"><path d="M1 3h9.5M4 3V1.6h3.5V3M2.1 3l.6 8.6c.05.6.45.9 1 .9h4.1c.55 0 .95-.3 1-.9L9.4 3M4.6 5.3v4.9M6.9 5.3v4.9"/></svg>',
    share: '<svg viewBox="0 0 11.5 13"><path d="M5.75 8V.9M3.2 3.3 5.75.8 8.3 3.3M3.6 5.2H2.4c-.7 0-1.1.4-1.1 1.1v4.7c0 .7.4 1.1 1.1 1.1h6.7c.7 0 1.1-.4 1.1-1.1V6.3c0-.7-.4-1.1-1.1-1.1H7.9"/></svg>',
  };
  const files = () => [...desk.querySelectorAll('.px-file')];
  const select = (f) => { files().forEach((x) => x.classList.toggle('on', x === f)); };
  const chosen = () => files().filter((x) => x.classList.contains('on'));

  // ---- actions -------------------------------------------------------------------------------------------------
  const fileOf = (f) => new File([f.pxBlob], f.pxName + '.png', { type: 'image/png' });
  const canShare = (fs) => { try { return !!(navigator.share && navigator.canShare && navigator.canShare({ files: fs.map(fileOf) })); } catch { return false; } };
  const act = {
    open(f) { window.open(f.pxUrl, '_blank'); },
    trash(f, fs = [f]) {
      const last = fs.at(-1);
      let next = last.nextElementSibling; while (next && fs.includes(next)) next = next.nextElementSibling;
      if (!next) { next = fs[0].previousElementSibling; while (next && fs.includes(next)) next = next.previousElementSibling; }
      if (ql.file && fs.includes(ql.file)) ql.hide(true);
      for (const g of fs) { PX.taken.delete(g.pxName); g.remove(); setTimeout(() => URL.revokeObjectURL(g.pxUrl), 60000); }
      if (next && next.classList.contains('px-file')) { select(next); next.focus({ preventScroll: true }); }
    },
    rename(f) { rename(f); },
    // Finder puts each copy after its original and selects the copies.
    dup(f, fs = [f]) {
      const made = fs.map((o) => {
        const base = o.pxName.replace(/ \(\d+\)$/, '');
        let n = base, i = 2; while (PX.taken.has(n)) n = `${base} (${i++})`;
        PX.taken.add(n);
        const g = PX.land(desk, o.pxBlob, n); o.after(g); return g;
      });
      files().forEach((x) => x.classList.toggle('on', made.includes(x))); made.at(-1).focus({ preventScroll: true });
    },
    ql(f, fs = [f]) { ql.show(fs.length > 1 ? fs[0] : f, fs); }, // several: from the first, ← → through the rest
    copy(f) { PX.copy(Promise.resolve(f.pxBlob)); },
    dl(f) { PX.save(f); },
    share(f, fs = [f]) { navigator.share({ files: fs.map(fileOf) }).catch(() => {}); },
  };

  // ---- the menu ------------------------------------------------------------------------------------------------
  const menu = document.createElement('div');
  menu.className = 'px-menu'; menu.hidden = true; menu.tabIndex = -1; menu.setAttribute('role', 'menu');
  document.body.append(menu);
  let target = null, targets = [], rows = [], hi = -1;
  function build(fs) {
    const s = t(), many = fs.length > 1;
    const groups = many ? [['trash'], ['dup', 'ql']] : [['open'], ['trash'], ['rename', 'dup', 'ql', 'copy', 'dl']];
    if (canShare(fs)) groups.push(['share']);
    menu.textContent = ''; rows = [];
    groups.forEach((g, gi) => {
      if (gi) { const sp = document.createElement('div'); sp.className = 'sp'; sp.setAttribute('role', 'separator'); menu.append(sp); }
      g.forEach((k) => {
        const r = document.createElement('div'); r.className = 'it'; r.setAttribute('role', 'menuitem'); r.dataset.k = k;
        if (ICON[k]) { const ic = document.createElement('span'); ic.className = 'ic'; ic.innerHTML = ICON[k]; r.append(ic); }
        r.append(k === 'ql' && many ? qln(fs.length) : s[k]); menu.append(r); rows.push(r);
      });
    });
  }
  const light = (i) => { hi = i; rows.forEach((r, j) => r.classList.toggle('hl', j === i)); };
  // Motion, measured on macOS 27.2 by 120 fps screen recordings of Finder (2026-11-14): the menu appears at once, in one
  // frame. Esc or a click outside fades it out over 183 ms (opacity per 60 fps frame below). Choosing an item blinks it:
  // the highlight goes off for 75 ms and comes back for 50 ms, then the menu fades over 225 ms, a slower start than Esc;
  // only then does Finder act (Quick Look began 75 ms after the fade ended). What needs the visitor's own click to be
  // allowed by the browser (opening a tab, the clipboard, a download, sharing; the iPhone's keyboard for Rename on touch)
  // runs at the click itself; what only shows (Quick Look, Duplicate, Trash, Rename with a mouse) waits for the fade.
  const FADE_ESC = { t: [0, 17, 42, 58, 75, 92, 108, 125, 142, 158, 183], o: [1, .84, .62, .47, .33, .24, .16, .1, .06, .03, 0] };
  const FADE_PICK = { t: [0, 17, 33, 50, 67, 83, 100, 117, 142, 158, 175, 192, 208, 225], o: [1, .9, .77, .61, .44, .32, .23, .16, .084, .061, .045, .018, .007, 0] };
  const BLINK_OFF = 75, BLINK_ON = 50;
  const NOW = new Set(['open', 'copy', 'dl', 'share']);
  let going = null, timers = [];
  const fade = (c) => menu.animate(c.t.map((t, i) => ({ opacity: c.o[i], offset: t / c.t.at(-1) })), { duration: c.t.at(-1), easing: 'linear' });
  function stop() { timers.forEach(clearTimeout); timers = []; if (going) { going.cancel(); going = null; } menu.classList.remove('gone'); }
  function open(f, x, y) {
    if (ql.file) ql.hide();
    stop();
    if (!f.classList.contains('on')) select(f);
    target = f; targets = chosen(); build(targets); light(-1);
    menu.hidden = false;
    const vw = document.documentElement.clientWidth, vh = window.innerHeight, w = menu.offsetWidth, h = menu.offsetHeight;
    // macOS puts the menu's top left corner at the pointer, opens to the left near the right edge and slides up near the
    // bottom, keeping a few points off the screen's edges.
    let l = x, tp = y;
    if (l + w > vw - 4) l = Math.max(4, x - w);
    if (tp + h > vh - 4) tp = Math.max(4, vh - 4 - h);
    menu.style.transform = `translate(${Math.round(l)}px, ${Math.round(tp)}px)`;
    menu.focus({ preventScroll: true });
  }
  const hide = () => { stop(); menu.hidden = true; light(-1); };
  // how: 'fade' (Esc, a click outside), 'now' (scroll, resize, the window losing focus).
  function close(back, how) {
    if (menu.hidden || menu.classList.contains('gone')) return;
    if (back && target && target.isConnected) target.focus({ preventScroll: true });
    if (how !== 'fade') { hide(); return; }
    menu.classList.add('gone');
    going = fade(FADE_ESC); going.onfinish = hide;
  }
  function choose(i) {
    if (menu.classList.contains('gone')) return;
    const k = rows[i]?.dataset.k, f = target, fs = targets.filter((x) => x.isConnected), r = rows[i];
    if (!k) return;
    const touch = choose.touch; choose.touch = false;
    const now = NOW.has(k) || (k === 'rename' && touch);
    if (k !== 'rename' && k !== 'ql') target.focus({ preventScroll: true });
    if (now && f.isConnected) act[k](f, fs);
    menu.classList.add('gone');
    light(i); r.classList.remove('hl');
    timers.push(setTimeout(() => r.classList.add('hl'), BLINK_OFF));
    timers.push(setTimeout(() => {
      going = fade(FADE_PICK);
      going.onfinish = () => { hide(); if (!now && f.isConnected) act[k](f, fs); };
    }, BLINK_OFF + BLINK_ON));
  }
  menu.addEventListener('pointermove', (e) => { if (menu.classList.contains('gone')) return; const r = e.target.closest('.it'); light(r ? rows.indexOf(r) : -1); });
  menu.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch' && !menu.classList.contains('gone')) light(-1); });
  menu.addEventListener('pointerdown', (e) => { e.preventDefault(); if (menu.classList.contains('gone')) return; const r = e.target.closest('.it'); if (r) light(rows.indexOf(r)); choose.touch = e.pointerType === 'touch'; });
  menu.addEventListener('click', (e) => { const r = e.target.closest('.it'); if (r) choose(rows.indexOf(r)); });
  menu.addEventListener('contextmenu', (e) => e.preventDefault());
  menu.addEventListener('keydown', (e) => {
    const n = rows.length;
    if (menu.classList.contains('gone')) { e.preventDefault(); return; }
    if (e.key === 'Escape') close(true, 'fade');
    else if (e.key === 'ArrowDown') light(hi < 0 ? 0 : Math.min(n - 1, hi + 1));
    else if (e.key === 'ArrowUp') light(hi < 0 ? n - 1 : Math.max(0, hi - 1));
    else if (e.key === 'Enter' || e.key === ' ') { if (hi >= 0) choose(hi); else close(true, 'fade'); }
    else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
      const c = e.key.toLocaleLowerCase(), from = hi + 1;
      for (let j = 0; j < n; j++) { const i = (from + j) % n; if (rows[i].textContent.toLocaleLowerCase().startsWith(c)) { light(i); break; } }
    } else if (e.key !== 'Tab') return;
    e.preventDefault();
  });
  addEventListener('pointerdown', (e) => { if (!menu.hidden && !menu.contains(e.target)) close(false, 'fade'); }, true);
  addEventListener('scroll', () => close(false), true);
  addEventListener('resize', () => close(false));
  addEventListener('blur', () => close(false));

  // ---- the file on the «Desktop» ---------------------------------------------------------------------------------
  desk.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    const f = e.target.closest('.px-file');
    if (f?.querySelector('[contenteditable]')) return;
    if (f && (e.metaKey || e.shiftKey)) {
      // ⌘ or ⇧: this file in or out of the selection, the others stay. A file taken out is not focused, so focusing it
      // can't select it again.
      e.preventDefault(); f.classList.toggle('on');
      const rest = chosen(); if (f.classList.contains('on')) f.focus({ preventScroll: true }); else if (rest.length) rest.at(-1).focus({ preventScroll: true });
      return;
    }
    if (!f && (e.metaKey || e.shiftKey)) return;
    if (f && f.classList.contains('on') && chosen().length > 1) { e.preventDefault(); f.focus({ preventScroll: true }); pending = f; return; }
    select(f); if (f) { e.preventDefault(); f.focus({ preventScroll: true }); }
  });
  // A plain click on one of several selected files leaves only it selected when the button comes up (Finder waits, so a
  // press that starts a drag or a right click keeps them all).
  let pending = null;
  desk.addEventListener('mouseup', (e) => { const f = e.target.closest('.px-file'); if (pending && f === pending && !e.metaKey && !e.shiftKey) select(f); pending = null; });
  desk.addEventListener('dblclick', (e) => { const f = e.target.closest('.px-file'); if (f && !f.querySelector('[contenteditable]')) act.open(f); });
  desk.addEventListener('contextmenu', (e) => {
    const f = e.target.closest('.px-file');
    if (!f || f.querySelector('[contenteditable]')) return;
    e.preventDefault(); if (touchMenu) { touchMenu = false; return; }
    open(f, e.clientX, e.clientY);
  });
  addEventListener('mousedown', (e) => { if (!desk.contains(e.target) && !menu.contains(e.target) && !(ql.el && ql.el.contains(e.target))) select(null); });
  desk.addEventListener('keydown', (e) => {
    const f = e.target.closest('.px-file');
    if (!f || f.querySelector('[contenteditable]')) return;
    const k = e.key, m = e.metaKey || e.ctrlKey, fs = chosen().length ? chosen() : [f], one = fs.length === 1;
    if (k === ' ' && !m) act.ql(f, fs);
    else if (k === 'Enter' && !m) { if (one) act.rename(f); }
    else if (m && k === 'Backspace') act.trash(f, fs);
    else if (m && (k === 'c' || k === 'C')) { if (one) act.copy(f); }
    else if (m && (k === 'd' || k === 'D')) act.dup(f, fs);
    else if (m && (k === 'o' || k === 'O')) { if (one) act.open(f); }
    else if (m && (k === 'a' || k === 'A')) files().forEach((x) => x.classList.add('on'));
    else if ((k === 'ArrowRight' || k === 'ArrowLeft') && ql.file && ql.list.length > 1) return; // Quick Look steps
    else if (k === 'ArrowRight' || k === 'ArrowLeft') {
      const all = files(), i = all.indexOf(f) + (k === 'ArrowRight' ? 1 : -1);
      if (all[i]) { select(all[i]); all[i].focus({ preventScroll: true }); }
    } else return;
    e.preventDefault();
  });
  desk.addEventListener('focusin', (e) => { const f = e.target.closest('.px-file'); if (f && !f.classList.contains('on') && !e.relatedTarget?.closest?.('.px-menu')) select(f); });

  // Touch: a tap is Quick Look (as a tap on a file in the iPhone's Files), a long press opens the menu under the finger.
  let timer = 0, start = null, touchMenu = false, held = false;
  desk.addEventListener('touchstart', (e) => {
    const f = e.target.closest('.px-file');
    if (!f || e.touches.length !== 1 || f.querySelector('[contenteditable]')) return;
    const p = e.touches[0]; start = [p.clientX, p.clientY]; held = false; clearTimeout(timer);
    timer = setTimeout(() => { held = true; touchMenu = true; open(f, start[0], start[1]); setTimeout(() => { touchMenu = false; }, 600); }, 500);
  }, { passive: true });
  desk.addEventListener('touchmove', (e) => { const p = e.touches[0]; if (start && Math.hypot(p.clientX - start[0], p.clientY - start[1]) > 8) { clearTimeout(timer); start = null; } }, { passive: true });
  desk.addEventListener('touchend', (e) => {
    clearTimeout(timer);
    const f = e.target.closest('.px-file');
    if (!f || f.querySelector('[contenteditable]') || (!held && !start)) return;
    e.preventDefault();
    if (!held && start) { select(f); act.ql(f); }
    start = null;
  }, { passive: false });
  desk.addEventListener('touchcancel', () => { clearTimeout(timer); start = null; });

  // ---- Rename: Finder's inline field over the name, the name selected without its extension ----------------------
  function rename(f) {
    const span = f.querySelector('.nm>span'), was = f.pxName;
    select(f);
    span.contentEditable = 'plaintext-only';
    if (span.contentEditable !== 'plaintext-only') span.contentEditable = 'true';
    span.spellcheck = false; span.focus();
    const r = document.createRange(), node = span.firstChild, dot = node.textContent.lastIndexOf('.');
    r.setStart(node, 0); r.setEnd(node, dot > 0 ? dot : node.textContent.length);
    const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    let done = false;
    const end = (keep) => {
      if (done) return; done = true;
      span.removeEventListener('keydown', key); span.removeEventListener('blur', blur);
      span.removeAttribute('contenteditable');
      let v = span.textContent.replace(/[\r\n]+/g, ' ').trim();
      const base = v.replace(/\.png$/i, '');
      if (!keep || !base || base === was || PX.taken.has(base) || /[/:]/.test(base)) { span.textContent = was + '.png'; }
      else { PX.taken.delete(was); PX.taken.add(base); f.pxName = base; span.textContent = base + '.png'; if (ql.file === f) ql.title(); }
      getSelection().removeAllRanges(); f.focus({ preventScroll: true });
    };
    const key = (e) => {
      if (e.key === 'Enter') { e.preventDefault(); end(true); }
      else if (e.key === 'Escape') { e.preventDefault(); end(false); }
      e.stopPropagation();
    };
    const blur = () => end(true);
    span.addEventListener('keydown', key); span.addEventListener('blur', blur);
  }

  // ---- Quick Look ------------------------------------------------------------------------------------------------
  // Measured on macOS 27.2 at 120 fps (2026-11-14): the panel opens out of the file's icon in 200 ms, fast at first (a fifth
  // of the way after one 60 fps frame, 60 % after two), and shrinks back into it in 167 ms, nearly evenly, slowing at the
  // end; the picture inside stays on the icon's picture all the way. Progress per frame below.
  const QL_OPEN = { t: [0, 17, 33, 50, 67, 83, 100, 117, 133, 150, 167, 200], p: [0, .2, .6, .72, .8, .87, .91, .94, .96, .98, .99, 1] };
  const QL_CLOSE = { t: [0, 17, 33, 50, 67, 83, 100, 117, 133, 150, 167], p: [0, .13, .24, .37, .5, .63, .75, .85, .915, .954, 1] };
  // Keyframes moving the panel between its place (L, T, scale 1) and the one where its picture covers the icon's.
  const zoom = (el, c, from, to) => el.animate(c.t.map((tt, i) => {
    const q = c.p[i], x = from[0] + (to[0] - from[0]) * q, y = from[1] + (to[1] - from[1]) * q, k = from[2] + (to[2] - from[2]) * q;
    return { transform: `translate(${x}px, ${y}px) scale(${k})`, offset: tt / c.t.at(-1) };
  }), { duration: c.t.at(-1), easing: 'linear' });
  const onIcon = (src, ix, iy, w) => { const r = src.getBoundingClientRect(), k = Math.max(r.width / w, 0.02); return [r.left - ix * k, r.top - iy * k, k]; };
  const ql = {
    el: null, file: null, list: [],
    title() { if (this.el) this.el.querySelector('.t').textContent = this.file.pxName + '.png'; },
    // ← → with several files: the next one in the same panel, no zoom (Finder steps through them in place).
    step(d) {
      const l = this.list.filter((x) => x.isConnected), i = l.indexOf(this.file) + d;
      if (!this.el || i < 0 || i >= l.length) return;
      this.file = l[i]; const im = this.el.querySelector('img'); im.src = this.file.pxUrl; this.title();
      im.decode().catch(() => {}).then(() => this.fit(false));
    },
    show(f, list = [f]) {
      if (this.file === f) return this.hide();
      if (this.file) this.hide(true);
      this.file = f; this.list = list; f.focus({ preventScroll: true });
      const el = this.el = document.createElement('div'); el.className = 'px-ql'; el.setAttribute('role', 'dialog');
      const bar = document.createElement('div'); bar.className = 'bar';
      const x = document.createElement('button'); x.className = 'x'; x.type = 'button'; x.setAttribute('aria-label', t().close);
      x.innerHTML = '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="7.5" fill="currentColor" opacity=".55"/><path d="M5.4 5.4l5.2 5.2M10.6 5.4l-5.2 5.2" stroke="' + (matchMedia('(prefers-color-scheme: dark)').matches ? '#282828' : '#ececec') + '" stroke-width="1.5" stroke-linecap="round"/></svg>';
      x.addEventListener('click', () => this.hide());
      const tt = document.createElement('span'); tt.className = 't';
      bar.append(x, tt);
      const im = new Image(); im.src = f.pxUrl; im.alt = ''; im.draggable = false;
      el.append(bar, im); document.body.append(el); this.title();
      const dpr = window.devicePixelRatio || 1;
      this.fit = (zoomIn) => {
        const src = this.file.querySelector('.th img');
        const vw = document.documentElement.clientWidth, vh = window.innerHeight;
        let w = im.naturalWidth / dpr, h = im.naturalHeight / dpr;
        const k = Math.min(1, (vw - 40) / (w + 10), (vh - 80) / (h + 42)); w *= k; h *= k;
        im.style.width = w + 'px'; im.style.height = h + 'px';
        const W = Math.max(w + 10, 220), H = h + 42, L = (vw - W) / 2, Tp = (vh - H) / 2;
        el.style.width = W + 'px'; im.style.margin = `0 ${(W - 10 - w) / 2}px`;
        this.at = [L, Tp, 5 + (W - 10 - w) / 2, 37, w];
        if (zoomIn) zoom(el, QL_OPEN, onIcon(src, this.at[2], 37, w), [L, Tp, 1]);
        el.style.transform = `translate(${L}px, ${Tp}px)`;
      };
      el.style.visibility = 'hidden';
      im.decode().catch(() => {}).then(() => { el.style.visibility = ''; this.fit(true); });
    },
    hide(now) {
      const el = this.el, f = this.file;
      if (!el) return;
      this.el = this.file = null;
      const src = f.isConnected && f.querySelector('.th img');
      if (now || !src || !this.at) { el.remove(); return; }
      const [L, Tp, ix, iy, w] = this.at;
      zoom(el, QL_CLOSE, [L, Tp, 1], onIcon(src, ix, iy, w)).finished.then(() => el.remove(), () => el.remove());
      f.focus({ preventScroll: true });
    },
  };
  addEventListener('keydown', (e) => {
    if (!ql.file || !menu.hidden) return;
    if (e.key === 'Escape' || (e.key === ' ' && !e.target.closest?.('.px-file'))) { e.preventDefault(); ql.hide(); }
    else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && ql.list.length > 1) { e.preventDefault(); e.stopPropagation(); ql.step(e.key === 'ArrowRight' ? 1 : -1); }
  });
})();
