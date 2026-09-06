import { join } from 'node:path';

import type { AppNavigatorManifest } from '@ankhorage/contracts/navigator';
import { expect, test } from 'bun:test';
import ts from 'typescript';

import { createNavigatorPlan, generateNavigatorFiles } from './index';

const screens = { home: { module: '@/screens/home', exportName: 'Home' } } as const;

function createLayout(manifest: AppNavigatorManifest, platform: 'ios' | 'web'): string {
  const plan = createNavigatorPlan(manifest, { expoRouterVersion: '57.0.18', platform });
  return (
    generateNavigatorFiles(plan, { guards: {}, screens }).find(
      (file) => file.path === 'src/app/_layout.tsx',
    )?.contents ?? ''
  );
}

function typeErrors(source: string): readonly ts.Diagnostic[] {
  const fileName = join(process.cwd(), 'src/__generated_tabs_layout.tsx');
  const config = ts.readConfigFile(join(process.cwd(), 'tsconfig.json'), (path) =>
    ts.sys.readFile(path),
  );
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, process.cwd());
  const options: ts.CompilerOptions = {
    ...parsed.options,
    baseUrl: process.cwd(),
    ignoreDeprecations: '6.0',
    noEmit: true,
    paths: {
      '@ankhorage/navigator/tabs': ['./src/tabs/index.ts'],
      '@ankhorage/navigator/tabs/native-icons': ['./src/tabs/nativeIconFamilies.ts'],
    },
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

/*** Generate bottom and top JavaScript Tabs layouts with directly addressable hidden routes. */
function createJavaScriptLayouts(): readonly string[] {
  return (['bottom', 'top'] as const).map((presentation) =>
    createLayout(
      {
        type: 'tabs',
        implementation: 'javascript',
        presentation,
        routes: [
          { name: 'home', screenId: 'home' },
          { name: 'hidden', screenId: 'home', showInPrimaryNavigation: false },
        ],
      },
      'web',
    ),
  );
}

test('generated Tabs layouts typecheck against the supported Expo and Surface runtime', () => {
  const native = createLayout(
    {
      type: 'tabs',
      implementation: 'native',
      routes: [{ name: 'home', icon: { name: 'home' }, screenId: 'home' }],
    },
    'ios',
  );
  const custom = createLayout(
    {
      type: 'tabs',
      implementation: 'custom',
      presentation: 'responsive',
      responsive: { compact: 'bottom', expanded: 'sidebar' },
      routes: [{ name: 'home', path: '/', screenId: 'home' }],
    },
    'web',
  );

  for (const source of [native, custom, ...createJavaScriptLayouts()]) {
    const diagnostics = typeErrors(source);
    expect(
      diagnostics.map((diagnostic) =>
        ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
      ),
    ).toEqual([]);
  }
});
