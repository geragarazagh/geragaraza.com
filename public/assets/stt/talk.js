// STT on its own page: a text with a cursor, and dictation landing in it the way STT lands it.
//
// What STT does (dev card stt.md, «Keys» and «Output»): a press of the shortcut starts recording, the next stops it,
// recording runs 0.3 s past the stop so the last word isn't cut, then the whole text is pasted at once where the cursor
// is: no live text, no sound, no window; the only sign is macOS's orange microphone dot. So here: the dot comes on, a
// phrase is spoken, the dot goes out after the 0.3 s tail, 0.7 s of recognising pass, and the phrase's text, the one
// STT itself typed for that recording, lands at the cursor at once and the cursor stands after it, as after a paste.
// The text is a real text: a click or a tap puts the cursor anywhere, it can be typed into and selected, and the next
// phrase lands where the cursor was left. Nothing asks for a real shortcut (dev/rules.md, section 5).
//
// The scene plays by itself while the block is in view, as HoldQ's does (his pick 2026-11-11, of three: this, a record
// button, his own voice); the voice is muted until the sound button is pressed (a browser plays no sound before a press).
// After the round of phrases the text is cleared and the round starts again, unless the visitor has touched the text:
// then it stays theirs. data-set: the phrases of each language (voices.json: ru Tolstoy 1908, en Nightingale 1890, uk
// his own three; files made by tools/sttphrases.py, text = what STT typed for the served file; dev/site.md).

const box = document.getElementById('stt'), doc = box.querySelector('.doc'), txt = box.querySelector('.txt');
const caret = box.querySelector('.caret'), dot = box.querySelector('.dot'), snd = box.querySelector('.snd');
const lang = ['en', 'uk', 'ru'].includes(document.documentElement.lang) ? document.documentElement.lang : 'en';
const TAIL = 300, THINK = 700;
const audio = new Audio(); audio.preload = 'auto';
let list = [], pos = 0, touched = false, typed = 0, sound = false, busy = false, inView = false, abort = false;
const HUSH = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// The cursor. While the text has focus the browser draws its own; without focus this one stands where the visitor left
// it (or where the last phrase ended), macOS's: 2 pt of the system accent blue, a line tall, blinking, still while
// something happens.
const node = () => { if (!txt.firstChild) txt.appendChild(document.createTextNode('')); return txt.firstChild; };
function place() {
  if (document.activeElement === txt) { caret.hidden = true; return; }
  const n = node(), v = n.data, d = doc.getBoundingClientRect(), r = document.createRange();
  let x, y, h;
  if (pos > 0 && v[pos - 1] !== '\n') { r.setStart(n, pos - 1); r.setEnd(n, pos); const q = [...r.getClientRects()].pop(); x = q.right; y = q.top; h = q.height; }
  else if (pos < v.length) { r.setStart(n, pos); r.setEnd(n, pos + 1); const q = r.getClientRects()[0]; x = q.left; y = q.top; h = q.height; }
  if (x === undefined) {
    const s = getComputedStyle(txt), lh = parseFloat(s.lineHeight), lines = v.slice(0, pos).split('\n').length - 1;
    x = d.left + parseFloat(s.paddingLeft); y = d.top + parseFloat(s.paddingTop) + lines * lh - doc.scrollTop; h = lh;
  }
  caret.style.transform = `translate(${x - d.left}px,${y - d.top + doc.scrollTop + h * .1}px)`;
  caret.style.height = h * .8 + 'px';
  caret.hidden = false;
}
// Where the browser's cursor is, counted in characters of the text.
function where() {
  const s = getSelection();
  if (!s.rangeCount || !txt.contains(s.focusNode)) return pos;
  const r = document.createRange(); r.selectNodeContents(txt); r.setEnd(s.focusNode, s.focusOffset);
  return r.toString().length;
}
document.addEventListener('selectionchange', () => { if (document.activeElement === txt) pos = where(); });
txt.addEventListener('focus', () => { touched = true; caret.hidden = true; });
txt.addEventListener('blur', () => { const v = txt.innerText.replace(/\n$/, ''); if (txt.textContent !== v) txt.textContent = v; pos = Math.min(pos, v.length); place(); });
txt.addEventListener('input', () => { touched = true; typed = performance.now(); });
new ResizeObserver(() => requestAnimationFrame(place)).observe(doc);
// The field is four lines tall, or as tall as the whole round of the page's phrases needs at this width, so none of
// the scene's own text ever scrolls out of sight (2026-11-11: Roosevelt's sentence took five lines on a 390 pt phone).
// Measured with an invisible copy of the text box holding the round; again whenever the block's width changes.
let fitWidth = 0;
function fit() {
  if (!list.length || box.clientWidth === fitWidth) return;
  fitWidth = box.clientWidth; doc.style.height = '';
  const probe = txt.cloneNode(false);
  probe.style.cssText = 'position:absolute;left:0;right:0;top:0;visibility:hidden;min-height:0';
  probe.textContent = list.map((p) => p.t).join(' ');
  doc.appendChild(probe);
  const need = probe.offsetHeight; probe.remove();
  if (need > doc.clientHeight) doc.style.height = need + doc.offsetHeight - doc.clientHeight + 'px';
}
new ResizeObserver(() => requestAnimationFrame(() => { fit(); place(); })).observe(box);

// The paste: at the cursor, replacing a selection as Cmd-V does; a space before or after it where it would touch a word
// (what the speaker would type between two dictations; STT itself adds none).
const gap = (v, at, t) => (at > 0 && !/\s/.test(v[at - 1]) ? ' ' : '') + t + (at < v.length && !/\s/.test(v[at]) ? ' ' : '');
function paste(t) {
  if (document.activeElement === txt) {
    const v = txt.textContent, at = where(), s = getSelection();
    document.execCommand('insertText', false, s.isCollapsed ? gap(v, at, t) : t);
    pos = where();
  } else {
    const v = node().data, s = gap(v, pos, t);
    node().data = v.slice(0, pos) + s + v.slice(pos); pos += s.length; place();
  }
  // The field scrolls only as far as needed to show the line with the cursor at its bottom edge, so the text above it
  // stays in view (2026-11-11: scrolling the cursor's line to the top took the third phrase out of sight on an iPhone).
  requestAnimationFrame(() => {
    place();
    if (document.activeElement === txt) return;
    const y = parseFloat(caret.style.transform.split(',')[1]) || 0, bottom = y + caret.offsetHeight + parseFloat(getComputedStyle(txt).paddingBottom);
    if (bottom > doc.scrollTop + doc.clientHeight) doc.scrollTop = bottom - doc.clientHeight;
    place();
  });
}

// One dictation: dot on, the voice (heard if sound is on, else only its time passes), tail, dot off, recognising, paste.
async function speak(p) {
  busy = true; abort = false; caret.classList.add('still'); dot.classList.add('on');
  const t0 = performance.now();
  let heard = false;
  if (sound) { audio.src = p.a; heard = await audio.play().then(() => true, () => false); }
  while (!abort && performance.now() - t0 < p.d * 1000 + 60 && !(heard && audio.ended)) await wait(40);
  if (!abort) await wait(TAIL);
  dot.classList.remove('on');
  if (!abort) {
    await wait(THINK);
    while (performance.now() - typed < 1500) await wait(200); // never into the middle of someone's typing
    paste(p.t);
  }
  caret.classList.remove('still'); busy = false;
  return !abort;
}

// Time that passes only while the block is in view and the page is shown.
async function gate(ms) {
  let left = ms;
  while (left > 0) { await wait(50); if (inView && !document.hidden) left -= 50; }
}
async function loop() {
  let i = 0;
  await gate(1500);
  for (;;) {
    const p = list[i % list.length];
    if (!(await speak(p))) { await wait(200); continue; } // the sound came on mid-phrase: the same phrase again, heard
    i++;
    if (i % list.length) { await gate(2200); continue; }
    await gate(4000);
    if (!touched) { node().data = ''; pos = 0; place(); }
    await gate(1200);
  }
}

fetch(box.dataset.set).then((r) => r.json()).then((d) => {
  list = d[lang] || d.en;
  fit(); place();
  new IntersectionObserver((e) => { inView = e[0].isIntersecting; }, { threshold: .6 }).observe(box);
  loop();
});
place();

snd.addEventListener('click', () => {
  sound = !sound; snd.setAttribute('aria-pressed', sound);
  // A press unlocks the player for the phrases to come (a browser lets a page play only after one); a phrase already
  // running is cut and said again, now heard.
  if (sound) { audio.src = HUSH; audio.play().catch(() => {}); if (busy) abort = true; }
  else audio.pause();
});
