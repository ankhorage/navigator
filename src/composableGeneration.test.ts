import type { AppNavigatorManifest } from '@ankhorage/contracts/navigator';
import { describe, expect, test } from 'bun:test';

import { createNavigatorPlan, generateNavigatorFiles } from './index';

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
      expoRouterVersion: '56.0.0',
    });
    const layouts = generateNavigatorFiles(
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
    expect(layouts[0]?.contents).toContain('<Stack.Protected guard={navigatorGuard0()}>');
    expect(() =>
      generateNavigatorFiles(
        plan,
        { screens: {}, guards: {} },
        { rootDirectory: 'src/app/(generated)', includeScreenFiles: false },
      ),
    ).toThrow('Missing guard binding for "authenticated"');
  });

  test('rejects output outside safe Expo Router app descendants', () => {
    const plan = createNavigatorPlan(
      { type: 'slot', routes: [{ name: 'index', screenId: 'home' }] },
      { platform: 'web', expoRouterVersion: '56.0.0' },
    );

    for (const rootDirectory of ['app', 'src/app/../secrets', '/src/app', 'src/app//nested']) {
      expect(() =>
        generateNavigatorFiles(
          plan,
          { screens: {}, guards: {} },
          { rootDirectory, includeScreenFiles: false },
        ),
      ).toThrow('must be src/app or a safe descendant');
    }
  });
});
