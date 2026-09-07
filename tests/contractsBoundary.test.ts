import type {
  CreateNavigatorPlanOptions,
  NavigatorGeneratedFile,
  NavigatorGenerationBindings,
  NavigatorPlan,
} from '@ankhorage/contracts/navigator';
import { expect, test } from 'bun:test';
import type { ComponentProps } from 'react';

import type { CustomTabsLayout } from '../src/features/tabs/tabs';
import { createNavigatorPlan, generateNavigatorFiles } from '../src/navigator';

test('exchanges plans and generated module bindings through the Contracts API', () => {
  const options: CreateNavigatorPlanOptions = { platform: 'web', expoRouterVersion: '57.0.18' };
  const bindings: NavigatorGenerationBindings = {
    screens: { home: { module: '@/Home', exportName: 'Home' } },
    guards: {},
  };
  const plan: NavigatorPlan = createNavigatorPlan(
    { type: 'slot', routes: [{ name: 'index', screenId: 'home' }] },
    options,
  );
  const files: readonly NavigatorGeneratedFile[] = generateNavigatorFiles(plan, bindings);
  expect(files.map((file) => file.path)).toEqual(['src/app/_layout.tsx', 'src/app/index.tsx']);
});

test('derives adapter props from its public component without exporting private type names', () => {
  const props: ComponentProps<typeof CustomTabsLayout> = {
    routes: [{ name: 'home', href: '/', label: 'Home', visible: true }],
    presentations: { compact: 'bottom', medium: 'rail', expanded: 'sidebar' },
  };
  expect(props.routes[0]?.name).toBe('home');
});
