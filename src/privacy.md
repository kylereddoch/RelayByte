---
layout: document.njk
title: Privacy
heading: Privacy.
description: How Kyle Reddoch handles RelayByte website and blog visits, shared payment records, and email, with links to each app’s own privacy policy.
eyebrow: Updated October 7, 2026
intro: Privacy for this website, shared payments, and support. App-specific data handling is explained on each app’s website.
permalink: /privacy/
---
## Who is responsible

Kyle Reddoch operates RelayByte from Texas, United States. RelayByte is his software brand, not a separate legal entity. In this policy, “I” means Kyle Reddoch. Contact [{{ site.supportEmail }}](mailto:{{ site.supportEmail }}) with privacy questions or requests about this website or shared purchasing and support services.

This policy covers relaybyte.dev, including its blog and RSS feed, and the shared payment and email-support records I manage. It does not describe the permissions, storage, licensing reports, or other behavior of every app.

## Privacy for each app

{% set policyKind = 'privacy' %}
{% include 'policy-directory.njk' %}

These app policies explain their own app and website behavior. Visiting RelayByte does not give this website access to files reviewed by Trayage, styles managed by StylePort, or drafts prepared in Drift.

## Visiting the website

GitHub Pages hosts this website. GitHub processes connection and request information, including your IP address, to serve and protect the site. See [GitHub’s privacy statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).

I use Tinylytics to count page views and selected link clicks so I can understand which pages, app downloads, and external resources visitors use. Tinylytics receives the page URL and path, referrer when the browser provides one, and browser user-agent information. A visitor’s IP address is used briefly to create rotating, one-way daily hashes and identify the country, then discarded rather than stored with the visit. Link-click events record a descriptive event name and, for outbound links, the destination URL.

Tinylytics does not use tracking cookies or persistent cross-site identifiers. Its analytics service is hosted in Germany, and its script is delivered through Cloudflare. See [Tinylytics’ visitor-data explanation](https://tinylytics.app/docs/trust/privacy) and [privacy policy](https://tinylytics.app/docs/privacy). I have not added advertising trackers, embedded social feeds, or a visitor account system.

If you choose a light or dark appearance, the website saves that preference in your browser’s local storage. It stays on your device and is not sent to me. Choosing “System” removes the saved preference. The site does not set cookies through its own code.

## Direct purchases through Stripe

Where a product uses Stripe, Stripe hosts direct checkout and any billing portal. It processes the email address, billing and payment information, transaction records, and technical information needed to take payment and prevent fraud. This website has no embedded payment form and does not receive your full card details. Optional support payments processed through my Stripe account also create payment records; they are separate from app licenses.

I can access customer and transaction records in Stripe to provide purchased access, locate orders, answer billing questions, handle refunds and disputes, prevent fraud, and meet accounting or legal obligations. Stripe also processes information for its own service and legal obligations. Its checkout and portal may use cookies; see [Stripe’s privacy policy](https://stripe.com/privacy).

## Product licensing and purchase delivery

Licensing and delivery depend on the product. For Trayage’s direct edition, Stripe sends purchase and refund events to Keylight. Keylight associates the purchase email and order with a license and emails the key. A refund can change that license’s access. I can access customer licensing records to manage purchased access and provide support.

The [Trayage privacy policy](https://trayage.app/privacy/) explains its licensing, trial and device reporting, including reporting before a purchase. See also [Keylight’s privacy policy](https://keylight.dev/privacy/). That app-specific reporting is separate from visiting RelayByte and does not apply to every app.

## Purchases through Apple

Apple processes App Store purchases under its own policies; they do not pass through my Stripe checkout. See [App Store & Privacy](https://www.apple.com/legal/privacy/data/en/app-store/) and the relevant app’s policy for its handling of purchase access and any additional purchase service, such as RevenueCat in Trayage 1.1.

## Contacting me

The blog has no public comments, visitor accounts, or email subscription form. Reading the RSS feed requires no signup with me; fetching it involves the same hosting requests described above. Links to app websites, stores, payment services, and other external sites are governed by those sites’ policies after you follow them.

If you email [{{ site.supportEmail }}](mailto:{{ site.supportEmail }}), I receive your email address, message, and anything you choose to attach. I use that information to answer your question, investigate a problem, locate a purchase, or handle your request. The support mailbox is hosted by Proton Mail; see [Proton Mail’s privacy policy](https://proton.me/mail/privacy-policy).

Ordinary email exchanged with other providers is not automatically end-to-end encrypted. Please leave full payment card numbers, complete license keys, and private files out of support messages. Redact sensitive information from screenshots.

## Use, sharing, and processing locations

I use the information described here to provide purchases and support, administer access, protect against fraud and abuse, and meet legal obligations. I do not sell personal information or use it for targeted advertising.

GitHub, Stripe, Proton, and the product-specific providers described above process information to provide their services. Information may also need to be disclosed to comply with law or resolve a legal claim. I operate in the United States; providers may process information in other countries as explained in their policies. Their own privacy obligations and data uses are described in those linked policies.

## Retention and privacy requests

I keep support correspondence while needed for the request and relevant follow-up. Purchase records are retained as needed for purchased access, accounting, tax, fraud prevention, disputes, and legal obligations. Product licensing records follow the purposes described in that app’s policy. There is no single retention period for every type of record.

Email [{{ site.supportEmail }}](mailto:{{ site.supportEmail }}) to request access, correction, or deletion of personal information. Depending on applicable law, you may also have rights to portability, to object to or restrict a use, to withdraw consent for a consent-based use, to appeal a refused request, or to complain to a regulator. I may need a proportionate check that the information or purchase belongs to you.

I will work with the relevant provider on your request and explain records that must be retained. Provider backup and legal-retention requirements may continue after deletion from active records. Uninstalling an app or deactivating a license does not by itself erase billing or support records. A privacy request is separate from a [refund request]({{ '/refunds/' | url }}).

## Changes

I will update this page when these services or their data handling change and revise the date above. I will provide additional notice or obtain consent when applicable law requires it.
