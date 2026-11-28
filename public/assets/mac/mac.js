// A small Mac on a page: macOS 27.2's desktop as his Mac shows it (Dark, black wallpaper, his Dock), a file on the desktop
// and Preview showing Minard's map of 1812, where a double-click on the title bar does what Fully does (data-mode="fully")
// or what macOS's own «Fill» does (data-mode="macos": a tile, given back the moment it is dragged).
// Everything shown answers as on a Mac; what a page cannot do is not drawn. Sizes are the Mac's points (mac.css).
// Timings measured in his recording of 2026-11-28 09:07 (rec2/window-spec.md):
//   fill: a critically damped spring, 1 − (1 + 27t)·e^(−27t) (50 % at ~70 ms, 95 % at ~190 ms, as measured; dev/windows.md);
//   open from the desktop file 0.20 s ease-out, the chrome fading in over its second half; close back into it 0.18 s;
//   minimise (Scale, into the app's icon) 0.21 s ease-in-out; restore 0.21 s ease-out, 85 ms after the click;
//   full screen in 0.53 s, out 0.44 s, the menu bar fading in 0.14 s; Dock: a launch widens it in 0.33 s with one 31 pt
//   bounce, a quit closes the gap in 0.44 s; a pressed icon darkens to 47 % until released.
// Menus: double-click interval 0.5 s; a chosen item blinks off 75 ms, on 50 ms, then the menu fades in 225 ms; a menu closed
// without a choice fades in 183 ms (Finder's menu, 27.2, history/2026-11-09-live-app-pages.md).
(() => {
  // Files are found next to this script, wherever the page is: /assets/mac/ on the site.
  const BASE = new URL('.', document.currentScript ? document.currentScript.src : location.href).href;
  const M = window.MAC_MENUS;
  const MB = 33, DOCK_TOP = 962, TITLE = 52;
  const IMG = { src: BASE + 'a/minard.jpg', w: 2003, h: 955, name: 'Minard, Campagne de Russie 1812-1813.jpg' };
  const spring = (t) => 1 - (1 + 27 * t) * Math.exp(-27 * t);
  const ease = { inOut: (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2), out: (t) => 1 - Math.pow(1 - t, 3), in: (t) => t * t * t };
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  const touchOnly = matchMedia('(pointer: coarse)').matches && !matchMedia('(pointer: fine)').matches;
  const onMac = /Mac/.test(navigator.platform || navigator.userAgent) && !touchOnly;
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const wait = (ms) => new Promise((r) => setTimeout(r, still.matches ? 0 : ms));
  const APPLE = '<svg viewBox="0 0 14 17"><path d="M11.6 9c0-2.2 1.8-3.2 1.9-3.3-1-1.5-2.6-1.7-3.2-1.7-1.3-.1-2.6.8-3.3.8-.7 0-1.7-.8-2.8-.8C2.8 4 1.4 4.9.6 6.2c-1.6 2.8-.4 6.9 1.1 9.1.8 1.1 1.7 2.3 2.8 2.3 1.1 0 1.6-.7 2.9-.7 1.3 0 1.7.7 2.9.7 1.2 0 2-1.1 2.7-2.2.9-1.3 1.2-2.5 1.2-2.6 0 0-2.3-.9-2.6-3.8zM9.5 2.6C10.1 1.9 10.5.9 10.4 0c-.9 0-1.9.6-2.5 1.3-.6.6-1 1.6-.9 2.6 1 .1 1.9-.5 2.5-1.3z" transform="translate(0 -.6)"/></svg>';
  // The buttons' glyphs on hover (window-spec §2): × 7.5 pt dark red, − 8 x 2 dark amber, full screen two triangles 6 x 6 dark green.
  const GLYPH = {
    r: '<svg viewBox="0 0 14 14"><path d="M3.25 3.25l7.5 7.5M10.75 3.25l-7.5 7.5" stroke="#a00a03" stroke-width="1.4" stroke-linecap="round"/></svg>',
    y: '<svg viewBox="0 0 14 14"><path d="M3.25 7h7.5" stroke="#b93201" stroke-width="2" stroke-linecap="round"/></svg>',
    g: '<svg viewBox="0 0 14 14"><path d="M4 10V5.6L8.4 10zM10 4v4.4L5.6 4z" fill="#016001"/></svg>',
  };
  const SIDEBAR = '<svg viewBox="0 0 31 18"><rect x=".75" y=".75" width="18.5" height="16.5" rx="3.5"/><path d="M7 .75v16.5M3 4.5h2M3 7h2M3 9.5h2"/><path d="M24.5 7.5l3 3 3-3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const TIP = '<svg viewBox="0 0 30 10"><path d="M0 0C8 0 12 2 14.2 9.2Q15 10.4 15.8 9.2C18 2 22 0 30 0z" fill="#252525"/><path d="M0 .5C8 .5 12 2.5 14.2 9.2Q15 10.4 15.8 9.2C18 2.5 22 .5 30 .5" fill="none" stroke="#474747"/></svg>';
  const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  class Mac {
    constructor(root) {
      this.root = root; const d = root.dataset;
      this.mode = d.mode || 'fully';
      this.W = +d.w || 1728; this.H = +d.h || 1117;
      if (!onMac && !touchOnly) root.classList.add('foreign');
      this.app = 'Preview'; this.running = true; this.state = 'open'; this.tile = null;
      this.build(); this.layout();
      this.put(this.firstFrame());
      new ResizeObserver(() => requestAnimationFrame(() => this.layout())).observe(root);
      this.clock(); this.bind(); this.paint();
      (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => this.label());
    }

    // —— drawing ——
    build() {
      const r = this.root; r.innerHTML = '';
      const desk = this.desk = el('div', 'desk'); r.append(desk);
      Object.assign(desk.style, { width: this.W + 'px', height: this.H + 'px' });
      this.mb = el('div', 'mb'); this.ml = el('div', 'ml'); this.mr = el('div', 'mr');
      this.mb.append(this.ml, this.mr); desk.append(this.mb);
      this.ck = el('div', 'ck', '<span class="dt"></span><span class="tm"></span>'); this.mr.append(this.ck);
      const ic = this.icon = el('div', 'icon');
      ic.innerHTML = `<div class="th"><img src="${IMG.src}" alt=""></div><div class="lb"></div>`;
      ic.style.left = this.W - 4.5 - 112 + 'px'; ic.style.top = '36px';
      desk.append(ic); this.thumb = ic.querySelector('img');
      const w = this.win = el('div', 'win');
      w.innerHTML = `<div class="pane"><div class="doc"><img src="${IMG.src}" alt="Minard's map of Napoleon's Russian campaign, 1812"></div>
        <div class="side"><img src="${IMG.src}" alt="">${IMG.name.replace(/\.jpg$/, '')}</div>
        <div class="bar"><div class="sb">${SIDEBAR}</div><div class="ttl"><span>${IMG.name}</span></div><div class="tls">
        <div class="tl r" data-b="close">${GLYPH.r}</div><div class="tl y" data-b="mini">${GLYPH.y}</div><div class="tl g" data-b="full">${GLYPH.g}</div></div></div></div>`;
      desk.append(w); this.bar = w.querySelector('.bar'); this.tls = w.querySelector('.tls'); this.docImg = w.querySelector('.doc img');
      this.dock = el('div', 'dock'); desk.append(this.dock);
      this.night = el('div', 'night'); desk.append(this.night);
      this.paintDock();
    }
    paintDock() {
      const t = (name, img) => `<div class="tile" data-t="${name}"><img src="${img}" alt=""></div>`;
      this.dock.innerHTML = t('Finder', BASE + 'a/finder.png') + (this.running ? t('Preview', BASE + 'a/preview.png') : '') + '<div class="dsep"></div>' + t('Trash', BASE + 'a/trash.png');
    }
    paintMenuBar() {
      this.ml.innerHTML = `<div class="mt apple" data-m="-1">${APPLE}</div>` +
        M[this.app].map(([n], i) => `<div class="mt${i === 0 ? ' app' : ''}" data-m="${i}"><span>${n}</span></div>`).join('');
    }
    paint() {
      this.paintMenuBar();
      const front = this.app === 'Preview';
      this.win.classList.toggle('idle', !front);
      this.icon.classList.toggle('dim', front);
      this.win.hidden = !['open', 'full'].includes(this.state) && !this.busy;
    }
    // Finder's label: one line, the middle of the name cut to fit the cell, the end kept (as drawn: «Minard,…-1813.jpg»).
    label() {
      const lb = this.icon.querySelector('.lb'), c = document.createElement('canvas').getContext('2d');
      c.font = '600 12px "Inter Mac"'; c.letterSpacing = '.1px';
      const max = 112, full = IMG.name, fits = (s) => c.measureText(s).width <= max;
      if (fits(full)) { lb.textContent = full; return; }
      const dot = full.lastIndexOf('.'), tailMin = full.length - dot + 5;   // what the end keeps: the extension and a little more
      for (let cut = 1; cut < full.length; cut++) {
        const keepHead = Math.ceil((full.length - cut) / 2), keepTail = Math.max(tailMin, full.length - cut - keepHead);
        const s = full.slice(0, Math.max(1, full.length - cut - keepTail)).trimEnd() + '…' + full.slice(full.length - keepTail);
        if (fits(s)) { lb.textContent = s; return; }
      }
    }
    clock() {   // his menu bar: «Sat 28 Nov» and «9:07:10 AM», the seconds ticking
      const d = new Date(), h = d.getHours(), two = (n) => String(n).padStart(2, '0');
      this.ck.firstChild.textContent = `${WD[d.getDay()]} ${d.getDate()} ${MO[d.getMonth()]}`;
      this.ck.lastChild.textContent = `${h % 12 || 12}:${two(d.getMinutes())}:${two(d.getSeconds())} ${h < 12 ? 'AM' : 'PM'}`;
      setTimeout(() => this.clock(), 1010 - d.getMilliseconds());
    }

    // —— geometry ——
    layout() {
      const cw = this.root.clientWidth; if (!cw) return;
      this.k = cw / this.W; this.root.style.height = this.H * this.k + 'px';
      this.desk.style.transform = `scale(${this.k})`;
    }
    vis() { return { x: 0, y: MB, w: this.W, h: DOCK_TOP - 2 - MB }; }   // Fill's frame in his recording: 0,33 to 1728,960
    isFull(f) { const v = this.vis(); return ['x', 'y', 'w', 'h'].every((k) => Math.abs(f[k] - v[k]) < .5); }
    firstFrame() { return { x: 362, y: 206, w: 1002, h: Math.round(TITLE + 1002 * IMG.h / IMG.w) }; }   // where his window stood before Fill
    put(f) {
      this.f = { ...f };
      const s = this.win.style; s.left = f.x + 'px'; s.top = f.y + 'px'; s.width = f.w + 'px'; s.height = f.h + 'px';
    }
    // The title bar stays where a pointer can take it again: under the menu bar, above the Dock, 80 pt of it on screen (unmeasured
    // on macOS, which keeps a dragged title bar inside the visible frame).
    clampTo(f) { return { ...f, y: Math.max(MB, Math.min(f.y, DOCK_TOP - 2 - TITLE)), x: Math.max(-f.w + 80, Math.min(f.x, this.W - 80)) }; }
    animate(to, curve = spring, len = .34, done) {
      const a = { ...this.f }, id = this.anim = (this.anim || 0) + 1;
      if (still.matches) { this.put(to); this.anim = 0; done && done(); return; }
      const t0 = performance.now();
      const step = (ts) => {
        if (id !== this.anim) return;
        const t = Math.max(0, (ts - t0) / 1000);
        if (t >= len) { this.anim = 0; this.put(to); done && done(); return; }
        const q = curve === spring ? spring(t) : curve(t / len);
        this.put({ x: a.x + (to.x - a.x) * q, y: a.y + (to.y - a.y) * q, w: a.w + (to.w - a.w) * q, h: a.h + (to.h - a.h) * q });
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
    rectOf(node) { const o = this.desk.getBoundingClientRect(), r = node.getBoundingClientRect(); return { x: (r.left - o.left) / this.k, y: (r.top - o.top) / this.k, w: r.width / this.k, h: r.height / this.k }; }
    // Where the picture sits inside the window's content (aspect-fit, centred).
    picIn(f) {
      const cw = f.w, ch = f.h - TITLE, s = Math.min(cw / IMG.w, ch / IMG.h), w = IMG.w * s, h = IMG.h * s;
      return { x: f.x + (cw - w) / 2, y: f.y + TITLE + (ch - h) / 2, w, h };
    }
    pt(e) { const o = this.desk.getBoundingClientRect(); return { x: (e.clientX - o.left) / this.k, y: (e.clientY - o.top) / this.k }; }
    // A picture flying from one rectangle to another.
    flyPic(from, to, len, curve) {
      const f = el('img', 'fly'); f.src = IMG.src; this.desk.append(f);
      const set = (r) => Object.assign(f.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' });
      set(from);
      return new Promise((res) => {
        if (still.matches) { f.remove(); return res(); }
        const t0 = performance.now();
        const step = (ts) => {
          const t = Math.min(1, (ts - t0) / (len * 1000)), q = curve(t);
          set({ x: from.x + (to.x - from.x) * q, y: from.y + (to.y - from.y) * q, w: from.w + (to.w - from.w) * q, h: from.h + (to.h - from.h) * q });
          if (t < 1) requestAnimationFrame(step); else res(f);
        };
        requestAnimationFrame(step);
      });
    }
    // Scale the drawn window (not its frame) towards a rectangle: minimise and restore.
    scaleWin(to, len, curve, reverse) {
      const f = this.f, ws = this.win.style, s = to.w / f.w;
      const at = `translate(${to.x - f.x}px,${to.y - f.y}px) scale(${s},${to.h / f.h})`;
      ws.transformOrigin = '0 0';
      return new Promise((res) => {
        if (still.matches) { ws.transform = ''; return res(); }
        const t0 = performance.now();
        const step = (ts) => {
          const t = Math.min(1, (ts - t0) / (len * 1000)), q = reverse ? 1 - curve(t) : curve(t);
          ws.transform = `translate(${(to.x - f.x) * q}px,${(to.y - f.y) * q}px) scale(${1 + (s - 1) * q},${1 + (to.h / f.h - 1) * q})`;
          if (t < 1) requestAnimationFrame(step); else { res(); }
        };
        if (reverse) ws.transform = at;
        requestAnimationFrame(step);
      });
    }

    // —— the window's moves ——
    fully() { if (this.isFull(this.f)) return; this.tile = null; this.animate(this.vis()); }
    fillTile() { if (!this.tile) this.tile = { ...this.f }; this.animate(this.vis()); }
    tileTo(name) {
      const v = this.vis(), hw = v.w / 2, hh = v.h / 2;
      const R = { Left: [0, 0, hw, v.h], Right: [hw, 0, hw, v.h], Top: [0, 0, v.w, hh], Bottom: [0, hh, v.w, hh],
        'Top Left': [0, 0, hw, hh], 'Top Right': [hw, 0, hw, hh], 'Bottom Left': [0, hh, hw, hh], 'Bottom Right': [hw, hh, hw, hh] }[name];
      if (!R) return;
      if (!this.tile) this.tile = { ...this.f };
      this.animate({ x: v.x + R[0], y: v.y + R[1], w: R[2], h: R[3] });
    }
    backFromTile() { if (this.tile) { const t = this.tile; this.tile = null; this.animate(t); } }
    center() { const v = this.vis(); this.animate({ ...this.f, x: Math.round((v.w - this.f.w) / 2), y: Math.round(v.y + (v.h - this.f.h) / 2) }); }
    zoom() {
      const v = this.vis(); let w = v.w, h = TITLE + w * IMG.h / IMG.w; if (h > v.h) { h = v.h; w = (h - TITLE) * IMG.w / IMG.h; }
      const z = { x: Math.round((v.w - w) / 2), y: v.y, w: Math.round(w), h: Math.round(h) };
      if (Math.abs(z.w - this.f.w) < 2 && Math.abs(z.h - this.f.h) < 2 && this.unzoom) { this.animate(this.unzoom, ease.inOut, .33); this.unzoom = null; }
      else { this.unzoom = { ...this.f }; this.tile = null; this.animate(z, ease.inOut, .33); }
    }
    async close() {   // back into the desktop file, a blurred ghost fading where the window stood
      if (this.busy || this.state !== 'open') return; this.busy = true;
      const ghost = this.win.cloneNode(true); ghost.className = 'ghost'; Object.assign(ghost.style, { left: this.f.x + 'px', top: this.f.y + 'px', width: this.f.w + 'px', height: this.f.h + 'px', transition: 'opacity .15s linear, filter .15s linear' });
      this.desk.append(ghost); this.win.hidden = true;
      requestAnimationFrame(() => { ghost.style.opacity = '0'; ghost.style.filter = 'blur(8px)'; });
      const fl = await this.flyPic(this.picIn(this.f), this.rectOf(this.thumb), .18, ease.inOut);
      fl && fl.remove(); ghost.remove();
      this.lastFrame = { ...this.f }; this.tile = null; this.state = 'closed'; this.busy = false; this.paint();
    }
    async open() {   // out of the desktop file: the picture grows to its place, the window fades in over the second half
      if (this.busy) return;
      if (this.state === 'mini') return this.restore();
      if (this.state === 'open' || this.state === 'full' || this.state === 'hidden') { this.state = this.state === 'hidden' ? 'open' : this.state; this.focus('Preview'); this.paint(); return; }
      this.busy = true;
      if (!this.running) { await this.launch(); }
      this.app = 'Preview'; this.paint();
      const f = this.lastFrame || this.firstFrame(); this.put(f);
      const ws = this.win.style; ws.opacity = '0'; this.win.hidden = false;
      const fly = this.flyPic(this.rectOf(this.thumb), this.picIn(f), .20, ease.out);
      await wait(100); ws.transition = 'opacity .1s linear'; ws.opacity = '1';
      const fl = await fly; fl && fl.remove(); ws.transition = ''; ws.opacity = '';
      this.state = 'open'; this.busy = false; this.paint();
    }
    // Dock: a launch widens it with the new tile growing from a point and one bounce; a quit closes the gap.
    async launch() {
      this.running = true; this.paintDock();
      const t = this.dock.querySelector('[data-t="Preview"]'); if (still.matches) return;
      t.style.cssText = 'width:0;margin:0;transform:scale(0)';
      t.getBoundingClientRect();
      t.style.transition = 'width .33s cubic-bezier(.45,0,.55,1),margin .33s cubic-bezier(.45,0,.55,1),transform .33s cubic-bezier(.45,0,.55,1)';
      t.style.cssText += ';width:128px;margin:0 3px;transform:translateY(-31px)';
      await wait(340);
      t.style.transition = 'transform .28s cubic-bezier(.45,0,.55,1)'; t.style.transform = '';
      await wait(120);
    }
    async quit() {
      if (this.busy) return;
      if (this.state === 'full') { this.mb.classList.remove('away'); this.dock.classList.remove('away'); this.win.classList.remove('full', 'reveal'); this.put(this.preFull); }
      this.lastFrame = { ...(this.state === 'closed' ? this.lastFrame || this.firstFrame() : this.f) };
      this.state = 'closed'; this.tile = null; this.app = 'Finder'; this.paint();
      await wait(240);
      const t = this.dock.querySelector('[data-t="Preview"]');
      if (t && !still.matches) { t.style.transition = 'width .44s cubic-bezier(.45,0,.55,1),margin .44s cubic-bezier(.45,0,.55,1),transform .44s cubic-bezier(.45,0,.55,1)'; t.style.cssText += ';width:0;margin:0;transform:scale(0)'; await wait(450); }
      this.running = false; this.paintDock();
    }
    async minimize() {   // Scale, into Preview's own icon, passing behind the Dock
      if (this.busy || this.state !== 'open') return; this.busy = true;
      const t = this.dock.querySelector('[data-t="Preview"] img'), r = this.rectOf(t);
      await this.scaleWin({ x: r.x + r.w * .1, y: r.y + r.h * .3, w: r.w * .8, h: r.w * .8 * this.f.h / this.f.w }, .21, ease.inOut);
      this.state = 'mini'; this.app = 'Finder'; this.busy = false; this.win.style.transform = ''; this.paint();
    }
    async restore() {
      if (this.busy) return; this.busy = true;
      await wait(85);
      const t = this.dock.querySelector('[data-t="Preview"] img'), r = this.rectOf(t);
      this.state = 'open'; this.app = 'Preview'; this.paint();
      await this.scaleWin({ x: r.x + r.w * .1, y: r.y + r.h * .3, w: r.w * .8, h: r.w * .8 * this.f.h / this.f.w }, .21, ease.out, true);
      this.win.style.transform = ''; this.busy = false;
    }
    fullScreen() {
      if (this.busy) return;
      if (this.state === 'full') {   // back: the frame it had, menu bar and Dock again
        this.state = 'open'; this.win.classList.remove('full', 'reveal');
        this.mb.classList.remove('away'); this.dock.classList.remove('away');
        this.animate(this.preFull, ease.inOut, .44); return;
      }
      if (this.state !== 'open') return;
      this.preFull = { ...this.f }; this.state = 'full'; this.tile = null;
      this.mb.classList.add('away'); this.dock.classList.add('away');
      this.animate({ x: 0, y: 0, w: this.W, h: this.H }, ease.inOut, .53, () => this.win.classList.add('full'));
    }
    focus(app) { if (this.app !== app) { this.app = app; this.closeMenu(true); this.paint(); } }
    toggleSidebar() { this.win.classList.toggle('side-on'); }

    // —— menus (rec3/menus-spec.md: geometry §5, timings §6) ——
    // A panel opens at once under its title, its left edge 16 pt left of the title's text, its top 1 pt under the bar.
    openMenu(i) {
      this.closeMenu(true); this.menuIx = i;
      const titleEl = this.ml.querySelector(`[data-m="${i}"]`); titleEl.classList.add('on');
      const [name, items] = i < 0 ? ['Apple', M.apple] : M[this.app][i];
      const p = this.menu = this.buildMenu(items, name);
      this.desk.append(p);
      const tx = this.rectOf(titleEl.firstElementChild || titleEl).x;
      p.style.left = Math.max(5, Math.min(tx - 16, this.W - p.offsetWidth - 5)) + 'px'; p.style.top = MB + 1 + 'px';
    }
    // One row: ✓ column, SF Symbol (a mask in the text's colour) or a colour icon, title, modifiers and key in two columns,
    // the chevron. Widths come from the longest parts, as AppKit lays a menu out.
    buildMenu(items, name) {
      const p = el('div', 'menu'); p.dataset.name = name;
      const rows = [];
      for (const s of items) {
        if (s === '---') { rows.push({ sep: true }); continue; }
        if (s.startsWith('[search field]')) { rows.push({ search: true }); continue; }
        if (s.startsWith('[tag colour dots')) { rows.push({ tags: true }); continue; }
        const [t, k = '', fl = '', ic = ''] = s.split('|');
        if (t === IMG.name && name === 'Window') { if (this.state === 'closed') continue; }
        rows.push({ t, k, fl, ic: ic.replace(/^icon:/, '') });
      }
      while (rows.length && rows[rows.length - 1].sep) rows.pop();
      const checks = rows.some((r) => r.fl && (r.fl.includes('c') || this.checked(r.t, name) !== null));
      const c = document.createElement('canvas').getContext('2d'); c.font = '400 14px "Inter Mac"';
      const split = (k) => { const m = k.match(/^([⌃⌥⇧⌘🌐]*)(.*)$/u); return [m[1], m[2]]; };
      let modW = 0, keyW = 0;
      for (const r of rows) if (r.k) { const [a, b] = split(r.k); modW = Math.max(modW, c.measureText(a.replace(/🌐/gu, 'W')).width); keyW = Math.max(keyW, b === '🌐' || b === '🎤' ? 13 : c.measureText(b).width); }
      for (const r of rows) {
        if (r.sep) { const e = el('div', 'sep'); e.style.setProperty('--l', (checks ? 30 : 16) + 'px'); p.append(e); continue; }
        if (r.search) { p.append(el('div', 'msearch', `<i class="ic" style="${this.mask('magnifyingglass@14-small-semibold')}"></i><span>Search</span>`)); continue; }
        if (r.tags) { const e = el('div', 'tags'); e.innerHTML = ['#ff453a', '#ff9f0a', '#ffd60a', '#30d158', '#0a84ff', '#bf5af2', '#98989d'].map((x) => `<i style="background:${x}"></i>`).join(''); p.append(e); continue; }
        if (r.fl.includes('h')) { p.append(el('div', 'mi hd', r.t)); continue; }
        const off = r.fl.includes('o') || this.dims(r.t, name);
        const it = el('div', 'mi' + (off ? ' off' : '') + (r.fl.includes('s') ? ' sub' : ''));
        const ck = this.checked(r.t, name); const isChecked = ck === null ? r.fl.includes('c') : ck;
        const colour = r.ic && /^(app|file):/.test(r.ic);
        let x = checks ? 31 : 17, h = '';
        if (isChecked) h += `<i class="ic ck" style="${this.mask('checkmark')}"></i>`;
        if (colour) { h += `<img class="cic" src="${BASE}a/menu/${r.ic.replace(':', '-')}.png" alt="">`; x = 38; }
        else if (r.ic && M.icons[r.ic]) { const [w, hh] = M.icons[r.ic]; h += `<i class="ic" style="${this.mask(r.ic)};width:${w}px;height:${hh}px;left:${(checks ? 36.5 : 24.5) - w / 2}px;top:${11 - hh / 2}px"></i>`; x = checks ? 51.5 : 42; }
        h += `<span class="t" style="padding-left:${x}px">${r.t}</span>`;
        if (r.k) {
          const [a, b] = split(r.k);
          const kb = b === '🎤' ? `<i class="ic kg" style="${this.mask('mic')}"></i>` : b === '🌐' ? `<i class="ic kg" style="${this.mask('globe')}"></i>` : b;
          h += `<span class="km" style="min-width:${modW}px">${a.replace('🌐', `<i class="ic kg" style="${this.mask('globe')}"></i>`)}</span><span class="kk" style="width:${Math.max(keyW, 9)}px">${kb}</span>`;
        } else if (modW) h += `<span class="km" style="min-width:${modW}px"></span><span class="kk" style="width:${Math.max(keyW, 9)}px"></span>`;
        if (r.fl.includes('s')) h += `<i class="ic chev" style="${this.mask('chevron.right')}"></i>`;
        it.innerHTML = h; it.dataset.a = r.t; p.append(it);
      }
      return p;
    }
    mask(n) { return `-webkit-mask-image:url('${BASE}a/menu/${n}.png');mask-image:url('${BASE}a/menu/${n}.png')`; }
    // Marks that follow the Mac's state: the window in the Window menu, the sidebar's mode in View.
    checked(t, name) {
      if (name === 'Window' && t === IMG.name) return ['open', 'full'].includes(this.state);
      if (this.app === 'Preview' && name === 'View') { const on = this.win.classList.contains('side-on'); if (t === 'Hide Sidebar') return !on; if (t === 'Thumbnails') return on; }
      return null;
    }
    dims(t, name) {
      if (this.app !== 'Preview') return false;
      const has = ['open', 'full'].includes(this.state);
      if (['Close Window', 'Close All', 'Minimize', 'Zoom', 'Fill', 'Center', 'Move & Resize', 'Full Screen Tile', 'Enter Full Screen', 'Hide Sidebar', 'Thumbnails'].includes(t)) return !has || (this.state === 'full' && !['Enter Full Screen', 'Close Window'].includes(t));
      if (t === 'Return to Previous Size') return !this.tile;
      return false;
    }
    // Closing: the title's capsule goes at once; the panel fades in 140 ms without a choice, 170 ms after one.
    closeMenu(now, len = 140) {
      const ms = [this.menu, ...(this.subs || [])].filter(Boolean); this.menu = null; this.subs = [];
      clearTimeout(this.subTimer);
      this.ml.querySelectorAll('.mt.on').forEach((e) => e.classList.remove('on'));
      for (const x of ms) { if (now || still.matches) x.remove(); else { x.style.transition = `opacity ${len}ms ease-out`; x.style.opacity = '0'; setTimeout(() => x.remove(), len + 10); } }
      this.menuIx = null;
    }
    // The pointer over a row: it lights at once; a row with a submenu opens it after 0.27 s, the row turning grey while the
    // pointer is inside the submenu.
    hoverItem(it) {
      if (!this.menu) return;
      this.subs = this.subs || [];
      const panel = it ? it.closest('.menu') : null;
      const level = panel ? [this.menu, ...this.subs].indexOf(panel) : -1;
      if (!it) { const top = this.subs.length ? this.subs[this.subs.length - 1] : this.menu; top.querySelectorAll('.mi.hl').forEach((e) => e.classList.remove('hl')); return; }
      if (level < 0) return;
      panel.querySelectorAll('.mi.hl,.mi.par').forEach((e) => { if (e !== it) e.classList.remove('hl', 'par'); });
      if (level > 0) { const parentRow = this.subs[level - 1].parentRow; parentRow.classList.remove('hl'); parentRow.classList.add('par'); }
      if (!it.classList.contains('off') && !it.classList.contains('hd')) { it.classList.add('hl'); it.classList.remove('par'); }
      // submenus deeper than this row's panel go, unless it is the row that owns the open one
      const keep = this.subs[level] && this.subs[level].parentRow === it;
      if (!keep) { this.subs.splice(level).forEach((s) => s.remove()); clearTimeout(this.subTimer); }
      if (!keep && it.classList.contains('sub') && !it.classList.contains('off')) {
        this.subTimer = setTimeout(() => this.openSub(it, panel, level), still.matches ? 0 : 270);
      }
    }
    openSub(it, panel, level) {
      const key = `${panel.dataset.name} > ${it.dataset.a}`, items = (M.subs[this.app] || {})[key];
      if (!items || !it.classList.contains('hl')) return;
      const s = this.buildMenu(items, it.dataset.a); s.parentRow = it; this.desk.append(s);
      const pr = this.rectOf(panel), ir = this.rectOf(it);
      let x = pr.x + pr.w - 5; if (x + s.offsetWidth > this.W) x = pr.x - s.offsetWidth + 5;
      s.style.left = x + 'px'; s.style.top = Math.min(ir.y - 5.5, this.H - s.offsetHeight - 5) + 'px';
      this.subs.splice(level, Infinity, s);
    }
    // A choice blinks once (off 75 ms, on 45 ms), then the menus fade in 170 ms and the command runs.
    choose(it) {
      if (!it || it.classList.contains('off') || it.classList.contains('sub') || it.classList.contains('hd')) return;
      const a = it.dataset.a, ms = [this.menu, ...(this.subs || [])].filter(Boolean);
      this.menu = null; this.subs = []; this.menuIx = null; clearTimeout(this.subTimer);
      this.ml.querySelectorAll('.mt.on').forEach((e) => e.classList.remove('on'));
      if (still.matches) { ms.forEach((x) => x.remove()); this.act(a); return; }
      it.classList.add('blink'); setTimeout(() => it.classList.remove('blink'), 75);
      setTimeout(() => { for (const x of ms) { x.style.transition = 'opacity 170ms ease-in-out'; x.style.opacity = '0'; setTimeout(() => x.remove(), 180); } this.act(a); }, 120);
    }
    act(a) {
      const P = this.app === 'Preview';
      switch (a) {
        case 'Close Window': case 'Close All': if (P) this.close(); break;
        case 'Minimize': if (P) this.minimize(); break;
        case 'Zoom': if (P) this.zoom(); break;
        case 'Fill': if (P) this.fillTile(); break;
        case 'Center': if (P) this.center(); break;
        case 'Return to Previous Size': this.backFromTile(); break;
        case 'Enter Full Screen': if (P) this.fullScreen(); break;
        case 'Thumbnails': if (P) this.win.classList.add('side-on'); break;
        case 'Hide Sidebar': if (P) this.win.classList.remove('side-on'); break;
        case 'Quit Preview': this.quit(); break;
        case 'Hide Preview': if (this.state === 'open') this.state = 'hidden'; this.app = 'Finder'; this.paint(); break;
        case 'Bring All to Front': case IMG.name: this.open(); break;
        case 'Preview': if (!this.running) this.launch().then(() => { this.app = 'Preview'; this.paint(); }); else this.focus('Preview'); break;
        case 'Sleep': this.night.classList.add('on'); break;
        default: if (['Left', 'Right', 'Top', 'Bottom', 'Top Left', 'Top Right', 'Bottom Left', 'Bottom Right'].includes(a)) this.tileTo(a);
      }
    }

    // —— input ——
    edgeAt(p) {   // the window's edges and corners for a mouse: bands in the visitor's own pixels, 3 inside and 4 outside
      if (this.state !== 'open' || this.busy) return null;
      const f = this.f, k = this.k, inn = 3 / k, out = 4 / k, cor = 16 / k;
      const l = p.x - f.x, r = f.x + f.w - p.x, t = p.y - f.y, b = f.y + f.h - p.y;
      if (l < -out || r < -out || t < -out || b < -out) return null;
      if (l > inn && r > inn && t > inn && b > inn) return null;
      if (t < cor && l < cor) return 'nw'; if (t < cor && r < cor) return 'ne';
      if (b < cor && l < cor) return 'sw'; if (b < cor && r < cor) return 'se';
      if (l <= inn) return 'w'; if (r <= inn) return 'e'; if (t <= inn) return 'n'; return 's';
    }
    setCursor(z) {
      const c = { n: 'rz-ns', s: 'rz-ns', e: 'rz-ew', w: 'rz-ew', nw: 'rz-nwse', se: 'rz-nwse', ne: 'rz-nesw', sw: 'rz-nesw' }[z] || '';
      if (this.cur !== c) { if (this.cur) this.desk.classList.remove(this.cur); if (c) this.desk.classList.add(c); this.cur = c; }
    }
    showTip(tile) {
      this.hideTip(); if (!tile) return;
      const tip = this.tip = el('div', 'tip', `${tile.dataset.t}<i>${TIP}</i>`); this.desk.append(tip);
      const r = this.rectOf(tile.querySelector('img'));
      tip.style.left = Math.max(6, Math.min(r.x + r.w / 2 - tip.offsetWidth / 2, this.W - tip.offsetWidth - 6)) + 'px';
      tip.style.top = DOCK_TOP - 35 + 'px';
    }
    hideTip() { if (this.tip) { this.tip.remove(); this.tip = null; } }
    bind() {
      const D = this.desk; let press = null, last = { t: 0, x: 0, y: 0, what: null };
      D.addEventListener('pointermove', (e) => {
        const p = this.pt(e);
        if (press && press.move) { press.move(p, e); return; }
        if (e.pointerType !== 'mouse') return;
        this.setCursor(this.edgeAt(p));
        if (this.state === 'full') this.win.classList.toggle('reveal', p.y < (this.win.classList.contains('reveal') ? MB + TITLE : 4));
        if (this.state === 'full') this.mb.classList.toggle('away', !this.win.classList.contains('reveal'));
        const tile = e.target.closest && e.target.closest('.tile');
        if (tile !== this.tipFor) { this.tipFor = tile; this.showTip(tile); }
        if (this.menu) {
          const mt = e.target.closest('.mt'); if (mt && +mt.dataset.m !== this.menuIx) this.openMenu(+mt.dataset.m);
          const mi = e.target.closest('.mi'); if (mi) this.hoverItem(mi); else if (!e.target.closest('.menu')) this.hoverItem(null);
        }
      });
      D.addEventListener('pointerleave', () => { this.hideTip(); this.tipFor = null; this.setCursor(null); });
      D.addEventListener('pointerdown', (e) => {
        if (e.button > 0) return;
        const p = this.pt(e), tg = e.target;
        if (this.night.classList.contains('on')) { this.night.classList.remove('on'); return; }
        const tol = (e.pointerType === 'mouse' ? 4 : 12) / this.k;
        const twice = (what) => e.timeStamp - last.t < 500 && Math.hypot(p.x - last.x, p.y - last.y) <= tol && last.what === what;
        const mark = (what) => { last = { t: e.timeStamp, x: p.x, y: p.y, what }; };
        const under = (ev) => document.elementFromPoint(ev.clientX, ev.clientY);
        const capture = () => { try { D.setPointerCapture(e.pointerId); } catch (_) {} };
        const mt = tg.closest('.mt');
        if (mt) {   // a menu opens on the press; dragging down and letting go on an item chooses it, as on a Mac
          const i = +mt.dataset.m; if (this.menuIx === i) this.closeMenu(); else this.openMenu(i); mark(null);
          press = { move: (q, ev) => { const t2 = under(ev); if (t2) { const m2 = t2.closest('.mt'); if (m2 && this.menu && +m2.dataset.m !== this.menuIx) this.openMenu(+m2.dataset.m); this.hoverItem(t2.closest('.mi')); } },
            up: (ev) => { const t2 = under(ev), mi = t2 && t2.closest('.mi'); if (mi) this.choose(mi); } };
          capture(); return;
        }
        const mi = tg.closest('.mi'); if (mi) { this.choose(mi); mark(null); return; }
        if (tg.closest('.menu')) return;
        if (this.menu) this.closeMenu();
        if (this.busy) return;
        const z = e.pointerType === 'mouse' ? this.edgeAt(p) : null;
        if (z) {
          e.preventDefault(); this.focus('Preview'); this.tile = null;
          const f0 = { ...this.f }, minW = 420, minH = 200, v = this.vis();
          press = { move: (q) => {
            let { x, y, w, h } = f0; const dx = q.x - p.x, dy = q.y - p.y;
            if (z.includes('e')) w = Math.min(Math.max(minW, f0.w + dx), this.W - x);
            if (z.includes('s')) h = Math.min(Math.max(minH, f0.h + dy), this.H - y);
            if (z.includes('w')) { w = Math.max(minW, f0.w - dx); x = f0.x + f0.w - w; if (x < 0) { w += x; x = 0; } }
            if (z.includes('n')) { h = Math.max(minH, f0.h - dy); y = f0.y + f0.h - h; if (y < v.y) { h -= v.y - y; y = v.y; } }
            this.put({ x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) });
          } };
          capture(); mark(null); return;
        }
        const b = tg.closest('.tl');
        if (b) { this.focus('Preview'); mark(null); this.tls.classList.add('show'); press = { up: (ev) => { const t2 = under(ev); if (t2 && t2.closest('.tl') === b) this.button(b.dataset.b); } }; capture(); return; }
        const sb = tg.closest('.sb');
        if (sb) { this.focus('Preview'); mark(null); press = { up: (ev) => { const t2 = under(ev); if (t2 && t2.closest('.sb') === sb) this.toggleSidebar(); } }; capture(); return; }
        if (tg.closest('.bar')) {
          e.preventDefault(); this.focus('Preview');
          const second = twice('bar'); mark('bar');
          if (this.state === 'full') return;
          const off = { x: p.x - this.f.x, y: p.y - this.f.y }; let moved = false;
          press = {
            move: (q) => {
              if (!moved && Math.hypot(q.x - p.x, q.y - p.y) < 1 / this.k) return;
              if (!moved) { moved = true; this.anim = 0; }
              if (this.tile) { const t = this.tile; this.tile = null; off.x = Math.min(t.w - 100, Math.max(100, off.x / this.f.w * t.w)); this.put({ ...this.f, w: t.w, h: t.h }); }
              this.put(this.clampTo({ ...this.f, x: Math.round(q.x - off.x), y: Math.round(q.y - off.y) }));
            },
            up: (ev) => {
              const q = this.pt(ev);
              if (second && Math.hypot(q.x - p.x, q.y - p.y) <= 4 / this.k && !ev.altKey && !ev.shiftKey && !ev.metaKey && !ev.ctrlKey) {
                if (this.mode === 'macos') this.fillTile(); else this.fully();
              }
            },
          };
          capture(); return;
        }
        if (tg.closest('.win')) { this.focus('Preview'); mark(null); return; }
        if (tg.closest('.icon')) {
          this.icon.classList.add('sel'); this.focus('Finder');
          const second = twice('icon'); mark('icon');
          press = { up: () => { if (second) this.open(); } };
          return;
        }
        const tile = tg.closest('.tile');
        if (tile) {
          mark(null); tile.classList.add('down');
          press = { up: (ev) => {
            tile.classList.remove('down');
            const t2 = under(ev); if (!t2 || t2.closest('.tile') !== tile) return;
            const n = tile.dataset.t;
            if (n === 'Preview') {
              if (this.state === 'mini') return this.restore();
              if (this.state === 'hidden') this.state = 'open';
              this.focus('Preview'); this.paint(); return;
            }
            this.icon.classList.remove('sel'); this.focus('Finder');
          }, cancel: () => tile.classList.remove('down') };
          capture(); return;
        }
        mark(null); this.icon.classList.remove('sel'); this.focus('Finder');
      });
      const end = (e) => {
        if (!press) return; const p = press; press = null; this.tls.classList.remove('show');
        if (e.type === 'pointerup') p.up && p.up(e); else p.cancel && p.cancel();
        if (this.f && !this.anim && this.state === 'open') this.lastFrame = { ...this.f };
      };
      D.addEventListener('pointerup', end); D.addEventListener('pointercancel', end);
      D.addEventListener('dblclick', (e) => e.preventDefault());
      D.addEventListener('contextmenu', (e) => e.preventDefault());   // the browser's own menu never opens over the Mac   // a double tap on the Mac never zooms the page
      addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (this.menu) this.closeMenu(); else if (this.state === 'full') this.fullScreen(); } });
      document.addEventListener('pointerdown', (e) => { if (this.menu && !this.root.contains(e.target)) this.closeMenu(); });
    }
    button(b) { if (b === 'close') this.close(); else if (b === 'mini') this.minimize(); else this.fullScreen(); }
  }
  const start = () => document.querySelectorAll('.mac').forEach((r) => { r.mac = new Mac(r); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
