import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, extname, join, resolve } from 'node:path';

import { chromium, type Page } from '@playwright/test';

import { createNavigatorPlan, generateNavigator } from '../src/navigator';

const repositoryRoot = resolve(import.meta.dir, '..');
const consumerRoot = mkdtempSync(join(tmpdir(), 'navigator-expo-57-consumer-'));
const navigatorVersion = (
  JSON.parse(readFileSync(resolve(repositoryRoot, 'package.json'), 'utf8')) as { version: string }
).version;
const packageArchive = resolve(consumerRoot, `ankhorage-navigator-${navigatorVersion}.tgz`);

try {
  packNavigator();
  writeConsumerManifest();
  writeConsumerNavigatorFiles();
  writeConsumerScreen();
  runConsumerNpmCommand(['install']);
  verifyResolvedPlatform();
  runConsumerNpmCommand(['run', 'typecheck']);
  runConsumerNpmCommand(['run', 'export:web']);
  await verifyGeneratedNavigationAsync();
} finally {
  rmSync(consumerRoot, { force: true, recursive: true });
}

console.log(
  '\nVerified the Expo SDK 57 npm consumer peer contract, static Web export, and browser navigation.',
);

/*** Pack the current Navigator artifact for an isolated npm consumer. */
function packNavigator(): void {
  runCommand(
    ['npm', 'pack', '--ignore-scripts', '--pack-destination', consumerRoot],
    repositoryRoot,
  );
}

/*** Write the minimal visible screen used to prove generated public routes in a real browser. */
function writeConsumerScreen(): void {
  const screenPath = resolve(consumerRoot, 'src/screens/example-screen.tsx');
  mkdirSync(dirname(screenPath), { recursive: true });
  writeFileSync(
    screenPath,
    `import { Link, usePathname } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

const routes = [
  { href: '/training-setup', label: 'Training setup' },
  { href: '/training-setup/table', label: 'Training table' },
  { href: '/articles/42', label: 'Article 42' },
  { href: '/docs/a/b', label: 'Documentation' },
] as const;

/*** Render the current public route and explicit browser-navigable links. */
export function ExampleScreen() {
  const pathname = usePathname();
  return (
    <View>
      <Text>Generated Navigator route: {pathname}</Text>
      {routes.map((route) => (
        <Link href={route.href} key={route.href} asChild>
          <Pressable accessibilityRole="link">
            <Text>{route.label}</Text>
          </Pressable>
        </Link>
      ))}
    </View>
  );
}
`,
  );
}

/*** Write the canonical Expo SDK 57 consumer platform manifest. */
function writeConsumerManifest(): void {
  cpSync(resolve(repositoryRoot, 'examples', 'tabs-stack'), consumerRoot, {
    filter: (source) => !source.includes('/dist/') && !source.includes('/node_modules/'),
    recursive: true,
  });
  const manifestPath = resolve(consumerRoot, 'package.json');
  const sourceManifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
    dependencies: Record<string, string>;
  };
  const manifest = {
    ...sourceManifest,
    dependencies: {
      ...sourceManifest.dependencies,
      '@ankhorage/expo-runtime': '7.0.2',
      '@ankhorage/navigator': `file:${packageArchive}`,
      '@ankhorage/surface': '9.4.6',
      expo: '57.0.31',
      'expo-router': '57.0.24',
      react: '19.2.3',
      'react-dom': '19.2.3',
      'react-native': '0.86.3',
      'react-native-web': '0.21.3',
    },
  };
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

/*** Generate nested group, index, dynamic, catch-all, and Headless Tabs routes into the Expo 57 consumer. */
function writeConsumerNavigatorFiles(): void {
  const result = generateNavigator(
    createNavigatorPlan(
      {
        type: 'stack',
        initialRouteName: 'application',
        routes: [
          {
            name: 'application',
            expoRouterPath: '(app)',
            navigator: {
              type: 'tabs',
              implementation: 'headless',
              presentation: 'bottom',
              initialRouteName: 'training',
              routes: [
                {
                  name: 'training',
                  path: '/training-setup',
                  expoRouterPath: '(train)',
                  navigator: {
                    type: 'stack',
                    initialRouteName: 'training-setup',
                    routes: [
                      {
                        name: 'training-setup',
                        path: '/training-setup',
                        expoRouterPath: 'training-setup/index',
                        screenId: 'example',
                      },
                      {
                        name: 'training-table-size',
                        path: '/training-setup/table',
                        expoRouterPath: 'training-setup/table',
                        screenId: 'example',
                      },
                      {
                        name: 'article',
                        path: '/articles/42',
                        expoRouterPath: 'articles/[id]',
                        screenId: 'example',
                      },
                      {
                        name: 'documentation',
                        path: '/docs/a/b',
                        expoRouterPath: 'docs/[...slug]',
                        screenId: 'example',
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
      { expoRouterVersion: '57.0.24', platform: 'web' },
    ),
    {
      guards: {},
      screens: { example: { module: '@/screens/example-screen', exportName: 'ExampleScreen' } },
    },
  );
  if (result.diagnostics.length > 0) {
    throw new Error(
      `Generated Expo 57 consumer has diagnostics: ${JSON.stringify(result.diagnostics)}.`,
    );
  }
  const paths = result.files.map(({ path }) => path);
  for (const expectedPath of [
    'src/app/(app)/(train)/training-setup/index.tsx',
    'src/app/(app)/(train)/training-setup/table.tsx',
    'src/app/(app)/(train)/articles/[id].tsx',
    'src/app/(app)/(train)/docs/[...slug].tsx',
  ]) {
    if (!paths.includes(expectedPath)) {
      throw new Error(`Generated Expo 57 consumer is missing ${JSON.stringify(expectedPath)}.`);
    }
  }
  for (const file of result.files) {
    const destination = resolve(consumerRoot, file.path);
    mkdirSync(dirname(destination), { recursive: true });
    writeFileSync(destination, file.contents);
  }
}

/*** Install or execute inside the isolated consumer without peer-resolution bypasses. */
function runConsumerNpmCommand(args: readonly string[]): void {
  runCommand(['npm', ...args], consumerRoot);
}

/*** Verify npm selected the published platform packages and one matching React pair. */
function verifyResolvedPlatform(): void {
  const packageVersion = (packageName: string) => {
    const manifestPath = resolve(
      consumerRoot,
      'node_modules',
      ...packageName.split('/'),
      'package.json',
    );
    return (JSON.parse(readFileSync(manifestPath, 'utf8')) as { version: string }).version;
  };

  const resolved = {
    expoRuntime: packageVersion('@ankhorage/expo-runtime'),
    react: packageVersion('react'),
    reactDom: packageVersion('react-dom'),
    surface: packageVersion('@ankhorage/surface'),
  };
  const expected = {
    expoRuntime: '7.0.2',
    react: '19.2.3',
    reactDom: '19.2.3',
    surface: '9.4.6',
  };
  if (JSON.stringify(resolved) !== JSON.stringify(expected)) {
    throw new Error(
      `npm resolved an incompatible Expo SDK 57 platform: ${JSON.stringify(resolved)}.`,
    );
  }
}

/*** Prove generated nested routes hydrate, navigate, and retain browser history in Chromium. */
async function verifyGeneratedNavigationAsync(): Promise<void> {
  const server = createStaticServer(resolve(consumerRoot, 'dist/web'));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { height: 768, width: 1024 } });
  const errors: string[] = [];
  const runtimeExceptions: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  const session = await page.context().newCDPSession(page);
  session.on('Runtime.exceptionThrown', ({ exceptionDetails }) => {
    runtimeExceptions.push(exceptionDetails.exception?.description ?? exceptionDetails.text);
  });
  await session.send('Runtime.enable');
  const origin = `http://127.0.0.1:${server.port}`;
  try {
    await openRouteAsync(page, origin, '/training-setup');
    await page.getByTestId('navigator-tabs-item-(train)').click();
    await assertRouteAsync(page, '/training-setup');
    await page.getByRole('link', { name: 'Training table' }).click();
    await assertRouteAsync(page, '/training-setup/table');
    await page.goBack({ waitUntil: 'networkidle' });
    await assertRouteAsync(page, '/training-setup');
    await page.goForward({ waitUntil: 'networkidle' });
    await assertRouteAsync(page, '/training-setup/table');
    await page.getByRole('link', { name: 'Article 42' }).last().click();
    await assertRouteAsync(page, '/articles/42');
    await page.getByRole('link', { name: 'Documentation' }).last().click();
    await assertRouteAsync(page, '/docs/a/b');
    await assertNoRuntimeFailureAsync(page, errors, runtimeExceptions);
  } finally {
    await session.detach();
    await page.close();
    await browser.close();
    server.stop(true);
  }
}

/*** Directly load one emitted public URL and wait for its hydrated generated screen. */
async function openRouteAsync(page: Page, origin: string, pathname: string): Promise<void> {
  const response = await page.goto(new URL(pathname, origin).href, { waitUntil: 'networkidle' });
  if (response?.status() !== 200) {
    throw new Error(
      `Generated public route ${JSON.stringify(pathname)} returned ${response?.status()}.`,
    );
  }
  await assertRouteAsync(page, pathname);
}

/*** Assert a generated route displays its exact public pathname rather than an empty fallback. */
async function assertRouteAsync(page: Page, pathname: string): Promise<void> {
  await page.getByText(`Generated Navigator route: ${pathname}`, { exact: true }).last().waitFor();
  if ((await page.locator('body').innerText()).trim().length === 0) {
    throw new Error(
      `Generated public route ${JSON.stringify(pathname)} rendered an empty document.`,
    );
  }
}

/*** Reject runtime exceptions and the original NativeStackNavigator failure class. */
async function assertNoRuntimeFailureAsync(
  page: Page,
  errors: readonly string[],
  runtimeExceptions: readonly string[],
): Promise<void> {
  const failures = [...errors, ...runtimeExceptions];
  if (
    failures.some((failure) =>
      /NativeStackNavigator|Couldn't find a screen|Runtime\.exceptionThrown/u.test(failure),
    )
  ) {
    throw new Error(
      `Generated navigation emitted a Navigator runtime failure:\n${failures.join('\n')}`,
    );
  }
  if (failures.length > 0) {
    throw new Error(`Generated navigation emitted browser failures:\n${failures.join('\n')}`);
  }
  if ((await page.locator('body').innerText()).trim().length === 0) {
    throw new Error('Generated navigation ended with an empty document.');
  }
}

/*** Serve the static Expo export using the extensionless URL shape emitted for public routes. */
function createStaticServer(root: string): ReturnType<typeof Bun.serve> {
  return Bun.serve({
    port: 0,
    async fetch(request) {
      const pathname = decodeURIComponent(new URL(request.url).pathname);
      const relativePath = pathname.replace(/^\/+|\/+$/gu, '') || 'index.html';
      const candidates =
        extname(relativePath) === ''
          ? [`${relativePath}.html`, `${relativePath}/index.html`]
          : [relativePath];
      for (const relativeCandidate of candidates) {
        const candidate = resolve(root, relativeCandidate);
        if (!candidate.startsWith(`${root}/`) || !existsSync(candidate)) continue;
        return new Response(Bun.file(candidate), { headers: { 'Cache-Control': 'no-store' } });
      }
      return new Response('Not found', { status: 404 });
    },
  });
}

/*** Run one external command with an isolated npm cache and preserved diagnostics. */
function runCommand(command: readonly string[], cwd: string): void {
  const result = Bun.spawnSync({
    cmd: [...command],
    cwd,
    env: { ...process.env, npm_config_cache: join(tmpdir(), 'navigator-expo-57-npm-cache') },
    stderr: 'inherit',
    stdout: 'inherit',
  });
  if (result.exitCode !== 0) throw new Error(`Command failed: ${command.join(' ')}`);
}
