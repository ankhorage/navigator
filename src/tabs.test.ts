import type { AppNavigatorManifest } from '@ankhorage/contracts/navigator';
import { describe, expect, test } from 'bun:test';
import ts from 'typescript';

import { createNavigatorPlan, generateNavigatorFiles, validateNavigatorManifest } from './index';

const screens = {
  accessory: { module: '@/screens/accessory', exportName: 'Accessory' },
  home: { module: '@/screens/home', exportName: 'Home' },
  settings: { module: '@/screens/settings', exportName: 'Settings' },
} as const;

function generatedLayout(manifest: AppNavigatorManifest, platform: 'android' | 'ios' | 'web') {
  const plan = createNavigatorPlan(manifest, { expoRouterVersion: '57.0.18', platform });
  const files = generateNavigatorFiles(plan, { guards: {}, screens });
  const layout = files.find((file) => file.path === 'src/app/_layout.tsx')?.contents;
  if (layout === undefined) throw new Error('Expected generated root layout.');
  expect(
    ts.transpileModule(layout, {
      compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext },
      reportDiagnostics: true,
    }).diagnostics ?? [],
  ).toEqual([]);
  return { layout, plan };
}

describe('@ankhorage/navigator platform tabs generation', () => {
  test('generates Native Tabs triggers, icons, initial route and bottom accessory', () => {
    const { layout, plan } = generatedLayout(
      {
        type: 'tabs',
        implementation: 'native',
        initialRouteName: 'settings',
        minimizeBehavior: 'onScrollDown',
        bottomAccessory: { screenId: 'accessory' },
        routes: [
          { name: 'home', label: 'Home', icon: { name: 'home' }, screenId: 'home' },
          { name: 'settings', label: 'Settings', screenId: 'settings' },
        ],
      },
      'ios',
    );

    expect(plan.supported).toBe(true);
    expect(plan.diagnostics.map((item) => item.code)).toEqual(['alpha-adapter']);
    expect(layout).toContain('from "expo-router/unstable-native-tabs"');
    expect(layout).toContain('unstable_settings = { initialRouteName: "settings" }');
    expect(layout).toContain('minimizeBehavior="onScrollDown"');
    expect(layout).toContain('<NativeTabs.Trigger name="home">');
    expect(layout).toContain('from "@ankhorage/navigator/tabs/native-icons"');
    expect(layout).toContain(
      '<NativeTabs.Trigger.Icon src={<NativeTabs.Trigger.VectorIcon family={NativeIoniconsFamily}',
    );
    expect(layout).toContain('<NativeTabs.BottomAccessory>');
  });

  test('generates the real JavaScript bottom and top tab navigators', () => {
    for (const [presentation, expected] of [
      ['bottom', 'expo-router/js-tabs'],
      ['top', 'expo-router/js-top-tabs'],
    ] as const) {
      const { layout, plan } = generatedLayout(
        {
          type: 'tabs',
          implementation: 'javascript',
          presentation,
          routes: [{ name: 'home', screenId: 'home' }],
        },
        'web',
      );
      expect(plan.supported).toBe(true);
      expect(layout).toContain(`from "${expected}"`);
      expect(layout).toContain('.Screen name="home"');
    }
  });
});

describe('@ankhorage/navigator responsive tabs generation', () => {
  test('keeps one headless route topology across responsive Surface presentations', () => {
    const { layout, plan } = generatedLayout(
      {
        type: 'tabs',
        implementation: 'custom',
        presentation: 'responsive',
        responsive: { compact: 'bottom', medium: 'rail', expanded: 'sidebar' },
        initialRouteName: 'home',
        routes: [
          { name: 'home', path: '/', label: 'Home', screenId: 'home' },
          {
            name: 'settings',
            path: '/settings',
            showInPrimaryNavigation: false,
            screenId: 'settings',
          },
        ],
      },
      'web',
    );

    expect(plan.root.tabs?.presentations).toEqual({
      compact: 'bottom',
      expanded: 'sidebar',
      medium: 'rail',
    });
    expect(layout).toContain('from "@ankhorage/navigator/tabs"');
    expect(layout).toContain('initialRouteName="home"');
    expect(layout).toContain('"href":"/settings"');
    expect(layout).toContain('"visible":false');
  });
});

describe('@ankhorage/navigator custom tabs registration', () => {
  test('requires a registered binding for explicitly custom presentation code', () => {
    const plan = createNavigatorPlan(
      {
        type: 'tabs',
        implementation: 'custom',
        presentation: 'custom',
        customPresentationId: 'workspace-tabs',
        routes: [{ name: 'home', path: '/', screenId: 'home' }],
      },
      { expoRouterVersion: '57.0.18', platform: 'web' },
    );
    expect(() => generateNavigatorFiles(plan, { guards: {}, screens })).toThrow(
      'Missing registered custom Tabs presentation',
    );
    const layout = generateNavigatorFiles(plan, {
      guards: {},
      screens,
      tabPresentations: {
        'workspace-tabs': { module: '@/navigation/workspace-tabs', exportName: 'WorkspaceTabs' },
      },
    })[0]?.contents;
    expect(layout).toContain('WorkspaceTabs as NavigatorCustomTabsPresentation');
  });
});

describe('@ankhorage/navigator tabs route diagnostics', () => {
  test('rejects unreachable, excessive, guarded and unsupported native routes', () => {
    const diagnostics = validateNavigatorManifest(
      {
        type: 'tabs',
        implementation: 'native',
        routes: [
          {
            name: 'hidden',
            screenId: 'home',
            showInPrimaryNavigation: false,
            guards: ['authenticated'],
            icon: { name: 'home', provider: 'UnknownIcons' },
          },
          ...Array.from({ length: 5 }, (_, index) => ({
            name: `route-${index}`,
            screenId: 'home',
            ...(index === 0 ? { icon: { source: { mediaId: 'home' } } } : {}),
          })),
        ],
      },
      { expoRouterVersion: '57.0.18', platform: 'android' },
    );
    const codes = diagnostics.map((item) => item.code);
    for (const code of [
      'alpha-adapter',
      'native-tabs-hidden-route',
      'native-tabs-route-limit',
      'unsupported-native-tabs-icon-source',
      'unsupported-tabs-guard',
      'unsupported-tabs-icon-provider',
    ]) {
      expect(codes).toContain(code);
    }
  });
});

describe('@ankhorage/navigator tabs SVG source registration', () => {
  test('passes media-backed Web SVG icons through a registered Surface resolver', () => {
    const plan = createNavigatorPlan(
      {
        type: 'tabs',
        implementation: 'custom',
        presentation: 'bottom',
        routes: [
          { name: 'home', path: '/', screenId: 'home', icon: { source: { mediaId: 'home' } } },
        ],
      },
      { expoRouterVersion: '57.0.18', platform: 'web' },
    );
    expect(plan.diagnostics).toEqual([]);
    expect(() => generateNavigatorFiles(plan, { guards: {}, screens })).toThrow(
      'Missing registered Tabs icon-source resolver',
    );
    const layout = generateNavigatorFiles(plan, {
      guards: {},
      screens,
      iconSourceResolver: { module: '@/media/icons', exportName: 'resolveIconSource' },
    })[0]?.contents;
    expect(layout).toContain('resolveIconSource as NavigatorResolveTabsIconSource');
    expect(layout).toContain('resolveIconSource={NavigatorResolveTabsIconSource}');
    expect(layout).toContain('"source":{"mediaId":"home"}');
  });
});

describe('@ankhorage/navigator tabs adapter diagnostics', () => {
  test('version-gates new native features and platform-gates custom tabs', () => {
    const native = validateNavigatorManifest(
      {
        type: 'tabs',
        implementation: 'native',
        minimizeBehavior: 'never',
        routes: [{ name: 'home', screenId: 'home' }],
      },
      { expoRouterVersion: '54.0.0', platform: 'ios' },
    );
    expect(native.map((item) => item.code)).toContain('unsupported-expo-router-version');

    const custom = validateNavigatorManifest(
      {
        type: 'tabs',
        implementation: 'custom',
        presentation: 'bottom',
        routes: [{ name: 'home', path: '/', screenId: 'home' }],
      },
      { expoRouterVersion: '57.0.18', platform: 'ios' },
    );
    expect(custom.map((item) => item.code)).toContain('unsupported-platform');
  });
});
