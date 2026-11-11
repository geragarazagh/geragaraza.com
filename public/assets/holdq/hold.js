// HoldQ on its own page (his pick 2026-11-11): hold ⌘Q, and the app in front quits only after a second.
//
// The app in front is a player showing «Le Voyage dans la Lune» (Méliès, 1902; public domain), the film of HoldQ's
// README picture: 16 s of the rocket flying to the Moon's eye, looped, no sound. Holding the keys under it (mouse,
// finger, or Space / Return on the focused keys) does what HoldQ does with ⌘Q (main.swift): the sign comes up at
// once with the app's icon, a ring that fills clockwise in exactly one second, and the line «Hold ⌘Q to quit
// QuickTime Player» in the page's language, HoldQ's own strings. Let go before the second: nothing quits, the ring
// stays where it was (one frame further, never full) and the sign fades in 0.3 s, ease-in. Held the whole second: the
// ring is full, the player quits, its window gone at once as a quitting app's windows are, and the sign fades in
// 0.15 s, ease-out. The player opens again two seconds later, from the start, so it can be tried again.

const box = document.getElementById('hold'), keys = box.querySelector('.keys'), video = box.querySelector('video');
const lang = ['en', 'uk', 'ru'].includes(document.documentElement.lang) ? document.documentElement.lang : 'en';
const LINE = { en: 'Hold ⌘Q to quit %@', ru: 'Удерживать ⌘Q, чтобы завершить %@', uk: 'Утримувати ⌘Q, щоб завершити %@' };
const HOLD = 1000, C = 2 * Math.PI * 42;
const dark = matchMedia('(prefers-color-scheme: dark)');
const icon = () => `/assets/holdq/quicktime${dark.matches ? '-dark' : ''}.png`;

const hud = document.createElement('div');
hud.className = 'hud';
hud.setAttribute('aria-hidden', 'true');
hud.innerHTML = `<div class="ring"><svg viewBox="0 0 88 88"><circle class="track" cx="44" cy="44" r="42"/><circle class="fill" cx="44" cy="44" r="42" stroke-dasharray="${C} ${C}"/></svg><img alt="" width="64" height="64"></div><p></p>`;
box.querySelector('.scene').append(hud);
const fill = hud.querySelector('.fill'), img = hud.querySelector('img');
hud.querySelector('p').textContent = LINE[lang].replace('%@', 'QuickTime Player');
img.src = icon();
dark.addEventListener('change', () => { img.src = icon(); });

let start = 0, raf = 0, gone = false, held = false;
function ring(p) { fill.style.strokeDashoffset = C * (1 - p); fill.style.visibility = p > 0 ? 'visible' : 'hidden'; }
function fade(ms, ease) { hud.style.transition = `opacity ${ms}ms ${ease}`; hud.style.opacity = 0; }
function tick() {
  const p = Math.min((performance.now() - start) / HOLD, 1);
  ring(p);
  if (p >= 1) { quit(); return; }
  raf = requestAnimationFrame(tick);
}
function press() {
  if (held) return;
  held = true; keys.classList.add('down');
  if (gone) return;
  start = performance.now(); ring(0);
  hud.style.transition = 'none'; hud.style.opacity = 1;
  raf = requestAnimationFrame(tick);
}
function release() {
  if (!held) return;
  held = false; keys.classList.remove('down');
  if (!raf) return;
  cancelAnimationFrame(raf); raf = 0;
  ring(Math.min((performance.now() - start) / HOLD + 1 / 60, 0.99));
  fade(300, 'ease-in');
}
function quit() {
  raf = 0; gone = true; ring(1); fade(150, 'ease-out');
  video.pause(); video.classList.remove('back'); video.classList.add('gone');
  setTimeout(() => {
    gone = false;
    video.currentTime = 0; video.classList.remove('gone'); video.classList.add('back'); video.play().catch(() => {});
  }, 2000);
}

// A finger: touch-action none and no callout (hold.css) keep the browser from taking the hold for a scroll or a menu.
keys.addEventListener('pointerdown', (e) => { if (e.button) return; keys.setPointerCapture(e.pointerId); press(); });
keys.addEventListener('pointerup', release);
keys.addEventListener('pointercancel', release);
keys.addEventListener('lostpointercapture', release);
keys.addEventListener('contextmenu', (e) => e.preventDefault());
keys.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); press(); } });
keys.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); release(); } });
keys.addEventListener('click', (e) => e.preventDefault());
addEventListener('blur', release);
