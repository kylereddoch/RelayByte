---
layout: document.njk
description: StylePort is a free, open-source CSS and UserCSS manager for Safari on Mac. Available directly and on the Mac App Store for macOS 14 or later.
title: StylePort
heading: Make the web feel like yours.
eyebrow: StylePort / Safari on macOS / Available now
intro: Custom styles for the websites you use, with a home in Safari.
permalink: /apps/styleport/
---
{% set styleport = apps | selectattr('slug', 'equalto', 'styleport') | first %}
<div class="app-release">
  <img class="detail-app-icon" src="{{ '/assets/apps/styleport.png' | url }}" width="80" height="80" alt="StylePort app icon">
  <div><strong>StylePort for Safari</strong><span>macOS 14+ · Free & open source</span></div>
  <a class="button button-dark" href="{{ styleport.appStoreUrl }}" data-tinylytics-event="app.download" data-tinylytics-event-value="{{ styleport.appStoreUrl }}">Download StylePort <span aria-hidden="true">↗</span></a>
</div>

StylePort is a CSS and UserCSS manager for Safari on Mac. Install, configure, edit, update, and apply custom styles to websites, with your styles and settings kept locally. The complete app is free, with no account or paid feature gates.

## A more personal browser

Import a CSS or UserCSS file, paste CSS, or review a style from a URL before installing it. Tune the variables a theme provides, choose which sites it applies to, and edit the CSS when you want finer control.

Website permission lets StylePort match and apply the styles you choose. Your styles and settings stay in Safari extension storage on your Mac. Read the [StylePort privacy policy](https://styleport.app/privacy/) for the details.

## Two ways to get StylePort

Install StylePort from the [Mac App Store]({{ styleport.appStoreUrl }}) or get the signed, notarized direct edition from the [StylePort website]({{ styleport.directDownloadUrl }}). Both include every feature for free and require macOS 14 or later.

The Mac App Store edition receives updates through Apple. The direct edition uses its signed Sparkle update feed.

The [public TestFlight beta](https://testflight.apple.com/join/zbXV7SMd) remains a separate option for previewing future updates.

## Built on open-source work

StylePort builds on the [Stylus userstyle engine](https://github.com/openstyles/stylus), licensed under GPL-3.0. Optional one-time tips through Apple in the App Store edition, or contributions through the website, support development without unlocking features.

[Get help with StylePort](https://styleport.app/support/) or [contact Kyle]({{ '/support/' | url }}).
