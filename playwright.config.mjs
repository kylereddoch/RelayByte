import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  workers: 4,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:4185', trace: 'retain-on-failure' },
  projects: [
    { name: 'chromium-desktop', use: { browserName: 'chromium', viewport: { width: 1440, height: 1000 } } },
    { name: 'chromium-mobile', use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: 'webkit-desktop', use: { browserName: 'webkit', viewport: { width: 1440, height: 1000 } } },
    { name: 'webkit-mobile', use: { browserName: 'webkit', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: [
    { command: 'node scripts/serve.mjs', env: { PORT: '4185' }, url: 'http://127.0.0.1:4185', reuseExistingServer: false },
    { command: 'node scripts/serve.mjs', env: { PORT: '4186', PREVIEW_DIR: 'dist-pages', PREVIEW_PREFIX: '/RelayByte' }, url: 'http://127.0.0.1:4186/RelayByte/', reuseExistingServer: false },
  ],
});
