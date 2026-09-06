import type { AppNavigatorManifest } from '@ankhorage/contracts/navigator';
import { describe, expect, test } from 'bun:test';

import { createNavigatorPlan, generateNavigatorFiles, validateNavigatorManifest } from './index';
import { NAVIGATOR_PACKAGE_METADATA } from './metadata';

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
      expoRouterVersion: '57.0.18',
    });
    expect(plan.supported).toBe(true);
    expect(plan.diagnostics).toEqual([]);
    expect(plan.root.adapter).toMatchObject({
      id: 'split-view',
      module: 'expo-router/unstable-split-view',
      exportName: 'SplitView',
      support: 'supported',
      stability: 'alpha',
    });
    expect(plan.root.splitView).toEqual({
      columns: { primary: 'sidebar', supplementary: 'list' },
      inspector: 'inspector',
      topColumnForCollapsing: 'secondary',
    });
  });

  test('reports the honest Slot fallback and version gate', () => {
    const web = createNavigatorPlan(SPLIT_VIEW_MANIFEST, {
      platform: 'web',
      expoRouterVersion: '57.0.18',
    });
    expect(web.supported).toBe(true);
    expect(web.diagnostics.map(({ code }) => code)).toContain('split-view-slot-fallback');
    expect(web.root.adapter.limitations[0]).toContain('Slot fallback');
    expect(NAVIGATOR_PACKAGE_METADATA.optionalAdapters.splitView.fallback.web).toBe('slot');

    const old = createNavigatorPlan(SPLIT_VIEW_MANIFEST, {
      platform: 'ios',
      expoRouterVersion: '54.0.0',
    });
    expect(old.supported).toBe(false);
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
        expoRouterVersion: '57.0.18',
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
        expoRouterVersion: '57.0.18',
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
        expoRouterVersion: '57.0.18',
      }).map(({ code }) => code),
    ).toContain('invalid-split-view-placement');
  });
});

describe('@ankhorage/navigator Split View global constraints', () => {
  test('rejects multiple Split Views and implicit flow wrappers', () => {
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
        expoRouterVersion: '57.0.18',
      }).map(({ code }) => code),
    ).toContain('multiple-split-views');

    const withFlow = { ...SPLIT_VIEW_MANIFEST, flows: { authentication: true } };
    expect(
      validateNavigatorManifest(withFlow, {
        platform: 'ios',
        expoRouterVersion: '57.0.18',
      }).map(({ code }) => code),
    ).toContain('unsupported-split-view-flow-wrapper');
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
      { platform: 'ios', expoRouterVersion: '57.0.18' },
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
      expoRouterVersion: '57.0.18',
    });
    const files = generateNavigatorFiles(plan, BINDINGS);
    const layout = files.find(({ path }) => path === 'src/app/_layout.tsx')?.contents ?? '';

    expect(layout).toContain('from "expo-router/unstable-split-view"');
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
      expoRouterVersion: '57.0.18',
    });
    expect(() =>
      generateNavigatorFiles(plan, {
        screens: { home: BINDINGS.screens.home, detail: BINDINGS.screens.detail },
        guards: {},
      }),
    ).toThrow('Missing Split View primary screen binding for "sidebar"');
  });
});

describe('@ankhorage/navigator Split View two-column fallback', () => {
  test('keeps routed files reachable through the same upstream layout on iOS and web', () => {
    const manifest: AppNavigatorManifest = {
      type: 'split-view',
      columns: { primary: { screenId: 'sidebar' } },
      routes: SPLIT_VIEW_MANIFEST.routes,
    };
    const layouts = (['ios', 'web'] as const).map((platform) => {
      const plan = createNavigatorPlan(manifest, {
        platform,
        expoRouterVersion: '57.0.18',
      });
      const files = generateNavigatorFiles(plan, BINDINGS);
      expect(files.map(({ path }) => path)).toEqual([
        'src/app/_layout.tsx',
        'src/app/[id].tsx',
        'src/app/index.tsx',
      ]);
      return files.find(({ path }) => path === 'src/app/_layout.tsx')?.contents ?? '';
    });

    expect(layouts[0]).toBe(layouts[1]);
    expect(layouts[0]?.match(/<SplitView\.Column>/gu)).toHaveLength(1);
    expect(layouts[0]).not.toContain('SplitView.Inspector');
    expect(layouts[0]).not.toContain('NavigationContainer');
  });
});
