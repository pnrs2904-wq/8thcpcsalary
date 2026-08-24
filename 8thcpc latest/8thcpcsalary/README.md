# 8thCPCSalary.com — Rebuilt Site

## What was fixed & added

1. **Google "why pages aren't indexed" errors.** The old sitemap pointed at `#fragment`
   URLs (all the same page), which Search Console flags as *Alternate page with proper
   canonical tag*, *Page with redirect*, and *Not found (404)*. Fixes:
   - `sitemap.xml`, `robots.txt` and `404.html` are now **real files** (previously they
     existed only as HTML comments, so crawlers never saw them).
   - The sitemap lists only real, distinct, indexable pages (home + blog + each post).
   - Every page has a correct **self-referential canonical**. The blog single-post view
     sets its own canonical, title, meta description and Article schema per post.
   - `/admin/` is `noindex` + Disallowed in robots.txt.

2. **Working calculator.** The uploaded file's JavaScript was a stub
   (`// [Full JS code from previous version goes here]`) — none of the ~40 functions the
   HTML calls actually existed, so nothing worked. All are restored in `app.js`:
   salary calc, DA tracker + AICPI predictor, pension (OPS/NPS), salary slip, fitment
   comparison, pay matrix, news feed, saved profiles, share/copy, newsletter.

3. **Blog.** `blog.html` renders a card list and individual posts from `data.js`,
   with per-post SEO. Three starter posts included.

4. **CMS admin dashboard** at `/admin/`. Edit DA %, fitment factors, 8th CPC status,
   news items and blog posts through a UI. Saves merge into the live site instantly
   (via localStorage, read by `data.js`). Use **Export → Copy JSON** and paste into
   `DEFAULT_DATA` in `data.js` to make changes permanent for all visitors.

5. **Updated data (verified against public sources, Aug 2026).**
   - DA **60%** effective 1 Jan 2026 (MoF OM 22.04.2026); **63% expected 1 Jul 2026**
     (AICPI-IW complete, Cabinet notification expected Sep–Oct 2026 with arrears).
   - 8th CPC **constituted 3 Nov 2025**, chaired by Justice Ranjana Prakash Desai;
     recommendations **not yet submitted** (confirmed in Lok Sabha, Aug 2026).
   - Fitment factor **1.92×–2.86×** widely discussed (some union demands up to 3.83×);
     nothing officially notified. All figures labelled as unofficial estimates.

## Files
```
index.html        main calculator page
blog.html         blog list + single post view
admin/index.html  CMS dashboard  (login passphrase: admin8cpc — CHANGE IT)
data.js           single source of truth for all editable data
app.js            calculator logic
styles.css        shared styles
sitemap.xml       lists real indexable pages
robots.txt        crawl rules + sitemap pointer
404.html          custom not-found page
```

## Deploy checklist
1. Upload all files to the domain **root** (so `/`, `/blog.html`, `/admin/`,
   `/sitemap.xml`, `/robots.txt` resolve).
2. Point the host's custom 404 handler to `404.html` (Netlify/Cloudflare Pages do this
   automatically; on Apache add `ErrorDocument 404 /404.html`).
3. **Change `ADMIN_PASS` in `admin/index.html`.** The admin gate is client-side only
   (obfuscation, not security). For real protection put `/admin/` behind server auth
   (HTTP basic auth, or host access rules). It is already `noindex` + Disallowed.
4. In Google Search Console: submit `sitemap.xml`, then use **URL Inspection →
   Request indexing** for the home page and each blog URL.
5. Replace the AdSense/Analytics placeholder IDs when you add them (none are hard-coded
   in this rebuild — add your own snippet to `index.html` if needed).

## How the CMS keeps data in sync
`data.js` holds `DEFAULT_DATA` (deploy-time defaults) and merges any admin overrides
saved to `localStorage["cpc_cms_data"]` on top. The site, blog and admin all read the
same merged `window.CPC_DATA`, so one edit updates the ticker, hero stats, calculator
defaults, news feed and FAQ everywhere. localStorage is per-browser — use Export to
make an edit global.
