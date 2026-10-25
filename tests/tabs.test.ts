import type { AppNavigatorManifest } from '@ankhorage/contracts/navigator';
import { describe, expect, test } from 'bun:test';
import expoRouterPackage from 'expo-router/package.json' with { type: 'json' };
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import ts from 'typescript';

import {
  createNavigatorPlan,
  generateNavigator,
  validateNavigatorManifest,
} from '../src/navigator';
import { NAVIGATOR_ROUTER_POLICY } from '../src/constants/navigator';
import { expoRouterVersionBefore } from './routerPolicy';

const screens = {
  accessory: { module: '@/screens/accessory', exportName: 'Accessory' },
  home: { module: '@/screens/home', exportName: 'Home' },
  settings: { module: '@/screens/settings', exportName: 'Settings' },
} as const;

const EXPO_ROUTER_VERSION = expoRouterPackage.version;

async function formatGeneratedLayout(layout: string) {
  const formatter = Bun.spawn(
    [
      resolve(process.cwd(), 'node_modules/.bin/ankhorage-prettier'),
      '--stdin-filepath',
      'src/app/_layout.tsx',
    ],
    {
      stderr: 'pipe',
      stdin: new Blob([layout]),
      stdout: 'pipe',
    },
  );
  const [exitCode, formatted, error] = await Promise.all([
    formatter.exited,
    new Response(formatter.stdout).text(),
    new Response(formatter.stderr).text(),
  ]);
  if (exitCode !== 0) throw new Error(error);
  return formatted;
}

function generatedLayout(manifest: AppNavigatorManifest, platform: 'android' | 'ios' | 'web') {
  const plan = createNavigatorPlan(manifest, { expoRouterVersion: EXPO_ROUTER_VERSION, platform });
  const files = generateNavigator(plan, { guards: {}, screens }).files;
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
  test('generates formatter-stable Native Tabs triggers, icons, initial route and bottom accessory', async () => {
    const { layout, plan } = generatedLayout(
      {
        type: 'tabs',
        implementation: 'native',
        initialRouteName: 'settings',
        minimizeBehavior: 'onScrollDown',
        bottomAccessory: { screenId: 'accessory' },
        routes: [
          { name: 'home', label: 'Home', icon: { name: 'home' }, screenId: 'home' },
          {
            name: 'settings',
            label: 'Settings',
            icon: { name: 'information-circle-outline' },
            screenId: 'settings',
          },
        ],
      },
      'ios',
    );

    expect(plan.support).toBe('supported');
    expect(plan.diagnostics.map((item) => item.code)).toEqual(['alpha-adapter']);
    expect(layout).toContain("from 'expo-router/unstable-native-tabs'");
    expect(layout).toContain("unstable_settings = { initialRouteName: 'settings' }");
    expect(layout).toContain('minimizeBehavior="onScrollDown"');
    expect(layout).toContain('<NativeTabs.Trigger name="home">');
    expect(layout).toContain("from '@ankhorage/navigator/tabs/native-icons'");
    expect(layout).toContain(
      'src={<NativeTabs.Trigger.VectorIcon family={NativeIoniconsFamily} name="home" />}',
    );
    expect(layout).toContain(
      '<NativeTabs.Trigger.VectorIcon\n              family={NativeIoniconsFamily}\n              name="information-circle-outline"',
    );
    expect(await formatGeneratedLayout(layout)).toBe(layout);
    expect(layout.indexOf("from '@ankhorage/navigator/tabs/native-icons'")).toBeLessThan(
      layout.indexOf("from 'expo-router/unstable-native-tabs'"),
    );
    expect(layout).toContain('<NativeTabs.BottomAccessory>');
  });
});

describe('@ankhorage/navigator JavaScript tabs generation', () => {
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
          routes: [
            { name: 'home', screenId: 'home' },
            {
              name: 'settings',
              screenId: 'settings',
              showInPrimaryNavigation: false,
            },
          ],
        },
        'web',
      );
      expect(plan.support).toBe('supported');
      expect(layout).toContain(`from '${expected}'`);
      expect(layout).toContain('.Screen name="home"');
      expect(layout).toContain(
        presentation === 'top' ? "tabBarItemStyle: { display: 'none' }" : 'href: null',
      );
      expect(plan.dependencies.map(({ packageName }) => packageName)).toEqual(
        presentation === 'top'
          ? ['expo-router', 'react-native-pager-view', 'react-native-tab-view']
          : ['expo-router'],
      );
    }
  });
});

describe('@ankhorage/navigator responsive tabs generation', () => {
  test('keeps one headless route topology across responsive Surface presentations', () => {
    const { layout, plan } = generatedLayout(
      {
        type: 'tabs',
        implementation: 'headless',
        presentation: 'responsive',
        responsive: { compact: 'bottom', medium: 'rail', expanded: 'sidebar' },
        initialRouteName: 'settings',
        routes: [
          { name: 'home', path: '/', label: 'Home', screenId: 'home' },
          {
            name: 'settings',
            path: '/settings',
            expoRouterPath: '(account)/settings/index',
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
    expect(layout).toContain("from '@ankhorage/navigator/tabs'");
    expect(layout).toContain("import { ResponsiveProvider } from '@ankhorage/surface';");
    expect(layout).toContain('initialRouteName="(account)/settings/index"');
    expect(layout).toContain('return (\n    <ResponsiveProvider>');
    expect(layout).toContain('<HeadlessTabsLayout');
    expect(layout).toContain("name: '(account)/settings/index'");
    expect(layout).toContain("href: '/settings'");
    expect(layout).toContain('visible: false');
  });

  test('emits consumer-lintable and formatter-stable simple and nested layouts with and without icons', async () => {
    const simple = generatedHeadlessLayout({
      type: 'tabs',
      implementation: 'headless',
      presentation: 'bottom',
      routes: [{ name: 'home', path: '/', screenId: 'home' }],
    });
    const simpleWithIcon = generatedHeadlessLayout(
      {
        type: 'tabs',
        implementation: 'headless',
        presentation: 'responsive',
        responsive: { compact: 'bottom', medium: 'rail', expanded: 'sidebar' },
        initialRouteName: 'settings',
        routes: [
          { name: 'home', path: '/', screenId: 'home', icon: { source: { mediaId: 'home' } } },
          {
            name: 'settings',
            path: '/settings',
            screenId: 'settings',
            icon: { source: { mediaId: 'settings' } },
          },
        ],
      },
      true,
    );
    const nested = generatedHeadlessLayout({
      type: 'stack',
      implementation: 'native',
      routes: [
        {
          name: 'workspace',
          navigator: {
            type: 'tabs',
            implementation: 'headless',
            presentation: 'bottom',
            routes: [{ name: 'home', path: '/', screenId: 'home' }],
          },
        },
      ],
    });
    const nestedWithIcon = generatedHeadlessLayout(
      {
        type: 'stack',
        implementation: 'native',
        routes: [
          {
            name: 'workspace',
            navigator: {
              type: 'tabs',
              implementation: 'headless',
              presentation: 'responsive',
              responsive: { compact: 'bottom', medium: 'rail', expanded: 'sidebar' },
              routes: [
                {
                  name: 'home',
                  path: '/',
                  screenId: 'home',
                  icon: { source: { mediaId: 'home' } },
                },
              ],
            },
          },
        ],
      },
      true,
    );

    for (const [id, layout] of [
      ['simple', simple],
      ['simple-with-icon', simpleWithIcon],
      ['nested', nested],
      ['nested-with-icon', nestedWithIcon],
    ] as const) {
      await expectConsumerChecksPass(id, layout);
    }
  }, 30_000);
});

/*** Generate the Headless Tabs layout from either a root or a nested navigator plan. */
function generatedHeadlessLayout(
  manifest: AppNavigatorManifest,
  includeIconResolver = false,
): string {
  const plan = createNavigatorPlan(manifest, {
    expoRouterVersion: EXPO_ROUTER_VERSION,
    platform: 'web',
  });
  const files = generateNavigator(plan, {
    guards: {},
    screens,
    ...(includeIconResolver
      ? { iconSourceResolver: { module: '@/generated-icons', exportName: 'resolveIconSource' } }
      : {}),
  }).files;
  const layout = files.find(({ contents }) => contents.includes('<HeadlessTabsLayout'))?.contents;
  if (layout === undefined) throw new Error('Expected generated Headless Tabs layout.');
  return layout;
}

/*** Run the generated source through the formatter and ESLint commands that consumer apps execute. */
async function expectConsumerChecksPass(id: string, layout: string): Promise<void> {
  const fixture = resolve(process.cwd(), 'src', '__generated-tabs-consumer', id);
  const layoutPath = resolve(fixture, '_layout.tsx');
  const iconPath = resolve(process.cwd(), 'src', 'generated-icons.ts');
  const tsconfigPath = resolve(process.cwd(), 'tsconfig.json');
  const tsconfig = await readFile(tsconfigPath, 'utf8');
  const parsedTsconfig = JSON.parse(tsconfig) as { compilerOptions: Record<string, unknown> };
  await mkdir(fixture, { recursive: true });
  await writeFile(layoutPath, layout);
  await writeFile(
    iconPath,
    "import type { MediaAssetReference } from '@ankhorage/contracts/media';\n\nexport function resolveIconSource(source: MediaAssetReference): string {\n  return source.mediaId;\n}\n",
  );
  await writeFile(
    tsconfigPath,
    `${JSON.stringify({
      ...parsedTsconfig,
      compilerOptions: {
        ...parsedTsconfig.compilerOptions,
        baseUrl: '.',
        paths: { '@/*': ['./src/*'] },
      },
    })}\n`,
  );
  try {
    for (const command of [
      [resolve(process.cwd(), 'node_modules/.bin/ankhorage-prettier'), '--check', layoutPath],
      [
        resolve(process.cwd(), 'node_modules/.bin/ankhorage-eslint'),
        layoutPath,
        '--max-warnings=0',
      ],
    ]) {
      const result = Bun.spawn(command, { cwd: process.cwd(), stderr: 'pipe', stdout: 'pipe' });
      const [exitCode, stdout, stderr] = await Promise.all([
        result.exited,
        new Response(result.stdout).text(),
        new Response(result.stderr).text(),
      ]);
      expect(exitCode, `${command.join(' ')}\n${stdout}${stderr}`).toBe(0);
    }
  } finally {
    await rm(resolve(process.cwd(), 'src', '__generated-tabs-consumer'), {
      force: true,
      recursive: true,
    });
    await rm(iconPath, { force: true });
    await writeFile(tsconfigPath, tsconfig);
  }
}

describe('@ankhorage/navigator custom tabs registration', () => {
  test('requires a registered binding for explicitly custom presentation code', () => {
    const plan = createNavigatorPlan(
      {
        type: 'tabs',
        implementation: 'headless',
        presentation: 'custom',
        customPresentationId: 'workspace-tabs',
        routes: [{ name: 'home', path: '/', screenId: 'home' }],
      },
      { expoRouterVersion: EXPO_ROUTER_VERSION, platform: 'web' },
    );
    const missing = generateNavigator(plan, { guards: {}, screens });
    expect(missing.files).toEqual([]);
    expect(missing.diagnostics.map(({ code }) => code)).toContain(
      'missing-tab-presentation-binding',
    );
    const layout = generateNavigator(plan, {
      guards: {},
      screens,
      tabPresentations: {
        'workspace-tabs': { module: '@/navigation/workspace-tabs', exportName: 'WorkspaceTabs' },
      },
    }).files[0]?.contents;
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
      { expoRouterVersion: EXPO_ROUTER_VERSION, platform: 'android' },
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
  test('passes media-backed SVG icons through a registered Surface resolver on native', () => {
    const plan = createNavigatorPlan(
      {
        type: 'tabs',
        implementation: 'headless',
        presentation: 'bottom',
        routes: [
          { name: 'home', path: '/', screenId: 'home', icon: { source: { mediaId: 'home' } } },
        ],
      },
      { expoRouterVersion: EXPO_ROUTER_VERSION, platform: 'ios' },
    );
    expect(plan.diagnostics).toEqual([]);
    const missing = generateNavigator(plan, { guards: {}, screens });
    expect(missing.files).toEqual([]);
    expect(missing.diagnostics.map(({ code }) => code)).toContain(
      'missing-icon-source-resolver-binding',
    );
    const layout = generateNavigator(plan, {
      guards: {},
      screens,
      iconSourceResolver: { module: '@/media/icons', exportName: 'resolveIconSource' },
    }).files[0]?.contents;
    expect(layout).toContain('resolveIconSource as NavigatorResolveTabsIconSource');
    expect(layout).toContain('resolveIconSource={NavigatorResolveTabsIconSource}');
    expect(layout).toContain("source: { mediaId: 'home' }");
  });
});

describe('@ankhorage/navigator tabs adapter diagnostics', () => {
  test('version-gates native features while Headless Tabs work on every supported platform', () => {
    const native = validateNavigatorManifest(
      {
        type: 'tabs',
        implementation: 'native',
        minimizeBehavior: 'never',
        routes: [{ name: 'home', screenId: 'home' }],
      },
      {
        expoRouterVersion: expoRouterVersionBefore(
          NAVIGATOR_ROUTER_POLICY.nativeTabsAccessoryMinimumMajor,
        ),
        platform: 'ios',
      },
    );
    expect(native.map((item) => item.code)).toContain('unsupported-expo-router-version');

    for (const platform of ['android', 'ios', 'web'] as const) {
      const headless = validateNavigatorManifest(
        {
          type: 'tabs',
          implementation: 'headless',
          presentation: 'bottom',
          routes: [{ name: 'home', path: '/', screenId: 'home' }],
        },
        { expoRouterVersion: EXPO_ROUTER_VERSION, platform },
      );
      expect(headless).toEqual([]);
    }
  });
});
import { resolve } from 'node:path';
