// The app's draw() on a canvas, over the whole page: same fractions, same order, same colours,
// one device pixel per line on a pixel boundary, a half-transparent black pixel beside each so it
// reads on white, capsules with the line's position in points. Clicks pass through.
const canvas = document.getElementById('grid'), ctx = canvas.getContext('2d'), root = document.documentElement;
const phi = (Math.sqrt(5) - 1) / 2;
const SETS = {
  red: [0.5], orange: [0.25, 0.75], yellow: [1 - phi, phi], green: [1 / 3, 2 / 3],
};
const MODES = {
  all: ['red', 'orange', 'yellow', 'green'], halves: ['red', 'orange'], golden: ['red', 'yellow'], thirds: ['red', 'green'], fine: ['red'],
};
let mode = 'halves', on = true;

// The grid is laid out once for the screen and stays: a phone's zoom and its collapsing toolbar change
// nothing here. Height is the large viewport (100lvh): with viewport-fit=cover that is the whole screen of a
// phone, status bar and toolbar area included, and it stays put while the toolbar collapses, as the app's grid
// covers the whole display of a Mac. Only a real change of layout, such as turning the phone, redraws.
const probe = document.createElement('div');
probe.style.cssText = 'position:fixed;top:0;visibility:hidden;width:0;height:100vh;height:100lvh';
document.body.append(probe);
const size = () => [root.clientWidth, probe.getBoundingClientRect().height];
let drawn = '';
function resized() { if (size().join() !== drawn) draw(); }

function draw() {
  const [W, H] = size(), s = window.devicePixelRatio || 1;
  drawn = [W, H].join();
  canvas.width = Math.round(W * s); canvas.height = Math.round(H * s);
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!on) return;
  const style = getComputedStyle(root), color = (n) => style.getPropertyValue('--' + n).trim();
  const DW = canvas.width, DH = canvas.height;
  const rect = (x, y, w, h, c, a = 1) => { ctx.globalAlpha = a; ctx.fillStyle = c; ctx.fillRect(x, y, w, h); ctx.globalAlpha = 1; };

  if (mode === 'all' || mode === 'fine') {
    const blue = color('blue');
    for (let v = 8; v < W; v += 8) rect(Math.round(v * s), 0, 1, DH, blue, v % 32 ? 0.2 : 0.45);
    for (let v = 8; v < H; v += 8) rect(0, Math.round(v * s), DW, 1, blue, v % 32 ? 0.2 : 0.45);
  }
  const badges = [];
  for (const name of MODES[mode]) for (const f of SETS[name]) {
    const c = color(name), x = Math.round(W * f * s), y = Math.round(H * f * s);
    rect(x + 1, 0, 1, DH, '#000', 0.5); rect(x, 0, 1, DH, c);
    rect(0, y + 1, DW, 1, '#000', 0.5); rect(0, y, DW, 1, c);
    badges.push({ t: label(x / s), c, x: x / s, vertical: true }, { t: label(y / s), c, y: y / s, vertical: false });
  }
  // Capsules go on top of every line. On a narrow screen neighbours would overlap, so a capsule
  // steps away from the edge until it is clear.
  ctx.setTransform(s, 0, 0, s, 0, 0);
  ctx.font = '600 10px Inter, sans-serif';
  ctx.textBaseline = 'middle';
  const placed = [], h = 14;
  for (const b of badges) {
    const w = ctx.measureText(b.t).width + 8;
    const r = b.vertical ? { x: b.x - w / 2, y: H - 3 - h, w, h } : { x: W - 3 - w, y: b.y - h / 2, w, h };
    while (placed.some((p) => r.x < p.x + p.w && p.x < r.x + r.w && r.y < p.y + p.h && p.y < r.y + r.h)) {
      if (b.vertical) r.y -= h + 1; else r.x -= w + 1;
    }
    placed.push(r);
    ctx.fillStyle = b.c;
    ctx.beginPath(); ctx.roundRect(r.x, r.y, r.w, r.h, h / 2); ctx.fill();
    ctx.fillStyle = luminance(b.c) > 0.5 ? '#000' : '#fff';
    ctx.fillText(b.t, r.x + 4, r.y + h / 2 + 0.5);
  }
}

const label = (v) => (Number.isInteger(v) ? String(v) : v.toFixed(1));
function luminance(hex) {
  const n = parseInt(hex.slice(1), 16);
  return (0.2126 * (n >> 16 & 255) + 0.7152 * (n >> 8 & 255) + 0.0722 * (n & 255)) / 255;
}

// The menu is the system's own list: a <select>, drawn by the phone or computer it opens on. A native
// list can't report a pick of the item already ticked, so hiding gets its own last item, where the
// app's menu has Quit Grids.
const menu = document.getElementById('modes');
function sync() {
  on = menu.value !== 'off';
  if (on) mode = menu.value;
  draw();
}
menu.addEventListener('change', sync);

// Safari can run this before the stylesheet's colours are readable, so draw again once the page has loaded.
addEventListener('load', draw);
addEventListener('pageshow', sync);
addEventListener('resize', resized);
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', draw);
document.fonts.load('600 10px Inter').then(draw);
draw();
