import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

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
  runConsumerNpmCommand(['install']);
  verifyResolvedPlatform();
  runConsumerNpmCommand(['run', 'typecheck']);
  runConsumerNpmCommand(['run', 'export:web']);
} finally {
  rmSync(consumerRoot, { force: true, recursive: true });
}

console.log(
  '\nVerified the Expo SDK 57 npm consumer peer contract and Headless Tabs Web execution.',
);

/*** Pack the current Navigator artifact for an isolated npm consumer. */
function packNavigator(): void {
  runCommand(
    ['npm', 'pack', '--ignore-scripts', '--pack-destination', consumerRoot],
    repositoryRoot,
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
