// macOS's area selection (Capture Selected Portion, ⇧⌘4), shared by every live block that selects part of a picture: OCR's
// page and Pixlift's telegram run this one file, so the two can never drift apart (his word 2026-11-14 ~11:07, on Pixlift's
// page: OCR's selection is the right one, «такая же как вот здесь», Pixlift's must be exactly it).
//
// Over the picture the pointer becomes macOS's screenshot crosshair, measured from a Retina capture: arms 11.5 pt of #404040,
// 1 pt thick, a light centre, a grey ring 8 pt across, and beside it the position in points (before the drag) or the
// selection's width and height (during it). The selection is macOS's grey veil, black at 10 %, no border (paper 255
// becomes 229). A click without a drag selects nothing, as in macOS; Esc drops a drag. On a touch screen a finger held
// still for 300 ms starts the selection; until then the page scrolls as usual.
//
// area(img, veil, done): img is the picture, veil its .sel element; done(a, b, rect) gets the two corners in the picture's
// own CSS points (clamped to it) and its bounding rect, after the press is released over at least 2 x 2 points.
'use strict';
function area(img, veil, done) {
  const cross = document.getElementById('cross'), g = cross.getContext('2d');
  img.style.cursor = 'none';
  const at = (cx, cy) => { const r = img.getBoundingClientRect(); return { x: Math.min(Math.max(cx - r.left, 0), r.width), y: Math.min(Math.max(cy - r.top, 0), r.height), r }; };
  const SIZE = 80, O = 40; // canvas size and where the cross's centre sits in it
  function paint(readout, flip) {
    const s = window.devicePixelRatio || 1;
    if (cross.width !== SIZE * s) { cross.width = cross.height = SIZE * s; cross.style.width = cross.style.height = SIZE + 'px'; }
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cross.width, cross.height); g.setTransform(s, 0, 0, s, 0, 0);
    g.fillStyle = 'rgba(0,0,0,.12)'; g.beginPath(); g.arc(O, O, 8, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.34)'; g.lineWidth = 1; g.beginPath(); g.arc(O, O, 7.5, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#404040'; g.fillRect(O - 11.5, O - 0.5, 23, 1); g.fillRect(O - 0.5, O - 11.5, 1, 23);
    g.fillStyle = '#c8c8c8'; g.fillRect(O - 0.5, O - 0.5, 1, 1);
    // Readout: 9 pt digits on 9 pt lines, left edge 7.75 pt right of the centre, first baseline 9.75 pt below it; near the
    // right edge of the window it moves to the cross's left, so it never leaves the screen.
    g.font = '9px system-ui, -apple-system, sans-serif'; g.textBaseline = 'alphabetic';
    g.lineJoin = 'round'; g.strokeStyle = '#fff'; g.lineWidth = 2.5; g.fillStyle = '#000';
    g.textAlign = flip ? 'right' : 'left'; const x = flip ? O - 7.75 : O + 7.75;
    readout.forEach((t, i) => { const y = O + 9.75 + i * 9; g.strokeText(t, x, y); g.fillText(t, x, y); });
  }
  const place = (cx, cy) => { cross.style.transform = `translate(${cx - O}px, ${cy - O}px)`; cross.style.display = 'block'; };
  const hide = () => { cross.style.display = 'none'; };
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
