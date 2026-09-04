import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

import type { AppNavigatorManifest } from '@ankhorage/contracts/navigator';
import { describe, expect, test } from 'bun:test';

import {
  createNavigatorPlan,
  resolveCustomTabsPresentation,
  resolveNavigatorPreset,
  resolveTabsNavigatorPlan,
} from './index';
import { NAVIGATOR_PACKAGE_METADATA } from './metadata';

const ADAPTIVE_TABS: AppNavigatorManifest = {
  type: 'tabs',
  preset: 'root-stack-tabs-stack',
  routes: [{ name: 'home', path: '/', screenId: 'home' }],
};

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

describe('@ankhorage/navigator topology planning', () => {
  test('resolves canonical topology presets without changing the manifest tree', () => {
    expect(resolveNavigatorPreset('root-stack-tabs-stack', 'tabs')).toEqual([
      'stack',
      'tabs',
      'stack',
    ]);
  });

  test('creates a plan from only the navigator manifest slice', () => {
    const plan = createNavigatorPlan(ADAPTIVE_TABS, { platform: 'web', responsiveSize: 'medium' });

    expect(plan.presetLayers).toEqual(['stack', 'tabs', 'stack']);
    expect(plan.root.type).toBe('tabs');
    expect(plan.root.tabs?.implementation).toBe('custom');
    expect(plan.root.tabs?.presentation).toBe('rail');
  });
});

describe('@ankhorage/navigator tabs planning', () => {
  test('uses native unstable tabs for adaptive Android and iOS', () => {
    for (const platform of ['android', 'ios'] as const) {
      expect(resolveTabsNavigatorPlan(undefined, platform, 'compact')).toEqual({
        implementation: 'native',
        module: 'expo-router/unstable-native-tabs',
        exportName: 'NativeTabs',
        stability: 'unstable',
      });
    }
  });

  test('uses headless custom tabs on Web with responsive defaults', () => {
    expect(resolveTabsNavigatorPlan(undefined, 'web', 'compact').presentation).toBe('bottom');
    expect(resolveTabsNavigatorPlan(undefined, 'web', 'medium').presentation).toBe('rail');
    expect(resolveTabsNavigatorPlan(undefined, 'web', 'expanded').presentation).toBe('sidebar');
  });

  test('preserves Web config when adaptive implementation is omitted', () => {
    const plan = resolveTabsNavigatorPlan(
      {
        web: {
          presentation: 'responsive',
          responsive: { compact: 'top', expanded: 'sidebar' },
        },
      },
      'web',
      'compact',
    );

    expect(plan.presentation).toBe('top');
  });

  test('maps JavaScript bottom and top tabs to their stable Router entry points', () => {
    expect(resolveTabsNavigatorPlan({ implementation: 'javascript' }, 'web', 'compact').module).toBe(
      'expo-router/js-tabs',
    );
    expect(
      resolveTabsNavigatorPlan(
        { implementation: 'javascript', presentation: 'top' },
        'web',
        'compact',
      ).module,
    ).toBe('expo-router/js-top-tabs');
  });

  test('rejects explicit native tabs for Web', () => {
    expect(() =>
      resolveTabsNavigatorPlan({ implementation: 'native' }, 'web', 'compact'),
    ).toThrow('Native tabs are not available');
  });
});

describe('@ankhorage/navigator custom presentation', () => {
  test('resolves registered custom presentations without embedding a renderer', () => {
    expect(
      resolveCustomTabsPresentation(
        { presentation: 'custom', customPresentationId: 'workspace-tabs' },
        'expanded',
      ),
    ).toEqual({ presentation: 'custom', customPresentationId: 'workspace-tabs' });
  });

  test('uses expanded presentation when a responsive medium override is omitted', () => {
    expect(
      resolveCustomTabsPresentation(
        {
          presentation: 'responsive',
          responsive: { compact: 'bottom', expanded: 'sidebar' },
        },
        'medium',
      ).presentation,
    ).toBe('sidebar');
  });
});

describe('@ankhorage/navigator package boundary', () => {
  test('publishes manifest-authoring metadata for the standalone capability', () => {
    expect(NAVIGATOR_PACKAGE_METADATA.packageName).toBe('@ankhorage/navigator');
    expect(NAVIGATOR_PACKAGE_METADATA.manifestProperty).toBe('navigator');
    expect(NAVIGATOR_PACKAGE_METADATA.tabs.adaptiveDefault.webResponsive.medium).toBe('rail');
  });

  test('never imports the full app manifest into production source', async () => {
    const forbidden = ['App', 'Manifest'].join('');
    const files = await collectProductionTypeScriptFiles(join(process.cwd(), 'src'));
    const contents = await Promise.all(files.map((file) => readFile(file, 'utf8')));

    expect(contents.some((content) => content.includes(forbidden))).toBe(false);
  });
});
