// A page of «War and Peace» (1937 Jubilee edition, vol. 9, p. 5), and OCR's selection over it. Page 5, the first page
// of plain running text, since 2026-11-11 (his note: the old page 3 opened with «Часть первая / I.»); it continues the
// salon of chapter I in French and Russian, the case OCR's line-by-line language work is for. Scan: archive.org
// tolstoy-leo-war-and-peace-4-volumes, Vol I jp2 0025, 2400 px wide, cropped as page 3 was (220 px over the first ink).
//
// The page was read beforehand by OCR's own engine (its main.swift, unchanged: Vision at 1.5x, tiles, the second
// look at words in another script, the cleanup), with the box of every word kept (page.json). So a selection
// here gives what OCR gives: every word whose middle lies inside the rectangle, line by line in OCR's order,
// words joined by spaces and lines by line breaks. A click without a drag selects nothing, as in macOS.
//
// The crosshair, the veil and the drag (mouse; on a touch screen a finger held still first) are macOS's area selection in
// /assets/area.js, one file shared with Pixlift's page since 2026-11-14. Copying is silent, as in the app.

const fig = document.getElementById('page'), img = fig.querySelector('img'), veil = fig.querySelector('.sel');
let lines = [];
fetch('/assets/ocr/page.json').then((r) => r.json()).then((d) => (lines = d.lines));

function text(a, b, r) {
  const x0 = Math.min(a.x, b.x) / r.width, x1 = Math.max(a.x, b.x) / r.width;
  const y0 = Math.min(a.y, b.y) / r.height, y1 = Math.max(a.y, b.y) / r.height;
  const out = [];
  for (const l of lines) {
    const got = l.w.filter(([, x, y, w, h]) => { const mx = x + w / 2, my = y + h / 2; return mx >= x0 && mx <= x1 && my >= y0 && my <= y1; });
    // A sixth value marks a piece cut off the word before it (a margin number Vision glued on): no space between them.
    if (got.length) out.push(got.map((w, i) => (i && !w[5] ? ' ' : '') + w[0]).join(''));
  }
  return out.join('\n');
}

area(img, veil, (a, b, r) => {
  const t = text(a, b, r);
  if (t) navigator.clipboard.writeText(t).catch(() => {});
});
