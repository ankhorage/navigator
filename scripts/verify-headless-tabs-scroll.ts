import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join, resolve } from 'node:path';

import { chromium, type Locator, type Page } from '@playwright/test';

const repositoryRoot = resolve(import.meta.dir, '..');
const fixtureRoot = mkdtempSync(join(tmpdir(), 'navigator-headless-tabs-scroll-'));
const exampleRoot = resolve(repositoryRoot, 'examples/tabs-stack');
const packageArchive = 'navigator-under-test.tgz';

try {
  cpSync(exampleRoot, fixtureRoot, {
    filter: (source) => !source.includes('/dist/') && !source.includes('/node_modules/'),
    recursive: true,
  });
  packLocalNavigator();
  useLocalNavigatorPackage();
  runFixtureCommand(['install']);
  runFixtureCommand(['run', 'export:web']);
  await verifyRouteOwnedScrollingAsync();
} finally {
  rmSync(fixtureRoot, { force: true, recursive: true });
}

console.log('\nBrowser-verified route-owned scrolling with the local Navigator package.');

/*** Point the isolated standalone example at the built package under test. */
function useLocalNavigatorPackage(): void {
  const manifestPath = resolve(fixtureRoot, 'package.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
    dependencies: Record<string, string>;
  };
  manifest.dependencies['@ankhorage/navigator'] = `file:./${packageArchive}`;
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

/*** Pack the built Navigator artifact so the fixture uses one React dependency graph. */
function packLocalNavigator(): void {
  const result = Bun.spawnSync({
    cmd: [
      process.execPath,
      'pm',
      'pack',
      '--filename',
      resolve(fixtureRoot, packageArchive),
      '--ignore-scripts',
      '--quiet',
    ],
    cwd: repositoryRoot,
    stderr: 'inherit',
    stdout: 'inherit',
  });
  if (result.exitCode !== 0) throw new Error('Failed to pack the local Navigator package.');
}

/*** Run one Bun command inside the isolated example and preserve its diagnostics. */
function runFixtureCommand(args: readonly string[]): void {
  const result = Bun.spawnSync({
    cmd: [process.execPath, ...args],
    cwd: fixtureRoot,
    stderr: 'inherit',
    stdout: 'inherit',
  });
  if (result.exitCode !== 0) throw new Error(`Fixture command failed: bun ${args.join(' ')}`);
}

/*** Prove that a real wheel gesture moves the route-owned React Native ScrollView. */
async function verifyRouteOwnedScrollingAsync(): Promise<void> {
  const server = createStaticServer(resolve(fixtureRoot, 'dist/web'));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { height: 600, width: 390 } });
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    await page.goto(`http://127.0.0.1:${server.port}`, { waitUntil: 'networkidle' });
    const finalAction = page.getByRole('button', { name: 'Complete example' });
    try {
      await finalAction.waitFor({ timeout: 10_000 });
    } catch (error) {
      const body = (await page.locator('body').innerText()).slice(0, 1_000);
      throw new Error(
        `The local headless-tabs route did not render.\nBrowser errors:\n${errors.join('\n')}\nBody:\n${body}`,
        { cause: error },
      );
    }
    const geometry = await identifyScrollContainerAsync(page);
    await page.mouse.move(geometry.left + geometry.width / 2, geometry.top + geometry.height / 2);
    await page.mouse.wheel(0, 400);
    await page.waitForFunction(
      (initialScrollTop) =>
        document.querySelector<HTMLElement>('[data-navigator-scroll-target]')?.scrollTop !==
        initialScrollTop,
      geometry.scrollTop,
    );
    for (
      let attempt = 0;
      attempt < 10 && !(await isInsideViewportAsync(finalAction, page));
      attempt += 1
    ) {
      await page.mouse.wheel(0, 600);
    }
    if (!(await isInsideViewportAsync(finalAction, page))) {
      throw new Error('Wheel scrolling did not make the final route action reachable.');
    }
    await finalAction.click();
    await page.getByText('Final action reached', { exact: true }).waitFor();
  } finally {
    await page.close();
    await browser.close();
    server.stop(true);
  }
}

/*** Mark the scrollable ancestor and return geometry for a wheel gesture inside it. */
async function identifyScrollContainerAsync(page: Page): Promise<ScrollGeometry> {
  const finalAction = page.getByRole('button', { name: 'Complete example' });
  const geometry = await finalAction.evaluate((element) => {
    let candidate = element.parentElement;
    while (candidate !== null) {
      const { overflowY } = getComputedStyle(candidate);
      if (
        (overflowY === 'auto' || overflowY === 'scroll') &&
        candidate.scrollHeight > candidate.clientHeight
      ) {
        candidate.dataset.navigatorScrollTarget = 'true';
        const bounds = candidate.getBoundingClientRect();
        return {
          height: bounds.height,
          left: bounds.left,
          scrollTop: candidate.scrollTop,
          top: bounds.top,
          width: bounds.width,
        };
      }
      candidate = candidate.parentElement;
    }
    return undefined;
  });
  if (geometry === undefined) {
    throw new Error('The route-owned ScrollView did not receive a bounded viewport.');
  }
  return geometry;
}

/*** Report whether the final route action is visible inside the browser viewport. */
async function isInsideViewportAsync(locator: Locator, page: Page): Promise<boolean> {
  const bounds = await locator.boundingBox();
  const viewport = page.viewportSize();
  return (
    bounds !== null &&
    viewport !== null &&
    bounds.y >= 0 &&
    bounds.y + bounds.height <= viewport.height
  );
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

interface ScrollGeometry {
  height: number;
  left: number;
  scrollTop: number;
  top: number;
  width: number;
}
