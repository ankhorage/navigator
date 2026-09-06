import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

import { describe, expect, test } from 'bun:test';

import { NAVIGATOR_PACKAGE_METADATA } from './metadata';

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
    expect(NAVIGATOR_PACKAGE_METADATA.coreAdapters.javascriptStack.module).toBe(
      'expo-router/js-stack',
    );
    expect(NAVIGATOR_PACKAGE_METADATA.optionalAdapters.tabs.support).toBe('unavailable');
  });

  test('never imports the full app manifest into production source', async () => {
    const forbidden = ['App', 'Manifest'].join('');
    const files = await collectProductionTypeScriptFiles(join(process.cwd(), 'src'));
    const contents = await Promise.all(files.map((file) => readFile(file, 'utf8')));

    expect(contents.some((content) => content.includes(forbidden))).toBe(false);
  });
});
