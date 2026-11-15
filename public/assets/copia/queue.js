// Copia's block: the paste queue (⌃⌥C) playing by itself while in view, as HoldQ's and Retyper's do; nothing to press, the
// same on an iPhone and a Mac (dev/rules.md, section 5). The queue opens (its deck fades in empty), three phrases of Bell's
// sentence are selected and copied one after another (each copy a card at the back, the count on the front card), then the
// caret goes to the note and each paste lands the next phrase in the order copied, its card sliding off the right edge.
// After the last paste the queue closes itself. Every time and curve is Copia 0.8's own (deck.swift, shelf.swift), checked
// against frames of the real deck filmed in the agents' session (2026-11-15): the deck fades in over 0.4 s (ease-in-out); a
// new card fades in at the back over 0.2 s; a pasted card leaves sideways at full size, accelerating (ease-in, 0.23 s per
// 200 pt, square root beyond), fading to 70 %, while the cards behind come forward in 0.2 s (ease-out); after the last one
// the deck fades out in 0.15 s, 0.35 s after the paste, with no empty card (as Copia 0.1 does it: 0.8 showed one).
(() => {
  const root = document.getElementById('cq'); if (!root) return;
  const scr = root.querySelector('.scr'), src = root.querySelector('.src'), dst = root.querySelector('.dst'), deck = root.querySelector('.deck');
  const phrases = [...src.querySelectorAll('.ph')];
  const CARD_W = 192, STEP = 7, INSET = 10, DEPTH = 2;
  const EASE_IN_OUT = 'cubic-bezier(.42,0,.58,1)', EASE_IN = 'cubic-bezier(.42,0,1,1)', EASE_OUT = 'cubic-bezier(0,0,.58,1)';
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const caret = document.createElement('i'); caret.className = 'caret';
  const badge = document.createElement('span'); badge.className = 'bdg'; badge.hidden = true;
  let run = 0, queue = [], cards = [], note = '';

  // The note: the text pasted so far and the caret after it; no caret while text is selected, as in a text view.
  const drawNote = (withCaret) => { dst.textContent = note; if (withCaret) dst.append(caret); };
  const select = (i, n) => {   // the first n characters of phrase i selected, as a drag selection grows
    phrases.forEach((p, k) => { const t = p.dataset.t; p.textContent = ''; if (k !== i || n <= 0) { p.textContent = t; return; }
      const m = document.createElement('mark'); m.textContent = t.slice(0, n); p.append(m, t.slice(n)); });
  };
  const count = (s) => s.length + (s.length === 1 ? ' character' : ' characters');   // metaFacts: «10 characters»

  // Card k from the front (0) to the back, in the deck's box (deck.swift cardFrame).
  const frame = (k) => ({ left: k * INSET, top: (DEPTH - k) * STEP, width: CARD_W - 2 * k * INSET });
  const place = (el, k) => { const f = frame(k); el.style.left = f.left + 'px'; el.style.top = f.top + 'px'; el.style.width = f.width + 'px'; el.style.zIndex = 5 - k; };
  function card(text) {
    const c = document.createElement('div'); c.className = 'cd' + (text == null ? ' none' : '');
    const t = document.createElement('div'); t.className = 't'; t.textContent = text == null ? 'Copy to add to the queue' : text; c.append(t);
    if (text != null) { const f = document.createElement('div'); f.className = 'f'; f.textContent = count(text); c.append(f); }
    return c;
  }
  const setBadge = () => { badge.hidden = queue.length === 0; badge.textContent = queue.length; };
  // The cards for the queue now (deck.swift rebuild): the next three items, front first, or the empty card; a card already
  // shown keeps its element, a new one fades in over 0.2 s.
  function rebuild(emptyCard = true) {
    const want = queue.length ? queue.slice(0, DEPTH + 1) : (emptyCard ? [null] : []);
    const next = [];
    for (const item of want) {
      const have = cards.find((c) => c.item === item);
      if (have) { next.push(have); continue; }
      const el = card(item); deck.append(el);
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'linear' });
      next.push({ item, el });
    }
    for (const c of cards) if (!next.includes(c)) c.el.remove();
    cards = next;
    cards.forEach((c, k) => place(c.el, k));
    setBadge();
  }

  function open() {
    queue = []; cards = []; deck.textContent = ''; deck.append(badge); rebuild();
    deck.style.opacity = 1;
    deck.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, easing: EASE_IN_OUT });
  }
  function close() {
    deck.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150, easing: 'linear' });
    deck.style.opacity = 0;
  }
  // A paste (deck.swift cardLeaves): the front card flies off the right edge in a layer of its own; the cards behind
  // come forward from where they stood.
  function pasted() {
    const front = cards.shift(); queue.shift();
    const fr = front.el.getBoundingClientRect(), sr = scr.getBoundingClientRect(), b = scr.clientLeft;
    const fly = front.el; fly.classList.add('fly');
    fly.style.left = (fr.left - sr.left - b) + 'px'; fly.style.top = (fr.top - sr.top - b) + 'px'; fly.style.zIndex = '';
    scr.append(fly);
    const d = sr.left + b + scr.clientWidth - fr.left;   // from the card's left edge to the screen's right edge
    const dur = 230 * Math.max(1, Math.sqrt(d / 200));
    fly.animate([{ transform: 'translateX(0)', opacity: 1 }, { transform: `translateX(${d}px)`, opacity: 0.7 }], { duration: dur, easing: EASE_IN, fill: 'forwards' })
      .finished.then(() => fly.remove(), () => fly.remove());
    const old = new Map(cards.map((c, k) => [c, frame(k + 1)]));
    rebuild(false);
    cards.forEach((c, k) => { const o = old.get(c); if (!o) return; const f = frame(k);
      c.el.animate([{ left: o.left + 'px', top: o.top + 'px', width: o.width + 'px' }, { left: f.left + 'px', top: f.top + 'px', width: f.width + 'px' }],
        { duration: 200, easing: EASE_OUT }); });
  }

  // The deck stands at the frame's bottom right, 12 pt in, its badge 12 pt above the front card. The note's lines go to
  // its left where they fit (a computer); on a phone the deck gets room of its own under them.
  function fit() {
    const lh = parseFloat(getComputedStyle(scr).lineHeight), ps = getComputedStyle(dst);
    const pad = parseFloat(ps.paddingTop) + parseFloat(ps.paddingBottom), padL = parseFloat(ps.paddingLeft);
    const probe = document.createElement('span'); probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap';
    scr.append(probe);
    let w = 0; for (const p of phrases) { probe.textContent = p.dataset.t; w = Math.max(w, probe.getBoundingClientRect().width); }
    probe.remove();
    const lines = 3 * lh + pad, zone = 12 + 142 + 14;   // the deck, its margin and the badge over it
    const side = padL + w + 16 <= scr.clientWidth - 12 - CARD_W;
    dst.style.minHeight = (side ? Math.max(lines, zone) : lines + zone) + 'px';
  }

  async function play(id) {
    const live = () => id === run;
    note = ''; select(-1, 0); drawNote(true); caret.classList.remove('still');
    await sleep(900); if (!live()) return;
    open();                                                       // ⌃⌥C
    await sleep(1100); if (!live()) return;
    for (let i = 0; i < phrases.length; i++) {
      const t = phrases[i].dataset.t;
      if (i === 0) drawNote(false);                               // a selection takes the caret away
      const span = 280 + 22 * t.length, steps = t.length;
      for (let n = 1; n <= steps; n++) { if (!live()) return; select(i, n); await sleep(span / steps); }
      await sleep(380); if (!live()) return;                      // ⌘C
      queue.push(t); rebuild();
      await sleep(900); if (!live()) return;
    }
    select(-1, 0); drawNote(true);                                // a click in the note
    await sleep(900);
    for (let i = 0; i < phrases.length; i++) {
      if (!live()) return;
      caret.classList.add('still');
      if (i > 0) { note += '\n'; drawNote(true); await sleep(420); if (!live()) return; }   // Return
      note += phrases[i].dataset.t; drawNote(true);               // ⌘V: the text lands at once
      await sleep(25); if (!live()) return;                       // the queue's settle (queue.swift), then the card leaves
      pasted();
      caret.classList.remove('still');
      if (!queue.length) { await sleep(350); if (!live()) return; close(); }   // shelf.swift: the last card, then the deck
      await sleep(1000);
    }
    await sleep(2200);
  }
  async function loop() { const id = ++run; while (id === run) await play(id); }
  function stop() { run++; scr.getAnimations({ subtree: true }).forEach((a) => a.cancel()); scr.querySelectorAll('.fly').forEach((f) => f.remove());
    deck.style.opacity = 0; select(-1, 0); note = ''; drawNote(true); }

  phrases.forEach((p) => { p.dataset.t = p.textContent; });
  // Highlight is the system's selection colour only where the browser takes it from macOS (Safari); Chromium's own in dark
  // is a light blue under white text. Where the dark theme's Highlight comes out light, macOS's own dark blue is used.
  const m = document.createElement('mark'); src.append(m);
  const [r, g, b] = (getComputedStyle(m).backgroundColor.match(/[\d.]+/g) || []).map(Number); m.remove();
  if (matchMedia('(prefers-color-scheme: dark)').matches && 0.2126 * r + 0.7152 * g + 0.0722 * b > 120) root.classList.add('hl');
  fit();
  new ResizeObserver(() => requestAnimationFrame(fit)).observe(scr);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {   // still: the three copies made, the last one still selected
    open(); deck.getAnimations().forEach((a) => a.finish()); for (const p of phrases) queue.push(p.dataset.t);
    rebuild(); deck.getAnimations({ subtree: true }).forEach((a) => a.finish()); select(2, phrases[2].dataset.t.length); drawNote(false); return;
  }
  drawNote(true);
  let on = false;
  new IntersectionObserver((es) => { const now = es[0].isIntersecting; if (now && !on) { on = true; loop(); } else if (!now && on) { on = false; stop(); } }, { threshold: .4 }).observe(root);
})();
