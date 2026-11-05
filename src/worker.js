// One page, three languages. Each page keeps its translations next to the English text, in
// data-ru and data-uk attributes; this Worker picks the language the visitor's system asks for
// (Accept-Language) and writes it into the HTML before it leaves, so nothing flickers and no script
// is needed. ?lang=ru gives search engines an address for each language; nothing on the site links
// to it as a switch.

const LANGS = ['en', 'ru', 'uk'];

function pick(request, url) {
  const asked = url.searchParams.get('lang');
  if (LANGS.includes(asked)) return asked;
  const ranked = (request.headers.get('accept-language') || '')
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=');
      return { lang: tag.split('-')[0].toLowerCase(), q: q === undefined ? 1 : Number(q) };
    })
    .sort((a, b) => b.q - a.q);
  return ranked.find((r) => LANGS.includes(r.lang))?.lang ?? 'en';
}

export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    if (!response.headers.get('content-type')?.includes('text/html')) return response;

    const url = new URL(request.url);
    const lang = pick(request, url);
    const address = (l) => url.origin + url.pathname + (l === 'en' ? '' : `?lang=${l}`);

    const rewritten = new HTMLRewriter()
      .on('html', { element: (e) => e.setAttribute('lang', lang) })
      .on('[data-ru]', {
        element(e) {
          const text = lang === 'en' ? null : e.getAttribute(`data-${lang}`);
          e.removeAttribute('data-ru');
          e.removeAttribute('data-uk');
          if (text === null) return;
          if (e.tagName === 'meta') e.setAttribute('content', text);
          else e.setInnerContent(text, { html: true });
        },
      })
      .on('link[rel="canonical"]', { element: (e) => e.setAttribute('href', address(lang)) })
      .on('meta[property="og:url"]', { element: (e) => e.setAttribute('content', address(lang)) })
      .on('head', {
        element(e) {
          const links = LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${address(l)}">`);
          links.push(`<link rel="alternate" hreflang="x-default" href="${address('en')}">`);
          e.append(links.join('\n') + '\n', { html: true });
        },
      })
      .transform(response);

    // Same address, different text: caches must keep the languages apart, and the assets' ETag no longer fits.
    const out = new Response(rewritten.body, rewritten);
    out.headers.set('Vary', 'Accept-Language');
    out.headers.delete('ETag');
    return out;
  },
};
