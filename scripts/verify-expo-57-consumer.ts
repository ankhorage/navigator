import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const repositoryRoot = resolve(import.meta.dir, '..');
const consumerRoot = mkdtempSync(join(tmpdir(), 'navigator-expo-57-consumer-'));
const navigatorVersion = (
  JSON.parse(readFileSync(resolve(repositoryRoot, 'package.json'), 'utf8')) as { version: string }
).version;
const packageArchive = resolve(consumerRoot, `ankhorage-navigator-${navigatorVersion}.tgz`);

try {
  packNavigator();
  writeConsumerManifest();
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
