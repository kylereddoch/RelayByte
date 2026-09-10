import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = ['/', '/about/', '/support/', '/privacy/', '/terms/', '/refunds/', '/apps/trayage/', '/apps/styleport/', '/404.html'];

for (const theme of ['light', 'dark']) {
  test(`${theme}: all pages render, fit the screen, and pass axe WCAG AA`, async ({ page }, testInfo) => {
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    for (const route of routes) {
      expect((await page.goto(route)).status()).toBe(200);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('nav a')).toHaveCount(3);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(await page.locator('img').evaluateAll(imgs => imgs.every(i => i.complete && i.naturalWidth > 0))).toBe(true);
      const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      expect(audit.violations.map(v => ({ rule: v.id, nodes: v.nodes.map(n => ({ target: n.target, reason: n.failureSummary })) })), route).toEqual([]);
      if (['/', '/terms/', '/refunds/', '/privacy/'].includes(route)) await page.screenshot({ path: `docs/qa/${testInfo.project.name}-${theme}${route === '/' ? '' : `-${route.split('/')[1]}`}.png`, fullPage: true });
    }
    expect(errors).toEqual([]);
  });
}

test('theme preference persists, System clears storage and follows OS changes', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  const theme = page.getByRole('combobox', { name: 'Color theme' });
  await theme.selectOption('dark');
  await page.reload();
  await expect(theme).toHaveValue('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('link', { name: 'The maker', exact: true }).click();
  await expect(theme).toHaveValue('dark');
  await theme.selectOption('light');
  await page.reload();
  await expect(theme).toHaveValue('light');
  await theme.selectOption('system');
  expect(await page.evaluate(() => localStorage.getItem('relaybyte-theme'))).toBe(null);
  await page.emulateMedia({ colorScheme: 'dark' });
  expect(await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(21, 23, 24)');
  await page.emulateMedia({ colorScheme: 'light' });
  expect(await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(244, 242, 237)');
});

test('storage denial leaves appearance and navigation usable', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Denied', 'SecurityError'); } });
  });
  await page.goto('/');
  await page.getByRole('combobox').selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('link', { name: 'The maker', exact: true }).click();
  await expect(page.locator('h1')).toHaveText('Hi, I’m Kyle.');
  expect(errors).toEqual([]);
});

test('keyboard skip, navigation, app links, and reduced motion', async ({ page, browserName }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  // WebKit on macOS uses Option-Tab to include links in keyboard traversal.
  await page.keyboard.press(browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  expect(await page.locator('html').evaluate(el => getComputedStyle(el).scrollBehavior)).toBe('auto');
  const tabKey = browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab';
  await page.keyboard.press(tabKey);
  await expect(page.getByRole('link', { name: 'Meet the apps' })).toBeFocused();
  await page.keyboard.press(tabKey);
  const card = page.getByRole('button', { name: 'Light it up' });
  await expect(card).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(card).toHaveClass(/is-lit/);
  expect(await card.locator('.brand-art-spinner').evaluate(el => el.getAnimations().length)).toBe(0);
  await expect(page).toHaveURL(/\/#main$/);
  await page.getByRole('link', { name: 'Meet the apps' }).click();
  await expect(page).toHaveURL(/#apps$/);
  await expect(page.getByRole('link', { name: 'Download Trayage' })).toHaveAttribute('href', 'https://trayage.app/download/');
  await expect(page.getByRole('link', { name: 'Explore StylePort' })).toHaveAttribute('href', 'https://styleport.app');
});

test('320px reflow, tablet width, no-JavaScript content, and missing pages', async ({ browser, page }) => {
  for (const width of [320, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/support/', '/terms/', '/refunds/', '/privacy/', '/apps/trayage/']) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
  const response = await page.goto('/missing/deep/link');
  expect(response.status()).toBe(404);
  await expect(page.getByRole('link', { name: 'Head back to the apps' })).toBeVisible();
  const context = await browser.newContext({ javaScriptEnabled: false, colorScheme: 'dark' });
  const noJS = await context.newPage();
  await noJS.goto('http://127.0.0.1:4185/');
  await expect(noJS.locator('h1')).toBeVisible();
  await expect(noJS.getByRole('combobox')).toBeHidden();
  await expect(noJS.getByRole('link', { name: 'Download Trayage' })).toHaveAttribute('href', 'https://trayage.app/download/');
  await expect(noJS.getByRole('button', { name: 'RelayByte logo card' })).toBeDisabled();
  await expect(noJS.locator('.art-cta')).toBeHidden();
  await noJS.getByRole('link', { name: 'The maker', exact: true }).click();
  await expect(noJS.locator('h1')).toHaveText('Hi, I’m Kyle.');
  await context.close();
});

test('GitHub Pages subpath: navigation, assets, and deep 404 recovery', async ({ page }) => {
  const failures = [];
  page.on('response', response => { if (response.status() >= 400) failures.push(response.url()); });
  await page.goto('http://127.0.0.1:4186/RelayByte/');
  await expect(page.getByRole('button', { name: 'Give it a spin' })).toBeEnabled();
  await page.getByRole('link', { name: 'The maker', exact: true }).click();
  await expect(page).toHaveURL('http://127.0.0.1:4186/RelayByte/about/');
  await page.getByRole('link', { name: 'RelayByte home' }).first().click();
  await expect(page.getByRole('link', { name: 'Download Trayage' })).toHaveAttribute('href', 'https://trayage.app/download/');
  await expect(page.getByRole('link', { name: 'Explore StylePort' })).toHaveAttribute('href', 'https://styleport.app');
  await page.goto('http://127.0.0.1:4186/RelayByte/apps/trayage/');
  await expect(page.getByRole('link', { name: 'Visit the Trayage website' })).toHaveAttribute('href', 'https://trayage.app');
  for (const [label, path] of [['Purchase terms', 'terms'], ['Refunds', 'refunds'], ['Privacy', 'privacy']]) {
    await page.locator('footer').getByRole('link', { name: label, exact: true }).click();
    await expect(page).toHaveURL(`http://127.0.0.1:4186/RelayByte/${path}/`);
    await expect(page.locator('h1')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(failures).toEqual([]);
  expect((await page.goto('http://127.0.0.1:4186/RelayByte/missing/deep/link')).status()).toBe(404);
  await page.getByRole('link', { name: 'Head back to the apps' }).click();
  await expect(page).toHaveURL('http://127.0.0.1:4186/RelayByte/');
});

test('logo card tilts, spins with pointer and keyboard, and stops for reduced motion', async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const card = page.getByRole('button', { name: 'Give it a spin' });
  const tilt = page.locator('.brand-art-tilt');
  const spinner = page.locator('.brand-art-spinner');
  await card.scrollIntoViewIfNeeded();
  const restingTilt = await tilt.evaluate(el => getComputedStyle(el).transform);
  if (!isMobile) {
    const box = await card.boundingBox();
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.2);
    await expect.poll(() => tilt.evaluate(el => getComputedStyle(el).transform)).not.toBe(restingTilt);
    await page.mouse.move(0, 0);
    await expect.poll(() => tilt.evaluate(el => getComputedStyle(el).transform)).toBe(restingTilt);
  }
  const home = page.url();
  if (isMobile) await card.tap();
  else await card.click();
  await expect.poll(() => spinner.evaluate(el => el.getAnimations().length)).toBe(1);
  await expect.poll(() => spinner.evaluate(el => getComputedStyle(el).transform)).not.toBe('none');
  // Repeated activation must not queue up extra turns.
  await card.press('Enter');
  expect(await spinner.evaluate(el => el.getAnimations().length)).toBe(1);
  await expect.poll(() => spinner.evaluate(el => el.getAnimations().length), { timeout: 4000 }).toBe(0);
  await expect(page).toHaveURL(home);
  await card.press('Space');
  await expect.poll(() => spinner.evaluate(el => el.getAnimations().length)).toBe(1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const quietCard = page.getByRole('button', { name: 'Light it up' });
  await expect(quietCard).toBeEnabled();
  await expect.poll(() => spinner.evaluate(el => el.getAnimations().length)).toBe(0);
  expect(await tilt.evaluate(el => getComputedStyle(el).transform)).toBe('none');
  expect(await spinner.evaluate(el => getComputedStyle(el).transform)).toBe('none');
  await quietCard.press('Enter');
  await expect(quietCard).toHaveClass(/is-lit/);
  expect(await spinner.evaluate(el => el.getAnimations().length)).toBe(0);
  await expect(page).toHaveURL(home);
});
