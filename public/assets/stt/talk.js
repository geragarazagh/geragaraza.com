// STT on its own page: a button, a voice, and the text dropped into a field the way STT drops it at the cursor.
//
// The button is STT's wave in the icon's own grammar: 11 bars, bar = gap, heights in whole bar widths, 18 at most,
// silence a small bar 3 widths tall. At rest it is the wave of «STT» from the icon. A tap plays a phrase (the next
// one in the page's language, phrases.json): the icon's bars step off to the left one per 75 ms and the voice's own
// loudness comes in from the right, one bar per 75 ms, the time «STT» takes to say per bar. When the voice ends,
// small bars run for 0.7 s, the moment STT spends recognising, then the whole text lands in the field at once (the
// app has no live text) and the icon's wave steps back in. A second tap while it plays stops it with no text.
// phrases.json and the recordings come from tools/sttphrases.py; nothing here changes when the recordings do.

const ICON = [12, 18, 10, 3, 9, 15, 8, 3, 9, 13, 7], TALL = 18, QUIET = 3, N = 11, PAUSE = 0.7;
const btn = document.getElementById('talk'), canvas = btn.querySelector('canvas'), ctx = canvas.getContext('2d');
const field = document.getElementById('field');
const lang = ['en', 'uk', 'ru'].includes(document.documentElement.lang) ? document.documentElement.lang : 'en';
let data = null, next = 0, run = null, unit = 0;
// L itself is a CSS expression; an empty block one L tall gives its value in pixels.
const probe = document.createElement('div');
probe.style.cssText = 'position:absolute;visibility:hidden;width:0;height:var(--l)';
document.body.append(probe);
fetch('/assets/stt/phrases.json').then((r) => r.json()).then((d) => { data = d; next = Math.floor(Math.random() * (d[lang] || []).length); });

// One bar width in CSS px: a ninth of L, so the tallest bar is 2 L; made a whole even number of device pixels so
// every bar and every half-step of centring sits on the pixel grid, as the icon's bars do.
function size() {
  const s = window.devicePixelRatio || 1, L = probe.getBoundingClientRect().height || 52;
  unit = Math.max(2, 2 * Math.round((L / 9) * s / 2)) / s;
  canvas.width = Math.round((N * 2 - 1) * unit * s); canvas.height = Math.round(TALL * unit * s);
  canvas.style.width = (N * 2 - 1) * unit + 'px'; canvas.style.height = TALL * unit + 'px';
}
function draw(cols) {
  const s = window.devicePixelRatio || 1, u = unit * s;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = getComputedStyle(btn).color;
  cols.forEach((h, i) => { ctx.beginPath(); ctx.roundRect(i * 2 * u, (TALL - h) / 2 * u, u, h * u, u / 2); ctx.fill(); });
}
const bar = (e) => Math.min(TALL, Math.max(QUIET, Math.round(e * TALL)));

// The strip of columns as time goes: the icon, the voice, the pause, the icon again. The window shows the last 11.
function frame() {
  if (!run) return;
  const { p, audio, t0 } = run, slice = data.slice;
  let cols;
  if (!run.ended) {
    const k = Math.floor(audio.currentTime / slice);
    cols = ICON.concat(p.e.slice(0, k + 1).map(bar));
  } else {
    const since = performance.now() / 1000 - run.ended, k = Math.floor(since / slice);
    const pause = Math.round(PAUSE / slice);
    if (since >= PAUSE && !run.typed) { run.typed = true; type(p.t); }
    cols = ICON.concat(p.e.map(bar), Array(Math.min(k, pause)).fill(QUIET), ICON.slice(0, Math.max(0, k - pause)));
    if (k - pause >= N) { run = null; draw(ICON); btn.removeAttribute('aria-pressed'); return; }
  }
  draw(cols.slice(-N));
  requestAnimationFrame(frame);
}

// The text goes where the field's cursor is, with a space if it would touch a word, as a paste from STT would.
function type(t) {
  const v = field.value, at = field.selectionEnd ?? v.length, before = v.slice(0, at);
  const text = (before && !/\s$/.test(before) ? ' ' : '') + t;
  field.setRangeText(text, at, at, 'end');
  field.dispatchEvent(new Event('input', { bubbles: true }));
}

btn.addEventListener('click', () => {
  if (run) { run.audio.pause(); run = null; draw(ICON); btn.removeAttribute('aria-pressed'); return; }
  const list = data && data[lang];
  if (!list || !list.length) return;
  const p = list[next % list.length]; next++;
  const audio = new Audio(p.a);
  run = { p, audio };
  btn.setAttribute('aria-pressed', 'true');
  audio.addEventListener('ended', () => { if (run && run.audio === audio) run.ended = performance.now() / 1000; });
  audio.play().then(() => requestAnimationFrame(frame)).catch(() => { run = null; draw(ICON); btn.removeAttribute('aria-pressed'); });
});

function redraw() { size(); if (!run) draw(ICON); }
// L is measured on a probe; Safari can run this before the stylesheet applies, so the probe's size is watched.
new ResizeObserver(redraw).observe(probe);
addEventListener('resize', redraw);
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (!run) draw(ICON); });
redraw();
