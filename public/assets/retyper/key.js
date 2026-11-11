// Retyper's block (SourceKey until 0.1.1) (his pick 2026-11-11, variant A): text typed in the wrong layout, retyped as the app does it. A word
// typed on the wrong layout is replaced at Space (Backspaces, then the new text, in a blink), the input source sign
// switches at once, and the rest comes out right because the layout is now the right one. Every result here is one the
// app gave on a test machine (26.6.2, 2026-11-11). Plays while in view; nothing to press.
(() => {
  const root = document.getElementById('sk'); if (!root) return;
  const lang = ['ru', 'uk'].includes(document.documentElement.lang) ? document.documentElement.lang : 'en';
  const txt = root.querySelector('.txt'), src = root.querySelector('.src');
  // ['src', sign] sets the layout, ['type', text] types it key by key, ['fix', n, text, sign] is SourceKey: n characters
  // back, the text, the new layout.
  const SC = {
    ru: [
      [['src', 'A'], ['type', 'ghbdtn'], ['type', ' '], ['fix', 7, 'привет ', 'РУ'], ['type', 'как дела?']],
      [['src', 'A'], ['type', 'd 2022 ujle'], ['type', ' '], ['fix', 12, 'в 2022 году ', 'РУ'], ['type', 'всё получилось']],
      [['src', 'РУ'], ['type', 'ырщцштп'], ['type', ' '], ['fix', 8, 'showing ', 'A'], ['type', 'this']],
    ],
    uk: [
      [['src', 'A'], ['type', 'ghbdsn'], ['type', ' '], ['fix', 7, 'привіт ', 'УК'], ['type', 'як справи?']],
      [['src', 'A'], ['type', 'd 2022 hjws'], ['type', ' '], ['fix', 12, 'в 2022 році ', 'УК'], ['type', 'усе вийшло']],
      [['src', 'УК'], ['type', 'ірщцштп'], ['type', ' '], ['fix', 8, 'showing ', 'A'], ['type', 'this']],
    ],
    en: [
      [['src', 'РУ'], ['type', 'ырщцштп'], ['type', ' '], ['fix', 8, 'showing ', 'A'], ['type', 'this']],
      [['src', 'A'], ['type', 'ghbdtn'], ['type', ' '], ['fix', 7, 'привет ', 'РУ'], ['type', 'мир']],
      [['src', 'A'], ['type', 'd 2022 ujle'], ['type', ' '], ['fix', 12, 'в 2022 году ', 'РУ'], ['type', 'всё получилось']],
    ],
  }[lang];
  const caret = document.createElement('i'); caret.className = 'caret';
  let text = '';
  const draw = () => { txt.textContent = text; txt.append(caret); };
  const sign = (s) => { src.className = 'src' + (s === 'A' ? '' : ' fill'); src.innerHTML = '<span>' + s + '</span>'; };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let run = 0;
  async function play(ops, id) {
    text = ''; draw();
    for (const [op, a, b, c] of ops) {
      if (id !== run) return;
      if (op === 'src') sign(a);
      else if (op === 'type') for (const ch of a) { if (id !== run) return; caret.classList.add('still'); text += ch; draw(); await sleep(ch === ' ' ? 160 : 115 + Math.random() * 50); }
      else if (op === 'fix') {   // the app: Backspaces and the new text in one go, then the layout
        for (let i = 0; i < a; i++) { text = text.slice(0, -1); draw(); await sleep(8); }
        for (const ch of b) { text += ch; draw(); await sleep(8); }
        sign(c);
      }
    }
    caret.classList.remove('still');
  }
  async function loop() {
    const id = ++run; let n = 0;
    while (id === run) { await play(SC[n % SC.length], id); await sleep(2600); n++; }
  }
  sign(SC[0][0][1]); draw();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {   // the end of the first scene, still
    text = { ru: 'привет как дела?', uk: 'привіт як справи?', en: 'showing this' }[lang]; sign(SC[0][3][3]); draw(); return;
  }
  let on = false;
  new IntersectionObserver((es) => { const now = es[0].isIntersecting; if (now && !on) { on = true; loop(); } else if (!now && on) { on = false; run++; } }, { threshold: .4 }).observe(root);
})();
