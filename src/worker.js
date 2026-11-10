// One page, three languages. Each page keeps its translations next to the English text, in
// data-ru and data-uk attributes; this Worker picks the language and writes it into the HTML before
// it leaves, so nothing flickers and no script is needed.
// The language is the one the visitor's system asks for (Accept-Language), unless they picked one
// with the switch at the bottom of every page: that gives ?lang=xx, and the site's own links then
// carry it along, so the choice holds from page to page without a cookie. ?lang=xx is also the
// address search engines get for each language (hreflang).

const LANGS = ['en', 'uk', 'ru'];
const NAMES = { en: 'English', uk: 'Українська', ru: 'Русский' };

function pick(request, url) {
  const asked = url.searchParams.get('lang');
  if (LANGS.includes(asked)) return { lang: asked, chosen: true };
  const ranked = (request.headers.get('accept-language') || '')
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=');
      return { lang: tag.split('-')[0].toLowerCase(), q: q === undefined ? 1 : Number(q) };
    })
    .sort((a, b) => b.q - a.q);
  return { lang: ranked.find((r) => LANGS.includes(r.lang))?.lang ?? 'en', chosen: false };
}

export default {
  async fetch(request, env) {
    // One address per page: www answers with a permanent redirect to the bare domain. Until 2026-11-10 it served a
    // full copy of every page with its own canonical (https://www.geragaraza.com/), a duplicate site for search engines.
    // Files under run_worker_first exclusions never reach this; only pages do, and pages are what get indexed.
    const host = new URL(request.url);
    if (host.hostname === 'www.geragaraza.com') {
      host.hostname = 'geragaraza.com';
      return Response.redirect(host.toString(), 301);
    }
    const response = await env.ASSETS.fetch(request);
    if (!response.headers.get('content-type')?.includes('text/html')) return response;

    const url = new URL(request.url);
    const { lang, chosen } = pick(request, url);
    const address = (l) => url.origin + url.pathname + (l === 'en' ? '' : `?lang=${l}`);
    // Each language in its own name, no flags; the current one is plain text.
    const sw = LANGS.map((l) =>
      l === lang
        ? `<span lang="${l}" aria-current="true">${NAMES[l]}</span>`
        : `<a href="${url.pathname}?lang=${l}" hreflang="${l}" lang="${l}">${NAMES[l]}</a>`,
    ).join(' ');

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
      .on('a[href^="/"]', {
        element(e) {
          if (!chosen) return;
          const href = e.getAttribute('href');
          if (href.startsWith('//') || href.includes('?')) return;
          e.setAttribute('href', `${href}?lang=${lang}`);
        },
      })
      .on('main', { element: (e) => e.append(`<p class="lang">${sw}</p>`, { html: true }) })
      .on('link[rel="canonical"]', { element: (e) => e.setAttribute('href', address(lang)) })
      .on('meta[property="og:url"]', { element: (e) => e.setAttribute('content', address(lang)) })
      .on('head', {
        element(e) {
          const links = LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${address(l)}">`);
          links.push(`<link rel="alternate" hreflang="x-default" href="${address('en')}">`);
          // The fonts the page will draw with, fetched together with the stylesheet instead of after it, so the
          // text appears in Inter at once and doesn't jump from a fallback font. Every page has latin 500 and 600
          // and the Cyrillic 500 of the language line; Cyrillic 600 only where the page itself is in ru or uk.
          const fonts = ['latin-500', 'latin-600', 'cyrillic-500'].concat(lang === 'en' ? [] : ['cyrillic-600']);
          for (const f of fonts) links.push(`<link rel="preload" href="/fonts/inter-${f}.woff2" as="font" type="font/woff2" crossorigin>`);
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
