import { join } from 'node:path';

import type { AppNavigatorManifest } from '@ankhorage/contracts/navigator';
import { expect, test } from 'bun:test';
import ts from 'typescript';

import { createNavigatorPlan, generateNavigatorFiles } from './index';

const MANIFEST = {
  type: 'stack',
  implementation: 'experimental',
  options: { headerShown: true, headerTransparent: false },
  routes: [
    {
      name: 'home',
      screenId: 'home',
      stackOptions: { title: 'Home', headerBackVisible: false },
    },
  ],
} as const satisfies AppNavigatorManifest;

/*** Compile a generated layout against the installed Expo Router public types. */
function typeErrors(source: string): readonly ts.Diagnostic[] {
  const fileName = join(process.cwd(), 'src/__generated_experimental_stack_layout.tsx');
  const config = ts.readConfigFile(join(process.cwd(), 'tsconfig.json'), (path) =>
    ts.sys.readFile(path),
  );
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, process.cwd());
  const options: ts.CompilerOptions = {
    ...parsed.options,
    baseUrl: process.cwd(),
    ignoreDeprecations: '6.0',
    noEmit: true,
  };
  const host = ts.createCompilerHost(options);
  const getSourceFile = host.getSourceFile.bind(host);
  host.fileExists = (path) => path === fileName || ts.sys.fileExists(path);
  host.readFile = (path) => (path === fileName ? source : ts.sys.readFile(path));
  host.getSourceFile = (path, languageVersion, onError, shouldCreateNewSourceFile) =>
    path === fileName
      ? ts.createSourceFile(path, source, languageVersion, true, ts.ScriptKind.TSX)
      : getSourceFile(path, languageVersion, onError, shouldCreateNewSourceFile);
  return ts
    .getPreEmitDiagnostics(ts.createProgram([fileName], options, host))
    .filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
}

test('generated Experimental Stack layouts typecheck against Expo Router 57', () => {
  for (const platform of ['ios', 'web'] as const) {
    const plan = createNavigatorPlan(MANIFEST, { expoRouterVersion: '57.0.18', platform });
    const source =
      generateNavigatorFiles(plan, {
        guards: {},
        screens: { home: { module: '@/screens/home', exportName: 'Home' } },
      }).find(({ path }) => path === 'src/app/_layout.tsx')?.contents ?? '';
    const diagnostics = typeErrors(source);
    expect(
      diagnostics.map((diagnostic) =>
        ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
      ),
    ).toEqual([]);
  }
});
