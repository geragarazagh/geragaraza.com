// HoldQ on its own page: the film in a player and HoldQ's sign over it, playing by itself.
//
// «Le Voyage dans la Lune» (Méliès, 1902; public domain), the film of HoldQ's README picture: 16 s of the rocket flying to
// the Moon's eye, looped, no sound. Over it, on its own and over and over, what HoldQ does with ⌘Q (main.swift): first a
// short press, the sign with the app's icon, the ring and «Hold ⌘Q to quit QuickTime Player» (HoldQ's own strings in the
// page's language), let go at 0.45 s: the ring stays where it was and the sign fades in 0.3 s, ease-in; the film goes on.
// Then a hold: the ring fills clockwise in exactly one second, the player quits, its window gone at once as a quitting
// app's windows are, the sign fades in 0.15 s, ease-out; two seconds later the player is back, the film still running.
// Nothing on the page asks for a key press (his decision 2026-11-11): drawn keys to hold made people press the real ⌘Q,
// and without HoldQ that quits the browser at once. The cycle starts when the block comes into view and stops outside it.

const box = document.getElementById('hold'), video = box.querySelector('video');
const lang = ['en', 'uk', 'ru'].includes(document.documentElement.lang) ? document.documentElement.lang : 'en';
const LINE = { en: 'Hold ⌘Q to quit %@', ru: 'Удерживать ⌘Q, чтобы завершить %@', uk: 'Утримувати ⌘Q, щоб завершити %@' };
const HOLD = 1000, SHORT = 450, C = 2 * Math.PI * 42;
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

function ring(p) { fill.style.strokeDashoffset = C * (1 - p); fill.style.visibility = p > 0 ? 'visible' : 'hidden'; }
function fade(ms, ease) { hud.style.transition = `opacity ${ms}ms ${ease}`; hud.style.opacity = 0; }

// One press of ⌘Q held for `ms`: the sign up at once, the ring counting from the press; resolves at the release or the quit.
function hold(ms) {
  return new Promise((done) => {
    const start = performance.now();
    ring(0); hud.style.transition = 'none'; hud.style.opacity = 1;
    const tick = () => {
      if (!on) { fade(0, 'linear'); done(); return; }
      const t = performance.now() - start, p = Math.min(t / HOLD, 1);
      if (p >= 1) { ring(1); fade(150, 'ease-out'); video.classList.remove('back'); video.classList.add('gone'); done(); return; }
      if (t >= ms) { ring(Math.min(p + 1 / 60, 0.99)); fade(300, 'ease-in'); done(); return; }
      ring(p); requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// The cycle: 2.5 s of film, a short press, 2.5 s, a full hold, 2 s with the player quit, back, 3 s of film, again.
let on = false, running = false;
async function cycle() {
  if (running) return;
  running = true;
  while (on) {
    await wait(2500); if (!on) break;
    await hold(SHORT);
    await wait(2500); if (!on) break;
    await hold(HOLD + 50);
    await wait(2000);
    video.classList.remove('gone'); video.classList.add('back');
    await wait(3000);
  }
  video.classList.remove('gone');
  running = false;
}
new IntersectionObserver(([e]) => { on = e.isIntersecting; if (on) cycle(); }, { threshold: 0.6 }).observe(box);

// The film is started here by play(), not by the autoplay attribute (2026-11-11). Safari puts an autoplay video it judges
// invisible into an «invisible autoplay» interruption and lifts it only when the video's own visibility changes. Safari 27.2
// started cold and sent straight to this page left the film standing on its first frame, in view, loaded and with the page
// visible, until the player's first quit and return toggled that visibility; a Safari already running played at once.
// play() is ordinary muted playback, which Safari allows without a click and never holds back, and in that stuck state it
// started the film at once. Out of view the film pauses, as autoplay did. Where autoplay is refused (Low Power Mode, a
// site setting) play() fails quietly and the still frame stays.
new IntersectionObserver(([e]) => { if (e.isIntersecting) video.play().catch(() => {}); else video.pause(); }).observe(video);
