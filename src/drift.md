---
layout: document.njk
title: Drift
description: Drift is a free, open-source Chrome extension for sharing articles and highlighted passages to Mastodon.
heading: A good find. Worth sharing.
eyebrow: Drift / Chrome / Available
intro: Share a page, a passage, a good find.
permalink: /apps/drift/
---
<img class="detail-app-icon" src="{{ '/assets/apps/drift.svg' | url }}" width="104" height="104" alt="Drift quotation mark icon">

Drift is a free, open-source Chrome extension by Kyle Reddoch. Highlight a passage, click the Drift toolbar icon, and start with an editable draft containing the quote, page title, and link.

## Your draft, your server

Add your thoughts, choose a saved Mastodon server, and continue to its composer to review and publish. Without highlighted text, Drift prepares the title and link. Right-click actions can share pages, selected text, and link targets.

Save up to 12 server addresses, choose a default, and optionally remove common tracking parameters from shared links. Drift uses the account already signed in on your chosen server; it does not need a Mastodon password or API token.

## Local preferences, temporary drafts

Preferences stay in local extension storage. Drafts use temporary session storage. Drift has no usage analytics inside the extension, persistent website access, or browsing-history permission.

Continuing to Mastodon sends the draft to your server in an HTTPS URL before you publish. That URL can appear in browser history and server logs. The [Drift privacy policy]({{ site.driftUrl }}privacy.html) explains this handoff and the extension’s storage.

## Available for Chrome

[Get Drift on the Chrome Web Store]({{ site.driftStoreUrl }}). Add your Mastodon server and pin the extension, then highlight a passage on an ordinary web article to try it.

Some protected pages, PDF viewers, and embedded frames block selected-text capture. Drift targets Mastodon’s share composer; other Fediverse software has not been tested.

[Visit the Drift website]({{ site.driftUrl }}) or [view the MIT-licensed source on GitHub](https://github.com/kylereddoch/drift). Drift is independent of Mastodon.

A RelayByte app by Kyle Reddoch.
