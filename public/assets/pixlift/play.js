// Variant B, «Сцена оживает»: nothing to press, the same on an iPhone and a Mac (as HoldQ's page). Over the README's
// telegram macOS's crosshair drags out the typed message, as ⌥⌘7 does; at the release the area lands on the «Desktop»
// as a file with the app's name, and the same picture shows pasted in a note titled with that name, as Notes titles a
// pasted screenshot. Then it clears and plays again, only while the block is in view.
'use strict';
(() => {
  const fig = document.getElementById('px'), img = fig.querySelector('img'), veil = fig.querySelector('.sel');
  const desk = document.getElementById('px-desk'), note = document.getElementById('px-note'), X = PX.crosshair();
  const A = [0.035, 0.425], B = [0.875, 0.985];          // the typed message, from «176 C KA» to «525P», in the picture's fractions
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
  let seen = false, run = 0;
  new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (seen && !run) loop(); }, { threshold: 0.4 }).observe(fig);
  const wait = (ms) => new Promise((ok) => setTimeout(ok, ms));
  function frame(f) { return new Promise((ok) => { const t0 = performance.now(); const step = (t) => { const k = Math.min(1, (t - t0) / f.ms); f.draw(k); k < 1 ? requestAnimationFrame(step) : ok(); }; requestAnimationFrame(step); }); }
  function show(p, q) {
    const r = img.getBoundingClientRect(), x = p[0] * r.width, y = p[1] * r.height;
    if (q) { const x0 = q[0] * r.width, y0 = q[1] * r.height;
      Object.assign(veil.style, { left: Math.min(x0, x) + 'px', top: Math.min(y0, y) + 'px', width: Math.abs(x - x0) + 'px', height: Math.abs(y - y0) + 'px' }); veil.hidden = false;
      X.paint([String(Math.round(Math.abs(x - x0))), String(Math.round(Math.abs(y - y0)))], r.left + x + 40 > document.documentElement.clientWidth);
    } else X.paint([String(Math.round(x)), String(Math.round(y))], false);
    X.place(r.left + x, r.top + y);
  }
  async function loop() {
    run = 1;
    while (seen) {
      desk.textContent = ''; note.classList.remove('on'); veil.hidden = true;
      await wait(700); show(A); await wait(600);
      await frame({ ms: 1400, draw: (k) => { const e = ease(k); show([A[0] + (B[0] - A[0]) * e, A[1] + (B[1] - A[1]) * e], A); } });
      await wait(150); veil.hidden = true; X.hide();
      const r = img.getBoundingClientRect(), name = PX.name();
      const blob = await PX.cut(img, A[0] * r.width, A[1] * r.height, (B[0] - A[0]) * r.width, (B[1] - A[1]) * r.height);
      await wait(250); PX.land(desk, blob, name);
      await wait(900); note.querySelector('.t').textContent = name + '.png'; note.querySelector('img').src = desk.querySelector('img').src; note.classList.add('on');
      await wait(3500);
    }
    run = 0; X.hide();
  }
})();
