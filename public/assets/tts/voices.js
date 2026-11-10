// TTS's voices without typing anything: the app's own controls, a sample from its own set.
//
// The list is the app's voice menu: Male, Voice 1-5, Female, Voice 6-10 (Supertone's M1-M5, F1-F5, in their order).
// As in the app, picking a voice plays it, and picking the same voice again plays it again: one of the app's two
// sample passages in the page's language, at random, never the same twice in a row. The speed is the app's: 0.70 to
// 2.00 in steps of 0.05, 1.05 standard. Like the app, the voice itself is made only at speeds the model speaks well
// (measured by night-tts: 0.95 to 1.25) and the rest is time-stretch with the pitch kept: the page has the passages
// made at 1.05 and 1.25 (samples.json) and plays the one made at the highest speed not above the chosen one,
// stretched to it. Moving the slider changes a passage that is already playing.

const lang = ['en', 'uk', 'ru'].includes(document.documentElement.lang) ? document.documentElement.lang : 'en';
const voice = document.getElementById('voice');
const speed = document.getElementById('speed'), shown = document.getElementById('speed-value');
let table = null, audio = null, last = {}, held = null;
fetch('/assets/tts/samples.json').then((r) => r.json()).then((d) => (table = d));

// The decimal sign of the page's language: 1.05 in English, 1,05 in Ukrainian and Russian, as the app writes it.
const fmt = new Intl.NumberFormat(lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function rate() {
  shown.textContent = fmt.format(+speed.value);
  if (audio) { audio.preservesPitch = audio.webkitPreservesPitch = true; audio.playbackRate = +speed.value / audio.base; }
}
function stop() { if (audio) { audio.pause(); audio = null; } }

function sample() {
  stop();
  const made = table && table[lang] && table[lang][voice.value];
  if (!made) return;
  const bases = Object.keys(made).map(Number).sort((a, b) => a - b), s = +speed.value;
  const base = bases.filter((b) => b <= s + 1e-9).pop() ?? bases[0], list = made[base.toFixed(2)];
  let i = Math.floor(Math.random() * list.length);
  if (list.length > 1 && i === last[voice.value]) i = (i + 1) % list.length;
  last[voice.value] = i;
  const a = new Audio(list[i]);
  a.base = base; audio = a; rate();
  a.addEventListener('ended', () => { if (audio === a) audio = null; });
  a.play().catch(() => { if (audio === a) audio = null; });
}

// A browser's list reports only a change, never the same item picked again, so while it is open nothing is ticked:
// then any pick, the same voice included, is a change. Closed without a pick, the list gets its voice back.
function open() { if (voice.selectedIndex !== -1) { held = voice.value; voice.selectedIndex = -1; } }
function restore() { if (voice.selectedIndex === -1 && held) voice.value = held; }
// Only a pointer or a finger opens it this way; from the keyboard the arrows change the voice and play it as usual.
voice.addEventListener('pointerdown', open);
voice.addEventListener('touchstart', open, { passive: true });
voice.addEventListener('blur', restore);
voice.addEventListener('keydown', (e) => { if (e.key === 'Escape') restore(); });
voice.addEventListener('change', () => { held = voice.value; sample(); });
speed.addEventListener('input', rate);
rate();
