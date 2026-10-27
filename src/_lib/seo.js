const serialize = value => JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
export function buildSeo(data) {
  const { site, page } = data;
  const url = path => new URL(path.replace(/^\/+/, ''), site.publicUrl).href;
  const title = data.title ? `${data.title} — ${site.name}` : site.name;
  const description = data.description || site.description;
  const indexable = Boolean(site.publicUrl && page.url !== '/404.html' && !data.draft && !data.noindex);
  if (!indexable) return { title, description, indexable, graph: '' };
  const canonical = url(page.url);
  const person = { '@type': 'Person', '@id': url('#maker'), name: 'Kyle Reddoch', url: url('/about/') };
  const studio = { '@type': 'Organization', '@id': url('#studio'), name: 'RelayByte', url: site.publicUrl,
    description: 'Independent software studio of Kyle Reddoch in Texas, United States.', founder: { '@id': person['@id'] },
    logo: { '@type': 'ImageObject', url: url('/assets/brand/icon-512.png'), width: 512, height: 512 }, email: site.supportEmail };
  const graph = [person, studio, { '@type': 'WebSite', '@id': url('#website'), url: site.publicUrl, name: site.name, publisher: { '@id': studio['@id'] } }];
  const webPage = { '@type': page.url === '/about/' ? 'AboutPage' : page.url === '/support/' ? 'ContactPage' : page.url === '/apps/' ? 'CollectionPage' : 'WebPage',
    '@id': `${canonical}#webpage`, url: canonical, name: title, description, inLanguage: 'en-US', isPartOf: { '@id': url('#website') }, about: { '@id': studio['@id'] } };
  graph.push(webPage);
  const app = data.apps?.find(app => page.url === `/apps/${app.slug}/`);
  if (app) {
    const product = { '@type': 'SoftwareApplication', '@id': `${canonical}#app`, name: app.name, description: app.description,
      url: canonical, image: url(app.icon), applicationCategory: 'UtilitiesApplication', operatingSystem: app.slug === 'trayage' ? 'macOS 14 or later' : app.platform,
      author: { '@id': person['@id'] }, mainEntityOfPage: { '@id': webPage['@id'] } };
    if (app.slug !== 'styleport') product.downloadUrl = app.url;
    graph.push(product); webPage.mainEntity = { '@id': product['@id'] };
  }
  if (page.url === '/apps/') graph.push({ '@type': 'ItemList', itemListElement: data.apps.map((app, index) => ({ '@type': 'ListItem', position: index + 1, name: app.name, url: url(`/apps/${app.slug}/`) })) });
  if (data.home) graph.push({ '@type': 'FAQPage', '@id': `${canonical}#faq`, mainEntity: data.faq.map(item => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) });
  if (data.post) graph.push({ '@type': 'BlogPosting', '@id': `${canonical}#article`, headline: data.title, description,
    datePublished: new Date(data.date).toISOString(), author: { '@id': person['@id'] }, publisher: { '@id': studio['@id'] },
    image: url('/assets/brand/social-card.png'), mainEntityOfPage: { '@id': webPage['@id'] } });
  if (!data.home) {
    const crumbs = [{ '@type': 'ListItem', position: 1, name: 'RelayByte', item: site.publicUrl }];
    if (app) crumbs.push({ '@type': 'ListItem', position: 2, name: 'The apps', item: url('/apps/') });
    else if (data.post || page.url.startsWith('/blog/category/')) crumbs.push({ '@type': 'ListItem', position: 2, name: 'Blog', item: url('/blog/') });
    crumbs.push({ '@type': 'ListItem', position: crumbs.length + 1, name: data.title || site.name, item: canonical });
    graph.push({ '@type': 'BreadcrumbList', '@id': `${canonical}#breadcrumbs`, itemListElement: crumbs });
    webPage.breadcrumb = { '@id': `${canonical}#breadcrumbs` };
  }
  // A public upload date is required for video rich-result eligibility. Set it at publication, never invent it for a local draft.
  if (data.video && site.filmPublishedAt) graph.push({ '@type': 'VideoObject', '@id': url('/film/#video'), name: 'RelayByte — the spinning logo badge',
    description: 'A twelve-second RelayByte introduction with evergreen studio information beside a spinning dimensional logo badge.', thumbnailUrl: url('/assets/media/relaybyte-film-poster.jpg'),
    contentUrl: url('/assets/media/relaybyte-film.mp4'), duration: 'PT12S', uploadDate: site.filmPublishedAt, inLanguage: 'en-US', creator: { '@id': person['@id'] } });
  return { title, description, indexable, canonical, graph: serialize({ '@context': 'https://schema.org', '@graph': graph }) };
}
