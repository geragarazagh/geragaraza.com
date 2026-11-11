// Command lines and texts to copy (.cmdline): the copy icon at the right copies the code or text of its block and
// turns into a check mark for 1.5 s, the only sign, as Google, Gemini, ChatGPT and GitHub do (his examples,
// 2026-11-11). If the clipboard is refused, the text is selected instead, ready for Command-C.
// The button's name for screen readers follows the page's language.
const L = document.documentElement.lang;
for (const b of document.querySelectorAll('.cmdline .copy')) {
  const n = (L === 'ru' && b.dataset.labelRu) || (L === 'uk' && b.dataset.labelUk); if (n) b.setAttribute('aria-label', n);
  b.addEventListener('click', async () => {
    const t = b.parentNode.querySelector('code,pre');
    try { await navigator.clipboard.writeText(t.textContent); } catch { getSelection().selectAllChildren(t); return; }
    b.classList.add('done'); clearTimeout(b.t); b.t = setTimeout(() => b.classList.remove('done'), 1500);
  });
}
