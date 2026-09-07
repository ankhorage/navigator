import { describe, expect, test } from 'bun:test';

import { generateNavigatorExamples, getNavigatorExampleCatalog } from '../src/navigator';

const expectedIds = [
  'drawer',
  'drawer-split-view',
  'drawer-stack',
  'drawer-tabs',
  'drawer-tabs-stack',
  'drawer-tabs-top',
  'registered-custom',
  'slot',
  'split-view-three-column',
  'split-view-two-column',
  'stack',
  'stack-drawer',
  'stack-drawer-stack',
  'stack-drawer-tabs',
  'stack-drawer-tabs-stack',
  'stack-tabs',
  'stack-tabs-stack',
  'stack-tabs-top',
  'tabs',
  'tabs-bottom-tabs-top',
  'tabs-split-view',
  'tabs-stack',
] as const;

describe('standalone Navigator examples', () => {
  test('publishes every required composition from one stable catalog', () => {
    const catalog = getNavigatorExampleCatalog();

    expect(catalog.map(({ id }) => id)).toEqual([...expectedIds]);
    expect(
      catalog.every(
        ({ targets }) => targets.map(({ platform }) => platform).join(',') === 'android,ios,web',
      ),
    ).toBe(true);
    expect(catalog.find(({ id }) => id === 'tabs')?.targets).toEqual([
      expect.objectContaining({ platform: 'android', support: 'supported' }),
      expect.objectContaining({ platform: 'ios', support: 'supported' }),
      expect.objectContaining({ platform: 'web', support: 'unsupported' }),
    ]);
    for (const id of ['tabs-split-view', 'drawer-split-view'] as const) {
      expect(catalog.find((example) => example.id === id)?.targets).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            support: 'unsupported',
            diagnostics: expect.arrayContaining([
              expect.objectContaining({ code: 'invalid-split-view-placement' }),
            ]),
          }),
        ]),
      );
    }
  });

  test('generates isolated root applications with public registry dependencies', () => {
    const generated = generateNavigatorExamples();
    const paths = generated.files.map(({ path }) => path);

    expect(generated.examples).toHaveLength(expectedIds.length);
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths).toContain('examples/README.md');
    for (const id of expectedIds) {
      const prefix = `examples/${id}/`;
      const appFiles = generated.files.filter(({ path }) => path.startsWith(prefix));
      expect(appFiles.map(({ path }) => path)).toEqual(
        expect.arrayContaining([
          `${prefix}.gitignore`,
          `${prefix}README.md`,
          `${prefix}app.json`,
          `${prefix}navigator.bindings.json`,
          `${prefix}navigator.example.json`,
          `${prefix}navigator.manifest.json`,
          `${prefix}package.json`,
          `${prefix}src/screens/example-screen.tsx`,
          `${prefix}tsconfig.json`,
        ]),
      );
      expect(paths).not.toContain(`${prefix}expo-env.d.ts`);
      const packageFile = appFiles.find(({ path }) => path === `${prefix}package.json`);
      const manifest = JSON.parse(packageFile?.contents ?? '{}') as {
        dependencies?: Record<string, string>;
        scripts?: Record<string, string>;
      };
      expect(manifest.dependencies?.['@ankhorage/navigator']).toBeDefined();
      for (const range of Object.values(manifest.dependencies ?? {})) {
        expect(range).not.toMatch(/^(?:file|link|workspace):/u);
        expect(range).not.toContain('../');
      }
      const config = appFiles.find(({ path }) => path === `${prefix}tsconfig.json`);
      expect(config?.contents).not.toContain('@ankhorage/navigator');

      const descriptor = getNavigatorExampleCatalog().find((example) => example.id === id);
      const hasRunnableTarget = descriptor?.targets.some(
        ({ support }) => support !== 'unsupported',
      );
      for (const target of descriptor?.targets ?? []) {
        const exposesRunnableScript =
          target.support !== 'unsupported' ||
          (hasRunnableTarget === false && target.platform === 'web');
        expect(manifest.scripts?.[target.platform] !== undefined).toBe(exposesRunnableScript);
        expect(manifest.scripts?.[`export:${target.platform}`] !== undefined).toBe(
          exposesRunnableScript,
        );
      }
    }
  });

  test('uses route groups for nested primary branches so runnable apps own the root URL', () => {
    const paths = generateNavigatorExamples().files.map(({ path }) => path);

    for (const id of ['drawer-tabs', 'drawer-tabs-stack', 'drawer-tabs-top'] as const) {
      expect(paths).toContain(`examples/${id}/src/app/(workspace)/_layout.tsx`);
      expect(paths).not.toContain(`examples/${id}/src/app/workspace/_layout.tsx`);
    }
  });

  test('keeps observable behavior and unsupported evidence explicit', () => {
    const generated = generateNavigatorExamples();
    const screen = generated.files.find(
      ({ path }) => path === 'examples/stack/src/screens/example-screen.tsx',
    )?.contents;
    const unsupported = generated.files.find(
      ({ path }) => path === 'examples/tabs-split-view/src/screens/unsupported-example-screen.tsx',
    )?.contents;

    expect(screen).toContain('Current route: {pathname}');
    expect(screen).toContain('Increment counter');
    expect(screen).toContain('Scroll evidence');
    expect(screen).toContain('Complete example');
    expect(unsupported).toContain('not a navigation fallback');
  });
});
