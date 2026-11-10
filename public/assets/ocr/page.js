// The first page of «War and Peace» (1937 Jubilee edition, vol. 9, p. 3), and OCR's selection over it.
//
// The page was read beforehand by OCR's own engine (its main.swift, unchanged: Vision at 1.5x, tiles, the second
// look at words in another script, the cleanup), with the box of every word kept (page.json). So a selection
// here gives what OCR gives: every word whose middle lies inside the rectangle, line by line in OCR's order,
// words joined by spaces and lines by line breaks. A click without a drag selects nothing, as in macOS.
//
// Over the page the pointer becomes macOS's screenshot crosshair, measured from a Retina capture: arms 11.5 pt
// of #404040, 1 pt thick, a light centre, a grey ring 8 pt across, and beside it the position in points (before
// the drag) or the selection's width and height (during it). The selection is macOS's grey veil, black at 10 %.
// Copying is silent, as in the app. On a touch screen a finger held still for a moment starts the selection.

const fig = document.getElementById('page'), img = fig.querySelector('img'), veil = fig.querySelector('.sel');
const cross = document.getElementById('cross'), cctx = cross.getContext('2d');
let lines = [];
fetch('/assets/ocr/page.json').then((r) => r.json()).then((d) => (lines = d.lines));

// Position inside the picture, in its own CSS points, clamped to it.
function at(clientX, clientY) {
  const r = img.getBoundingClientRect();
  return { x: Math.min(Math.max(clientX - r.left, 0), r.width), y: Math.min(Math.max(clientY - r.top, 0), r.height), r };
}

function text(a, b, r) {
  const x0 = Math.min(a.x, b.x) / r.width, x1 = Math.max(a.x, b.x) / r.width;
  const y0 = Math.min(a.y, b.y) / r.height, y1 = Math.max(a.y, b.y) / r.height;
  const out = [];
  for (const l of lines) {
    const got = l.w.filter(([, x, y, w, h]) => { const mx = x + w / 2, my = y + h / 2; return mx >= x0 && mx <= x1 && my >= y0 && my <= y1; });
    // A sixth value marks a piece cut off the word before it (a margin number Vision glued on): no space between them.
    if (got.length) out.push(got.map((w, i) => (i && !w[5] ? ' ' : '') + w[0]).join(''));
  }
  return out.join('\n');
}

// The crosshair, drawn in points on a canvas that follows the pointer.
const SIZE = 80, O = 40; // canvas size and where the cross's centre sits in it
const dpr = () => window.devicePixelRatio || 1;
function paint(readout, flip) {
  const s = dpr(), g = cctx;
  if (cross.width !== SIZE * s) { cross.width = cross.height = SIZE * s; cross.style.width = cross.style.height = SIZE + 'px'; }
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cross.width, cross.height); g.setTransform(s, 0, 0, s, 0, 0);
  g.fillStyle = 'rgba(0,0,0,.12)'; g.beginPath(); g.arc(O, O, 8, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(0,0,0,.34)'; g.lineWidth = 1; g.beginPath(); g.arc(O, O, 7.5, 0, Math.PI * 2); g.stroke();
  g.fillStyle = '#404040';
  g.fillRect(O - 11.5, O - 0.5, 23, 1); g.fillRect(O - 0.5, O - 11.5, 1, 23);
  g.fillStyle = '#c8c8c8'; g.fillRect(O - 0.5, O - 0.5, 1, 1);
  // Readout: 9 pt digits on 9 pt lines, left edge 7.75 pt right of the centre, first baseline 9.75 pt below it.
  g.font = '9px system-ui, -apple-system, sans-serif'; g.textBaseline = 'alphabetic';
  g.lineJoin = 'round'; g.strokeStyle = '#fff'; g.lineWidth = 2.5; g.fillStyle = '#000';
  // Near the right edge of the window the readout moves to the cross's left, so it never leaves the screen.
  g.textAlign = flip ? 'right' : 'left';
  const x = flip ? O - 7.75 : O + 7.75;
  readout.forEach((t, i) => { const y = O + 9.75 + i * 9; g.strokeText(t, x, y); g.fillText(t, x, y); });
}
function place(clientX, clientY) { cross.style.transform = `translate(${clientX - O}px, ${clientY - O}px)`; cross.style.display = 'block'; }
function hideCross() { cross.style.display = 'none'; }

let start = null, now = null;
function drawVeil() {
  if (!start || !now) { veil.hidden = true; return; }
  const x = Math.min(start.x, now.x), y = Math.min(start.y, now.y);
  Object.assign(veil.style, { left: x + 'px', top: y + 'px', width: Math.abs(now.x - start.x) + 'px', height: Math.abs(now.y - start.y) + 'px' });
  veil.hidden = false;
}
function track(clientX, clientY) {
  now = at(clientX, clientY);
  const n = start ? [Math.round(Math.abs(now.x - start.x)), Math.round(Math.abs(now.y - start.y))] : [Math.round(now.x), Math.round(now.y)];
  paint(n.map(String), clientX + 40 > document.documentElement.clientWidth); place(clientX, clientY); drawVeil();
}
async function finish() {
  const a = start, b = now; start = null; drawVeil();
  if (!a || !b || Math.abs(a.x - b.x) < 2 || Math.abs(a.y - b.y) < 2) return;
  const t = text(a, b, b.r);
  if (t) try { await navigator.clipboard.writeText(t); } catch {}
}

// Mouse and pen.
img.addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch') track(e.clientX, e.clientY); });
img.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch' && !start) hideCross(); });
img.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'touch' || e.button !== 0) return;
  e.preventDefault(); img.setPointerCapture(e.pointerId); start = at(e.clientX, e.clientY); track(e.clientX, e.clientY);
});
img.addEventListener('pointerup', (e) => {
  if (e.pointerType === 'touch' || !start) return;
  track(e.clientX, e.clientY); finish();
  const r = img.getBoundingClientRect();
  if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) hideCross();
});
addEventListener('keydown', (e) => { if (e.key === 'Escape' && start) { start = null; drawVeil(); } });
img.addEventListener('dragstart', (e) => e.preventDefault());

// Touch: hold still for 300 ms, then drag; until then the page scrolls as usual.
let timer = 0, holding = false, first = null;
img.addEventListener('touchstart', (e) => {
  if (e.touches.length !== 1) return;
  const t = e.touches[0]; first = [t.clientX, t.clientY];
  clearTimeout(timer);
  timer = setTimeout(() => { holding = true; start = at(first[0], first[1]); track(first[0], first[1]); }, 300);
}, { passive: true });
img.addEventListener('touchmove', (e) => {
  const t = e.touches[0];
  if (holding) { e.preventDefault(); track(t.clientX, t.clientY); return; }
  if (first && Math.hypot(t.clientX - first[0], t.clientY - first[1]) > 8) clearTimeout(timer);
}, { passive: false });
img.addEventListener('touchend', (e) => {
  clearTimeout(timer);
  if (holding) { e.preventDefault(); holding = false; finish(); hideCross(); }
}, { passive: false });
img.addEventListener('touchcancel', () => { clearTimeout(timer); holding = false; start = null; drawVeil(); hideCross(); });
img.addEventListener('contextmenu', (e) => e.preventDefault());
