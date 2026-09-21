import { expect, test } from 'bun:test';

import { generateWorkspaceLayout } from './generateWorkspaceLayout';

test('generates a Navigator-owned workspace layout from consumer runtime and access bindings', () => {
  const generated = generateWorkspaceLayout({
    rootDirectory: 'src/app/admin',
    useWorkspace: { module: '@example/admin', exportName: 'useAdminWorkspace' },
    accessGate: { module: '@example/admin', exportName: 'AdminAccessGate' },
  });

  expect(generated.path).toBe('src/app/admin/_layout.tsx');
  expect(generated.contents).toContain(
    "import { WorkspaceNavigator } from '@ankhorage/navigator/workspace';",
  );
  expect(generated.contents).toContain('const workspace = useWorkspaceBinding();');
  expect(generated.contents).toContain(
    '<WorkspaceAccessGate><WorkspaceContent /></WorkspaceAccessGate>',
  );
  expect(generated.contents).not.toContain('AppManifest');
});

test('generates an unguarded workspace when the consumer owns no separate access gate', () => {
  const generated = generateWorkspaceLayout({
    rootDirectory: 'src/app/(workspace)',
    useWorkspace: { module: '@example/workspace', exportName: 'useWorkspace' },
  });
  expect(generated.contents).toContain('return <WorkspaceContent />;');
  expect(generated.contents).not.toContain('WorkspaceAccessGate');
});

test('rejects unsafe generation directories and import bindings', () => {
  expect(() =>
    generateWorkspaceLayout({
      rootDirectory: 'src/app/../outside',
      useWorkspace: { module: '@example/admin', exportName: 'useAdminWorkspace' },
    }),
  ).toThrow('safe descendant');
  expect(() =>
    generateWorkspaceLayout({
      rootDirectory: 'src/app/admin',
      useWorkspace: { module: '@example/admin', exportName: 'useAdminWorkspace;evil' },
    }),
  ).toThrow();
});
