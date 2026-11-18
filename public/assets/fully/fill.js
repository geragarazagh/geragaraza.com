// Fully's block: a window on a drawn screen behaves as Fully makes a Mac's windows behave (main.swift of 0.1).
// - A double-click (a double tap on a phone) on the empty part of the title bar fills the screen with the window on macOS's
//   own spring, progress = 1 - (1 + 27t)·e^(-27t), 0.34 s (measured frame by frame from macOS's Fill, ~/HHM/dev/windows.md
//   «0.2»), then the exact frame. As in the app it acts when the second click is let go within 4 points of its press, with
//   no modifier key held; a double-click on the window buttons or on the map (a control, page content) does nothing.
// - The title bar drags the window, filled or not, and the window keeps its size: the point of the app (macOS's own Fill
//   tile shrinks back to the old size the moment it is dragged). A window dragged aside fills again on the next
//   double-click; there is no restore, as in the app. The title bar never goes up into the menu bar, as on a Mac.
// - The edges and corners resize the window with a mouse or a trackpad, where and as macOS 27.2 does it for Preview's
//   window (his wish 2026-11-17 ~17:15; measured that evening in a clone of pxl-27, pointer moved in 1 pt steps, the
//   system cursor read back, and press-drags): bands 3 pt inside every edge and 2 pt (left, bottom) or 4 pt (right,
//   top) outside; each corner a zone 16 pt along both edges, its inner side cut along the window's rounding (ZONES);
//   the cursors as macOS draws them; the edge follows the pointer; the window no smaller than Preview's own minimum
//   (708 x 224 of its 1002 x 582, kept as a share of the first frame), never past the screen. The zones stay in real
//   points while the window is drawn smaller: they are where a real pointer finds an edge, not part of the picture.
//   On a touch screen there is no resizing: a finger anywhere but the title bar scrolls the page (his rule
//   2026-11-17 ~17:30, scrolling and resizing never confused).
// - The screen has a menu bar (since 2026-11-18), so the filled frame is the screen under it, as macOS's visible frame, and the
//   title bar never goes up into it. Its clock shows the visitor's own day and time in his menu bar's form («Wed 18 Nov
//   1:47:53 PM», English names whatever the browser's language, so it reads the same everywhere) and ticks each second.
//   What does not fit beside the clock is left out as macOS leaves it out of a full menu bar: the menus from the last one on,
//   then Control Center; on the narrowest phones the date too, the time stays.
// - Nothing plays by itself and nothing asks for a key. A reload brings the first window back.
(() => {
  const root = document.getElementById('fl'); if (!root) return;
  const scr = root.querySelector('.scr'), win = scr.querySelector('.win'), bar = win.querySelector('.bar'), mb = scr.querySelector('.mb');
  const ml = mb.querySelector('.ml'), mr = mb.querySelector('.mr'), dt = mr.querySelector('.dt'), tm = mr.querySelector('.tm');
  const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const two = (n) => String(n).padStart(2, '0');
  // Each second at its turn (a little after it, so a timer that fires early still shows the new second).
  (function tick() {
    const d = new Date(), h = d.getHours();
    dt.textContent = `${WD[d.getDay()]} ${d.getDate()} ${MO[d.getMonth()]}`;
    tm.textContent = `${h % 12 || 12}:${two(d.getMinutes())}:${two(d.getSeconds())}\u202F${h < 12 ? 'AM' : 'PM'}`;
    if (!mr.classList.contains('on')) { mr.classList.add('on'); fit(); }
    setTimeout(tick, 1010 - d.getMilliseconds());
  })();
  // What fits: everything, then out one by one while the menus would come closer than 40 u to the status items.
  function fit() {
    const out = [...ml.children].slice(2).reverse().concat(mr.querySelector('.cc'), dt);
    out.forEach((e) => e.removeAttribute('hidden'));   // an attribute, since an <svg> has no hidden property
    const room = () => mr.getBoundingClientRect().left - ml.getBoundingClientRect().left - ml.scrollWidth;
    const gap = mb.getBoundingClientRect().height * 40 / 64;
    for (const e of out) { if (room() >= gap) break; e.setAttribute('hidden', ''); }
  }
  if (document.fonts) document.fonts.ready.then(fit);
  const CURSOR = { n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize', nw: 'nwse-resize', se: 'nwse-resize', ne: 'nesw-resize', sw: 'nesw-resize' };
  // Measured zones (points). u counts inward from the vertical edge, v from the horizontal one; 0 is the first point inside,
  // -1 the first outside. A corner is a list of rows v = -3 … 15, each [first u, last u] that shows the corner's cursor.
  const row = (a) => Object.fromEntries(a.map(([v, l, r]) => [v, [l, r]]));
  const span = (from, to, l, r) => Array.from({ length: to - from + 1 }, (_, i) => [from + i, l, r]);
  const CUT = [[7, 14], [8, 13], [9, 12], [10, 10], [11, 9], [12, 9], [13, 8], [14, 7], [15, 6]];   // the top left one
  const ZONES = {
    nw: row([[-3, 2, 15], [-2, 0, 15], [-1, -1, 15], ...span(0, 6, -2, 15), ...CUT.map(([v, r]) => [v, -2, r])]),
    ne: row([[-3, 1, 15], [-2, -1, 15], [-1, -2, 15], [0, -3, 15], [1, -3, 15], ...span(2, 6, -4, 15), ...CUT.map(([v, r]) => [v, -4, r - 1])]),
    se: row([[-3, -1, 15], [-2, -2, 15], [-1, -3, 15], [0, -3, 15], ...span(1, 5, -4, 15), ...CUT.map(([v, r]) => [v - 1, -4, r - 1]), [15, -4, 5]]),
    sw: row([[-3, 0, 15], [-2, -1, 15], ...span(-1, 5, -2, 15), ...CUT.map(([v, r]) => [v - 1, -2, r]), [15, -2, 6]]),
  };
  // Bands: left and right the same all along; top and bottom 3 outside within 20 points of a corner (scanned beside each
  // corner), 4 (top) and 2 (bottom) at the middle of the edge.
  const BAND = { w: [-2, 2], e: [-4, 2], n: [-4, 2], s: [-2, 2] }, NEAR = { n: [-3, 2], s: [-3, 2] };
  // Which edge or corner a mouse at p would take, or null.
  function edgeAt(p) {
    const f = now(), l = f.x, t = f.y, r = f.x + f.w, b = f.y + f.h;
    const uw = Math.floor(p.x - l), ue = Math.ceil(r - p.x) - 1, vn = Math.floor(p.y - t), vs = Math.ceil(b - p.y) - 1;
    for (const [k, u, v] of [['nw', uw, vn], ['ne', ue, vn], ['sw', uw, vs], ['se', ue, vs]]) {
      if (u < -4 || u > 15 || v < -4 || v > 15) continue;   // outside this corner's square
      const z = ZONES[k][v];
      return z && u >= z[0] && u <= z[1] ? k : null;
    }
    const inV = vn > 15 && vs > 15, inH = uw > 15 && ue > 15;
    if (inV && uw >= BAND.w[0] && uw <= BAND.w[1]) return 'w';
    if (inV && ue >= BAND.e[0] && ue <= BAND.e[1]) return 'e';
    const bn = Math.min(uw, ue) <= 20 ? NEAR.n : BAND.n, bs = Math.min(uw, ue) <= 20 ? NEAR.s : BAND.s;
    if (inH && vn >= bn[0] && vn <= bn[1]) return 'n';
    if (inH && vs >= bs[0] && vs <= bs[1]) return 's';
    return null;
  }
  let first = null;   // the first frame: Preview's minimum is kept as a share of it
  const dots = [...bar.querySelectorAll('.tl')];
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  const OMEGA = 27, LENGTH = 0.34;
  // macOS: two presses count as a double-click within the double-click interval (0.5 s by default) and a few points apart;
  // a finger lands less exactly than a mouse, so a tap gets more room.
  const INTERVAL = 500;
  // The first frame is the stylesheet's (centred, 58 % wide) and is read only when first needed: WebKit may run a deferred
  // script before the stylesheet applies (the site's lesson of 2026-11-10), and a frame read then would be the unstyled one.
  let W = 0, H = 0, M = 0, f = null;   // M: the menu bar's height
  const full = () => ({ x: 0, y: M, w: W, h: H - M });
  const isFull = (r) => r.x === 0 && r.y === M && r.w === W && r.h === H - M;
  const now = () => {
    if (!f) {
      W = scr.clientWidth; H = scr.clientHeight; M = mb.getBoundingClientRect().height;
      const o = scr.getBoundingClientRect(), r = win.getBoundingClientRect();
      put({ x: r.left - o.left - scr.clientLeft, y: r.top - o.top - scr.clientTop, w: r.width, h: r.height }); first = f;
    }
    return f;
  };
  // Frames in whole points of the page, as the app sets whole points (.integral): the window's edges then lie on the same
  // grid as the pointer (WebKit reports it in whole points), so a zone counted in points is the same in every browser.
  function put(r) {
    // The filled frame is the screen under the menu bar, exactly, wherever the screen lies on the page.
    if (isFull(r)) f = { ...r };
    else {
      const o = scr.getBoundingClientRect(), ox = o.left + scr.clientLeft, oy = o.top + scr.clientTop;
      f = { x: Math.round(ox + r.x) - ox, y: Math.round(oy + r.y) - oy, w: Math.round(r.w), h: Math.round(r.h) };
      if (f.y < M && r.y >= M) f.y = M;   // the menu bar's edge need not lie on the grid: nothing goes up into it
    }
    const { x, y } = f;
    const s = win.style; s.left = x + 'px'; s.top = y + 'px'; s.width = f.w + 'px'; s.height = f.h + 'px';
  }
  let anim = 0;   // the running fill's number, 0 when none
  // A new width (a turned phone, a resized window) scales the frame with the screen, so a filled window stays filled.
  new ResizeObserver(() => requestAnimationFrame(() => {
    fit();
    const w = scr.clientWidth, h = scr.clientHeight;
    if (!f || !w || !h || (w === W && h === H)) return;   // untouched, the stylesheet keeps it in place
    const kx = w / W, ky = h / H, was = isFull(f); W = w; H = h; M = mb.getBoundingClientRect().height;
    if (!anim) put(was ? full() : { x: f.x * kx, y: f.y * ky, w: f.w * kx, h: f.h * ky });
  })).observe(scr);

  // The fill: the screen's visible frame, all of it under the menu bar (it has no Dock).
  function fill() {
    const a = now(), b = full();
    if (Math.max(Math.abs(a.x), Math.abs(a.y), Math.abs(a.w - b.w), Math.abs(a.h - b.h)) < .5) return;   // already filled: stays as it is
    if (still.matches) { put(b); return; }
    const t0 = performance.now(), id = ++anim;
    const step = (ts) => {
      if (id !== anim) return;
      const t = Math.max(0, (ts - t0) / 1000);   // a frame's time can be a little before t0
      if (t >= LENGTH) { anim = 0; put(b); return; }
      const k = 1 - (1 + OMEGA * t) * Math.exp(-OMEGA * t);
      put({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, w: a.w + (b.w - a.w) * k, h: a.h + (b.h - a.h) * k });
      requestAnimationFrame(step);
    };
    put(a); requestAnimationFrame(step);
  }

  // What the point is: a window button, the empty title bar (the title's letters included: Preview fills there), or the content.
  function where(p) {
    const f = now();
    if (p.x < f.x || p.x >= f.x + f.w || p.y < f.y || p.y >= f.y + f.h) return 'desktop';
    const b = bar.offsetHeight;
    if (p.y >= f.y + b) return 'content';
    for (const d of dots) {
      const r = d.offsetWidth / 2, cx = f.x + d.offsetLeft + r, cy = f.y + d.offsetTop + r;
      if (Math.hypot(p.x - cx, p.y - cy) <= r + 1) return 'button';
    }
    return 'bar';
  }
  const at = (e) => { const r = scr.getBoundingClientRect(); return { x: e.clientX - r.left - scr.clientLeft, y: e.clientY - r.top - scr.clientTop }; };

  let last = null;      // the previous press: time, point, pointer kind
  let second = null;    // the press of a double-click on the title bar, waiting for its release
  let drag = null, size = null;
  // The cursor over an edge or a corner, as macOS shows it (a mouse only, nothing pressed).
  scr.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || e.buttons || size || drag) return;
    const k = edgeAt(at(e)); scr.style.cursor = k ? cursorFor(k) : '';
  });
  scr.addEventListener('pointerleave', () => { if (!size) scr.style.cursor = ''; });
  // At the smallest size macOS shows the cursor that points outward only.
  function cursorFor(k) {
    const g = now(), mw = first.w * 708 / 1002, mh = first.h * 224 / 582, aw = g.w <= mw + .5, ah = g.h <= mh + .5;
    if ((k === 'e' || k === 'w') && aw) return k + '-resize';
    if ((k === 'n' || k === 's') && ah) return k + '-resize';
    if (k.length === 2 && aw && ah) return k + '-resize';
    return CURSOR[k];
  }
  scr.addEventListener('pointerdown', (e) => {
    if (!e.isPrimary || e.button !== 0 || anim) return;
    const p = at(e), touch = e.pointerType !== 'mouse', near = touch ? 24 : 4;
    const edge = touch ? null : edgeAt(p);
    if (edge) {   // an edge or a corner: a press that moves resizes; a double-click there that does not move is still a
      // double-click, and on the title bar it fills (macOS starts no resize without a move, and Fully sees the clicks)
      const n = last && e.timeStamp - last.t < INTERVAL && !last.touch && Math.hypot(p.x - last.p.x, p.y - last.p.y) < near ? 2 : 1;
      last = n === 2 ? null : { t: e.timeStamp, p, touch };
      second = n === 2 && where(p) === 'bar' && !(e.shiftKey || e.metaKey || e.altKey || e.ctrlKey) ? { p, touch } : null;
      size = { p, f0: now(), e: edge, moved: false };
      document.documentElement.style.cursor = scr.style.cursor = cursorFor(edge);   // kept while the pointer runs ahead of the edge
      e.preventDefault(); try { scr.setPointerCapture(e.pointerId); } catch {}
      return;
    }
    if (!e.target.closest('.win')) return;
    const n = last && e.timeStamp - last.t < INTERVAL && last.touch === touch && Math.hypot(p.x - last.p.x, p.y - last.p.y) < near ? 2 : 1;
    last = n === 2 ? null : { t: e.timeStamp, p, touch };
    const zone = where(p), mods = e.shiftKey || e.metaKey || e.altKey || e.ctrlKey;
    second = n === 2 && zone === 'bar' && !mods ? { p, touch } : null;
    if (zone === 'bar' || zone === 'button') {
      if (zone === 'bar') drag = { p, f0: f, moved: false, touch };
      e.preventDefault();
      try { scr.setPointerCapture(e.pointerId); } catch {}
    }
  });
  scr.addEventListener('pointermove', (e) => {
    // As macOS 27.2 does (measured: a 30 pt drag in 1 pt steps made Preview 29 pt wider), the edge follows from the
    // first move on, so that first step itself does not count.
    if (size && e.isPrimary) {
      const q = at(e);
      if (!size.moved) { if (Math.hypot(q.x - size.p.x, q.y - size.p.y) < 1) return; size.moved = true; last = null; size.p = q; return; }
      resize(q); return;
    }
    if (!drag || !e.isPrimary) return;
    const p = at(e), dx = p.x - drag.p.x, dy = p.y - drag.p.y;
    if (!drag.moved && Math.hypot(dx, dy) < (drag.touch ? 6 : 3)) return;
    drag.moved = true; last = null;   // a press that became a drag starts no double-click
    const b = bar.offsetHeight, keep = b * 2, g = drag.f0;
    put({ x: Math.min(W - keep, Math.max(keep - g.w, g.x + dx)), y: Math.min(H - b, Math.max(M, g.y + dy)), w: g.w, h: g.h });
  });
  // The moved edges follow the pointer; the opposite ones stay. Smallest: Preview's, as a share of the first frame. Largest:
  // the screen under the menu bar.
  function resize(p) {
    const g = size.f0, k = size.e, dx = p.x - size.p.x, dy = p.y - size.p.y, mw = first.w * 708 / 1002, mh = first.h * 224 / 582;
    let l = g.x, t = g.y, r = g.x + g.w, btm = g.y + g.h;
    if (k.includes('w')) l = Math.max(Math.min(0, l), Math.min(r - mw, g.x + dx));
    if (k.includes('e')) r = Math.min(Math.max(W, r), Math.max(l + mw, r + dx));
    if (k.includes('n')) t = Math.max(M, Math.min(btm - mh, g.y + dy));
    if (k.includes('s')) btm = Math.min(Math.max(H, btm), Math.max(t + mh, btm + dy));
    put({ x: l, y: t, w: r - l, h: btm - t });
  }
  const up = (e) => {
    if (!e.isPrimary) return;
    if (size) {
      const moved = size.moved, s = second; size = second = null; document.documentElement.style.cursor = '';
      if (!moved && s && e.type === 'pointerup' && Math.hypot(at(e).x - s.p.x, at(e).y - s.p.y) < 4) fill();
      if (e.pointerType === 'mouse') { const k = edgeAt(at(e)); scr.style.cursor = k ? cursorFor(k) : ''; }
      return;
    }
    const s = second; second = null;
    const moved = drag && drag.moved; drag = null;
    if (e.type !== 'pointerup' || !s || moved) return;
    const p = at(e);
    if (Math.hypot(p.x - s.p.x, p.y - s.p.y) < (s.touch ? 10 : 4)) fill();
  };
  scr.addEventListener('pointerup', up);
  scr.addEventListener('pointercancel', up);
  // iOS Safari turns a finger held on the page into its own long press (the site's lesson of 2026-11-11): the title bar
  // keeps its touches.
  bar.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
})();
