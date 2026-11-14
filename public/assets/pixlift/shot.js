// Pixlift's live block (his pick 2026-11-14, variant A of three, «Снимок области»): the README's telegram (Orville Wright to his father, 17 December 1903, Library of Congress,
// public domain) under macOS's crosshair. A drag over it is Capture Selected Portion: the area's own pixels become a PNG,
// put on the clipboard (the real one: it pastes anywhere) and landed on the «Desktop» row under the picture, named as
// the app names its files. One or twenty in a row; the clipboard holds the last. Touch: hold still 300 ms, then drag.
'use strict';
(() => {
  const fig = document.getElementById('px'), img = fig.querySelector('img'), veil = fig.querySelector('.sel');
  const desk = document.getElementById('px-desk'), X = PX.crosshair();
  img.style.cursor = 'none';
  const at = (cx, cy) => { const r = img.getBoundingClientRect(); return { x: Math.min(Math.max(cx - r.left, 0), r.width), y: Math.min(Math.max(cy - r.top, 0), r.height) }; };
  let start = null, now = null;
  function drawVeil() {
    if (!start || !now) { veil.hidden = true; return; }
    Object.assign(veil.style, { left: Math.min(start.x, now.x) + 'px', top: Math.min(start.y, now.y) + 'px', width: Math.abs(now.x - start.x) + 'px', height: Math.abs(now.y - start.y) + 'px' });
    veil.hidden = false;
  }
  function track(cx, cy) {
    now = at(cx, cy);
    const n = start ? [Math.abs(now.x - start.x), Math.abs(now.y - start.y)] : [now.x, now.y];
    X.paint(n.map((v) => String(Math.round(v))), cx + 40 > document.documentElement.clientWidth); X.place(cx, cy); drawVeil();
  }
  function finish() {
    const a = start, b = now; start = null; drawVeil();
    if (!a || !b || Math.abs(a.x - b.x) < 2 || Math.abs(a.y - b.y) < 2) return;
    const name = PX.name(), blob = PX.cut(img, Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(a.x - b.x), Math.abs(a.y - b.y));
    PX.copy(blob); blob.then((bl) => PX.land(desk, bl, name));
  }
  img.addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch') track(e.clientX, e.clientY); });
  img.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch' && !start) X.hide(); });
  img.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch' || e.button !== 0) return;
    e.preventDefault(); img.setPointerCapture(e.pointerId); start = at(e.clientX, e.clientY); track(e.clientX, e.clientY);
  });
  img.addEventListener('pointerup', (e) => {
    if (e.pointerType === 'touch' || !start) return;
    track(e.clientX, e.clientY); finish();
    const r = img.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) X.hide();
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && start) { start = null; drawVeil(); } });
  img.addEventListener('dragstart', (e) => e.preventDefault());
  let timer = 0, holding = false, first = null;
  img.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0]; first = [t.clientX, t.clientY]; clearTimeout(timer);
    timer = setTimeout(() => { holding = true; start = at(first[0], first[1]); track(first[0], first[1]); }, 300);
  }, { passive: true });
  img.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    if (holding) { e.preventDefault(); track(t.clientX, t.clientY); return; }
    if (first && Math.hypot(t.clientX - first[0], t.clientY - first[1]) > 8) clearTimeout(timer);
  }, { passive: false });
  img.addEventListener('touchend', (e) => { clearTimeout(timer); if (holding) { e.preventDefault(); holding = false; finish(); X.hide(); } }, { passive: false });
  img.addEventListener('touchcancel', () => { clearTimeout(timer); holding = false; start = null; drawVeil(); X.hide(); });
  img.addEventListener('contextmenu', (e) => e.preventDefault());
})();
