// Pixlift's live block, the common parts: file names as the app writes them, the «Desktop» row, the clipboard, the cut.
// The area selection itself is /assets/area.js, shared with OCR's page.
'use strict';
const PX = {};
// «2026-11-14 05-47-12», « (2)» when a name is taken in the same second, as the app names its files.
PX.taken = new Set();
PX.name = () => {
  const d = new Date(), p = (n) => String(n).padStart(2, '0');
  const b = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}-${p(d.getMinutes())}-${p(d.getSeconds())}`;
  let n = b, i = 2; while (PX.taken.has(n)) n = `${b} (${i++})`;
  PX.taken.add(n); return n;
};
// One file on the «Desktop»: its thumbnail and its full name, as Finder shows a file whose extension is not hidden (the
// app writes its files itself, so nothing hides «.png»). What a file answers to (selection, the context menu, Quick
// Look, Rename) lives in menu.js; without it the file still saves on a press.
PX.land = (desk, blob, name) => {
  const url = URL.createObjectURL(blob), f = document.createElement('div');
  f.className = 'px-file'; f.tabIndex = 0; f.setAttribute('role', 'button');
  Object.assign(f, { pxBlob: blob, pxUrl: url, pxName: name });
  const th = document.createElement('span'); th.className = 'th';
  const im = new Image(); im.src = url; im.alt = ''; im.draggable = false; th.append(im);
  const nm = document.createElement('span'); nm.className = 'nm';
  const t = document.createElement('span'); t.textContent = name + '.png'; nm.append(t);
  f.append(th, nm); desk.append(f);
  if (!PX.menu) f.addEventListener('click', () => PX.save(f));
  return f;
};
// A real file for the visitor: the browser's own download, under the file's current name.
PX.save = (f) => { const a = document.createElement('a'); a.href = f.pxUrl; a.download = f.pxName + '.png'; document.body.append(a); a.click(); a.remove(); };
// The clipboard, as the app fills it: the picture, replacing what was there. The item is made at once from a promise,
// inside the click, so Safari lets it through; a browser that refuses keeps the file only.
PX.copy = (blobPromise) => {
  try { if (window.ClipboardItem && navigator.clipboard?.write) navigator.clipboard.write([new ClipboardItem({ 'image/png': blobPromise })]).catch(() => {}); } catch {}
};
// A piece of a picture as a Retina capture would hold it: the selection's points times the screen's scale, cut from
// the picture's own pixels. The file the browser chose from srcset is read again as a plain image, because an <img>
// with srcset reports its size corrected for density (640 for a 2400 px file in a 640 pt slot), not its pixels.
const raw = new Map();
PX.pixels = (img) => {
  const u = img.currentSrc || img.src;
  if (!raw.has(u)) raw.set(u, new Promise((ok) => { const r = new Image(); r.onload = () => ok(r); r.src = u; }));
  return raw.get(u);
};
PX.cut = async (img, x, y, w, h) => {
  const s = window.devicePixelRatio || 1, src = await PX.pixels(img), k = src.naturalWidth / img.getBoundingClientRect().width;
  const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w * s)); c.height = Math.max(1, Math.round(h * s));
  const g = c.getContext('2d'); g.imageSmoothingQuality = 'high';
  g.drawImage(src, x * k, y * k, w * k, h * k, 0, 0, c.width, c.height);
  return new Promise((ok) => c.toBlob(ok, 'image/png'));
};
