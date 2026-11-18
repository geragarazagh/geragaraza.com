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
    // The convert skill's page was a blog post until 2026-11-15; the blog holds only his own posts since (dev/rules.md).
    if (url.pathname === '/blog/navyk-convert' || url.pathname.startsWith('/blog/navyk-convert/')) { url.pathname = '/skills/converter/'; moved = true; }
    // The five skills were renamed on 2026-11-18 (0.2.0, his choice of names): their old page addresses keep working.
    const renamedSkills = { 'convert': 'converter', 'youtube-download': 'your-downloader', 'text-to-speech': 'offline-tts',
      'audiobook': 'mp3-to-m4b', 'mac-clean': 'macliner' };
    const skill = url.pathname.match(/^\/skills\/([a-z-]+)(\/.*)?$/);
    if (skill && Object.hasOwn(renamedSkills, skill[1])) { url.pathname = '/skills/' + renamedSkills[skill[1]] + '/'; moved = true; }
    if (moved) return Response.redirect(url.toString(), 301);

    const response = await env.ASSETS.fetch(request);
    // The blog's RSS feed (2026-11-16, made from the posts by publish-drafts/src/feed.py): the assets serve .xml as
    // application/xml; readers and validators expect the feed's own type.
    if (url.pathname === '/blog/feed.xml' && response.ok) {
      const feed = new Response(response.body, response);
      feed.headers.set('Content-Type', 'application/rss+xml; charset=utf-8');
      return feed;
    }
    if (!response.headers.get('content-type')?.includes('text/html')) return response;

    // The fonts the page draws with, fetched together with the stylesheet instead of after it, so the text appears in
    // Inter at once and doesn't jump from a fallback font. Cyrillic only where the page shows it from the start: the
    // blog (his posts are in Russian) and Retyper's live block (its phrases are typed in Russian and Ukrainian).
    const blog = url.pathname.startsWith('/blog/');
    const fonts = ['latin-500', 'latin-600']
      .concat(blog || url.pathname.startsWith('/apps/retyper/') ? ['cyrillic-500'] : [])
      .concat(blog ? ['cyrillic-600'] : []);
    // The page's colour before anything else is drawn (his recording 2026-11-15 15:50: a white flash before the black
    // page in a new Safari window): the background on <html> itself and Safari's bar colour, in the first bytes of
    // <head>, so neither waits for site.css.
    const first = '<style>html{background:#fff}@media (prefers-color-scheme:dark){html{background:#000}}</style>\n' +
      '<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">\n' +
      '<meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)">\n';
    // The site's own files named in the page carry this deployment's id (?v=…): public/_headers lets a browser keep
    // /assets/* and /icons/* for an hour without asking again (until 2026-11-15 every visit asked for each file again
    // and the link icons came after the text), and a new deployment changes every address, so a page never meets the
    // files of an older one. Files a script fetches by itself keep their bare address and are at most an hour old.
    const v = env.CF_VERSION_METADATA?.id;
    const own = /^\/(assets|icons)\//;
    const stamp = (u) => (v && own.test(u) && !u.includes('?') ? `${u}?v=${v}` : u);
    const versioned = (attr) => ({
      element(e) {
        const a = e.getAttribute(attr);
        if (!a) return;
        e.setAttribute(attr, attr === 'srcset' ? a.split(',').map((p) => p.trim().replace(/^\S+/, stamp)).join(', ') : stamp(a));
      },
    });
    const rewritten = new HTMLRewriter()
      .on('head', {
        element(e) {
          e.prepend(first, { html: true });
          const links = fonts.map((f) => `<link rel="preload" href="/fonts/inter-${f}.woff2" as="font" type="font/woff2" crossorigin>`);
          e.append(links.join('\n') + '\n', { html: true });
        },
      })
      // A skip link first in every page (2026-11-16): a keyboard reaches the page's text without passing the path line;
      // site.css (.skip) keeps it out of sight until it has focus. Every page has one <main>, which gets its target id.
      .on('body', { element(e) { e.prepend('<a class="skip" href="#main">Skip to content</a>\n', { html: true }); } })
      .on('main', { element(e) { if (!e.getAttribute('id')) e.setAttribute('id', 'main'); } })
      .on('link[href]', versioned('href'))
      .on('script[src]', versioned('src'))
      .on('img[src]', versioned('src'))
      .on('img[srcset], source[srcset]', versioned('srcset'))
      .on('video[src], audio[src], source[src]', versioned('src'))
      .on('video[poster]', versioned('poster'))
      .transform(response);

    // The page differs from the stored file by the preload lines, so the file's ETag no longer fits.
    const out = new Response(rewritten.body, rewritten);
    out.headers.delete('ETag');
    // Security headers (2026-11-12, Mozilla Observatory in release.md «Security scanners»): every script, style, font,
    // picture and sound is the site's own, so a page loads nothing from elsewhere and no other site may frame it.
    // 'unsafe-inline' for styles only: the home page keeps one <style> for its logo in the dark theme, and every page the
    // first-paint background above. blob: for pictures
    // only: Pixlift's live block makes its captures in the page and shows them from memory (2026-11-14); data: for the
    // Instagram logo inlined in the home page (its gradient is Meta's own raster, 2026-11-15).
    out.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' blob: data:; media-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
    out.headers.set('X-Frame-Options', 'DENY');
    out.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    return out;
  },
};
