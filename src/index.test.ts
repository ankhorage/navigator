import type { AppNavigatorManifest } from '@ankhorage/contracts/navigator';
import { describe, expect, test } from 'bun:test';
import ts from 'typescript';

import {
  createNavigatorPlan,
  generateNavigatorFiles,
  resolveCustomTabsPresentation,
  resolveNavigatorPreset,
  resolveTabsNavigatorPlan,
  validateNavigatorManifest,
} from './index';

const SCREEN_BINDINGS = {
  home: { module: '@/screens/home', exportName: 'HomeScreen' },
  settings: { module: '@/screens/settings', exportName: 'SettingsScreen' },
} as const;

const CORE_MANIFEST: AppNavigatorManifest = {
  type: 'stack',
  preset: 'root-stack-drawer',
  initialRouteName: '(app)',
  implementation: 'javascript',
  options: { headerShown: false },
  routes: [
    { name: 'index', path: '/', screenId: 'home' },
    {
      name: '(app)',
      path: '/app',
      guards: ['authenticated'],
      navigator: {
        type: 'drawer',
        initialRouteName: 'home',
        options: { drawerPosition: 'left' },
        routes: [
          { name: 'home', label: 'Home', screenId: 'home' },
          {
            name: 'settings',
            label: 'Settings',
            showInPrimaryNavigation: false,
            screenId: 'settings',
          },
        ],
      },
    },
  ],
};

describe('@ankhorage/navigator topology and validation', () => {
  test('resolves every finite preset family', () => {
    expect(resolveNavigatorPreset('slot', 'stack')).toEqual(['slot']);
    expect(resolveNavigatorPreset('root-stack-tabs-stack', 'tabs')).toEqual([
      'stack',
      'tabs',
      'stack',
    ]);
    expect(resolveNavigatorPreset('split-view', 'stack')).toEqual(['split-view']);
    expect(resolveNavigatorPreset('custom', 'stack')).toEqual(['custom']);
  });

  test('uses platform, node, manifest default, then stable default precedence', () => {
    const platformPlan = createNavigatorPlan(
      {
        ...CORE_MANIFEST,
        defaults: { stack: { implementation: 'experimental' } },
        platforms: { web: { stack: { implementation: 'native' } } },
      },
      { platform: 'web', expoRouterVersion: '56.0.0' },
    );
    expect(platformPlan.root.adapter.id).toBe('stack.native');
    expect(platformPlan.root.stack?.implementation).toBe('native');
    expect(platformPlan.supported).toBe(true);

    const defaultPlan = createNavigatorPlan(
      { type: 'stack', routes: [{ name: 'index', screenId: 'home' }] },
      { platform: 'ios', expoRouterVersion: '56.0.0' },
    );
    expect(defaultPlan.root.adapter.id).toBe('stack.native');
  });

  test('materializes an authored preset spine without losing root routes', () => {
    const plan = createNavigatorPlan(CORE_MANIFEST, {
      platform: 'web',
      expoRouterVersion: '56.0.0',
    });

    expect(plan.supported).toBe(true);
    expect(plan.diagnostics).toEqual([]);
    expect(plan.root.routes.map((route) => route.name)).toEqual(['index', '(app)']);
    expect(plan.root.routes[1]?.navigator?.type).toBe('drawer');
    expect(plan.root.routes[1]?.guards).toEqual(['authenticated']);
    expect(plan.root.routes[1]?.path).toBe('/app');
  });
});

describe('@ankhorage/navigator structural diagnostics', () => {
  test('rejects contradictory preset authorship and invalid local route structure', () => {
    const diagnostics = validateNavigatorManifest(
      {
        type: 'tabs',
        preset: 'root-stack-tabs',
        initialRouteName: 'missing',
        routes: [
          { name: 'home', screenId: 'home' },
          { name: 'home', screenId: 'home', navigator: { type: 'slot', routes: [] } },
        ],
      },
      { platform: 'web', expoRouterVersion: '56.0.0' },
    );

    const codes = diagnostics.map((diagnostic) => diagnostic.code);
    for (const code of [
      'duplicate-route-name',
      'invalid-route-target',
      'missing-tabs-path',
      'preset-topology-mismatch',
      'unknown-initial-route',
    ]) {
      expect(codes).toContain(code);
    }
  });

  test('rejects native-only route options after JavaScript Stack precedence resolves', () => {
    const diagnostics = validateNavigatorManifest(
      {
        type: 'stack',
        routes: [{ name: 'sheet', screenId: 'home', stackOptions: { presentation: 'formSheet' } }],
        platforms: { web: { stack: { implementation: 'javascript' } } },
      },
      { platform: 'web', expoRouterVersion: '56.0.0' },
    );
    expect(diagnostics.some((item) => item.code === 'unsupported-stack-option')).toBe(true);
  });
});

describe('@ankhorage/navigator adapter diagnostics', () => {
  test('reports optional or version-gated adapters before generation', () => {
    const oldJavaScriptStack = validateNavigatorManifest(
      {
        type: 'stack',
        implementation: 'javascript',
        routes: [{ name: 'index', screenId: 'home' }],
      },
      { platform: 'web', expoRouterVersion: '55.0.0' },
    );
    expect(oldJavaScriptStack.some((item) => item.code === 'unsupported-expo-router-version')).toBe(
      true,
    );

    for (const manifest of [
      { type: 'split-view', columns: { primary: { screenId: 'home' } }, routes: [] },
      { type: 'custom', navigatorId: 'workspace', routes: [] },
    ] as const satisfies readonly AppNavigatorManifest[]) {
      expect(
        validateNavigatorManifest(manifest, {
          platform: 'ios',
          expoRouterVersion: '56.0.0',
        }).some((item) => item.code === 'adapter-unavailable'),
      ).toBe(true);
    }
  });
});

describe('@ankhorage/navigator deterministic generation', () => {
  test('generates nested layouts, guarded screens and a typed hidden Drawer route', () => {
    const plan = createNavigatorPlan(CORE_MANIFEST, {
      platform: 'web',
      expoRouterVersion: '56.0.0',
    });
    const bindings = {
      screens: SCREEN_BINDINGS,
      guards: {
        authenticated: { module: '@/navigation/guards', exportName: 'isAuthenticated' },
      },
    } as const;
    const first = generateNavigatorFiles(plan, bindings);
    const second = generateNavigatorFiles(plan, bindings);

    expect(second).toEqual(first);
    expect(first.map((file) => file.path)).toEqual([
      'src/app/_layout.tsx',
      'src/app/(app)/_layout.tsx',
      'src/app/(app)/home.tsx',
      'src/app/(app)/settings.tsx',
      'src/app/index.tsx',
    ]);
    const root = first.find((file) => file.path === 'src/app/_layout.tsx')?.contents ?? '';
    const drawer = first.find((file) => file.path === 'src/app/(app)/_layout.tsx')?.contents ?? '';
    expect(root).toContain('from "expo-router/js-stack"');
    expect(root).toContain('initialRouteName="(app)"');
    expect(root).toContain('<Stack.Protected guard={navigatorGuard0()}>');
    expect(drawer).toContain('"drawerItemStyle":{"display":"none"}');
    expect(first.at(-1)?.contents).toBe(
      'export { HomeScreen as default } from "@/screens/home";\n',
    );
  });
});

describe('@ankhorage/navigator generated core fixtures', () => {
  test('produces syntactically valid core fixtures for Android, iOS and web', () => {
    const manifests: readonly [AppNavigatorManifest, 'android' | 'ios' | 'web'][] = [
      [{ type: 'drawer', routes: [{ name: 'index', screenId: 'home' }] }, 'android'],
      [{ type: 'stack', routes: [{ name: 'index', screenId: 'home' }] }, 'ios'],
      [
        {
          type: 'stack',
          implementation: 'javascript',
          routes: [{ name: 'index', screenId: 'home' }],
        },
        'web',
      ],
    ];

    for (const [manifest, platform] of manifests) {
      const files = generateNavigatorFiles(
        createNavigatorPlan(manifest, { platform, expoRouterVersion: '56.0.0' }),
        { screens: SCREEN_BINDINGS, guards: {} },
      );
      for (const file of files) {
        const result = ts.transpileModule(file.contents, {
          compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext },
          reportDiagnostics: true,
        });
        expect(result.diagnostics ?? []).toEqual([]);
      }
    }
  });
});

describe('@ankhorage/navigator generation safety', () => {
  test('validates module bindings and required flow route identifiers', () => {
    const flowPlan = createNavigatorPlan(
      {
        type: 'stack',
        routes: [{ name: 'sign-in', screenId: 'home' }],
        flows: { authentication: true },
      },
      { platform: 'ios', expoRouterVersion: '56.0.0' },
    );
    expect(() =>
      generateNavigatorFiles(flowPlan, { screens: SCREEN_BINDINGS, guards: {} }),
    ).toThrow('Missing authentication flow-route binding');
    expect(() =>
      generateNavigatorFiles(flowPlan, {
        screens: { home: { module: "safe'; alert(1); //", exportName: 'HomeScreen' } },
        guards: {},
        flows: { authenticationRoute: 'sign-in' },
      }),
    ).toThrow('unsafe module specifier');
  });

  test('blocks generation when semantic validation fails', () => {
    const plan = createNavigatorPlan(
      { type: 'tabs', routes: [{ name: 'home', screenId: 'home' }] },
      { platform: 'web', expoRouterVersion: '56.0.0' },
    );
    expect(() => generateNavigatorFiles(plan, { screens: SCREEN_BINDINGS, guards: {} })).toThrow(
      'unsupported navigator plan',
    );
  });

  test('revalidates file segments from disposable plans at the generation boundary', () => {
    const plan = createNavigatorPlan(
      { type: 'stack', routes: [{ name: 'home', screenId: 'home' }] },
      { platform: 'web', expoRouterVersion: '56.0.0' },
    );
    (plan.root.routes[0] as { name: string }).name = '../outside';
    expect(() => generateNavigatorFiles(plan, { screens: SCREEN_BINDINGS, guards: {} })).toThrow(
      'safe generated file segment',
    );
  });
});

describe('@ankhorage/navigator tabs planning', () => {
  test('keeps adapter resolution available for the separately owned Tabs implementation', () => {
    expect(resolveTabsNavigatorPlan(undefined, 'ios', 'compact')).toEqual({
      implementation: 'native',
      module: 'expo-router/unstable-native-tabs',
      exportName: 'NativeTabs',
      stability: 'alpha',
    });
    expect(
      resolveTabsNavigatorPlan({ implementation: 'javascript' }, 'web', 'compact').module,
    ).toBe('expo-router/js-tabs');
    expect(
      resolveTabsNavigatorPlan(
        { implementation: 'custom', presentation: 'sidebar' },
        'web',
        'expanded',
      ).module,
    ).toBe('expo-router/ui');
  });

  test('resolves registered and responsive custom presentations deterministically', () => {
    expect(
      resolveCustomTabsPresentation(
        { presentation: 'custom', customPresentationId: 'workspace-tabs' },
        'expanded',
      ),
    ).toEqual({ presentation: 'custom', customPresentationId: 'workspace-tabs' });
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
