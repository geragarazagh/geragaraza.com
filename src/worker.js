// The site is in English (his decision 2026-11-15, dev/rules.md section 4).
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
    // The blog was off from the morning of 2026-11-19 to 17:15 the same day (his word that evening: the blog is back,
    // Useful stays a list of links). Its old test post «Первая запись» and feed lead to the blog; the wallpaper post
    // moved from Useful into it, files included.
    else if (url.pathname.startsWith('/blog/pervaya-zapis') || url.pathname.startsWith('/blog/feed')) { url.pathname = '/blog/'; moved = true; }
    else if (url.pathname.startsWith('/useful/wallpapers')) { url.pathname = url.pathname.replace('/useful/wallpapers', '/blog/wallpapers'); moved = true; }
    // The five skills were renamed on 2026-11-18 (0.2.0, his choice of names): their old page addresses keep working.
    const renamedSkills = { 'convert': 'converter', 'youtube-download': 'your-downloader', 'text-to-speech': 'offline-tts',
      'audiobook': 'mp3-to-m4b', 'mac-clean': 'macliner' };
    const skill = url.pathname.match(/^\/skills\/([a-z-]+)(\/.*)?$/);
    if (skill && Object.hasOwn(renamedSkills, skill[1])) { url.pathname = '/skills/' + renamedSkills[skill[1]] + '/'; moved = true; }
    if (moved) return Response.redirect(url.toString(), 301);

    const response = await env.ASSETS.fetch(request);
    if (!response.headers.get('content-type')?.includes('text/html')) return response;

    // The page's colour before anything else is drawn (his recording 2026-11-15 15:50: a white flash before the black
    // page in a new Safari window): the background on <html> itself and Safari's bar colour, in the first bytes of
    // <head>, so neither waits for site.css.
    // Black only since 2026-11-19 (no light theme).
    const first = '<style>html{background:#000}</style>\n<meta name="theme-color" content="#000000">\n';
    // The site's own files named in the page carry this deployment's id (?v=…): public/_headers lets a browser keep
    // /assets/* for an hour without asking again (until 2026-11-15 every visit asked for each file again
    // and the link icons came after the text), and a new deployment changes every address, so a page never meets the
    // files of an older one. Files a script fetches by itself keep their bare address and are at most an hour old.
    const v = env.CF_VERSION_METADATA?.id;
    const own = /^\/assets\//;
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

    // The page differs from the stored file by the lines written in above, so the file's ETag no longer fits.
    const out = new Response(rewritten.body, rewritten);
    out.headers.delete('ETag');
    // Security headers (2026-11-12, Mozilla Observatory in release.md «Security scanners»): every script, style, font,
    // picture and sound is the site's own, so a page loads nothing from elsewhere and no other site may frame it.
    // 'unsafe-inline' for styles only: every page's first-paint background above. Since the plain redesign (2026-11-19)
    // no page has pictures, sound or video of its own beyond the site icon, so blob:, data: and media went.
    // frame-src: an app page may hold his YouTube video in YouTube's no-cookie player (2026-11-24, dev/site.md «Apps»).
    out.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; " +
      "img-src 'self'; frame-src https://www.youtube-nocookie.com; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
    out.headers.set('X-Frame-Options', 'DENY');
    out.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    return out;
  },
};
