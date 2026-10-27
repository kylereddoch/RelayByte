# RelayByte studio redesign — October 2026 release

Kyle approved publication of the redesign, video, and SEO/AEO updates on October 27, 2026. Preview: `npm run build && npm run preview` (http://127.0.0.1:4174/). Main pushes automatically deploy; verify the Pages run and live output for deployment status.

## Design and content

Retains the existing orange (#ef623f), ink (#151718), warm paper (#f4f2ed), and accessible light/dark accent variants. Shared typography, spacing, navigation, app cards, documents, and blog styling live in `src/assets/redesign.css`. The homepage adds a real Trayage product showcase, maker introduction, and accessible native FAQ disclosures. No autoplay or scroll-triggered content hiding.

Trayage product copy was checked against https://trayage.app/ and https://trayage.app/download/ on October 27, 2026. Corrected US$29.99 / App Store coming-soon claims to the current free review, optional 7-day cleanup trial, US$9.99 direct license, and direct/App Store availability. Direct and Apple purchases stay separate.

Trayage UI asset provenance: copied the native sample-data review image from Trayage-website/public/assets/product-views/review-light-native-1400.webp. It depicts the actual SwiftUI interface with sample files, not customer data or a space-saving claim. Icon comes from the same project's brand-violet directory, resized to 256px for the website.

## Film and social assets

The current video is a twelve-second silent introduction in a split layout: evergreen RelayByte studio messaging on the left, with a dark rounded badge and full 3D rotation on the right. Rotation begins at 0.5 seconds and takes 4.5 seconds. The footer reads relaybyte.dev, with no personal credit. The first and last poses match for seamless looping. It is 1920×1080, H.264, 30 fps, with a network-optimized MP4, English VTT description, poster, and a separate preview page at /film/. There is no homepage player or film section. The 24-second promotional cut and original source are preserved locally in output/film/promo-v1/.

Regenerate the badge on macOS: `npm run film:render` (Swift, AppKit, Core Image, AVFoundation). Source: scripts/film/render.swift. It also creates the poster and five pose stills in output/film/. Site builds use checked-in media and do not need Swift. Neither video nor OG image names individual apps or uses product screenshots, prices, release statuses, or platform-specific copy. The existing brand-only 1200×630 social image remains the static fallback; the badge renderer and brand exporter preserve it.

## SEO and AEO

- Shared per-page title/description, canonical, robots preview directives, locale, OG image dimensions/type/alt, and explicit Twitter image-card tags.
- JSON-LD: Person, studio Organization, WebSite, appropriate WebPage types, breadcrumbs, app entities, collection ItemList, published BlogPosting, and FAQ answers from the same data displayed on the page. No invented ratings or StylePort download/offer.
- Existing sitemap, robots, feed, draft exclusion, and path-prefix support retained. The /film/ preview page is excluded from the sitemap and collections and explicitly marked noindex, follow. No invented search results or ranking guarantees.
- `og:video`, HTTPS media URL, MIME type, and dimensions are on the homepage; the video player is only on the separate noindex preview page. X keeps `summary_large_image`; OG video metadata does not implement an X Player Card.
- `site.filmPublishedAt` is deliberately null before publication. No VideoObject is emitted on the noindex preview page. Any future indexable video page would require an actual publication timestamp; do not invent one.

## Publication follow-through

When approved: run npm test, publish through the normal Pages workflow, then verify live canonical HTML, MP4 MIME/range responses, image and VTT URLs, and fresh platform previews. Social video playback remains platform-dependent and has not been verified live. Check Search Console indexing separately; local tests do not prove discovery or ranking.

References checked:
- Open Graph structured video properties: https://ogp.me/
- Google's AI search guidance: https://developers.google.com/search/docs/appearance/ai-features
- Video discovery and watch pages: https://developers.google.com/search/docs/appearance/video
- Video structured-data requirements: https://developers.google.com/search/docs/appearance/structured-data/video
- X developer Player Card sample: https://github.com/xdevplatform/cards-player-samples

Google's AI features use the same foundations as Search. Readable, accurate content and matching structured data are the priority; special AI files or special schema are not required. FAQ markup here describes the visible content, not a claim of FAQ rich-result eligibility.

## Local verification

`npm test` passed October 27, 2026: 12 Node checks and 36 browser tests. Covers root and GitHub Pages subpath builds, draft exclusion, JSON-LD/metadata, links, light/dark WCAG AA scans, Chromium/WebKit desktop/mobile, 320px reflow, no-JavaScript content, keyboard navigation, theme persistence, and actual MP4 playback/seeking with byte-range responses. Desktop/mobile renders and the badge loop’s front, turning, reverse, and final poses were visually reviewed. This is local verification, not a production deployment or social crawler result.
