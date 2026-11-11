// STT on its own page: a text with a cursor, and STT's shortcut under it, Option-Command-Space.
//
// What STT does (dev card stt.md, «Keys» and «Output»): a short press of the shortcut starts recording, the next press
// stops it, recording runs 0.3 s past the stop so the last word isn't cut, then the whole text is pasted at once where
// the cursor is: no live text, no sound, no window; the only sign is macOS's orange microphone dot in the menu bar.
// Here a press of the keys starts it; the voice is one of his nine recorded phrases in the page's
// language, in turn (phrases.json, made by tools/sttphrases.py). When it ends the keys are pressed again by themselves,
// as the speaker would; the 0.3 s tail and 0.7 s of recognising pass, and the text lands at the
// cursor at once, after a space if it would touch a word. A press while a phrase runs changes nothing: the speaker is
// still talking.

const box = document.getElementById('stt'), keys = box.querySelector('.keys'), doc = box.querySelector('.doc');
const txt = doc.querySelector('.txt'), caret = doc.querySelector('.caret');
const lang = ['en', 'uk', 'ru'].includes(document.documentElement.lang) ? document.documentElement.lang : 'en';
const TAIL = 300, THINK = 700;
let data = null, next = 0, busy = false;
fetch('/assets/stt/phrases.json').then((r) => r.json()).then((d) => { data = d; next = Math.floor(Math.random() * (d[lang] || []).length); });

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
  try {
    await audio.play();
    // A recording that breaks off (the network) ends the run with no text, rather than leaving the keys busy.
    await new Promise((r, no) => { audio.addEventListener('ended', r, { once: true }); audio.addEventListener('error', no, { once: true }); });
    tap();
    await wait(TAIL + THINK);
    paste(p.t);
  } catch (e) { /* no text */ }
  caret.classList.remove('still');
  busy = false;
});
