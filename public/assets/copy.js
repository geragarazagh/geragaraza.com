// The Homebrew line on app pages: a click copies the command; its prompt glyph turns into a check mark for
// 1.5 s, the only sign. If the clipboard is refused, the command is selected instead, ready for Command-C.
for (const b of document.querySelectorAll('.cmd')) b.addEventListener('click', async () => {
  const c = b.querySelector('code');
  try { await navigator.clipboard.writeText(c.textContent); } catch { getSelection().selectAllChildren(c); return; }
  b.classList.add('done'); clearTimeout(b.t); b.t = setTimeout(() => b.classList.remove('done'), 1500);
});
