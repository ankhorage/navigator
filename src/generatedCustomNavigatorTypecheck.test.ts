import { join } from 'node:path';

import type { AppNavigatorManifest } from '@ankhorage/contracts/navigator';
import { expect, test } from 'bun:test';
import ts from 'typescript';

import {
  createNavigatorPlan,
  defineCustomNavigatorRegistry,
  generateNavigatorFiles,
} from './index';

const REGISTERED_RAIL = `
import type { NavigatorContentProps, StandardNavigatorEventMapBase } from 'expo-router';
import { TabRouter, unstable_integrateWithRouter } from 'expo-router';
import { createStandardNavigator } from 'standard-navigation';
import { Pressable, Text, View } from 'react-native';

type RailOptions = { title?: string };
type RailProps = { railWidth?: number };

function WorkspaceRailContent({
  actions,
  descriptors,
  railWidth,
  state,
}: NavigatorContentProps<RailOptions, StandardNavigatorEventMapBase, RailProps>) {
  const activeRoute = state.routes[state.index];
  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <View style={{ width: railWidth }}>
        <Pressable onPress={actions.back}><Text>Back</Text></Pressable>
        {state.routes.map((route) => (
          <Pressable key={route.key} onPress={() => actions.navigate(route.name, route.params)}>
            <Text>{descriptors[route.key]?.options.title ?? route.href ?? route.name}</Text>
          </Pressable>
        ))}
      </View>
      <View style={{ flex: 1 }}>{activeRoute === undefined ? null : descriptors[activeRoute.key]?.render()}</View>
    </View>
  );
}

const rail = createStandardNavigator<RailOptions, StandardNavigatorEventMapBase, RailProps>(
  WorkspaceRailContent,
);
export const WorkspaceRail = unstable_integrateWithRouter(rail, TabRouter);
`;

const MANIFEST: AppNavigatorManifest = {
  type: 'custom',
  navigatorId: 'workspace-rail',
  config: { backBehavior: 'history', railWidth: 88 },
  routes: [
    { name: 'index', label: 'Home', screenId: 'home' },
    { name: '[projectId]', label: 'Project', screenId: 'project' },
  ],
};

/*** Compile a registered universal navigator and generated layout against current public APIs. */
function typeErrors(layoutSource: string): readonly ts.Diagnostic[] {
  const layoutFile = join(process.cwd(), 'src/__generated_custom_layout.tsx');
  const railFile = join(process.cwd(), 'src/__registered_workspace_rail.tsx');
  const config = ts.readConfigFile(join(process.cwd(), 'tsconfig.json'), (path) =>
    ts.sys.readFile(path),
  );
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, process.cwd());
  const options: ts.CompilerOptions = {
    ...parsed.options,
    baseUrl: process.cwd(),
    ignoreDeprecations: '6.0',
    noEmit: true,
    paths: { '@example/workspace-rail': ['./src/__registered_workspace_rail.tsx'] },
  };
  const virtualSources = new Map([
    [layoutFile, layoutSource],
    [railFile, REGISTERED_RAIL],
  ]);
  const host = ts.createCompilerHost(options);
  const getSourceFile = host.getSourceFile.bind(host);
  host.fileExists = (path) => virtualSources.has(path) || ts.sys.fileExists(path);
  host.readFile = (path) => virtualSources.get(path) ?? ts.sys.readFile(path);
  host.getSourceFile = (path, languageVersion, onError, shouldCreateNewSourceFile) => {
    const virtualSource = virtualSources.get(path);
    return virtualSource === undefined
      ? getSourceFile(path, languageVersion, onError, shouldCreateNewSourceFile)
      : ts.createSourceFile(path, virtualSource, languageVersion, true, ts.ScriptKind.TSX);
  };
  return ts
    .getPreEmitDiagnostics(ts.createProgram([layoutFile, railFile], options, host))
    .filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
}

test('generated custom navigator layout typechecks for every claimed universal platform', () => {
  const customNavigators = defineCustomNavigatorRegistry([
    {
      id: 'workspace-rail',
      platforms: ['ios', 'web'],
      stability: 'alpha',
      integration: 'expo-router-standard',
      router: 'tab',
      module: '@example/workspace-rail',
      exportName: 'WorkspaceRail',
      validateConfig: () => [],
    },
  ]);

  for (const platform of ['ios', 'web'] as const) {
    const plan = createNavigatorPlan(MANIFEST, {
      customNavigators,
      expoRouterVersion: '57.0.18',
      platform,
    });
    const layout =
      generateNavigatorFiles(plan, {
        guards: {},
        screens: {
          home: { module: '@/screens/home', exportName: 'Home' },
          project: { module: '@/screens/project', exportName: 'Project' },
        },
      }).find(({ path }) => path === 'src/app/_layout.tsx')?.contents ?? '';

    expect(
      typeErrors(layout).map((diagnostic) =>
        ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
      ),
    ).toEqual([]);
  }
});
