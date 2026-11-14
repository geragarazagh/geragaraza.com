// macOS's area selection (Capture Selected Portion, ⇧⌘4), shared by every live block that selects part of a picture: OCR's
// page and Pixlift's telegram run this one file, so the two can never drift apart (his word 2026-11-14 ~11:07, on Pixlift's
// page: OCR's selection is the right one, «такая же как вот здесь», Pixlift's must be exactly it).
//
// Over the picture the pointer becomes macOS's screenshot crosshair, measured from Retina frames of the real one on white,
// black and the telegram's beige paper (OCR's page 2026-11-09; his recordings 2026-11-14 11:07, 11:49 and 12:18). Every
// part is plain layers of black and white over what lies under it, so the same model holds on any background: the arms 11.5
// pt from the centre, a 1 pt core of black at 75 % (#404040 on white, black on black, 46/41/34 on paper 186/166/137) inside
// a 0.875 pt rim of white at 19 %; the ring 12.8 pt across (12:18: line centred 5.9 pt from the centre, outer edge 6.4 pt;
// it was drawn 16 pt across before), filled black 12 % + white 2.5 %, its 1 pt line black 40 % + white 14 %; the centre
// point, left open by the core and the ring's fill, black 23 % + white 5 %. The readout: opaque black digits over a sharp
// copy of them in white at 69 %, moved 1 pt right and 1 pt down (12:18 on the paper: digits 0, shadow 225 over paper 164).
// So black on white, grey 176 on black, black with a light edge on the beige paper; no outline (11:49: «эта белая обводка
// неправильная, её в оригинале нету»). 9 pt digits on 9 pt lines, left edge 7.75 pt right of the centre, first baseline
// 9.75 pt below it. Before the drag it shows the position in points, during it the selection's width and height counting
// both edge points (lines 101 pt apart read «102»), in the same place; the crosshair stays. The selection (12:18, on the
// paper and on black): a veil of grey 150 at 24.7 % (white 255 becomes 229, black becomes 37, paper 191/171/141 becomes
// 182/167/145) inside a 1 pt opaque white line centred on the edge points, so the line passes under the crosshair's centre;
// the line cannot be seen on white, which is why it was missed before. No animation: it appears with the first move of the
// drag and vanishes in one frame on release. A click without a drag selects nothing, as in macOS; Esc drops a drag. On a
// touch screen a finger held still for 300 ms starts the selection; until then the page scrolls as usual.
//
// area(img, veil, done): img is the picture, veil its .sel element; done(a, b, rect) gets the two corners in the picture's
// own CSS points (clamped to it) and its bounding rect, after the press is released over at least 2 x 2 points.
'use strict';
function area(img, veil, done) {
  const cross = document.getElementById('cross'), g = cross.getContext('2d');
  img.style.cursor = 'none';
  const at = (cx, cy) => { const r = img.getBoundingClientRect(); return { x: Math.min(Math.max(cx - r.left, 0), r.width), y: Math.min(Math.max(cy - r.top, 0), r.height), r }; };
  const SIZE = 80, O = 40; // canvas size and where the cross's centre sits in it
  // The plus as one outline: arms reaching a from the centre, half as thick as h.
  const plus = (c, a, h) => { c.moveTo(O - h, O - a); c.lineTo(O + h, O - a); c.lineTo(O + h, O - h); c.lineTo(O + a, O - h); c.lineTo(O + a, O + h); c.lineTo(O + h, O + h);
    c.lineTo(O + h, O + a); c.lineTo(O - h, O + a); c.lineTo(O - h, O + h); c.lineTo(O - a, O + h); c.lineTo(O - a, O - h); c.lineTo(O - h, O - h); c.closePath(); };
  function paint(readout, flip) {
    const s = window.devicePixelRatio || 1;
    if (cross.width !== SIZE * s) { cross.width = cross.height = SIZE * s; cross.style.width = cross.style.height = SIZE + 'px'; }
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cross.width, cross.height); g.setTransform(s, 0, 0, s, 0, 0);
    // The ring's fill, like the arms' core below, leaves the centre point open (12:18: it reads 135 on paper 168 and 197 on
    // white, the centre's own layers alone).
    g.beginPath(); g.arc(O, O, 6.4, 0, Math.PI * 2); g.rect(O - .5, O - .5, 1, 1); g.fillStyle = 'rgba(0,0,0,.124)'; g.fill('evenodd'); g.fillStyle = 'rgba(255,255,255,.024)'; g.fill('evenodd');
    g.lineWidth = 1; g.beginPath(); g.arc(O, O, 5.9, 0, Math.PI * 2); g.strokeStyle = 'rgba(0,0,0,.396)'; g.stroke(); g.strokeStyle = 'rgba(255,255,255,.137)'; g.stroke();
    // The rim: the plus grown by 0.875 pt with the core cut out (even-odd), then the core.
    g.beginPath(); plus(g, 11.5 + .875, .5 + .875); plus(g, 11.5, .5); g.fillStyle = 'rgba(255,255,255,.19)'; g.fill('evenodd');
    // The core leaves the centre point open too.
    g.beginPath(); plus(g, 11.5, .5); g.rect(O - .5, O - .5, 1, 1); g.fillStyle = 'rgba(0,0,0,.75)'; g.fill('evenodd');
    g.fillStyle = 'rgba(0,0,0,.228)'; g.fillRect(O - 0.5, O - 0.5, 1, 1); g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(O - 0.5, O - 0.5, 1, 1);
    // Readout: near the right edge of the window it moves to the cross's left, so it never leaves the screen. The white
    // copy first, 1 pt right and down, then the black digits over it.
    const x = flip ? O - 7.75 : O + 7.75;
    g.font = '9px system-ui, -apple-system, sans-serif'; g.textBaseline = 'alphabetic'; g.textAlign = flip ? 'right' : 'left';
    for (const [d, col] of [[1, 'rgba(255,255,255,.69)'], [0, '#000']]) {
      g.fillStyle = col; readout.forEach((t, i) => g.fillText(t, x + d, O + 9.75 + i * 9 + d));
    }
  }
  const place = (cx, cy) => { cross.style.transform = `translate(${cx - O}px, ${cy - O}px)`; cross.style.display = 'block'; };
  const hide = () => { cross.style.display = 'none'; };
  let start = null, now = null;
  function drawVeil() {
    // Nothing before the first move: macOS shows the rectangle only once the drag has a size.
    if (!start || !now || (now.x === start.x && now.y === start.y)) { veil.hidden = true; return; }
    // Half a point beyond each corner, so the 1 pt line (area.css) is centred on the edge points, as in macOS.
    Object.assign(veil.style, { left: Math.min(start.x, now.x) - .5 + 'px', top: Math.min(start.y, now.y) - .5 + 'px', width: Math.abs(now.x - start.x) + 1 + 'px', height: Math.abs(now.y - start.y) + 1 + 'px' });
    veil.hidden = false;
  }
  function track(cx, cy) {
    now = at(cx, cy);
    // During the drag macOS counts both edge points (12:18: lines 101 pt apart read «102»), so the size is the distance + 1.
    const n = start ? [Math.abs(now.x - start.x) + 1, Math.abs(now.y - start.y) + 1] : [now.x, now.y];
    // Grouped as the visitor's locale writes numbers, as macOS does («1 199» on his Russian Mac).
    paint(n.map((v) => Math.round(v).toLocaleString()), cx + 40 > document.documentElement.clientWidth); place(cx, cy); drawVeil();
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
