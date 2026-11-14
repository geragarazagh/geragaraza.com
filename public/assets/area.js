// macOS's area selection (Capture Selected Portion, ⇧⌘4), shared by every live block that selects part of a picture: OCR's
// page and Pixlift's telegram run this one file, so the two can never drift apart (his word 2026-11-14 ~11:07, on Pixlift's
// page: OCR's selection is the right one, «такая же как вот здесь», Pixlift's must be exactly it).
//
// Over the picture the pointer becomes macOS's screenshot crosshair (⇧⌘4), measured from Retina captures of the real one on
// white and on black (OCR's page 2026-11-09; his recordings 2026-11-14 11:07 and 11:49). Every part is a black layer and a
// white layer, so it reads on any background: the arms 11.5 pt from the centre, a 1 pt core of black at 75 % (#404040 on
// white, black on black) inside a 0.875 pt rim of white at 19 % (invisible on white, grey 48 on black); the ring 8 pt
// across, filled black 12 % + white 2.5 %, its 1 pt line black 40 % + white 14 %; the centre point black 23 % + white 5 %.
// The readout beside it has no outline (his word 11:49: «эта белая обводка неправильная, её в оригинале нету… на белом
// фоне оно просто чёрное полностью»): it is what lies under it turned over (white in difference) and then darkened by black
// at 31 %, so black on white, grey 176 on black, light over black letters, as measured. The difference half is a second
// canvas with mix-blend-mode: difference (area.css), under the first. The position in points before the drag, the
// selection's width and height during it. The selection is macOS's grey veil, black at 10 %, no border (paper 255
// becomes 229). A click without a drag selects nothing, as in macOS; Esc drops a drag. On a touch screen a finger held
// still for 300 ms starts the selection; until then the page scrolls as usual.
//
// area(img, veil, done): img is the picture, veil its .sel element; done(a, b, rect) gets the two corners in the picture's
// own CSS points (clamped to it) and its bounding rect, after the press is released over at least 2 x 2 points.
'use strict';
function area(img, veil, done) {
  const cross = document.getElementById('cross'), g = cross.getContext('2d');
  const diff = document.createElement('canvas'); diff.id = 'crossd'; diff.setAttribute('aria-hidden', 'true'); cross.before(diff);
  const gd = diff.getContext('2d');
  img.style.cursor = 'none';
  const at = (cx, cy) => { const r = img.getBoundingClientRect(); return { x: Math.min(Math.max(cx - r.left, 0), r.width), y: Math.min(Math.max(cy - r.top, 0), r.height), r }; };
  const SIZE = 80, O = 40; // canvas size and where the cross's centre sits in it
  // The plus as one outline: arms reaching a from the centre, half as thick as h.
  const plus = (c, a, h) => { c.moveTo(O - h, O - a); c.lineTo(O + h, O - a); c.lineTo(O + h, O - h); c.lineTo(O + a, O - h); c.lineTo(O + a, O + h); c.lineTo(O + h, O + h);
    c.lineTo(O + h, O + a); c.lineTo(O - h, O + a); c.lineTo(O - h, O + h); c.lineTo(O - a, O + h); c.lineTo(O - a, O - h); c.lineTo(O - h, O - h); c.closePath(); };
  function paint(readout, flip) {
    const s = window.devicePixelRatio || 1;
    for (const [c, x] of [[cross, g], [diff, gd]]) {
      if (c.width !== SIZE * s) { c.width = c.height = SIZE * s; c.style.width = c.style.height = SIZE + 'px'; }
      x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, c.width, c.height); x.setTransform(s, 0, 0, s, 0, 0);
    }
    g.beginPath(); g.arc(O, O, 8, 0, Math.PI * 2); g.fillStyle = 'rgba(0,0,0,.124)'; g.fill(); g.fillStyle = 'rgba(255,255,255,.024)'; g.fill();
    g.lineWidth = 1; g.beginPath(); g.arc(O, O, 7.5, 0, Math.PI * 2); g.strokeStyle = 'rgba(0,0,0,.396)'; g.stroke(); g.strokeStyle = 'rgba(255,255,255,.137)'; g.stroke();
    // The rim: the plus grown by 0.875 pt with the core cut out (even-odd), then the core.
    g.beginPath(); plus(g, 11.5 + .875, .5 + .875); plus(g, 11.5, .5); g.fillStyle = 'rgba(255,255,255,.19)'; g.fill('evenodd');
    g.beginPath(); plus(g, 11.5, .5); g.fillStyle = 'rgba(0,0,0,.75)'; g.fill();
    g.fillStyle = 'rgba(0,0,0,.228)'; g.fillRect(O - 0.5, O - 0.5, 1, 1); g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(O - 0.5, O - 0.5, 1, 1);
    // Readout: 9 pt digits on 9 pt lines, left edge 7.75 pt right of the centre, first baseline 9.75 pt below it; near the
    // right edge of the window it moves to the cross's left, so it never leaves the screen.
    const x = flip ? O - 7.75 : O + 7.75;
    for (const [c, col] of [[gd, '#fff'], [g, 'rgba(0,0,0,.31)']]) {
      c.font = '9px system-ui, -apple-system, sans-serif'; c.textBaseline = 'alphabetic'; c.textAlign = flip ? 'right' : 'left'; c.fillStyle = col;
      readout.forEach((t, i) => c.fillText(t, x, O + 9.75 + i * 9));
    }
  }
  const place = (cx, cy) => { for (const c of [cross, diff]) { c.style.transform = `translate(${cx - O}px, ${cy - O}px)`; c.style.display = 'block'; } };
  const hide = () => { cross.style.display = diff.style.display = 'none'; };
  let start = null, now = null;
  function drawVeil() {
    if (!start || !now) { veil.hidden = true; return; }
    Object.assign(veil.style, { left: Math.min(start.x, now.x) + 'px', top: Math.min(start.y, now.y) + 'px', width: Math.abs(now.x - start.x) + 'px', height: Math.abs(now.y - start.y) + 'px' });
    veil.hidden = false;
  }
  function track(cx, cy) {
    now = at(cx, cy);
    const n = start ? [Math.abs(now.x - start.x), Math.abs(now.y - start.y)] : [now.x, now.y];
    paint(n.map((v) => String(Math.round(v))), cx + 40 > document.documentElement.clientWidth); place(cx, cy); drawVeil();
  }
  function finish() {
    const a = start, b = now; start = null; drawVeil();
    if (!a || !b || Math.abs(a.x - b.x) < 2 || Math.abs(a.y - b.y) < 2) return;
    done(a, b, b.r);
  }
  // Mouse and pen.
  img.addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch') track(e.clientX, e.clientY); });
  img.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch' && !start) hide(); });
  img.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch' || e.button !== 0) return;
    e.preventDefault(); img.setPointerCapture(e.pointerId); start = at(e.clientX, e.clientY); track(e.clientX, e.clientY);
  });
  img.addEventListener('pointerup', (e) => {
    if (e.pointerType === 'touch' || !start) return;
    track(e.clientX, e.clientY); finish();
    const r = img.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) hide();
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && start) { start = null; drawVeil(); } });
  img.addEventListener('dragstart', (e) => e.preventDefault());
  // Touch.
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
  img.addEventListener('touchend', (e) => { clearTimeout(timer); if (holding) { e.preventDefault(); holding = false; finish(); hide(); } }, { passive: false });
  img.addEventListener('touchcancel', () => { clearTimeout(timer); holding = false; start = null; drawVeil(); hide(); });
  img.addEventListener('contextmenu', (e) => e.preventDefault());
}
