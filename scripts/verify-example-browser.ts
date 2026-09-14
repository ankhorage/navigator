import { existsSync } from 'node:fs';
import { extname, resolve } from 'node:path';

import { chromium } from '@playwright/test';

import { getNavigatorExampleCatalog } from '../src/navigator';

const repositoryRoot = resolve(import.meta.dir, '..');
const selectedId = process.argv[2];
const examples = getNavigatorExampleCatalog().filter(
  ({ id, targets }) =>
    (selectedId === undefined || id === selectedId) &&
    targets.some(({ platform, support }) => platform === 'web' && support !== 'unsupported'),
);
const browser = await chromium.launch();

try {
  for (const example of examples) await verifyExampleAsync(example.id, example.title);
} finally {
  await browser.close();
}

console.log(`\nBrowser-verified ${examples.length} Web-supported Navigator examples.`);

/*** Verify content, interaction, history, responsive state, scrolling, and hydration. */
async function verifyExampleAsync(id: string, title: string): Promise<void> {
  const exportRoot = resolve(repositoryRoot, 'examples', id, 'dist/web');
  const server = createStaticServer(exportRoot);
  const page = await browser.newPage({
    colorScheme: 'light',
    viewport: { width: 1024, height: 768 },
  });
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    const origin = `http://127.0.0.1:${server.port}`;
    const entryRoute = '/';
    const url = new URL(entryRoute, origin).href;
    console.log(`\n> ${id}:web ${url}`);
    await page.goto(url, { waitUntil: 'networkidle' });
    await assertPageShellAsync(page, title);
    await assertResponsiveNavigationGeometryAsync(page, id, origin);
    await assertInteractionAsync(page);
    await assertNavigationAsync(page, origin, entryRoute, errors);
    await assertAppearanceAsync(page, title);
    if (errors.length > 0) throw new Error(`${id} emitted browser errors:\n${errors.join('\n')}`);
  } finally {
    await page.close();
    server.stop(true);
  }
}

/*** Verify deliberate widths, item targets, and the medium-to-expanded navigation transition. */
async function assertResponsiveNavigationGeometryAsync(
  page: import('@playwright/test').Page,
  exampleId: string,
  origin: string,
): Promise<void> {
  if (exampleId !== 'stack-tabs-stack') return;
  await page.goto(new URL('/workspace', origin).href, { waitUntil: 'networkidle' });
  const sidebar = page.getByTestId('navigator-tabs-sidebar');
  await sidebar.waitFor();
  await assertVerticalNavigationGeometryAsync(page, 'sidebar', 280, 48);
  await page.setViewportSize({ height: 768, width: 800 });
  const rail = page.getByTestId('navigator-tabs-rail');
  await rail.waitFor();
  await assertVerticalNavigationGeometryAsync(page, 'rail', 88, 64);
  await page.setViewportSize({ height: 768, width: 1024 });
  await sidebar.waitFor();
  await page.goto(origin, { waitUntil: 'networkidle' });
}

/*** Assert one vertical presentation and its route controls occupy the intended geometry. */
async function assertVerticalNavigationGeometryAsync(
  page: import('@playwright/test').Page,
  presentation: 'rail' | 'sidebar',
  expectedWidth: number,
  expectedItemHeight: number,
): Promise<void> {
  const navigation = page.getByTestId(`navigator-tabs-${presentation}`);
  await navigation.waitFor();
  const navigationBounds = await navigation.boundingBox();
  if (navigationBounds === null || Math.round(navigationBounds.width) !== expectedWidth) {
    throw new Error(
      `${presentation} width was ${navigationBounds?.width ?? 'unavailable'} instead of ${expectedWidth}.`,
    );
  }
  const firstItem = page.locator('[data-testid^="navigator-tabs-item-"]').first();
  const itemBounds = await firstItem.boundingBox();
  if (itemBounds === null || Math.round(itemBounds.height) < expectedItemHeight) {
    throw new Error(
      `${presentation} item height was ${itemBounds?.height ?? 'unavailable'} instead of at least ${expectedItemHeight}.`,
    );
  }
  if (presentation === 'sidebar' && Math.round(itemBounds.width) !== 248) {
    throw new Error(`Sidebar items must fill the 248 px padded navigation content width.`);
  }
}

/*** Verify meaningful content and absence of framework error overlays. */
async function assertPageShellAsync(page: import('@playwright/test').Page, title: string) {
  await page.getByText(title, { exact: true }).first().waitFor();
  await page
    .getByText(/Current route:/u)
    .first()
    .waitFor();
  const overlay = page.locator(
    '[data-nextjs-dialog], .vite-error-overlay, #webpack-dev-server-client-overlay',
  );
  if ((await overlay.count()) > 0)
    throw new Error(`Framework error overlay rendered for ${title}.`);
}

/*** Verify local state, viewport retention, keyboard focus, scrolling, and final action. */
async function assertInteractionAsync(page: import('@playwright/test').Page): Promise<void> {
  await page.getByRole('button', { name: 'Increment counter' }).click();
  await page.getByText('Count: 1', { exact: true }).waitFor();
  await page.setViewportSize({ width: 640, height: 900 });
  await page.getByText('Count: 1', { exact: true }).waitFor();
  await page.keyboard.press('Tab');
  const focusable = await page.evaluate(() =>
    ['A', 'BUTTON'].includes(document.activeElement?.tagName ?? ''),
  );
  if (!focusable) throw new Error('Keyboard navigation did not reach a link or button.');
  const finalAction = page.getByRole('button', { name: 'Complete example' });
  await finalAction.scrollIntoViewIfNeeded();
  await finalAction.click();
  await page.getByText('Final action reached', { exact: true }).waitFor();
}

/*** Verify direct URL entry plus browser Back and Forward where another route is available. */
async function assertNavigationAsync(
  page: import('@playwright/test').Page,
  origin: string,
  entryRoute: string,
  errors: readonly string[],
): Promise<void> {
  const href = await page
    .locator('a[href]')
    .evaluateAll(
      (links, currentRoute) =>
        links
          .map((link) => link.getAttribute('href'))
          .find((value) => value !== null && value !== currentRoute),
      entryRoute,
    );
  if (href === undefined || href === null) return;
  console.log(`  direct route: ${href}`);
  const response = await page.goto(new URL(href, origin).href, { waitUntil: 'networkidle' });
  const routeText = page.getByText(/Current route:/u).first();
  try {
    await routeText.waitFor({ timeout: 5_000 });
  } catch (error) {
    const body = (await page.locator('body').innerText()).slice(0, 500);
    throw new Error(
      `Direct route ${page.url()} returned ${response?.status() ?? 'no response'} without screen content.\nBrowser errors:\n${errors.join('\n')}\nBody:\n${body}`,
      { cause: error },
    );
  }
  await page.goBack({ waitUntil: 'networkidle' });
  await page.goForward({ waitUntil: 'networkidle' });
  await page
    .getByText(/Current route:/u)
    .first()
    .waitFor();
}

/*** Verify the generated screen remains meaningful under dark appearance and reload. */
async function assertAppearanceAsync(
  page: import('@playwright/test').Page,
  title: string,
): Promise<void> {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByText(title, { exact: true }).first().waitFor();
}

/*** Serve one static Expo export with extensionless route fallback. */
function createStaticServer(root: string): ReturnType<typeof Bun.serve> {
  return Bun.serve({
    port: 0,
    async fetch(request) {
      const url = new URL(request.url);
      const pathname = decodeURIComponent(url.pathname);
      const relativePath = pathname.replace(/^\/+|\/+$/gu, '') || 'index.html';
      const relativeCandidates =
        extname(relativePath) === ''
          ? [`${relativePath}.html`, `${relativePath}/index.html`]
          : [relativePath];
      for (const relativeCandidate of relativeCandidates) {
        const candidate = resolve(root, relativeCandidate);
        if (!candidate.startsWith(`${root}/`) || !existsSync(candidate)) continue;
        return new Response(Bun.file(candidate), { headers: { 'Cache-Control': 'no-store' } });
      }
      return new Response('Not found', { status: 404 });
    },
  });
}
