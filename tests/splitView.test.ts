import type { AppNavigatorManifest } from '@ankhorage/contracts/navigator';
import { describe, expect, test } from 'bun:test';

import {
  createNavigatorPlan,
  generateNavigator,
  validateNavigatorManifest,
} from '../src/navigator';
import { NAVIGATOR_PACKAGE_METADATA } from '../src/utils/NAVIGATOR_PACKAGE_METADATA';
import { NAVIGATOR_ROUTER_POLICY } from '../src/utils/NAVIGATOR_ROUTER_POLICY';
import { generateFiles } from './generateFiles';
import { EXPO_ROUTER_VERSION, expoRouterVersionBefore } from './routerPolicy';

const SPLIT_VIEW_MANIFEST = {
  type: 'split-view',
  columns: {
    primary: { screenId: 'sidebar' },
    supplementary: { screenId: 'list' },
  },
  inspector: { screenId: 'inspector' },
  topColumnForCollapsing: 'secondary',
  routes: [
    { name: 'index', path: '/', screenId: 'home' },
    { name: '[id]', path: '/:id', screenId: 'detail' },
  ],
} as const satisfies AppNavigatorManifest;

const BINDINGS = {
  screens: {
    sidebar: { module: '@/split/sidebar', exportName: 'Sidebar' },
    list: { module: '@/split/list', exportName: 'List' },
    inspector: { module: '@/split/inspector', exportName: 'Inspector' },
    home: { module: '@/screens/home', exportName: 'Home' },
    detail: { module: '@/screens/detail', exportName: 'Detail' },
  },
  guards: {},
} as const;

describe('@ankhorage/navigator Split View planning', () => {
  test('plans the iOS alpha adapter and serialized columns', () => {
    const plan = createNavigatorPlan(SPLIT_VIEW_MANIFEST, {
      platform: 'ios',
      expoRouterVersion: EXPO_ROUTER_VERSION,
    });
    expect(plan.support).toBe('testing-only');
    expect(plan.diagnostics).toEqual([]);
    expect(plan.root.adapter).toMatchObject({
      id: 'split-view',
      module: 'expo-router/unstable-split-view',
      exportName: 'SplitView',
      support: 'testing-only',
      stability: 'alpha',
    });
    expect(plan.root.splitView).toEqual({
      columns: { primary: 'sidebar', supplementary: 'list' },
      inspector: 'inspector',
      topColumnForCollapsing: 'secondary',
    });
  });

  test('reports unsupported non-iOS presentation and the version gate', () => {
    const web = createNavigatorPlan(SPLIT_VIEW_MANIFEST, {
      platform: 'web',
      expoRouterVersion: EXPO_ROUTER_VERSION,
    });
    expect(web.support).toBe('unsupported');
    expect(web.diagnostics.map(({ code }) => code)).toContain('unsupported-platform');
    expect(web.root.adapter.limitations[0]).toContain('split-pane presentation');
    expect(
      NAVIGATOR_PACKAGE_METADATA.catalog.capabilities
        .find(({ id }) => id === 'split-view.two-column')
        ?.targets.find(({ platform }) => platform === 'web')?.support,
    ).toBe('unsupported');

    const old = createNavigatorPlan(SPLIT_VIEW_MANIFEST, {
      platform: 'ios',
      expoRouterVersion: expoRouterVersionBefore(NAVIGATOR_ROUTER_POLICY.splitViewMinimumMajor),
    });
    expect(old.support).toBe('unsupported');
    expect(old.diagnostics.map(({ code }) => code)).toContain('unsupported-expo-router-version');
  });
});

describe('@ankhorage/navigator Split View placement', () => {
  test('allows root or Slot ownership', () => {
    const beneathSlot: AppNavigatorManifest = {
      type: 'slot',
      routes: [{ name: 'workspace', navigator: SPLIT_VIEW_MANIFEST }],
    };
    expect(
      validateNavigatorManifest(beneathSlot, {
        platform: 'ios',
        expoRouterVersion: EXPO_ROUTER_VERSION,
      }).some(({ code }) => code === 'invalid-split-view-placement'),
    ).toBe(false);
  });

  test('rejects direct and transitive native navigator nesting', () => {
    const beneathStack: AppNavigatorManifest = {
      type: 'stack',
      routes: [{ name: 'workspace', navigator: SPLIT_VIEW_MANIFEST }],
    };
    expect(
      validateNavigatorManifest(beneathStack, {
        platform: 'ios',
        expoRouterVersion: EXPO_ROUTER_VERSION,
      }).map(({ code }) => code),
    ).toContain('invalid-split-view-placement');

    const beneathStackAndSlot: AppNavigatorManifest = {
      type: 'stack',
      routes: [
        {
          name: 'shell',
          navigator: {
            type: 'slot',
            routes: [{ name: 'workspace', navigator: SPLIT_VIEW_MANIFEST }],
          },
        },
      ],
    };
    expect(
      validateNavigatorManifest(beneathStackAndSlot, {
        platform: 'ios',
        expoRouterVersion: EXPO_ROUTER_VERSION,
      }).map(({ code }) => code),
    ).toContain('invalid-split-view-placement');
  });
});

describe('@ankhorage/navigator Split View global constraints', () => {
  test('rejects multiple Split Views', () => {
    const multiple: AppNavigatorManifest = {
      type: 'slot',
      routes: [
        { name: 'one', navigator: SPLIT_VIEW_MANIFEST },
        { name: 'two', navigator: SPLIT_VIEW_MANIFEST },
      ],
    };
    expect(
      validateNavigatorManifest(multiple, {
        platform: 'ios',
        expoRouterVersion: EXPO_ROUTER_VERSION,
      }).map(({ code }) => code),
    ).toContain('multiple-split-views');
  });
});

describe('@ankhorage/navigator Split View references', () => {
  test('rejects duplicate refs, unavailable collapse columns, guards and header options', () => {
    const diagnostics = validateNavigatorManifest(
      {
        type: 'split-view',
        columns: { primary: { screenId: 'sidebar' } },
        inspector: { screenId: 'sidebar' },
        topColumnForCollapsing: 'supplementary',
        routes: [
          {
            name: 'home',
            screenId: 'home',
            guards: ['authenticated'],
            stackOptions: { headerShown: false },
          },
        ],
      },
      { platform: 'ios', expoRouterVersion: EXPO_ROUTER_VERSION },
    );
    const codes = diagnostics.map(({ code }) => code);
    expect(codes).toContain('duplicate-split-view-screen-reference');
    expect(codes).toContain('missing-split-view-collapse-column');
    expect(codes).toContain('unsupported-split-view-guard');
    expect(codes).toContain('orphan-stack-options');
  });
});

describe('@ankhorage/navigator Split View generation', () => {
  test('generates three columns, inspector and upstream iPhone collapse state', () => {
    const plan = createNavigatorPlan(SPLIT_VIEW_MANIFEST, {
      platform: 'ios',
      expoRouterVersion: EXPO_ROUTER_VERSION,
    });
    const files = generateFiles(plan, BINDINGS);
    const layout = files.find(({ path }) => path === 'src/app/_layout.tsx')?.contents ?? '';

    expect(layout).toContain("from 'expo-router/unstable-split-view'");
    expect(layout).toContain('<SplitView topColumnForCollapsing="secondary" showInspector>');
    expect(layout.match(/<SplitView\.Column>/gu)).toHaveLength(2);
    expect(layout).toContain('<SplitView.Inspector>');
    expect(layout).not.toContain('Stack');
    expect(files.map(({ path }) => path)).toEqual([
      'src/app/_layout.tsx',
      'src/app/[id].tsx',
      'src/app/index.tsx',
    ]);
  });

  test('fails explicitly when a referenced column screen is unregistered', () => {
    const plan = createNavigatorPlan(SPLIT_VIEW_MANIFEST, {
      platform: 'ios',
      expoRouterVersion: EXPO_ROUTER_VERSION,
    });
    const result = generateNavigator(
      plan,
      {
        screens: { home: BINDINGS.screens.home, detail: BINDINGS.screens.detail },
        guards: {},
      },
      { includeScreenFiles: false },
    );
    expect(result.files).toEqual([]);
    expect(result.diagnostics.map(({ code }) => code)).toContain('missing-split-view-binding');
  });
});

describe('@ankhorage/navigator Split View two-column support', () => {
  test('generates on iOS and reports the non-iOS fallback as unsupported', () => {
    const manifest: AppNavigatorManifest = {
      type: 'split-view',
      columns: { primary: { screenId: 'sidebar' } },
      routes: SPLIT_VIEW_MANIFEST.routes,
    };
    const iosPlan = createNavigatorPlan(manifest, {
      platform: 'ios',
      expoRouterVersion: EXPO_ROUTER_VERSION,
    });
    const files = generateFiles(iosPlan, BINDINGS);
    expect(files.map(({ path }) => path)).toEqual([
      'src/app/_layout.tsx',
      'src/app/[id].tsx',
      'src/app/index.tsx',
    ]);
    const layout = files.find(({ path }) => path === 'src/app/_layout.tsx')?.contents ?? '';

    expect(layout.match(/<SplitView\.Column>/gu)).toHaveLength(1);
    expect(layout).not.toContain('SplitView.Inspector');
    expect(layout).not.toContain('NavigationContainer');

    const web = generateNavigator(
      createNavigatorPlan(manifest, { platform: 'web', expoRouterVersion: EXPO_ROUTER_VERSION }),
      BINDINGS,
    );
    expect(web.support).toBe('unsupported');
    expect(web.files).toEqual([]);
  });
});
