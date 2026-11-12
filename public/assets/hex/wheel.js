// The color wheel of the Colors panel of macOS, and #HEX's loupe over it.
//
// The wheel is Apple's, read off NSColorPickerWheelView itself (drawn offscreen into a float Display P3 context,
// 2026-11-09) and found to be, to within 0.2/255 on average: HSV in Display P3, brightness 1, saturation = distance
// from the centre / radius, and the hue running counter-clockwise from red on the right, eased inside each 60°
// sector by 3t² − 2t³ (so red, yellow, green, cyan, blue and magenta each sit exactly 60° apart and the colours
// between them gather towards them). Its rim is Apple's too: the last point lightens and fades as measured.
// Every device pixel is computed, so the wheel is sharp at any size and on any screen.
//
// The loupe is the system's color sampler as #HEX opens it, measured from Retina screenshots of it: 121 pt across,
// a 13 pt ring in the color of the centre pixel, a 3 pt inner line, one device pixel per 10.5 pt cell with 1 pt
// grid lines, the centre cell framed by a 3 pt rounded square. A click copies the centre pixel the way #HEX
// does: sRGB, 8 bits per channel, upper case, #RRGGBB. Nothing says so on screen, as nothing does in the app:
// there the loupe vanishes at the press and the arrow is back. Here it then returns after AGAIN ms, as if #HEX
// were opened again, appearing at once like the system's (no fade either way: measured at 60 fps on his screen
// recording of 2026-11-10, where his click-to-shortcut gaps were 1.0-1.25 s).
// On a touch screen a finger held still for a moment brings the loupe up above the finger; letting go copies.

const box = document.getElementById('wheel'), wheel = box.querySelector('canvas'), loupe = document.getElementById('loupe');
const P3 = (() => {
  try { return document.createElement('canvas').getContext('2d', { colorSpace: 'display-p3' }).getContextAttributes().colorSpace === 'display-p3'; }
  catch { return false; }
})() && CSS.supports('color', 'color(display-p3 1 0 0)');
const wctx = wheel.getContext('2d', P3 ? { colorSpace: 'display-p3' } : {});
const lctx = loupe.getContext('2d', P3 ? { colorSpace: 'display-p3' } : {});
const dark = matchMedia('(prefers-color-scheme: dark)');

// Apple's rim, from the 4x render: distance from the edge in points -> [mix with white, opacity].
const RIM = [[0, 0.18, 0.55], [0.125, 0.18, 0.55], [0.375, 0.16, 0.604], [0.625, 0.102, 0.945], [0.875, 0.098, 1], [1.125, 0, 1]];
function rim(e) {
  if (e <= 0) return null;
  if (e >= 1.125) return [0, 1];
  let i = 1; while (RIM[i][0] < e) i++;
  const [e0, w0, a0] = RIM[i - 1], [e1, w1, a1] = RIM[i], f = (e - e0) / (e1 - e0);
  return [w0 + (w1 - w0) * f, a0 + (a1 - a0) * f];
}

let N = 0, dpr = 1, data = null; // the wheel's own pixels, Display P3 (or sRGB where P3 is missing), straight alpha

// The colour of the wheel at device pixel (x, y): [r, g, b, a] in Display P3, 0..1.
function at(x, y) {
  const c = (N - 1) / 2, R = N / 2, dx = x - c, dy = c - y, r = Math.hypot(dx, dy);
  const m = rim((R - r) / dpr);
  if (!m) return null;
  let deg = Math.atan2(dy, dx) * 180 / Math.PI; if (deg < 0) deg += 360;
  const k = Math.floor(deg / 60), t = deg / 60 - k, h = (k + t * t * (3 - 2 * t)) % 6;
  const s = Math.min(r / R, 1), i = Math.floor(h), f = h - i;
  const p = 1 - s, q = 1 - s * f, u = 1 - s * (1 - f);
  let rgb = [[1, u, p], [q, 1, p], [p, 1, u], [p, q, 1], [u, p, 1], [1, p, q]][i];
  rgb = rgb.map((v) => v + (1 - v) * m[0]);
  return [rgb[0], rgb[1], rgb[2], m[1]];
}

// Display P3 -> sRGB, both with the sRGB curve; outside sRGB is clamped, as #HEX clamps.
const lin = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const enc = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
function toSRGB([r, g, b]) {
  const R = lin(r), G = lin(g), B = lin(b);
  return [1.2249401 * R - 0.2249404 * G, -0.0420569 * R + 1.0420571 * G, -0.0196376 * R - 0.0786361 * G + 1.0982735 * B]
    .map((v) => enc(Math.min(1, Math.max(0, v))));
}
const bg = () => (dark.matches ? 0 : 1);

function draw() {
  dpr = window.devicePixelRatio || 1;
  const css = box.getBoundingClientRect().width;
  N = Math.floor(css * dpr);
  if (!N) return;
  wheel.width = wheel.height = N;
  wheel.style.width = wheel.style.height = N / dpr + 'px';
  const img = wctx.createImageData(N, N, P3 ? { colorSpace: 'display-p3' } : undefined);
  const d = img.data;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const c = at(x, y);
    if (!c) continue;
    const v = P3 ? c : toSRGB(c), o = (y * N + x) * 4;
    d[o] = Math.round(v[0] * 255); d[o + 1] = Math.round(v[1] * 255); d[o + 2] = Math.round(v[2] * 255); d[o + 3] = Math.round(c[3] * 255);
  }
  wctx.putImageData(img, 0, 0);
  data = d;
}

// What the screen shows at a device pixel of the wheel's canvas: the wheel over the page's own background.
function pixel(x, y) {
  const b = bg();
  if (x < 0 || y < 0 || x >= N || y >= N) return [b, b, b];
  // In the canvas's own space: Display P3, or sRGB in the fallback (where the values are already final).
  const o = (y * N + x) * 4, a = data[o + 3] / 255;
  return [data[o], data[o + 1], data[o + 2]].map((n) => (n / 255) * a + b * (1 - a));
}
const css = (c) => (P3 ? `color(display-p3 ${c[0]} ${c[1]} ${c[2]})` : `rgb(${c.map((n) => Math.round(n * 255)).join(' ')})`);
const srgbOf = (c) => (P3 ? toSRGB(c) : c);
const lum = (c) => { const s = srgbOf(c); return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2]; };
const hex = (c) => '#' + srgbOf(c).map((n) => Math.round(n * 255).toString(16).padStart(2, '0')).join('').toUpperCase();

// The loupe, in points. Its shadow is as dark at the edge as measured and gone about 10 pt out.
const D = 121, RING = 13, LINE = 3, PITCH = 10.5, PAD = 14;
function paint(cx, cy) {
  const size = D + PAD * 2, s = dpr;
  if (loupe.width !== Math.round(size * s)) {
    loupe.width = loupe.height = Math.round(size * s);
    loupe.style.width = loupe.style.height = size + 'px';
  }
  const g = lctx, o = size / 2, mid = pixel(cx, cy), light = lum(mid);
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, loupe.width, loupe.height); g.setTransform(s, 0, 0, s, 0, 0);
  g.save();
  g.shadowColor = 'rgba(0,0,0,.56)'; g.shadowBlur = 8 * s;
  g.fillStyle = css(mid); g.beginPath(); g.arc(o, o, D / 2, 0, Math.PI * 2); g.fill();
  g.restore();
  g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 1; g.beginPath(); g.arc(o, o, D / 2 + 0.5, 0, Math.PI * 2); g.stroke();
  g.fillStyle = light > 0.75 ? '#999' : '#fff'; g.beginPath(); g.arc(o, o, D / 2 - RING, 0, Math.PI * 2); g.fill();
  g.save(); g.beginPath(); g.arc(o, o, D / 2 - RING - LINE, 0, Math.PI * 2); g.clip();
  const n = 5;
  for (let j = -n; j <= n; j++) for (let i = -n; i <= n; i++) {
    const c = pixel(cx + i, cy + j), x = o - PITCH / 2 + i * PITCH, y = o - PITCH / 2 + j * PITCH;
    g.fillStyle = css(c); g.fillRect(x, y, PITCH, PITCH);
  }
  // Grid lines on the cell edges, 1 pt: half-white on dark cells, faint black on light ones.
  for (let j = -n; j <= n; j++) for (let i = -n; i <= n; i++) {
    const c = pixel(cx + i, cy + j), x = o - PITCH / 2 + i * PITCH, y = o - PITCH / 2 + j * PITCH;
    g.strokeStyle = lum(c) > 0.6 ? 'rgba(0,0,0,.22)' : 'rgba(255,255,255,.57)'; g.lineWidth = 1;
    g.strokeRect(x, y, PITCH, PITCH);
  }
  g.restore();
  g.strokeStyle = light > 0.6 ? '#000' : '#fff'; g.lineWidth = 3;
  g.beginPath(); g.roundRect(o - PITCH / 2, o - PITCH / 2, PITCH, PITCH, 1.5); g.stroke();
}

let shown = false, last = null, resting = 0, pointer = null, picked = null;
const AGAIN = 1200;
function hide() { loupe.style.display = 'none'; shown = false; wheel.style.cursor = ''; }
// Where the pointer is, in the wheel's device pixels, and whether that is on the wheel itself.
function locate(clientX, clientY) {
  const r = wheel.getBoundingClientRect(), x = Math.floor((clientX - r.left) * dpr), y = Math.floor((clientY - r.top) * dpr);
  const c = (N - 1) / 2, on = Math.hypot(x - c, y - c) <= N / 2;
  return { x, y, on };
}
function show(clientX, clientY, above) {
  const p = locate(clientX, clientY);
  last = p;
  if (!p.on) { hide(); return p; }
  paint(p.x, p.y);
  const half = (D + PAD * 2) / 2;
  // Under a finger the loupe sits above it, as iOS's own magnifier does; under a mouse it is centred on the pointer.
  loupe.style.transform = `translate(${clientX - half}px, ${clientY - half - (above ? D / 2 + 28 : 0)}px)`;
  loupe.style.display = 'block'; shown = true;
  wheel.style.cursor = 'none';
  return p;
}
async function copy(p) {
  if (!p || !p.on) return;
  const text = hex(pixel(p.x, p.y));
  try { await navigator.clipboard.writeText(text); } catch {}
}

// Mouse and pen. While the loupe rests after a press, the pointer is only followed, not shown.
wheel.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'touch') return;
  pointer = [e.clientX, e.clientY];
  if (!resting) show(e.clientX, e.clientY, false);
});
wheel.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') { pointer = null; hide(); } });
// The press is the pick, as in the system's sampler: the loupe goes at once and the pixel under it is the one copied.
wheel.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'touch' || e.button !== 0 || !shown) return;
  picked = locate(e.clientX, e.clientY);
  hide();
  clearTimeout(resting);
  resting = setTimeout(() => { resting = 0; if (pointer) show(pointer[0], pointer[1], false); }, AGAIN);
});
// Safari's click carries no pointer type, so a click soon after a touch is taken as the finger's and ignored: on a
// touch screen only a held finger copies. The clipboard is written on the click, where every browser allows it.
wheel.addEventListener('click', (e) => {
  if (e.pointerType === 'touch' || touching || Date.now() - touched <= 1000) return;
  // A click while the loupe is away picks nothing, as there is no sampler open in the app then.
  if (resting && !picked) return;
  copy(picked || locate(e.clientX, e.clientY)); picked = null;
});

// Touch: hold still for 300 ms (iOS's own long-press time) and the loupe comes up; until then the page scrolls as usual.
let timer = 0, touching = false, start = null, touched = 0;
wheel.addEventListener('touchstart', (e) => {
  if (e.touches.length !== 1) return;
  const t = e.touches[0]; start = [t.clientX, t.clientY]; touched = Date.now();
  clearTimeout(timer);
  timer = setTimeout(() => { touching = true; show(start[0], start[1], true); }, 300);
}, { passive: true });
wheel.addEventListener('touchmove', (e) => {
  const t = e.touches[0];
  if (touching) { e.preventDefault(); show(t.clientX, t.clientY, true); return; }
  if (start && Math.hypot(t.clientX - start[0], t.clientY - start[1]) > 8) clearTimeout(timer);
}, { passive: false });
wheel.addEventListener('touchend', (e) => {
  clearTimeout(timer);
  if (touching) { e.preventDefault(); copy(last); hide(); setTimeout(() => (touching = false), 400); }
}, { passive: false });
wheel.addEventListener('touchcancel', () => { clearTimeout(timer); touching = false; hide(); });
wheel.addEventListener('contextmenu', (e) => e.preventDefault());

let size = 0;
function resized() {
  // Not before wheel.css applies: Safari ran this with the box still the page's full width and no square shape, and
  // the first frame showed a slice of a huge wheel on the right before the real one (his review 2026-11-11, 0:07).
  if (getComputedStyle(box).aspectRatio.replace(/\s/g, '') !== '1/1') return;
  const w = box.getBoundingClientRect().width;
  if (w !== size || (window.devicePixelRatio || 1) !== dpr) { size = w; draw(); }
}
// The box's own size is watched, not the window's: Safari can run this before the stylesheet applies, when the box
// is still the whole page wide, and the column that follows fires no window resize.
// Drawn on the next frame: resizing the canvas inside the observer's own callback made WebKit report
// «ResizeObserver loop completed with undelivered notifications» (2026-11-10, live site).
new ResizeObserver(() => requestAnimationFrame(resized)).observe(box);
addEventListener('resize', resized);
addEventListener('load', resized);
dark.addEventListener('change', () => { if (shown && last) paint(last.x, last.y); });
resized();
