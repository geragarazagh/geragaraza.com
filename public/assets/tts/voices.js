// TTS's voices without typing anything: the app's own voice choice and speed, a sample from its own set.
//
// The voice choice is the app's since 2026-11-10 (dev/tts.md, «Next»; his words on 0.1: a pick sounded late, broke off,
// and nothing showed the state or how to stop it). The button with the chosen voice opens the list: Male, Voice 1-5,
// Female, Voice 6-10 (Supertone's M1-M5, F1-F5, in their order). A name only chooses the voice (the tick moves, no
// sound). The waveform button on the right of each row only listens: pressed, the voice's sample plays at once and the
// button turns blue and moves; pressed again, another voice's button, Esc, a click outside the list or closing it stops
// the sound. A sample plays to its end once and stops. As in the app, one fixed passage per language (PASSAGE).
//
// The speed is the app's: 0.70 to 2.00 in steps of 0.05, 1.05 standard. Like the app, the voice itself is made only at
// speeds the model speaks well (measured: 0.95 to 1.25) and the rest is time-stretch with the pitch kept: the page has
// the passages made at 1.05 and 1.25 (samples.json) and plays the one made at the highest speed not above the chosen
// one, stretched to it. Moving the slider changes a sample that is already playing.

const lang = ['en', 'uk', 'ru'].includes(document.documentElement.lang) ? document.documentElement.lang : 'en';
// The passage each language's samples read (index into samples.json, which holds the app's two passages per language):
// ru Bulgakov's Woland (the one in the mockup he approved), uk Kotliarevsky's «Енеїда», en Shakespeare.
const PASSAGE = { ru: 1, uk: 0, en: 0 };
const pick = document.querySelector('#voices .pick'), pop = document.getElementById('voice'), list = document.getElementById('voice-list');
const shownName = document.getElementById('voice-name');
const speed = document.getElementById('speed'), shown = document.getElementById('speed-value');
let table = null, audio = null, playing = null;
fetch('/assets/tts/samples.json').then((r) => r.json()).then((d) => (table = d));

// The decimal sign of the page's language: 1.05 in English, 1,05 in Ukrainian and Russian, as the app writes it.
const fmt = new Intl.NumberFormat(lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function rate() {
  shown.textContent = fmt.format(+speed.value);
  if (audio) { audio.preservesPitch = audio.webkitPreservesPitch = true; audio.playbackRate = +speed.value / audio.base; }
}

function mark(li, on) {
  const b = li.querySelector('.lb');
  b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
}
function stop() {
  if (audio) { audio.pause(); audio.removeAttribute('src'); audio.load(); audio = null; }
  if (playing) { mark(playing, false); playing = null; }
}
function listen(li) {
  if (playing === li) { stop(); return; }
  stop();
  const made = table && table[lang] && table[lang][li.dataset.v];
  if (!made) return;
  const bases = Object.keys(made).map(Number).sort((a, b) => a - b), s = +speed.value;
  const base = bases.filter((b) => b <= s + 1e-9).pop() ?? bases[0], files = made[base.toFixed(2)];
  const a = new Audio(files[Math.min(PASSAGE[lang], files.length - 1)]);
  a.base = base; audio = a; playing = li; mark(li, true); rate();
  a.addEventListener('ended', () => { if (audio === a) stop(); });
  a.play().catch(() => { if (audio === a) stop(); });
}
function choose(li) {
  for (const b of list.querySelectorAll('.name')) { const on = b.parentNode === li; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); }
  shownName.textContent = li.querySelector('.name span:last-child').textContent;
}

function openList(open) {
  list.hidden = !open; pop.setAttribute('aria-expanded', open);
  if (!open) stop();
}
pop.addEventListener('click', () => openList(list.hidden));
list.addEventListener('click', (e) => {
  const li = e.target.closest('li'); if (!li) return;
  if (e.target.closest('.lb')) listen(li); else if (e.target.closest('.name')) choose(li);
});
// A press anywhere outside the button and its list closes the list, as a click outside a menu does on the Mac.
document.addEventListener('pointerdown', (e) => { if (!list.hidden && !pick.contains(e.target)) openList(false); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && (!list.hidden || audio)) { openList(false); pop.focus(); } });
speed.addEventListener('input', rate);
rate();
