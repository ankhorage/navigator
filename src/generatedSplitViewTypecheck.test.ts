import { join } from 'node:path';

import type { AppNavigatorManifest } from '@ankhorage/contracts/navigator';
import { expect, test } from 'bun:test';
import ts from 'typescript';

import { createNavigatorPlan, generateNavigatorFiles } from './index';

const VIRTUAL_COLUMNS = `
export function Primary() { return null; }
export function Supplementary() { return null; }
export function Inspector() { return null; }
`;

/*** Compile a generated layout and virtual registered screens against Expo Router public types. */
function typeErrors(source: string): readonly ts.Diagnostic[] {
  const layoutFile = join(process.cwd(), 'src/__generated_split_view_layout.tsx');
  const columnsFile = join(process.cwd(), 'src/splitViewColumns.tsx');
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
  const virtualSources = new Map([
    [layoutFile, source],
    [columnsFile, VIRTUAL_COLUMNS],
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
    .getPreEmitDiagnostics(ts.createProgram([layoutFile, columnsFile], options, host))
    .filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
}

test('generated Split View layout typechecks against Expo Router 57', () => {
  const manifest: AppNavigatorManifest = {
    type: 'split-view',
    columns: {
      primary: { screenId: 'primary' },
      supplementary: { screenId: 'supplementary' },
    },
    inspector: { screenId: 'inspector' },
    topColumnForCollapsing: 'primary',
    routes: [{ name: 'index', screenId: 'home' }],
  };
  const plan = createNavigatorPlan(manifest, {
    platform: 'ios',
    expoRouterVersion: '57.0.18',
  });
  const source =
    generateNavigatorFiles(plan, {
      guards: {},
      screens: {
        primary: { module: './splitViewColumns', exportName: 'Primary' },
        supplementary: { module: './splitViewColumns', exportName: 'Supplementary' },
        inspector: { module: './splitViewColumns', exportName: 'Inspector' },
        home: { module: '@/screens/home', exportName: 'Home' },
      },
    }).find(({ path }) => path === 'src/app/_layout.tsx')?.contents ?? '';
  const diagnostics = typeErrors(source);
  expect(
    diagnostics.map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')),
  ).toEqual([]);
});
