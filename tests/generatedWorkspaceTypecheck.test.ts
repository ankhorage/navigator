import { join } from 'node:path';

import { expect, test } from 'bun:test';
import ts from 'typescript';

import { generateWorkspaceLayout } from '../src/navigator';

const WORKSPACE_BINDING = `import type { WorkspaceNavigationRoute, WorkspaceNavigatorProps } from '@ankhorage/navigator/workspace';
import type { ReactNode } from 'react';

export const unsupportedMediaIconRoute: WorkspaceNavigationRoute = {
  id: 'media',
  label: 'Media',
  href: '/admin/media',
  // @ts-expect-error Workspace icons are named font icons, not unresolved media references.
  icon: { source: { kind: 'bundled', path: 'assets/icon.svg' } },
};

export function useExampleWorkspace(): WorkspaceNavigatorProps {
  return {
    activeRouteId: 'detail',
    title: 'Example',
    exit: { label: 'Back to app', href: '/products' },
    routes: [
      { id: 'home', label: 'Home', icon: { name: 'home-outline', provider: 'Ionicons' }, href: '/admin' },
      { id: 'items', label: 'Items', href: '/admin/items' },
      { id: 'detail', label: 'Detail', href: '/admin/items/42', parentId: 'items', visible: false },
      { id: 'properties', label: 'Properties', href: null },
    ],
  };
}

export function ExampleAccessGate({ children }: { readonly children: ReactNode }) {
  return <>{children}</>;
}
`;

test('generated workspace layout typechecks with a consumer-owned topology and access gate', () => {
  const layout = generateWorkspaceLayout({
    rootDirectory: 'src/app/admin',
    useWorkspace: { module: '@example/admin', exportName: 'useExampleWorkspace' },
    accessGate: { module: '@example/admin', exportName: 'ExampleAccessGate' },
  });
  const layoutFile = join(process.cwd(), layout.path);
  const bindingFile = join(process.cwd(), 'src/__example_workspace_binding.tsx');
  const config = ts.readConfigFile(join(process.cwd(), 'tsconfig.json'), ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, process.cwd());
  const options: ts.CompilerOptions = {
    ...parsed.options,
    baseUrl: process.cwd(),
    ignoreDeprecations: '6.0',
    noEmit: true,
    paths: {
      '@ankhorage/navigator/workspace': ['./src/workspace.ts'],
      '@example/admin': ['./src/__example_workspace_binding.tsx'],
    },
  };
  const virtualSources = new Map([
    [layoutFile, layout.contents],
    [bindingFile, WORKSPACE_BINDING],
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
  const diagnostics = ts
    .getPreEmitDiagnostics(ts.createProgram([layoutFile, bindingFile], options, host))
    .filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
  expect(
    diagnostics.map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')),
  ).toEqual([]);
});
