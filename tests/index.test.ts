import type { AppNavigatorManifest } from '@ankhorage/contracts/navigator';
import { describe, expect, test } from 'bun:test';
import ts from 'typescript';

import {
  createNavigatorPlan,
  generateNavigator,
  resolveHeadlessTabsPresentation,
  resolveNavigatorPreset,
  resolveTabsNavigatorPlan,
  validateNavigatorManifest,
} from '../src/navigator';
import { NAVIGATOR_ROUTER_POLICY } from '../src/constants/navigator';
import { EXPO_ROUTER_VERSION, expoRouterVersionBefore } from './routerPolicy';

const SCREEN_BINDINGS = {
  home: { module: '@/screens/home', exportName: 'HomeScreen' },
  settings: { module: '@/screens/settings', exportName: 'SettingsScreen' },
} as const;

const CORE_MANIFEST: AppNavigatorManifest = {
  type: 'stack',
  preset: 'stack-drawer',
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
  test('hides an unnamed Stack group header when that route owns a nested navigator', () => {
    const plan = createNavigatorPlan(
      {
        type: 'stack',
        routes: [
          {
            name: '(tabs)',
            navigator: {
              type: 'tabs',
              implementation: 'headless',
              presentation: 'bottom',
              routes: [{ name: 'home', path: '/', screenId: 'home' }],
            },
          },
        ],
      },
      { expoRouterVersion: EXPO_ROUTER_VERSION, platform: 'web' },
    );
    const layout = generateNavigator(plan, { guards: {}, screens: SCREEN_BINDINGS }).files.find(
      (file) => file.path === 'src/app/_layout.tsx',
    )?.contents;

    expect(layout).toContain('name="(tabs)"');
    expect(layout).toContain('headerShown: false');
  });

  test('resolves every finite preset family', () => {
    expect(resolveNavigatorPreset('slot', 'stack')).toEqual(['slot']);
    expect(resolveNavigatorPreset('stack-tabs-stack', 'tabs')).toEqual(['stack', 'tabs', 'stack']);
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
      { platform: 'web', expoRouterVersion: EXPO_ROUTER_VERSION },
    );
    expect(platformPlan.root.adapter.id).toBe('stack.native');
    expect(platformPlan.root.stack?.implementation).toBe('native');
    expect(platformPlan.support).toBe('supported');

    const defaultPlan = createNavigatorPlan(
      { type: 'stack', routes: [{ name: 'index', screenId: 'home' }] },
      { platform: 'ios', expoRouterVersion: EXPO_ROUTER_VERSION },
    );
    expect(defaultPlan.root.adapter.id).toBe('stack.native');
  });

  test('materializes an authored preset spine without losing root routes', () => {
    const plan = createNavigatorPlan(CORE_MANIFEST, {
      platform: 'web',
      expoRouterVersion: EXPO_ROUTER_VERSION,
    });

    expect(plan.support).toBe('supported');
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
        preset: 'stack-tabs',
        initialRouteName: 'missing',
        routes: [
          { name: 'home', screenId: 'home' },
          { name: 'home', screenId: 'home', navigator: { type: 'slot', routes: [] } },
        ],
      },
      { platform: 'web', expoRouterVersion: EXPO_ROUTER_VERSION },
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
      { platform: 'web', expoRouterVersion: EXPO_ROUTER_VERSION },
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
      {
        platform: 'web',
        expoRouterVersion: expoRouterVersionBefore(
          NAVIGATOR_ROUTER_POLICY.javaScriptStackMinimumMajor,
        ),
      },
    );
    expect(oldJavaScriptStack.some((item) => item.code === 'unsupported-expo-router-version')).toBe(
      true,
    );

    expect(
      validateNavigatorManifest(
        { type: 'custom', navigatorId: 'workspace', routes: [] },
        { platform: 'ios', expoRouterVersion: EXPO_ROUTER_VERSION },
      ).some((item) => item.code === 'unregistered-custom-navigator'),
    ).toBe(true);
  });
});

describe('@ankhorage/navigator deterministic generation', () => {
  test('optionally emits a canonical root redirect and wraps only the root layout', () => {
    const plan = createNavigatorPlan(
      {
        type: 'stack',
        initialRouteName: 'acquisition',
        routes: [
          {
            name: 'acquisition',
            path: '/acquisition',
            expoRouterPath: '(app)/acquisition',
            navigator: {
              type: 'drawer',
              routes: [{ name: 'overview', screenId: 'home' }],
            },
          },
        ],
      },
      { platform: 'web', expoRouterVersion: EXPO_ROUTER_VERSION },
    );

    const result = generateNavigator(
      plan,
      { guards: {}, screens: SCREEN_BINDINGS },
      {
        rootRedirect: true,
        rootLayoutWrapper: {
          module: '@/generated/runtimeShell',
          exportName: 'GeneratedRuntimeShell',
        },
      },
    );

    expect(result.diagnostics).toEqual([]);
    expect(result.files.map(({ path }) => path)).toEqual([
      'src/app/_layout.tsx',
      'src/app/(app)/acquisition/_layout.tsx',
      'src/app/(app)/acquisition/overview.tsx',
      'src/app/index.tsx',
    ]);
    const root = result.files.find(({ path }) => path === 'src/app/_layout.tsx')?.contents ?? '';
    const nested =
      result.files.find(({ path }) => path === 'src/app/(app)/acquisition/_layout.tsx')?.contents ??
      '';
    const redirect = result.files.find(({ path }) => path === 'src/app/index.tsx')?.contents ?? '';
    expect(root).toContain(
      "import { GeneratedRuntimeShell as NavigatorRootLayoutWrapper } from '@/generated/runtimeShell';",
    );
    expect(root).toContain('<NavigatorRootLayoutWrapper>');
    expect(nested).not.toContain('NavigatorRootLayoutWrapper');
    expect(redirect).toContain("<Redirect href='/acquisition' />");
  });

  test('preserves Stack, Tabs, Drawer, and Slot generation unless root output is explicitly requested', () => {
    const manifests: readonly AppNavigatorManifest[] = [
      { type: 'stack', routes: [{ name: 'home', screenId: 'home' }] },
      {
        type: 'tabs',
        implementation: 'javascript',
        presentation: 'bottom',
        routes: [{ name: 'home', path: '/', screenId: 'home' }],
      },
      { type: 'drawer', routes: [{ name: 'home', screenId: 'home' }] },
      { type: 'slot', routes: [{ name: 'home', screenId: 'home' }] },
    ];
    for (const manifest of manifests) {
      const files = generateNavigator(
        createNavigatorPlan(manifest, { platform: 'web', expoRouterVersion: EXPO_ROUTER_VERSION }),
        { guards: {}, screens: SCREEN_BINDINGS },
      ).files;
      expect(files.some(({ path }) => path === 'src/app/index.tsx')).toBe(false);
    }
  });

  test('binds a validated root wrapper across Stack, Tabs, Drawer, and Slot without changing routes', () => {
    const manifests: readonly AppNavigatorManifest[] = [
      { type: 'stack', routes: [{ name: 'home', screenId: 'home' }] },
      {
        type: 'tabs',
        implementation: 'javascript',
        presentation: 'bottom',
        routes: [{ name: 'home', path: '/', screenId: 'home' }],
      },
      { type: 'drawer', routes: [{ name: 'home', screenId: 'home' }] },
      { type: 'slot', routes: [{ name: 'home', screenId: 'home' }] },
    ];
    for (const manifest of manifests) {
      const result = generateNavigator(
        createNavigatorPlan(manifest, { platform: 'web', expoRouterVersion: EXPO_ROUTER_VERSION }),
        { guards: {}, screens: SCREEN_BINDINGS },
        {
          rootLayoutWrapper: {
            module: '@/generated/runtimeShell',
            exportName: 'GeneratedRuntimeShell',
          },
        },
      );
      const root = result.files.find(({ path }) => path === 'src/app/_layout.tsx')?.contents ?? '';
      expect(result.diagnostics.some(({ severity }) => severity === 'error')).toBe(false);
      expect(root).toContain('<NavigatorRootLayoutWrapper>');
      expect(root).toContain('</NavigatorRootLayoutWrapper>');
      expect(root).toContain(manifest.type === 'slot' ? '<Slot />' : 'name="home"');
    }
  });

  test('binds the root wrapper for native and headless Tabs plus Split View layouts', () => {
    const cases: readonly {
      manifest: AppNavigatorManifest;
      platform: 'ios' | 'web';
    }[] = [
      {
        platform: 'ios',
        manifest: {
          type: 'tabs',
          implementation: 'native',
          routes: [{ name: 'home', icon: { name: 'home' }, screenId: 'home' }],
        },
      },
      {
        platform: 'web',
        manifest: {
          type: 'tabs',
          implementation: 'headless',
          presentation: 'bottom',
          routes: [{ name: 'home', path: '/', screenId: 'home' }],
        },
      },
      {
        platform: 'ios',
        manifest: {
          type: 'split-view',
          columns: { primary: { screenId: 'home' } },
          routes: [{ name: 'home', screenId: 'home' }],
        },
      },
    ];
    for (const { manifest, platform } of cases) {
      const result = generateNavigator(
        createNavigatorPlan(manifest, { platform, expoRouterVersion: EXPO_ROUTER_VERSION }),
        { guards: {}, screens: SCREEN_BINDINGS },
        {
          rootLayoutWrapper: {
            module: '@/generated/runtimeShell',
            exportName: 'GeneratedRuntimeShell',
          },
        },
      );
      const root = result.files.find(({ path }) => path === 'src/app/_layout.tsx')?.contents ?? '';
      expect(result.diagnostics.some(({ severity }) => severity === 'error')).toBe(false);
      expect(root).toContain('<NavigatorRootLayoutWrapper>');
      expect(root).toContain('</NavigatorRootLayoutWrapper>');
    }
  });

  test('rejects root redirect output that lacks an initial target or overwrites an index route', () => {
    const noInitial = generateNavigator(
      createNavigatorPlan(
        { type: 'stack', routes: [{ name: 'home', screenId: 'home' }] },
        { platform: 'web', expoRouterVersion: EXPO_ROUTER_VERSION },
      ),
      { guards: {}, screens: SCREEN_BINDINGS },
      { rootRedirect: true },
    );
    expect(noInitial.files).toEqual([]);
    expect(noInitial.diagnostics.map(({ code }) => code)).toContain('missing-root-redirect-target');

    const indexConflict = generateNavigator(
      createNavigatorPlan(
        {
          type: 'stack',
          initialRouteName: 'home',
          routes: [
            { name: 'index', screenId: 'home' },
            { name: 'home', path: '/home', screenId: 'home' },
          ],
        },
        { platform: 'web', expoRouterVersion: EXPO_ROUTER_VERSION },
      ),
      { guards: {}, screens: SCREEN_BINDINGS },
      { rootRedirect: true },
    );
    expect(indexConflict.files).toEqual([]);
    expect(indexConflict.diagnostics.map(({ code }) => code)).toContain(
      'root-redirect-index-conflict',
    );

    const missingPublicPath = generateNavigator(
      createNavigatorPlan(
        {
          type: 'stack',
          initialRouteName: 'home',
          routes: [{ name: 'home', expoRouterPath: '(private)/home', screenId: 'home' }],
        },
        { platform: 'web', expoRouterVersion: EXPO_ROUTER_VERSION },
      ),
      { guards: {}, screens: SCREEN_BINDINGS },
      { rootRedirect: true },
    );
    expect(missingPublicPath.files).toEqual([]);
    expect(missingPublicPath.diagnostics.map(({ code }) => code)).toContain(
      'missing-root-redirect-public-path',
    );
  });

  test('validates the static root layout wrapper binding', () => {
    const result = generateNavigator(
      createNavigatorPlan(
        { type: 'slot', routes: [{ name: 'home', screenId: 'home' }] },
        { platform: 'web', expoRouterVersion: EXPO_ROUTER_VERSION },
      ),
      { guards: {}, screens: SCREEN_BINDINGS },
      {
        rootLayoutWrapper: { module: '@/generated/runtime', exportName: 'RuntimeShell;evil' },
      },
    );
    expect(result.files).toEqual([]);
    expect(result.diagnostics.map(({ code }) => code)).toContain('invalid-module-binding');
  });

  test('keeps semantic names and public URLs while generating nested Expo Router module paths', () => {
    const plan = createNavigatorPlan(
      {
        type: 'stack',
        initialRouteName: 'training-setup',
        routes: [
          {
            name: 'training-setup',
            path: '/training-setup',
            expoRouterPath: 'training-setup/index',
            screenId: 'home',
          },
          {
            name: 'training-table-size',
            path: '/training-setup/table',
            expoRouterPath: 'training-setup/table',
            screenId: 'home',
          },
          {
            name: 'training-article',
            path: '/articles/42',
            expoRouterPath: '(content)/articles/[id]',
            screenId: 'home',
          },
          {
            name: 'training-catch-all',
            path: '/docs/a/b',
            expoRouterPath: 'docs/[...slug]',
            screenId: 'home',
          },
        ],
      },
      { platform: 'web', expoRouterVersion: EXPO_ROUTER_VERSION },
    );
    const result = generateNavigator(plan, { guards: {}, screens: SCREEN_BINDINGS });
    const root = result.files.find((file) => file.path === 'src/app/_layout.tsx')?.contents ?? '';

    expect(
      plan.root.routes.map(({ name, path, expoRouterPath }) => ({ name, path, expoRouterPath })),
    ).toEqual([
      {
        name: 'training-setup',
        path: '/training-setup',
        expoRouterPath: 'training-setup/index',
      },
      {
        name: 'training-table-size',
        path: '/training-setup/table',
        expoRouterPath: 'training-setup/table',
      },
      {
        name: 'training-article',
        path: '/articles/42',
        expoRouterPath: '(content)/articles/[id]',
      },
      {
        name: 'training-catch-all',
        path: '/docs/a/b',
        expoRouterPath: 'docs/[...slug]',
      },
    ]);
    expect(result.files.map(({ path }) => path)).toEqual([
      'src/app/_layout.tsx',
      'src/app/(content)/articles/[id].tsx',
      'src/app/docs/[...slug].tsx',
      'src/app/training-setup/index.tsx',
      'src/app/training-setup/table.tsx',
    ]);
    expect(root).toContain('initialRouteName="training-setup/index"');
    expect(root).toContain('<Stack.Screen name="training-setup/index" />');
    expect(root).toContain('<Stack.Screen name="training-setup/table" />');
    expect(root).toContain('<Stack.Screen name="(content)/articles/[id]" />');
    expect(root).toContain('<Stack.Screen name="docs/[...slug]" />');
  });

  test('generates nested layouts, guarded screens and a typed hidden Drawer route', () => {
    const plan = createNavigatorPlan(CORE_MANIFEST, {
      platform: 'web',
      expoRouterVersion: EXPO_ROUTER_VERSION,
    });
    const bindings = {
      screens: SCREEN_BINDINGS,
      guards: {
        authenticated: { module: '@/navigation/guards', exportName: 'isAuthenticated' },
      },
    } as const;
    const first = generateNavigator(plan, bindings);
    const second = generateNavigator(plan, bindings);

    expect(second).toEqual(first);
    expect(first.support).toBe('supported');
    expect(first.capabilityIds).toEqual(['drawer', 'stack.javascript']);
    expect(first.dependencies.map(({ packageName }) => packageName)).toEqual(['expo-router']);
    expect(first.files.map((file) => file.path)).toEqual([
      'src/app/_layout.tsx',
      'src/app/(app)/_layout.tsx',
      'src/app/(app)/home.tsx',
      'src/app/(app)/settings.tsx',
      'src/app/index.tsx',
    ]);
    const root = first.files.find((file) => file.path === 'src/app/_layout.tsx')?.contents ?? '';
    const drawer =
      first.files.find((file) => file.path === 'src/app/(app)/_layout.tsx')?.contents ?? '';
    expect(root).toContain("from 'expo-router/js-stack'");
    expect(root).toContain('initialRouteName="(app)"');
    expect(root).toContain('<Stack.Protected guard={navigatorGuard0()}>');
    expect(drawer).toContain("drawerItemStyle: { display: 'none' }");
    expect(first.files.at(-1)?.contents).toBe(
      "export { HomeScreen as default } from '@/screens/home';\n",
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
      const files = generateNavigator(
        createNavigatorPlan(manifest, { platform, expoRouterVersion: EXPO_ROUTER_VERSION }),
        { screens: SCREEN_BINDINGS, guards: {} },
      ).files;
      for (const file of files) {
        const result = ts.transpileModule(file.contents, {
          compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext },
          reportDiagnostics: true,
        });
        expect(result.diagnostics ?? []).toEqual([]);
      }
    }
  });

  test('reports native Drawer application dependencies from owner policy', () => {
    const plan = createNavigatorPlan(
      { type: 'drawer', routes: [{ name: 'index', screenId: 'home' }] },
      { platform: 'android', expoRouterVersion: EXPO_ROUTER_VERSION },
    );

    expect(plan.dependencies.map(({ packageName }) => packageName)).toEqual([
      'expo-router',
      'react-native-gesture-handler',
      'react-native-reanimated',
      'react-native-worklets',
    ]);
  });
});

describe('@ankhorage/navigator generation safety', () => {
  test('returns structured diagnostics for invalid narrow module bindings', () => {
    const plan = createNavigatorPlan(
      { type: 'stack', routes: [{ name: 'home', screenId: 'home' }] },
      { platform: 'ios', expoRouterVersion: EXPO_ROUTER_VERSION },
    );
    const result = generateNavigator(plan, {
      screens: { home: { module: "safe'; alert(1); //", exportName: 'HomeScreen' } },
      guards: {},
    });

    expect(result.files).toEqual([]);
    expect(result.diagnostics.map(({ code }) => code)).toContain('invalid-module-binding');
  });

  test('blocks generation when semantic validation fails', () => {
    const plan = createNavigatorPlan(
      { type: 'tabs', routes: [{ name: 'home', screenId: 'home' }] },
      { platform: 'web', expoRouterVersion: EXPO_ROUTER_VERSION },
    );
    const result = generateNavigator(plan, { screens: SCREEN_BINDINGS, guards: {} });
    expect(result.support).toBe('unsupported');
    expect(result.files).toEqual([]);
    expect(result.diagnostics.map(({ code }) => code)).toContain('missing-tabs-path');
  });

  test('rejects traversal from disposable Expo Router paths at the generation boundary', () => {
    const plan = createNavigatorPlan(
      { type: 'stack', routes: [{ name: 'home', screenId: 'home' }] },
      { platform: 'web', expoRouterVersion: EXPO_ROUTER_VERSION },
    );
    (plan.root.routes[0] as { expoRouterPath?: string }).expoRouterPath = '../outside';
    expect(() => generateNavigator(plan, { screens: SCREEN_BINDINGS, guards: {} })).toThrow(
      'safe relative module path',
    );
  });

  test('reports invalid authored Expo Router traversal paths before generation', () => {
    const plan = createNavigatorPlan(
      {
        type: 'stack',
        routes: [{ name: 'settings', expoRouterPath: '../settings', screenId: 'home' }],
      },
      { platform: 'web', expoRouterVersion: EXPO_ROUTER_VERSION },
    );

    expect(plan.support).toBe('unsupported');
    expect(plan.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'invalid-expo-router-path',
        path: '/routes/0/expoRouterPath',
      }),
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
        { implementation: 'headless', presentation: 'sidebar' },
        'web',
        'expanded',
      ).module,
    ).toBe('expo-router/ui');
  });

  test('resolves registered and responsive Headless Tabs presentations deterministically', () => {
    expect(
      resolveHeadlessTabsPresentation(
        { presentation: 'custom', customPresentationId: 'workspace-tabs' },
        'expanded',
      ),
    ).toEqual({ presentation: 'custom', customPresentationId: 'workspace-tabs' });
    expect(
      resolveHeadlessTabsPresentation(
        {
          presentation: 'responsive',
          responsive: { compact: 'bottom', expanded: 'sidebar' },
        },
        'medium',
      ).presentation,
    ).toBe('sidebar');
  });
});
