// Dates on the blog in the reader's own time zone, digits only: 2026-11-19 17:15:06 for a post, 2026-11-19 in the list
// (his word 2026-11-19 ~17:20: a reader in Moscow, Cyprus or New Zealand sees the moment of writing in their own clock,
// no words). The page itself carries the same in Kyiv time, for a browser without scripts.
for (const t of document.querySelectorAll('time[datetime]')) {
  const d = new Date(t.getAttribute('datetime'));
  if (isNaN(d)) continue;
  const p = n => String(n).padStart(2, '0');
  const day = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  t.textContent = t.dataset.full === undefined ? day : `${day} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
