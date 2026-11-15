// The site is in English (his decision 2026-11-15, dev/rules.md section 4): Russian appears only in his own blog posts.
// From 2026-11-08 to 2026-11-15 every page also had Russian and Ukrainian versions at ?lang=ru and ?lang=uk, picked by
// this Worker from Accept-Language or a switch at the bottom of the page; those addresses now answer with a permanent
// redirect to the page itself, so old links and search results still land.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // One address per page: www answers with a permanent redirect to the bare domain. Until 2026-11-10 it served a
    // full copy of every page with its own canonical (https://www.geragaraza.com/), a duplicate site for search engines.
    // Files under run_worker_first exclusions never reach this; only pages do, and pages are what get indexed.
    let moved = false;
    if (url.hostname === 'www.geragaraza.com') { url.hostname = 'geragaraza.com'; moved = true; }
    // SourceKey was renamed Retyper on 2026-11-11 (0.1.1): its old page address keeps working.
    if (url.pathname === '/apps/sourcekey' || url.pathname.startsWith('/apps/sourcekey/')) { url.pathname = '/apps/retyper/'; moved = true; }
    if (url.searchParams.has('lang')) { url.searchParams.delete('lang'); moved = true; }
    if (moved) return Response.redirect(url.toString(), 301);

    const response = await env.ASSETS.fetch(request);
    if (!response.headers.get('content-type')?.includes('text/html')) return response;

    // The fonts the page draws with, fetched together with the stylesheet instead of after it, so the text appears in
    // Inter at once and doesn't jump from a fallback font. Cyrillic only where the page shows it from the start: the
    // blog (his posts are in Russian) and Retyper's live block (its phrases are typed in Russian and Ukrainian).
    const blog = url.pathname.startsWith('/blog/');
    const fonts = ['latin-500', 'latin-600']
      .concat(blog || url.pathname.startsWith('/apps/retyper/') ? ['cyrillic-500'] : [])
      .concat(blog ? ['cyrillic-600'] : []);
    const rewritten = new HTMLRewriter()
      .on('head', {
        element(e) {
          const links = fonts.map((f) => `<link rel="preload" href="/fonts/inter-${f}.woff2" as="font" type="font/woff2" crossorigin>`);
          e.append(links.join('\n') + '\n', { html: true });
        },
      })
      .transform(response);

    // The page differs from the stored file by the preload lines, so the file's ETag no longer fits.
    const out = new Response(rewritten.body, rewritten);
    out.headers.delete('ETag');
    // Security headers (2026-11-12, Mozilla Observatory in release.md «Security scanners»): every script, style, font,
    // picture and sound is the site's own, so a page loads nothing from elsewhere and no other site may frame it.
    // 'unsafe-inline' for styles only: the home page keeps one <style> for its logo in the dark theme. blob: for pictures
    // only: Pixlift's live block makes its captures in the page and shows them from memory (2026-11-14).
    out.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' blob:; media-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
    out.headers.set('X-Frame-Options', 'DENY');
    out.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    return out;
  },
};
