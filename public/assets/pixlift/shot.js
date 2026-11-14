// Pixlift's live block (his pick 2026-11-14, variant A of three, «Снимок области»): the README's telegram (Orville Wright to his father, 17 December 1903, Library of Congress,
// public domain) under macOS's area selection. A drag over it is Capture Selected Portion: the area's own pixels become a PNG,
// put on the clipboard (the real one: it pastes anywhere) and landed on the «Desktop» row under the picture, named as
// the app names its files. One or twenty in a row; the clipboard holds the last. The crosshair, the veil and the drag (touch:
// hold still 300 ms, then drag) are OCR's page's own, one shared file /assets/area.js (his word 2026-11-14 ~11:07: OCR's is right).
'use strict';
(() => {
  const fig = document.getElementById('px'), img = fig.querySelector('img'), veil = fig.querySelector('.sel');
  const desk = document.getElementById('px-desk');
  area(img, veil, (a, b) => {
    const name = PX.name(), blob = PX.cut(img, Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(a.x - b.x), Math.abs(a.y - b.y));
    PX.copy(blob); blob.then((bl) => PX.land(desk, bl, name));
  });
})();
