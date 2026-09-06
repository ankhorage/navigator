import type {
  AppNavigatorManifest,
  StackImplementationConfig,
} from '@ankhorage/contracts/navigator';
import { describe, expect, test } from 'bun:test';

import { createNavigatorPlan, generateNavigatorFiles, validateNavigatorManifest } from './index';
import { NAVIGATOR_PACKAGE_METADATA } from './metadata';

const SCREENS = { home: { module: '@/screens/home', exportName: 'HomeScreen' } } as const;

function diagnosticKeys(
  diagnostics: readonly { code: string; path: string; severity: string }[],
): string[] {
  return diagnostics.map(({ code, path, severity }) => `${code}:${path}:${severity}`);
}

const EXPERIMENTAL_MANIFEST = {
  type: 'stack',
  implementation: 'experimental',
  options: { headerShown: true },
  routes: [{ name: 'home', screenId: 'home', stackOptions: { title: 'Home' } }],
} as const satisfies AppNavigatorManifest;

describe('@ankhorage/navigator Experimental Stack planning', () => {
  test('resolves the testing-only native adapter and explicit web fallback', () => {
    const ios = createNavigatorPlan(EXPERIMENTAL_MANIFEST, {
      platform: 'ios',
      expoRouterVersion: '57.0.18',
    });
    expect(ios.supported).toBe(true);
    expect(ios.root.adapter).toMatchObject({
      id: 'stack.experimental',
      module: 'expo-router',
      exportName: 'ExperimentalStack',
      support: 'supported',
      stability: 'alpha',
    });

    const web = createNavigatorPlan(EXPERIMENTAL_MANIFEST, {
      platform: 'web',
      expoRouterVersion: '57.0.18',
    });
    expect(web.supported).toBe(true);
    expect(web.root.adapter.limitations).toContain(
      'Testing-only API; Expo Router falls back to the standard Stack on web.',
    );
    expect(NAVIGATOR_PACKAGE_METADATA.optionalAdapters.experimentalStack.webFallback).toBe(
      'stack.native',
    );
  });

  test('requires Expo Router 56 or newer', () => {
    const plan = createNavigatorPlan(EXPERIMENTAL_MANIFEST, {
      platform: 'ios',
      expoRouterVersion: '55.0.0',
    });
    expect(plan.supported).toBe(false);
    expect(diagnosticKeys(plan.diagnostics)).toContain(
      'unsupported-expo-router-version:/implementation:error',
    );
  });
});

describe('@ankhorage/navigator Experimental Stack validation', () => {
  test('reports the Android predictive-back requirement without mutating app config', () => {
    const plan = createNavigatorPlan(EXPERIMENTAL_MANIFEST, {
      platform: 'android',
      expoRouterVersion: '57.0.18',
    });
    expect(plan.supported).toBe(true);
    expect(diagnosticKeys(plan.diagnostics)).toContain(
      'android-predictive-back-required:/implementation:warning',
    );
  });

  test('rejects nested native and experimental stacks only on Android', () => {
    const mixed: AppNavigatorManifest = {
      type: 'stack',
      implementation: 'experimental',
      routes: [
        {
          name: 'nested',
          navigator: {
            type: 'stack',
            implementation: 'native',
            routes: [{ name: 'home', screenId: 'home' }],
          },
        },
      ],
    };

    const androidDiagnostics = validateNavigatorManifest(mixed, {
      platform: 'android',
      expoRouterVersion: '57.0.18',
    });
    expect(
      androidDiagnostics.some(({ code }) => code === 'mixed-android-stack-implementations'),
    ).toBe(true);
    expect(
      validateNavigatorManifest(mixed, { platform: 'ios', expoRouterVersion: '57.0.18' }).some(
        ({ code }) => code === 'mixed-android-stack-implementations',
      ),
    ).toBe(false);
  });
});

describe('@ankhorage/navigator Experimental Stack option validation', () => {
  test('rejects route and platform-resolved options that upstream ignores', () => {
    const invalidPlatformConfig = {
      implementation: 'experimental',
      options: { presentation: 'modal' },
    } as unknown as StackImplementationConfig;
    const manifest: AppNavigatorManifest = {
      type: 'stack',
      routes: [
        {
          name: 'home',
          screenId: 'home',
          stackOptions: { presentation: 'formSheet', sheetGrabberVisible: true },
        },
      ],
      platforms: { ios: { stack: invalidPlatformConfig } },
    };
    const diagnostics = validateNavigatorManifest(manifest, {
      platform: 'ios',
      expoRouterVersion: '57.0.18',
    });

    const keys = diagnosticKeys(diagnostics);
    for (const key of [
      'unsupported-experimental-stack-option:/platforms/ios/stack/options/presentation:error',
      'unsupported-experimental-stack-option:/routes/0/stackOptions/sheetGrabberVisible:error',
      'unsupported-experimental-stack-option:/routes/0/stackOptions/presentation:error',
    ]) {
      expect(keys).toContain(key);
    }
  });
});

describe('@ankhorage/navigator Experimental Stack generation', () => {
  test('generates the upstream export with supported options and protected routes', () => {
    const plan = createNavigatorPlan(
      {
        ...EXPERIMENTAL_MANIFEST,
        routes: [{ ...EXPERIMENTAL_MANIFEST.routes[0], guards: ['authenticated'] }],
      },
      { platform: 'ios', expoRouterVersion: '57.0.18' },
    );
    const layout =
      generateNavigatorFiles(plan, {
        screens: SCREENS,
        guards: {
          authenticated: { module: '@/navigation/guards', exportName: 'isAuthenticated' },
        },
      }).find(({ path }) => path === 'src/app/_layout.tsx')?.contents ?? '';

    expect(layout).toContain('import { ExperimentalStack } from "expo-router";');
    expect(layout).toContain('<ExperimentalStack screenOptions={{"headerShown":true}}>');
    expect(layout).toContain('<ExperimentalStack.Protected guard={navigatorGuard0()}>');
    expect(layout).toContain('options={{"title":"Home"}}');
  });
});
