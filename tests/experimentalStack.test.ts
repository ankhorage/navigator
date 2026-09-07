import type {
  AppNavigatorManifest,
  StackImplementationConfig,
} from '@ankhorage/contracts/navigator';
import { describe, expect, test } from 'bun:test';

import { createNavigatorPlan, validateNavigatorManifest } from '../src/navigator';
import { NAVIGATOR_PACKAGE_METADATA } from '../src/utils/NAVIGATOR_PACKAGE_METADATA';
import { NAVIGATOR_ROUTER_POLICY } from '../src/utils/NAVIGATOR_ROUTER_POLICY';
import { generateFiles } from './generateFiles';
import { EXPO_ROUTER_VERSION, expoRouterVersionBefore } from './routerPolicy';

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
      expoRouterVersion: EXPO_ROUTER_VERSION,
    });
    expect(ios.support).toBe('testing-only');
    expect(ios.root.adapter).toMatchObject({
      id: 'stack.experimental',
      module: 'expo-router',
      exportName: 'ExperimentalStack',
      support: 'testing-only',
      stability: 'alpha',
    });

    const web = createNavigatorPlan(EXPERIMENTAL_MANIFEST, {
      platform: 'web',
      expoRouterVersion: EXPO_ROUTER_VERSION,
    });
    expect(web.support).toBe('unsupported');
    expect(web.root.adapter.limitations).toContain(
      'Testing-only API; Expo Router falls back to the standard Stack on web.',
    );
    expect(
      NAVIGATOR_PACKAGE_METADATA.catalog.capabilities
        .find(({ id }) => id === 'stack.experimental')
        ?.targets.find(({ platform }) => platform === 'web')?.support,
    ).toBe('unsupported');
  });

  test('requires the owner-declared minimum Expo Router version', () => {
    const plan = createNavigatorPlan(EXPERIMENTAL_MANIFEST, {
      platform: 'ios',
      expoRouterVersion: expoRouterVersionBefore(
        NAVIGATOR_ROUTER_POLICY.experimentalStackMinimumMajor,
      ),
    });
    expect(plan.support).toBe('unsupported');
    expect(diagnosticKeys(plan.diagnostics)).toContain(
      'unsupported-expo-router-version:/implementation:error',
    );
  });
});

describe('@ankhorage/navigator Experimental Stack validation', () => {
  test('reports the Android predictive-back requirement without mutating app config', () => {
    const plan = createNavigatorPlan(EXPERIMENTAL_MANIFEST, {
      platform: 'android',
      expoRouterVersion: EXPO_ROUTER_VERSION,
    });
    expect(plan.support).toBe('testing-only');
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
      expoRouterVersion: EXPO_ROUTER_VERSION,
    });
    expect(
      androidDiagnostics.some(({ code }) => code === 'mixed-android-stack-implementations'),
    ).toBe(true);
    expect(
      validateNavigatorManifest(mixed, {
        platform: 'ios',
        expoRouterVersion: EXPO_ROUTER_VERSION,
      }).some(({ code }) => code === 'mixed-android-stack-implementations'),
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
      expoRouterVersion: EXPO_ROUTER_VERSION,
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
      { platform: 'ios', expoRouterVersion: EXPO_ROUTER_VERSION },
    );
    const layout =
      generateFiles(plan, {
        screens: SCREENS,
        guards: {
          authenticated: { module: '@/navigation/guards', exportName: 'isAuthenticated' },
        },
      }).find(({ path }) => path === 'src/app/_layout.tsx')?.contents ?? '';

    expect(layout).toContain("import { ExperimentalStack } from 'expo-router';");
    expect(layout).toContain('<ExperimentalStack screenOptions={{ headerShown: true }}>');
    expect(layout).toContain('<ExperimentalStack.Protected guard={navigatorGuard0()}>');
    expect(layout).toContain("title: 'Home'");
  });
});
