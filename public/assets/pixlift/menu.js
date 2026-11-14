// Pixlift's live block: what a file on the «Desktop» answers to, as a file on the Mac's Desktop does. A click selects it,
// a double click opens it; a right click (on an iPhone a long press) opens a copy of Finder's own context menu (menu.css
// holds the measurements), keeping only what a page can really do: Open (the picture in a new tab), Move to Trash (the
// file leaves the row), Rename (Finder's inline field, the name selected without «.png»), Duplicate (Pixlift's own
// « (2)» naming), Quick Look (the panel grows out of the thumbnail), Copy (the real clipboard), Download Image (the
// browser's own download; WebKit's own words) and Share… where the browser can share a file. Titles are Finder's and
// WebKit's own, from their .loctable/.strings on macOS 27.2. Keys as in Finder and its menus: Esc closes, arrows move
// the highlight, Return acts, a letter jumps; on a selected file Space is Quick Look, Return renames, ⌘⌫ trashes,
// ⌘C copies, ⌘D duplicates, ⌘O opens.
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
  const t = () => T[document.documentElement.lang] || T.en;
  const ICON = {
    trash: '<svg viewBox="0 0 11.5 13"><path d="M1 3h9.5M4 3V1.6h3.5V3M2.1 3l.6 8.6c.05.6.45.9 1 .9h4.1c.55 0 .95-.3 1-.9L9.4 3M4.6 5.3v4.9M6.9 5.3v4.9"/></svg>',
    share: '<svg viewBox="0 0 11.5 13"><path d="M5.75 8V.9M3.2 3.3 5.75.8 8.3 3.3M3.6 5.2H2.4c-.7 0-1.1.4-1.1 1.1v4.7c0 .7.4 1.1 1.1 1.1h6.7c.7 0 1.1-.4 1.1-1.1V6.3c0-.7-.4-1.1-1.1-1.1H7.9"/></svg>',
  };
  const files = () => [...desk.querySelectorAll('.px-file')];
  const select = (f) => { files().forEach((x) => x.classList.toggle('on', x === f)); };

  // ---- actions -------------------------------------------------------------------------------------------------
  const fileOf = (f) => new File([f.pxBlob], f.pxName + '.png', { type: 'image/png' });
  const canShare = (f) => { try { return !!(navigator.share && navigator.canShare && navigator.canShare({ files: [fileOf(f)] })); } catch { return false; } };
  const act = {
    open(f) { window.open(f.pxUrl, '_blank'); },
    trash(f) {
      const next = f.nextElementSibling || f.previousElementSibling;
      if (ql.file === f) ql.hide(true);
      PX.taken.delete(f.pxName); f.remove();
      setTimeout(() => URL.revokeObjectURL(f.pxUrl), 60000);
      if (next && next.classList.contains('px-file')) { select(next); next.focus({ preventScroll: true }); }
    },
    rename(f) { rename(f); },
    dup(f) {
      const base = f.pxName.replace(/ \(\d+\)$/, '');
      let n = base, i = 2; while (PX.taken.has(n)) n = `${base} (${i++})`;
      PX.taken.add(n);
      const g = PX.land(desk, f.pxBlob, n); f.after(g); select(g); g.focus({ preventScroll: true });
    },
    ql(f) { ql.show(f); },
    copy(f) { PX.copy(Promise.resolve(f.pxBlob)); },
    dl(f) { PX.save(f); },
    share(f) { navigator.share({ files: [fileOf(f)] }).catch(() => {}); },
  };

  // ---- the menu ------------------------------------------------------------------------------------------------
  const menu = document.createElement('div');
  menu.className = 'px-menu'; menu.hidden = true; menu.tabIndex = -1; menu.setAttribute('role', 'menu');
  document.body.append(menu);
  let target = null, rows = [], hi = -1;
  function build(f) {
    const s = t(), groups = [['open'], ['trash'], ['rename', 'dup', 'ql', 'copy', 'dl']];
    if (canShare(f)) groups.push(['share']);
    menu.textContent = ''; rows = [];
    groups.forEach((g, gi) => {
      if (gi) { const sp = document.createElement('div'); sp.className = 'sp'; sp.setAttribute('role', 'separator'); menu.append(sp); }
      g.forEach((k) => {
        const r = document.createElement('div'); r.className = 'it'; r.setAttribute('role', 'menuitem'); r.dataset.k = k;
        if (ICON[k]) { const ic = document.createElement('span'); ic.className = 'ic'; ic.innerHTML = ICON[k]; r.append(ic); }
        r.append(s[k]); menu.append(r); rows.push(r);
      });
    });
  }
  const light = (i) => { hi = i; rows.forEach((r, j) => r.classList.toggle('hl', j === i)); };
  function open(f, x, y) {
    if (ql.file) ql.hide();
    target = f; select(f); build(f); light(-1);
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
  function close(back) {
    if (menu.hidden) return;
    menu.hidden = true; light(-1);
    if (back && target && target.isConnected) target.focus({ preventScroll: true });
  }
  function choose(i) {
    const k = rows[i]?.dataset.k, f = target;
    close(k !== 'rename' && k !== 'ql');
    if (k && f && f.isConnected) act[k](f);
  }
  menu.addEventListener('pointermove', (e) => { const r = e.target.closest('.it'); light(r ? rows.indexOf(r) : -1); });
  menu.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') light(-1); });
  menu.addEventListener('pointerdown', (e) => { e.preventDefault(); const r = e.target.closest('.it'); if (r) light(rows.indexOf(r)); });
  menu.addEventListener('click', (e) => { const r = e.target.closest('.it'); if (r) choose(rows.indexOf(r)); });
  menu.addEventListener('contextmenu', (e) => e.preventDefault());
  menu.addEventListener('keydown', (e) => {
    const n = rows.length;
    if (e.key === 'Escape') close(true);
    else if (e.key === 'ArrowDown') light(hi < 0 ? 0 : Math.min(n - 1, hi + 1));
    else if (e.key === 'ArrowUp') light(hi < 0 ? n - 1 : Math.max(0, hi - 1));
    else if (e.key === 'Enter' || e.key === ' ') { if (hi >= 0) choose(hi); else close(true); }
    else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
      const c = e.key.toLocaleLowerCase(), from = hi + 1;
      for (let j = 0; j < n; j++) { const i = (from + j) % n; if (rows[i].textContent.toLocaleLowerCase().startsWith(c)) { light(i); break; } }
    } else if (e.key !== 'Tab') return;
    e.preventDefault();
  });
  addEventListener('pointerdown', (e) => { if (!menu.hidden && !menu.contains(e.target)) close(false); }, true);
  addEventListener('scroll', () => close(false), true);
  addEventListener('resize', () => close(false));
  addEventListener('blur', () => close(false));

  // ---- the file on the «Desktop» ---------------------------------------------------------------------------------
  desk.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    const f = e.target.closest('.px-file');
    if (f?.querySelector('[contenteditable]')) return;
    select(f); if (f) { e.preventDefault(); f.focus({ preventScroll: true }); }
  });
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
    const k = e.key, m = e.metaKey || e.ctrlKey;
    if (k === ' ' && !m) act.ql(f);
    else if (k === 'Enter' && !m) act.rename(f);
    else if (m && k === 'Backspace') act.trash(f);
    else if (m && (k === 'c' || k === 'C')) act.copy(f);
    else if (m && (k === 'd' || k === 'D')) act.dup(f);
    else if (m && (k === 'o' || k === 'O')) act.open(f);
    else if (k === 'ArrowRight' || k === 'ArrowLeft') {
      const all = files(), i = all.indexOf(f) + (k === 'ArrowRight' ? 1 : -1);
      if (all[i]) { select(all[i]); all[i].focus({ preventScroll: true }); }
    } else return;
    e.preventDefault();
  });
  desk.addEventListener('focusin', (e) => { const f = e.target.closest('.px-file'); if (f && !f.classList.contains('on')) select(f); });

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
  // Measured on macOS 27.2: the panel shrinks back into the file's icon in about 0.17 s; it opens by the same path.
  const ql = {
    el: null, file: null,
    title() { if (this.el) this.el.querySelector('.t').textContent = this.file.pxName + '.png'; },
    show(f) {
      if (this.file === f) return this.hide();
      if (this.file) this.hide(true);
      this.file = f; f.focus({ preventScroll: true });
      const el = this.el = document.createElement('div'); el.className = 'px-ql'; el.setAttribute('role', 'dialog');
      const bar = document.createElement('div'); bar.className = 'bar';
      const x = document.createElement('button'); x.className = 'x'; x.type = 'button'; x.setAttribute('aria-label', t().close);
      x.innerHTML = '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="7.5" fill="currentColor" opacity=".55"/><path d="M5.4 5.4l5.2 5.2M10.6 5.4l-5.2 5.2" stroke="' + (matchMedia('(prefers-color-scheme: dark)').matches ? '#282828' : '#ececec') + '" stroke-width="1.5" stroke-linecap="round"/></svg>';
      x.addEventListener('click', () => this.hide());
      const tt = document.createElement('span'); tt.className = 't';
      bar.append(x, tt);
      const im = new Image(); im.src = f.pxUrl; im.alt = ''; im.draggable = false;
      el.append(bar, im); document.body.append(el); this.title();
      const dpr = window.devicePixelRatio || 1, src = f.querySelector('.th img');
      const go = () => {
        const vw = document.documentElement.clientWidth, vh = window.innerHeight;
        let w = im.naturalWidth / dpr, h = im.naturalHeight / dpr;
        const k = Math.min(1, (vw - 40) / (w + 10), (vh - 80) / (h + 42)); w *= k; h *= k;
        im.style.width = w + 'px'; im.style.height = h + 'px';
        const W = Math.max(w + 10, 220), H = h + 42, L = (vw - W) / 2, Tp = (vh - H) / 2;
        el.style.width = W + 'px'; im.style.margin = `0 ${(W - 10 - w) / 2}px`;
        const r = src.getBoundingClientRect(), s = Math.max(r.width / W, 0.02);
        el.animate([
          { transform: `translate(${r.left}px, ${r.top}px) scale(${s})`, opacity: 0.6 },
          { transform: `translate(${L}px, ${Tp}px) scale(1)`, opacity: 1 },
        ], { duration: 200, easing: 'cubic-bezier(.2,.8,.2,1)' });
        el.style.transform = `translate(${L}px, ${Tp}px)`;
        this.at = [L, Tp, W];
      };
      el.style.visibility = 'hidden';
      im.decode().catch(() => {}).then(() => { el.style.visibility = ''; go(); });
    },
    hide(now) {
      const el = this.el, f = this.file;
      if (!el) return;
      this.el = this.file = null;
      const src = f.isConnected && f.querySelector('.th img');
      if (now || !src || !this.at) { el.remove(); return; }
      const r = src.getBoundingClientRect(), [L, Tp, W] = this.at, s = Math.max(r.width / W, 0.02);
      el.animate([
        { transform: `translate(${L}px, ${Tp}px) scale(1)`, opacity: 1 },
        { transform: `translate(${r.left}px, ${r.top}px) scale(${s})`, opacity: 0.6 },
      ], { duration: 170, easing: 'cubic-bezier(.4,0,.6,1)' }).finished.then(() => el.remove(), () => el.remove());
      f.focus({ preventScroll: true });
    },
  };
  addEventListener('keydown', (e) => {
    if (!ql.file || !menu.hidden) return;
    if (e.key === 'Escape' || (e.key === ' ' && !e.target.closest?.('.px-file'))) { e.preventDefault(); ql.hide(); }
  });
})();
