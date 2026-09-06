import type { AppNavigatorManifest } from '@ankhorage/contracts/navigator';
import { expect, test } from 'bun:test';

import { createNavigatorPlan } from '../expo-router/createNavigatorPlan';
import { generateNavigatorFiles } from '../generation/generateNavigatorFiles';
import {
  type CustomNavigatorRegistration,
  type CustomNavigatorRegistry,
  defineCustomNavigatorRegistry,
} from './CustomNavigatorRegistry';

const WORKSPACE_RAIL: CustomNavigatorRegistration = {
  id: 'workspace-rail',
  platforms: ['ios', 'web'],
  stability: 'alpha',
  integration: 'expo-router-standard',
  router: 'tab',
  module: '@example/workspace-rail',
  exportName: 'WorkspaceRail',
  validateConfig(config) {
    const issues = [];
    const railWidth = config?.railWidth;
    if (typeof railWidth !== 'number' || railWidth < 48 || railWidth > 160) {
      issues.push({
        code: 'invalid-rail-width',
        path: '/railWidth',
        message: 'railWidth must be 48–160.',
      });
    }
    if (config?.backBehavior !== 'history') {
      issues.push({
        code: 'invalid-back-behavior',
        path: '/backBehavior',
        message: 'This fixture requires router-owned history behavior.',
      });
    }
    return issues;
  },
};

const MANIFEST: AppNavigatorManifest = {
  type: 'custom',
  navigatorId: 'workspace-rail',
  config: { backBehavior: 'history', railWidth: 88 },
  routes: [
    { name: 'index', label: 'Home', screenId: 'home' },
    {
      name: 'projects',
      label: 'Projects',
      navigator: { type: 'slot', routes: [{ name: '[id]', screenId: 'project' }] },
    },
  ],
};

test('creates a deterministic immutable registry and rejects unsafe registrations', () => {
  // @ts-expect-error Registries must be created by the validating composition factory.
  const unverifiedRegistry: CustomNavigatorRegistry = {};
  const registry = defineCustomNavigatorRegistry([WORKSPACE_RAIL]);

  expect(Object.keys(unverifiedRegistry)).toEqual([]);
  expect(Object.isFrozen(registry)).toBe(true);
  expect(Object.isFrozen(registry['workspace-rail'])).toBe(true);
  expect(Object.isFrozen(registry['workspace-rail']?.platforms)).toBe(true);
  const constructorRegistry = defineCustomNavigatorRegistry([
    { ...WORKSPACE_RAIL, id: 'constructor' },
  ]);
  expect(Reflect.get(constructorRegistry, 'constructor')).toMatchObject({ id: 'constructor' });
  expect(() => defineCustomNavigatorRegistry([WORKSPACE_RAIL, WORKSPACE_RAIL])).toThrow(
    'Duplicate custom navigator registration id',
  );
  expect(() =>
    defineCustomNavigatorRegistry([
      { ...WORKSPACE_RAIL, module: "safe'; globalThis.compromised = true; //" },
    ]),
  ).toThrow('unsafe module specifier');
});

test('diagnoses registration, version, platform, schema, and malformed JSON before generation', () => {
  const registry = defineCustomNavigatorRegistry([WORKSPACE_RAIL]);
  const cases: readonly [AppNavigatorManifest, 'android' | 'ios' | 'web', string, string][] = [
    [{ ...MANIFEST, navigatorId: 'missing' }, 'web', '57.0.18', 'unregistered-custom-navigator'],
    [MANIFEST, 'android', '57.0.18', 'unsupported-custom-navigator-platform'],
    [MANIFEST, 'web', '55.0.0', 'unsupported-expo-router-version'],
    [{ ...MANIFEST, config: { railWidth: 12 } }, 'web', '57.0.18', 'invalid-rail-width'],
    [
      { ...MANIFEST, config: { railWidth: Number.NaN } },
      'web',
      '57.0.18',
      'invalid-custom-navigator-config',
    ],
    [
      { ...MANIFEST, config: { callback: (() => undefined) as never } },
      'web',
      '57.0.18',
      'invalid-custom-navigator-config',
    ],
  ];

  for (const [manifest, platform, expoRouterVersion, expectedCode] of cases) {
    const plan = createNavigatorPlan(manifest, {
      customNavigators: registry,
      expoRouterVersion,
      platform,
    });
    expect(plan.diagnostics.map(({ code }) => code)).toContain(expectedCode);
    expect(plan.supported).toBe(false);
    expect(() =>
      generateNavigatorFiles(plan, {
        guards: {},
        screens: { home: { module: './home', exportName: 'Home' } },
      }),
    ).toThrow('unsupported navigator plan');
  }
});

test('generates only the registered static import and portable configuration', () => {
  const plan = createNavigatorPlan(MANIFEST, {
    customNavigators: defineCustomNavigatorRegistry([WORKSPACE_RAIL]),
    expoRouterVersion: '57.0.18',
    platform: 'web',
  });
  const files = generateNavigatorFiles(plan, {
    guards: {},
    screens: {
      home: { module: '@/screens/home', exportName: 'Home' },
      project: { module: '@/screens/project', exportName: 'Project' },
    },
  });
  const layout = files.find(({ path }) => path === 'src/app/_layout.tsx')?.contents ?? '';

  expect(plan.diagnostics).toEqual([]);
  expect(plan.root.adapter).toMatchObject({
    module: '@example/workspace-rail',
    exportName: 'WorkspaceRail',
    support: 'supported',
  });
  expect(layout).toContain('import { WorkspaceRail } from "@example/workspace-rail";');
  expect(layout).toContain('<WorkspaceRail {...{"backBehavior":"history","railWidth":88}}>');
  expect(layout).toContain(
    '<WorkspaceRail.Screen name="projects" options={{"title":"Projects"}} />',
  );
  expect(files.map(({ path }) => path)).toContain('src/app/projects/[id].tsx');
  expect(layout).not.toContain('navigatorId');
});
