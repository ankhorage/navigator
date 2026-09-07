import type { AppNavigatorManifest } from '@ankhorage/contracts/navigator';
import { describe, expect, test } from 'bun:test';

import { createNavigatorPlan, generateNavigator } from '../src/navigator';
import { generateFiles } from './generateFiles';
import { EXPO_ROUTER_VERSION } from './routerPolicy';

const MANIFEST: AppNavigatorManifest = {
  type: 'stack',
  routes: [
    { name: 'index', screenId: 'home' },
    {
      name: '(app)',
      guards: ['authenticated'],
      navigator: {
        type: 'drawer',
        routes: [{ name: 'settings', screenId: 'settings' }],
      },
    },
  ],
};

describe('@ankhorage/navigator composable generation', () => {
  test('places layout-only output below a consumer-owned app shell', () => {
    const plan = createNavigatorPlan(MANIFEST, {
      platform: 'web',
      expoRouterVersion: EXPO_ROUTER_VERSION,
    });
    const layouts = generateFiles(
      plan,
      {
        screens: {},
        guards: {
          authenticated: { module: '@/navigation/guards', exportName: 'isAuthenticated' },
        },
      },
      { rootDirectory: 'src/app/(generated)', includeScreenFiles: false },
    );

    expect(layouts.map(({ path }) => path)).toEqual([
      'src/app/(generated)/_layout.tsx',
      'src/app/(generated)/(app)/_layout.tsx',
    ]);
    expect(layouts[0]?.contents).toContain(
      "import { Stack } from 'expo-router';\n\nimport { isAuthenticated as navigatorGuard0 } from '@/navigation/guards';",
    );
    expect(layouts[0]?.contents).toContain('<Stack.Protected guard={navigatorGuard0()}>');
    const missingGuard = generateNavigator(
      plan,
      { screens: {}, guards: {} },
      { rootDirectory: 'src/app/(generated)', includeScreenFiles: false },
    );
    expect(missingGuard.files).toEqual([]);
    expect(missingGuard.diagnostics.map(({ code }) => code)).toContain('missing-guard-binding');
  });

  test('rejects output outside safe Expo Router app descendants', () => {
    const plan = createNavigatorPlan(
      { type: 'slot', routes: [{ name: 'index', screenId: 'home' }] },
      { platform: 'web', expoRouterVersion: EXPO_ROUTER_VERSION },
    );

    for (const rootDirectory of ['app', 'src/app/../secrets', '/src/app', 'src/app//nested']) {
      const result = generateNavigator(
        plan,
        { screens: {}, guards: {} },
        { rootDirectory, includeScreenFiles: false },
      );
      expect(result.files).toEqual([]);
      expect(result.diagnostics.map(({ code }) => code)).toContain('invalid-output-directory');
    }
  });
});
