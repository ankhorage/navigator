import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

import { describe, expect, test } from 'bun:test';

import { NAVIGATOR_PACKAGE_METADATA } from '../src/utils/NAVIGATOR_PACKAGE_METADATA';

async function collectProductionTypeScriptFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const full = join(directory, entry.name);
      if (entry.isDirectory()) return collectProductionTypeScriptFiles(full);
      return ['.ts', '.tsx'].includes(extname(entry.name)) && !entry.name.endsWith('.test.ts')
        ? [full]
        : [];
    }),
  );
  return nested.flat();
}

describe('@ankhorage/navigator package boundary', () => {
  test('publishes truthful standalone capability metadata', () => {
    expect(NAVIGATOR_PACKAGE_METADATA.packageName).toBe('@ankhorage/navigator');
    expect(NAVIGATOR_PACKAGE_METADATA.manifestProperty).toBe('navigator');
    expect(NAVIGATOR_PACKAGE_METADATA.precedence).toEqual([
      'platform override',
      'node configuration',
      'manifest default',
      'stable default',
    ]);
    const capabilities = NAVIGATOR_PACKAGE_METADATA.catalog.capabilities;
    expect(capabilities.find(({ id }) => id === 'stack.javascript')).toMatchObject({
      topology: 'stack',
      implementation: 'javascript',
    });
    expect(capabilities.find(({ id }) => id === 'stack.experimental')).toMatchObject({
      topology: 'stack',
      implementation: 'experimental',
      stability: 'alpha',
    });
    expect(capabilities.find(({ id }) => id === 'split-view.three-column')).toMatchObject({
      topology: 'split-view',
      presentation: 'three-column',
      stability: 'alpha',
    });
    expect(capabilities.find(({ id }) => id === 'custom.registered')).toMatchObject({
      topology: 'custom',
      stability: 'stable',
    });
    expect(NAVIGATOR_PACKAGE_METADATA.catalog.presets.find(({ id }) => id === 'drawer')).toEqual({
      id: 'drawer',
      description: 'Drawer root with direct routes and no forced Stack.',
      topology: ['drawer'],
    });
    expect(
      capabilities
        .find(({ id }) => id === 'drawer')
        ?.dependencies.map(({ packageName }) => packageName),
    ).toEqual([
      'expo-router',
      'react-native-gesture-handler',
      'react-native-reanimated',
      'react-native-worklets',
    ]);
  });

  test('keeps capability-owned peer and development ranges synchronized', async () => {
    const packageJson = (await Bun.file(join(process.cwd(), 'package.json')).json()) as {
      readonly devDependencies?: Readonly<Record<string, string>>;
      readonly peerDependencies?: Readonly<Record<string, string>>;
    };

    const surfacePeerRange = packageJson.peerDependencies?.['@ankhorage/surface'];
    expect(surfacePeerRange).toMatch(/^\^\d+\.\d+\.\d+$/u);
    expect(packageJson.devDependencies?.['@ankhorage/surface']).toBe(surfacePeerRange);
    for (const packageName of ['react-dom', 'react-native-safe-area-context']) {
      expect(packageJson.devDependencies?.[packageName]).toBe(
        packageJson.peerDependencies?.[packageName],
      );
    }
  });

  test('never imports the full app manifest into production source', async () => {
    const forbidden = ['App', 'Manifest'].join('');
    const files = await collectProductionTypeScriptFiles(join(process.cwd(), 'src'));
    const contents = await Promise.all(files.map((file) => readFile(file, 'utf8')));

    expect(contents.some((content) => content.includes(forbidden))).toBe(false);
  });
});
