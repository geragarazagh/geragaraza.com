// TTS's voices without typing anything: the app's own voice choice and speed, each sample spoken by the voice itself.
//
// As in the app (0.3, 2026-11-10): the button with the chosen voice opens a list of voices, here of every language the
// page had until 2026-11-15, each under its language's name as System Settings groups them (his word 2026-11-15 ~09:17,
// when the site went English only: the Russian and Ukrainian voices stay beside the English ones). Per language the best
// male and the best female voice macOS has, in Apple's English names: English Siri Voice 1 and Voice 2 (Aaron and
// Simone, the clearest of the seven US Siri voices), Russian Siri Voice 1 and Voice 2, Ukrainian Lesya alone (Siri has
// no Ukrainian, macOS no male Ukrainian voice). The voice chosen at first is the first female voice of the visitor's own
// language (navigator.languages; English for any other), as each language's page showed its own until then. A name only chooses the voice (the tick moves, no sound). The waveform button on the
// right of each row only listens: pressed, the voice's sample plays at once and the button turns blue and moves; pressed
// again, another voice's button, Esc, a click outside the list or closing it stops the sound. A sample plays to its end
// once and stops. The passage is the app's (Bulgakov's Woland, Kotliarevsky's «Енеїда», Shakespeare's seven ages).
//
// The speed is the app's: 0.6 to 3.5 in steps of 0.1, 1.0 standard (the Mac's normal rate). The app has the voice speak
// anew at the new speed, never stretched, so the page has every passage spoken at every step (samples.json), made on the
// author's Mac through the app's own pipeline (bench/siteclips). A new speed stops a sample, as in the app.

const LANGS = [['en', 'English'], ['ru', 'Russian'], ['uk', 'Ukrainian']];
const pick = document.querySelector('#voices .pick'), pop = document.getElementById('voice'), list = document.getElementById('voice-list');
const shownName = document.getElementById('voice-name');
const speed = document.getElementById('speed'), shown = document.getElementById('speed-value');
const WAVE = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="5" width="2" height="6" rx="1"/><rect x="5.5" y="2" width="2" height="12" rx="1"/>' +
  '<rect x="9.5" y="4" width="2" height="8" rx="1"/><rect x="13" y="6" width="2" height="4" rx="1"/></svg>';
const TICK = '<svg viewBox="0 0 100 100" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"><path d="M10 52l26 26 54-56"/></svg>';
const LISTEN = 'Listen';
let table = null, audio = null, playing = null, chosen = null;

// The decimal sign as the app writes it in English: 1.0×.
const fmt = new Intl.NumberFormat('en', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
function showSpeed() { shown.textContent = fmt.format(+speed.value) + '×'; }

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
  const a = new Audio(`/assets/tts/${li.dataset.v}-${(+speed.value).toFixed(1)}.m4a`);
  audio = a; playing = li; mark(li, true);
  a.addEventListener('ended', () => { if (audio === a) stop(); });
  a.play().catch(() => { if (audio === a) stop(); });
}
function choose(li) {
  chosen = li;
  for (const b of list.querySelectorAll('.name')) { const on = b.parentNode === li; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); }
  shownName.textContent = li.dataset.name;
}

// The rows: every language's voices from samples.json, each group under its name; data-v is the clip's prefix
// (en-v1, ru-v2, uk-lesya). The first female voice of the visitor's language is chosen, as the app does for a text.
fetch('/assets/tts/samples.json').then((r) => r.json()).then((d) => {
  table = d;
  const mine = (navigator.languages || [navigator.language]).map((l) => String(l).split('-')[0].toLowerCase()).find((l) => d.voices[l]) || 'en';
  let first = null;
  for (const [code, title] of LANGS) {
    const hdr = document.createElement('p'); hdr.className = 'hdr'; hdr.textContent = title;
    const ul = document.createElement('ul'); list.append(hdr, ul);
    for (const v of d.voices[code]) {
      const li = document.createElement('li');
      li.dataset.v = `${code}-${v.v}`; li.dataset.name = v.name;
      li.innerHTML = `<button class="name" type="button" aria-pressed="false"><span class="tick">${TICK}</span><span></span></button>` +
        `<button class="lb" type="button" aria-pressed="false">${WAVE}<span class="vh">${LISTEN}</span></button>`;
      li.querySelector('.name span:last-child').textContent = v.name;
      li.querySelector('.lb .vh').textContent = `${LISTEN}: ${v.name}, ${title}`;
      ul.appendChild(li);
      if (code === mine && !first && v.gender === 2) first = li;
    }
  }
  choose(first || list.querySelector('li'));
});

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
speed.addEventListener('input', () => { showSpeed(); stop(); });
showSpeed();
