// STT on its own page: a Mac's screen in small and STT's shortcut under it, Option-Command-Space.
//
// What STT does (dev card stt.md, «Keys» and «Output»): a short press of the shortcut starts recording, the next press
// stops it, recording runs 0.3 s past the stop so the last word isn't cut, then the whole text is pasted at once where
// the cursor is: no live text, no sound, no window; the only sign is macOS's orange microphone dot in the menu bar.
// Here a press of the keys starts it and the dot comes on; the voice is one of his nine recorded phrases in the page's
// language, in turn (phrases.json, made by tools/sttphrases.py). When it ends the keys are pressed again by themselves,
// as the speaker would; after the 0.3 s tail the dot goes out, 0.7 s of recognising pass, and the text lands at the
// cursor at once, after a space if it would touch a word. A press while a phrase runs changes nothing: the speaker is
// still talking. The menu bar clock is the visitor's own time, written as macOS writes it.

const box = document.getElementById('stt'), keys = box.querySelector('.keys'), doc = box.querySelector('.doc');
const txt = doc.querySelector('.txt'), caret = doc.querySelector('.caret'), dot = box.querySelector('.dot'), clock = box.querySelector('.clock');
const lang = ['en', 'uk', 'ru'].includes(document.documentElement.lang) ? document.documentElement.lang : 'en';
const TAIL = 300, THINK = 700;
let data = null, next = 0, busy = false;
fetch('/assets/stt/phrases.json').then((r) => r.json()).then((d) => { data = d; next = Math.floor(Math.random() * (d[lang] || []).length); });

// The clock: weekday, day, month and time, without commas, the weekday with a capital, as in macOS's menu bar. The
// visitor's own locale when it is the page's language (so en-US gets «Wed Nov 11 6:05 AM», en-GB «Wed 11 Nov 6:05»).
const loc = (navigator.language || '').toLowerCase().startsWith(lang) ? navigator.language : { en: 'en-US', ru: 'ru-RU', uk: 'uk-UA' }[lang];
function tick() {
  const d = new Date(), day = d.toLocaleDateString(loc, { weekday: 'short', day: 'numeric', month: 'short' }).replace(/,/g, '');
  clock.textContent = day[0].toUpperCase() + day.slice(1) + ' ' + d.toLocaleTimeString(loc, { hour: 'numeric', minute: '2-digit' });
  setTimeout(tick, 60000 - (Date.now() % 60000) + 50);
}
tick();

function tap() { keys.classList.add('down'); setTimeout(() => keys.classList.remove('down'), 140); }
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
function paste(t) {
  const v = txt.textContent;
  txt.textContent = v + (v && !/\s$/.test(v) ? ' ' : '') + t;
  doc.scrollTop = doc.scrollHeight;
}

keys.addEventListener('click', async () => {
  tap();
  const list = data && data[lang];
  if (busy || !list || !list.length) return;
  busy = true;
  const p = list[next % list.length]; next++;
  const audio = new Audio(p.a);
  caret.classList.add('still');
  dot.classList.add('on');
  try {
    await audio.play();
    // A recording that breaks off (the network) ends the run with no text, rather than leaving the keys busy.
    await new Promise((r, no) => { audio.addEventListener('ended', r, { once: true }); audio.addEventListener('error', no, { once: true }); });
    tap();
    await wait(TAIL);
    dot.classList.remove('on');
    await wait(THINK);
    paste(p.t);
  } catch (e) {
    dot.classList.remove('on');
  }
  caret.classList.remove('still');
  busy = false;
});
